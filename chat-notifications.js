(()=> {
  const buttonId="kj-enable-call-notifications";
  function frame(){return document.getElementById("kj-persistent-chat-frame")||document.querySelector('iframe[title="ارتباطات خادمین"]')}
  function addButton(){
    if(!("Notification" in window)||document.getElementById(buttonId))return;
    const b=document.createElement("button");b.id=buttonId;b.type="button";b.textContent="🔔 فعال‌سازی اعلان تماس";
    b.style.cssText="position:fixed;left:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:2147482500;border:1px solid #c8a65d;border-radius:12px;padding:9px 12px;background:#fff;color:#123c35;box-shadow:0 4px 18px #0002;font:12px Tahoma,Arial,sans-serif;font-weight:bold";
    b.addEventListener("click",async()=>{
      try{
        const permission=await Notification.requestPermission();
        if(permission!=="granted"){b.textContent="🔔 اجازه اعلان فعال نشد";return}
        b.textContent="🔔 اعلان تماس فعال است";
        try{const reg=await navigator.serviceWorker.ready;await reg.showNotification("اعلان تماس فعال شد",{body:"اعلان تماس برای این مرورگر فعال است.",tag:"khadem-call-ready"})}catch{}
      }catch{b.textContent="خطا در فعال‌سازی اعلان"}
    });
    document.body.appendChild(b);
  }
  function notify(data){
    if(!data||data.source!=="khadem-chat"||data.type!=="call-state"||data.state!=="incoming"||!("Notification" in window)||Notification.permission!=="granted")return;
    const name=String(data.name||"کاربر سامانه").replace(/[&<>"]/g,"");
    const options={body:name+" با شما تماس می‌گیرد.",tag:"khadem-call-"+String(data.callId||"incoming"),renotify:true};
    navigator.serviceWorker?.ready.then(reg=>reg.showNotification("📲 تماس ورودی خادمین",options)).catch(()=>{try{new Notification("📲 تماس ورودی خادمین",options)}catch{}});
  }
  window.addEventListener("message",e=>{const f=frame();if(f&&e.source===f.contentWindow)notify(e.data)});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",addButton,{once:true});else addButton();
})();