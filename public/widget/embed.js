(function(){
'use strict';
var s=document.currentScript;if(!s||!s.src)return;
var u=new URL(s.src),origin=u.origin,base=u.href.replace(/embed\.js(\?.*)?$/,'index.html');
var MAP={calc:'toolkitCalc',type:'type',name:'name',color:'color',logo:'logo',wa:'wa',phone:'phone',lead:'lead',key:'key',powered:'powered',title:'title',demo:'demo'};
document.querySelectorAll('[data-toolkit-calc]').forEach(function(host){
  if(host.getAttribute('data-ready'))return;
  var q=new URLSearchParams();
  for(var k in MAP){var v=host.dataset[MAP[k]];if(v)q.set(k,v);}
  var f=document.createElement('iframe');
  f.src=base+'?'+q.toString();f.title=(host.dataset.name?host.dataset.name+' ':'')+'calculator';f.loading='lazy';
  f.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox');
  f.style.cssText='width:100%;border:0;display:block;min-height:440px;';
  host.appendChild(f);host.setAttribute('data-ready','1');
});
window.addEventListener('message',function(e){
  if(e.origin!==origin)return;var d=e.data;
  if(!d||typeof d.tkhWidgetHeight!=='number')return;
  document.querySelectorAll('[data-toolkit-calc] iframe').forEach(function(f){if(f.contentWindow===e.source)f.style.height=Math.min(Math.max(d.tkhWidgetHeight,300),1600)+'px';});
});
})();
