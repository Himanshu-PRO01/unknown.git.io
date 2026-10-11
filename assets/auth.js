(function(){
var C=window.TKH_CONFIG||{};
function $(s){return document.querySelector(s)}
var msgEl=$('#authMsg');
function msg(t,bad){msgEl.textContent=t;msgEl.style.color=bad?'#9A3B2E':'';}
var LABEL={google:'Google',azure:'Microsoft',apple:'Apple',facebook:'Facebook',linkedin_oidc:'LinkedIn',discord:'Discord',twitter:'X'};
var providers=C.AUTH_PROVIDERS||[];
var oauth=$('#oauth');
providers.forEach(function(p){
  var b=document.createElement('button');b.type='button';b.className='btn btn-ghost';
  b.setAttribute('data-provider',p);b.textContent='Continue with '+(LABEL[p]||p);oauth.appendChild(b);
});
if(!providers.length)$('#orLine').hidden=true;
var sb=null,mode='login';
if(!(C.SUPABASE_URL&&C.SUPABASE_ANON_KEY))$('#authSetup').hidden=false;
function need(){if(sb)return true;msg('Sign-in is not connected yet.',true);return false;}
function back(){return location.origin+location.pathname;}
function showAcct(user){
  $('#guest').hidden=true;$('#acct').hidden=false;$('#acctEmail').textContent=user.email||'your account';
  var u=window.TKH?window.TKH.usage():{n:0},lim=window.TKH?window.TKH.limit:3;
  $('#acctUsage').textContent='Invoices saved this month: '+u.n+' of '+lim;
}
if(C.SUPABASE_URL&&C.SUPABASE_ANON_KEY){
  var s=document.createElement('script');
  s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';
  s.onload=function(){
    sb=window.supabase.createClient(C.SUPABASE_URL,C.SUPABASE_ANON_KEY);
    sb.auth.getSession().then(function(r){var ss=r.data&&r.data.session;if(ss)showAcct(ss.user);});
  };
  s.onerror=function(){msg('Could not load the sign-in service. Check your connection and try again.',true);};
  document.head.appendChild(s);
}
oauth.addEventListener('click',function(e){
  var p=e.target.getAttribute&&e.target.getAttribute('data-provider');if(!p||!need())return;
  msg('Opening '+(LABEL[p]||p)+'...');
  sb.auth.signInWithOAuth({provider:p,options:{redirectTo:back()}}).then(function(r){if(r.error)msg(r.error.message,true);});
});
document.querySelectorAll('.segbtn').forEach(function(b){b.addEventListener('click',function(){
  mode=b.getAttribute('data-mode');
  document.querySelectorAll('.segbtn').forEach(function(x){x.classList.toggle('on',x===b);});
  $('#a_submit').textContent=mode==='login'?'Log in':'Create account';
  $('#a_pass').setAttribute('autocomplete',mode==='login'?'current-password':'new-password');
});});
$('#emailForm').addEventListener('submit',function(e){
  e.preventDefault();if(!need())return;
  var email=$('#a_email').value.trim(),pass=$('#a_pass').value;
  if(pass.length<6){msg('Use a password with at least 6 characters.',true);return;}
  msg('Please wait...');
  if(mode==='login'){
    sb.auth.signInWithPassword({email:email,password:pass}).then(function(r){
      if(r.error)msg(r.error.message,true);else showAcct(r.data.user);
    });
  }else{
    sb.auth.signUp({email:email,password:pass,options:{emailRedirectTo:back()}}).then(function(r){
      if(r.error)msg(r.error.message,true);else msg('Check your email and open the link to confirm your account.');
    });
  }
});
$('#a_magic').addEventListener('click',function(){
  if(!need())return;var email=$('#a_email').value.trim();
  if(!email){msg('Enter your email first.',true);return;}
  sb.auth.signInWithOtp({email:email,options:{emailRedirectTo:back()}}).then(function(r){
    if(r.error)msg(r.error.message,true);else msg('We sent a login link to your email.');
  });
});
$('#logout').addEventListener('click',function(){
  if(!sb)return;sb.auth.signOut().then(function(){location.reload();});
});
})();
