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
 // SITES-PUBLIC-HOTFIX item 6: no sitemap, robots disallows everything, every response is marked noindex by the host.
 assert.equal((await fetch(srv.url+'/sitemap.xml')).status,404);assert.equal(await text('/robots.txt'),'User-agent: *\nDisallow: /\n');
 assert.equal(await readFile(root+'/site/_headers','utf8'),'/*\n  X-Robots-Tag: noindex\n');
 // Items 1/3/4: removed intake and funnel routes are a true 404, and no served page carries intake controls or the banned line.
 for(const gone of ['/book','/find-a-dealer','/dealer-apply','/dealer-schedule','/dealer-confirmed','/dealer-vsl'])assert.equal((await fetch(srv.url+gone)).status,404,gone);
 for(const file of pages){const h=await (await fetch(srv.url+route(file.replace('.dc.html','')))).text();
  for(const banned of [/<(?:form|input|textarea|select)\b/,/not a franchise or a business opportunity/,/WetBond Systems/,/createObjectURL/,/\/(?:book|find-a-dealer|dealer-apply|dealer-schedule|dealer-confirmed|dealer-vsl)\b/])assert(!banned.test(h),file+': '+banned);}
 const legacy=await fetch(srv.url+'/main',{redirect:'manual'});assert.equal(legacy.status,301);assert.equal(legacy.headers.get('location'),'/');
 assert((await text('/')).includes('data-page="Main"'));
 const vercel=JSON.parse(await text('/vercel.json'));assert.deepEqual(vercel.redirects,[{source:'/main',destination:'/',permanent:true}]);assert.deepEqual(vercel.headers,[{source:'/(.*)',headers:[{key:'X-Robots-Tag',value:'noindex'}]}]);
 const routes=JSON.parse(await text('/routes.json'));assert.equal(routes.find(r=>r.name==='Main').route,'/');assert.deepEqual(routes.find(r=>r.name==='Main').redirectFrom,['/main']);
 for(const icon of ['/favicon.svg','/favicon.ico'])await text(icon);
 const page=await browser.newPage({viewport:{width:375,height:900},isMobile:true,hasTouch:true});await prepare(page);await ready(page,srv.url+'/warranty');
 await page.waitForFunction(()=>[...document.querySelectorAll('button.more')].every(b=>Object.keys(b).some(k=>k.startsWith('__reactProps$')&&typeof b[k].onClick==='function')));
 const button=page.locator('button.more').first();assert.equal(await button.getAttribute('aria-expanded'),'false');await button.click();await expectAttribute(button,'aria-expanded','true');await button.click();await expectAttribute(button,'aria-expanded','false');
 await ready(page,srv.url+'/');
 const stage=page.getByRole('button',{name:'2 Bonding',exact:false});await stage.scrollIntoViewIfNeeded();await page.waitForTimeout(500);await stage.click();await expectAttribute(stage,'aria-pressed','true');
 const menu=page.locator('.wbh-m > summary');await menu.click();assert.equal(await page.locator('.wbh-m').getAttribute('open'),'');
 await page.locator('.wbh-mp a[href="/warranty"]').first().click();assert.equal(new URL(page.url()).pathname,'/warranty');
 let socials=0;for(const file of pages){const h=await (await fetch(srv.url+route(file.replace('.dc.html','')))).text();socials+=(h.split('<template data-static-template>')[0].match(/<a [^>]*href="#"[^>]*data-social=/g)||[]).length;}
 assert.equal(socials,0,'Footer social placeholders must be absent');
 console.log({socialHashLinksInStaticHtml:socials});
 await mkdir(root+'/reports',{recursive:true});await writeFile(root+'/reports/INTEGRATION.md',`# Integration checks\n\n${pages.length} clean routes return 200 (Main at /, /main redirects to / with canonical /); 6 removed routes return 404; no sitemap, robots disallows all, _headers marks every response noindex; favicon.svg/.ico return 200; ${links} local references return 200; ${assets} assets retain baseline SHA-256; unknown route returns 404.\n\nAt 375 pixels in a mobile-device context: Warranty expand/collapse, Main bonding-stage selection, mobile menu and navigation to Warranty pass. Footer social links with href="#" in static HTML: ${socials} (hidden until Ray provides profile URLs). No served page has a form, input, textarea or select. No submissions sent.\n`);
 console.log({pages:pages.length,links,assets,interactions:'pass'});
}finally{await browser.close();await srv.close();}
