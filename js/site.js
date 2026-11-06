/* Ancient Talk site-wide script: nav, night mode, reading progress, widgets. No tracking. */
(function(){
var ROOT=(document.documentElement.getAttribute('data-root')||'');
function ls(k,v){try{if(v===undefined){var x=localStorage.getItem(k);return x?JSON.parse(x):null}localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}}
// ---- night mode
var tb=document.getElementById('themeToggle');
function curTheme(){return document.documentElement.getAttribute('data-theme')}
function setTheme(t){document.documentElement.setAttribute('data-theme',t);ls('at-theme',t);if(tb){tb.setAttribute('aria-pressed',t==='dark');tb.setAttribute('aria-label',t==='dark'?'Switch to day mode':'Switch to night mode');tb.textContent=t==='dark'?'☀':'☾'}var m=document.querySelector('meta[name=theme-color]');if(m)m.content=t==='dark'?'#1d1814':'#7a1f2b'}
if(tb){(function(t){var s=ls;ls=function(){};setTheme(t);ls=s})(curTheme()||'light');tb.addEventListener('click',function(){setTheme(curTheme()==='dark'?'light':'dark')})}
// ---- mobile menu
var mb=document.getElementById('menuToggle'),nav=document.getElementById('siteNav');
if(mb&&nav){mb.addEventListener('click',function(){var o=nav.classList.toggle('open');mb.setAttribute('aria-expanded',o)});
 document.addEventListener('keydown',function(e){if(e.key==='Escape'&&nav.classList.contains('open')){nav.classList.remove('open');mb.setAttribute('aria-expanded',false);mb.focus()}})}
// ---- reader: text size + progress
var art=document.querySelector('article.text');
if(art){
 var sz=ls('at-size')||100;function applySz(){document.documentElement.style.setProperty('--rs',sz/100)}applySz();
 var dn=document.getElementById('sizeDown'),up=document.getElementById('sizeUp');
 if(dn)dn.onclick=function(){sz=Math.max(80,sz-10);ls('at-size',sz);applySz()};
 if(up)up.onclick=function(){sz=Math.min(150,sz+10);ls('at-size',sz);applySz()};
 var book=document.documentElement.getAttribute('data-book'),page=location.pathname.split('/').pop(),title=document.documentElement.getAttribute('data-book-title')||document.title;
 var prog=ls('at-progress')||{},saved=prog[book];
 if(saved&&saved.page===page&&saved.y>400){
  var bar=document.createElement('div');bar.className='resume';bar.innerHTML='<span>You were reading here before.</span> <button type="button">Continue where you left off</button>';
  art.parentNode.insertBefore(bar,art);bar.querySelector('button').onclick=function(){window.scrollTo({top:saved.y*(document.documentElement.scrollHeight/(saved.h||document.documentElement.scrollHeight)),behavior:'smooth'});bar.remove()};
 }
 var t;window.addEventListener('scroll',function(){clearTimeout(t);t=setTimeout(function(){var p=ls('at-progress')||{};var h=document.documentElement.scrollHeight;
  p[book]={page:page,y:Math.round(window.scrollY),h:h,pct:Math.min(100,Math.round(100*(window.scrollY+innerHeight)/h)),title:title,part:(document.querySelector('h1.part')||{}).textContent||'',ts:Date.now()};ls('at-progress',p)},400)},{passive:true});
}
// ---- continue reading list
var cl=document.getElementById('continueList');
if(cl){var p=ls('at-progress')||{},items=Object.keys(p).map(function(k){return Object.assign({slug:k},p[k])}).sort(function(a,b){return b.ts-a.ts}).slice(0,4);
 if(items.length){cl.hidden=false;cl.querySelector('ul').innerHTML=items.map(function(i){return '<li><a href="'+ROOT+'books/'+i.page+'">'+esc(i.title)+'</a>'+(i.part?' <span>· '+esc(i.part)+'</span>':'')+' <span class="pct">'+(i.pct||0)+'%</span></li>'}).join('')}}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
// ---- date helpers (local date)
function key(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function dayNum(d){return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5)}
window.AT={ls:ls,esc:esc,key:key,dayNum:dayNum,root:ROOT};
// ---- saint of the day
var sw=document.getElementById('saintWidget');
if(sw&&window.FEASTS){var now=new Date(),y=now.getFullYear(),today=FEASTS.filter(function(f){return f.m===now.getMonth()+1&&f.d===now.getDate()});
 var M=['January','February','March','April','May','June','July','August','September','October','November','December'];
 function li(f){return '<li><a href="'+ROOT+FEAST_LINKS[f.author]+'">'+esc(f.name)+'</a><span class="trad">'+M[f.m-1]+' '+f.d+' · '+esc(f.trad)+'</span></li>'}
 var html;
 if(today.length){html='<p class="slabel">Commemorated today</p><ul>'+today.map(li).join('')+'</ul>'}
 else{var best=null,bd=1e9;FEASTS.forEach(function(f){var dt=new Date(y,f.m-1,f.d);if(dt<new Date(y,now.getMonth(),now.getDate()))dt=new Date(y+1,f.m-1,f.d);var dd=Math.round((dt-new Date(y,now.getMonth(),now.getDate()))/864e5);if(dd<bd){bd=dd;best=[f]}else if(dd===bd)best.push(f)});
  html='<p class="slabel">'+(bd<=7?'Coming up this week':'Next commemoration')+' · in '+bd+' day'+(bd===1?'':'s')+'</p><ul>'+best.map(li).join('')+'</ul>'}
 sw.querySelector('.sbody').innerHTML=html}
// ---- daily teaser
var dt=document.getElementById('dailyTeaser');
if(dt&&window.DAILY){var d=DAILY[((dayNum(new Date()))%DAILY.length+DAILY.length)%DAILY.length];var words=d.text.split(/\s+/);
 dt.querySelector('.dq').textContent=words.slice(0,45).join(' ')+(words.length>45?' …':'');dt.querySelector('.dby').textContent=d.author+', '+d.work.replace(/^Shorts: /,'')}
// ---- newsletter (Kit)
var nf=document.getElementById('newsletterForm'),ns=document.getElementById('newsletterSoon');
if(nf&&ns){var id=(typeof KIT_FORM_ID!=='undefined'&&String(KIT_FORM_ID).trim())||'';
 if(/^\d+$/.test(id)){nf.action='https://app.kit.com/forms/'+id+'/subscriptions';nf.hidden=false;ns.hidden=true}else{nf.hidden=true;ns.hidden=false}}
})();
/* Exact-passage arrival: one gentle highlight, then it fades. */
(function(){
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var timer,fade,begin;
function clearMark(){clearTimeout(timer);clearTimeout(fade);document.querySelectorAll('.xq-mark').forEach(function(el){el.classList.remove('xq-mark','xq-off')})}
function beginLink(){
 var tools=document.querySelector('.rtools'); if(!tools) return null;
 var a=tools.querySelector('.xq-begin'); if(a) return a;
 var nav=document.createElement('div'); nav.className='rnav';
 var lib=tools.querySelector('a');
 if(lib){tools.insertBefore(nav,lib);nav.appendChild(lib)} else tools.insertBefore(nav,tools.firstChild);
 a=document.createElement('a'); a.className='xq-begin'; a.hidden=true; a.textContent='Read from the beginning';
 nav.appendChild(a); return a;
}
function run(){
 clearMark();
 var a=begin||(begin=beginLink());
 if(a) a.hidden=true;
 var id='';
 try{id=decodeURIComponent((location.hash||'').slice(1))}catch(e){id=(location.hash||'').slice(1)}
 if(!id) return;
 var el=document.getElementById(id);
 if(!el||!el.hasAttribute('data-xq')) return;
 var start=el.getAttribute('data-book-start');
 if(a&&start){a.href=start;a.hidden=false}
 el.classList.add('xq-mark');
 var done=function(){el.classList.remove('xq-mark','xq-off')};
 if(reduce){timer=setTimeout(done,4000);return}
 timer=setTimeout(function(){el.classList.add('xq-off');fade=setTimeout(done,1400)},4000);
}
window.addEventListener('hashchange',run);
window.addEventListener('pageshow',function(e){if(e.persisted)run()});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
