(function(){
 var root=document.getElementById("whatsNewList");
 var data=window.AT_WHATS_NEW||[];
 if(!root||!data.length) return;
 data.forEach(function(group){
  var h=document.createElement("h3");
  h.textContent=group.group;
  root.appendChild(h);
  var ul=document.createElement("ul");
  ul.className="whats-new-list";
  (group.items||[]).forEach(function(item){
   var li=document.createElement("li");
   var a=document.createElement("a");
   a.href=item.href;
   a.textContent=item.title;
   li.appendChild(a);
   if(item.note){
    var n=document.createElement("span");
    n.className="wn-note";
    n.textContent=" "+item.note;
    li.appendChild(n);
   }
   ul.appendChild(li);
  });
  root.appendChild(ul);
 });
})();
