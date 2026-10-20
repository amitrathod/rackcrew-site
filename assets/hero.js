/* Rackcrew hero: three scenes rendered as a red pixel mosaic behind the headline.
   Each scene plays /media/<name>.mp4 if present; until then it draws an animated pixel stand-in.
   Scenes change through a pixel dissolve, and the headline changes with them. */
(function(){
"use strict";
const SCENES=[
  {id:"racking", label:"Racking", video:"/media/racking.mp4",
   h:"Who’s building the AI boom?",
   p:"Not the chips. The people. Rackcrew puts turbine, electrical, HVAC and network crews on data center sites."},
  {id:"cooling", label:"Cooling", video:"/media/cooling.mp4",
   h:"Who keeps the GPUs cool?",
   p:"Chiller, controls and liquid cooling techs who keep ten thousand GPUs from cooking."},
  {id:"cabling", label:"Cabling", video:"/media/cabling.mp4",
   h:"Who threads the fiber?",
   p:"Fiber splicers and cabling techs who wire the network the models run on."}
];
const HOLD=8000, FADE=1100;
const root=document.getElementById("hero"); if(!root) return;
const cv=root.querySelector("canvas.hero-px"), ctx=cv.getContext("2d");
const hEl=document.getElementById("top"), pEl=document.getElementById("hero-sub");
const tabs=[...root.querySelectorAll("[data-scene]")], pauseBtn=root.querySelector("#hero-pause");
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---- sources: a video per scene, with a procedural stand-in ---- */
const sample=document.createElement("canvas"), sctx=sample.getContext("2d",{willReadFrequently:true});
SCENES.forEach(s=>{
  const v=document.createElement("video");
  Object.assign(v,{muted:true,loop:true,playsInline:true,preload:"auto"});
  v.setAttribute("muted",""); v.setAttribute("playsinline","");
  s.ok=false; s.v=v;
  v.addEventListener("loadeddata",()=>{s.ok=true;});
  v.addEventListener("error",()=>{s.ok=false;},true);
  v.src=s.video;
});
const hash=(x,y,k)=>{let h=(x*374761393+y*668265263+k*2147483647)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967295;};
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t);};
const FIELD={
  racking(x,y,t,C,R){ // rack columns with blinking status lights and a slow "server" sliding in
    const col=x%7, rack=Math.floor(x/7); if(col===0||col===6) return 0.05;
    const unit=Math.floor(y/2), gap=(y%2===1)?0.55:1;
    const blink=hash(rack,unit,Math.floor(t*2+hash(rack,unit,1)*4))>0.82?1:0;
    const slide=(rack%3===1&&unit===Math.floor(R/4))? smooth(0,1,((t*0.25)%1)*1.4-(col/6)) : 0;
    return Math.max(0.18*gap+0.7*blink*(col===5?1:0.35), slide*0.9);
  },
  cooling(x,y,t){ // air flowing through a hot aisle
    const w=Math.sin(x*0.22-t*1.6+Math.sin(y*0.18+t*0.7)*2.2);
    return Math.max(0,0.12+0.55*(w*0.5+0.5)*smooth(0,1,Math.sin(y*0.35+t*0.9)*0.5+0.6));
  },
  cabling(x,y,t){ // bundles of cable runs with light traveling along them
    const d=(x+y*0.55)%9, run=d<1.6?1:0;
    const pulse=((x*0.8+y*0.44-t*14)%26+26)%26<3?1:0;
    return run*(0.3+0.65*pulse)+0.04;
  }
};
let C=0,R=0,cell=14,lum=[new Float32Array(0),new Float32Array(0)],rnd=new Float32Array(0);
/* reserve the tallest headline so the hero never jumps between scenes */
function reserve(){
  const box=hEl.parentElement, h0=hEl.textContent, p0=pEl.textContent; let max=0;
  box.style.minHeight="";
  SCENES.forEach(sc=>{ hEl.textContent=sc.h; pEl.textContent=sc.p; max=Math.max(max,box.offsetHeight); });
  hEl.textContent=h0; pEl.textContent=p0; box.style.minHeight=max+"px";
}
function size(){
  const r=root.getBoundingClientRect(), dpr=Math.min(2,devicePixelRatio||1);
  cell=r.width<760?10:14;
  cv.width=Math.round(r.width*dpr); cv.height=Math.round(r.height*dpr);
  cv.style.width=r.width+"px"; cv.style.height=r.height+"px";
  ctx.setTransform(dpr,0,0,dpr,0,0);
  C=Math.ceil(r.width/cell); R=Math.ceil(r.height/cell);
  sample.width=C; sample.height=R;
  lum=[new Float32Array(C*R),new Float32Array(C*R)];
  rnd=new Float32Array(C*R); for(let i=0;i<rnd.length;i++) rnd[i]=hash(i%C,(i/C)|0,7);
}
function read(scene,t,out){
  if(scene.ok && scene.v.readyState>=2){
    const v=scene.v, vr=v.videoWidth/v.videoHeight, cr=C/R;
    let sw=v.videoWidth, sh=v.videoHeight, sx=0, sy=0;
    if(vr>cr){ sw=sh*cr; sx=(v.videoWidth-sw)/2; } else { sh=sw/cr; sy=(v.videoHeight-sh)/2; }
    try{
      sctx.drawImage(v,sx,sy,sw,sh,0,0,C,R);
      const d=sctx.getImageData(0,0,C,R).data;
      for(let i=0,j=0;i<out.length;i++,j+=4){ const l=(0.3*d[j]+0.59*d[j+1]+0.11*d[j+2])/255; out[i]=Math.pow(l,1.6); }
      return;
    }catch(e){ scene.ok=false; }
  }
  const f=FIELD[scene.id];
  for(let y=0,i=0;y<R;y++) for(let x=0;x<C;x++,i++) out[i]=f(x,y,t,C,R);
}
/* palette: deep red to cream, all within the brand's maroon world */
const STOPS=[[90,30,37],[179,20,28],[230,95,70],[251,214,196]];
function color(v){ const s=Math.min(STOPS.length-1.001,v*(STOPS.length-1)), i=Math.floor(s), f=s-i, a=STOPS[i], b=STOPS[i+1];
  return `rgb(${a[0]+(b[0]-a[0])*f|0},${a[1]+(b[1]-a[1])*f|0},${a[2]+(b[2]-a[2])*f|0})`; }

/* ---- state ---- */
let cur=0, nxt=0, tStart=performance.now(), fadeStart=0, fading=false, paused=reduce, shown=true, last=0, held=0;
function draw(now){
  const t=now/1000, narrow=C*cell<760;
  read(SCENES[cur],t,lum[0]);
  const p=fading?Math.min(1,(now-fadeStart)/FADE):0;
  if(fading) read(SCENES[nxt],t,lum[1]);
  ctx.clearRect(0,0,C*cell,R*cell);
  for(let y=0,i=0;y<R;y++){
    for(let x=0;x<C;x++,i++){
      // keep the headline side calm: pixels build up toward the right (softer everywhere on phones)
      const m=narrow? 0.38 : 0.05+0.95*smooth(0.34,0.86,x/C);
      let v=(fading&&rnd[i]<p)?lum[1][i]:lum[0][i];
      if(fading&&Math.abs(rnd[i]-p)<0.05) v=Math.max(v,0.95);   // the dissolve edge sparkles
      v*=m; if(v<0.05) continue;
      const s=cell*(0.25+0.68*Math.min(1,v));
      ctx.fillStyle=color(Math.min(1,v));
      ctx.fillRect(x*cell+(cell-s)/2,y*cell+(cell-s)/2,s,s);
    }
  }
  if(fading&&p>=1){ fading=false; cur=nxt; tStart=now; }
}
function setText(i){
  hEl.classList.add("swap"); pEl.classList.add("swap");
  setTimeout(()=>{ hEl.textContent=SCENES[i].h; pEl.textContent=SCENES[i].p; hEl.classList.remove("swap"); pEl.classList.remove("swap"); }, reduce?0:320);
  tabs.forEach((b,k)=>{ b.setAttribute("aria-pressed",k===i); });
}
function go(i){
  if(i===cur&&!fading) return;
  nxt=i; SCENES[i].v.play?.().catch(()=>{});
  if(reduce){ cur=i; fading=false; draw(performance.now()); } else { fading=true; fadeStart=performance.now(); }
  held=0; tStart=performance.now(); setText(i); progress(0);
}
function progress(f){ tabs.forEach((b,k)=>b.style.setProperty("--fill",k===(fading?nxt:cur)?f:0)); }
function loop(now){
  requestAnimationFrame(loop);
  if(!shown||document.hidden) { last=now; return; }
  if(reduce) return;   // one still frame, no motion
  const dt=now-last; last=now;
  if(!paused){ held+=dt; progress(Math.min(1,held/HOLD)); if(held>=HOLD) go((cur+1)%SCENES.length); }
  if(now-(loop.prev||0)>33||fading){ loop.prev=now; draw(now); }  // ~30 fps is plenty for a mosaic
}
tabs.forEach((b,k)=>b.addEventListener("click",()=>go(k)));
pauseBtn?.addEventListener("click",()=>{ paused=!paused; pauseBtn.setAttribute("aria-pressed",paused); pauseBtn.setAttribute("aria-label",paused?"Play background":"Pause background");
  SCENES.forEach(s=>paused?s.v.pause():null); if(!paused) SCENES[cur].v.play?.().catch(()=>{}); });
new IntersectionObserver(e=>{ shown=e[0].isIntersecting; }).observe(root);
addEventListener("resize",()=>{ reserve(); size(); draw(performance.now()); });
document.fonts?.ready.then(()=>{ reserve(); size(); });
reserve(); size(); SCENES[0].v.play?.().catch(()=>{});
if(reduce){ pauseBtn?.setAttribute("aria-pressed","true"); draw(performance.now()); }
last=performance.now(); requestAnimationFrame(loop);
})();
