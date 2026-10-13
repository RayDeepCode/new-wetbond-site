import {readFile,writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {PNG} from 'pngjs';
import pixelmatch from 'pixelmatch';
import {root,pages,route,server,prepare,ready} from './common.mjs';
const report=root+'/reports';await mkdir(report+'/screenshots',{recursive:true});
const srv=await server(), browser=await chromium.launch();const results=[],textDiff=[];
const examples=new Set(['Main','Warranty','FindADealer']);
try{
 for(const width of [1440,375]){
  const baselineContext=await browser.newContext({viewport:{width,height:900},isMobile:width===375,hasTouch:width===375});
  const staticContext=await browser.newContext({viewport:{width,height:900},isMobile:width===375,hasTouch:width===375,javaScriptEnabled:false});
  const liveContext=await browser.newContext({viewport:{width,height:900},isMobile:width===375,hasTouch:width===375});
  for(const file of pages){
   const name=file.replace('.dc.html',''),pathname=route(name);
   const before=await baselineContext.newPage(),after=await staticContext.newPage(),live=await liveContext.newPage();
   await prepare(before);await prepare(live);
   const errors=[];live.on('pageerror',e=>errors.push(e.message));
   await ready(before,srv.url+'/wbsite/'+file);
   await after.emulateMedia({reducedMotion:'reduce'});
   await after.goto(srv.url+pathname,{waitUntil:'networkidle'});
   await after.evaluate(async()=>{await document.fonts.ready;document.querySelectorAll('img').forEach(i=>i.loading='eager');await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
   await after.emulateMedia({reducedMotion:'reduce'});
   await ready(live,srv.url+pathname);
   await new Promise(r=>setTimeout(r,3500));
   const texts=await Promise.all([before,after,live].map(p=>p.locator('body').innerText()));
   for(const [index,label] of [[1,'static'],[2,'interactive']])if(texts[0]!==texts[index])textDiff.push({page:name,width,mode:label,before:texts[0],after:texts[index]});
   const shots=await Promise.all([before,after,live].map(p=>p.screenshot({fullPage:true,animations:'disabled'})));
   const base=PNG.sync.read(shots[0]);
   for(const [index,label] of [[1,'static'],[2,'interactive']]){
    const image=PNG.sync.read(shots[index]);let changed=null;
    if(base.width===image.width&&base.height===image.height)changed=pixelmatch(base.data,image.data,null,base.width,base.height,{threshold:0.1,includeAA:false});
    results.push({page:name,width,mode:label,before:[base.width,base.height],after:[image.width,image.height],changedPixels:changed,totalPixels:base.width*base.height,percent:changed===null?null:100*changed/(base.width*base.height),errors});
   }
   if(examples.has(name))for(const [index,label] of [[0,'before'],[1,'after'],[2,'interactive']])await writeFile(report+'/screenshots/'+name+'-'+width+'-'+label+'.png',shots[index]);
   const html=await readFile(root+'/site/'+pathname.slice(1)+'.html','utf8');
   assert(html.includes('href="https://wetbond.com'+pathname+'"'));assert.equal((html.match(/rel="canonical"/g)||[]).length,1);assert(!/href="[A-Za-z]+\.dc\.html/.test(html));
   const forms=await Promise.all([before,live].map(p=>p.locator('form').evaluateAll(fs=>fs.map(f=>({action:f.getAttribute('action'),method:f.getAttribute('method'),fields:[...f.querySelectorAll('input,textarea,select')].map(i=>({tag:i.tagName,name:i.name,type:i.type}))})))));
   assert.deepEqual(forms[0],forms[1],name+' forms changed');
   await Promise.all([before.close(),after.close(),live.close()]);await writeFile(report+'/pixel-parity.json',JSON.stringify(results,null,2)+'\n');console.log(width+' '+name+' '+results.slice(-2).map(r=>r.changedPixels??'dimensions').join('/'));
  }
  await Promise.all([baselineContext.close(),staticContext.close(),liveContext.close()]);
 }
 await writeFile(report+'/pixel-parity.json',JSON.stringify(results,null,2)+'\n');
 await writeFile(report+'/visible-text.diff',textDiff.length?JSON.stringify(textDiff,null,2)+'\n':'');
 const failures=results.filter(r=>r.changedPixels!==0||r.errors.length);
 const lines=['# WetBond static rendering parity','', 'Baseline: `023a6218`, `wbsite/*.dc.html`. Chromium via Playwright 1.64.0.','', 'All 40 pages at desktop 1440 × 900 and mobile-device 375 × 900; the exported missing viewport and scaled layout are deliberately preserved; full-page screenshots. Initial state, reduced motion, videos paused on their exported poster with 3.5 seconds for font rasterization, native controls and mobile text autosizing to settle, clock initialized to 2026-10-13 12:00 UTC. Pixelmatch threshold 0.1, anti-alias differences excluded. Static mode disables JavaScript; interactive mode retains the exported runtime.','', '| Page | Width | Mode | Changed pixels | Percent |','|---|---:|---|---:|---:|',...results.map(r=>`| ${r.page} | ${r.width} | ${r.mode} | ${r.changedPixels??'DIMENSION MISMATCH'} | ${r.percent?.toFixed(6)??'—'} |`),'',`Visible-text differences: ${textDiff.length}. Pixel/error failures: ${failures.length}.`,'','Screenshots: `screenshots/{Main,Warranty,FindADealer}-{1440,375}-{before,after,interactive}.png`.','', 'Limits: compares initial states, not every interaction. External Google Fonts requires connectivity. Exported dynamic dates use build time for static first paint and current time after runtime mounts. No form submission is sent.'];
 await writeFile(report+'/PIXEL_PARITY.md',lines.join('\n')+'\n');
 assert.equal(textDiff.length,0,'Visible text differs');assert.equal(failures.length,0,'Pixel parity or runtime errors differ');
}finally{await browser.close();await srv.close();}
