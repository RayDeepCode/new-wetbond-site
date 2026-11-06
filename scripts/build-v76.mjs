import {readFile,writeFile,mkdir,cp,rm,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const config=JSON.parse(await readFile(path.join(import.meta.dirname,'v76-config.json'),'utf8'));
const out=path.join(root,config.output),source=path.join(root,'site-source');
const hash=b=>createHash('sha256').update(b).digest('hex');
async function files(dir,prefix=''){const result=[];for(const e of await readdir(dir,{withFileTypes:true})){const rel=prefix+e.name;if(e.isDirectory())result.push(...await files(path.join(dir,e.name),rel+'/'));else result.push(rel);}return result.sort();}
// Media are unchanged source bytes; all text, runtime and CSS come from site-source.
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
await cp(path.join(root,config.media),path.join(out,'assets'),{recursive:true});
await cp(source,out,{recursive:true});
for(const held of config.holds)await rm(path.join(out,held+'.html'),{force:true});
const changes=[];
for(const rel of await files(out)){
 if(!rel.endsWith('.html'))continue;
 const file=path.join(out,rel),before=await readFile(file,'utf8');
 let after=before;
 // Keep link labels but remove navigation to held routes, in live and inert markup.
 for(const held of config.holds){
  const re=new RegExp('<a\\b[^>]*\\bhref=["\\\'](?:https?:\\/\\/[^/"\\\']+)?\\/'+held+'(?:\\.html|\\/)?(?:[?#][^"\\\']*)?["\\\'][^>]*>([\\s\\S]*?)<\\/a>','gi');
  after=after.replace(re,'$1');
 }
 if(after!==before){await writeFile(file,after);changes.push(rel);}
 if(!/<meta\s+name="robots"\s+content="noindex"/i.test(after))throw Error(rel+' lost noindex');
}
const rows=(await readFile(path.join(root,'docs/V76_MANIFEST.sha256'),'utf8')).trim().split('\n');
const report={brand:config.brand,matched:[],differences:[],extras:[],linkChanges:changes};const expected=new Set();
for(const row of rows){const [digest,full]=row.trim().split(/\s+/);const prefix='./'+config.brand+'/';if(!full.startsWith(prefix))continue;const rel=full.slice(prefix.length);expected.add(rel);
 if(config.holds.includes(rel.replace(/\.html$/,''))){report.differences.push({file:rel,reason:'Omitted: standing spec requires actual HTTP 404 for held route.'});continue;}
 const actual=hash(await readFile(path.join(out,rel)));
 if(actual===digest)report.matched.push(rel);else {if(!changes.includes(rel))throw Error('Unexplained manifest mismatch: '+rel);report.differences.push({file:rel,expected:digest,actual,reason:'Removed links to held route; retained anchor text.'});}
}
for(const rel of await files(out))if(!expected.has(rel))report.extras.push({file:rel,sha256:hash(await readFile(path.join(out,rel))),reason:rel.startsWith('assets/')?'Preserved existing media bytes (not included in archive).':'Preserved existing host/noindex configuration or brand icon (not included in archive).'});
await mkdir(path.join(root,'reports'),{recursive:true});await writeFile(path.join(root,'reports/v76-manifest.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({brand:config.brand,matched:report.matched.length,differences:report.differences.length,extras:report.extras.length,linkChanges:changes}));
