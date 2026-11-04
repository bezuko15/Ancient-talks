(function(){function s(){var t=new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});document.querySelectorAll('.at-datebar-text').forEach(function(e){e.textContent=t;});}
if(document.readyState!=='loading')s();else document.addEventListener('DOMContentLoaded',s);
document.addEventListener('visibilitychange',function(){if(!document.hidden)s();});})();
