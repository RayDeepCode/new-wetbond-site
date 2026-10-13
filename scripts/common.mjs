import {createServer} from 'node:http';
import {readFile, stat, readdir} from 'node:fs/promises';
import path from 'node:path';
export const root = path.resolve(import.meta.dirname, '..');
export const pages = (await readdir(path.join(root,'wbsite'))).filter(x=>x.endsWith('.dc.html')).sort();
// Main is the homepage and is served at /; /main remains as a redirect to it.
export const home = 'Main';
export const slug = name => '/'+name.replace(/([A-Z])([A-Z][a-z])/g,'$1-$2').replace(/([a-z0-9])([A-Z])/g,'$1-$2').toLowerCase();
export const route = name => name===home ? '/' : slug(name);
// File in site/ that serves a clean route.
export const output = pathname => pathname==='/' ? 'index.html' : pathname.slice(1)+'.html';
export function rewrite(text){
  // Keep existing non-social footer URLs, including the supported /main alias.
  const preserved = text.replace(/<footer\b[\s\S]*?<\/footer>/g, footer => footer.replace(/(?:\.\/)?Main\.dc\.html/g, "/main"));
  return preserved.replace(/(?:\.\/)?([A-Za-z]+)\.dc\.html/g,(match,name)=>pages.includes(name+'.dc.html') ? route(name) : match).replace(/(["'])\.?\/?assets\//g,'$1/assets/');
}
export async function server(){
 const srv=createServer(async(req,res)=>{
  try{
   const url=new URL(req.url,'http://localhost');
   if(['/main','/main.html','/main/'].includes(url.pathname)){res.writeHead(301,{Location:'/'+url.search});res.end();return;}
   let relative=decodeURIComponent(url.pathname).replace(/^\//,'');
   if(!relative) relative='site/index.html';
   else if(!relative.startsWith('wbsite/')) relative='site/'+relative;
   let file=path.resolve(root,relative);
   if(!file.startsWith(root+path.sep))throw new Error('path');
   if(!(await stat(file).catch(()=>null))) file+='.html';
   if((await stat(file)).isDirectory())file=path.join(file,'index.html');
   const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.xml':'application/xml','.txt':'text/plain','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.mp4':'video/mp4'};
   res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(await readFile(file));
  }catch{res.writeHead(404);res.end('Not found');}
 });
 await new Promise(r=>srv.listen(0,'127.0.0.1',r));
 return {url:`http://127.0.0.1:${srv.address().port}`,close:()=>new Promise(r=>srv.close(r)),srv};
}
export async function prepare(page){
 // Initialize schedule dates reproducibly; reduced motion stops the exported rotating words.
 await page.clock.install({time:new Date('2026-10-13T12:00:00Z')});
 await page.emulateMedia({reducedMotion:'reduce'});
}
export async function ready(page,url){
 await page.goto(url,{waitUntil:'networkidle'});
 await page.waitForSelector('#dc-root > *');
 await page.evaluate(async()=>{await document.fonts.ready;document.querySelectorAll('img').forEach(i=>i.loading='eager');await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));document.querySelectorAll('video').forEach(v=>{v.pause();});});
}
