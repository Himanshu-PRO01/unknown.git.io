(function(){
const $=id=>document.getElementById(id);
const MAXY=parseFloat(document.body.dataset.tmax)||30;
const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt=n=>'\u20b9'+Math.round(n).toLocaleString('en-IN');
let shown=0,raf=0,loaded=false,last={emi:0,p:0,i:0};
function tween(to){
  cancelAnimationFrame(raf);
  if(reduce||!loaded){shown=to;$('emi').textContent=fmt(to);return;}
  const from=shown,t0=performance.now(),dur=450;
  (function step(t){const k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3);shown=from+(to-from)*e;$('emi').textContent=fmt(shown);if(k<1)raf=requestAnimationFrame(step);})(t0);
}
function donut(){
  if(!loaded)return;
  $('arc').setAttribute('stroke-dasharray',last.p.toFixed(1)+' '+(100-last.p).toFixed(1));
  $('ipct').textContent=Math.round(last.i)+'%';
}
function calc(){
  const P=parseFloat($('amt').value)||0, rate=parseFloat($('rate').value)||0;
  const n=Math.round((parseFloat($('ten').value)||0)*($('unit').value==='y'?12:1));
  const r=rate/1200;
  if(P<=0||n<=0){
    last={emi:0,p:0,i:0};tween(0);$('pp').textContent=fmt(0);$('ti').textContent=fmt(0);$('tp').textContent=fmt(0);$('rows').innerHTML='';donut();return;
  }
  const emi=r===0?P/n:P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);
  const total=emi*n, interest=total-P;
  last={emi:emi,p:P/total*100,i:interest/total*100};
  tween(emi);$('pp').textContent=fmt(P);$('ti').textContent=fmt(interest);$('tp').textContent=fmt(total);
  donut();
  let bal=P,py=0,iy=0,y=1,html='';
  for(let m=1;m<=n;m++){
    const i=bal*r,p=emi-i;bal-=p;iy+=i;py+=p;
    if(m%12===0||m===n){html+='<tr><td>Year '+y+'</td><td class="n">'+fmt(py)+'</td><td class="n">'+fmt(iy)+'</td><td class="n">'+fmt(Math.max(0,bal))+'</td></tr>';y++;py=0;iy=0;}
  }
  $('rows').innerHTML=html;
}
[['amt','amtR'],['rate','rateR'],['ten','tenR']].forEach(([a,b])=>{
  $(a).addEventListener('input',()=>{$(b).value=$(a).value;calc();});
  $(b).addEventListener('input',()=>{$(a).value=$(b).value;calc();});
});
$('unit').addEventListener('change',()=>{
  const y=$('unit').value==='y',v=parseFloat($('ten').value)||0;
  $('ten').value=y?+(v/12).toFixed(1):Math.round(v*12);
  $('tenR').max=y?MAXY:MAXY*12;$('tenR').step=y?0.5:1;$('tenR').value=$('ten').value;calc();
});
calc();
setTimeout(function(){
  ['result','sched'].forEach(function(id){const el=$(id);el.classList.remove('is-loading');el.setAttribute('aria-busy','false');});
  loaded=true;shown=0;
  requestAnimationFrame(function(){tween(last.emi);donut();});
},reduce?0:400);
})();
