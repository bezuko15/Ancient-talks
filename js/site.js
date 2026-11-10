/* Ancient Talk site-wide script: nav, night mode, reading progress, widgets. No tracking. */
(function(){
var ROOT=(document.documentElement.getAttribute('data-root')||'');
// One reload when a newer service worker takes over an already open window.
// The first install does not reload. Saved books and notes are left untouched.
if('serviceWorker' in navigator){
  var hadController=!!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange',function(){
    if(!hadController){hadController=true;return}
    try{if(sessionStorage.getItem('at-sw-reload')==='1')return;sessionStorage.setItem('at-sw-reload','1')}catch(e){return}
    location.reload();
  });
}
function ls(k,v){try{if(v===undefined){var x=localStorage.getItem(k);return x?JSON.parse(x):null}localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}}
// ---- night mode
var tb=document.getElementById('themeToggle');
function curTheme(){return document.documentElement.getAttribute('data-theme')}
function setTheme(t){document.documentElement.setAttribute('data-theme',t);ls('at-theme',t);if(tb){tb.setAttribute('aria-pressed',t==='dark');tb.setAttribute('aria-label',t==='dark'?'Switch to day mode':'Switch to night mode');tb.textContent=t==='dark'?'☀':'☾'}var m=document.querySelector('meta[name=theme-color]');if(m)m.content=t==='dark'?'#1d1814':'#7a1f2b'}
if(tb){(function(t){var s=ls;ls=function(){};setTheme(t);ls=s})(curTheme()||'light');tb.addEventListener('click',function(){setTheme(curTheme()==='dark'?'light':'dark')})}
// ---- feature menu (same grouped list on desktop, phone and the installed app)
var mb=document.getElementById('menuToggle'),nav=document.getElementById('siteNav');
if(mb&&nav){
 function place(){
  if(window.innerWidth>980){nav.style.top='';nav.style.maxHeight='';return}
  var bar=document.querySelector('header.site'); if(!bar)return;
  var b=Math.max(0,Math.round(bar.getBoundingClientRect().bottom));
  nav.style.top=b+'px'; nav.style.maxHeight='calc(100dvh - '+b+'px)';
 }
 function close(){nav.classList.remove('open');mb.setAttribute('aria-expanded','false');nav.style.top='';nav.style.maxHeight=''}
 function open(){nav.classList.add('open');mb.setAttribute('aria-expanded','true');place();var f=nav.querySelector('a,button,input');if(f)f.focus()}
 mb.setAttribute('aria-haspopup','true');
 mb.addEventListener('click',function(){if(nav.classList.contains('open')){close();mb.focus()}else open()});
 document.addEventListener('keydown',function(e){if(e.key==='Escape'&&nav.classList.contains('open')){close();mb.focus()}});
 document.addEventListener('click',function(e){if(!nav.classList.contains('open'))return;if(nav.contains(e.target)||mb.contains(e.target))return;close()});
 document.addEventListener('focusin',function(e){if(!nav.classList.contains('open'))return;if(nav.contains(e.target)||e.target===mb)return;close()});
 window.addEventListener('resize',function(){if(nav.classList.contains('open'))place()},{passive:true});
}
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
/* Exact-passage arrival: highlight the paragraph that was quoted, with the book start beside it. */
(function(){
try{ if((location.hash||'').indexOf('#xq-')===0 && 'scrollRestoration' in history) history.scrollRestoration='manual'; }catch(e){}
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var timer,fade;
function clearMark(){clearTimeout(timer);clearTimeout(fade);document.querySelectorAll('.xq-mark').forEach(function(el){el.classList.remove('xq-mark','xq-off')})}
function hashId(){
 var id='';
 try{id=decodeURIComponent((location.hash||'').slice(1))}catch(e){id=(location.hash||'').slice(1)}
 return id;
}
function placeStart(el){
 var start=el.getAttribute('data-book-start');
 var old=document.getElementById('xqStart');
 if(!start){if(old)old.remove();return}
 var bar=old||document.createElement('div');
 bar.id='xqStart'; bar.className='xq-start';
 bar.innerHTML='<a class="xq-begin" href="'+start+'">Read from the beginning</a>';
 el.parentNode.insertBefore(bar, el);
 bar.querySelector('a').href=start;
 align();
 requestAnimationFrame(function(){requestAnimationFrame(align)});
 setTimeout(align,80);
 setTimeout(align,300);
}
function align(){
 var bar=document.getElementById('xqStart'); if(!bar) return;
 var header=document.querySelector('header.site');
 var gap=(header?header.getBoundingClientRect().height:72)+12;
 var y=bar.getBoundingClientRect().top+window.scrollY-gap;
 window.scrollTo({top:Math.max(0,y),behavior:'auto'});
}
function run(){
 clearMark();
 var el=document.getElementById(hashId());
 if(!el||!el.hasAttribute('data-xq')){var stray=document.getElementById('xqStart'); if(stray) stray.remove(); return}
 if('scrollRestoration' in history) history.scrollRestoration='manual';
 placeStart(el);
 el.classList.add('xq-mark');
 var done=function(){el.classList.remove('xq-mark','xq-off')};
 if(reduce){timer=setTimeout(done,4000);return}
 timer=setTimeout(function(){el.classList.add('xq-off');fade=setTimeout(done,1400)},4000);
}
document.addEventListener('click',function(e){
 var a=e.target.closest&&e.target.closest('a[href]'); if(!a) return;
 var u; try{u=new URL(a.href,location.href)}catch(err){return}
 if(u.pathname===location.pathname && u.hash && u.hash===location.hash && u.hash.indexOf('#xq-')===0){e.preventDefault();run()}
});
window.addEventListener('hashchange',run);
window.addEventListener('load',align);
window.addEventListener('pageshow',function(e){if(e.persisted)run()});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
