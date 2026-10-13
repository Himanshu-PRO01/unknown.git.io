(function(){
'use strict';
function qp(){var o={};try{new URLSearchParams(location.search).forEach(function(v,k){o[k]=v;});}catch(e){}return o;}
var P=window.TKH_WIDGET_PARAMS||qp();
function el(tag,props,kids){var e=document.createElement(tag);if(props)for(var k in props){if(k==='text')e.textContent=props[k];else e.setAttribute(k,props[k]);}(kids||[]).forEach(function(c){if(c)e.appendChild(typeof c==='string'?document.createTextNode(c):c);});return e;}
var digits=function(v,min,max){v=String(v||'').replace(/[\s()+-]/g,'');return /^\d+$/.test(v)&&v.length>=min&&v.length<=max?v:'';};
var httpsUrl=function(v){try{var u=new URL(v);return u.protocol==='https:'?u:null;}catch(e){return null;}};
var LEAD_HOSTS=['formspree.io','api.web3forms.com','getform.io','script.google.com','hooks.zapier.com'];
function leadUrl(v){var u=httpsUrl(v);if(!u)return null;return LEAD_HOSTS.some(function(h){return u.hostname===h||u.hostname.slice(-(h.length+1))==='.'+h;})?u:null;}

/* settings (everything from the address is checked before use) */
var name=String(P.name||'').trim().slice(0,60);
var color=/^[0-9a-fA-F]{6}$/.test(P.color||'')?P.color:'0F8B6D';
var rgb=[0,2,4].map(function(i){return parseInt(color.substr(i,2),16);});
var onBrand=(0.299*rgb[0]+0.587*rgb[1]+0.114*rgb[2])>150?'#10231F':'#FFFFFF';
document.documentElement.style.setProperty('--brand','#'+color);
document.documentElement.style.setProperty('--on-brand',onBrand);
var logo=httpsUrl(P.logo||'');
var wa=digits(P.wa,8,15),phone=digits(P.phone,8,15),lead=leadUrl(P.lead||''),demo=P.demo==='1';
var calcKey=['emi','sip','fd','ppf'].indexOf(P.calc)>-1?P.calc:'emi';
var PRESET={home:[3000000,8.5,20,'Home loan'],car:[800000,9.5,5,'Car loan'],bike:[100000,12,3,'Bike loan'],personal:[300000,12,3,'Personal loan'],education:[1000000,9.5,7,'Education loan'],business:[500000,14,3,'Business loan']};
var pre=calcKey==='emi'&&PRESET[P.type]?PRESET[P.type]:null;

var inr=function(n){return '\u20b9'+Math.round(n).toLocaleString('en-IN');};
var DEF={
 emi:{title:(pre?pre[3]+' EMI calculator':'EMI calculator'),f:[['amt','Loan amount (\u20b9)',pre?pre[0]:500000,10000,50000000,10000],['rate','Interest rate (% per year)',pre?pre[1]:10,1,30,0.1],['yrs','Loan tenure (years)',pre?pre[2]:5,1,30,1]]},
 sip:{title:'SIP calculator',f:[['amt','Monthly investment (\u20b9)',5000,500,100000,500],['rate','Expected return (% per year)',12,1,30,0.5],['yrs','Time period (years)',10,1,40,1]]},
 fd:{title:'FD calculator',f:[['amt','Deposit amount (\u20b9)',100000,10000,5000000,10000],['rate','Interest rate (% per year)',7,1,12,0.1],['yrs','Time period (years)',5,0.5,10,0.5]]},
 ppf:{title:'PPF calculator',f:[['amt','Yearly investment (\u20b9)',150000,500,150000,500],['rate','Interest rate (% per year)',7.1,1,12,0.1],['yrs','Time period (years)',15,15,50,5]]}
}[calcKey];
var title=String(P.title||'').trim().slice(0,60)||DEF.title;

function compute(v){
  var A=v.amt,r=v.rate/100,y=v.yrs,n=Math.round(y*12),m,tot,gain;
  if(A<=0||y<=0)return {lab:'Result',main:inr(0),rows:[['Amount',inr(0)],['Interest',inr(0)],['Total',inr(0)]],p:0,c:'0%',cl:'Interest',sum:''};
  if(calcKey==='emi'){var i=r/12;m=i===0?A/n:A*i*Math.pow(1+i,n)/(Math.pow(1+i,n)-1);tot=m*n;gain=tot-A;
    return {lab:'Your monthly EMI',main:inr(m),rows:[['Loan amount',inr(A)],['Total interest',inr(gain)],['Total payment',inr(tot)]],p:A/tot*100,c:Math.round(gain/tot*100)+'%',cl:'Interest',sum:title+': loan '+inr(A)+', '+v.rate+'%, '+y+' years, EMI '+inr(m)};}
  if(calcKey==='sip'){var j=r/12;tot=j===0?A*n:A*((Math.pow(1+j,n)-1)/j)*(1+j);var inv=A*n;gain=tot-inv;
    return {lab:'Estimated value after '+y+' years',main:inr(tot),rows:[['Amount invested',inr(inv)],['Estimated returns',inr(gain)],['Total value',inr(tot)]],p:inv/tot*100,c:Math.round(gain/tot*100)+'%',cl:'Returns',sum:title+': '+inr(A)+' a month, '+v.rate+'%, '+y+' years, value '+inr(tot)};}
  if(calcKey==='fd'){tot=A*Math.pow(1+r/4,4*y);gain=tot-A;
    return {lab:'Maturity amount after '+y+' years',main:inr(tot),rows:[['Amount deposited',inr(A)],['Interest earned',inr(gain)],['Maturity amount',inr(tot)]],p:A/tot*100,c:Math.round(gain/tot*100)+'%',cl:'Interest',sum:title+': deposit '+inr(A)+', '+v.rate+'%, '+y+' years, maturity '+inr(tot)};}
  var Y=Math.round(y),B=Math.min(A,150000),bal=0;for(var k=0;k<Y;k++)bal=(bal+B)*(1+r);var inv2=B*Y;gain=bal-inv2;
  return {lab:'Maturity value after '+Y+' years',main:inr(bal),rows:[['Total invested',inr(inv2)],['Interest earned',inr(gain)],['Maturity value',inr(bal)]],p:inv2/bal*100,c:Math.round(gain/bal*100)+'%',cl:'Interest',sum:title+': '+inr(B)+' a year, '+v.rate+'%, '+Y+' years, value '+inr(bal)};
}

var app=document.getElementById('app'),vals={},out={};
/* header */
var hd=el('div',{'class':'hd'});
if(logo){var im=el('img',{alt:name||'Logo',src:logo.href,referrerpolicy:'no-referrer'});im.onerror=function(){im.remove();};hd.appendChild(im);}
hd.appendChild(el('div',null,[name?el('b',{text:name}):null,el('small',{text:title})]));
app.appendChild(hd);
/* inputs and result */
var inputs=el('div',{'class':'box'}),res=el('div',{'class':'box','aria-live':'polite'});
DEF.f.forEach(function(d,idx){
  vals[d[0]]=d[2];
  var num=el('input',{type:'number',id:'n'+idx,min:'0',step:'any',value:String(d[2])}),rng=el('input',{type:'range',min:String(d[3]),max:String(d[4]),step:String(d[5]),value:String(d[2]),'aria-label':d[1]});
  var upd=function(src){var v=parseFloat(src.value);vals[d[0]]=isFinite(v)?v:0;if(src===num)rng.value=num.value;else num.value=rng.value;draw();};
  num.addEventListener('input',function(){upd(num);});rng.addEventListener('input',function(){upd(rng);});
  inputs.appendChild(el('div',{'class':'f'},[el('label',{'for':'n'+idx,text:d[1]}),num,rng]));
});
var lab=el('div',{'class':'lab'}),big=el('div',{'class':'big'});
var arc=null;
var donutBox=el('div',{'class':'donut'});
donutBox.innerHTML='<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="46" fill="none" stroke="#E0A030" stroke-width="16"/><circle id="arc" cx="60" cy="60" r="46" fill="none" stroke="var(--brand)" stroke-width="16" pathLength="100" stroke-dasharray="0 100" transform="rotate(-90 60 60)"/></svg>';
var dc=el('div',{'class':'c'},[el('span'),el('b')]);donutBox.appendChild(dc);
var split=el('div',{'class':'split'});
res.appendChild(lab);res.appendChild(big);res.appendChild(el('div',{'class':'row'},[donutBox,split]));
app.appendChild(el('div',{'class':'grid'},[inputs,res]));
function draw(){
  out=compute(vals);lab.textContent=out.lab;big.textContent=out.main;
  split.textContent='';
  out.rows.forEach(function(r,i){var d=el('div',null,[el('span',null,[i<2?el('i',{'class':'dot',style:'background:'+(i===0?'var(--brand)':'#E0A030')}):null,r[0]]),el('span',{text:r[1]})]);split.appendChild(d);});
  dc.firstChild.textContent=out.cl;dc.lastChild.textContent=out.c;
  var a=document.getElementById('arc');if(a)a.setAttribute('stroke-dasharray',out.p.toFixed(1)+' '+(100-out.p).toFixed(1));
  if(cta&&waBtn&&wa){waBtn.href='https://wa.me/'+wa+'?text='+encodeURIComponent('Hi'+(name?' '+name:'')+', I used your calculator. '+out.sum+'. Please contact me.');}
  post();
}
/* contact block */
var cta=null,waBtn=null;
if(name||wa||phone||lead||demo){
  cta=el('div',{'class':'cta'});
  cta.appendChild(el('h2',{text:name?'Talk to '+name:'Want help with this?'}));
  cta.appendChild(el('p',{text:'Get advice for your numbers. We will use the details above to help you faster.'}));
  var btns=el('div',{'class':'btns'});
  var note=el('p',{'class':'msg',role:'status'});
  var demoNote=function(e,t){e.preventDefault();note.textContent=t;};
  if(wa||demo){waBtn=el('a',{'class':'btn pri',href:wa?'#':'#',target:'_blank',rel:'noopener noreferrer',text:'WhatsApp us'});if(demo&&!wa)waBtn.addEventListener('click',function(e){demoNote(e,'Demo: in your widget this opens WhatsApp with your visitor\u2019s numbers filled in.');});btns.appendChild(waBtn);}
  if(phone||demo){var call=el('a',{'class':'btn',href:phone?'tel:+'+phone:'#',text:'Call now'});if(demo&&!phone)call.addEventListener('click',function(e){demoNote(e,'Demo: in your widget this starts a phone call.');});btns.appendChild(call);}
  var form=null;
  if(lead||demo){
    var cb=el('button',{type:'button','class':'btn',text:'Request a callback'});btns.appendChild(cb);
    var nm=el('input',{type:'text',placeholder:'Your name',autocomplete:'name','aria-label':'Your name',maxlength:'60'}),ph=el('input',{type:'tel',placeholder:'Phone number',autocomplete:'tel','aria-label':'Phone number',maxlength:'20'});
    var sb=el('button',{type:'submit','class':'btn pri',text:'Send my details'});
    form=el('form',{'class':'lead'},[nm,ph,sb,el('div',{'class':'hint',text:'Your details are sent to '+(name||'the business')+'.'})]);
    cb.addEventListener('click',function(){form.classList.toggle('on');if(form.classList.contains('on'))nm.focus();});
    form.addEventListener('submit',function(e){
      e.preventDefault();var n=nm.value.trim(),p=digits(ph.value,8,15);
      if(!n||!p){note.textContent='Please enter your name and a valid phone number.';return;}
      var done=function(ok){note.textContent=ok?'Thank you. We will contact you soon.':'Sorry, we could not send your details. Please try WhatsApp or call instead.';if(ok)form.classList.remove('on');sb.disabled=false;};
      sb.disabled=true;
      if(demo&&!lead){setTimeout(function(){done(true);},300);return;}
      var body={name:n,phone:p,calculator:calcKey,details:out.sum};if(P.key&&/^[A-Za-z0-9-]{8,64}$/.test(P.key))body.access_key=P.key;
      var opt=lead.hostname==='script.google.com'?{method:'POST',mode:'no-cors',body:JSON.stringify(body)}:{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(body)};
      fetch(lead.href,opt).then(function(r){done(opt.mode==='no-cors'||r.ok);}).catch(function(){done(false);});
    });
  }
  cta.appendChild(btns);if(form)cta.appendChild(form);cta.appendChild(note);app.appendChild(cta);
}
/* footer */
var foot=el('div',{'class':'foot'},[el('span',{text:'Estimates only. Not an offer. Actual figures depend on the lender or product.'})]);
if(P.powered!=='off'){var pw=el('a',{href:'../for-business.html',target:'_blank',rel:'noopener noreferrer',text:'Powered by ToolKit Hub'});foot.appendChild(pw);}
app.appendChild(foot);
function post(){try{parent.postMessage({tkhWidgetHeight:document.documentElement.scrollHeight},'*');}catch(e){}}
if(window.ResizeObserver)new ResizeObserver(post).observe(document.body);
draw();
})();
