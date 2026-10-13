import {chromium} from 'playwright';
import {PNG} from 'pngjs';
import pixelmatch from 'pixelmatch';
import {writeFile} from 'node:fs/promises';
import {server,prepare,ready,route} from './common.mjs';
const service=await server();
const browser=await chromium.launch();
const results=[];
try {
  const options={viewport:{width:375,height:900},isMobile:true,hasTouch:true};
  const contexts=[await browser.newContext(options),await browser.newContext({...options,javaScriptEnabled:false})];
  for(const name of ['About','ProductsColor','Science']) {
    const pages=[];
    for(let index=0;index<2;index++) {
      const page=await contexts[index].newPage();
      if(index===0) await prepare(page);
      else await page.emulateMedia({reducedMotion:'reduce'});
      await ready(page,service.url+(index===0?'/wbsite/'+name+'.dc.html':route(name)));
      pages.push(page);
    }
    await new Promise(resolve=>setTimeout(resolve,3500));
    const shots=await Promise.all(pages.map(page=>page.screenshot({fullPage:true,animations:'disabled'})));
    const before=PNG.sync.read(shots[0]),after=PNG.sync.read(shots[1]);
    const changedPixels=before.width===after.width&&before.height===after.height
      ? pixelmatch(before.data,after.data,null,before.width,before.height,{threshold:0.1,includeAA:false}):null;
    results.push({page:name,width:375,mode:'static',changedPixels,before:[before.width,before.height],after:[after.width,after.height]});
    console.log(name,changedPixels);
    await Promise.all(pages.map(page=>page.close()));
  }
  await writeFile(new URL('../reports/mobile-raster-recheck.json',import.meta.url),JSON.stringify(results,null,2)+'\n');
} finally {
  await browser.close();
  await service.close();
}
