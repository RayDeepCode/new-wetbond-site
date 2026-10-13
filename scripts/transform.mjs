// WB-2 build-time transforms. None of these change visible copy.

// <main> landmark: wraps everything between the site header (or the dealer
// funnel bar) and the footer. Inserted into the component markup before render,
// so the static HTML and the runtime template carry the same landmark.
function closeOf(markup,start,tag){
 const re=new RegExp('<(/?)'+tag+'\\b[^>]*>','g');re.lastIndex=start;let depth=0,m;
 while((m=re.exec(markup))){depth+=m[1]?-1:1;if(depth===0)return m.index+m[0].length;}
 throw Error('Unbalanced <'+tag+'>');
}
export function insertMain(name,markup){
 let open;
 if(markup.includes('<header')){open=markup.indexOf('</header>')+'</header>'.length;}
 else{const start=markup.indexOf('<div class="fbar">');if(start<0)throw Error(name+': no header');open=closeOf(markup,start,'div');}
 const close=markup.lastIndexOf('<footer');if(close<open)throw Error(name+': no footer after header');
 // DealerVSL: the funnel bar's wrapper (.fp) closes before the footer because of an
 // exported stray </div>. Split the wrapper after the bar so <main> can hold the rest;
 // both halves keep class "fp" and therefore the same inherited styles.
 const split=name==='DealerVSL'?'</div><main><div class="fp">':'<main>';
 return markup.slice(0,open)+split+markup.slice(open,close)+'</main>'+markup.slice(close);
}

// Template attributes that the browser would act on before state exists (URL
// fetches, SVG geometry parsing, number inputs). In the inert template they are
// renamed; the patched runtime restores them, in order, before it compiles.
export const prefix='data-wb-tpl-';
const guarded=new Set(['href','src','srcset','poster','action','x1','x2','y1','y2','cx','cy','r','d','points','opacity','fill','stroke']);
export function guardTemplate(markup){
 return markup.replace(/<([a-zA-Z][\w-]*)(\s[^<>]*?)?(\/?)>/g,(tag,el,attrs='',slash)=>{
  if(!attrs.includes('{{'))return tag;
  const next=attrs.replace(/(\s)([a-zA-Z][\w:-]*)="([^"]*\{\{[^"]*)"/g,(m,sp,key,value)=>
   guarded.has(key)||(el.toLowerCase()==='input'&&key==='value')?sp+prefix+key+'="'+value+'"':m);
  return '<'+el+next+slash+'>';
 });
}
export const restoreTemplate='(e=>{if(e)for(const x of e.querySelectorAll("*")){const a=[...x.attributes];if(!a.some(t=>t.name.startsWith("'+prefix+'")))continue;for(const t of a)x.removeAttribute(t.name);for(const t of a)x.setAttribute(t.name.startsWith("'+prefix+'")?t.name.slice('+prefix.length+'):t.name,t.value);}return e})';

// Titles: "<Page> | WetBond", page names taken from each page's nav/link label or h1.
export const titles={
 About:'About',Accessibility:'Accessibility',Basements:'Basements',Book:'You Can’t Stop Water',
 CityPittsburgh:'Basement waterproofing in Pittsburgh',Compare:'Compare options',Contractors:'For contractors',
 CrawlSpaces:'Crawl spaces',DealerApply:'Check my market',DealerConfirmed:'Your market call is confirmed',
 DealerSchedule:'Pick a time',DealerVSL:'Become a Certified Dealer',Exterior:'Driveways and walkways',FAQ:'FAQ',
 FieldData:'Field data',FindADealer:'Find a Certified Dealer',Floors:'Floors and garage slabs',
 ForArchitects:'For architects and engineers',ForHomeowners:'For homeowners',ForPropertyManagers:'For property managers',
 HowItWorks:'How it works',Learn:'Learn',LearnChoosingContractor:'How to choose a waterproofing contractor',
 LearnSumpPumps:'When the sump pump stops',LearnWhyBasementsLeak:'Why basements leak',Main:'Home',Patents:'Patents',
 Privacy:'Privacy policy',ProductsColor:'Color treatments',ProductsFloor:'Floor system',
 ProductsPenetrating:'Embedded Waterproofing',ProductsRepair:'Repair and prep',Repairs:'Cracks and repairs',
 Science:'The science',SumpPits:'Sump pits',Sustainability:'Sustainability',Technical:'Technical data',
 Terms:'Terms of use',Warranty:'Warranty',WetSpaces:'Wet spaces'
};
export const escapeAttr=s=>s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
export const escapeText=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
