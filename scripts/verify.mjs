import {readFile,writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {PNG} from 'pngjs';
import pixelmatch from 'pixelmatch';
import {root,pages,route,output,server,prepare,ready} from './common.mjs';
import {titles} from './transform.mjs';
const report=root+'/reports';await mkdir(report+'/screenshots',{recursive:true});
const srv=await server(), browser=await chromium.launch();const results=[],textDiff=[],mobile=[];
const examples=new Set(['Main','Warranty','FindADealer']);
// Console errors, page errors and failed or 4xx/5xx requests while a site page loads.
function watch(page){const problems=[];page.on('console',m=>{if(m.type()==='error')problems.push('console: '+m.text());});page.on('pageerror',e=>problems.push('pageerror: '+e.message));page.on('requestfailed',r=>problems.push('failed: '+r.url()));page.on('response',r=>{if(r.status()>=400)problems.push(r.status()+': '+r.url());});return problems;}
async function settle(page){await page.evaluate(async()=>{await document.fonts.ready;document.querySelectorAll('img').forEach(i=>i.loading='eager');await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});}
try{
 // Head, landmark and template checks on the generated files.
 for(const file of pages){
  const name=file.replace('.dc.html',''),pathname=route(name);
  const html=await readFile(root+'/site/'+output(pathname),'utf8');const [body]=html.split('<template data-static-template>');
  assert(html.includes('<link rel="canonical" href="https://wetbond.com'+pathname+'">'),name+' canonical');assert.equal((html.match(/rel="canonical"/g)||[]).length,1);assert(!/href="[A-Za-z]+\.dc\.html/.test(html));
  assert.equal((html.match(/<meta name="viewport" content="width=device-width, initial-scale=1">/g)||[]).length,1,name+' viewport');
  assert.equal(html.match(/<title>([^<]*)<\/title>/)[1].replace(/&amp;/g,'&'),titles[name]+' | WetBond',name+' title');
  for(const key of ['og:title','og:description','og:url','og:type','og:site_name','og:image'])assert.equal((html.match(new RegExp('property="'+key+'"','g'))||[]).length,1,name+' '+key);
  assert(html.includes('<meta property="og:url" content="https://wetbond.com'+pathname+'">'),name+' og:url');
  assert.equal((body.match(/<main\b/g)||[]).length,1,name+' main');
  assert(!/<a\b[^>]*href="#"[^>]*data-social=/.test(html),name+' social placeholder in live or inert markup');
  assert(!body.includes('{{'),name+' unresolved template text in static HTML');
  assert(!/\s(?:href|src|srcset|poster|action|x1|x2|y1|y2|d)="[^"]*\{\{/.test(html),name+' template attribute the browser would act on');
 }
 for(const width of [1440,375]){
  const device=width===375?{isMobile:true,hasTouch:true}:{};
  // The exported pages have no viewport meta, so at 375 their text baseline is taken at a 375 layout viewport.
  const baselineContext=await browser.newContext({viewport:{width,height:900}});
  const staticContext=await browser.newContext({viewport:{width,height:900},...device,javaScriptEnabled:false});
  const liveContext=await browser.newContext({viewport:{width,height:900},...device});
  for(const file of pages){
   const name=file.replace('.dc.html',''),pathname=route(name);
   const before=await baselineContext.newPage(),after=await staticContext.newPage(),live=await liveContext.newPage();
   await prepare(before);await prepare(live);
   const errors=[];live.on('pageerror',e=>errors.push(e.message));
   const problems={static:watch(after),interactive:watch(live)};
   await ready(before,srv.url+'/wbsite/'+file);
   await after.emulateMedia({reducedMotion:'reduce'});
   await after.goto(srv.url+pathname,{waitUntil:'networkidle'});
   await settle(after);
   await after.emulateMedia({reducedMotion:'reduce'});
   await ready(live,srv.url+pathname);
   await new Promise(r=>setTimeout(r,3500));
   const texts=await Promise.all([before,after,live].map(p=>p.locator('body').innerText()));
   for(const [index,label] of [[1,'static'],[2,'interactive']])if(texts[0]!==texts[index])textDiff.push({page:name,width,mode:label,before:texts[0],after:texts[index]});
   if(width===1440){
    // Desktop: strict pixel parity with the exported pages.
    const shots=await Promise.all([before,after,live].map(p=>p.screenshot({fullPage:true,animations:'disabled'})));
    const base=PNG.sync.read(shots[0]);
    for(const [index,label] of [[1,'static'],[2,'interactive']]){
     const image=PNG.sync.read(shots[index]);let changed=null;
     if(base.width===image.width&&base.height===image.height)changed=pixelmatch(base.data,image.data,null,base.width,base.height,{threshold:0.1,includeAA:false});
     results.push({page:name,width,mode:label,before:[base.width,base.height],after:[image.width,image.height],changedPixels:changed,totalPixels:base.width*base.height,percent:changed===null?null:100*changed/(base.width*base.height),errors,problems:problems[label]});
    }
    if(examples.has(name))for(const [index,label] of [[0,'before'],[1,'after'],[2,'interactive']])await writeFile(report+'/screenshots/'+name+'-'+width+'-'+label+'.png',shots[index]);
   }else{
    // Phone: the exported layout is replaced on purpose (viewport meta + shared responsive layer).
    for(const [page,label] of [[after,'static'],[live,'interactive']]){
     const layout=await page.evaluate(()=>({innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth}));
     mobile.push({page:name,width,mode:label,...layout,errors:label==='interactive'?errors:[],problems:problems[label]});
    }
    if(examples.has(name))for(const [page,label] of [[after,'after'],[live,'interactive']])await writeFile(report+'/screenshots/'+name+'-'+width+'-'+label+'.png',await page.screenshot({fullPage:true,animations:'disabled'}));
   }
   const forms=await Promise.all([before,live].map(p=>p.locator('form').evaluateAll(fs=>fs.map(f=>({action:f.getAttribute('action'),method:f.getAttribute('method'),fields:[...f.querySelectorAll('input,textarea,select')].map(i=>({tag:i.tagName,name:i.name,type:i.type}))})))));
   assert.deepEqual(forms[0],forms[1],name+' forms changed');
   await Promise.all([before.close(),after.close(),live.close()]);
   await writeFile(report+'/pixel-parity.json',JSON.stringify(results,null,2)+'\n');await writeFile(report+'/mobile-375.json',JSON.stringify(mobile,null,2)+'\n');
   console.log(width+' '+name+' '+(width===1440?results.slice(-2).map(r=>(r.changedPixels??'dimensions')+(r.problems.length?'!':'')).join('/'):mobile.slice(-2).map(r=>r.innerWidth+'/'+r.scrollWidth+(r.problems.length||r.errors.length?'!':'')).join(' ')));
  }
  await Promise.all([baselineContext.close(),staticContext.close(),liveContext.close()]);
 }
 await writeFile(report+'/pixel-parity.json',JSON.stringify(results,null,2)+'\n');
 await writeFile(report+'/mobile-375.json',JSON.stringify(mobile,null,2)+'\n');
 await writeFile(report+'/visible-text.diff',textDiff.length?JSON.stringify(textDiff,null,2)+'\n':'');
 const failures=results.filter(r=>r.changedPixels!==0||r.errors.length||r.problems.length);
 const mobileFailures=mobile.filter(r=>r.innerWidth!==375||r.scrollWidth>375||r.bodyWidth>375||r.errors.length||r.problems.length);
 const lines=['# WetBond static rendering checks','', 'Baseline: `wbsite/*.dc.html`. Chromium via Playwright 1.64.0.','',
  '## 1440: pixel parity','','All 40 pages at desktop 1440 × 900, full-page screenshots, compared with the exported page. Initial state, reduced motion, videos paused on their exported poster with 3.5 seconds for font rasterization, clock initialized to 2026-10-13 12:00 UTC. Pixelmatch threshold 0.1, anti-alias differences excluded. Static mode disables JavaScript; interactive mode retains the exported runtime. Console errors, page errors and failed or 4xx/5xx requests on the built page also fail a row.','',
  '| Page | Mode | Changed pixels | Percent | Load problems |','|---|---|---:|---:|---|',...results.map(r=>`| ${r.page} | ${r.mode} | ${r.changedPixels??'DIMENSION MISMATCH'} | ${r.percent?.toFixed(6)??'—'} | ${[...r.errors,...r.problems].join('; ')||'none'} |`),'',
  '## 375: phone layout','','WB-2 adds the viewport meta and a shared responsive layer, so the exported 375 raster is no longer the reference. Each page is loaded in a 375 × 900 mobile-device context (touch, device viewport) with and without JavaScript and must have innerWidth 375, no horizontal overflow (document and body scrollWidth ≤ 375), no console errors, no page errors and no failed or 4xx/5xx requests.','',
  '| Page | Mode | innerWidth | scrollWidth | Load problems |','|---|---|---:|---:|---|',...mobile.map(r=>`| ${r.page} | ${r.mode} | ${r.innerWidth} | ${r.scrollWidth} | ${[...r.errors,...r.problems].join('; ')||'none'} |`),'',
  `Visible-text differences against the source pages: ${textDiff.length}. 1440 failures: ${failures.length}. 375 failures: ${mobileFailures.length}.`,'','Screenshots: `screenshots/{Main,Warranty,FindADealer}-1440-{before,after,interactive}.png` and `-375-{after,interactive}.png`.','',
  'Limits: compares initial states, not every interaction. External Google Fonts requires connectivity. Exported dynamic dates use build time for static first paint and current time after runtime mounts. No form submission is sent.'];
 await writeFile(report+'/PIXEL_PARITY.md',lines.join('\n')+'\n');
 assert.equal(textDiff.length,0,'Visible text differs');assert.equal(failures.length,0,'1440 pixel parity or load problems');assert.equal(mobileFailures.length,0,'375 layout or load problems');
}finally{await browser.close();await srv.close();}
