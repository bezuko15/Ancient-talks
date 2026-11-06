/* Ancient Talk glossary pop-ups (tools/glossary_popups.py) */
(function(){
window.AT_GPOP=1; /* tells extras.js to skip its older hover tooltip */
var G=window.GLOSSARY; if(!G||!G.length)return;
var root=document.documentElement.getAttribute('data-root')||'';
var forms={},alts=[];
G.forEach(function(g){(g.f||[]).forEach(function(f){forms[f]=g;alts.push(f)})});
if(!alts.length)return;
alts.sort(function(a,b){return b.length-a.length});
var RE=new RegExp('(^|[^\\w\\-])('+alts.map(function(a){return a.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}).join('|')+')(?![\\w\\-])','g');
var SKIP=/^(A|BUTTON|CODE|PRE|SCRIPT|STYLE|TEXTAREA|INPUT|SELECT|LABEL|FIGCAPTION|H1|H2|H3|H4|H5|H6|MARK|SUP)$/;
var SECT=/^(H2|H3)$/;
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function mark(scope){
  if(!scope||scope.getAttribute('data-gpop')==='1')return;
  scope.setAttribute('data-gpop','1');
  var done={},jobs=[];
  var w=document.createTreeWalker(scope,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,{acceptNode:function(n){
    if(n.nodeType===1){
      if(SECT.test(n.nodeName)){done={};}  /* a new chapter/section heading resets "first use" */
      if(SKIP.test(n.nodeName)||(n.classList&&(n.classList.contains('toc')||n.classList.contains('gl')||n.classList.contains('hl'))))return 2;
      return 3;
    }
    return 1;
  }});
  while(w.nextNode()){
    var n=w.currentNode,t=n.nodeValue,m;RE.lastIndex=0;var hits=[];
    while((m=RE.exec(t))){var g=forms[m[2]];if(done[g.id])continue;done[g.id]=1;hits.push([m.index+m[1].length,m[2],g])}
    if(hits.length)jobs.push([n,hits]);
  }
  jobs.forEach(function(j){
    var n=j[0],off=0;
    j[1].forEach(function(h){
      var r=n.splitText(h[0]-off),tail=r.splitText(h[1].length);
      var a=document.createElement('a');a.className='gl gpop';a.href=root+'glossary.html#'+h[2].id;
      a.setAttribute('data-gid',h[2].id);a.setAttribute('role','button');a.setAttribute('aria-haspopup','dialog');a.setAttribute('aria-expanded','false');
      a.title='Glossary: '+h[2].t;a.textContent=h[1];r.parentNode.replaceChild(a,r);n=tail;off=h[0]+h[1].length;
    });
  });
}
var byId={};G.forEach(function(g){byId[g.id]=g});
var pop=document.createElement('div');pop.className='gpop-box';pop.id='gpopBox';pop.hidden=true;
pop.setAttribute('role','dialog');pop.setAttribute('aria-modal','false');pop.setAttribute('aria-labelledby','gpopTitle');
document.body.appendChild(pop);
var cur=null;
function close(back){if(pop.hidden)return;pop.hidden=true;document.documentElement.classList.remove('gpop-open');if(cur){cur.setAttribute('aria-expanded','false');if(back)cur.focus()}cur=null}
function open(a){
  var g=byId[a.getAttribute('data-gid')];if(!g)return;
  if(cur&&cur!==a)cur.setAttribute('aria-expanded','false');
  cur=a;a.setAttribute('aria-expanded','true');
  pop.innerHTML='<div class="gpop-head"><h2 id="gpopTitle">'+esc(g.t)+'</h2><button type="button" class="gpop-x" aria-label="Close">\u00d7</button></div><p class="gpop-def">'+esc(g.d)+'</p><a class="gpop-more" href="'+root+'glossary.html#'+g.id+'">Full glossary entry \u2192</a>';
  pop.hidden=false;
  var mobile=window.matchMedia('(max-width:600px)').matches;
  document.documentElement.classList.toggle('gpop-open',mobile);
  if(mobile){pop.style.left='';pop.style.top='';pop.style.width='';}
  else{
    var r=a.getBoundingClientRect(),tw=Math.min(340,window.innerWidth-24);pop.style.width=tw+'px';
    pop.style.left=Math.max(12,Math.min(r.left+window.scrollX,window.scrollX+window.innerWidth-tw-12))+'px';
    pop.style.top=(r.bottom+window.scrollY+8)+'px';
    var h=pop.offsetHeight;if(r.bottom+h+16>window.innerHeight&&r.top>h+16)pop.style.top=(r.top+window.scrollY-h-8)+'px';
  }
  pop.querySelector('.gpop-x').addEventListener('click',function(){close(true)});
  pop.querySelector('.gpop-x').focus({preventScroll:true});
}
document.addEventListener('click',function(e){
  var a=e.target.closest&&e.target.closest('a.gpop');
  if(a){
    var s=window.getSelection&&window.getSelection();if(s&&!s.isCollapsed&&String(s).length>1){e.preventDefault();return;} /* selection and highlights win; do not navigate */
    e.preventDefault();if(cur===a&&!pop.hidden){close(false);return}open(a);return;
  }
  if(!pop.hidden&&!pop.contains(e.target))close(false);
});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'&&!pop.hidden){e.preventDefault();close(true);return}
  var a=e.target.closest&&e.target.closest('a.gpop');
  if(a&&e.key===' '){e.preventDefault();open(a)}
  if(e.key==='Tab'&&!pop.hidden&&pop.contains(document.activeElement)){
    var f=pop.querySelectorAll('button,a'),first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();close(true)}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();close(true)}
  }
});
window.addEventListener('resize',function(){close(false)});
function run(){
  document.querySelectorAll('article.text, .stext, #dText').forEach(function(s){
    var go=function(){mark(s)};(window.requestIdleCallback||setTimeout)(go);
  });
  var d=document.getElementById('dText');
  if(d&&window.MutationObserver){new MutationObserver(function(){if(d.querySelector('a.gpop')||!d.textContent.trim())return;d.removeAttribute('data-gpop');(window.requestIdleCallback||setTimeout)(function(){mark(d)})}).observe(d,{childList:true,subtree:true});}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
