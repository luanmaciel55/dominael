(()=>{
  const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
  let items=[],index=0,light=null;
  function ensureLightbox(){
    if(light)return light;
    light=document.createElement('div');
    light.className='media-lightbox';
    light.innerHTML='<button class="lightbox-close" aria-label="Fechar">×</button><button class="lightbox-nav lightbox-prev" aria-label="Anterior">‹</button><div class="lightbox-content"></div><button class="lightbox-nav lightbox-next" aria-label="Próxima">›</button><div class="lightbox-count"></div>';
    document.body.appendChild(light);
    q('.lightbox-close',light).onclick=close;
    q('.lightbox-prev',light).onclick=()=>show((index-1+items.length)%items.length);
    q('.lightbox-next',light).onclick=()=>show((index+1)%items.length);
    light.addEventListener('click',e=>{if(e.target===light)close()});
    document.addEventListener('keydown',e=>{if(!light.classList.contains('show'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')q('.lightbox-prev',light).click();if(e.key==='ArrowRight')q('.lightbox-next',light).click()});
    let x=0;light.addEventListener('touchstart',e=>x=e.touches[0].clientX,{passive:true});light.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-x;if(Math.abs(d)>45)(d>0?q('.lightbox-prev',light):q('.lightbox-next',light)).click()},{passive:true});
    return light;
  }
  function show(i){
    if(!items.length)return;index=i;const it=items[index],box=q('.lightbox-content',ensureLightbox());
    box.innerHTML=it.type==='video'?`<video controls autoplay playsinline><source src="${it.url}"></video>`:`<img src="${it.url}" alt="Imagem ampliada">`;
    q('.lightbox-count',light).textContent=`${index+1} / ${items.length}`;
    q('.lightbox-prev',light).style.display=items.length>1?'grid':'none';q('.lightbox-next',light).style.display=items.length>1?'grid':'none';
    light.classList.add('show');document.body.classList.add('no-scroll');
  }
  function close(){if(!light)return;const v=q('video',light);if(v)v.pause();light.classList.remove('show');document.body.classList.remove('no-scroll')}
  function init(){
    const slides=qa('.media-slide');if(!slides.length)return false;
    items=slides.map(s=>({type:s.dataset.type||'image',url:s.dataset.url||q('img,video source',s)?.src})).filter(x=>x.url);
    slides.forEach((s,i)=>{s.classList.remove('hidden-slide');s.dataset.galleryIndex=i;s.style.display=i===0?'flex':'none';s.onclick=e=>{if(e.target.closest('video'))e.target.closest('video').pause();show(i)}});
    const stage=q('.media-stage');if(stage&&!q('.gallery-prev',stage)){
      const prev=document.createElement('button'),next=document.createElement('button'),count=document.createElement('div');
      prev.className='gallery-nav gallery-prev';next.className='gallery-nav gallery-next';count.className='gallery-count';prev.textContent='‹';next.textContent='›';stage.append(prev,next,count);
      const set=n=>{index=(n+slides.length)%slides.length;slides.forEach((s,j)=>s.style.display=j===index?'flex':'none');count.textContent=`${index+1} / ${slides.length}`};
      prev.onclick=e=>{e.stopPropagation();set(index-1)};next.onclick=e=>{e.stopPropagation();set(index+1)};set(0);
      if(slides.length<2){prev.style.display='none';next.style.display='none';count.style.display='none'}
    }
    return true;
  }
  document.addEventListener('DOMContentLoaded',()=>{if(init())return;const o=new MutationObserver(()=>{if(init())o.disconnect()});o.observe(document.body,{childList:true,subtree:true})});
})();