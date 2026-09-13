(()=>{
  const C=window.DOMINAEL_CONFIG||{},esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));for(const section of ['password','email','username'])document.getElementById(section).hidden=b.dataset.tab!==section});
  async function support(){
    let phone='5521998128699';
    try{const r=await fetch(`${C.functionsBase}/public-products`,{cache:'no-store'}),d=await r.json();phone=String(d.settings?.support_whatsapp||d.support_whatsapp||phone).replace(/\D/g,'')}catch{}
    for(const [id,msg] of [['emailSupport','Olá, suporte Dominael. Esqueci o e-mail da minha conta e preciso de ajuda para recuperar o acesso.'],['usernameSupport','Olá, suporte Dominael. Esqueci meu nome de usuário e preciso de ajuda para recuperar o acesso.']])document.getElementById(id).href=`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
  }
  support();
  const f=document.getElementById('recoverForm');
  const day=f.elements.birth_day,month=f.elements.birth_month,year=f.elements.birth_year,birth=f.elements.birth;
  function digits(i,max){i.value=i.value.replace(/\D/g,'').slice(0,max)}
  function validDate(){
    const d=Number(day.value),m=Number(month.value),y=Number(year.value);
    if(!/^\d{1,2}$/.test(day.value)||!/^\d{1,2}$/.test(month.value)||!/^\d{4}$/.test(year.value))return false;
    if(y<1900||y>new Date().getFullYear()||m<1||m>12||d<1||d>31)return false;
    const dt=new Date(y,m-1,d);
    return dt.getFullYear()===y&&dt.getMonth()===m-1&&dt.getDate()===d&&dt<=new Date();
  }
  function syncBirth(){
    digits(day,2);digits(month,2);digits(year,4);
    const complete=day.value&&month.value&&year.value.length===4;
    const ok=complete&&validDate();
    birth.value=ok?day.value.padStart(2,'0')+month.value.padStart(2,'0')+year.value:'';
    year.setCustomValidity(complete&&!ok?'Digite uma data de nascimento válida.':'');
  }
  day.addEventListener('input',()=>{syncBirth();if(day.value.length===2)month.focus()});
  month.addEventListener('input',()=>{syncBirth();if(month.value.length===2)year.focus()});
  year.addEventListener('input',syncBirth);
  f.onsubmit=async e=>{
    e.preventDefault();syncBirth();
    if(!validDate()){year.setCustomValidity('Digite uma data de nascimento válida.');year.reportValidity();return}
    const b=f.querySelector('button'),msg=document.getElementById('recoverMsg');b.disabled=true;msg.textContent='Conferindo as respostas...';
    try{
      const payload=Object.fromEntries(new FormData(f));
      delete payload.birth_day;delete payload.birth_month;delete payload.birth_year;
      const r=await fetch(`${C.functionsBase}/egg-auth`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'recover',...payload}),cache:'no-store'}),d=await r.json();
      if(!r.ok)throw Error(d.error||'Não foi possível recuperar.');
      msg.innerHTML='<div class="notice success">Senha alterada. Agora você pode entrar com a nova senha.</div>';f.reset();birth.value='';year.setCustomValidity('')
    }catch(x){msg.innerHTML=`<div class="notice error">${esc(x.message)}</div>`}finally{b.disabled=false}
  }
})();
