/* V2.2.38 // ECTO DISPATCH CORE REBUILD */
(function(){
  "use strict";
  const q=id=>document.getElementById(id), esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const KEY="ecto-os-vehicle-fleet-v1";
  const defaults=[
    {id:"ecto-response",name:"ECTO RESPONSE",type:"SPORTS CAR",callsign:"ECTO RESPONSE",defaultLocation:"Portsmouth [PSM-14]",status:"AVAILABLE"},
    {id:"ecto-01",name:"ECTO-01",type:"PRIMARY RESPONSE VEHICLE",callsign:"ECTO-01",defaultLocation:"London HQ [LON-01]",status:"AVAILABLE"},
    {id:"ecto-02",name:"ECTO-02",type:"SECONDARY RESPONSE VEHICLE",callsign:"ECTO-02",defaultLocation:"Edinburgh [EDI-02]",status:"STANDBY"},
    {id:"ecto-03",name:"ECTO-03",type:"FIELD SUPPORT VEHICLE",callsign:"ECTO-03",defaultLocation:"Manchester [MCR-03]",status:"AVAILABLE"}
  ];
  let fleet=[];
  function loadFleet(){try{const raw=localStorage.getItem(KEY);const p=raw?JSON.parse(raw):null;fleet=Array.isArray(p)?p:defaults.map(v=>({...v}));if(!fleet.length)fleet=defaults.map(v=>({...v}));}catch(e){fleet=defaults.map(v=>({...v}));}}
  function saveFleet(){try{localStorage.setItem(KEY,JSON.stringify(fleet));}catch(e){}}
  loadFleet();
  function loc(){return Array.isArray(window.ukFranchises)?window.ukFranchises[Number.isInteger(window.selectedMapIndex)?window.selectedMapIndex:0]:null;}
  function cityName(f){return String(f?.city||"");}
  function locKey(f){return String(f?.locationId||f?.id||f?.city||"").toUpperCase();}
  function vehiclesFor(f){
    if(!f)return[];
    const city=cityName(f).toUpperCase();
    return fleet.filter(v=>String(v.defaultLocation||"").split(" [")[0].trim().toUpperCase()===city && String(v.status||"").toUpperCase()==="AVAILABLE");
  }
  function team(){const f=loc();return f&&Array.isArray(f.teams)?f.teams[window.activeSubTeamIndex||0]:null;}
  function preflightReady(){
    const t=team(); if(!t||!Array.isArray(t.members)||!t.members.length)return false;
    const selected=t.members.filter(m=>m.preflightSelected!==false);
    if(!selected.length)return false;
    return selected.every(m=>!!m.primaryEquipment && (!window.standardEquipment||window.standardEquipment.every(eq=>m.preflightChecks?.[eq])));
  }
  function selectedVehicle(){const f=loc();return f?.dispatchVehicleId?fleet.find(v=>String(v.id)===String(f.dispatchVehicleId))||null:null;}
  function selectedSite(){const f=loc();return f?.selectedInvestigationSite||f?.investigationSite||"";}
  function popup(title,subtitle,groups,cb){if(window.ectoUiLanguage?.open){window.ectoUiLanguage.open(title,subtitle,groups,cb);return;}}
  function refresh(){renderSummary();renderVehicleState();renderTeamState();}
  function renderSummary(){
    const f=loc(),t=team(),v=selectedVehicle();
    q("v238Location")&&(q("v238Location").textContent=f?`${f.city||"UNNAMED"} ${f.gridRef?"["+f.gridRef+"]":""}`:"SELECT LOCATION");
    q("v238Site")&&(q("v238Site").textContent=selectedSite()||"NO INVESTIGATION SITE SELECTED");
    q("v238Team")&&(q("v238Team").textContent=t?.teamName||"NO TEAM SELECTED");
    q("v238Vehicle")&&(q("v238Vehicle").textContent=v?.name||"NO VEHICLE ASSIGNED");
    const status=q("v238Ready"); if(status){const ok=!!f&&!!t&&!!v&&preflightReady();status.textContent=ok?"READY FOR DEPLOYMENT":"DEPLOYMENT INCOMPLETE";status.className=ok?"v238-ready ok":"v238-ready";}
  }
  function renderVehicleState(){
    const f=loc(),v=selectedVehicle(),el=q("v238VehicleMeta");if(!el)return;
    const available=vehiclesFor(f);el.textContent=f?(available.length?`${available.length} AVAILABLE VEHICLE${available.length===1?"":"S"} AT ${cityName(f).toUpperCase()}`:"NO AVAILABLE VEHICLES ASSIGNED TO THIS LOCATION"):"SELECT A LOCATION FIRST";
    if(v && !available.some(x=>String(x.id)===String(v.id))){if(f)delete f.dispatchVehicleId;}
  }
  function renderTeamState(){const el=q("v238TeamMeta"),t=team();if(!el)return;el.textContent=t?`${(t.members||[]).length} TEAM MEMBER${(t.members||[]).length===1?"":"S"} // PREFLIGHT ${preflightReady()?"READY":"REQUIRED"}`:"SELECT A TEAM FIRST";}
  function selectLocation(){
    const groups={};(window.ukFranchises||[]).forEach((f,i)=>{const key=String(f.sector||f.ukSector||"UK FIELD NETWORK");(groups[key] ||= []).push({title:f.city||`LOCATION ${i+1}`,meta:`${f.gridRef||f.cityGrid||"FIELD LOCATION"} // ${(f.investigationSites||f.sites||[]).length} INVESTIGATION SITE${((f.investigationSites||f.sites||[]).length===1?"":"S")}`,value:i});});
    popup("ECTO LOCATION DATABASE","SELECT DEPLOYMENT LOCATION",Object.entries(groups).map(([label,items])=>({label,items})),item=>{if(typeof window.selectSector==="function")window.selectSector(item.value);else window.selectedMapIndex=item.value;setTimeout(()=>{clearSite();refresh();},50);});
  }
  function siteList(){const f=loc();const sites=f?.investigationSites||f?.sites||[];return sites.map((s,i)=>{if(typeof s==="string")return{title:s,meta:"REGISTERED INVESTIGATION SITE",value:s};return{title:s.name||s.siteName||`SITE ${i+1}`,meta:s.gridRef||s.reference||"REGISTERED INVESTIGATION SITE",value:s.name||s.siteName||`SITE ${i+1}`};});}
  function clearSite(){const f=loc();if(f)delete f.selectedInvestigationSite;}
  function selectSite(){const f=loc();if(!f)return;const sites=siteList();if(!sites.length){popup("INVESTIGATION SITE DATABASE","NO REGISTERED SITES FOR SELECTED LOCATION",[{label:cityName(f),items:[{title:"NO INVESTIGATION SITES REGISTERED",meta:"ADD SITES IN LOCATION MANAGEMENT",disabled:true}]}],null);return;}popup("INVESTIGATION SITE DATABASE",cityName(f),[{label:"REGISTERED FIELD SITES",items:sites}],item=>{f.selectedInvestigationSite=item.value;refresh();});}
  function selectTeam(){const f=loc();if(!f)return;const teams=Array.isArray(f.teams)?f.teams:[];const items=teams.map((t,i)=>({title:t.teamName||`TEAM ${i+1}`,meta:`${(t.members||[]).length} MEMBERS`,value:i}));popup("ECTO TEAM DATABASE",cityName(f),[{label:"AVAILABLE TEAMS",items:items.length?items:[{title:"NO TEAMS REGISTERED",meta:"TEAM DATABASE EMPTY",disabled:true}]}],item=>{window.activeSubTeamIndex=item.value;refresh();if(typeof window.renderPreflight==="function")window.renderPreflight();});}
  function selectVehicle(){const f=loc();if(!f)return;const rows=vehiclesFor(f);const items=rows.map(v=>({title:v.name||"UNNAMED VEHICLE",meta:`${v.type||"ECTO VEHICLE"} // ${v.callsign||v.id}`,value:v.id}));popup("ECTO VEHICLE DATABASE","AVAILABLE FOR "+cityName(f).toUpperCase(),[{label:"AVAILABLE VEHICLES",items:items.length?items:[{title:"NO VEHICLES ASSIGNED",meta:"ASSIGN VEHICLE HOME LOCATION IN CONFIGURATION",disabled:true}]}],item=>{f.dispatchVehicleId=item.value;f.dispatchVehicleName=selectedVehicle()?.name||"";f.actionHistory=Array.isArray(f.actionHistory)?f.actionHistory:[];f.actionHistory.unshift({time:new Date().toTimeString().slice(0,8),text:`${f.dispatchVehicleName} ASSIGNED TO ${f.city}`});saveFleet();refresh();});}
  function openPreflight(){if(typeof window.renderPreflight==="function")window.renderPreflight();show("fieldops");}
  function show(id){document.querySelectorAll(".screen").forEach(s=>s.classList.toggle("active",s.id===id));document.querySelectorAll("[data-screen]").forEach(n=>n.classList.toggle("active",n.dataset.screen===id));}
  function dispatch(){const f=loc(),t=team(),v=selectedVehicle();if(!f||!t||!v||!preflightReady())return;f.responseStage="DEPLOYED";f.responseStatus="ECTO VEHICLE DISPATCHED // EN ROUTE";f.dispatchVehicleId=v.id;f.dispatchVehicleName=v.name;f.actionHistory=Array.isArray(f.actionHistory)?f.actionHistory:[];f.actionHistory.unshift({time:new Date().toTimeString().slice(0,8),text:`${v.name} DISPATCHED WITH ${t.teamName||"SELECTED TEAM"}`});if(typeof window.upsertCurrentIncident==="function")window.upsertCurrentIncident(window.selectedMapIndex||0);refresh();}
  function install(){
    const old=q("ukmap");if(!old)return;
    const legacy=old.querySelectorAll(".uk-city-sector-picker,.map-controls,.grid-ref-entry,.button-row,#ukTeamsSubMenu,#selectedLocationTeamsPanel,#dispatchVehiclePanel,#cityRegionPanel");legacy.forEach(x=>x.classList.add("v238-hide"));
    const oldDossier=old.querySelector("#map-target-dossier");if(oldDossier)oldDossier.closest(".tactical-panel")?.classList.add("v238-hide");
    let panel=q("v238Core");if(panel)return;
    const wrap=document.createElement("div");wrap.id="v238Core";wrap.className="v238-core";
    wrap.innerHTML=`<div class="v238-head"><div><b>ECTO DISPATCH CONTROL</b><div class="dim">LOCATION // TEAM // VEHICLE // PRE-FLIGHT</div></div><div class="v238-status" id="v238Ready">DEPLOYMENT INCOMPLETE</div></div>
      <div class="v238-grid">
        <div class="v238-card"><span class="dim">DEPLOYMENT LOCATION</span><strong id="v238Location">SELECT LOCATION</strong><button type="button" id="v238LocationBtn">CHANGE LOCATION</button></div>
        <div class="v238-card"><span class="dim">INVESTIGATION SITE</span><strong id="v238Site">NO INVESTIGATION SITE SELECTED</strong><button type="button" id="v238SiteBtn">SELECT SITE</button></div>
        <div class="v238-card"><span class="dim">RESPONSE TEAM</span><strong id="v238Team">NO TEAM SELECTED</strong><span class="dim" id="v238TeamMeta">SELECT A TEAM FIRST</span><button type="button" id="v238TeamBtn">SELECT TEAM</button></div>
        <div class="v238-card"><span class="dim">ECTO VEHICLE</span><strong id="v238Vehicle">NO VEHICLE ASSIGNED</strong><span class="dim" id="v238VehicleMeta">SELECT A LOCATION FIRST</span><button type="button" id="v238VehicleBtn">SELECT ECTO VEHICLE</button></div>
      </div>
      <div class="v238-actions"><button type="button" id="v238PreflightBtn">OPEN TEAM PRE-FLIGHT</button><button type="button" id="v238DispatchBtn">DISPATCH ECTO VEHICLE</button></div>`;
    old.appendChild(wrap);
    q("v238LocationBtn").onclick=selectLocation;q("v238SiteBtn").onclick=selectSite;q("v238TeamBtn").onclick=selectTeam;q("v238VehicleBtn").onclick=selectVehicle;q("v238PreflightBtn").onclick=openPreflight;q("v238DispatchBtn").onclick=dispatch;
    refresh();
  }
  function init(){install();refresh();}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
  setInterval(()=>{install();refresh();},1500);
})();
