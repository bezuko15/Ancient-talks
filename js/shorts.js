(function(){
var btns=document.querySelectorAll('.sfilter button');
btns.forEach(function(b){b.addEventListener('click',function(){var f=b.dataset.f;
 btns.forEach(function(x){x.setAttribute('aria-pressed',x===b)});
 document.querySelectorAll('.short').forEach(function(c){c.hidden=!(f==='all'||c.dataset.len===f)});});});
document.querySelectorAll('.short .toggle').forEach(function(t){t.addEventListener('click',function(){
 var q=t.parentNode.querySelector('.stext'),open=q.dataset.collapsed==='true';q.dataset.collapsed=open?'false':'true';
 t.setAttribute('aria-expanded',open);t.textContent=open?'Show less':'Show the rest of this short';
 if(!open)t.closest('.short').scrollIntoView({block:'start'});});});
document.querySelectorAll('.short .copy').forEach(function(c){c.addEventListener('click',function(){
 var card=c.closest('.short'),txt=[].map.call(card.querySelectorAll('.stext p'),function(p){return p.textContent}).join('\n\n')+'\n\n— '+card.querySelector('.by').textContent;
 var done=function(){c.textContent='Copied';setTimeout(function(){c.textContent='Copy text'},1800)};
 if(navigator.clipboard)navigator.clipboard.writeText(txt).then(done,function(){});});});
})();
