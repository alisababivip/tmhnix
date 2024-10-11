import{_ as e}from"./BaseInput.vue-iInHQMIA.js";import{_ as a}from"./BaseSelect.vue-p0KYznCX.js";import{a as l,z as t,ad as s,ac as o,r,c as u,U as i,b as n,e as c,w as m,o as d,f as p,u as f,p as v,t as g,O as h,af as b,F as _,B as w,q as y,k as j,ag as k,x}from"../e/entry-8qgg5CL-.js";import{_ as B,a as T}from"./FlexTableRow.vue-LmGXINIn.js";import{_ as L}from"./BaseTag.vue-NMkN1Uk8.js";import{_ as D}from"./FlexTableCell.vue-Rbj2Whgl.js";import{_ as V,a as $}from"./BaseDropdown.vue-wSpyT9xX.js";import{_ as C}from"./TairoFlexTable-zdoraqRc.js";import{_ as F}from"./BasePagination.vue-eKZkqxB7.js";import{_ as q}from"./TairoContentWrapper.vue-JqAKR4O_.js";import{_ as S,a as A}from"./placeholder-search-4-dark-Jht91LnM.js";import{l as I}from"./languages-eo26ptye.js";import"./input-id-wZ-Ta08j.js";import"./BaseAvatar.vue-XYSxxLJP.js";import"./BaseIconBox.vue-qjQCKz6R.js";import"./menu-KWZreDHB.js";import"./use-text-value-9iwzs_EA.js";import"./BaseFocusLoop.vue-E4yqAJcg.js";const P={class:"pb-10"},U={class:"w-full flex gap-2 xs:flex-col sm:flex-row"},E={value:10},N={value:25},z={value:50},O={value:100},R=p("img",{class:"block dark:hidden",src:S,alt:"Placeholder image"},null,-1),W=p("img",{class:"hidden dark:block",src:A,alt:"Placeholder image"},null,-1),G={key:1,class:"w-full sm:pt-5"},H={class:"mt-6"},J=l({__name:"locales",setup(l){const S=t(),{toast:A}=s(),J=o(),K=r(""),M=r(""),Q=r(10),X=u((()=>parseInt(S.query.page??"1"))),Y=r(!1),Z=u((()=>I.filter((e=>(M.value&&""!==M.value&&void 0!==M.value&&M.value!==K.value&&(J.push({query:{...S.query,page:"1",filter:M.value}}),K.value=M.value),!M.value||e.name?.includes(M.value)))).sort(((e,a)=>new Date(a.created_at).getTime()-new Date(e.created_at).getTime())))),ee=u((()=>{const e=(X.value-1)*Q.value,a=e+Q.value;return Z.value.slice(e,a)})),ae=e=>{switch(e){case 1:return"success";case 0:return"danger";default:return"info"}},{toggleLocaleStatus:le}=i();return(l,t)=>{const s=e,o=a,r=k,u=B,i=L,S=D,I=x,J=V,K=$,te=T,se=C,oe=F,re=q;return d(),n("div",P,[c(re,null,{left:m((()=>[p("div",U,[c(s,{modelValue:f(M),"onUpdate:modelValue":t[0]||(t[0]=e=>v(M)?M.value=e:null),icon:"lucide:search",classes:{wrapper:"w-full sm:w-auto"},placeholder:"Search Languages..."},null,8,["modelValue"])])])),right:m((()=>[c(o,{modelValue:f(Q),"onUpdate:modelValue":t[1]||(t[1]=e=>v(Q)?Q.value=e:null),label:"",classes:{wrapper:"w-full sm:w-40"}},{default:m((()=>[p("option",E,"10 "+g(l.$t("per page")),1),p("option",N,"25 "+g(l.$t("per page")),1),p("option",z,"50 "+g(l.$t("per page")),1),p("option",O,"100 "+g(l.$t("per page")),1)])),_:1},8,["modelValue"])])),default:m((()=>[p("div",null,[f(Y)||0!==f(ee)?.length?(d(),n("div",G,[c(se,null,{default:m((()=>[c(b,{"enter-active-class":"transform-gpu","enter-from-class":"opacity-0 translate-y-2","enter-to-class":"opacity-100 translate-y-0","leave-active-class":"transform-gpu","leave-from-class":"opacity-100 translate-y-0","leave-to-class":"opacity-0 translate-y-2"},{default:m((()=>[(d(!0),n(_,null,w(f(ee),((e,a)=>(d(),h(te,{key:a,spaced:""},{start:m((()=>[c(u,{label:"Language","hide-label":a>0,logo:e.flag,title:e.name,subtitle:e.code},null,8,["hide-label","logo","title","subtitle"])])),end:m((()=>[c(S,{label:"Status","hide-label":a>0,class:"w-20 xs:w-full"},{default:m((()=>[c(i,{color:ae(e.status),flavor:"pastel",condensed:""},{default:m((()=>[y(g(1===e.status?"Active":"Disabled"),1)])),_:2},1032,["color"])])),_:2},1032,["hide-label"]),c(S,{label:"Actions","hide-label":a>0,class:"w-20 xs:justify-end xs:w-full"},{default:m((()=>[c(K,{flavor:"context",label:"Dropdown",orientation:"end"},{default:m((()=>[c(J,{onClick:a=>(async e=>{const a=1===e.status?0:1;try{const l=await le(e.code,a);A.response(l),e.status=a}catch(l){A.danger(l)}})(e),title:(1===e.status?"Disable":"Enable")+" Language"},{start:m((()=>[c(I,{name:1===e.status?"mdi:eye":"mdi:eye-off",class:"me-2 block h-5 w-5"},null,8,["name"])])),_:2},1032,["onClick","title"]),c(J,{to:`/admin/locales/${e.code}`,title:"Edit Language"},{start:m((()=>[c(I,{name:"line-md:edit-twotone",class:"me-2 block h-5 w-5"})])),_:2},1032,["to"])])),_:2},1024)])),_:2},1032,["hide-label"])])),_:2},1024)))),128))])),_:1})])),_:1})])):(d(),h(r,{key:0,title:f(M)&&""!==f(M)?"No matching results":"No results",subtitle:f(M)&&""!==f(M)?"Looks like we couldn't find any matching results for your search terms. Try other search terms.":"Looks like we don't have any data here yet."},{image:m((()=>[R,W])),_:1},8,["title","subtitle"])),p("div",H,[f(Z).length>f(Q)?(d(),h(oe,{key:0,"total-items":f(Z).length,"current-page":f(X),"item-per-page":f(Q)},null,8,["total-items","current-page","item-per-page"])):j("",!0)])])])),_:1})])}}});export{J as default};
