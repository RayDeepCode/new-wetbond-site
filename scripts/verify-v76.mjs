import assert from 'node:assert/strict';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {serve} from './preview-v76.mjs';
const root=path.resolve(import.meta.dirname,'..'),config=JSON.parse(await readFile(path.join(import.meta.dirname,'v76-config.json'),'utf8'));
const dir=path.join(root,config.output),{server,url}=await serve();
const browser=await chromium.launch({headless:true});const report={pages:[],holds:[],failures:[]};
try{
 for(const held of config.holds)for(const variant of ['','/','.html']){const route='/'+held+variant;assert.equal((await fetch(url+route)).status,404,route);report.holds.push(route);}
 const pages=(await readdir(dir)).filter(f=>f.endsWith('.html')&&f!=='404.html'&&f!=='main.html');
 for(const file of pages){
  const html=await readFile(path.join(dir,file),'utf8');
  for(const match of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g))JSON.parse(match[1]);
  for(const width of [390,1440]){
   const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('response',r=>{if(r.url().startsWith(url)&&r.status()>=400)errors.push(r.status()+' '+r.url().slice(url.length));});
   const response=await page.goto(url+'/'+file,{waitUntil:'load'});
   await page.evaluate(async()=>{document.querySelectorAll('img').forEach(i=>i.loading='eager');await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
   await page.waitForTimeout(150);
   const state=await page.evaluate(()=>({noindex:document.querySelector('meta[name="robots"]')?.content.includes('noindex'),brokenImages:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.getAttribute('src')),overflow:document.documentElement.scrollWidth>innerWidth+1}));
   if(response.status()!==200||!state.noindex||errors.length||state.brokenImages.length||state.overflow)report.failures.push({file,width,errors,...state});
   report.pages.push({file,width,status:response.status(),errors,...state});await page.close();
  }
 }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
await writeFile(path.join(root,'reports/v76-browser.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({checks:report.pages.length,holds:report.holds.length,failures:report.failures.length,overflow:report.pages.filter(p=>p.overflow).length}));
assert.equal(report.failures.length,0,'See reports/v76-browser.json');
