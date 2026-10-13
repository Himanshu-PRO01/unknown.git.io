(function(){
'use strict';
var C=window.TKH_CONFIG||{};
var page=document.body.getAttribute('data-auth')||'login';
function $(s){return document.querySelector(s);}
var msgEl=$('#authMsg');
function msg(t,bad){if(!msgEl)return;msgEl.textContent=t;msgEl.style.color=bad?'#9A3B2E':'';}
var configured=!!(C.SUPABASE_URL&&C.SUPABASE_ANON_KEY);
var setup=$('#authSetup');if(setup&&!configured)setup.hidden=false;
var sb=null,queue=[];
function onReady(fn){if(sb)fn();else queue.push(fn);}
function need(){if(sb)return true;msg('Sign-in is not connected yet.',true);return false;}
function link(p){var u=new URL(p,location.href);return u.origin+u.pathname;}
function hashErr(){try{return new URLSearchParams(location.hash.replace(/^#/,'')).get('error_description')||'';}catch(e){return '';}}
if(configured){
  var s=document.createElement('script');
  s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';
  s.integrity='sha384-0w2KAL2YHP6wKOkUDzkCDGgVvfmHnj02DHeQ6XcHOgTfFsGyonKOpShMH1x6nk9o';s.crossOrigin='anonymous';
  s.onload=function(){sb=window.supabase.createClient(C.SUPABASE_URL,C.SUPABASE_ANON_KEY);queue.forEach(function(f){f();});queue=[];};
  s.onerror=function(){msg('Could not load the sign-in service. Check your connection and try again.',true);};
  document.head.appendChild(s);
}

/* ---------- log in and register ---------- */
if(page==='login'||page==='register'){
  var LABEL={google:'Google',azure:'Microsoft',apple:'Apple',facebook:'Facebook',linkedin_oidc:'LinkedIn',discord:'Discord',twitter:'X'};
  var oauth=$('#oauth'),provs=C.AUTH_PROVIDERS||[],mode=page==='register'?'signup':'login';
  provs.forEach(function(p){var b=document.createElement('button');b.type='button';b.className='btn btn-ghost';b.setAttribute('data-provider',p);b.textContent='Continue with '+(LABEL[p]||p);oauth.appendChild(b);});
  if(!provs.length&&$('#orLine'))$('#orLine').hidden=true;
  onReady(function(){sb.auth.getSession().then(function(r){if(r.data&&r.data.session)location.replace('account.html');});});
  oauth.addEventListener('click',function(e){
    var p=e.target.getAttribute&&e.target.getAttribute('data-provider');if(!p||!need())return;
    msg('Opening '+(LABEL[p]||p)+'...');
    sb.auth.signInWithOAuth({provider:p,options:{redirectTo:link('account.html')}}).then(function(r){if(r.error)msg(r.error.message,true);});
  });
  document.querySelectorAll('#emailForm .segbtn').forEach(function(b){b.addEventListener('click',function(){
    mode=b.getAttribute('data-mode');
    document.querySelectorAll('#emailForm .segbtn').forEach(function(x){x.classList.toggle('on',x===b);});
    $('#a_submit').textContent=mode==='login'?'Log in':'Create account';
    $('#a_pass').setAttribute('autocomplete',mode==='login'?'current-password':'new-password');
  });});
  $('#emailForm').addEventListener('submit',function(e){
    e.preventDefault();if(!need())return;
    var email=$('#a_email').value.trim(),pass=$('#a_pass').value;
    if(pass.length<8){msg('Use a password with at least 8 characters.',true);return;}
    msg('Please wait...');
    if(mode==='login'){
      sb.auth.signInWithPassword({email:email,password:pass}).then(function(r){if(r.error)msg(r.error.message,true);else location.href='account.html';});
    }else{
      sb.auth.signUp({email:email,password:pass,options:{emailRedirectTo:link('verify-email.html')}}).then(function(r){
        if(r.error){msg(r.error.message,true);return;}
        try{sessionStorage.setItem('tkh_pending_email',email);}catch(x){}
        location.href='verify-email.html';
      });
    }
  });
  $('#a_magic').addEventListener('click',function(){
    if(!need())return;var email=$('#a_email').value.trim();
    if(!email){msg('Enter your email first.',true);return;}
    sb.auth.signInWithOtp({email:email,options:{emailRedirectTo:link('account.html')}}).then(function(r){if(r.error)msg(r.error.message,true);else msg('We sent a login link to your email.');});
  });
}

/* ---------- forgot password ---------- */
if(page==='forgot'){
  $('#fpForm').addEventListener('submit',function(e){
    e.preventDefault();if(!need())return;var email=$('#fp_email').value.trim();msg('Please wait...');
    sb.auth.resetPasswordForEmail(email,{redirectTo:link('reset-password.html')}).then(function(r){
      if(r.error)msg(r.error.message,true);else msg('If an account exists for that email, we sent a link to reset your password.');
    });
  });
}

/* ---------- reset password ---------- */
if(page==='reset'){
  var recovering=/type=recovery/.test(location.hash);
  var showForm=function(){$('#rpWait').hidden=true;$('#rpBad').hidden=true;$('#rpForm').hidden=false;};
  var bad=function(){$('#rpWait').hidden=true;$('#rpBad').hidden=false;};
  if(!configured)$('#rpWait').hidden=true;
  onReady(function(){
    sb.auth.onAuthStateChange(function(evt){if(evt==='PASSWORD_RECOVERY')showForm();});
    setTimeout(function(){
      if(!$('#rpForm').hidden)return;
      sb.auth.getSession().then(function(r){if(r.data&&r.data.session&&recovering)showForm();else bad();});
    },1800);
  });
  $('#rpForm').addEventListener('submit',function(e){
    e.preventDefault();var a=$('#rp_pass').value,b=$('#rp_pass2').value;
    if(a.length<8){msg('Use a password with at least 8 characters.',true);return;}
    if(a!==b){msg('The two passwords do not match.',true);return;}
    sb.auth.updateUser({password:a}).then(function(r){
      if(r.error){msg(r.error.message,true);return;}
      $('#rpForm').hidden=true;$('#rpDone').hidden=false;msg('');
    });
  });
}

/* ---------- verify email ---------- */
if(page==='verify'){
  if(hashErr())msg('That link is invalid or has expired. Enter your email below to get a new one.',true);
  try{var pe=sessionStorage.getItem('tkh_pending_email');if(pe)$('#v_email').value=pe;}catch(x){}
  onReady(function(){sb.auth.getSession().then(function(r){var ss=r.data&&r.data.session;if(ss&&ss.user&&ss.user.email_confirmed_at){$('#vWait').hidden=true;$('#vOk').hidden=false;}});});
  $('#vForm').addEventListener('submit',function(e){
    e.preventDefault();if(!need())return;var email=$('#v_email').value.trim();msg('Please wait...');
    sb.auth.resend({type:'signup',email:email,options:{emailRedirectTo:link('verify-email.html')}}).then(function(r){
      if(r.error)msg(r.error.message,true);else msg('We sent a new link. Check your inbox and spam folder.');
    });
  });
}

/* ---------- account ---------- */
if(page==='account'){
  var out=$('#acctOut'),box=$('#acctBox');
  if(!configured)out.hidden=false;
  onReady(function(){
    sb.auth.getSession().then(function(r){
      var ss=r.data&&r.data.session;
      if(!ss){out.hidden=false;return;}
      var u=ss.user,prov=(u.app_metadata&&u.app_metadata.provider)||'email';
      $('#acctEmail').textContent=u.email||'your account';
      $('#acctProv').textContent=prov==='email'?'Email and password':prov.charAt(0).toUpperCase()+prov.slice(1);
      try{$('#acctSince').textContent=new Date(u.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});}catch(x){}
      if(prov==='email')$('#pwBox').hidden=false;
      box.hidden=false;
    });
  });
  var pf=$('#pwForm');
  if(pf)pf.addEventListener('submit',function(e){
    e.preventDefault();var a=$('#pw_new').value,b=$('#pw_new2').value;
    if(a.length<8){msg('Use a password with at least 8 characters.',true);return;}
    if(a!==b){msg('The two passwords do not match.',true);return;}
    sb.auth.updateUser({password:a}).then(function(r){if(r.error)msg(r.error.message,true);else{msg('Your password was updated.');pf.reset();}});
  });
  $('#logout').addEventListener('click',function(){if(sb)sb.auth.signOut().then(function(){location.href='login.html';});});
}
})();
