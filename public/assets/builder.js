(function(){
'use strict';
var $=function(id){return document.getElementById(id);};
var origin=location.origin;
function v(id){var e=$('b_'+id);return e?(e.value||'').trim():'';}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function params(forPreview){
  var p=new URLSearchParams(),calc=v('calc')||'emi';p.set('calc',calc);
  if(calc==='emi'&&v('type'))p.set('type',v('type'));
  ['name','logo','wa','phone','lead','key'].forEach(function(k){if(v(k))p.set(k,v(k));});
  var col=v('color').replace('#','');if(col)p.set('color',col);
  if(!$('b_powered').checked)p.set('powered','off');
  if(forPreview&&!v('wa')&&!v('phone')&&!v('lead'))p.set('demo','1');
  return p;
}
function update(){
  $('typeRow').hidden=v('calc')!=='emi';
  var p=params(false),pv=params(true);
  $('b_preview').src='widget/index.html?'+pv.toString();
  var attrs={'data-toolkit-calc':v('calc')||'emi'};
  if((v('calc')||'emi')==='emi'&&v('type'))attrs['data-type']=v('type');
  var map={name:'data-name',logo:'data-logo',wa:'data-wa',phone:'data-phone',lead:'data-lead',key:'data-key'};
  Object.keys(map).forEach(function(k){if(v(k))attrs[map[k]]=v(k);});
  if(v('color'))attrs['data-color']=v('color').replace('#','');
  if(!$('b_powered').checked)attrs['data-powered']='off';
  var a=Object.keys(attrs).map(function(k){return k+'="'+esc(attrs[k])+'"';}).join(' ');
  $('codeScript').value='<div '+a+'></div>\n<script src="'+origin+'/widget/embed.js" async></script>';
  $('codeIframe').value='<iframe src="'+esc(origin+'/widget/index.html?'+p.toString())+'" title="Calculator" style="width:100%;height:700px;border:0" loading="lazy"></iframe>';
  $('shareLink').value=origin+'/widget/index.html?'+pv.toString();
}
document.addEventListener('input',function(e){if(e.target.id&&e.target.id.indexOf('b_')===0)update();});
document.addEventListener('change',function(e){if(e.target.id&&e.target.id.indexOf('b_')===0)update();});
document.querySelectorAll('[data-copy]').forEach(function(b){b.addEventListener('click',function(){
  var t=$(b.getAttribute('data-copy'));t.select();
  var ok=function(){var o=b.textContent;b.textContent='Copied';setTimeout(function(){b.textContent=o;},1500);};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t.value).then(ok,function(){document.execCommand&&document.execCommand('copy');ok();});
  else{try{document.execCommand('copy');ok();}catch(e){}}
});});
update();
})();
