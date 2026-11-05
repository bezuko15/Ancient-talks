(function(){
var DATA=window.AT_ICONS||[];
var sheet=document.getElementById('iconSheet');
var shareModal=document.getElementById('shareModal');
if(!sheet||!shareModal)return;
var canvas=document.getElementById('shareCanvas');
var preview=document.getElementById('sharePreview');
var titleEl=document.getElementById('shareTitle');
var chk=document.getElementById('shareWithQuote');
var status=document.getElementById('shareStatus');
var sheetImg=document.getElementById('sheetImg');
var sheetName=document.getElementById('sheetName');
var sheetNote=document.getElementById('sheetNote');
var sheetLinks=document.getElementById('sheetLinks');
var sheetShare=document.getElementById('sheetShare');
var sheetMap=document.getElementById('sheetMap');
var sheetClose=document.getElementById('sheetClose');
var cur=null, logo=new Image();
logo.crossOrigin='anonymous'; logo.src='img/emblem.png';
function setStatus(t){if(status)status.textContent=t||'';}
function find(slug){return DATA.find(function(x){return x.slug===slug})||null}
function openSheet(slug){
  cur=find(slug); if(!cur)return;
  sheetImg.src=cur.img; sheetImg.alt='Icon of '+cur.name;
  sheetName.textContent=cur.name;
  sheetNote.textContent=cur.note||'';
  sheetLinks.innerHTML='';
  (cur.links||[]).forEach(function(pair){
    var a=document.createElement('a'); a.href=pair[0]; a.textContent=pair[1]; sheetLinks.appendChild(a);
  });
  sheetMap.href='map.html#'+cur.slug;
  sheet.hidden=false; document.body.style.overflow='hidden';
  try{history.replaceState(null,'','#'+cur.slug)}catch(e){}
}
function closeSheet(){
  sheet.hidden=true;
  if(!shareModal.hidden)return;
  document.body.style.overflow='';
  try{if(location.hash)history.replaceState(null,'',location.pathname+location.search)}catch(e){}
}
function draw(){
  if(!cur||!canvas)return;
  var withQ=chk&&chk.checked&&cur.quote;
  var W=1080,H=withQ?1350:1080;
  canvas.width=W; canvas.height=H;
  var ctx=canvas.getContext('2d');
  ctx.fillStyle='#f4ecdf'; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='#7a1f2b'; ctx.lineWidth=18; ctx.strokeRect(18,18,W-36,H-36);
  var img=new Image(); img.crossOrigin='anonymous';
  img.onload=function(){
    var boxX=90, boxY=90, boxW=W-180, boxH=withQ?620:720;
    var s=Math.min(boxW/img.width, boxH/img.height);
    var dw=img.width*s, dh=img.height*s;
    var dx=boxX+(boxW-dw)/2, dy=boxY+(boxH-dh)/2;
    ctx.fillStyle='#1d1814'; ctx.fillRect(boxX,boxY,boxW,boxH);
    ctx.drawImage(img,dx,dy,dw,dh);
    ctx.fillStyle='#7a1f2b';
    ctx.font='700 54px "Cormorant Garamond",serif';
    ctx.textAlign='center';
    var nameY=boxY+boxH+70;
    wrap(ctx,cur.name,W/2,nameY,W-160,58);
    var y=nameY+70;
    if(withQ){
      ctx.fillStyle='#2a221c';
      ctx.font='italic 36px "Cormorant Garamond",serif';
      y=wrap(ctx,'\u201c'+cur.quote+'\u201d',W/2,y,W-160,44)+10;
      if(cur.qcite){ctx.font='600 28px "Source Sans 3",sans-serif'; ctx.fillStyle='#7a1f2b'; ctx.fillText(cur.qcite,W/2,y+10);}
    }
    try{ctx.globalAlpha=.95; ctx.drawImage(logo,70,H-110,56,56); ctx.globalAlpha=1;}catch(e){}
    ctx.fillStyle='#7a1f2b'; ctx.font='600 28px "Source Sans 3",sans-serif';
    ctx.textAlign='left'; ctx.fillText('Ancient Talk',140,H-72);
    ctx.font='400 24px "Source Sans 3",sans-serif'; ctx.fillStyle='#5a4a40';
    ctx.fillText('ancienttalks.com',140,H-40);
    if(preview){preview.src=canvas.toDataURL('image/png');}
    setStatus('');
  };
  img.onerror=function(){setStatus('Could not load the icon image.');};
  img.src=cur.img;
}
function wrap(ctx,text,x,y,maxW,lineH){
  var words=String(text).split(/\s+/), line='', yy=y;
  for(var i=0;i<words.length;i++){
    var test=line?line+' '+words[i]:words[i];
    if(ctx.measureText(test).width>maxW && line){ctx.fillText(line,x,yy); yy+=lineH; line=words[i];}
    else line=test;
  }
  if(line){ctx.fillText(line,x,yy); yy+=lineH;}
  return yy;
}
function openShare(){
  if(!cur)return;
  titleEl.textContent='Share: '+cur.name;
  if(chk){chk.checked=!!cur.quote; chk.disabled=!cur.quote; chk.parentElement.style.opacity=cur.quote?1:.55;}
  shareModal.hidden=false; document.body.style.overflow='hidden'; draw();
}
function closeShare(){
  shareModal.hidden=true;
  if(sheet.hidden) document.body.style.overflow='';
}
document.querySelectorAll('[data-open-icon]').forEach(function(b){
  b.addEventListener('click',function(){openSheet(b.getAttribute('data-open-icon'))});
});
sheet.addEventListener('click',function(e){if(e.target===sheet)closeSheet()});
sheetClose.addEventListener('click',closeSheet);
sheetShare.addEventListener('click',openShare);
shareModal.addEventListener('click',function(e){if(e.target===shareModal)closeShare()});
document.getElementById('shareClose').addEventListener('click',closeShare);
if(chk)chk.addEventListener('change',draw);
document.getElementById('shareDownload').addEventListener('click',function(){
  if(!canvas)return;
  var a=document.createElement('a');
  a.download=(cur?cur.slug:'icon')+(-(chk&&chk.checked?'quote':'name'))+'.png';
  a.href=canvas.toDataURL('image/png'); a.click();
});
document.getElementById('shareNative').addEventListener('click',async function(){
  if(!canvas)return;
  try{
    var blob=await new Promise(function(res){canvas.toBlob(res,'image/png')});
    var file=new File([blob],(cur?cur.slug:'icon')+'.png',{type:'image/png'});
    if(navigator.canShare&&navigator.canShare({files:[file]})){
      await navigator.share({files:[file],title:cur.name,text:cur.name+' — Ancient Talk',url:'https://ancienttalks.com/icons.html#'+cur.slug});
      setStatus('Shared.');
    } else { setStatus('Sharing files is not supported here — use Download instead.'); }
  }catch(e){ if(e&&e.name==='AbortError')return; setStatus('Share failed — try Download.'); }
});
document.getElementById('shareCopyLink').addEventListener('click',function(){
  var url=location.origin+location.pathname+'#'+(cur?cur.slug:'');
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(url).then(function(){setStatus('Link copied.');});
  else setStatus(url);
});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){ if(!shareModal.hidden)closeShare(); else if(!sheet.hidden)closeSheet(); }
});
var h=(location.hash||'').slice(1);
if(h&&find(h)) openSheet(h);
})();
