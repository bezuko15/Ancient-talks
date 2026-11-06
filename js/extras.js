/* Ancient Talk extras: Listen along, quote cards, glossary tooltips, support/contact config. */
(function(){
var ROOT=document.documentElement.getAttribute('data-root')||'';
function cfg(n){try{return eval(n)}catch(e){return undefined}}
var CH=cfg('CHANNEL_URL')||'https://www.youtube.com/@ancienttalksoffical',READ=cfg('READINGS')||{};
function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

/* ---------- 1. Listen along ---------- */
function keyFromLink(h){if(!h)return'';var m=h.match(/shorts\.html#([\w-]+)/);if(m)return m[1];m=h.match(/books\/([\w-]+?)(?:-\d+)?\.html/);return m?m[1]:''}
function listen(key){
  var r=READ[key],id=r&&(typeof r==='string'?r:r.id),title=r&&r.title||'this reading';
  if(id&&/^[\w-]{6,20}$/.test(id)){
    var w=el('div','listen');var b=el('button','lbtn','<span aria-hidden="true">▶</span> Listen along');b.type='button';
    var s=el('small',null,'Plays from YouTube in privacy-enhanced mode. Nothing loads until you press play.');
    b.addEventListener('click',function(){var f=el('div','video');f.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0" title="'+esc(title)+'" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';w.innerHTML='';w.appendChild(f)});
    w.appendChild(b);w.appendChild(s);return w}
  return el('p','listen-soon','<span aria-hidden="true">🎧</span> Readings coming to YouTube · <a href="'+CH+'?sub_confirmation=1" target="_blank" rel="noopener">Subscribe</a>');
}
var html=document.documentElement,book=html.getAttribute('data-book');
if(book){var anchor=document.querySelector('.bookhead')||document.querySelector('h1.part');if(anchor)anchor.insertAdjacentElement('afterend',listen(book))}
document.querySelectorAll('.short[id]').forEach(function(c){var t=c.querySelector('.toggle')||null;var l=listen(c.id);if(t)c.insertBefore(l,t);else c.appendChild(l)});
var dl=document.getElementById('dLink');if(dl){var act=dl.parentNode;act.insertAdjacentElement('afterend',listen(keyFromLink(dl.getAttribute('href'))))}

/* ---------- 2. Quote cards ---------- */
var MAX=400,emblem=null,dlg,cur={},fmt='square';
function loadEmblem(){if(emblem)return Promise.resolve(emblem);return new Promise(function(r){var i=new Image();i.onload=function(){emblem=i;r(i)};i.onerror=function(){r(null)};i.src=ROOT+'img/emblem.png'})}
function fonts(){if(!document.fonts||!document.fonts.load)return Promise.resolve();return Promise.all([document.fonts.load('500 60px "Cormorant Garamond"'),document.fonts.load('600 40px "Cormorant Garamond"'),document.fonts.load('700 40px "Cormorant Garamond"')]).catch(function(){})}
function clean(t){t=String(t).replace(/\s+/g,' ').trim();var trimmed=false;if(t.length>MAX){t=t.slice(0,MAX);t=t.slice(0,t.lastIndexOf(' '))+'…';trimmed=true}return{t:t,trimmed:trimmed}}
function wrap(ctx,text,maxW){var words=text.split(' '),lines=[],line='';words.forEach(function(w){var test=line?line+' '+w:w;if(ctx.measureText(test).width>maxW&&line){lines.push(line);line=w}else line=test});if(line)lines.push(line);return lines}
function draw(cv){var W=fmt==='square'?1080:1200,H=fmt==='square'?1080:630;cv.width=W;cv.height=H;var x=cv.getContext('2d');
  x.fillStyle='#f6eedd';x.fillRect(0,0,W,H);var g=x.createRadialGradient(W/2,H/2,H*.2,W/2,H/2,W*.8);g.addColorStop(0,'rgba(255,250,240,0)');g.addColorStop(1,'rgba(160,120,70,.18)');x.fillStyle=g;x.fillRect(0,0,W,H);
  x.strokeStyle='#7a1f2b';x.lineWidth=3;x.strokeRect(28,28,W-56,H-56);x.lineWidth=1;x.strokeRect(40,40,W-80,H-80);
  var sq=fmt==='square',pad=sq?110:90,top=sq?120:70,brandY=H-(sq?92:66),workY=brandY-(sq?78:58),authY=workY-(sq?46:36),bottomText=authY-(sq?70:48),maxW=W-pad*2,avail=bottomText-top,size=sq?64:46,lines,lh;
  var q='“'+cur.text+'”';
  for(;size>=22;size-=2){x.font='500 '+size+'px "Cormorant Garamond", Georgia, serif';lh=size*1.28;lines=wrap(x,q,maxW);if(lines.length*lh<=avail)break}
  x.fillStyle='#2b211a';x.textAlign='center';x.textBaseline='alphabetic';var y=top+(avail-lines.length*lh)/2+size;
  lines.forEach(function(l){x.fillText(l,W/2,y);y+=lh});
  x.fillStyle='#7a1f2b';x.font='700 '+(sq?40:32)+'px "Cormorant Garamond", Georgia, serif';x.fillText('— '+cur.author,W/2,authY);
  x.fillStyle='#5b4a3c';x.font='italic 500 '+(sq?30:24)+'px "Cormorant Garamond", Georgia, serif';x.fillText(cur.work||'',W/2,workY);
  var es=sq?56:44,ey=brandY;x.font='600 '+(sq?26:22)+'px "Cormorant Garamond", Georgia, serif';x.fillStyle='#7a1f2b';
  var label='ANCIENT TALK',lw=x.measureText(label).width,tot=es+14+lw,sx=W/2-tot/2;
  if(emblem)x.drawImage(emblem,sx,ey-es/2,es,es);x.textAlign='left';x.textBaseline='middle';x.fillText(label,sx+es+14,ey+1);
}
function shareUrl(){return cur.link?new URL(cur.link,location.href).href:location.href.split('#')[0]}
function build(){dlg=el('dialog','qdlg');dlg.setAttribute('aria-label','Share as image');
  dlg.innerHTML='<div class="qhead"><h2>Share as image</h2><button type="button" class="iconbtn qclose" aria-label="Close">✕</button></div><div class="qfmt" role="group" aria-label="Size"><button type="button" data-f="square" aria-pressed="true">Square 1080×1080</button><button type="button" data-f="wide" aria-pressed="false">Wide 1200×630</button></div><canvas class="qcv" aria-label="Quote card preview"></canvas><p class="qwarn" hidden>Long passage: trimmed to '+MAX+' characters. Select a shorter part of the text for a full quote.</p><div class="qact"><a class="btn primary small qdl" download="ancient-talk-quote.png" href="#">Download PNG</a><button type="button" class="btn ghost small qshare" hidden>Share…</button><button type="button" class="btn ghost small qcopy">Copy link</button></div><p class="qmsg" aria-live="polite"></p>';
  document.body.appendChild(dlg);
  dlg.querySelector('.qclose').onclick=function(){dlg.close()};dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close()});
  dlg.querySelectorAll('.qfmt button').forEach(function(b){b.onclick=function(){fmt=b.dataset.f;dlg.querySelectorAll('.qfmt button').forEach(function(o){o.setAttribute('aria-pressed',o===b)});render()}});
  dlg.querySelector('.qcopy').onclick=function(){var u=shareUrl(),m=dlg.querySelector('.qmsg');(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(function(){m.textContent='Link copied.'},function(){m.textContent=u})};
  dlg.querySelector('.qshare').onclick=function(){var cv=dlg.querySelector('canvas'),m=dlg.querySelector('.qmsg');cv.toBlob(function(b){var f=new File([b],'ancient-talk-quote.png',{type:'image/png'});navigator.share({files:[f],title:'Ancient Talk',text:cur.author+(cur.work?', '+cur.work:'')+' '+shareUrl()}).catch(function(e){if(e&&e.name!=='AbortError')m.textContent='Sharing was not available. Use Download instead.'})},'image/png')};
}
function render(){var cv=dlg.querySelector('canvas');draw(cv);cv.toBlob(function(b){var a=dlg.querySelector('.qdl');if(a.dataset.u)URL.revokeObjectURL(a.dataset.u);var u=URL.createObjectURL(b);a.href=u;a.dataset.u=u;
  try{var f=new File([b],'q.png',{type:'image/png'});dlg.querySelector('.qshare').hidden=!(navigator.canShare&&navigator.canShare({files:[f]}))}catch(e){}},'image/png')}
function openCard(text,author,work,link){if(!dlg)build();var c=clean(text);cur={text:c.t,author:author||'',work:work||'',link:link};dlg.querySelector('.qwarn').hidden=!c.trimmed;dlg.querySelector('.qmsg').textContent='';
  if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','');Promise.all([fonts(),loadEmblem()]).then(render)}
window.ATQuote=openCard;
function qbtn(){var b=el('button','qbtn','Share as image');b.type='button';return b}
// passage figures (topics) carry data attributes
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.qbtn');if(!b)return;var f=b.closest('[data-q]');if(!f)return;
  openCard((f.querySelector('.ptext')||f).innerText,f.dataset.author,f.dataset.work,f.dataset.link)});
// shorts cards
document.querySelectorAll('.short[id]').forEach(function(c){var t=c.querySelector('.stext');if(!t)return;c.setAttribute('data-q','');c.dataset.author=(c.querySelector('.by')||{}).textContent||'';c.dataset.work=(c.querySelector('h2,h3')||{}).textContent||'';c.dataset.link='shorts.html#'+c.id;t.classList.add('ptext');var b=qbtn();var l=c.querySelector('.listen,.listen-soon');c.insertBefore(b,l||null)});
// daily
var dt=document.getElementById('dText');if(dt&&dl){var card=document.getElementById('todayCard');card.setAttribute('data-q','');dt.classList.add('ptext');card.dataset.author=document.getElementById('dAuthor').textContent;card.dataset.work=document.getElementById('dWork').textContent;card.dataset.link=dl.getAttribute('href');var bb=qbtn();bb.className='btn ghost small qbtn';dl.insertAdjacentElement('afterend',bb)}
// text selection inside readable areas
var SEL='article.text, .stext, #dText, .ptext',fb=el('button','qsel','❝ Share as image');fb.type='button';fb.hidden=true;document.body.appendChild(fb);
function selInfo(){var s=window.getSelection();if(!s||s.isCollapsed||!s.rangeCount)return null;var t=s.toString().trim();if(t.length<12)return null;var n=s.getRangeAt(0).commonAncestorContainer;n=n.nodeType===1?n:n.parentNode;var a=n.closest&&n.closest(SEL);return a?{t:t,a:a}:null}
var st;document.addEventListener('selectionchange',function(){clearTimeout(st);st=setTimeout(function(){fb.hidden=!selInfo()},180)});
fb.addEventListener('mousedown',function(e){e.preventDefault()});
fb.addEventListener('click',function(){var i=selInfo();if(!i)return;var q=i.a.closest('[data-q]'),author,work,link;
  if(q){author=q.dataset.author;work=q.dataset.work;link=q.dataset.link}else{work=html.getAttribute('data-book-title')||'';var by=document.querySelector('.bookhead .by');author=by?by.textContent:((document.querySelector('.crumb')||{}).textContent||'').split('·').pop().trim();var p=document.querySelector('h1.part');if(p&&work&&p.textContent!==work)work+=', '+p.textContent;link=location.href.split('#')[0]}
  fb.hidden=true;openCard(i.t,author,work,link)});

/* ---------- 3. Glossary auto-links ---------- */
function gloss(){var G=window.GLOSSARY;if(!G)return;var scope=document.querySelectorAll('article.text, .stext, #dText, .ptext');if(!scope.length)return;
  var forms={},alts=[];G.forEach(function(g){g.f.forEach(function(f){forms[f]=g;alts.push(f)})});if(!alts.length)return;
  alts.sort(function(a,b){return b.length-a.length});
  var re=new RegExp('(^|[^\\w\\-])('+alts.map(function(a){return a.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}).join('|')+')(?![\\w\\-])','g'),done={},left=G.length,BAD=/^(A|H1|H2|H3|H4|H5|H6|CODE|PRE|BUTTON|SCRIPT|STYLE|FIGCAPTION)$/;
  var nodes=[];scope.forEach(function(s){var w=document.createTreeWalker(s,NodeFilter.SHOW_TEXT,{acceptNode:function(n){for(var p=n.parentNode;p&&p!==s;p=p.parentNode){if(BAD.test(p.nodeName)||(p.classList&&p.classList.contains('toc')))return 2}return 1}});while(w.nextNode())nodes.push(w.currentNode)});
  var i=0;function chunk(dl){var t0=Date.now();while(i<nodes.length&&left>0&&(Date.now()-t0)<12){var n=nodes[i++],txt=n.nodeValue,m;re.lastIndex=0;
    while((m=re.exec(txt))){var g=forms[m[2]];if(done[g.id])continue;done[g.id]=1;left--;var st=m.index+m[1].length,r=n.splitText(st);var tail=r.splitText(m[2].length);
      var a=document.createElement('a');a.className='gl';a.href=ROOT+'glossary.html#'+g.id;a.setAttribute('data-def',g.d);a.setAttribute('aria-describedby','gltip');a.textContent=m[2];r.parentNode.replaceChild(a,r);nodes.splice(i,0,tail);break}}
    if(i<nodes.length&&left>0)(window.requestIdleCallback||setTimeout)(chunk)}
  (window.requestIdleCallback||setTimeout)(chunk);
  var tip=el('div','gtip');tip.id='gltip';tip.setAttribute('role','tooltip');tip.hidden=true;document.body.appendChild(tip);var on=null;
  function show(a){on=a;var g=a.getAttribute('data-def');tip.innerHTML='<b>'+esc(a.textContent)+'</b> '+esc(g)+' <span class="gmore">Tap again or click for the glossary →</span>';tip.hidden=false;var r=a.getBoundingClientRect(),tw=Math.min(320,window.innerWidth-24);tip.style.width=tw+'px';var l=Math.max(12,Math.min(r.left+window.scrollX,window.scrollX+window.innerWidth-tw-12));tip.style.left=l+'px';
    var top=r.bottom+window.scrollY+8;tip.style.top=top+'px';if(r.bottom+tip.offsetHeight+16>window.innerHeight&&r.top>tip.offsetHeight+16)tip.style.top=(r.top+window.scrollY-tip.offsetHeight-8)+'px'}
  function hide(){tip.hidden=true;on=null}
  document.addEventListener('mouseover',function(e){var a=e.target.closest&&e.target.closest('a.gl');if(a&&a!==on)show(a);else if(!a&&on&&!tip.contains(e.target))hide()});
  document.addEventListener('focusin',function(e){if(e.target.matches&&e.target.matches('a.gl'))show(e.target)});
  document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a.gl');if(!a){if(on&&!tip.contains(e.target))hide();return}if(on!==a){e.preventDefault();show(a)}});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')hide()});window.addEventListener('scroll',function(){if(on&&!on.matches(':hover'))hide()},{passive:true});
}
if(!window.AT_GPOP)gloss();

/* ---------- 4. Support & contact ---------- */
var SU=cfg('SUPPORT_URL')||'',CE=cfg('CONTACT_EMAIL')||'';
var sb=document.getElementById('supportBtn'),ss=document.getElementById('supportSoon');if(sb){if(/^https:\/\//.test(SU)){sb.href=SU;sb.hidden=false;if(ss)ss.hidden=true}else{sb.hidden=true;if(ss)ss.hidden=false}}
var ce=document.getElementById('contactEmail'),cs=document.getElementById('contactSoon');if(ce){if(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(CE)){ce.href='mailto:'+CE;ce.textContent=CE;ce.parentNode.hidden=false;if(cs)cs.hidden=true}else{ce.parentNode.hidden=true;if(cs)cs.hidden=false}}
})();
