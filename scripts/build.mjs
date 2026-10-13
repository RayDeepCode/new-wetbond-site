import {readFile,writeFile,mkdir,cp,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {root,pages,route,output,home,slug,rewrite,server,prepare,ready} from './common.mjs';
import {insertMain,guardTemplate,restoreTemplate,prefix,titles,escapeAttr,escapeText} from './transform.mjs';
const out=root+'/site',origin='https://wetbond.com';
await rm(out,{recursive:true,force:true});await mkdir(out+'/shared',{recursive:true});
await cp(root+'/wbsite/assets',out+'/assets',{recursive:true});
let runtime=await readFile(root+'/wbsite/support.js','utf8');
const patches=[
 ['const n=t.querySelector("x-dc");','const n=t.querySelector("template[data-static-template]")?.content.querySelector("x-dc")||t.querySelector("x-dc");'],
 ['const s=n.querySelector("x-dc"),i=n.createElement("div");if(i.id="dc-root",s.replaceWith(i),','const s=n.querySelector("x-dc"),i=n.querySelector("#dc-root")||n.createElement("div");if(i.id="dc-root",s&&s.replaceWith(i),'],
 ['const r=L(),o=jt(n,location);','const r=L(),o=n.documentElement.dataset.page||jt(n,location);'],
 // The runtime also re-reads the template from the fetched page source; undo the attribute guard there too.
 ['const r=t.slice(n.index+n[0].length,e),','const r=t.slice(n.index+n[0].length,e).replace(/(\\s)'+prefix+'(?=[a-z])/g,"$1"),']
];
for(const [from,to] of patches){if(!runtime.includes(from))throw Error('Export runtime changed: '+from);runtime=runtime.replace(from,to);}
// Restore guarded template attributes (see transform.mjs) before the runtime reads the template.
runtime=restoreTemplate+'(document.querySelector("template[data-static-template]")?.content);\n'+runtime;
await writeFile(out+'/shared/support.js',runtime);
// WB-2 shared responsive layer: phone-width rules only, linked after each page's own CSS.
await cp(root+'/scripts/responsive.css',out+'/shared/responsive.css');
const srv=await server();const browser=await chromium.launch({headless:true});
const manifest=[];
try{
 // Favicon: the existing compact WetBond mark from the site header (.lg-c), unchanged.
 const mark=(await readFile(root+'/wbsite/'+home+'.dc.html','utf8')).match(/<span class="lg-c">(<svg[\s\S]*?<\/svg>)/)[1];
 const favicon=mark.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ').replace(/ width="30" height="30" aria-hidden="true"/,'');
 await writeFile(out+'/favicon.svg',favicon+'\n');
 {const page=await browser.newPage({viewport:{width:32,height:32}});await page.setContent('<style>html,body{margin:0;background:transparent}svg{display:block;width:32px;height:32px}</style>'+favicon);
  const png=await page.screenshot({omitBackground:true});await page.close();
  const ico=Buffer.alloc(22);ico.writeUInt16LE(1,2);ico.writeUInt16LE(1,4);ico.writeUInt8(32,6);ico.writeUInt8(32,7);ico.writeUInt16LE(1,10);ico.writeUInt16LE(32,12);ico.writeUInt32LE(png.length,14);ico.writeUInt32LE(22,18);
  await writeFile(out+'/favicon.ico',Buffer.concat([ico,png]));}
 {const page=await browser.newPage({viewport:{width:256,height:256}});await page.setContent('<style>html,body{margin:0;background:white}svg{display:block;width:256px;height:256px}</style>'+favicon);await writeFile(out+'/brand-mark.png',await page.screenshot());await page.close();}
 for(const file of pages){
  const name=file.replace('.dc.html','');
  const original=await readFile(root+'/wbsite/'+file,'utf8');
  const xdc=insertMain(name,original.match(/<x-dc>[\s\S]*?<\/x-dc>/)[0]);
  const source=original.replace(/<x-dc>[\s\S]*?<\/x-dc>/,()=>xdc);
  const page=await browser.newPage({viewport:{width:1440,height:900}});await prepare(page);
  await page.route(srv.url+'/wbsite/'+file,r=>r.fulfill({status:200,contentType:'text/html',body:source}));
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await ready(page,srv.url+'/wbsite/'+file);
  if(errors.length)throw Error(file+': '+errors.join('; '));
  const landmark=await page.evaluate(()=>{const m=document.querySelectorAll('#dc-root main');if(m.length!==1)return 'main count '+m.length;const main=m[0];
   if(main.querySelector('header,footer,.fbar'))return 'main contains header/footer';const before=main.previousElementSibling;
   if(!before||!(before.matches('header,.fbar')||before.querySelector(':scope > .fbar:only-child')))return 'main not after header';
   if(!main.nextElementSibling?.matches('footer'))return 'main not before footer';
   const hero=main.querySelector('section')?.querySelector('img');return {image:hero&&hero.getAttribute('src')};});
  if(typeof landmark==='string')throw Error(file+': '+landmark);
  const captured=await page.evaluate(()=>({html:(()=>{const body=document.body.cloneNode(true);body.querySelectorAll('script').forEach(s=>s.remove());for(const el of [body,...body.querySelectorAll('*')]){let previous=null;for(const node of [...el.childNodes]){if(previous?.nodeType===3&&node.nodeType===3)el.insertBefore(document.createComment('text boundary'),node);previous=node;}}return body.innerHTML;})(),styles:[...document.head.querySelectorAll('style')].map(s=>s.sheet ? [...s.sheet.cssRules].map(r=>r.cssText).join('\n'):s.textContent),links:[...document.head.querySelectorAll('link')].map(l=>l.outerHTML)}));
  let head=original.match(/<head>([\s\S]*?)<\/head>/)[1].replace(/<script src="\.\/support.js"><\/script>/,'');
  const pathname=route(name),url=origin+pathname,title=titles[name]+' | WetBond';
  if(!titles[name])throw Error(file+': no title');
  if((head.match(/<title>/g)||[]).length!==1)throw Error(file+': title count');
  head=head.replace(/<title>[\s\S]*?<\/title>/,'<title>'+escapeText(title)+'</title>');
  let description=head.match(/<meta name="description" content="([^"]*)">/)?.[1];
  if(!description){const copy=await page.locator('main p').first().innerText();description=escapeAttr(copy.trim().replace(/\s+/g,' ').slice(0,160));head+='\n<meta name="description" content="'+description+'">';}
  if(!/name="viewport"/.test(head))head=head.replace(/<meta charset="utf-8">/,'$&\n<meta name="viewport" content="width=device-width, initial-scale=1">');
  if(!/name="viewport"/.test(head))throw Error(file+': viewport not added');
  const image=landmark.image&&/^(?:\.\/)?assets\/[0-9a-f]+\.(?:webp|jpg|png)$/.test(landmark.image)?origin+'/'+landmark.image.replace(/^\.\//,''):origin+'/brand-mark.png';
  // Zola/Nova metadata ruling: omit held claims from share descriptions.
  const heldDescription=new Set(['ProductsPenetrating','Technical','Contractors','Warranty']).has(name);
  if(name==='ProductsPenetrating'){description=null;head=head.replace(/<meta name="description" content="[^"]*">/,'');}
  if(name==='ProductsRepair'){description='Cracks, joints and holes are where most basements leak first.';head=head.replace(/(<meta name="description" content=")[^"]*(">)/,'$1'+description+'$2');}
  head=head.replace(/<meta (?:property|name)="(?:og|twitter):description"[^>]*>/g,'');
  const og=[['og:type','website'],['og:site_name','WetBond'],['og:title',title],...(!heldDescription?[['og:description',description]]:[]),['og:url',url],...(image?[['og:image',image]]:[])]
   .map(([key,value])=>'<meta property="'+key+'" content="'+(key==='og:description'?value:escapeAttr(value))+'">').join('\n');
  const css=rewrite(captured.styles.join('\n'));const hash=createHash('sha256').update(css).digest('hex').slice(0,16);
  await writeFile(out+'/shared/'+hash+'.css',css);
  const template=rewrite(guardTemplate(xdc)).replace(/<link\b[^>]*rel="canonical"[^>]*>/g,'');
  if(/\s(?:href|src|srcset|poster|action|x1|x2|y1|y2|d)="[^"]*\{\{/.test(template))throw Error(file+': unguarded template attribute');
  const logic=rewrite(original.match(/<script type="text\/x-dc"[\s\S]*?<\/script>/)[0]);
  head+='\n<link rel="canonical" href="'+url+'">\n'+og+'\n<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n<link rel="icon" href="/favicon.ico" sizes="32x32">\n'+[...new Set(captured.links)].filter(link=>!link.includes('rel="canonical"')).join('\n')+'\n<link rel="stylesheet" href="/shared/'+hash+'.css">\n<link rel="stylesheet" href="/shared/responsive.css">\n<script defer src="/shared/support.js"></script>';
  await writeFile(out+'/'+output(pathname),'<!doctype html>\n<html lang="en" data-page="'+name+'">\n<head>'+head+'</head>\n<body>'+rewrite(captured.html)+'\n<template data-static-template>'+template+'</template>\n'+logic+'\n</body>\n</html>\n');
  manifest.push({name,source:file,route:pathname,...(name===home?{redirectFrom:[slug(name)]}:{}),css:hash+'.css',...(image?{ogImage:image}:{})});await page.close();console.log('Rendered '+name);
 }
 // /main is no longer a page: it points at / (301 on Vercel; static fallback for other hosts and the local preview).
 await writeFile(out+'/'+output(slug(home)),'<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<meta name="robots" content="noindex">\n<link rel="canonical" href="'+origin+'/">\n<meta http-equiv="refresh" content="0; url=/">\n<title>WetBond</title>\n<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n</head>\n<body><a href="/">WetBond.com</a></body>\n</html>\n');
 await writeFile(out+'/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+manifest.map(p=>'<url><loc>'+origin+p.route+'</loc></url>').join('\n')+'\n</urlset>\n');
 await writeFile(out+'/robots.txt','User-agent: *\nAllow: /\nSitemap: https://wetbond.com/sitemap.xml\n');
 await writeFile(out+'/routes.json',JSON.stringify(manifest,null,2)+'\n');
 await writeFile(out+'/404.html','<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><title>Not found</title><h1>Page not found</h1><a href="/">WetBond</a></html>\n');
 await writeFile(out+'/vercel.json',JSON.stringify({cleanUrls:true,trailingSlash:false,redirects:[{source:slug(home),destination:'/',permanent:true}]},null,2)+'\n');
}finally{await browser.close();await srv.close();}
