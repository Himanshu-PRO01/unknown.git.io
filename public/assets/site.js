(function(){
var C=window.TKH_CONFIG||{};
var KEY='tkh_consent',PKEY='tkh_profile';
function $(s){return document.querySelector(s)}
function $$(s){return Array.prototype.slice.call(document.querySelectorAll(s))}
function read(k){try{return localStorage.getItem(k)}catch(e){return null}}
function store(k,v){try{if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){}}

$$('[data-email]').forEach(function(el){el.textContent=C.EMAIL;if(el.tagName==='A')el.href='mailto:'+C.EMAIL;});
$$('[data-waitlist]').forEach(function(a){a.href='mailto:'+C.EMAIL+'?subject='+encodeURIComponent('Pro waitlist')+'&body='+encodeURIComponent('Please add me to the Pro waitlist.');});

/* Ads and analytics (only load after the visitor makes a cookie choice) */
var slots=$$('.ad');slots.forEach(function(s){s.style.display='none';});
var adsLoaded=false;
function loadAds(personal){
  if(!C.ADSENSE_CLIENT||adsLoaded)return;adsLoaded=true;
  window.adsbygoogle=window.adsbygoogle||[];
  if(!personal)window.adsbygoogle.requestNonPersonalizedAds=1;
  var s=document.createElement('script');s.async=true;s.crossOrigin='anonymous';
  s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+encodeURIComponent(C.ADSENSE_CLIENT);
  document.head.appendChild(s);
  if(C.ADSENSE_SLOT){slots.forEach(function(el){
    el.style.display='block';el.setAttribute('data-on','1');el.innerHTML='';
    var ins=document.createElement('ins');ins.className='adsbygoogle';ins.style.display='block';
    ins.setAttribute('data-ad-client',C.ADSENSE_CLIENT);ins.setAttribute('data-ad-slot',C.ADSENSE_SLOT);
    ins.setAttribute('data-ad-format','auto');ins.setAttribute('data-full-width-responsive','true');
    el.appendChild(ins);window.adsbygoogle.push({});
  });}
}
function loadAnalytics(){
  if(!C.GA_ID)return;
  var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(C.GA_ID);document.head.appendChild(s);
  window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};
  window.gtag('js',new Date());window.gtag('config',C.GA_ID);
}
function apply(c){if(c==='yes'){loadAds(true);loadAnalytics();}else if(c==='no'){loadAds(false);}}
function banner(){
  if(!(C.ADSENSE_CLIENT||C.GA_ID))return;
  var d=document.createElement('div');d.className='consent noprint';d.setAttribute('role','dialog');d.setAttribute('aria-label','Cookie choices');
  d.innerHTML='<p>We use cookies to show ads and to understand how the site is used. You can accept, or decline personalised ads. <a href="cookies.html">Cookie policy</a></p><div class="cbtn"><button type="button" data-c="no" class="btn btn-ghost-light">Decline</button><button type="button" data-c="yes" class="btn btn-primary">Accept</button></div>';
  d.addEventListener('click',function(e){var c=e.target.getAttribute&&e.target.getAttribute('data-c');if(!c)return;store(KEY,c);d.remove();apply(c);});
  document.body.appendChild(d);
}
var saved=read(KEY);if(saved)apply(saved);else banner();

/* Tool search: suggestions on the home page */
function esc(x){return String(x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
var q=$('#toolSearch');
if(q){
  var box=$('#sugg'),items=[],act=-1;
  var catName={help:'Help',business:'Business',loans:'Loans',savings:'Savings',tax:'Tax',everyday:'Everyday',guides:'Guide'};
  var mark=function(){
    $$('#sugg li').forEach(function(li,i){li.classList.toggle('on',i===act);});
    if(act>=0)q.setAttribute('aria-activedescendant','s'+act);else q.removeAttribute('aria-activedescendant');
  };
  var renderSugg=function(){
    var t=q.value.toLowerCase().trim(),all=window.TKH_TOOLS||[];
    act=-1;
    if(!t){box.hidden=true;items=[];q.setAttribute('aria-expanded','false');return;}
    var words=t.split(/\s+/);
    items=all.filter(function(x){var hay=(x.n+' '+x.k+' '+x.d).toLowerCase();return words.every(function(w){return hay.indexOf(w)>-1;});}).slice(0,8);
    box.innerHTML=items.length?items.map(function(x,i){return '<li role="option" id="s'+i+'"><a href="'+x.u+'"><span>'+esc(x.n)+'</span><small>'+(catName[x.c]||'')+'</small></a></li>';}).join(''):'<li class="none">No match. <a href="tools.html">Browse all tools</a></li>';
    box.hidden=false;q.setAttribute('aria-expanded','true');
  };
  q.addEventListener('input',renderSugg);
  q.addEventListener('focus',renderSugg);
  q.addEventListener('keydown',function(e){
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){
      if(!items.length)return;e.preventDefault();
      act=(act+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;mark();
    }else if(e.key==='Enter'){
      var li=$$('#sugg li')[act>=0?act:0];var a=li&&li.querySelector('a');
      if(a){e.preventDefault();a.click();}
    }else if(e.key==='Escape'){box.hidden=true;q.setAttribute('aria-expanded','false');}
  });
  document.addEventListener('click',function(e){if(!e.target.closest||!e.target.closest('.search')){box.hidden=true;q.setAttribute('aria-expanded','false');}});
}

/* All tools page: category chips and search */
var dir=$('#dirSearch');
if(dir){
  var cat='all';
  var applyDir=function(){
    var t=dir.value.toLowerCase().trim(),n=0;
    $$('#dirGrid .card').forEach(function(c){
      var okc=cat==='all'||c.getAttribute('data-cat')===cat;
      var okt=!t||(c.textContent+' '+(c.getAttribute('data-kw')||'')).toLowerCase().indexOf(t)>-1;
      c.hidden=!(okc&&okt);if(okc&&okt)n++;
    });
    $('#dirNone').hidden=n>0;$('#dirCount').textContent=n+(n===1?' tool':' tools');
  };
  $$('.chip').forEach(function(ch){ch.addEventListener('click',function(){
    cat=ch.getAttribute('data-cat');
    $$('.chip').forEach(function(x){var on=x===ch;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on?'true':'false');});
    applyDir();
  });});
  var qm=/[?&]q=([^&]*)/.exec(location.search||'');if(qm){try{dir.value=decodeURIComponent(qm[1].replace(/\+/g,' '));}catch(e){}}
  dir.addEventListener('input',applyDir);
  var h=(location.hash||'').replace('#','');var pre=/^[a-z]+$/.test(h)&&document.querySelector('.chip[data-cat="'+h+'"]');
  if(pre)pre.click();else applyDir();
}

/* Contact form (opens the visitor's email app) */
var cf=$('#contactForm');
if(cf){cf.addEventListener('submit',function(e){
  e.preventDefault();
  var subj=$('#c_subject').value||'Message from the website';
  var body='Name: '+$('#c_name').value+'\nEmail: '+$('#c_email').value+'\n\n'+$('#c_msg').value;
  location.href='mailto:'+C.EMAIL+'?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(body);
});}

/* Settings page */
function showConsent(){
  var el=$('#consentStatus');if(!el)return;var v=read(KEY);
  el.textContent=v==='yes'?'You accepted cookies.':v==='no'?'You declined personalised ads.':'You have not made a choice yet.';
}
var sf=$('#settingsForm');
if(sf){
  var p={};try{p=JSON.parse(read(PKEY)||'{}');}catch(e){}
  ['name','addr','gstin','cur','notes'].forEach(function(k){var el=$('#p_'+k);if(el&&p[k])el.value=p[k];});
  sf.addEventListener('submit',function(e){
    e.preventDefault();var o={};
    ['name','addr','gstin','cur','notes'].forEach(function(k){o[k]=$('#p_'+k).value.trim();});
    store(PKEY,JSON.stringify(o));$('#saved').textContent='Saved on this device.';
  });
  $('#clearData').addEventListener('click',function(){
    if(confirm('Remove everything this site has saved on this device?')){store(PKEY,null);store(KEY,null);sf.reset();$('#saved').textContent='Saved details removed.';showConsent();}
  });
}
$$('[data-consent]').forEach(function(b){b.addEventListener('click',function(){
  var c=b.getAttribute('data-consent');store(KEY,c==='reset'?null:c);showConsent();
  var n=$('#consentNote');if(n)n.textContent='Reload the page for your choice to take effect.';
});});
showConsent();

/* Top loading bar */
var tb=document.createElement('div');tb.className='topbar noprint';tb.setAttribute('aria-hidden','true');document.body.appendChild(tb);
tb.style.width='40%';
function doneBar(){tb.style.width='100%';setTimeout(function(){tb.style.opacity='0';},250);}
if(document.readyState==='complete')doneBar();else window.addEventListener('load',doneBar);
document.addEventListener('click',function(e){
  var a=e.target.closest&&e.target.closest('a[href]');
  if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||a.target==='_blank')return;
  var h=a.getAttribute('href')||'';
  if(/^(https?:|mailto:|#)/.test(h))return;
  tb.style.opacity='1';tb.style.width='75%';
});
window.addEventListener('pageshow',function(e){if(e.persisted)doneBar();});

/* Dialogs, free-use limit and pricing popup */
var LIMIT=parseInt(C.FREE_LIMIT,10)||3,lastFocus=null;
function waitlistHref(){return 'mailto:'+C.EMAIL+'?subject='+encodeURIComponent('Pro waitlist')+'&body='+encodeURIComponent('Please add me to the Pro waitlist.');}
function closeDialog(){var m=document.getElementById('tkhModal');if(m){m.remove();if(lastFocus&&lastFocus.focus)lastFocus.focus();}}
function openDialog(title,bodyHtml){
  closeDialog();lastFocus=document.activeElement;
  var back=document.createElement('div');back.className='modal-back noprint';back.id='tkhModal';
  back.innerHTML='<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mTitle"><button type="button" class="mclose" aria-label="Close">&times;</button><h2 id="mTitle"></h2>'+bodyHtml+'</div>';
  back.querySelector('#mTitle').textContent=title;
  document.body.appendChild(back);
  Array.prototype.forEach.call(back.querySelectorAll('[data-waitlist]'),function(a){a.href=waitlistHref();});
  back.querySelector('.mclose').focus();
  back.addEventListener('click',function(e){
    var t=e.target;
    if(t===back||(t.closest&&t.closest('.mclose'))||(t.hasAttribute&&t.hasAttribute('data-close')))closeDialog();
  });
  back.addEventListener('keydown',function(e){
    if(e.key==='Escape'){closeDialog();return;}
    if(e.key==='Tab'){
      var f=back.querySelectorAll('button,a[href]'),first=f[0],last=f[f.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
}
function monthKey(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1);}
function usage(){var u={};try{u=JSON.parse(read('tkh_usage')||'{}');}catch(e){}if(u.m!==monthKey())u={m:monthKey(),n:0};return u;}
function isPro(){return read('tkh_plan')==='pro';}
function refreshUsage(){
  $$('[data-usage]').forEach(function(el){
    if(isPro()){el.textContent='Pro plan: unlimited invoices.';return;}
    el.textContent=Math.max(0,LIMIT-usage().n)+' of '+LIMIT+' free invoices left this month.';
  });
}
function limitDialog(){
  openDialog('You have used your free invoices','<p>The free plan includes '+LIMIT+' invoices a month. Your count starts again next month, or you can join the waitlist for Pro to get unlimited invoices.</p><div class="row2"><a class="btn btn-primary" href="pro.html">See the Pro plan</a><button type="button" class="btn btn-ghost" data-close>Close</button></div>');
}
window.TKH={limit:LIMIT,usage:usage,useFree:function(){
  if(isPro())return true;
  var u=usage();if(u.n>=LIMIT){limitDialog();return false;}
  u.n++;store('tkh_usage',JSON.stringify(u));refreshUsage();return true;
}};
refreshUsage();
function promo(){
  if(document.body.hasAttribute('data-nopromo')||isPro())return;
  var t=parseInt(read('tkh_promo')||'0',10);if(t&&Date.now()-t<3*86400000)return;
  setTimeout(function(){
    if(document.querySelector('.consent')||document.getElementById('tkhModal'))return;
    store('tkh_promo',String(Date.now()));
    openDialog('ToolKit Hub Pro is coming','<p>The tools stay free. Pro is for people who use them every week.</p><ul><li>Unlimited invoices (free plan: '+LIMIT+' a month)</li><li>No watermark and a custom logo</li><li>Saved invoice history</li></ul><div class="mprice"><span class="pill">$10 a month</span><span class="pill">&#8377;299 a month in India</span></div><div class="row2"><a class="btn btn-primary" data-waitlist href="#">Join the waitlist</a><button type="button" class="btn btn-ghost" data-close>No thanks</button></div>');
  },6000);
}
promo();

/* Show "Account" instead of "Log in" when a sign-in session exists */
var nl=$('#navLogin');
if(nl){try{for(var i=0;i<localStorage.length;i++){if(/^sb-.*-auth-token$/.test(localStorage.key(i)||'')){nl.textContent='Account';break;}}}catch(e){}}

/* Right-side menu */
var mb=$('#menuBtn'),dr=$('#drawer'),dbk=$('#drawerBack');
if(mb&&dr&&dbk){
  var dLast=null;
  var setMenu=function(open){
    dr.classList.toggle('open',open);dbk.classList.toggle('open',open);
    mb.setAttribute('aria-expanded',open?'true':'false');dr.setAttribute('aria-hidden',open?'false':'true');
    document.body.style.overflow=open?'hidden':'';
    if(open){dLast=document.activeElement;dr.querySelector('.drawer-close').focus();}
    else if(dLast&&dLast.focus){dLast.focus();}
  };
  mb.addEventListener('click',function(){setMenu(!dr.classList.contains('open'));});
  dbk.addEventListener('click',function(){setMenu(false);});
  dr.querySelector('.drawer-close').addEventListener('click',function(){setMenu(false);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&dr.classList.contains('open'))setMenu(false);});
  dr.addEventListener('keydown',function(e){
    if(e.key!=='Tab')return;
    var f=Array.prototype.filter.call(dr.querySelectorAll('button,a[href],input'),function(x){return !x.hidden&&x.offsetParent!==null;});
    var first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  });
  dr.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(a)setMenu(false);});
  var norm=function(x){x=(x||'').split('#')[0].split('?')[0].split('/').pop().replace(/\.html$/,'');return x||'index';};
  var here=norm(location.pathname);
  $$('#drawer a').forEach(function(a){if(norm(a.getAttribute('href'))===here&&a.getAttribute('href').indexOf('#')<0)a.setAttribute('aria-current','page');});
  var ds=$('#drawerSearch');
  if(ds){ds.addEventListener('input',function(){
    var t=ds.value.toLowerCase().trim(),h=null,any=false;
    Array.prototype.forEach.call(dr.querySelector('.drawer-body').children,function(el){
      if(el.tagName==='H3'){if(h)h.hidden=!any;h=el;any=false;}
      else if(el.tagName==='A'){var m=!t||el.textContent.toLowerCase().indexOf(t)>-1;el.hidden=!m;if(m)any=true;}
    });
    if(h)h.hidden=!any;
  });}
  var dl=$('#dLogin');
  if(dl&&nl&&nl.textContent==='Account')dl.textContent='Your account';
}

/* Light / dark / auto theme */
var rootEl=document.documentElement;
function themePref(){var t=read('tkh_theme');return (t==='dark'||t==='auto')?t:'light';}
function applyTheme(){
  var t=themePref();
  if(t==='auto')t=(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light';
  rootEl.setAttribute('data-theme',t);
}
function markTheme(){
  var pref=themePref();
  $$('[data-theme-set]').forEach(function(b){var on=b.getAttribute('data-theme-set')===pref;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false');});
}
$$('[data-theme-set]').forEach(function(b){b.addEventListener('click',function(){
  var v=b.getAttribute('data-theme-set');store('tkh_theme',v);applyTheme();markTheme();
});});
if(window.matchMedia){
  var mq=matchMedia('(prefers-color-scheme: dark)'),onMq=function(){if(themePref()==='auto')applyTheme();};
  if(mq.addEventListener)mq.addEventListener('change',onMq);else if(mq.addListener)mq.addListener(onMq);
}
applyTheme();markTheme();

/* Amount hints, for example 30,00,000 (30 lakh) */
function hintText(n){
  if(!isFinite(n)||n<=0)return '';
  var w='',t=function(v){return v.toFixed(2).replace(/\.?0+$/,'');};
  if(n>=1e7)w=t(n/1e7)+' crore';else if(n>=1e5)w=t(n/1e5)+' lakh';else if(n>=1e3)w=t(n/1e3)+' thousand';
  return '\u20b9'+Math.round(n).toLocaleString('en-IN')+(w?' ('+w+')':'');
}
$$('input[data-hint]').forEach(function(inp){
  var h=document.createElement('small');h.className='hint';inp.insertAdjacentElement('afterend',h);
  var r=document.getElementById(inp.id+'R');
  var upd=function(e){h.textContent=hintText(parseFloat(e&&r&&e.target===r?r.value:inp.value));};
  inp.addEventListener('input',upd);if(r)r.addEventListener('input',upd);upd();
});

/* Forms that only calculate (no sending) */
$$('form[data-nosubmit]').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();});});

/* "Get a free demo" buttons: WhatsApp if a number is set, otherwise email */
$$('[data-demo-link]').forEach(function(a){
  var msg='Hi, I would like a free demo of the calculator widget with my logo and colours.',w=String(C.WHATSAPP||'').replace(/\D/g,'');
  if(w.length>=8){a.href='https://wa.me/'+w+'?text='+encodeURIComponent(msg);a.target='_blank';a.rel='noopener noreferrer';}
  else a.href='mailto:'+C.EMAIL+'?subject='+encodeURIComponent('Free demo request')+'&body='+encodeURIComponent(msg);
});

/* Helpers for account, billing and support pages */
function httpsOr(v){try{var u=new URL(v);return u.protocol==='https:'?u.href:'';}catch(e){return '';}}
$$('[data-mail]').forEach(function(a){a.href='mailto:'+C.EMAIL+'?subject='+encodeURIComponent(a.getAttribute('data-subject')||'Message from the website');});
$$('[data-wa]').forEach(function(a){var w=String(C.WHATSAPP||'').replace(/\D/g,'');if(w.length>=8){a.href='https://wa.me/'+w;a.target='_blank';a.rel='noopener noreferrer';}else a.hidden=true;});
var chkM=httpsOr(C.CHECKOUT_MONTHLY),chkY=httpsOr(C.CHECKOUT_YEARLY);
$$('[data-checkout]').forEach(function(a){var u=a.getAttribute('data-checkout')==='yearly'?chkY:chkM;if(u){a.href=u;a.target='_blank';a.rel='noopener noreferrer';a.textContent=a.getAttribute('data-live-text')||a.textContent;}else a.href=waitlistHref();});
$$('[data-needs-checkout]').forEach(function(n){n.hidden=!!(chkM||chkY);});
var portalUrl=httpsOr(C.BILLING_PORTAL_URL);
$$('[data-portal]').forEach(function(a){if(portalUrl){a.href=portalUrl;a.target='_blank';a.rel='noopener noreferrer';}else a.href='mailto:'+C.EMAIL+'?subject='+encodeURIComponent(a.getAttribute('data-subject')||'Billing request');});
$$('[data-plan]').forEach(function(e){e.textContent=isPro()?'Pro':'Free';});
$$('[data-usage-text]').forEach(function(e){e.textContent=isPro()?'Unlimited invoices.':'Invoices saved this month: '+usage().n+' of '+LIMIT+'.';});
var hs=$('#helpSearch');
if(hs){hs.addEventListener('input',function(){
  var t=hs.value.toLowerCase().trim(),n=0;
  $$('#helpList details').forEach(function(d){var m=!t||d.textContent.toLowerCase().indexOf(t)>-1;d.hidden=!m;if(m)n++;});
  $$('#helpList h2').forEach(function(h){var s=h.nextElementSibling,any=false;while(s&&s.tagName==='DETAILS'){if(!s.hidden)any=true;s=s.nextElementSibling;}h.hidden=!any;});
  var none=$('#helpNone');if(none)none.hidden=n>0;
});}
var ob=$('#obForm');
if(ob){
  var obShow=function(){ob.hidden=true;$('#obDone').hidden=false;store('tkh_onboarded','1');};
  ob.addEventListener('submit',function(e){
    e.preventDefault();var p={};try{p=JSON.parse(read(PKEY)||'{}');}catch(x){}
    p.name=$('#ob_name').value.trim();p.addr=$('#ob_addr').value.trim();p.gstin=$('#ob_gstin').value.trim();
    var c=$('#ob_cur').value;p.cur=['INR','USD','EUR','GBP'].indexOf(c)>-1?c:'INR';
    store(PKEY,JSON.stringify(p));obShow();
  });
  $('#obSkip').addEventListener('click',function(e){e.preventDefault();obShow();});
}
})();
