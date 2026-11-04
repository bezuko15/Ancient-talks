document.addEventListener("DOMContentLoaded",function(){
if(!window.DAILY||!window.AT)return;var A=AT,now=new Date(),todayKey=A.key(now),n=DAILY.length;
var d=DAILY[((A.dayNum(now))%n+n)%n];
document.getElementById('poolN').textContent=n;
document.getElementById('dDate').textContent=now.toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'});
document.getElementById('dWork').textContent=d.work.replace(/^Shorts: /,'');
document.getElementById('dAuthor').textContent=d.author;
document.getElementById('dText').innerHTML=d.text.split(/\n\n/).map(function(p){return '<p>'+A.esc(p)+'</p>'}).join('');
document.getElementById('dMeta').textContent=[d.work.indexOf('Shorts: ')===0?'':d.work,d.part,d.section].filter(Boolean).join(' · ');
document.getElementById('dLink').href=d.link;
var log=A.ls('at-daily')||{};
function streakFrom(start){var c=0,x=new Date(start);while(log[A.key(x)]){c++;x.setDate(x.getDate()-1)}return c}
function render(){var y=new Date(now);y.setDate(y.getDate()-1);
 var s=log[todayKey]?streakFrom(now):streakFrom(y);
 var keys=Object.keys(log).sort(),best=0,run=0,prev=null;keys.forEach(function(k){var t=new Date(k+'T12:00:00');run=(prev&&Math.round((t-prev)/864e5)===1)?run+1:1;best=Math.max(best,run);prev=t});
 document.getElementById('sStreak').textContent=s;document.getElementById('sTotal').textContent=keys.length;document.getElementById('sBest').textContent=best;
 var b=document.getElementById('markRead');b.textContent=log[todayKey]?'✓ Read today':'Mark as read';b.setAttribute('aria-pressed',!!log[todayKey]);
 document.getElementById('dNote').textContent=log[todayKey]?'Well done. Come back tomorrow for the next passage.':'A new passage appears each day at midnight, your local time. Come back tomorrow for the next one.';
 var cal=document.getElementById('cal'),h='';for(var i=29;i>=0;i--){var x=new Date(now);x.setDate(x.getDate()-i);var k=A.key(x);h+='<div class="'+(log[k]?'on ':'')+(i===0?'today':'')+'" title="'+k+(log[k]?' (read)':'')+'">'+x.getDate()+'</div>'}cal.innerHTML=h}
document.getElementById('markRead').addEventListener('click',function(){if(log[todayKey])delete log[todayKey];else log[todayKey]=d.n;A.ls('at-daily',log);render()});
render();
});
