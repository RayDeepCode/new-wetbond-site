import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
import {root,pages,route,output,server,prepare,ready} from './common.mjs';
await mkdir(root+'/reports/screenshots',{recursive:true});
const records=[];
for(const file of pages){const name=file.replace('.dc.html',''),html=await readFile(root+'/site/'+output(route(name)),'utf8');const get=key=>html.match(new RegExp('<meta (?:name|property)="'+key+'" content="([^"]*)"'))?.[1];records.push({page:name,route:route(name),title:html.match(/<title>(.*?)<\/title>/)[1],description:get('description'),ogImage:get('og:image'),provenance:'Existing page title/nav/h1; existing description or first content paragraph; existing page image or header mark'});}
await writeFile(root+'/reports/WB2_METADATA_REVIEW.json',JSON.stringify(records,null,2)+'\n');
await writeFile(root+'/reports/WB2_METADATA_REVIEW.md',['# WB-2 titles and descriptions for Zola','', '| Page | Title | Description | Image |','|---|---|---|---|',...records.map(r=>`| ${r.route} | ${r.title.replaceAll('|','\\|')} | ${r.description} | ${r.ogImage} |`),'','Review required before merge. No new marketing claim: description fallback is the page’s own first content paragraph.'].join('\n')+'\n');
const srv=await server(),browser=await chromium.launch();
try{for(const name of ['Main','Warranty','FindADealer']){
 const html=execFileSync('git',['show','288c6856:wbsite/'+name+'.dc.html'],{cwd:root,encoding:'utf8'});
 const p=await browser.newPage({viewport:{width:375,height:900}});await prepare(p);
 await p.route('**/wbsite/WB1-'+name+'.dc.html',r=>r.fulfill({contentType:'text/html',body:html}));
 await ready(p,srv.url+'/wbsite/WB1-'+name+'.dc.html');await p.screenshot({path:root+'/reports/screenshots/'+name+'-375-WB1-before.png',fullPage:true,animations:'disabled'});await p.close();
}}finally{await browser.close();await srv.close();}
console.log({metadata:records.length,beforeScreenshots:3});
