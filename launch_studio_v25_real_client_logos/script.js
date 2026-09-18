const localVideos={reel:"videos/reel.mp4",orbit:"videos/orbit.mp4",northstar:"videos/northstar.mp4",flux:"videos/flux.mp4"};
const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer=window.matchMedia("(hover:hover) and (pointer:fine)").matches;

const clientTrack=document.getElementById("client-track");
const clientLogoSlots=[
  {name:"Blonde Waterfall",logo:"clients/client-01.png"},
  {name:"Shapes",logo:"clients/client-02.png"},
  {name:"Island",logo:"clients/client-03.png"},
  {name:"ands.",logo:"clients/client-04.png"},
  {name:"G",logo:"clients/client-05.png"},
  {name:"LatentGraph",logo:"clients/client-06.png"},
  {name:"Pointy",logo:"clients/client-07.png"},
  {name:"onubello",logo:"clients/client-08.png"},
  {name:"Willow",logo:"clients/client-09.png"}
];
if(clientTrack){
  const makeLogo=(client)=>`<div class="client-logo"><img src="${client.logo}" alt="${client.name}" loading="eager" decoding="async" draggable="false"><span>${client.name}</span></div>`;
  const makeSet=()=>`<div class="client-set">${clientLogoSlots.map(makeLogo).join("")}</div>`;
  clientTrack.innerHTML=makeSet()+makeSet();
  clientTrack.querySelectorAll(".client-logo").forEach(card=>{
    const img=card.querySelector("img"), fallback=card.querySelector("span");
    const showFallback=()=>{img.hidden=true;fallback.hidden=false;};
    fallback.hidden=true;
    img.addEventListener("error",showFallback,{once:true});
  });
  const pause=()=>clientTrack.classList.add("is-paused");
  const resume=()=>clientTrack.classList.remove("is-paused");
  clientTrack.addEventListener("mouseenter",pause);
  clientTrack.addEventListener("mouseleave",resume);
  clientTrack.addEventListener("touchstart",pause,{passive:true});
  clientTrack.addEventListener("touchend",resume,{passive:true});
}
const socialLinks=window.SOCIAL_LINKS||{};
Object.entries(socialLinks).forEach(([key,url])=>{const el=document.querySelector(`[data-social="${key}"]`);if(el&&url)el.href=url;});
const vimeoButton=document.querySelector("[data-vimeo]");
if(vimeoButton&&window.VIMEO_PORTFOLIO_URL)vimeoButton.href=window.VIMEO_PORTFOLIO_URL;
function sourceFor(key){return localVideos[key];}

function primeProjectVideo(v){
  v.addEventListener("loadeddata",()=>{
    try{v.currentTime=0;}catch(e){}
    v.pause();
  },{once:true});
  v.load();
}

document.querySelectorAll("video[data-video]").forEach(v=>{
  const key=v.dataset.video;
  v.src=sourceFor(key);
  v.setAttribute("playsinline","");
  if(key!=="reel"){
    v.preload="auto";v.muted=false;v.defaultMuted=false;v.controls=false;
    primeProjectVideo(v);
  }
});

const reel=document.querySelector('video[data-video="reel"]');
const soundToggle=document.querySelector(".sound-toggle");
if(reel){
  reel.autoplay=true;reel.loop=true;reel.muted=true;reel.defaultMuted=true;reel.controls=false;reel.preload="auto";
  const start=()=>reel.play().catch(()=>{});
  ["loadedmetadata","loadeddata","canplay","canplaythrough"].forEach(ev=>reel.addEventListener(ev,start));
  reel.addEventListener("ended",()=>{reel.currentTime=0;start()});
  reel.addEventListener("pause",()=>{if(!document.hidden)setTimeout(()=>{if(reel.paused)start()},80)});
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)start()});
  start();
}
if(soundToggle&&reel){
  soundToggle.addEventListener("click",()=>{
    reel.muted=!reel.muted;
    soundToggle.classList.toggle("is-muted",reel.muted);
    soundToggle.setAttribute("aria-pressed",String(!reel.muted));
    soundToggle.setAttribute("aria-label",reel.muted?"Unmute showreel":"Mute showreel");
    reel.play().catch(()=>{});
  });
}

// Core reveal observer: sections stay visible even if an observer is unavailable.
const revealObserver=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("is-visible");revealObserver.unobserve(e.target)}});
},{threshold:.12,rootMargin:"0px 0px -7% 0px"});
document.querySelectorAll(".motion-reveal").forEach(el=>revealObserver.observe(el));
document.querySelectorAll(".reveal").forEach(el=>{el.classList.add("motion-reveal");if(reduceMotion)el.classList.add("is-visible");else revealObserver.observe(el)});

// Add controlled reveals to existing content — no markup redesign required.
const revealTargets=[
  ".client-intro > *",".manifesto-grid > *",".work-heading > *",".services-intro > *",
  ".estimate-intro > *",".about-grid > *",".service",".facts > div",".project-meta"
];
let delay=0;
revealTargets.forEach(selector=>document.querySelectorAll(selector).forEach(el=>{
  el.classList.add("motion-reveal");
  el.dataset.delay=String(delay%4);delay++;
  if(reduceMotion) el.classList.add("is-visible"); else revealObserver.observe(el);
}));

document.querySelectorAll(".section-label").forEach(el=>revealObserver.observe(el));

// Project video interaction: hover preview on desktop, tap-to-play on touch.
document.querySelectorAll(".project").forEach(project=>{
  const video=project.querySelector("video"),btn=project.querySelector(".play-toggle");
  if(!video||!btn)return;
  if(finePointer){
    project.addEventListener("mouseenter",()=>{video.muted=true;video.play().catch(()=>{})});
    project.addEventListener("mouseleave",()=>{video.pause();video.currentTime=0;btn.querySelector(".play-label").textContent="Play"});
  }
  btn.addEventListener("click",e=>{
    e.preventDefault();e.stopPropagation();
    if(video.paused){video.muted=false;video.play().catch(()=>{});btn.querySelector(".play-label").textContent="Pause"}
    else{video.pause();btn.querySelector(".play-label").textContent="Play"}
  });
});

// Estimator.
const prices=window.PRICES||{type:{feature:1500,launch:2500,social:750,brand:3500},level:{standard:0,premium:750,cinematic:1500},speed:{normal:0,fast:500,rush:1000}};
const state={type:"feature",level:"standard",speed:"normal"};
const output=document.getElementById("estimate-value");
function updateEstimate(){
  const base=prices.type[state.type]+prices.level[state.level]+prices.speed[state.speed];
  if(!output)return;
  output.classList.add("changing");
  setTimeout(()=>{output.textContent=`$${base.toLocaleString()} — $${Math.round(base*1.5).toLocaleString()}`;output.classList.remove("changing")},120);
}
document.querySelectorAll(".choices").forEach(group=>{
  const name=group.dataset.group,buttons=group.querySelectorAll("button");
  buttons[0]?.classList.add("active");
  buttons.forEach(b=>b.addEventListener("click",()=>{
    buttons.forEach(x=>x.classList.remove("active"));b.classList.add("active");state[name]=b.dataset.value;updateEstimate();
  }));
});
updateEstimate();

// Mobile navigation: fixed stacking, Escape, outside-click, and body lock.
const menu=document.querySelector(".menu"),mobile=document.querySelector(".mobile-nav");
function closeMenu(){if(!mobile)return;mobile.classList.remove("open");document.body.classList.remove("lock");menu?.setAttribute("aria-expanded","false");}
function toggleMenu(){if(!mobile)return;const open=mobile.classList.toggle("open");document.body.classList.toggle("lock",open);menu?.setAttribute("aria-expanded",String(open));}
menu?.addEventListener("click",toggleMenu);
mobile?.querySelectorAll("a").forEach(a=>a.addEventListener("click",closeMenu));
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeMenu()});
mobile?.addEventListener("click",e=>{if(e.target===mobile)closeMenu()});

// Header state + scroll progress.
const header=document.querySelector(".header");
const progress=document.createElement("div");
progress.className="scroll-progress";
progress.innerHTML="<span></span>";
Object.assign(progress.style,{position:"fixed",top:"0",left:"0",width:"100%",height:"2px",zIndex:"90",pointerEvents:"none"});
Object.assign(progress.firstElementChild.style,{display:"block",height:"100%",width:"0",background:"var(--ink)",transformOrigin:"left"});
document.body.appendChild(progress);
let scrollRaf=0;
function updateScroll(){
  const max=document.documentElement.scrollHeight-window.innerHeight;
  const pct=max>0?(window.scrollY/max)*100:0;
  progress.firstElementChild.style.width=`${pct}%`;
  header?.classList.toggle("scrolled",window.scrollY>34);
  scrollRaf=0;
}
window.addEventListener("scroll",()=>{if(!scrollRaf){scrollRaf=requestAnimationFrame(updateScroll)}},{passive:true});
updateScroll();

// Smooth, isolated parallax. It writes CSS variables instead of fighting hover transforms.
const parallaxItems=[...document.querySelectorAll(".hero-reel,.project-media")];
function updateParallax(){
  if(reduceMotion)return;
  const vh=window.innerHeight;
  parallaxItems.forEach(el=>{
    const r=el.getBoundingClientRect();
    if(r.bottom<0||r.top>vh)return;
    const delta=(r.top+r.height/2-vh/2)/vh;
    el.style.setProperty("--media-y",`${(delta*-6).toFixed(2)}px`);
    if(el.classList.contains("project-media"))el.style.setProperty("--reel-scale",`${(1+Math.max(-.012,Math.min(.012,-delta*.012))).toFixed(4)}`);
  });
}
let pRaf=0;
window.addEventListener("scroll",()=>{if(!pRaf){pRaf=requestAnimationFrame(()=>{updateParallax();pRaf=0})}},{passive:true});
updateParallax();

// Small pointer treatment, intentionally limited to controls — never modifies layout transforms on media.
if(finePointer&&!reduceMotion){
  const cursor=document.querySelector(".cursor-dot");
  window.addEventListener("pointermove",e=>{if(cursor){cursor.style.opacity="1";cursor.style.left=e.clientX+"px";cursor.style.top=e.clientY+"px"}}, {passive:true});
  document.querySelectorAll(".button,.header-cta").forEach(el=>{
    el.addEventListener("pointermove",e=>{
      const r=el.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)*.035,y=(e.clientY-r.top-r.height/2)*.035;
      el.style.translate=`${x.toFixed(1)}px ${y.toFixed(1)}px`;
    });
    el.addEventListener("pointerleave",()=>{el.style.translate="0 0"});
  });
}
