import './admin-preflight.js?v=20260914-8';
import './admin-pro.js';
import './admin-course-extra.js';
import './contribution-admin.js?v=20260913-2';
import './course-admin.js';
import './creator-profile-admin.js';
import './blog-author-admin.js';
import './site-menu-admin.js';
import './admin-generators.js';
import './admin-categories.js';
import './admin-vale-cards.js?v=20260914-8';
if(!document.querySelector('link[href="/assets/courses.css"]')){const l=document.createElement('link');l.rel='stylesheet';l.href='/assets/courses.css';document.head.appendChild(l)}
if(!document.querySelector('link[href="/assets/creator-profile-v2.css"]')){const l=document.createElement('link');l.rel='stylesheet';l.href='/assets/creator-profile-v2.css';document.head.appendChild(l)}
import{createClient}from'https://esm.sh/@supabase/supabase-js@2.116.0';
const C=window.DOMINAEL_CONFIG||{},s=createClient(C.supabaseUrl,C.supabasePublishableKey),$=q=>document.querySelector(q),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format((v||0)/100),dt=v=>v?new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'medium'}).format(new Date(v)):'—';
async function api(name,opt={}){const{data}=await s.auth.getSession();const r=await fetch(`${C.functionsBase}/${name}`,{...opt,headers:{'Content-Type':'application/json','Authorization':`Bearer ${data.session?.access_token||''}`},cache:'no-store'}),d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||'Erro');return d}
let reviews=[],products=[];function renderReviews(){const sel=$('#reviewProduct'),box=$('#reviewRows');if(sel)sel.innerHTML=products.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('');if(!box)return;box.innerHTML=reviews.length?reviews.map(r=>`<div class="admin-review"><div><b>${esc(products.find(x=>x.id===r.product_id)?.name||'Produto')}</b><div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)} <small>${r.rating}/5</small></div><p>${esc(r.comment)}</p><small>${dt(r.created_at)}</small></div><button class="btn btn-light" data-review-delete="${r.id}">Apagar</button></div>`).join(''):'<div class="notice">Nenhuma avaliação cadastrada.</div>'}async function loadReviews(){const d=await api('admin-products');reviews=d.reviews||[];products=d.products||[];renderReviews()}
document.addEventListener('DOMContentLoaded',()=>{document.querySelector('[data-tab="reviewsPanel"]')?.addEventListener('click',()=>setTimeout(loadReviews,50));$('#reviewForm')?.addEventListener('submit',async e=>{e.preventDefault();await api('admin-products',{method:'POST',body:JSON.stringify({resource:'review',product_id:$('#reviewProduct').value,rating:Number($('#reviewRating').value),comment:$('#reviewComment').value.trim()})});e.target.reset();await loadReviews()})});