document.querySelectorAll('[data-channel]').forEach(a=>a.href=CHANNEL_URL+(a.dataset.channel==='sub'?'?sub_confirmation=1':''));
function renderVideos(el,limit){ if(!el)return; const v=limit?VIDEOS.slice(0,limit):VIDEOS;
 el.innerHTML=v.map(x=>`<div>${x.id?`<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${x.id}" title="${x.title}" loading="lazy" allowfullscreen></iframe></div>`:`<div class="video">Coming soon</div>`}<p class="vcap">${x.title}</p></div>`).join('');}
renderVideos(document.getElementById('videos-featured'),4);renderVideos(document.getElementById('videos-all'));
const lib=document.getElementById('library');
if(lib){const q=document.getElementById('q'),a=document.getElementById('fa'),e=document.getElementById('fe'),c=document.getElementById('count');
 [...new Set(BOOKS.map(b=>b.author))].sort().forEach(x=>a.add(new Option(x,x)));
 const draw=()=>{const t=q.value.toLowerCase();const r=BOOKS.filter(b=>(!a.value||b.author==a.value)&&(!e.value||b.era==e.value)&&(b.title+b.author+b.desc).toLowerCase().includes(t));
  c.textContent=`${r.length} of ${BOOKS.length} works`;
  lib.innerHTML=r.map(b=>`<article class="card book"><span class="era">${b.era}</span><h3>${b.title}</h3><p class="by">${b.author}</p><p>${b.desc}</p><div class="actions">${b.read?`<a class="btn primary small" href="${b.read}">Read now</a>${b.epub?`<a class="btn ghost small" href="${b.epub}" download>Download EPUB</a>`:''}<span class="orig">Original source: <a href="${b.url}" target="_blank" rel="noopener">${b.src}</a></span>`:`<a class="btn ghost small" href="${b.url}" target="_blank" rel="noopener">Read on ${b.src} ↗</a><span class="orig">Scanned edition, hosted externally</span>`}</div></article>`).join('')||'<p>No works match.</p>';};
 [q,a,e].forEach(x=>x.addEventListener('input',draw));draw();}
