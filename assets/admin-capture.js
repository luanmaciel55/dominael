import{createClient}from'https://esm.sh/@supabase/supabase-js@2.116.0';
const C=window.DOMINAEL_CONFIG||{},client=createClient(C.supabaseUrl,C.supabasePublishableKey),$=s=>document.querySelector(s);
let rows=[],period='all';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function token(){const{data}=await client.auth.getSession();return data.session?.access_token||''}
async function api(){const r=await fetch(`${C.functionsBase}/admin-analytics`,{headers:{'Content-Type':'application/json','Authorization':`Bearer ${await token()}`}}),d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||'Não foi possível carregar as capturas.');return d}
function normalize(x){return(x||[]).map(r=>({name:r.name||'',email:r.email||'',whatsapp:r.whatsapp||'',material:r.product_name||r.material_name||r.item_name||'Material gratuito',date:r.date||r.created_at||'',city:r.city||'',region:r.region||'',country:r.country||''}))}
function render(){
 const q=($('#captureSearch')?.value||'').trim().toLowerCase(),mat=$('#captureMaterial')?.value||'';
 const filtered=rows.filter(r=>(!mat||r.material===mat)&&(!q||[r.name,r.email,r.whatsapp,r.material].some(v=>String(v||'').toLowerCase().includes(q))));
 if($('#captureSummary'))$('#captureSummary').innerHTML=`<div class="metric-card"><span>Capturas encontradas</span><strong>${filtered.length}</strong></div><div class="metric-card"><span>Materiais diferentes</span><strong>${new Set(filtered.map(r=>r.material)).size}</strong></div>`;
 if($('#captureRows'))$('#captureRows').innerHTML=filtered.length?`<div class="settings-card" style="overflow:auto"><table class="table"><thead><tr><th>Nome</th><th>E-mail</th><th>WhatsApp</th><th>Material recebido</th><th>Data e hora</th></tr></thead><tbody>${filtered.map(r=>`<tr><td><b>${esc(r.name||'Não informado')}</b></td><td>${esc(r.email||'—')}</td><td>${esc(r.whatsapp||'—')}</td><td>${esc(r.material)}</td><td>${r.date?esc(new Date(r.date).toLocaleString('pt-BR')):'—'}</td></tr>`).join('')}</tbody></table></div>`:'<div class="notice">Nenhuma captura encontrada com esses filtros.</div>';
}
async function load(){
 const box=$('#captureRows');if(box)box.innerHTML='<div class="notice">Carregando capturas...</div>';
 try{const d=await api(),p=d.periods?.[period]||d.periods?.all||{};rows=normalize(p.recent_free||p.captures||[]);
 const sel=$('#captureMaterial'),old=sel?.value||'';if(sel){const mats=[...new Set(rows.map(r=>r.material).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));sel.innerHTML='<option value="">Todos os materiais</option>'+mats.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');if(mats.includes(old))sel.value=old}render()}catch(e){if(box)box.innerHTML=`<div class="notice error">${esc(e.message)}</div>`}
}
function init(){
 document.querySelector('[data-tab="capturePanel"]')?.addEventListener('click',()=>setTimeout(load,60));
 $('#refreshCapture')?.addEventListener('click',load);
 $('#captureSearch')?.addEventListener('input',render);
 $('#captureMaterial')?.addEventListener('change',render);
 $('#capturePeriod')?.addEventListener('change',e=>{period=e.target.value;load()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();