import{_ as e}from"./BaseInput.vue-iInHQMIA.js";import{_ as a}from"./BaseSelect.vue-p0KYznCX.js";import{d as l,a as t,z as s,r as o,c as r,E as i,b as u,e as n,w as c,o as d,u as m,p,f as g,t as f,O as h,F as v,B as b,q as k,k as _,ag as w}from"../e/entry-8qgg5CL-.js";import{_ as y,a as j}from"./FlexTableRow.vue-LmGXINIn.js";import{_ as S}from"./FlexTableCell.vue-Rbj2Whgl.js";import{_ as $}from"./BaseTag.vue-NMkN1Uk8.js";import{_ as B}from"./TairoFlexTable-zdoraqRc.js";import{_ as L}from"./BasePagination.vue-eKZkqxB7.js";import{_ as T}from"./TairoContentWrapper.vue-JqAKR4O_.js";import{a as x}from"./strings-rQgUKePI.js";import{_ as D,a as E}from"./placeholder-search-4-dark-Jht91LnM.js";import{u as V}from"./useStaking-1DgbeL2_.js";import"./input-id-wZ-Ta08j.js";import"./BaseAvatar.vue-XYSxxLJP.js";import"./BaseIconBox.vue-qjQCKz6R.js";import"./BaseFocusLoop.vue-E4yqAJcg.js";const A=l({id:"adminStakingLogs",state:()=>({logs:[],loading:!1}),actions:{async fetchStakingLogs(){this.loading=!0;try{const{getAdminStakingLogs:e}=V(),a=await e();this.logs=a.data.result}catch(e){console.error("Error fetching staking logs:",e)}this.loading=!1}}}),F={value:10},I={value:25},C={value:50},P={value:100},N=g("img",{class:"block dark:hidden",src:D,alt:"Placeholder image"},null,-1),R=g("img",{class:"hidden dark:block",src:E,alt:"Placeholder image"},null,-1),W={key:1,class:"w-full"},q={class:"mt-6"},U=t({__name:"index",setup(l){const t=A(),D=s(),E=o(""),V=o(10),U=r((()=>parseInt(D.query.page??"1"))),z=r((()=>t.logs.filter((e=>e.uuid.includes(E.value)||e.pool?.currency.includes(E.value))))),H=r((()=>{const e=(U.value-1)*V.value,a=e+V.value;return z.value.slice(e,a)}));i((async()=>{0===t.logs.length&&(t.loading=!0,await t.fetchStakingLogs(),t.loading=!1)}));const O=e=>{switch(e){case"ACTIVE":return"warning";case"RELEASED":return"info";case"WITHDRAWN":return"success"}};return(l,s)=>{const o=e,r=a,i=w,D=y,A=S,G=$,J=j,K=B,M=L,Q=T;return d(),u("div",null,[n(Q,null,{left:c((()=>[n(o,{modelValue:m(E),"onUpdate:modelValue":s[0]||(s[0]=e=>p(E)?E.value=e:null),icon:"lucide:search",classes:{wrapper:"w-full sm:w-auto"},placeholder:"Filter stakes..."},null,8,["modelValue"])])),right:c((()=>[n(r,{modelValue:m(V),"onUpdate:modelValue":s[1]||(s[1]=e=>p(V)?V.value=e:null),label:"",classes:{wrapper:"w-full sm:w-40"}},{default:c((()=>[g("option",F,"10 "+f(l.$t("per page")),1),g("option",I,"25 "+f(l.$t("per page")),1),g("option",C,"50 "+f(l.$t("per page")),1),g("option",P,"100 "+f(l.$t("per page")),1)])),_:1},8,["modelValue"])])),default:c((()=>[g("div",null,[m(t).loading||0!==m(H)?.length?(d(),u("div",W,[n(K,{class:"pt-5"},{default:c((()=>[(d(!0),u(v,null,b(m(H),((e,a)=>(d(),h(J,{key:e.id,spaced:""},{start:c((()=>[n(D,{label:"Stake","hide-label":a>0,logo:`/img/crypto/${e.pool?.currency.toLowerCase()}.png`,title:`${e.pool?.currency} (${e.pool?.name})`,subtitle:e.uuid},null,8,["hide-label","logo","title","subtitle"])])),end:c((()=>[n(D,{label:"Duration","hide-label":a>0,title:`Start: ${("formatDate"in l?l.formatDate:m(x))(e.stake_date)}`,subtitle:`End: ${("formatDate"in l?l.formatDate:m(x))(e.release_date)}`},null,8,["hide-label","title","subtitle"]),n(A,{label:"Amount","hide-label":a>0,class:"w-20 xs:w-full"},{default:c((()=>[k(f(e.amount),1)])),_:2},1032,["hide-label"]),n(A,{label:"Status","hide-label":a>0,class:"w-20 xs:w-full"},{default:c((()=>[n(G,{color:O(e.status),flavor:"pastel",condensed:""},{default:c((()=>[k(f(e.status),1)])),_:2},1032,["color"])])),_:2},1032,["hide-label"])])),_:2},1024)))),128))])),_:1})])):(d(),h(i,{key:0,title:m(E)&&""!==m(E)?"No matching results":"No results",subtitle:m(E)&&""!==m(E)?"Looks like we couldn't find any matching results for your search terms. Try other search terms.":"Looks like we don't have any data here yet."},{image:c((()=>[N,R])),_:1},8,["title","subtitle"])),g("div",q,[m(z).length>m(V)?(d(),h(M,{key:0,"total-items":m(z).length,"current-page":m(U),"item-per-page":m(V)},null,8,["total-items","current-page","item-per-page"])):_("",!0)])])])),_:1})])}}});export{U as default};
