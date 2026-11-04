/* Ancient Talk upgrades 3: continue shelf, highlights & notes, read aloud, reader settings,
   search, reading plans, My Library and the move-my-progress code. All data stays in localStorage. */
(function(){
'use strict';
var D=document,H=D.documentElement,ROOT=H.getAttribute('data-root')||'';
function ls(k,v){try{if(v===undefined){var x=localStorage.getItem(k);return x?JSON.parse(x):null}if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function el(t,c,h){var e=D.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e}
function $(s,r){return (r||D).querySelector(s)}function $$(s,r){return Array.prototype.slice.call((r||D).querySelectorAll(s))}
function toast(m){var t=el('div','at-toast');t.setAttribute('role','status');t.textContent=m;D.body.appendChild(t);setTimeout(function(){t.remove()},2600)}
function dkey(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function dnum(k){var p=k.split('-');return Math.round(Date.UTC(+p[0],p[1]-1,+p[2])/864e5)}
var art=$('article.text'),BOOK=H.getAttribute('data-book'),PAGE=location.pathname.split('/').pop()||'index.html';
var BOOKTITLE=H.getAttribute('data-book-title')||'';
function paras(){return art?$$('p',art):[]}

/* =============== Reader settings =============== */
var RS={get:function(){return ls('at-reader')||{}},set:function(r){ls('at-reader',r);RS.apply()},
 apply:function(){var r=RS.get(),sz=ls('at-size')||100;H.style.setProperty('--rs',sz/100);
  if(r.lh)H.style.setProperty('--lh',r.lh);else H.style.removeProperty('--lh');
  if(r.width)H.style.setProperty('--rw',r.width+'ch');else H.style.removeProperty('--rw');
  var f=r.font||(ls('at-serif')===1||localStorage.getItem('at-serif')==='1'?'serif':'');if(f)H.setAttribute('data-font',f);else H.removeAttribute('data-font');
  D.body&&D.body.classList.toggle('serif',f==='serif');
  var dark=H.getAttribute('data-theme')==='dark';if(r.paper==='sepia'&&!dark)H.setAttribute('data-paper','sepia');else H.removeAttribute('data-paper')}};
function setPage(v){var r=RS.get(),dark=H.getAttribute('data-theme')==='dark',tb=D.getElementById('themeToggle');
 r.paper=v;ls('at-reader',r);
 if((v==='night')!==dark){if(tb)tb.click();else{H.setAttribute('data-theme',v==='night'?'dark':'light');ls('at-theme',v==='night'?'dark':'light')}}
 RS.apply()}
// keep the existing night toggle in sync with page colour
var tbt=D.getElementById('themeToggle');if(tbt)tbt.addEventListener('click',function(){setTimeout(function(){var r=RS.get(),dark=H.getAttribute('data-theme')==='dark';if(dark)r.paper='night';else if(r.paper==='night')r.paper='light';ls('at-reader',r);RS.apply();syncPanels()},0)});
// the old serif toggle and A-/A+ buttons keep working and update the panel
var ft=D.getElementById('fontToggle');if(ft)ft.addEventListener('click',function(){var r=RS.get();r.font=D.body.classList.contains('serif')?'serif':'sans';ls('at-reader',r);RS.apply();syncPanels()});
['sizeDown','sizeUp'].forEach(function(id){var b=D.getElementById(id);if(b)b.addEventListener('click',function(){setTimeout(syncPanels,0)})});
var panels=[];
function curPage(){var r=RS.get();return H.getAttribute('data-theme')==='dark'?'night':(r.paper==='sepia'?'sepia':'light')}
function curFont(){var r=RS.get();return r.font||(D.body.classList.contains('serif')?'serif':'sans')}
function settingsPanel(id){
 var p=el('div','rset');p.id=id;
 p.innerHTML='<div class="row"><label class="lbl" for="'+id+'-sz"><span class="lbl">Text size</span></label><input type="range" id="'+id+'-sz" min="80" max="150" step="10"><output for="'+id+'-sz"></output></div>'+
 '<fieldset><legend>Line spacing</legend><span class="seg" data-k="lh"><button type="button" data-v="1.5">Tight</button><button type="button" data-v="">Normal</button><button type="button" data-v="1.9">Relaxed</button><button type="button" data-v="2.2">Extra</button></span></fieldset>'+
 '<fieldset><legend>Page colour</legend><span class="seg" data-k="paper"><button type="button" data-v="light">Light</button><button type="button" class="p-sepia" data-v="sepia">Sepia</button><button type="button" class="p-night" data-v="night">Night</button></span></fieldset>'+
 '<fieldset><legend>Font</legend><span class="seg" data-k="font"><button type="button" class="f-serif" data-v="serif">Serif</button><button type="button" data-v="sans">Sans</button><button type="button" class="f-dys" data-v="dys">Easy-read</button></span></fieldset>'+
 '<fieldset><legend>Page width</legend><span class="seg" data-k="width"><button type="button" data-v="58">Narrow</button><button type="button" data-v="">Standard</button><button type="button" data-v="92">Wide</button></span></fieldset>'+
 '<p class="small-note">Easy-read uses Atkinson Hyperlegible, a font designed for low-vision and dyslexic readers. Settings are saved on this device and apply on every page. <button type="button" class="sbtn" data-reset>Reset to default</button></p>';
 var rg=$('input[type=range]',p),out=$('output',p);
 rg.addEventListener('input',function(){ls('at-size',+rg.value);RS.apply();out.textContent=rg.value+'%'});
 $$('.seg',p).forEach(function(seg){seg.setAttribute('role','group');seg.setAttribute('aria-label',seg.parentNode.querySelector('legend').textContent);
  $$('button',seg).forEach(function(b){b.addEventListener('click',function(){var k=seg.dataset.k,v=b.dataset.v;
   if(k==='paper')setPage(v);else{var r=RS.get();if(v)r[k]=k==='font'?v:+v;else delete r[k];if(k==='font'){try{localStorage.setItem('at-serif',v==='serif'?'1':'0')}catch(e){}var f=D.getElementById('fontToggle');if(f)f.setAttribute('aria-pressed',v==='serif')}RS.set(r)}
   syncPanels()})})});
 $('[data-reset]',p).addEventListener('click',function(){ls('at-reader',null);ls('at-size',100);try{localStorage.setItem('at-serif','0')}catch(e){}if(H.getAttribute('data-theme')==='dark'&&tbt)tbt.click();RS.apply();syncPanels();toast('Reader settings reset')});
 panels.push(p);sync(p);return p}
function sync(p){var r=RS.get(),sz=ls('at-size')||100,rg=$('input[type=range]',p);rg.value=sz;$('output',p).textContent=sz+'%';
 var cur={lh:r.lh?String(r.lh):'',paper:curPage(),font:curFont(),width:r.width?String(r.width):''};
 $$('.seg',p).forEach(function(seg){$$('button',seg).forEach(function(b){b.setAttribute('aria-pressed',b.dataset.v===cur[seg.dataset.k])})})}
function syncPanels(){panels.forEach(sync)}
RS.apply();
var sh=D.getElementById('settingsHost');if(sh)sh.appendChild(settingsPanel('rsetLib'));

/* =============== Continue reading (progress) =============== */
var bookBtn=$('[data-save-book]'),bookPages=bookBtn?bookBtn.getAttribute('data-pages').split(' '):[PAGE];
if(art&&BOOK){
 var t2,PARTS=bookPages.filter(function(x){return /-\d+\.html$/.test(x)});function saveExtra(){var p=ls('at-progress')||{},e=p[BOOK];if(!e||e.page!==PAGE)return;var n=Math.max(1,PARTS.length),idx=Math.max(0,PARTS.indexOf(PAGE));var vis=firstVisible();
  e.ci=idx;e.n=n;e.bp=Math.min(100,Math.round(100*(idx+(e.pct||0)/100)/n));e.para=vis;p[BOOK]=e;ls('at-progress',p)}
 window.addEventListener('scroll',function(){clearTimeout(t2);t2=setTimeout(saveExtra,700)},{passive:true});
}
function firstVisible(){var ps=paras();for(var i=0;i<ps.length;i++){var r=ps[i].getBoundingClientRect();if(r.bottom>90)return i}return 0}
function renderShelf(){var cl=D.getElementById('continueList');if(!cl)return;var all=cl.hasAttribute('data-all'),p=ls('at-progress')||{};
 var items=Object.keys(p).map(function(k){return Object.assign({slug:k},p[k])}).filter(function(i){return i.page}).sort(function(a,b){return (b.ts||0)-(a.ts||0)});if(!all)items=items.slice(0,4);
 var em=D.getElementById('shelfEmpty');if(em)em.hidden=!!items.length;
 if(!items.length){cl.hidden=true;return}
 cl.hidden=false;var ul=$('ul',cl);ul.className='shelf';
 ul.innerHTML=items.map(function(i){var pct=i.bp!=null?i.bp:(i.pct||0),href=ROOT+'books/'+i.page+'#at-resume';
  return '<li><a class="bt" href="'+esc(href)+'">'+esc(i.title)+'</a>'+(i.part&&i.part!==i.title?'<span class="bp">'+esc(i.part)+'</span>':'')+
  '<div class="pbar" role="progressbar" aria-label="'+esc(i.title)+' progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+pct+'"><span style="width:'+pct+'%"></span></div><span class="bp">'+pct+'% of the book'+(i.ts?' · '+new Date(i.ts).toLocaleDateString():'')+'</span> <a class="go" href="'+esc(href)+'">Resume →</a>'+
  '<button type="button" class="x" data-rm="'+esc(i.slug)+'" aria-label="Remove '+esc(i.title)+' from shelf">✕</button></li>'}).join('');
 $$('[data-rm]',ul).forEach(function(b){b.onclick=function(){var p=ls('at-progress')||{};delete p[b.dataset.rm];ls('at-progress',p);renderShelf()}})}
renderShelf();window.addEventListener('pageshow',renderShelf);
// resume to exact spot
function goPara(i,cls){var ps=paras();var t=ps[Math.min(i,ps.length-1)];if(!t)return null;t.scrollIntoView({block:'start'});window.scrollBy(0,-90);if(cls){t.classList.remove('at-flash');void t.offsetWidth;t.classList.add('at-flash')}return t}
function onHash(){if(!art)return;var h=location.hash;
 if(h==='#at-resume'){var s=(ls('at-progress')||{})[BOOK];var rb=$('.resume');if(rb)rb.remove();
  if(s&&s.page===PAGE){if(s.para!=null)goPara(s.para);else window.scrollTo(0,s.y*(D.documentElement.scrollHeight/(s.h||D.documentElement.scrollHeight)))}
  history.replaceState(null,'',location.pathname+location.search)}
 var m=h.match(/^#p(\d+)$/);if(m){var t=goPara(+m[1],true);var q=new URLSearchParams(location.search).get('hl');if(t&&q)markTerms(t,q)}
 m=h.match(/^#hl-([\w-]+)$/);if(m){var mk=$('mark[data-hl="'+m[1]+'"]');if(mk){mk.scrollIntoView({block:'center'});$$('mark[data-hl="'+m[1]+'"]').forEach(function(x){x.classList.add('flash')})}}}
function markTerms(node,q){var terms=q.toLowerCase().split(/[^a-zà-ÿæœ]+/).filter(function(w){return w.length>2});if(!terms.length)return;
 var re=new RegExp('\\b('+terms.map(function(t){return t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}).join('|')+')[a-zà-ÿæœ]*','gi');
 var w=D.createTreeWalker(node,NodeFilter.SHOW_TEXT),ns=[];while(w.nextNode())ns.push(w.currentNode);
 ns.forEach(function(n){var s=n.nodeValue,m,last=0,frag=D.createDocumentFragment(),hit=false;re.lastIndex=0;
  while((m=re.exec(s))){hit=true;frag.appendChild(D.createTextNode(s.slice(last,m.index)));var k=el('mark','at-find');k.textContent=m[0];frag.appendChild(k);last=m.index+m[0].length}
  if(hit){frag.appendChild(D.createTextNode(s.slice(last)));n.parentNode.replaceChild(frag,n)}})}

/* =============== Highlights & notes =============== */
var COLORS=['gold','green','blue','rose'],CNAME={gold:'Gold',green:'Green',blue:'Blue',rose:'Rose'};
function HL(){return ls('at-hl')||{}}function saveHL(h){ls('at-hl',h)}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function textNodes(root){var w=D.createTreeWalker(root,NodeFilter.SHOW_TEXT),a=[],o=0;while(w.nextNode()){var n=w.currentNode;a.push({n:n,s:o,e:o+n.nodeValue.length});o+=n.nodeValue.length}return a}
function offsetOf(container,offset){var r=D.createRange();r.setStart(art,0);r.setEnd(container,offset);return r.toString().length}
function chapAt(node){var hs=$$('h2,h3',art),best='';for(var i=0;i<hs.length;i++){if(hs[i].compareDocumentPosition(node)&Node.DOCUMENT_POSITION_FOLLOWING)best=hs[i].textContent.trim();else break}return best}
function locate(h,full){var cands=[],i=-1;while((i=full.indexOf(h.text,i+1))>-1)cands.push(i);if(!cands.length)return -1;
 var best=cands[0],bs=-1e9;cands.forEach(function(c){var sc=0,pre=full.slice(Math.max(0,c-(h.prefix||'').length),c),suf=full.substr(c+h.text.length,(h.suffix||'').length);
  if(h.prefix&&pre===h.prefix)sc+=100;if(h.suffix&&suf===h.suffix)sc+=100;sc-=Math.abs(c-(h.start||0))/1e4;if(sc>bs){bs=sc;best=c}});return best}
function wrapRange(s,e,h){textNodes(art).forEach(function(t){if(t.e<=s||t.s>=e)return;var n=t.n,a=Math.max(s,t.s)-t.s,b=Math.min(e,t.e)-t.s;
  if(!n.nodeValue.slice(a,b).trim()&&b-a<3)return;if(n.parentNode&&n.parentNode.closest&&n.parentNode.closest('.toc'))return;
  if(b<n.nodeValue.length)n.splitText(b);var mid=a>0?n.splitText(a):n;var m=D.createElement('mark');m.className='at-hl'+(h.note?' has-note':'');m.dataset.hl=h.id;m.dataset.c=h.color;
  m.tabIndex=0;m.setAttribute('role','button');m.setAttribute('aria-label',CNAME[h.color]+' highlight'+(h.note?' with note':'')+'. Press Enter to edit.');mid.parentNode.replaceChild(m,mid);m.appendChild(mid)})}
function unwrap(id){$$('mark[data-hl="'+id+'"]',art).forEach(function(m){var p=m.parentNode;while(m.firstChild)p.insertBefore(m.firstChild,m);p.removeChild(m);p.normalize()})}
function applyAll(){if(!art)return;var all=HL(),full=art.textContent,mine=Object.keys(all).map(function(k){return all[k]}).filter(function(h){return h.page===PAGE&&h.book===BOOK});
 mine.forEach(function(h){if($('mark[data-hl="'+h.id+'"]',art))return;var at=locate(h,full);if(at>-1)wrapRange(at,at+h.text.length,h)})}
var bar,pop,pending=null;
function place(box,rect){box.hidden=false;var w=box.offsetWidth,hgt=box.offsetHeight,x=rect.left+window.scrollX+rect.width/2-w/2;x=Math.max(8+window.scrollX,Math.min(x,window.scrollX+D.documentElement.clientWidth-w-8));
 var y=rect.top+window.scrollY-hgt-10;if(rect.top<hgt+80)y=rect.bottom+window.scrollY+10;box.style.left=x+'px';box.style.top=y+'px'}
function selInArt(){var s=window.getSelection();if(!s||s.isCollapsed||!s.rangeCount)return null;var r=s.getRangeAt(0);if(!art.contains(r.commonAncestorContainer))return null;var t=r.toString();if(t.trim().length<2)return null;return r}
function hideBar(){if(bar){bar.hidden=true;D.body.classList.remove('at-hlbar')}}
function buildBar(){bar=el('div','hlbar');bar.setAttribute('role','toolbar');bar.setAttribute('aria-label','Highlight selected text');bar.hidden=true;
 bar.innerHTML=COLORS.map(function(c){return '<button type="button" data-c="'+c+'" aria-label="Highlight '+CNAME[c]+'" title="Highlight '+CNAME[c]+'"><span class="sw '+c+'"></span></button>'}).join('')+'<button type="button" data-note>✎ Add note</button>'+(D.querySelector('.qsel')?'<button type="button" data-share>❝ Share</button>':'');
 D.body.appendChild(bar);bar.addEventListener('mousedown',function(e){e.preventDefault()});
 bar.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-share')){var q=D.querySelector('.qsel');hideBar();if(q)q.click();return}
  var h=create(b.dataset.c||'gold');if(!h)return;hideBar();window.getSelection().removeAllRanges();if(b.hasAttribute('data-note'))openPop(h.id,true);else toast('Highlighted · see all in My Library')})}
function create(color){var r=selInArt();if(!r)return null;var full=art.textContent,raw=r.toString(),s=offsetOf(r.startContainer,r.startOffset),e=s+raw.length;
 while(s<e&&/\s/.test(full[s]))s++;while(e>s&&/\s/.test(full[e-1]))e--;var text=full.slice(s,e);if(!text)return null;
 var h={id:uid(),book:BOOK,title:BOOKTITLE,part:($('h1.part')||{}).textContent||'',page:PAGE,chap:chapAt(r.startContainer),text:text,prefix:full.slice(Math.max(0,s-40),s),suffix:full.slice(e,e+40),start:s,color:color,note:'',ts:Date.now()};
 var all=HL();all[h.id]=h;saveHL(all);wrapRange(s,e,h);return h}
function openPop(id,focusNote){var all=HL(),h=all[id];if(!h)return;if(!pop){pop=el('div','hlpop');pop.setAttribute('role','dialog');pop.setAttribute('aria-label','Edit highlight');D.body.appendChild(pop);
  D.addEventListener('keydown',function(e){if(e.key==='Escape'&&pop&&!pop.hidden){pop.hidden=true;var m=$('mark[data-hl="'+pop.dataset.id+'"]');if(m)m.focus()}})}
 pop.dataset.id=id;pop.innerHTML='<p class="q">“'+esc(h.text.length>180?h.text.slice(0,180)+'…':h.text)+'”</p><div class="r" role="group" aria-label="Colour">'+COLORS.map(function(c){return '<button type="button" data-c="'+c+'" aria-pressed="'+(h.color===c)+'" aria-label="'+CNAME[c]+'"><span class="sw '+c+'"></span></button>'}).join('')+'</div><label class="small-note" for="hlNote">Note</label><textarea id="hlNote" placeholder="Write a private note…">'+esc(h.note||'')+'</textarea><div class="r"><button type="button" data-del>🗑 Delete</button><span><button type="button" data-cancel>Close</button> <button type="button" data-save class="btn primary small">Save</button></span></div>';
 var m=$('mark[data-hl="'+id+'"]');place(pop,(m||art).getBoundingClientRect());
 $$('[data-c]',pop).forEach(function(b){b.onclick=function(){var all=HL();all[id].color=b.dataset.c;saveHL(all);$$('mark[data-hl="'+id+'"]').forEach(function(x){x.dataset.c=b.dataset.c});$$('[data-c]',pop).forEach(function(o){o.setAttribute('aria-pressed',o===b)})}});
 $('[data-save]',pop).onclick=function(){var all=HL();if(all[id]){all[id].note=$('textarea',pop).value.trim();all[id].ts=Date.now();saveHL(all);$$('mark[data-hl="'+id+'"]').forEach(function(x){x.classList.toggle('has-note',!!all[id].note)})}pop.hidden=true;toast('Saved')};
 $('[data-cancel]',pop).onclick=function(){pop.hidden=true};
 $('[data-del]',pop).onclick=function(){var all=HL();delete all[id];saveHL(all);unwrap(id);pop.hidden=true;toast('Highlight deleted')};
 if(focusNote)$('textarea',pop).focus();else $('[data-save]',pop).focus()}
if(art&&BOOK){buildBar();applyAll();
 var st;D.addEventListener('selectionchange',function(){clearTimeout(st);st=setTimeout(function(){var r=selInArt();if(!r){hideBar();return}D.body.classList.add('at-hlbar');place(bar,r.getBoundingClientRect())},200)});
 art.addEventListener('click',function(e){var m=e.target.closest('mark.at-hl');if(m&&window.getSelection().isCollapsed)openPop(m.dataset.hl)});
 art.addEventListener('keydown',function(e){var m=e.target.closest&&e.target.closest('mark.at-hl');if(m&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openPop(m.dataset.hl)}});
 D.addEventListener('mousedown',function(e){if(pop&&!pop.hidden&&!pop.contains(e.target)&&!e.target.closest('mark.at-hl'))pop.hidden=true})}

/* =============== Reader tools on book pages: settings + read aloud =============== */
if(art&&BOOK){var grp=$('.rtools .grp');
 if(grp){var sb=el('button',null,'⚙ Settings');sb.type='button';sb.id='setBtn';sb.setAttribute('aria-expanded','false');sb.setAttribute('aria-controls','rsetBook');grp.appendChild(sb);
  var panel=settingsPanel('rsetBook');panel.hidden=true;panel.setAttribute('role','region');panel.setAttribute('aria-label','Reader settings');$('.rtools').insertAdjacentElement('afterend',panel);
  sb.onclick=function(){panel.hidden=!panel.hidden;sb.setAttribute('aria-expanded',!panel.hidden);sb.classList.toggle('on',!panel.hidden);if(!panel.hidden)sync(panel)}}
 if('speechSynthesis' in window&&'SpeechSynthesisUtterance' in window&&grp){
  var rb=el('button',null,'🔊 Read aloud');rb.type='button';rb.id='ttsBtn';rb.setAttribute('aria-expanded','false');rb.setAttribute('aria-controls','ttsBar');grp.appendChild(rb);
  var SS=window.speechSynthesis,tts=el('div','tts');tts.id='ttsBar';tts.setAttribute('role','region');tts.setAttribute('aria-label','Read aloud');tts.hidden=true;
  tts.innerHTML='<button type="button" class="prev" aria-label="Previous paragraph">⏮</button><button type="button" class="play">▶ Play</button><button type="button" class="next" aria-label="Next paragraph">⏭</button><button type="button" class="stop" aria-label="Stop">■</button>'+
  '<label>Speed <select class="rate" aria-label="Reading speed"><option value=".75">0.75×</option><option value=".9">0.9×</option><option value="1" selected>1×</option><option value="1.15">1.15×</option><option value="1.3">1.3×</option><option value="1.5">1.5×</option></select></label><label>Voice <select class="voice" aria-label="Voice"><option value="">Default</option></select></label><label><input type="checkbox" class="auto" checked> Follow</label><span class="ttsl" aria-live="polite">Starts from the paragraph on screen.</span><button type="button" class="close" aria-label="Close read aloud">✕</button>';
  D.body.appendChild(tts);
  var T=Object.assign({rate:1,voice:'',auto:true},ls('at-tts')||{}),idx=-1,chunks=[],ci=0,playing=false,gen=0;
  $('.rate',tts).value=String(T.rate).replace(/^0/,'');if(!$('.rate',tts).value)$('.rate',tts).value='1';$('.auto',tts).checked=T.auto!==false;
  function voices(){var vs=SS.getVoices()||[],sel=$('.voice',tts),en=vs.filter(function(v){return /^en/i.test(v.lang)});(en.length?en:vs).forEach(function(v){if(!$('option[value="'+CSS.escape(v.voiceURI)+'"]',sel)){var o=el('option');o.value=v.voiceURI;o.textContent=v.name+' ('+v.lang+')';sel.appendChild(o)}});sel.value=T.voice||''}
  voices();if(SS.addEventListener)SS.addEventListener('voiceschanged',voices);
  function save(){T.rate=+$('.rate',tts).value;T.voice=$('.voice',tts).value;T.auto=$('.auto',tts).checked;ls('at-tts',T)}
  ['.rate','.voice','.auto'].forEach(function(s){$(s,tts).addEventListener('change',function(){save();if(playing){gen++;SS.cancel();speak()}})});
  function split(t){var out=[],parts=t.match(/[^.!?;:]+[.!?;:]*["”’)]*\s*/g)||[t],cur='';parts.forEach(function(p){if((cur+p).length>220&&cur){out.push(cur);cur=p}else cur+=p});if(cur.trim())out.push(cur);return out}
  function mark(){var ps=paras();ps.forEach(function(p){p.classList.remove('at-speaking')});var p=ps[idx];if(!p)return;p.classList.add('at-speaking');
   $('.ttsl',tts).textContent='Paragraph '+(idx+1)+' of '+ps.length;if(T.auto){var r=p.getBoundingClientRect();if(r.top<80||r.top>innerHeight*.6)p.scrollIntoView({block:'center',behavior:'smooth'})}
   var pos=ls('at-tts-pos')||{};pos[PAGE]=idx;ls('at-tts-pos',pos)}
  function speak(){var ps=paras();if(idx<0||idx>=ps.length){stop();$('.ttsl',tts).textContent='Finished this chapter.';return}
   if(!chunks.length){chunks=split(ps[idx].textContent.replace(/\s+/g,' ').trim());ci=0;mark()}
   if(ci>=chunks.length){idx++;chunks=[];speak();return}
   var u=new SpeechSynthesisUtterance(chunks[ci]),g=gen;u.rate=T.rate;u.lang=H.lang||'en';var v=(SS.getVoices()||[]).filter(function(v){return v.voiceURI===T.voice})[0];if(v){u.voice=v;u.lang=v.lang}
   u.onend=function(){if(g!==gen||!playing)return;ci++;speak()};u.onerror=function(e){if(g!==gen)return;if(e.error!=='interrupted'&&e.error!=='canceled'){playing=false;setBtn();$('.ttsl',tts).textContent='Your browser could not read this aloud.'}};
   SS.speak(u)}
  function setBtn(){$('.play',tts).textContent=playing?'❚❚ Pause':'▶ Play';$('.play',tts).setAttribute('aria-label',playing?'Pause':'Play')}
  function play(from){if(from!=null){idx=from;chunks=[]}if(idx<0){var pos=(ls('at-tts-pos')||{})[PAGE];idx=firstVisible();if(pos!=null&&Math.abs(pos-idx)<3)idx=pos;chunks=[]}playing=true;gen++;SS.cancel();setBtn();speak()}
  function pause(){playing=false;gen++;SS.cancel();setBtn();$('.ttsl',tts).textContent='Paused at paragraph '+(idx+1)}
  function stop(){playing=false;gen++;SS.cancel();setBtn();paras().forEach(function(p){p.classList.remove('at-speaking')});idx=-1;chunks=[]}
  $('.play',tts).onclick=function(){playing?pause():play()};$('.stop',tts).onclick=function(){stop();$('.ttsl',tts).textContent='Stopped. Play starts from the paragraph on screen.'};
  $('.next',tts).onclick=function(){play(Math.min(paras().length-1,Math.max(0,idx)+1))};$('.prev',tts).onclick=function(){play(Math.max(0,idx-1))};
  function closeT(){stop();tts.hidden=true;D.body.classList.remove('tts-on');rb.setAttribute('aria-expanded','false');rb.classList.remove('on')}
  $('.close',tts).onclick=function(){closeT();rb.focus()};
  rb.onclick=function(){if(tts.hidden){tts.hidden=false;D.body.classList.add('tts-on');rb.setAttribute('aria-expanded','true');rb.classList.add('on');$('.play',tts).focus()}else closeT()};
  // double-click (or Alt+click) a paragraph while the bar is open to read from there
  art.addEventListener('dblclick',function(e){if(tts.hidden)return;var p=e.target.closest('p');if(p){var i=paras().indexOf(p);if(i>-1){window.getSelection().removeAllRanges();play(i)}}});
  // coexist with "Listen along": stop speech when the YouTube reading starts
  D.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('.lbtn')&&playing)pause()},true);
  window.addEventListener('pagehide',function(){SS.cancel()});
 }
}
// paragraph anchors (#p12) and resume — after highlights are applied
if(art){setTimeout(onHash,30);window.addEventListener('hashchange',onHash)}

/* header search toggle (desktop) */
var stg=D.getElementById('searchToggle'),dsf=D.getElementById('dsearch');
if(stg&&dsf){stg.addEventListener('click',function(){var o=dsf.hidden;dsf.hidden=!o;stg.setAttribute('aria-expanded',o);if(o)D.getElementById('dq').focus()});
 D.addEventListener('keydown',function(e){if(e.key==='Escape'&&!dsf.hidden){dsf.hidden=true;stg.setAttribute('aria-expanded','false');stg.focus()}});
 D.addEventListener('click',function(e){if(!dsf.hidden&&!dsf.contains(e.target)&&e.target!==stg){dsf.hidden=true;stg.setAttribute('aria-expanded','false')}});
 dsf.addEventListener('submit',function(e){if(!D.getElementById('dq').value.trim())e.preventDefault()})}
/* =============== Search page =============== */
var sQ=D.getElementById('sQ');
if(sQ){var docs=null,cache={},res=[],shown=0,pageCache={};
 var STOP={the:1,and:1,that:1,for:1,'with':1,'this':1,from:1,have:1,not:1,but:1,are:1,was:1,his:1,they:1,which:1,their:1,them:1,him:1,her:1,she:1,you:1,your:1,our:1,will:1,all:1,who:1,what:1,when:1,there:1,were:1,been:1,has:1,had:1,into:1,unto:1,than:1,then:1,also:1,more:1,one:1,any:1,may:1,can:1,its:1,out:1,upon:1,very:1,shall:1,should:1,would:1,could:1,these:1,those:1,such:1,being:1,how:1,why:1,where:1,some:1,only:1,other:1,most:1,much:1,did:1,does:1,over:1,own:1,same:1,too:1,let:1};
 function J(u){return fetch(u).then(function(r){if(!r.ok)throw new Error(r.status);return r.json()})}
 function shard(k){var f=k.replace(/[^a-z]/g,'_');if(!cache[f])cache[f]=J(ROOT+'search/'+f+'.json').catch(function(){return {}});return cache[f]}
 function toks(q){return (q.toLowerCase().replace(/’/g,"'").match(/[a-zà-ÿæœ]{3,}/g)||[]).filter(function(w){return !STOP[w]})}
 function decode(s,into,w){s.split(';').forEach(function(g){var a=g.split(':'),d=+a[0];a[1].split('.').forEach(function(p){var k=d+':'+p;(into[k]=into[k]||{})[w]=1})})}
 function run(q){var ts=toks(q),st=D.getElementById('sStatus'),ol=D.getElementById('sResults');ol.innerHTML='';D.getElementById('sMore').hidden=true;
  if(!ts.length){st.textContent=q?'Please type a longer word.':'';return}
  st.textContent='Searching…';var t0=performance.now();
  Promise.all([docs||(docs=J(ROOT+'search/docs.json'))].concat(ts.map(function(w){return shard(w.slice(0,2))}))).then(function(a){docs=Promise.resolve(a[0]);var D0=a[0],per=ts.map(function(w,i){var sh=a[i+1],hits={};
    Object.keys(sh).forEach(function(term){if(term===w||(w.length>=4&&term.indexOf(w)===0))decode(sh[term],hits,term)});return hits});
   var keys=Object.keys(per[0]).filter(function(k){return per.every(function(h){return h[k]})});
   res=keys.map(function(k){var a=k.split(':');var sc=0;per.forEach(function(h){sc+=Object.keys(h[k]).length});return {d:+a[0],p:+a[1],sc:sc,doc:D0[+a[0]]}}).sort(function(x,y){return y.sc-x.sc||x.d-y.d||x.p-y.p});
   var books={};res.forEach(function(r){books[r.doc[1]]=1});
   st.textContent=res.length?res.length+' passage'+(res.length===1?'':'s')+' in '+Object.keys(books).length+' book'+(Object.keys(books).length===1?'':'s')+' ('+Math.round(performance.now()-t0)+' ms)':'No passages found for “'+q+'”. Try a shorter or different word.';
   shown=0;more(ts)}).catch(function(){st.textContent='Search is unavailable offline until you have used it once online.'})}
 function snippet(text,ts){var re=new RegExp('\\b('+ts.map(function(t){return t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}).join('|')+')[a-zà-ÿæœ]*','gi'),m=re.exec(text),i=m?m.index:0;
  var s=Math.max(0,i-120),e=Math.min(text.length,i+220);if(s>0)s=text.indexOf(' ',s)+1;var out=(s>0?'… ':'')+text.slice(s,e)+(e<text.length?' …':'');
  return esc(out).replace(new RegExp('\\b('+ts.map(function(t){return esc(t).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}).join('|')+')[a-zà-ÿæœ]*','gi'),'<mark>$&</mark>')}
 function getPage(f){if(!pageCache[f])pageCache[f]=fetch(ROOT+'books/'+f).then(function(r){return r.text()}).then(function(t){var d=new DOMParser().parseFromString(t,'text/html');var a=d.querySelector('article.text');return {ps:a?Array.prototype.slice.call(a.querySelectorAll('p')):[],a:a}});return pageCache[f]}
 function more(ts){var ol=D.getElementById('sResults'),batch=res.slice(shown,shown+20);shown+=batch.length;
  batch.forEach(function(r){var li=el('li');li.innerHTML='<span class="sb">'+esc(r.doc[1])+(r.doc[2]?' · '+esc(r.doc[2]):'')+'</span><p class="ss">Loading passage…</p>';ol.appendChild(li);
   getPage(r.doc[0]).then(function(pg){var p=pg.ps[r.p],text=p?p.textContent.replace(/\s+/g,' ').trim():'',ch='';
    if(p){var hs=pg.a.querySelectorAll('h2,h3');for(var i=0;i<hs.length;i++){if(hs[i].compareDocumentPosition(p)&4)ch=hs[i].textContent.trim();else break}}
    var href=ROOT+'books/'+r.doc[0]+'?hl='+encodeURIComponent(ts.join(' '))+'#p'+r.p;
    li.innerHTML='<span class="sb">'+esc(r.doc[1])+(r.doc[2]?' · '+esc(r.doc[2]):'')+'</span><br><a class="st" href="'+esc(href)+'">'+esc(ch||r.doc[2]||r.doc[1])+'</a><p class="ss">'+snippet(text,ts)+'</p>'})});
  var mb=D.getElementById('sMore');mb.hidden=shown>=res.length;mb.onclick=function(){more(ts)}}
 var q0=new URLSearchParams(location.search).get('q')||'';sQ.value=q0;var hq=D.getElementById('hq');if(hq)hq.value=q0;var dq=D.getElementById('dq');if(dq)dq.value=q0;if(q0)run(q0);
 D.getElementById('sForm').addEventListener('submit',function(e){e.preventDefault();var q=sQ.value.trim();history.replaceState(null,'','?q='+encodeURIComponent(q));run(q)});
}

/* =============== Reading plans =============== */
var PL=window.AT_PLANS,today=dkey();
function plans(){return ls('at-plans')||{}}
function streak(st){var ds={};Object.keys(st.done||{}).forEach(function(k){ds[dnum(st.done[k])]=1});var t=dnum(today),n=0;if(!ds[t])t--;while(ds[t]){n++;t--}return n}
function dayIndex(st,plan){return Math.min(plan.days.length-1,Math.max(0,dnum(today)-dnum(st.start)))}
function renderPlans(){var host=D.getElementById('planList');if(!host||!PL)return;var P=plans(),tod=D.getElementById('planToday'),th='';
 host.innerHTML=PL.map(function(pl){var st=P[pl.id],n=pl.days.length,done=st?Object.keys(st.done||{}).length:0,di=st?dayIndex(st,pl):-1,mins=pl.days.reduce(function(a,d){return a+d.m},0);
  if(st){var d=pl.days[di];th+='<div class="ptoday"><p class="slabel">Today · '+esc(pl.title)+' · Day '+(di+1)+' of '+n+'</p><h2><a href="'+esc(ROOT+d.h)+'">'+esc(d.t)+'</a></h2><p class="meta">'+esc(d.b)+' · about '+d.m+' min</p><p><span class="streak">🔥 '+streak(st)+'-day streak</span> · '+done+' of '+n+' days done</p><p><label><input type="checkbox" data-plan="'+pl.id+'" data-day="'+di+'"'+(st.done&&st.done[di]?' checked':'')+'> Mark today’s reading done</label></p></div>'}
  return '<article class="card plan'+(st?' active':'')+'" id="'+pl.id+'"><span class="era">'+n+' days · about '+Math.round(mins/n)+' min a day</span><h2>'+esc(pl.title)+'</h2><p>'+esc(pl.desc)+'</p><p class="meta">'+pl.books.map(esc).join(' · ')+'</p>'+
  (st?'<div class="pbar" role="progressbar" aria-label="'+esc(pl.title)+' progress" aria-valuemin="0" aria-valuemax="'+n+'" aria-valuenow="'+done+'"><span style="width:'+Math.round(100*done/n)+'%"></span></div><p class="meta">Started '+new Date(dnum(st.start)*864e5).toLocaleDateString(undefined,{timeZone:'UTC'})+' · '+done+'/'+n+' done · <span class="streak">🔥 '+streak(st)+'</span></p><p><button type="button" class="btn ghost small" data-stop="'+pl.id+'">Stop plan</button></p>':'<p><button type="button" class="btn primary small" data-start="'+pl.id+'">Start this plan</button></p>')+
  '<details class="pdays"'+(st?' open':'')+'><summary>All '+n+' days</summary><ol class="days">'+pl.days.map(function(d,i){var ck=st&&st.done&&st.done[i];return '<li class="'+(i===di?'today ':'')+(ck?'done':'')+'"'+(i===di?' aria-current="date"':'')+'>'+(st?'<input type="checkbox" id="'+pl.id+'-d'+i+'" data-plan="'+pl.id+'" data-day="'+i+'"'+(ck?' checked':'')+' aria-label="Day '+(i+1)+' done">':'')+'<span class="dn">Day '+(i+1)+'</span><span class="dl"><a href="'+esc(ROOT+d.h)+'">'+esc(d.t)+'</a><small>'+esc(d.b)+' · ~'+d.m+' min</small></span></li>'}).join('')+'</ol></details></article>'}).join('');
 if(tod)tod.innerHTML=th;
 $$('[data-start]').forEach(function(b){b.onclick=function(){var P=plans();P[b.dataset.start]={start:today,done:{}};ls('at-plans',P);renderPlans();toast('Plan started. Day 1 is today.')}});
 $$('[data-stop]').forEach(function(b){b.onclick=function(){if(!confirm('Stop this plan? Your ticks for it will be cleared.'))return;var P=plans();delete P[b.dataset.stop];ls('at-plans',P);renderPlans()}});
 $$('input[data-plan]').forEach(function(c){c.onchange=function(){var P=plans(),s=P[c.dataset.plan];if(!s)return;s.done=s.done||{};if(c.checked)s.done[c.dataset.day]=today;else delete s.done[c.dataset.day];ls('at-plans',P);renderPlans();var f=D.getElementById(c.id);if(f)f.focus()}})}
renderPlans();
function renderMyPlans(){var h=D.getElementById('myPlans');if(!h)return;var P=plans(),ids=Object.keys(P);
 if(!ids.length){h.innerHTML='<p>No plan started yet. <a href="'+ROOT+'plans.html">Choose a reading plan</a>.</p>';return}
 var names={};(PL||[]).forEach(function(p){names[p.id]=p});
 h.innerHTML='<ul class="shelf" style="list-style:none;padding:0;display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">'+ids.map(function(id){var st=P[id],pl=names[id];var done=Object.keys(st.done||{}).length;
  return '<li><a class="bt" href="'+ROOT+'plans.html#'+esc(id)+'">'+esc(pl?pl.title:id)+'</a><span class="bp">'+done+(pl?' of '+pl.days.length:'')+' days done · 🔥 '+streak(st)+'-day streak</span></li>'}).join('')+'</ul>'}

/* =============== My Library: notes list =============== */
var nl=D.getElementById('notesList');
function notesFiltered(){var all=HL(),q=(D.getElementById('nq').value||'').toLowerCase(),c=D.getElementById('nc').value,nn=D.getElementById('nn').value;
 return Object.keys(all).map(function(k){return all[k]}).filter(function(h){return (!c||h.color===c)&&(!nn||h.note)&&(!q||(h.text+' '+h.note+' '+h.title+' '+h.chap).toLowerCase().indexOf(q)>-1)}).sort(function(a,b){return a.title<b.title?-1:a.title>b.title?1:(a.page<b.page?-1:a.page>b.page?1:a.start-b.start)})}
function renderNotes(){if(!nl)return;var L=notesFiltered(),g={},total=Object.keys(HL()).length;L.forEach(function(h){(g[h.title]=g[h.title]||[]).push(h)});
 if(!total){nl.innerHTML='<p>No highlights yet. Open any book, select a sentence and choose a colour or “Add note”.</p>';return}
 if(!L.length){nl.innerHTML='<p>Nothing matches.</p>';return}
 nl.innerHTML='<p class="small-note">'+L.length+' of '+total+' highlights</p>'+Object.keys(g).map(function(t){return '<section class="nbook"><h3>'+esc(t)+'</h3>'+g[t].map(function(h){var href=ROOT+'books/'+h.page+'#hl-'+h.id;
  return '<div class="nitem" data-c="'+esc(h.color)+'"><blockquote>“'+esc(h.text)+'”</blockquote>'+(h.note?'<p class="nn">'+esc(h.note)+'</p>':'')+'<p class="nm">'+esc([h.part!==h.title?h.part:'',h.chap].filter(Boolean).join(' · '))+' · '+new Date(h.ts).toLocaleDateString()+' · <a href="'+esc(href)+'">Open in book →</a> · <button type="button" class="linkbtn" data-delhl="'+esc(h.id)+'">Delete</button></p></div>'}).join('')+'</section>'}).join('');
 $$('[data-delhl]',nl).forEach(function(b){b.onclick=function(){if(!confirm('Delete this highlight?'))return;var a=HL();delete a[b.dataset.delhl];saveHL(a);renderNotes()}})}
function notesText(){var L=notesFiltered(),out='Ancient Talk — my highlights and notes\nExported '+new Date().toLocaleString()+'\n',last='';
 L.forEach(function(h){if(h.title!==last){out+='\n== '+h.title+' ==\n';last=h.title}out+='\n“'+h.text+'”\n   — '+[h.part!==h.title?h.part:'',h.chap].filter(Boolean).join(', ')+'\n'+(h.note?'   Note: '+h.note+'\n':'')+'   https://ancienttalks.com/books/'+h.page+'\n'});return out}
function download(name,text,type){var b=new Blob([text],{type:type||'text/plain'}),a=el('a');a.href=URL.createObjectURL(b);a.download=name;D.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500)}
if(nl){['nq','nc','nn'].forEach(function(i){D.getElementById(i).addEventListener('input',renderNotes)});renderNotes();renderMyPlans();
 D.getElementById('nExport').onclick=function(){download('ancient-talk-notes-'+today+'.txt',notesText())}}

/* =============== Move my progress =============== */
function b64u(bytes){var s='';for(var i=0;i<bytes.length;i+=0x8000)s+=String.fromCharCode.apply(null,bytes.subarray(i,i+0x8000));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function unb64u(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
function pipe(bytes,T){return new Response(new Blob([bytes]).stream().pipeThrough(T)).arrayBuffer().then(function(b){return new Uint8Array(b)})}
function snapshot(){var data={};for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(/^at-[\w-]+$/.test(k)){var v=localStorage.getItem(k);try{data[k]=JSON.parse(v)}catch(e){data[k]=v}}}return {app:'ancienttalk',v:1,ts:Date.now(),data:data}}
function encode(obj){var bytes=new TextEncoder().encode(JSON.stringify(obj));if(window.CompressionStream)return pipe(bytes,new CompressionStream('deflate-raw')).then(function(z){return 'AT1.'+b64u(z)});return Promise.resolve('AT0.'+b64u(bytes))}
function decodeCode(s){s=String(s||'').trim();if(s.charAt(0)==='{')return Promise.resolve(JSON.parse(s));s=s.replace(/\s+/g,'');var m=s.match(/^AT([01])\.([A-Za-z0-9_-]+)$/);if(!m)return Promise.reject(new Error('This does not look like an Ancient Talk progress code.'));
 var bytes=unb64u(m[2]);var p=m[1]==='1'?(window.DecompressionStream?pipe(bytes,new DecompressionStream('deflate-raw')):Promise.reject(new Error('This browser cannot open compressed codes. Use the downloaded file instead.'))):Promise.resolve(bytes);
 return p.then(function(b){return JSON.parse(new TextDecoder().decode(b))})}
function validate(o){if(!o||o.app!=='ancienttalk'||typeof o.data!=='object'||!o.data||Array.isArray(o.data))throw new Error('This code is not from Ancient Talk.');
 var ok={};Object.keys(o.data).forEach(function(k){if(/^at-[\w-]+$/.test(k)&&JSON.stringify(o.data[k]).length<2e6)ok[k]=o.data[k]});
 var obj=function(x){return x&&typeof x==='object'&&!Array.isArray(x)};['at-progress','at-hl','at-plans','at-reader','at-tts-pos'].forEach(function(k){if(k in ok&&!obj(ok[k]))delete ok[k]});
 if(obj(ok['at-hl']))Object.keys(ok['at-hl']).forEach(function(id){var h=ok['at-hl'][id];if(!obj(h)||typeof h.text!=='string'||typeof h.page!=='string'||!/^[\w-]+\.html$/.test(h.page))delete ok['at-hl'][id];else{h.id=id;if(['gold','green','blue','rose'].indexOf(h.color)<0)h.color='gold';h.note=String(h.note||'')}});
 if(obj(ok['at-progress']))Object.keys(ok['at-progress']).forEach(function(b){var e=ok['at-progress'][b];if(!obj(e)||!/^[\w-]+\.html$/.test(e.page||''))delete ok['at-progress'][b]});
 return ok}
function mergeIn(inc,mode){var n={progress:0,hl:0,plans:0,other:0};
 if(mode==='replace'){Object.keys(snapshot().data).forEach(function(k){if(k!=='at-theme'||'at-theme' in inc)localStorage.removeItem(k)})}
 Object.keys(inc).forEach(function(k){var cur=ls(k),v=inc[k];
  if(k==='at-progress'){cur=cur||{};Object.keys(v).forEach(function(b){if(!cur[b]||(v[b].ts||0)>(cur[b].ts||0)){cur[b]=v[b];n.progress++}});ls(k,cur)}
  else if(k==='at-hl'){cur=cur||{};Object.keys(v).forEach(function(id){if(!cur[id]||(v[id].ts||0)>(cur[id].ts||0)){cur[id]=v[id];n.hl++}});ls(k,cur)}
  else if(k==='at-plans'){cur=cur||{};Object.keys(v).forEach(function(id){var a=cur[id],b=v[id];if(!b||!b.start)return;if(!a){cur[id]=b}else{a.start=a.start<b.start?a.start:b.start;a.done=Object.assign({},b.done||{},a.done||{})}n.plans++});ls(k,cur)}
  else if(k==='at-tts-pos'||k==='at-daily'){cur=cur&&typeof cur==='object'?cur:{};ls(k,Object.assign({},v,cur));n.other++}
  else if(cur==null||mode==='replace'){ls(k,v);n.other++}});
 return n}
var exC=D.getElementById('exCode');
if(exC){function refreshCode(){encode(snapshot()).then(function(c){exC.value=c;D.getElementById('exMsg').textContent=c.length+' characters · includes progress, highlights, notes, plans and settings.'})}refreshCode();
 D.getElementById('exCopy').onclick=function(){var m=D.getElementById('exMsg');(navigator.clipboard?navigator.clipboard.writeText(exC.value):Promise.reject()).then(function(){m.textContent='Code copied. Paste it into My Library on your other device.'},function(){exC.select();m.textContent='Select the code and copy it.'})};
 D.getElementById('exFile').onclick=function(){download('ancient-talk-progress-'+today+'.json',JSON.stringify(snapshot(),null,1),'application/json')};
 D.getElementById('imFile').onchange=function(e){var f=e.target.files[0];if(!f)return;if(f.size>5e6){D.getElementById('imMsg').textContent='That file is too large.';return}f.text().then(function(t){D.getElementById('imCode').value=t.trim()})};
 D.getElementById('imGo').onclick=function(){var m=D.getElementById('imMsg'),mode=($('input[name=imode]:checked')||{}).value||'merge',raw=D.getElementById('imCode').value;
  if(!raw.trim()){m.textContent='Paste a code or choose a file first.';return}
  if(mode==='replace'&&!confirm('Replace everything saved on this device with the imported data?'))return;
  decodeCode(raw).then(function(o){var inc=validate(o),n=mergeIn(inc,mode);RS.apply();syncPanels();renderShelf();renderNotes();renderMyPlans();refreshCode();
   m.textContent='Imported: '+n.progress+' book'+(n.progress===1?'':'s')+' in progress, '+n.hl+' highlight'+(n.hl===1?'':'s')+', '+n.plans+' plan'+(n.plans===1?'':'s')+', '+n.other+' setting'+(n.other===1?'':'s')+'.';toast('Progress imported')})
  .catch(function(e){m.textContent='Could not import: '+(e&&e.message&&!/JSON|Unexpected|atob|character/i.test(e.message)?e.message:'the code is incomplete or damaged. Copy it again in full.')})};
}
window.ATData={snapshot:snapshot,encode:encode,decode:decodeCode,validate:validate,merge:mergeIn};
})();
