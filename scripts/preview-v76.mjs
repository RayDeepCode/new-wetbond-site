import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(import.meta.dirname,'..');
const config=JSON.parse(await readFile(path.join(import.meta.dirname,'v76-config.json'),'utf8'));
const dir=path.join(root,config.output);
export async function serve(){
 const server=createServer(async(req,res)=>{
  res.setHeader('X-Robots-Tag','noindex');
  try{
   const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
   if(pathname.includes('..'))throw Error('Invalid path');
   if(config.brand==='wetbond'&&/^\/main(?:\.html|\/)?$/.test(pathname)){res.writeHead(301,{Location:'/'});res.end();return;}
   let file=path.join(dir,pathname==='/'?'index.html':pathname.replace(/\/$/,'').replace(/^\//,''));
   if(!path.extname(file))file+='.html';
   const body=await readFile(file);
   const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.ico':'image/x-icon'};
   res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(body);
  }catch{res.statusCode=404;res.setHeader('Content-Type','text/html');res.end(await readFile(path.join(dir,'404.html')));}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 return {server,url:'http://127.0.0.1:'+server.address().port};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const {url}=await serve();console.log(url);}
