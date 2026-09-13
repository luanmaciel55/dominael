(()=>{
  function validBirth(day,month,year){
    if(!/^\d{1,2}$/.test(day)||!/^\d{1,2}$/.test(month)||!/^\d{4}$/.test(year))return false;
    const d=Number(day),m=Number(month),y=Number(year);
    if(y<1900||y>new Date().getFullYear()||m<1||m>12||d<1||d>31)return false;
    const dt=new Date(y,m-1,d);
    return dt.getFullYear()===y&&dt.getMonth()===m-1&&dt.getDate()===d&&dt<=new Date();
  }
  function init(){
    for(const [formId,modeId] of [['gamesAuthForm','gamesAuthMode'],['courseAuthForm','courseAuthMode'],['genAuthForm','genAuthMode']]){
      const form=document.getElementById(formId),mode=document.getElementById(modeId);
      if(!form||!mode||form.dataset.accountEnhanced)continue;
      form.dataset.accountEnhanced='1';
      const fields=document.createElement('div');
      fields.className='account-registration-fields';
      fields.innerHTML='<div class="field"><label>Nome completo</label><input name="accountFullName" autocomplete="name" maxlength="140" placeholder="Seu nome e sobrenome"></div><p><b>Perguntas secretas para caso de esquecer a senha</b><br>Atenção: responda sem espaços, com apenas uma palavra quando solicitado. Maiúsculas e minúsculas não fazem diferença.</p><div class="field"><label>Data de nascimento</label><div class="account-birth-row"><div><span>Dia</span><input name="accountBirthDay" inputmode="numeric" pattern="[0-9]{1,2}" maxlength="2" placeholder="DD" aria-label="Dia do nascimento"></div><div><span>Mês</span><input name="accountBirthMonth" inputmode="numeric" pattern="[0-9]{1,2}" maxlength="2" placeholder="MM" aria-label="Mês do nascimento"></div><div class="account-birth-year"><span>Ano <small>(4 números)</small></span><input name="accountBirthYear" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" placeholder="AAAA" aria-label="Ano do nascimento com quatro números"></div></div><small class="account-birth-help">Digite somente números. O ano deve ter quatro números, por exemplo: 1990.</small><input type="hidden" name="accountBirth"></div><div class="field"><label>Primeiro nome do avô</label><input name="accountGrandfather" maxlength="40" pattern="[^\\s/.,-]+" placeholder="Uma palavra, sem espaços ou pontuação"></div>';
      form.insertBefore(fields,form.querySelector('button[type=submit],button:not([type])')||form.lastElementChild);
      const forgot=document.createElement('a');
      forgot.href='/recuperar-conta.html';forgot.className='btn btn-light account-forgot';forgot.textContent='Esqueceu seu acesso?';form.after(forgot);
      const day=fields.querySelector('[name=accountBirthDay]'),month=fields.querySelector('[name=accountBirthMonth]'),year=fields.querySelector('[name=accountBirthYear]'),birth=fields.querySelector('[name=accountBirth]');
      function digits(i,max){i.value=i.value.replace(/\D/g,'').slice(0,max)}
      function syncBirth(){
        digits(day,2);digits(month,2);digits(year,4);
        const complete=day.value&&month.value&&year.value.length===4;
        const ok=complete&&validBirth(day.value,month.value,year.value);
        birth.value=ok?day.value.padStart(2,'0')+month.value.padStart(2,'0')+year.value:'';
        const msg=complete&&!ok?'Digite uma data de nascimento válida.':'';
        year.setCustomValidity(msg);
      }
      day.addEventListener('input',()=>{syncBirth();if(day.value.length===2)month.focus()});
      month.addEventListener('input',()=>{syncBirth();if(month.value.length===2)year.focus()});
      year.addEventListener('input',syncBirth);
      function sync(){
        const register=mode.value==='register';fields.hidden=!register;
        fields.querySelectorAll('input:not([type=hidden])').forEach(i=>i.required=register);
        if(!register){year.setCustomValidity('');birth.value=''}
        forgot.hidden=register;
      }
      sync();document.addEventListener('click',()=>queueMicrotask(sync));
      const st=document.createElement('style');
      st.textContent='.account-registration-fields{margin:14px 0;padding:16px;border:1px solid #d6e5f6;border-radius:14px;background:#f6faff}.account-registration-fields p{line-height:1.5}.account-registration-fields[hidden],.account-forgot[hidden]{display:none!important}.account-forgot{display:inline-flex;margin-top:12px}.account-birth-row{display:grid;grid-template-columns:82px 82px minmax(130px,170px);gap:10px;align-items:end}.account-birth-row>div span{display:block;font-size:12px;font-weight:800;margin-bottom:5px;color:#53677f}.account-birth-row input{width:100%;box-sizing:border-box}.account-birth-year small{font-weight:600}.account-birth-help{display:block;margin-top:7px;color:#65758b;line-height:1.4}@media(max-width:420px){.account-birth-row{grid-template-columns:70px 70px 1fr;gap:8px}}';
      document.head.appendChild(st);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
