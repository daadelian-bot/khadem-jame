(()=> {
  const holderId="kj-chat-frame-holder";
  const styleHidden="width:100vw;height:100dvh;min-height:100dvh;border:0;display:block;background:#fbfaf6";
  function holder(){
    let h=document.getElementById(holderId);
    if(!h){h=document.createElement("div");h.id=holderId;h.style.cssText="position:fixed;left:-120vw;top:0;width:100vw;height:100dvh;overflow:hidden;opacity:0;pointer-events:none;z-index:-1";document.body.appendChild(h)}
    return h;
  }
  function findFrame(){return document.getElementById("kj-persistent-chat-frame")||document.querySelector('iframe[title="ارتباطات خادمین"]')}
  function park(){
    const f=findFrame();if(!f)return;
    f.id="kj-persistent-chat-frame";holder().appendChild(f);f.style.cssText=styleHidden;
  }
  function restore(main){
    if(!main)return;
    const placeholder=main.querySelector('iframe[title="ارتباطات خادمین"]');
    const h=holder(),parked=h.querySelector("#kj-persistent-chat-frame");
    if(parked&&placeholder&&parked!==placeholder)placeholder.replaceWith(parked);
    const f=main.querySelector('iframe[title="ارتباطات خادمین"]');
    if(f){f.id="kj-persistent-chat-frame";f.removeAttribute("data-chat-placeholder");f.style.cssText="width:100%;height:calc(100dvh - 260px);min-height:640px;border:0;border-radius:18px;display:block;background:#fbfaf6"}
    renderDock();
  }
  const native=Object.getOwnPropertyDescriptor(Element.prototype,"innerHTML");
  if(native&&native.set&&!window.__kjChatPersistenceInstalled){
    window.__kjChatPersistenceInstalled=true;
    Object.defineProperty(Element.prototype,"innerHTML",{configurable:true,enumerable:native.enumerable,get(){return native.get.call(this)},set(value){
      if(this.id==="app")park();
      native.set.call(this,value);
      if(this.id==="kj-main")restore(this);
    }});
  }
  let callState={state:"ended"};
  function send(action){const f=findFrame();if(f&&f.contentWindow)f.contentWindow.postMessage({source:"khadem-parent",action},"*")}
  function renderDock(){
    let d=document.getElementById("kj-call-dock");
    if(!d){d=document.createElement("div");d.id="kj-call-dock";d.style.cssText="position:fixed;z-index:2147483000;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));max-width:520px;margin:auto;background:#123c35;color:#fff;border:1px solid #c8a65d;border-radius:18px;padding:12px;box-shadow:0 10px 35px #0004;font:14px/1.7 Tahoma,Arial,sans-serif";document.body.appendChild(d)}
    const f=findFrame(),hidden=f&&f.parentElement&&f.parentElement.id===holderId;
    if(!hidden||!callState.state||callState.state==="ended"){d.hidden=true;return}
    d.hidden=false;
    const title=callState.state==="incoming"?"📲 تماس ورودی":callState.state==="ringing"?"📞 در حال زنگ خوردن…":"☎️ تماس برقرار است";
    const safe=String(callState.name||"کاربر سامانه").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
    let actions=callState.state==="incoming"?'<button data-action="answer">پاسخ 📞</button><button data-action="reject">رد تماس ✖</button>':callState.state==="active"?'<button data-action="mute">🎙️ میکروفون</button><button data-action="speaker">🔊 صدا</button><button data-action="expand">بازگشت به تماس</button><button data-action="end">پایان 📵</button>':'<button data-action="expand">بازگشت به تماس</button><button data-action="end">لغو تماس 📵</button>';
    d.innerHTML='<strong>'+title+'</strong><div style="font-size:12px;opacity:.9;margin:4px 0 9px">'+safe+(callState.duration?" · "+callState.duration:"")+'</div><div style="display:flex;gap:6px;flex-wrap:wrap">'+actions+'</div>';
    d.querySelectorAll("button").forEach(b=>{b.style.cssText="border:0;border-radius:10px;padding:8px 10px;background:#f4edd9;color:#123c35;font:inherit;font-size:12px;font-weight:bold";b.addEventListener("click",()=>{const a=b.dataset.action;if(a==="expand"){document.querySelector('[data-tab="chat"]')?.click();setTimeout(()=>send("expand"),350)}else send(a)})});
  }
  window.addEventListener("message",e=>{
    const f=findFrame();const d=e.data;
    if(!f||e.source!==f.contentWindow||!d||d.source!=="khadem-chat"||d.type!=="call-state")return;
    callState=d;renderDock();
  });
  window.addEventListener("pageshow",()=>{const main=document.getElementById("kj-main");if(main)restore(main)});
})();