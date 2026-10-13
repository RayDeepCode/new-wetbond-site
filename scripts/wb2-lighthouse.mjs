import {execFileSync,spawn} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright';
import {root,server} from './common.mjs';
const base=root+'/.scratch/WB1_LIGHTHOUSE';await mkdir(base,{recursive:true});
execFileSync('bash',['-c','git archive 288c6856 site | tar -x -C "$1"','wb2',base],{cwd:root});
const baseline=createServer(async(req,res)=>{try{let file=base+'/site'+new URL(req.url,'http://localhost').pathname;if(file.endsWith('/'))file+='index.html';let body;try{body=await readFile(file);}catch{file+='.html';body=await readFile(file);}const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.mp4':'video/mp4'};res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(body);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>baseline.listen(0,'127.0.0.1',r));const after=await server();const results=[];
try{for(const [label,url] of [['WB1','http://127.0.0.1:'+baseline.address().port+'/main'],['WB2',after.url+'/']]){
 const output=root+'/reports/LIGHTHOUSE_'+label+'.json';
 await new Promise((resolve,reject)=>{const p=spawn('npx',['--yes','lighthouse@12.8.2',url,'--quiet','--output=json','--output-path='+output,'--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage'],{cwd:root,env:{...process.env,CHROME_PATH:chromium.executablePath()},stdio:'inherit'});p.on('exit',code=>code===0?resolve():reject(Error('lighthouse '+code)));});
 const report=JSON.parse(await readFile(output));results.push({label,url,version:report.lighthouseVersion,mobile:report.configSettings.formFactor,categories:Object.fromEntries(Object.entries(report.categories).map(([key,v])=>[key,v.score])),FCP:report.audits['first-contentful-paint'].numericValue,LCP:report.audits['largest-contentful-paint'].numericValue,CLS:report.audits['cumulative-layout-shift'].numericValue,TBT:report.audits['total-blocking-time'].numericValue,runtimeError:report.runtimeError,warnings:report.runWarnings});console.log(results.at(-1));
}await writeFile(root+'/reports/LIGHTHOUSE_SUMMARY.json',JSON.stringify({limits:'One localhost simulated mobile lab run per homepage; external resource/network/cache variation applies. No production performance claim.',results},null,2)+'\n');}finally{await after.close();await new Promise(r=>baseline.close(r));}
