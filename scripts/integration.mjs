import assert from 'node:assert/strict';
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {root,pages,route,server,prepare,ready} from './common.mjs';
async function expectAttribute(locator,key,value){for(let i=0;i<100;i++){if(await locator.getAttribute(key)===value)return;await new Promise(r=>setTimeout(r,50));}assert.equal(await locator.getAttribute(key),value);}
const srv=await server(),browser=await chromium.launch();let links=0,assets=0;
try{
 for(const file of pages){
  const name=file.replace('.dc.html','');const response=await fetch(srv.url+route(name));assert.equal(response.status,200);
  const html=await response.text();
  for(const match of html.matchAll(/(?:href|src)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)){
   const resource=await fetch(srv.url+match[1]);assert.equal(resource.status,200,`${name}: ${match[1]}`);links++;
  }
 }
 for(const file of await readdir(root+'/wbsite/assets')){
  const [before,after]=await Promise.all([readFile(root+'/wbsite/assets/'+file),readFile(root+'/site/assets/'+file)]);
  assert.equal(createHash('sha256').update(before).digest('hex'),createHash('sha256').update(after).digest('hex'));assets++;
 }
 assert.equal((await fetch(srv.url+'/missing-page')).status,404);
 const page=await browser.newPage({viewport:{width:375,height:900}});await prepare(page);await ready(page,srv.url+'/warranty');
 await page.waitForFunction(()=>[...document.querySelectorAll('button.more')].every(b=>Object.keys(b).some(k=>k.startsWith('__reactProps$')&&typeof b[k].onClick==='function')));
 const button=page.locator('button.more').first();assert.equal(await button.getAttribute('aria-expanded'),'false');await button.click();await expectAttribute(button,'aria-expanded','true');await button.click();await expectAttribute(button,'aria-expanded','false');
 await ready(page,srv.url+'/');
 const stage=page.getByRole('button',{name:'2 Bonding',exact:false});await stage.scrollIntoViewIfNeeded();await page.waitForTimeout(500);await stage.click();await expectAttribute(stage,'aria-pressed','true');
 const menu=page.locator('.wbh-m > summary');await menu.click();assert.equal(await page.locator('.wbh-m').getAttribute('open'),'');
 await page.locator('.wbh-mp a[href="/find-a-dealer"]').first().click();assert.equal(new URL(page.url()).pathname,'/find-a-dealer');
 await writeFile(root+'/reports/INTEGRATION.md',`# Integration checks\n\n40 clean routes return 200; ${links} local references return 200; ${assets} assets retain baseline SHA-256; unknown route returns 404.\n\nAt 375 pixels: Warranty expand/collapse, Main bonding-stage selection, mobile menu and navigation to FindADealer pass. Exported form attributes and fields are compared by the full parity suite. No submissions sent.\n`);
 console.log({pages:pages.length,links,assets,interactions:'pass'});
}finally{await browser.close();await srv.close();}
