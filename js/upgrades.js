/* Ancient Talk: visitor stats, offline app (service worker), install button, save book offline. */
(function(){
var ROOT=document.documentElement.getAttribute('data-root')||'';
var C={GA_MEASUREMENT_ID:typeof GA_MEASUREMENT_ID!=='undefined'?GA_MEASUREMENT_ID:'',GOATCOUNTER_CODE:typeof GOATCOUNTER_CODE!=='undefined'?GOATCOUNTER_CODE:'',GOOGLE_SITE_VERIFICATION:typeof GOOGLE_SITE_VERIFICATION!=='undefined'?GOOGLE_SITE_VERIFICATION:'',BING_SITE_VERIFICATION:typeof BING_SITE_VERIFICATION!=='undefined'?BING_SITE_VERIFICATION:''};
function cfg(n){return C[n]||''}
// ---- GoatCounter (only when GOATCOUNTER_CODE is set)
var gc=String(cfg('GOATCOUNTER_CODE')||'').trim();
if(gc&&/^[a-z0-9-]+$/i.test(gc)&&location.protocol.indexOf('http')===0){var s=document.createElement('script');s.async=true;s.src='https://gc.zgo.at/count.js';s.setAttribute('data-goatcounter','https://'+gc+'.goatcounter.com/count');document.body.appendChild(s)}
// ---- Google Analytics (only when GA_MEASUREMENT_ID is set)
var ga=String(cfg('GA_MEASUREMENT_ID')||'').trim();
if(ga&&/^G-[A-Z0-9]+$/i.test(ga)&&location.protocol.indexOf('http')===0){var g=document.createElement('script');g.async=true;g.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(ga);document.head.appendChild(g);window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments)};window.gtag('js',new Date());window.gtag('config',ga)}
// ---- verification meta (static copy in index.html is what search engines use)
[['google-site-verification','GOOGLE_SITE_VERIFICATION'],['msvalidate.01','BING_SITE_VERIFICATION']].forEach(function(p){var v=cfg(p[1]);if(v&&!document.querySelector('meta[name="'+p[0]+'"]')){var m=document.createElement('meta');m.name=p[0];m.content=v;document.head.appendChild(m)}});
// ---- service worker
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1'))window.addEventListener('load',function(){navigator.serviceWorker.register(ROOT+'sw.js').catch(function(){})});
// ---- install button / hint
var standalone=window.matchMedia&&matchMedia('(display-mode: standalone)').matches||navigator.standalone;
var btns=[].slice.call(document.querySelectorAll('[data-install]')),hints=[].slice.call(document.querySelectorAll('[data-install-hint]')),deferred=null;
if(standalone){btns.forEach(function(b){b.hidden=true})}
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferred=e;btns.forEach(function(b){b.hidden=false})});
btns.forEach(function(b){b.addEventListener('click',function(){if(!deferred)return;deferred.prompt();deferred.userChoice.finally(function(){deferred=null;btns.forEach(function(x){x.hidden=true})})})});
window.addEventListener('appinstalled',function(){btns.forEach(function(x){x.hidden=true})});
// ---- save this book for offline
[].slice.call(document.querySelectorAll('[data-save-book]')).forEach(function(b){
  if(!('caches' in window)){b.hidden=true;return}
  var pages=b.getAttribute('data-pages').split(' ').map(function(p){return new URL(ROOT+'books/'+p,location.href).href});
  function done(){b.textContent='✓ Saved for offline';b.disabled=true;b.classList.add('saved')}
  caches.open('at-books').then(function(c){return c.match(pages[pages.length-1])}).then(function(r){if(r)done()});
  b.addEventListener('click',function(){b.disabled=true;var n=0;b.textContent='Saving… 0/'+pages.length;
    caches.open('at-books').then(function(c){return Promise.all(pages.map(function(u){return fetch(u).then(function(r){if(!r.ok)throw 0;return c.put(u,r)}).then(function(){b.textContent='Saving… '+(++n)+'/'+pages.length})}))}).then(done).catch(function(){b.disabled=false;b.textContent='Could not save. Try again when online'})});
});
})();
