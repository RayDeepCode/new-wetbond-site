import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import vm from 'node:vm';
import {root,pages} from './common.mjs';
const baseline='288c68565f92f8b7dd640a8eef6d88205177becc';
const oldFaq='Yes. Register the new owner within 60 days of closing and the transfer is free; the remaining term and the lifetime bond warranty carry over.';
const newFaq='Yes. This warranty transfers to the new owner automatically, for the remainder of the term, when you or the new owner tells us in writing that the property has changed hands. There is no fee and no deadline.';
const deltas=[
 {row:'WB-12c',pages:['Warranty','Basements','CrawlSpaces'],before:'Free to the next owner in 60 days',after:'There is no fee and no deadline.'},
 {row:'WB-12d',pages:['Warranty','FAQ'],before:oldFaq,after:newFaq},
 {row:'WB-12e',pages:['Warranty'],before:'<tr><td data-label="Term"><strong>What transfers</strong></td><td data-label="How it works">The remaining years of the term, plus the lifetime bond warranty. The term doesn’t restart</td></tr>',after:''},
 {row:'WB-2 approved transfer Cost',pages:['Warranty'],before:'Free when registered within 60 days of closing. After 60 days, a $95 re-registration and a free condition check by a Certified Dealer',after:'There is no fee and no deadline.'},
 {row:'WB-2 approved transfer How',pages:['Warranty'],before:'Register the new owner with WetBond online or by phone',after:'This warranty transfers to the new owner automatically, for the remainder of the term, when you or the new owner tells us in writing that the property has changed hands.'}
];
// Approved claims-debt rows (Zola r2.1 ae1a2249, Maat SHIP 62252bd3), enumerated in docs/WB1_ALLOWED_SOURCE_DELTAS.json and applied after the rows above.
const claimsDebt=JSON.parse(await readFile(root+'/docs/WB1_ALLOWED_SOURCE_DELTAS.json','utf8')).allowedClaimsDebtDeltas??[];
deltas.push(...claimsDebt);
let socials=0;const evidence=[];
for(const file of pages){
 const name=file.replace('.dc.html','');let expected=execFileSync('git',['show',baseline+':wbsite/'+file],{cwd:root,encoding:'utf8'});
 expected=expected.replace(/<a\b(?=[^>]*\bhref="#")(?=[^>]*\bdata-social=)[^>]*>[\s\S]*?<\/a>/g,()=>{socials++;return '';});
 for(const d of deltas.filter(d=>d.pages.includes(name))){assert.equal(expected.split(d.before).length-1,d.count??1,d.row+' '+name);expected=expected.split(d.before).join(d.after);if(!claimsDebt.includes(d))evidence.push({page:name,...d});}
 const actual=await readFile(root+'/wbsite/'+file,'utf8');
 if(name!=='DealerApply')assert.equal(actual,expected,name+' has an unapproved source delta');
}
assert.equal(socials,144);
const source=await readFile(root+'/wbsite/DealerApply.dc.html','utf8');
const logic=source.slice(source.indexOf('class Component extends DCLogic'),source.indexOf('</script>',source.indexOf('class Component extends DCLogic')));
const Component=vm.runInNewContext(logic+';Component',{DCLogic:class {setState(s){Object.assign(this.state,s);}}});
let cases=0;
for(let trade=0;trade<7;trade++)for(let crew=0;crew<4;crew++)for(let vol=0;vol<5;vol++)for(let time=0;time<3;time++)for(let order=0;order<4;order++){
 const c=new Component({});c.state={step:7,a:{trade,crew,vol,time,order,a1:0,a2:0},apps:[0]};const v=c.renderVals();assert.equal(v.ok,order<2&&time!==2);assert.equal(v.nf,!v.ok);assert.equal(v.setterReview,vol===0);assert.equal(v.intake,v.ok?'fit':order===3?'not_now':order===2?'start_smaller':'researching');assert.equal(v.nfLine,undefined);cases++;
}
for(const step of [4,5]){const c=new Component({});c.state={step,a:{crew:0,rev:0,cap:0,time:0},apps:[0]};const v=c.renderVals();v.next();assert.equal(c.state.step,step,'Old revenue/capital state must not satisfy new answers');}
await mkdir(root+'/reports',{recursive:true});
await writeFile(root+'/reports/WB1_ALLOWED_SOURCE_DELTAS.json',JSON.stringify({baseline,socialsRemoved:socials,nonDealerApplySources:'byte-exact after enumerated authorized replacements',allowedTransferDeltas:evidence,allowedClaimsDebtDeltas:claimsDebt,allowedMetadataDeltas:[{page:'ProductsPenetrating',change:'meta description removed, held claim WB-C10'},{page:'ProductsRepair',change:'meta description trimmed to last full sentence; no new words'},{pages:['ProductsPenetrating','Technical','Contractors','Warranty'],change:'No og:description or twitter:description emitted; Zola/Nova ruling 145539bc/c32a3e7b/9f5eae7f'}],dealerApply:{authorization:'B4/B5 Maat a0439e9b',routingCases:cases,staleAnswerChecks:2}},null,2)+'\n');
console.log({pages:pages.length,socialsRemoved:socials,routingCases:cases,claimsDebtRows:new Set(claimsDebt.map(d=>d.row)).size,unapprovedSourceChanges:0});
