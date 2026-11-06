/* Ancient Talk PWA polish: install banner (Android beforeinstallprompt / iPhone Safari guide), standalone back control, external links. */
(function(){
var d=document,h=d.documentElement,ROOT=h.getAttribute('data-root')||'',KEY='at-install-dismissed';
var standalone=(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true;
if(standalone)h.classList.add('at-standalone');
function svg(p){return '<svg class="at-ico" viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>'}
var I={phone:svg('<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M12 7.5v6.5m-2.7-2.7L12 14l2.7-2.7M10.5 18.5h3"/>'),dl:svg('<path d="M12 4v11m-4.5-4.5L12 15l4.5-4.5M5 19h14"/>'),x:svg('<path d="M6 6l12 12M18 6L6 18"/>'),
 share:svg('<path d="M12 3v12m-4-8 4-4 4 4M7 11H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1"/>'),
 add:svg('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8.5v7M8.5 12h7"/>'),back:svg('<path d="M15 5l-7 7 7 7"/>'),pc:svg('<rect x="3" y="4" width="18" height="12" rx="1.8"/><path d="M8 20h8M12 16v4M12 7v5.5m-2.3-2.3L12 12.5l2.3-2.3"/>')};
// ---- back control in standalone (no browser chrome)
if(standalone&&!/(^|\/)(index\.html)?$/.test(location.pathname)){
 var b=d.createElement('button');b.type='button';b.className='at-backbar';b.innerHTML=I.back+'Back';b.setAttribute('aria-label','Go back');
 b.onclick=function(){if(history.length>1&&d.referrer&&d.referrer.indexOf(location.origin)===0)history.back();else location.href=ROOT+'index.html'};
 d.body.appendChild(b);
}
// ---- external links: open in the system browser / new tab so the app keeps its place
if(standalone)d.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;
 try{var u=new URL(a.href,location.href)}catch(x){return}
 if(/^https?:$/.test(u.protocol)&&u.origin!==location.origin&&!a.target){a.target='_blank';a.rel='noopener'}},true);
if(standalone)return;
function dismissed(){try{var t=+localStorage.getItem(KEY);return t&&Date.now()-t<1000*60*60*24*30}catch(e){return false}}
function dismiss(){try{localStorage.setItem(KEY,String(Date.now()))}catch(e){}}
var ua=navigator.userAgent,isIOS=/iPhone|iPad|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
var isSafari=isIOS&&/Safari/.test(ua)&&!/CriOS|FxiOS|EdgiOS|OPiOS|GSA|Instagram|FBAN|FBAV/.test(ua);
var isMobile=isIOS||/Android|Mobi|Mobile|Silk|Kindle/i.test(ua),isDesktop=!isMobile;
var isEdge=/Edg\//.test(ua),isFF=/Firefox\//.test(ua),isMacSafari=!isIOS&&/Macintosh/.test(ua)&&/Safari/.test(ua)&&!/Chrome|Chromium|Edg\/|OPR|Firefox/.test(ua);
var banner=null,deferred=null,heroBtn=null,heroVisible=false;
var gets=[];
function go(e){if(e)e.preventDefault();if(deferred){deferred.prompt();deferred.userChoice.then(function(c){if(c.outcome==='accepted')setAvail(false)}).finally(function(){deferred=null;hide()})}else if(isSafari)sheet();else if(isDesktop)dsheet()}
function setAvail(on){gets.forEach(function(x){x.hidden=!on});if(!on)hide()}
// hero button (homepage only) + nav/footer "Get the app" links; hidden until install is possible
var hero=d.querySelector('.hero .wrap');
if(hero){heroBtn=d.createElement('button');heroBtn.type='button';heroBtn.className='btn primary at-hero-install';heroBtn.innerHTML=isDesktop?I.pc+'Install the app':I.phone+'Add to Home Screen';
 var yt=hero.querySelector('.btn');(yt&&yt.nextSibling?hero.insertBefore(heroBtn,yt.nextSibling):hero.appendChild(heroBtn));gets.push(heroBtn);
 if('IntersectionObserver' in window)new IntersectionObserver(function(en){heroVisible=en[0].isIntersecting;if(heroVisible)hide();else if(!heroBtn.hidden)offer()}).observe(heroBtn)}
var hs=d.querySelector('#siteNav .hsearch');var ul=hs?hs.parentNode:d.querySelector('#siteNav ul');if(ul){var li=d.createElement('li');li.className='at-nav-get';li.innerHTML='<a href="#" data-at-get>'+I.phone+'Get the app</a>';ul.insertBefore(li,hs||null);gets.push(li)}
var fl=d.querySelector('footer .flinks');if(fl){var a=d.createElement('a');a.href='#';a.setAttribute('data-at-get','');a.className='at-foot-get';a.innerHTML=I.phone+'Get the app';fl.insertBefore(a,fl.firstChild);gets.push(a)}
gets.forEach(function(x){x.hidden=true;(x.matches('li')?x.querySelector('a'):x).addEventListener('click',go)});
var sub='',lab='';
function offer(){if(!sub)return;if(heroBtn&&(heroVisible||!heroBtn.hidden&&!('IntersectionObserver' in window)))return;show(sub,lab,go)}
function show(sub,label,onGo){if(banner||dismissed())return;
 banner=d.createElement('div');banner.className='at-install';banner.setAttribute('role','region');banner.setAttribute('aria-label','Install Ancient Talk');
 banner.innerHTML='<img src="'+ROOT+'img/icon-192.png" alt=""><div class="t"><b>Ancient Talk</b><span>'+sub+'</span></div><button type="button" class="btn primary small at-go">'+I.dl+label+'</button><button type="button" class="at-x" aria-label="Dismiss">'+I.x+'</button>';
 d.body.appendChild(banner);requestAnimationFrame(function(){requestAnimationFrame(function(){banner.classList.add('show')})});
 banner.querySelector('.at-go').onclick=onGo;banner.querySelector('.at-x').onclick=function(){dismiss();hide()}}
function hide(){if(!banner)return;var x=banner;banner=null;x.classList.remove('show');setTimeout(function(){x.remove()},350)}
function sheet(T,B,L,cls){var bg=d.createElement('div'),s=d.createElement('div');bg.className='at-sheet-bg';s.className='at-sheet'+(cls?' '+cls:'');s.setAttribute('role','dialog');s.setAttribute('aria-modal','true');s.setAttribute('aria-labelledby','atSheetH');
 s.innerHTML='<div class="grab"></div><h2 id="atSheetH">'+(T||'Add to Home Screen')+'</h2><p>'+(B||'Read Ancient Talk full-screen, like an app, with saved books available offline.')+'</p><ol>'+(L||'<li>'+I.share+'<span>Tap <b>Share</b> in Safari’s toolbar</span></li><li>'+I.add+'<span>Choose <b>Add to Home Screen</b></span></li>')+'</ol><button type="button" class="btn primary">Got it</button>';
 d.body.appendChild(bg);d.body.appendChild(s);requestAnimationFrame(function(){requestAnimationFrame(function(){bg.classList.add('show');s.classList.add('show')})});
 function close(){bg.classList.remove('show');s.classList.remove('show');setTimeout(function(){bg.remove();s.remove()},360);d.removeEventListener('keydown',k)}
 function k(e){if(e.key==='Escape')close()}d.addEventListener('keydown',k);bg.onclick=close;var ok=s.querySelector('.btn');ok.onclick=function(){dismiss();hide();close()};ok.focus()}
function dsheet(){var c='<li>'+I.dl+'<span><b>Chrome or Edge:</b> click the install icon at the right of the address bar, or open the browser menu (⋮ or …) and choose <b>Install Ancient Talk</b>'+(isEdge?' (Edge: Apps › Install this site as an app)':'')+'</span></li>',
 m='<li>'+I.add+'<span><b>Safari on Mac:</b> choose <b>File › Add to Dock</b> (macOS Sonoma or newer)</span></li>',
 f='<li>'+I.x+'<span><b>Firefox:</b> installing sites as apps isn’t supported. Bookmark the site instead (Ctrl+D, or ⌘D on Mac).</span></li>';
 var L=isMacSafari?m+c+f:isFF?f+c+m:c+m+f;
 sheet('Install the app','Open Ancient Talk in its own window, like an app, with saved books available offline.',L,'at-sheet-desk')}
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferred=e;sub='Free · works offline';lab='Install';setAvail(true);setTimeout(offer,1500)});
window.addEventListener('appinstalled',function(){setAvail(false)});
d.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[data-install]');if(t&&isSafari&&t.tagName!=='A'){e.preventDefault();sheet()}});
if(isDesktop){setAvail(true);gets.forEach(function(x){var a=x.matches('li')?x.querySelector('a'):x;if(a!==heroBtn)a.innerHTML=I.pc+(x.matches('li')?'<span class="at-full">Get the app</span><span class="at-short">App</span>':'Get the app')})}
if(isSafari){sub='Add to Home Screen';lab='Get the app';setAvail(true);setTimeout(offer,2000)}
})();
