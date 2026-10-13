import assert from 'node:assert/strict';
import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
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
 const text=async path=>{const r=await fetch(srv.url+path);assert.equal(r.status,200,path);return r.text();};
 const sitemap=await text('/sitemap.xml');assert.equal((sitemap.match(/<loc>https:\/\/wetbond\.com\/<\/loc>/g)||[]).length,1);assert(!sitemap.includes('wetbond.com/main<'));assert.equal((sitemap.match(/<loc>/g)||[]).length,40);
 const legacy=await fetch(srv.url+'/main',{redirect:'manual'});assert.equal(legacy.status,301);assert.equal(legacy.headers.get('location'),'/');
 assert((await text('/')).includes('data-page="Main"'));
 const vercel=JSON.parse(await text('/vercel.json'));assert.deepEqual(vercel.redirects,[{source:'/main',destination:'/',permanent:true}]);
 const routes=JSON.parse(await text('/routes.json'));assert.equal(routes.find(r=>r.name==='Main').route,'/');assert.deepEqual(routes.find(r=>r.name==='Main').redirectFrom,['/main']);
 for(const icon of ['/favicon.svg','/favicon.ico'])await text(icon);
 const page=await browser.newPage({viewport:{width:375,height:900},isMobile:true,hasTouch:true});await prepare(page);await ready(page,srv.url+'/warranty');
 await page.waitForFunction(()=>[...document.querySelectorAll('button.more')].every(b=>Object.keys(b).some(k=>k.startsWith('__reactProps$')&&typeof b[k].onClick==='function')));
 const button=page.locator('button.more').first();assert.equal(await button.getAttribute('aria-expanded'),'false');await button.click();await expectAttribute(button,'aria-expanded','true');await button.click();await expectAttribute(button,'aria-expanded','false');
 await ready(page,srv.url+'/');
 const stage=page.getByRole('button',{name:'2 Bonding',exact:false});await stage.scrollIntoViewIfNeeded();await page.waitForTimeout(500);await stage.click();await expectAttribute(stage,'aria-pressed','true');
 const menu=page.locator('.wbh-m > summary');await menu.click();assert.equal(await page.locator('.wbh-m').getAttribute('open'),'');
 await page.locator('.wbh-mp a[href="/find-a-dealer"]').first().click();assert.equal(new URL(page.url()).pathname,'/find-a-dealer');
 // DealerApply (WB-2 B4/B5): smallest company and 0 jobs never block; only the purchase answer and timing route.
 const routing=[];
 for(const [answer,expected] of [['Yes','fit'],['Yes, but I’d want to talk through payment options','fit'],['I’d rather start smaller','start smaller'],['Not right now','not now']]){
  await ready(page,srv.url+'/dealer-apply');
  const pick=async label=>{await page.locator('.qcard button.opt',{hasText:label}).first().click();};
  const next=async()=>{await page.getByRole('button',{name:'Continue'}).click();};
  await pick('Basement waterproofing');await next();
  await page.locator('.qcard .opts').nth(0).locator('button.opt').first().click();await page.locator('.qcard .opts').nth(1).locator('button.opt').first().click();await next();
  await page.locator('.qcard button.msel').first().click();await next();
  await pick('Just me');await page.locator('.qcard .opts').nth(1).locator('button.opt').first().click();
  assert.equal(await page.locator('.qcard .opts').nth(1).locator('button.opt').first().innerText(),'0');await next();
  assert.equal(await page.locator('.qcard h1').innerText(),'Timing.');
  await pick('Within 30 days');await page.locator('.qcard .opts').nth(1).getByRole('button',{name:answer,exact:true}).click();await next();
  await page.getByRole('button',{name:'See my result'}).click();
  const heading=await page.locator('.qcard.res h1').innerText(),line=await page.locator('.qcard.res p.sub').first().innerText();
  const outcome=heading.startsWith("You're a fit")?'fit':line.startsWith('The opening order is the main commitment')?'not now':'start smaller';
  assert.equal(outcome,expected,answer);routing.push(answer+' → '+outcome);
 }
 const html=await (await fetch(srv.url+'/dealer-apply')).text();for(const gone of ['27,405','annual revenue','no training fee','Timing and investment'])assert(!html.includes(gone),gone);
 let socials=0;for(const file of pages){const h=await (await fetch(srv.url+route(file.replace('.dc.html','')))).text();socials+=(h.split('<template data-static-template>')[0].match(/<a [^>]*href="#"[^>]*data-social=/g)||[]).length;}
 assert.equal(socials,0,'Footer social placeholders must be absent');
 console.log({dealerApply:routing,socialHashLinksInStaticHtml:socials});
 await mkdir(root+'/reports',{recursive:true});await writeFile(root+'/reports/INTEGRATION.md',`# Integration checks\n\n40 clean routes return 200 (Main at /, /main redirects to / with canonical /); sitemap lists / once and 40 URLs; favicon.svg/.ico return 200; ${links} local references return 200; ${assets} assets retain baseline SHA-256; unknown route returns 404.\n\nAt 375 pixels in a mobile-device context: Warranty expand/collapse, Main bonding-stage selection, mobile menu and navigation to FindADealer pass. DealerApply: with "Just me" and 0 jobs, ${routing.join('; ')}. Footer social links with href="#" in static HTML: ${socials} (hidden until Ray provides profile URLs). Exported form attributes and fields are compared by the full parity suite. No submissions sent.\n`);
 console.log({pages:pages.length,links,assets,interactions:'pass'});
}finally{await browser.close();await srv.close();}
