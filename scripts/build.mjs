import {readFile,writeFile,mkdir,cp,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {root,pages,route,rewrite,server,prepare,ready} from './common.mjs';
const out=root+'/site';
await rm(out,{recursive:true,force:true});await mkdir(out+'/shared',{recursive:true});
await cp(root+'/wbsite/assets',out+'/assets',{recursive:true});
let runtime=await readFile(root+'/wbsite/support.js','utf8');
const patches=[
 ['const n=t.querySelector("x-dc");','const n=t.querySelector("template[data-static-template]")?.content.querySelector("x-dc")||t.querySelector("x-dc");'],
 ['const s=n.querySelector("x-dc"),i=n.createElement("div");if(i.id="dc-root",s.replaceWith(i),','const s=n.querySelector("x-dc"),i=n.querySelector("#dc-root")||n.createElement("div");if(i.id="dc-root",s&&s.replaceWith(i),'],
 ['const r=L(),o=jt(n,location);','const r=L(),o=n.documentElement.dataset.page||jt(n,location);']
];
for(const [from,to] of patches){if(!runtime.includes(from))throw Error('Export runtime changed: '+from);runtime=runtime.replace(from,to);}
await writeFile(out+'/shared/support.js',runtime);
const srv=await server();const browser=await chromium.launch({headless:true});
const manifest=[];
try{
 for(const file of pages){
  const name=file.replace('.dc.html',''); const page=await browser.newPage({viewport:{width:1440,height:900}});await prepare(page);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await ready(page,srv.url+'/wbsite/'+file);
  if(errors.length)throw Error(file+': '+errors.join('; '));
  const captured=await page.evaluate(()=>({html:(()=>{const body=document.body.cloneNode(true);body.querySelectorAll('script').forEach(s=>s.remove());for(const el of [body,...body.querySelectorAll('*')]){let previous=null;for(const node of [...el.childNodes]){if(previous?.nodeType===3&&node.nodeType===3)el.insertBefore(document.createComment('text boundary'),node);previous=node;}}return body.innerHTML;})(),styles:[...document.head.querySelectorAll('style')].map(s=>s.sheet ? [...s.sheet.cssRules].map(r=>r.cssText).join('\n'):s.textContent),links:[...document.head.querySelectorAll('link')].map(l=>l.outerHTML)}));
  const original=await readFile(root+'/wbsite/'+file,'utf8');
  let head=original.match(/<head>([\s\S]*?)<\/head>/)[1].replace(/<script src="\.\/support.js"><\/script>/,'');
  const css=rewrite(captured.styles.join('\n'));const hash=createHash('sha256').update(css).digest('hex').slice(0,16);
  await writeFile(out+'/shared/'+hash+'.css',css);
  const template=rewrite(original.match(/<x-dc>[\s\S]*?<\/x-dc>/)[0]).replace(/<link\b[^>]*rel="canonical"[^>]*>/g,'');
  const logic=rewrite(original.match(/<script type="text\/x-dc"[\s\S]*?<\/script>/)[0]);
  const pathname=route(name);
  head+='\n<link rel="canonical" href="https://wetbond.com'+pathname+'">\n'+[...new Set(captured.links)].filter(link=>!link.includes('rel="canonical"')).join('\n')+'\n<link rel="stylesheet" href="/shared/'+hash+'.css">\n<script defer src="/shared/support.js"></script>';
  await writeFile(out+'/'+pathname.slice(1)+'.html','<!doctype html>\n<html lang="en" data-page="'+name+'">\n<head>'+head+'</head>\n<body>'+rewrite(captured.html)+'\n<template data-static-template>'+template+'</template>\n'+logic+'\n</body>\n</html>\n');
  manifest.push({name,source:file,route:pathname,css:hash+'.css'});await page.close();console.log('Rendered '+name);
 }
 await writeFile(out+'/index.html',rewrite(await readFile(root+'/wbsite/index.html','utf8')));
 await writeFile(out+'/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+manifest.map(p=>'<url><loc>https://wetbond.com'+p.route+'</loc></url>').join('\n')+'\n</urlset>\n');
 await writeFile(out+'/robots.txt','User-agent: *\nAllow: /\nSitemap: https://wetbond.com/sitemap.xml\n');
 await writeFile(out+'/routes.json',JSON.stringify(manifest,null,2)+'\n');
 await writeFile(out+'/404.html','<!doctype html><html lang="en"><meta charset="utf-8"><title>Not found</title><h1>Page not found</h1><a href="/">WetBond</a></html>\n');
 await writeFile(out+'/vercel.json',JSON.stringify({cleanUrls:true,trailingSlash:false},null,2)+'\n');
}finally{await browser.close();await srv.close();}
