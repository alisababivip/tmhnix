import{_ as e}from"./WizardStepTitle.vue-i3gP8sdL.js";import{_ as a}from"./BaseInput.vue-iInHQMIA.js";import{a as l,ac as s,r as t,J as r,ad as u,Z as o,E as d,b as n,e as i,f as m,u as c,p,w as f,F as h,B as v,X as b,o as y,q as g,t as k,O as V,_ as x,Y as j}from"../e/entry-8qgg5CL-.js";import{u as w}from"./multi-step-form-Tb8qYR9z.js";import"./input-id-wZ-Ta08j.js";const M={class:"flex items-center gap-3 mb-5 justify-end"},_={class:"grid gap-5 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"},U={class:"flex flex-col w-full items-start gap-2"},F=l({__name:"step-5",setup(l){const F=s(),{data:$}=w();$.value.exchange||F.push("/admin/exchange/wizard");const z=t({...$.value.symbols});r(z,(e=>{$.value.symbols=e}));const O=t(1),T=()=>{for(const e in z.value)z.value[e].taker=z.value[e].taker*O.value,z.value[e].maker=z.value[e].maker*O.value},{toast:q}=u(),A=o().public.apiPath,B=async()=>{const e=(()=>{const e=Object.keys($.value.symbols).flatMap((e=>e.split("/")));return Array.from(new Set(e))})();try{const a=(await $fetch(`${A}/api/exchange/settings/fetch/currencies`,{credentials:"include",headers:{"client-platform":"browser"},query:{exchange:$.value.exchange}})).data.result;$.value.currencies=Object.keys(a).filter((a=>e.includes(a))).reduce(((e,l)=>(e[l]=a[l],e)),{})}catch(a){q.danger(a)}};return d((async()=>{await B()})),(l,s)=>{const t=e,r=a,u=b,o=x,d=j;return y(),n("div",null,[i(t),m("div",M,[i(r,{modelValue:c(O),"onUpdate:modelValue":s[0]||(s[0]=e=>p(O)?O.value=e:null),modelModifiers:{number:!0},type:"number",shape:"rounded",placeholder:"Enter Multiplier"},null,8,["modelValue"]),i(u,{onClick:T,color:"primary",type:"button"},{default:f((()=>[g(k(l.$t("Apply Multiplier")),1)])),_:1})]),m("div",_,[(y(!0),n(h,null,v(c(z),((e,a,s)=>(y(),V(d,{shape:"rounded",class:"p-4",key:s},{default:f((()=>[m("div",U,[i(o,{as:"h4",size:"sm",weight:"medium",lead:"none"},{default:f((()=>[g(k(a)+" "+k(l.$t("Fees")),1)])),_:2},1024),i(r,{modelValue:e.taker,"onUpdate:modelValue":a=>e.taker=a,modelModifiers:{number:!0},type:"number",shape:"rounded",label:"Taker",placeholder:"Taker Fee"},null,8,["modelValue","onUpdate:modelValue"]),i(r,{modelValue:e.maker,"onUpdate:modelValue":a=>e.maker=a,modelModifiers:{number:!0},type:"number",shape:"rounded",label:"Maker",placeholder:"Maker Fee"},null,8,["modelValue","onUpdate:modelValue"])])])),_:2},1024)))),128))])])}}});export{F as default};
