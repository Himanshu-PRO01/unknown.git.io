(function(){
'use strict';
var tool=document.body.getAttribute('data-tool');if(!tool)return;
var $=function(id){return document.getElementById(id);};
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var inr=function(n){return '\u20b9'+Math.round(n).toLocaleString('en-IN');};
var inr2=function(n){return '\u20b9'+n.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});};
var num=function(id){var v=parseFloat($(id).value);return isFinite(v)?v:0;};
var loaded=false,shown=0,raf=0,last=null;

/* Tax settings: update these each year (FY 2026-27 values; Budget 2026 kept the slabs unchanged) */
var TAX={
  cess:0.04,
  'new':{std:75000,rebateLimit:1200000,rebateMax:60000,marginal:true,slabs:[[400000,0],[800000,0.05],[1200000,0.10],[1600000,0.15],[2000000,0.20],[2400000,0.25],[Infinity,0.30]]},
  old:{std:50000,rebateLimit:500000,rebateMax:12500,marginal:false,slabs:[[250000,0],[500000,0.05],[1000000,0.20],[Infinity,0.30]]}
};

function setText(id,t){var el=$(id);if(el)el.textContent=t;}
function tween(to,fmt){
  var el=$('mval');if(!el)return;
  cancelAnimationFrame(raf);
  if(reduce||!loaded){shown=to;el.textContent=fmt(to);return;}
  var from=shown,t0=performance.now(),dur=450;
  (function step(t){var k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3);shown=from+(to-from)*e;el.textContent=fmt(shown);if(k<1)raf=requestAnimationFrame(step);})(t0);
}
function donut(p,center){var a=$('arc');if(!a||!loaded)return;a.setAttribute('stroke-dasharray',p.toFixed(1)+' '+(100-p).toFixed(1));setText('ipct',center);}
function showNum(main,fmt,d){last={main:main,fmt:fmt,d:d};tween(main,fmt);if(d)donut(d.p,d.c);}
function showText(t){last=null;setText('mval',t);}
function finish(){
  ['result','sched'].forEach(function(id){var el=$(id);if(el){el.classList.remove('is-loading');el.setAttribute('aria-busy','false');}});
  loaded=true;shown=0;
  requestAnimationFrame(function(){if(last&&last.fmt){tween(last.main,last.fmt);if(last.d)donut(last.d.p,last.d.c);}});
}

function runSip(){
  var P=num('amt'),r=num('rate'),y=num('yrs'),n=Math.round(y*12),i=r/1200;
  if(P<=0||n<=0){setText('mainLabel','Estimated value');showNum(0,inr,{p:0,c:'0%'});setText('v1',inr(0));setText('v2',inr(0));setText('v3',inr(0));$('rows').innerHTML='';return;}
  var fv=function(m){return i===0?P*m:P*((Math.pow(1+i,m)-1)/i)*(1+i);};
  var total=fv(n),inv=P*n,gain=total-inv,rows='';
  setText('mainLabel','Estimated value after '+(y%1?y.toFixed(1):y)+(y===1?' year':' years'));
  showNum(total,inr,{p:inv/total*100,c:Math.round(gain/total*100)+'%'});
  setText('v1',inr(inv));setText('v2',inr(gain));setText('v3',inr(total));
  for(var k=1;k<=Math.ceil(n/12);k++){var m=Math.min(k*12,n);rows+='<tr><td>Year '+k+'</td><td class="n">'+inr(P*m)+'</td><td class="n">'+inr(fv(m))+'</td></tr>';}
  $('rows').innerHTML=rows;
}

function runGst(){
  var a=num('amt'),s=$('rate').value,custom=s==='custom';
  $('customWrap').hidden=!custom;
  var rate=custom?num('rateC'):parseFloat(s),mode=$('mode').value,base,gst,total;
  if(mode==='add'){base=a;gst=a*rate/100;total=base+gst;}else{total=a;base=a/(1+rate/100);gst=total-base;}
  setText('mainLabel',mode==='add'?'Total amount including GST':'Amount before GST');
  showNum(mode==='add'?total:base,inr2);
  setText('v1',inr2(base));setText('v2',inr2(gst));setText('v3',inr2(gst/2));setText('v4',inr2(gst/2));setText('v5',inr2(total));
}

function slabs(taxable,list){
  var prev=0,tax=0,rows=[];
  for(var k=0;k<list.length;k++){
    var up=list[k][0],rate=list[k][1],part=Math.max(0,Math.min(taxable,up)-prev);
    rows.push({from:prev,to:up,rate:rate,part:part,tax:part*rate});tax+=part*rate;prev=up;
  }
  return {tax:tax,rows:rows};
}
function runTax(){
  var inc=num('inc'),isNew=$('regime').value==='new',cfg=isNew?TAX['new']:TAX.old;
  $('dedWrap').hidden=isNew;
  var std=$('sal').checked?cfg.std:0,ded=isNew?0:num('ded');
  var taxable=Math.max(0,inc-std-ded),r=slabs(taxable,cfg.slabs),tax=r.tax,rebate=0;
  if(taxable<=cfg.rebateLimit){rebate=Math.min(tax,cfg.rebateMax);}
  else if(cfg.marginal){var excess=taxable-cfg.rebateLimit;if(tax>excess)rebate=tax-excess;}
  var after=tax-rebate,cess=after*TAX.cess,total=after+cess,net=Math.max(0,inc-total);
  setText('mainLabel','Estimated tax for FY 2026-27 (with 4% cess)');
  showNum(total,inr);
  setText('v1',inr(taxable));setText('v2',inr(tax));setText('v3',rebate>0?'-'+inr(rebate):inr(0));setText('v4',inr(cess));
  setText('v5',inc>0?(total/inc*100).toFixed(1)+'%':'0%');setText('v6',inr(net));setText('v7',inr(net/12));
  var html='';
  r.rows.forEach(function(x){
    html+='<tr><td>'+inr(x.from)+(x.to===Infinity?' and above':' to '+inr(x.to))+'</td><td class="n">'+Math.round(x.rate*100)+'%</td><td class="n">'+inr(x.part)+'</td><td class="n">'+inr(x.tax)+'</td></tr>';
  });
  $('rows').innerHTML=html;
}

function runAge(){
  var d=$('dob').value,a=$('asof').value;
  setText('mainLabel','Your age');
  if(!d||!a){showText('Enter a date of birth');['v1','v2','v3','v4'].forEach(function(id){setText(id,'-');});return;}
  var b=new Date(d+'T00:00:00'),t=new Date(a+'T00:00:00');
  if(t<b){showText('Check the dates');['v1','v2','v3','v4'].forEach(function(id){setText(id,'-');});return;}
  var y=t.getFullYear()-b.getFullYear(),m=t.getMonth()-b.getMonth(),dd=t.getDate()-b.getDate();
  if(dd<0){m--;dd+=new Date(t.getFullYear(),t.getMonth(),0).getDate();}
  if(m<0){y--;m+=12;}
  var days=Math.round((t-b)/864e5);
  showText(y+' years, '+m+' months, '+dd+' days');
  setText('v1',(y*12+m).toLocaleString('en-IN')+' months');setText('v2',Math.floor(days/7).toLocaleString('en-IN')+' weeks');setText('v3',days.toLocaleString('en-IN')+' days');
  var nb=new Date(t.getFullYear(),b.getMonth(),b.getDate());if(nb<t)nb=new Date(t.getFullYear()+1,b.getMonth(),b.getDate());
  var left=Math.round((nb-t)/864e5);
  setText('v4',left===0?'Today':nb.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})+' ('+left+' days)');
}

function runPct(){
  var f=function(n){return Number(n.toFixed(4)).toLocaleString('en-IN',{maximumFractionDigits:4});};
  setText('p1r',f(num('p1x')/100*num('p1y')));
  setText('p2r',num('p2y')===0?'-':f(num('p2x')/num('p2y')*100)+'%');
  var c=num('p3x'),d=num('p3y');
  setText('p3r',c===0?'-':f((d-c)/Math.abs(c)*100)+'%'+(d>c?' increase':d<c?' decrease':''));
  var e=num('p4x'),g=num('p4y');
  setText('p4a',f(e*(1+g/100)));setText('p4b',f(e*(1-g/100)));
}

function runPpf(){
  var P=num('amt'),r=num('rate')/100,y=Math.round(num('yrs')),note=[];
  if(P>150000){P=150000;note.push('PPF allows at most 1,50,000 a year, so that limit is used.');}
  else if(P>0&&P<500){note.push('PPF needs at least 500 a year.');}
  if(y>0&&y<15)note.push('PPF has a 15-year lock-in. The result shows the balance for the years you entered.');
  setText('note',note.join(' '));setText('cLabel','Interest');
  setText('mainLabel','Maturity value after '+y+(y===1?' year':' years'));
  if(P<=0||y<=0){showNum(0,inr,{p:0,c:'0%'});setText('v1',inr(0));setText('v2',inr(0));setText('v3',inr(0));$('rows').innerHTML='';return;}
  var bal=0,rows='';
  for(var k=1;k<=y;k++){bal=(bal+P)*(1+r);rows+='<tr><td>Year '+k+'</td><td class="n">'+inr(P*k)+'</td><td class="n">'+inr(bal)+'</td></tr>';}
  var inv=P*y,gain=bal-inv;
  showNum(bal,inr,{p:inv/bal*100,c:Math.round(gain/bal*100)+'%'});
  setText('v1',inr(inv));setText('v2',inr(gain));setText('v3',inr(bal));$('rows').innerHTML=rows;
}
function runFd(){
  var P=num('amt'),r=num('rate')/100,t=num('yrs'),m=parseInt($('comp').value,10)||4;
  setText('cLabel','Interest');
  setText('mainLabel','Maturity amount after '+(t%1?t.toFixed(1):t)+(t===1?' year':' years'));
  if(P<=0||t<=0){showNum(0,inr,{p:0,c:'0%'});setText('v1',inr(0));setText('v2',inr(0));setText('v3',inr(0));$('rows').innerHTML='';return;}
  var bal=function(x){return P*Math.pow(1+r/m,m*x);};
  var total=bal(t),gain=total-P,rows='',prev=P;
  for(var k=1;k<=Math.ceil(t);k++){var x=Math.min(k,t),b=bal(x);rows+='<tr><td>Year '+k+'</td><td class="n">'+inr(b-prev)+'</td><td class="n">'+inr(b)+'</td></tr>';prev=b;}
  showNum(total,inr,{p:P/total*100,c:Math.round(gain/total*100)+'%'});
  setText('v1',inr(P));setText('v2',inr(gain));setText('v3',inr(total));$('rows').innerHTML=rows;
}

var run={ppf:runPpf,fd:runFd,sip:runSip,gst:runGst,tax:runTax,age:runAge,percentage:runPct}[tool];
if(!run)return;
if(tool==='age'){var n=new Date(),p=function(x){return (x<10?'0':'')+x;};$('asof').value=n.getFullYear()+'-'+p(n.getMonth()+1)+'-'+p(n.getDate());}
var form=$('f');
form.addEventListener('input',function(e){
  var t=e.target,r=t.getAttribute('data-r'),nn=t.getAttribute('data-n');
  if(r)$(r).value=t.value;else if(nn)$(nn).value=t.value;
  run();
});
form.addEventListener('change',run);
run();
setTimeout(finish,reduce?0:400);
})();
