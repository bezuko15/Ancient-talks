/* Ancient Talk: Prayer corner (filters, copy, share as image via the quote-card feature in extras.js). */
(function(){
var btns=document.querySelectorAll('.pfilter button'),cards=document.querySelectorAll('.prayer'),cnt=document.getElementById('pcount');
function apply(f){var n=0;cards.forEach(function(c){var show=f==='all'||(' '+c.dataset.tags+' ').indexOf(' '+f+' ')>-1;c.hidden=!show;if(show)n++});
 btns.forEach(function(x){x.setAttribute('aria-pressed',String(x.dataset.f===f))});
 if(cnt)cnt.textContent=n+(n===1?' prayer':' prayers')+(f==='all'?'':' for '+f.charAt(0).toUpperCase()+f.slice(1));
 try{history.replaceState(null,'',f==='all'?location.pathname:'#'+f)}catch(e){}}
btns.forEach(function(b){b.addEventListener('click',function(){apply(b.dataset.f)})});
var h=(location.hash||'').slice(1);if(['morning','evening','lent','anytime','meals','before-meals','after-meals'].indexOf(h)>-1)apply(h);
function text(card){return [].map.call(card.querySelectorAll('.prayer-text p'),function(p){return p.innerText.trim()}).join('\n\n')}
cards.forEach(function(card){
 var c=card.querySelector('.pcopy'),s=card.querySelector('.pshare');
 if(c)c.addEventListener('click',function(){var t=text(card)+'\n\n— '+card.dataset.work+' ('+card.dataset.author+')\n'+location.href.split('#')[0]+'#'+card.id;
  var done=function(){c.textContent='Copied';setTimeout(function(){c.textContent='Copy text'},1800)};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(done,function(){c.textContent='Copy failed'});
  else{var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');done()}catch(e){}ta.remove()}});
 if(s){if(!window.ATQuote){s.hidden=true;return}
  s.addEventListener('click',function(){window.ATQuote(text(card).replace(/\n+/g,' '),card.dataset.author,card.dataset.work,'prayers.html#'+card.id)})}
});
})();
