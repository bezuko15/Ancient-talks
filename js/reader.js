(function(){var b=document.getElementById('fontToggle');if(!b)return;
function set(on){document.body.classList.toggle('serif',on);b.setAttribute('aria-pressed',on);try{localStorage.setItem('at-serif',on?'1':'0')}catch(e){}}
var on=false;try{on=localStorage.getItem('at-serif')==='1'}catch(e){}set(on);
b.addEventListener('click',function(){set(!document.body.classList.contains('serif'))});})();
