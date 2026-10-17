(()=> {
 const holderId="kj-chat-frame-holder", state={state:"ended"};
 const hiddenStyle="width:100vw;height:100dvh;min-height:100dvh;border:0;display:block;background:#fbfaf6";
 function holder(){let h=document.getElementById(holderId);if(!h){h=document.createElement("div");h.id=holderId;h.style.cssText="position:fixed;left:-120vw;top:0;width:100vw;height:100dvh;overflow:hidden;opacity:0;pointer-events:none;z-index:-1";document.body.appendChild(h)}return h}
 function frame(){return document.getElementById("kj-persistent-chat-frame")||document.querySelector('iframe[title="ارتباطات خادمین"]')}
 function park(){const f=frame();if(!f)return;f.id="kj-persistent-chat-frame";holder().appendChild(f);f.style.cssText=hiddenStyle}
 function restore(){
  const main=document.getElementById("kj-main");if(!main)return;
  const placeholder=main.querySelector('iframe[title="ارتباطات خادمین"]'),h=holder(),parked=h.querySelector("#kj-persistent-chat-frame");
  if(parked&&placeholder&&parked!==placeholder)placeholder.replaceWith(parked);
  let f=main.querySelector('iframe[title="ارتباطات خادمین"]');
  if(!f&&document.querySelector('[data-tab="chat"].active')&&parked){main.appendChild(parked);f=parked}
  if(f){f.id="kj-persistent-chat-frame";f.style.cssText="width:100%;height:calc(100dvh - 260px);min-height:640px;border:0;border-radius:18px;display:block;background:#fbfaf6"}
  dock();
 }
 function send(action){const f=frame();if(f&&f.contentWindow)f.contentWindow.postMessage({source:"khadem-parent",action},"*")}
 function dock(){
  let d=document.getElementById("kj-call-dock");if(!d){d=document.createElement("div");d.id="kj-call-dock";d.style.cssText="position:fixed;z-index:2147483000;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));max-width:520px;margin:auto;background:#123c35;color:white;border:1px solid #c8a65d;border-radius:18px;padding:12px;box-shadow:0 10px 35px #0004;font:14px/1.7 Tahoma,Arial,sans-serif";document.body.appendChild(d)}
  const f=frame(),offscreen=f&&f.parentElement&&f.parentElement.id===holderId;
  if((!offscreen&&state.state!=="minimized")||!state.state||state.state==="ended"){d.hidden=true;return}
  d.hidden=false;
  const title=state.state==="incoming"?"📲 تماس ورودی":state.state==="ringing"?"📞 در حال زنگ خوردن…":state.state==="minimized"?"📞 تماس در پنجرهٔ کوچک":"☎️ تماس برقرار است";
  const name=String(state.name||"کاربر سامانه").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const actions=state.state==="incoming"?'<button data-a="answer">پاسخ 📞</button><button data-a="reject">رد تماس ✖</button>':state.state==="active"?'<button data-a="mute">🎙️ میکروفون</button><button data-a="speaker">🔊 صدا</button><button data-a="expand">بازگشت به تماس</button><button data-a="end">پایان 📵</button>':'<button data-a="expand">بازگشت به تماس</button><button data-a="end">پایان تماس 📵</button>';
  d.innerHTML='<strong>'+title+'</strong><div style="font-size:12px;opacity:.9;margin:4px 0 9px">'+name+(state.duration?" · "+state.duration:"")+'</div><div style="display:flex;gap:6px;flex-wrap:wrap">'+actions+'</div>';
  if(state.state==="active"){const mb=d.querySelector('[data-a="mute"]');if(mb)mb.textContent=state.muted?"🔊 وصل میکروفون":"🔇 قطع میکروفون"}
  d.querySelectorAll("button").forEach(b=>{b.style.cssText="border:0;border-radius:10px;padding:8px 10px;background:#f4edd9;color:#123c35;font:inherit;font-size:12px;font-weight:bold";b.addEventListener("click",()=>{const a=b.dataset.a;if(a==="expand"){document.querySelector('[data-tab="chat"]')?.click();setTimeout(()=>send("expand"),500)}else send(a)})});
 }
 document.addEventListener("click",e=>{
  const f=frame();if(f&&f.parentElement&&!f.parentElement.matches("#"+holderId)&&!f.contains(e.target))park();
  setTimeout(()=>{if(document.querySelector('[data-tab="chat"].active'))restore();else dock()},0);
 },true);
 window.addEventListener("message",e=>{const f=frame(),d=e.data;if(!f||e.source!==f.contentWindow||!d||d.source!=="khadem-chat"||d.type!=="call-state")return;Object.assign(state,d);dock()});
 window.addEventListener("pageshow",()=>setTimeout(()=>{if(document.querySelector('[data-tab="chat"].active'))restore()},0));
})();