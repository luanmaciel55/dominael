(()=>{
  const root=()=>document.querySelector('#reviewRows');
  function group(){
    const r=root();
    if(!r||r.dataset.grouping==='1')return;
    const cards=[...r.querySelectorAll(':scope > .admin-review')];
    if(!cards.length)return;
    r.dataset.grouping='1';
    const map=new Map();
    cards.forEach(c=>{
      const name=c.querySelector('b')?.textContent?.trim()||'Produto';
      if(!map.has(name))map.set(name,[]);
      map.get(name).push(c);
    });
    const frag=document.createDocumentFragment();
    for(const[name,list]of map){
      const d=document.createElement('details');
      d.className='suite-section';
      d.open=true;
      const s=document.createElement('summary');
      s.style.cssText='font-weight:900;cursor:pointer;margin-bottom:10px';
      s.textContent=`${name} — ${list.length} avaliação(ões)`;
      d.appendChild(s);
      list.forEach(c=>d.appendChild(c));
      frag.appendChild(d);
    }
    r.replaceChildren(frag);
    delete r.dataset.grouping;
  }
  function schedule(){setTimeout(group,120)}
  document.addEventListener('click',e=>{
    if(e.target.closest?.('[data-tab="reviewsPanel"]'))schedule();
  },true);
  document.addEventListener('DOMContentLoaded',schedule,{once:true});
  window.addEventListener('admin-reviews-rendered',schedule);
})();
