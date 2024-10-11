import{a as e,z as l,c as a,ac as s,r as t,E as u,J as r,ad as o,b as i,e as d,w as c,_ as n,o as m,q as v,t as p,f,u as y,p as g,O as h,af as b,k as w,n as x,F as _,B as k,X as E,Y as V,ag as j,x as D}from"../e/entry-8qgg5CL-.js";import{_ as L}from"./BaseInput.vue-iInHQMIA.js";import{_ as B}from"./BaseSelect.vue-p0KYznCX.js";import{_ as F}from"./BaseListbox.vue-1Dy9Ui3z.js";import{_ as T,a as C}from"./FlexTableRow.vue-LmGXINIn.js";import{_ as S}from"./FlexTableCell.vue-Rbj2Whgl.js";import{_ as A}from"./BaseTag.vue-NMkN1Uk8.js";import{_ as $}from"./TairoFlexTable-zdoraqRc.js";import{_ as q}from"./BasePagination.vue-eKZkqxB7.js";import{_ as P}from"./TairoContentWrapper.vue-JqAKR4O_.js";import{u as U}from"./useEcosystem-9eBUNbsT.js";import{_ as I,a as O}from"./placeholder-search-4-dark-Jht91LnM.js";import{u as N}from"./market-OqEbt887.js";import"./input-id-wZ-Ta08j.js";import"./BaseIconBox.vue-qjQCKz6R.js";import"./BaseAvatar.vue-XYSxxLJP.js";import"./use-text-value-9iwzs_EA.js";import"./BaseFocusLoop.vue-E4yqAJcg.js";const R={class:"w-full flex gap-2 xs:flex-col sm:flex-row items-center"},J={value:10},M={value:25},X={value:50},Y={value:100},z=f("img",{class:"block dark:hidden",src:I,alt:"Placeholder image"},null,-1),G=f("img",{class:"hidden dark:block",src:O,alt:"Placeholder image"},null,-1),Q={key:1,class:"w-full sm:pt-5"},W={class:"mr-1"},H={class:"mx-1"},K={class:"mt-6"},Z=e({__name:"index",setup(e){const I=l(),{getOrdersByParams:O}=U(),Z=N(),ee=a((()=>I.query.user)),le=a((()=>I.query.currency)),ae=a((()=>I.query.status)),se=a((()=>I.query.side)),te=s(),ue=t(""),re=t(!1),oe=t(""),ie=t(10),de=a((()=>parseInt(I.query.page??"1")));let ce=t([]);const ne=a((()=>Z.markets));u((async()=>{re.value=!0;try{const e=await O(ee.value,le.value,ae.value,se.value);ce.value=e.data.result}catch(e){ce.value=[],console.log(e.message)}0===Z.markets.length&&(Z.loading=!0,await Z.fetchMarkets(),Z.loading=!1),re.value=!1})),r((()=>I.query),(async()=>{re.value=!0;try{const e=await O(ee.value,le.value,ae.value,se.value);ce.value=e.data.result}catch(e){ce.value=[],console.log(e.message)}re.value=!1}),{immediate:!0});const me=a((()=>ce.value.filter((e=>(!ee.value||e.user.uuid===ee.value)&&((!ge.value||"All"===ge.value||e.side===ge.value)&&((!le.value||pe(e.symbol)===le.value)&&((!be.value||"All"===be.value||pe(e.symbol)===be.value)&&((!he.value||"All"===he.value||e.status===he.value)&&(!(we.value&&new Date(e.created_at)<new Date(we.value))&&(!(xe.value&&new Date(e.created_at)>new Date(xe.value))&&(oe.value&&""!==oe.value&&void 0!==oe.value&&oe.value!==ue.value&&(te.push({query:{...I.query,page:"1",filter:oe.value}}),ue.value=oe.value),!oe.value||e.uuid?.includes(oe.value)))))))))).sort(((e,l)=>new Date(l.created_at).getTime()-new Date(e.created_at).getTime())))),ve=a((()=>{const e=(de.value-1)*ie.value,l=e+ie.value;return me.value.slice(e,l)})),pe=e=>e.split("/")[0],fe=e=>{switch(e){case"COMPLETED":return"success";case"PENDING":return"warning";case"FAILED":case"CANCELLED":case"REJECTED":case"EXPIRED":return"danger";default:return"info"}},ye=t(!1),ge=t(""),he=t(""),be=t(""),we=t(""),xe=t(""),_e=["All","BUY","SELL"],ke=["All","OPEN","CLOSED","CANCELED","EXPIRED","REJECTED"],Ee=a((()=>{let e=4;return se.value&&e--,ae.value&&e--,le.value&&e--,e})),{formatedDate:Ve}=o();return(e,l)=>{const a=n,s=L,t=D,u=E,r=B,o=F,U=V,I=j,O=T,N=S,Z=A,ee=C,te=$,ue=q,ce=P;return m(),i("div",null,[d(a,{as:"h3",size:"xl",weight:"medium",class:"text-muted-800 dark:text-white mb-4"},{default:c((()=>[v(p(e.$t("Orders")),1)])),_:1}),d(ce,null,{left:c((()=>[f("div",R,[d(s,{modelValue:y(oe),"onUpdate:modelValue":l[0]||(l[0]=e=>g(oe)?oe.value=e:null),icon:"lucide:search",placeholder:"Search Order ID..."},null,8,["modelValue"]),d(u,{onClick:l[1]||(l[1]=e=>ye.value=!y(ye)),color:"muted",block:""},{default:c((()=>[y(ye)?(m(),h(t,{key:0,name:"line-md:arrow-up",class:"h-4 w-4 mr-2"})):(m(),h(t,{key:1,name:"line-md:arrow-down",class:"h-4 w-4 mr-2"})),v(" "+p(e.$t("Filters")),1)])),_:1})])])),right:c((()=>[d(r,{modelValue:y(ie),"onUpdate:modelValue":l[2]||(l[2]=e=>g(ie)?ie.value=e:null),label:"",classes:{wrapper:"w-full sm:w-40"}},{default:c((()=>[f("option",J,"10 "+p(e.$t("per page")),1),f("option",M,"25 "+p(e.$t("per page")),1),f("option",X,"50 "+p(e.$t("per page")),1),f("option",Y,"100 "+p(e.$t("per page")),1)])),_:1},8,["modelValue"])])),default:c((()=>[f("div",null,[d(b,{"enter-active-class":"transform-gpu","enter-from-class":"opacity-0 -translate-y-4","enter-to-class":"opacity-100 translate-y-0","leave-active-class":"absolute transform-gpu","leave-from-class":"opacity-100 translate-y-0","leave-to-class":"opacity-0 -translate-y-4"},{default:c((()=>[y(ye)?(m(),h(U,{class:x(`grid gap-4 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-${y(Ee)} lg:grid-cols-${y(Ee)+2} mb-6 p-5`),key:"filters"},{default:c((()=>[y(se)?w("",!0):(m(),h(o,{key:0,modelValue:y(ge),"onUpdate:modelValue":l[3]||(l[3]=e=>g(ge)?ge.value=e:null),label:"Order Side",items:_e,placeholder:"Select order side"},null,8,["modelValue"])),y(ae)?w("",!0):(m(),h(o,{key:1,modelValue:y(he),"onUpdate:modelValue":l[4]||(l[4]=e=>g(he)?he.value=e:null),label:"Status",items:ke,placeholder:"Select status"},null,8,["modelValue"])),y(le)?w("",!0):(m(),h(o,{key:2,modelValue:y(be),"onUpdate:modelValue":l[5]||(l[5]=e=>g(be)?be.value=e:null),label:"Currency",items:["All",...y(ne).map((e=>e.symbol))],placeholder:"Select currency"},null,8,["modelValue","items"])),d(s,{modelValue:y(we),"onUpdate:modelValue":l[6]||(l[6]=e=>g(we)?we.value=e:null),type:"date",label:"From"},null,8,["modelValue"]),d(s,{modelValue:y(xe),"onUpdate:modelValue":l[7]||(l[7]=e=>g(xe)?xe.value=e:null),type:"date",label:"To"},null,8,["modelValue"])])),_:1},8,["class"])):w("",!0)])),_:1}),y(re)||0!==y(ve)?.length?(m(),i("div",Q,[d(te,null,{default:c((()=>[d(b,{"enter-active-class":"transform-gpu","enter-from-class":"opacity-0 -translate-x-full","enter-to-class":"opacity-100 translate-x-0","leave-active-class":"absolute transform-gpu","leave-from-class":"opacity-100 translate-x-0","leave-to-class":"opacity-0 -translate-x-full"},{default:c((()=>[(m(!0),i(_,null,k(y(ve),((e,l)=>(m(),h(ee,{key:l,spaced:""},{start:c((()=>[d(O,{label:"Market","hide-label":l>0,title:`${e.symbol}`,subtitle:y(Ve)(e.created_at,!0)},null,8,["hide-label","title","subtitle"])])),end:c((()=>[d(N,{label:"Side","hide-label":l>0,class:x(["w-20 xs:w-full text-xs",{"text-success-500":"BUY"===e.side,"text-danger-500":"SELL"===e.side}])},{default:c((()=>[v(p(e.side),1)])),_:2},1032,["hide-label","class"]),d(N,{label:"Amount","hide-label":l>0,class:"sm:w-20 md:w-30 lg:w-32 xs:w-full flex flex-row sm:flex-col text-xs"},{default:c((()=>[f("div",W,p(parseFloat(e.amount).toFixed((pe(e.symbol),8))),1),f("div",null,p(pe(e.symbol)),1)])),_:2},1032,["hide-label"]),y(re)?w("",!0):(m(),h(N,{key:0,label:"Fee","hide-label":l>0,class:"sm:w-20 md:w-30 lg:w-28 xs:w-full flex flex-row sm:flex-col text-xs"},{default:c((()=>[f("div",H,p(parseFloat(e.fee).toFixed((e.fee_currency,8))),1),f("div",null,p(e.fee_currency),1)])),_:2},1032,["hide-label"])),d(N,{label:"Status","hide-label":l>0,class:"xs:w-full w-24"},{default:c((()=>[d(Z,{color:fe(e.status),flavor:"pastel",condensed:""},{default:c((()=>[v(p(e.status),1)])),_:2},1032,["color"])])),_:2},1032,["hide-label"])])),_:2},1024)))),128))])),_:1})])),_:1})])):(m(),h(I,{key:0,title:y(oe)&&""!==y(oe)?"No matching results":"No results",subtitle:y(oe)&&""!==y(oe)?"Looks like we couldn't find any matching results for your search terms. Try other search terms.":"Looks like we don't have any data here yet."},{image:c((()=>[z,G])),_:1},8,["title","subtitle"])),f("div",K,[y(me).length>y(ie)?(m(),h(ue,{key:0,"total-items":y(me).length,"current-page":y(de),"item-per-page":y(ie)},null,8,["total-items","current-page","item-per-page"])):w("",!0)])])])),_:1})])}}});export{Z as default};
