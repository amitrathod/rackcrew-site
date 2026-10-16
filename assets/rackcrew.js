/* Shared data and helpers for the Rackcrew flows. Plain script; defines window.RC. */
(function(){
"use strict";
const TRADES = {
  turbine:   {name:"Turbine & power", short:"Turbine",    color:"#E2A13A", ink:"#3A1A0C", shirt:"#C8692A"},
  electrical:{name:"Electrical",      short:"Electrical", color:"#B3141C", ink:"#FFFFFF", shirt:"#E8473B"},
  hvac:      {name:"HVAC & cooling",  short:"HVAC",       color:"#E5793D", ink:"#2E1005", shirt:"#F7CDA6"},
  networks:  {name:"Networks & GPU",  short:"Networks",   color:"#2E3A6E", ink:"#FFFFFF", shirt:"#E3E7F6"}
};
const ICON = {
  turbine:'<circle cx="12" cy="12" r="2.2"/><path d="M12 9.8C12 6 13.6 3.6 16 3.4M14.1 13.1C17.4 15 18.6 17.6 17.5 19.8M9.9 13.1C6.6 15 3.8 14.8 2.5 12.8"/>',
  electrical:'<path d="M13 2.5 5.5 13.5h5.5L10 21.5l8-11h-5.5z"/>',
  hvac:'<path d="M12 2.5v19M3.8 7.2l16.4 9.6M3.8 16.8l16.4-9.6M9.5 4.2 12 6.5l2.5-2.3M9.5 19.8 12 17.5l2.5 2.3"/>',
  networks:'<circle cx="5" cy="6" r="2.2"/><circle cx="19" cy="6" r="2.2"/><circle cx="12" cy="18" r="2.2"/><path d="M6.8 7.3 10.6 16M17.2 7.3 13.4 16M7.2 6h9.6"/>'
};
const SKILLS = {
  turbine:["Gas turbines","Gensets and backup","Battery storage","Switchgear tie-in","Commissioning"],
  electrical:["Switchgear and UPS","Busway and PDUs","Substation and HV","Conduit and pull","Medium voltage","Commissioning"],
  hvac:["Liquid cooling","Chillers and CRAH","Controls and BMS","Pipefitting","Commissioning"],
  networks:["GPU cluster install","Rack and stack","Fiber splicing","Structured cabling","InfiniBand","Commissioning"]
};
const CERTS = {
  turbine:["OEM turbine training","EGSA certified","NFPA 70E","CDL Class A","OSHA 10","OSHA 30"],
  electrical:["Journeyman license","Master license","NFPA 70E","NETA Level II","NETA Level III","OSHA 10","OSHA 30"],
  hvac:["EPA 608 Universal","NATE","Niagara 4","UA journeyman","OSHA 10","OSHA 30"],
  networks:["BICSI Installer","BICSI Technician","FOA CFOT","CompTIA Server+","OSHA 10","OSHA 30"]
};
const esc = s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const $ = (s,el=document)=>el.querySelector(s);
const $$ = (s,el=document)=>[...el.querySelectorAll(s)];
function shade(hex,amt){const n=parseInt(hex.slice(1),16); const r=n>>16,g=(n>>8)&255,b=n&255;
  const f=v=>Math.max(0,Math.min(255,Math.round(amt<0?v*(1+amt):v+(255-v)*amt))); return "#"+[f(r),f(g),f(b)].map(v=>v.toString(16).padStart(2,"0")).join("");}
function icon(t,size=16,stroke="#fff"){return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[t]}</svg>`;}
let uid=0;
function face(trade,skin,hat,label){
  const T=TRADES[trade]||TRADES.electrical, id="fc"+(++uid), skinD=shade(skin,-0.22), shirt=T.shirt, band=trade==="networks"?"#FFB347":"#FFF3DF";
  let h="";
  if(hat==="hardhat") h=`<path d="M25 35C25 18 55 18 55 35Z" fill="#F7E7C6"/><rect x="21" y="32" width="38" height="5" rx="2.5" fill="#F7E7C6"/><path d="M40 21V32" stroke="#DCC79F" stroke-width="2.5" stroke-linecap="round"/>`;
  if(hat==="cap") h=`<path d="M26 34C26 20 54 20 54 34Z" fill="${shade(T.color,-0.25)}"/><path d="M50 31L64 33Q65 36 62 36L50 35Z" fill="${shade(T.color,-0.4)}"/>`;
  if(hat==="beanie") h=`<path d="M25 35C25 17 55 17 55 35Z" fill="${shade(T.color,0.25)}"/><rect x="24" y="31" width="32" height="6" rx="3" fill="${shade(T.color,0.1)}"/>`;
  if(hat==="bun") h=`<circle cx="31" cy="20" r="7" fill="#1E120C"/><path d="M27 38C25 24 38 21 53 28C47 26 39 28 34 35Z" fill="#1E120C"/>`;
  if(hat==="short") h=`<path d="M28 33C27 22 36 20 44 21C50 22 54 26 54 33C49 28 40 27 33 31Z" fill="#1E120C"/>`;
  return `<svg class="face" viewBox="0 0 80 80" role="img" aria-label="${esc(label||"Illustrated portrait")}"><defs><clipPath id="${id}"><circle cx="40" cy="40" r="40"/></clipPath></defs><g clip-path="url(#${id})">
  <rect width="80" height="80" fill="${T.color}"/><rect y="56" width="80" height="24" fill="${shade(T.color,-0.15)}"/>
  <path d="M10 82C12 62 68 62 70 82Z" fill="${shirt}"/><path d="M10 82C12 62 24 62 26 82Z" fill="${shade(shirt,-0.15)}"/>
  <path d="M15 72L65 70L66 74L15 76Z" fill="${band}"/>
  <rect x="35" y="44" width="10" height="16" rx="4" fill="${skinD}"/>
  <ellipse cx="40" cy="38" rx="13" ry="15" fill="${skinD}"/><ellipse cx="42.5" cy="38" rx="11" ry="14.5" fill="${skin}"/>
  <ellipse cx="47" cy="39" rx="1.7" ry="2" fill="#1E0F0A"/><path d="M45 46Q48 47.5 51 46" stroke="${skinD}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  ${h}</g></svg>`;
}
function avatar(trade,{skin="#B97650",hat="hardhat",photo=null,label=""}={}){
  const T=TRADES[trade]||TRADES.electrical;
  const pic = photo ? `<img class="face" src="${photo}" alt="${esc(label||"Profile photo")}">` : face(trade,skin,hat,label);
  return `<span class="ava">${pic}<span class="badge" style="background:${T.color}" title="${esc(T.name)}">${icon(trade,14,T.ink==="#FFFFFF"?"#fff":T.ink)}</span></span>`;
}
function progress(i,n){ return `<span class="txt">Step ${i} of ${n}</span><span class="bars" aria-hidden="true">${Array.from({length:n},(_,k)=>`<span class="${k<i?"on":""}"></span>`).join("")}</span>`; }
const today=new Date(); today.setHours(0,0,0,0);
const iso=d=>{const x=new Date(d); x.setMinutes(x.getMinutes()-x.getTimezoneOffset()); return x.toISOString().slice(0,10);};
const addDays=(d,n)=>{const x=new Date(d); x.setDate(x.getDate()+n); return x;};
const fmtLong=d=>new Date(d).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
window.RC={TRADES,ICON,SKILLS,CERTS,esc,$,$$,shade,icon,face,avatar,progress,today,iso,addDays,fmtLong};
})();
