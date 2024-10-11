import{_ as e}from"./BaseInput.vue-iInHQMIA.js";import{_ as a}from"./BaseSelect.vue-p0KYznCX.js";import{a as l,z as t,ad as r,r as s,c as o,E as i,ap as d,b as n,e as u,w as c,u as p,an as m,o as v,p as f,f as h,t as w,O as g,af as _,F as b,B as y,q as C,k as E,ag as B,x as T,ao as x,X as V}from"../e/entry-8qgg5CL-.js";import{_ as k,a as j}from"./FlexTableRow.vue-LmGXINIn.js";import{_ as R}from"./FlexTableCell.vue-Rbj2Whgl.js";import{_ as U}from"./BaseTag.vue-NMkN1Uk8.js";import{_ as I}from"./BaseButtonIcon.vue-6tAU_b7C.js";import{_ as S}from"./TairoFlexTable-zdoraqRc.js";import{_ as D}from"./BasePagination.vue-eKZkqxB7.js";import{_ as F}from"./TairoContentWrapper.vue-JqAKR4O_.js";import{_ as A}from"./BaseTextarea.vue-8st5U0qk.js";import{_ as N}from"./BaseListbox.vue-1Dy9Ui3z.js";import{u as M}from"./fiatCurrency-EA2f5t5g.js";import{u as P}from"./useMlm-tZO3tueF.js";import{_ as $,a as L}from"./placeholder-search-4-dark-Jht91LnM.js";import{z as O,u as q,t as X,F as G}from"./vee-validate.esm-n59zZCC5.js";import"./input-id-wZ-Ta08j.js";import"./BaseAvatar.vue-XYSxxLJP.js";import"./BaseIconBox.vue-qjQCKz6R.js";import"./BaseFocusLoop.vue-E4yqAJcg.js";import"./use-text-value-9iwzs_EA.js";const z={class:"pb-10"},Y={value:10},H={value:25},K={value:50},W={value:100},J=h("img",{class:"block dark:hidden",src:$,alt:"Placeholder image"},null,-1),Q=h("img",{class:"hidden dark:block",src:L,alt:"Placeholder image"},null,-1),Z={key:1,class:"w-full"},ee={class:"mt-6"},ae={class:"flex w-full items-center justify-between p-4 md:p-6"},le={class:"font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"},te={class:"p-4 md:p-6"},re={class:"mx-auto w-full text-start space-y-3"},se={class:"p-4 md:p-6"},oe={class:"flex gap-x-2"},ie=l({__name:"conditions",setup(l){const $=t(),{toast:L}=r(),ie=s(""),de=s(10),ne=o((()=>parseInt($.query.page??"1"))),ue=s(!1),ce=M(),pe=o((()=>ce.currencies)),me=o((()=>pe.value.map((e=>e.code)))),{getReferralConditions:ve,updateReferralConditionStatus:fe,updateReferralCondition:he}=P(),we=s([]);i((async()=>{ue.value=!0;const e=await ve();"success"===e.status?we.value=e.data.result:L.danger(e),ue.value=!1}));const ge=d(),_e=o((()=>ge.extensionsUser)),be=o((()=>we.value.filter((e=>{switch(e.name){case"STAKING_LOYALTY":return _e.value.staking;case"FOREX_INVESTMENT":return _e.value.forex;case"AI_INVESTMENT":return _e.value.ai_trading;case"P2P_TRADE":return _e.value.p2p;case"ECOMMERCE_PURCHASE":return _e.value.ecommerce;case"ICO_CONTRIBUTION":return _e.value.ico;default:return!0}})).filter((e=>!ie.value||e.title?.toLowerCase().includes(ie.value.toLowerCase()))).sort(((e,a)=>new Date(a.created_at).getTime()-new Date(e.created_at).getTime())))),ye=o((()=>{const e=(ne.value-1)*de.value,a=e+de.value;return be.value.slice(e,a)})),Ce=O.object({title:O.string().min(1,"Title is required"),description:O.string().min(1,"Description is required").max(255,"Description must be less than 255 characters"),reward:O.number().gt(0,"Reward must be greater than 0"),reward_type:O.enum(["FIXED","PERCENTAGE"]),reward_currency:O.string().min(1,"Reward Currency is required")}),Ee=o((()=>({title:"",description:"",reward:0,reward_type:"FIXED",reward_currency:"USD"}))),{handleSubmit:Be,isSubmitting:Te,meta:xe,resetForm:Ve,setFieldValue:ke}=q({validationSchema:X(Ce),initialValues:Ee}),je=s(!1),Re=s({}),Ue=Be((async e=>{try{const a=await he(Re.value.id,e.title,e.description,e.reward,e.reward_type,e.reward_currency);if(L.response(a),"success"===a.status){const e=await ve();we.value=e.data.result,Ve()}}catch(a){L.danger(a)}je.value=!1}));return(l,t)=>{const r=e,s=a,o=B,i=k,d=R,M=U,P=T,$=I,O=j,q=S,X=D,ce=F,pe=x,ve=A,he=N,ge=V,_e=m;return v(),n("div",z,[u(ce,null,{left:c((()=>[u(r,{modelValue:p(ie),"onUpdate:modelValue":t[0]||(t[0]=e=>f(ie)?ie.value=e:null),icon:"lucide:search",classes:{wrapper:"w-full sm:w-auto"},placeholder:"Search Conditions..."},null,8,["modelValue"])])),right:c((()=>[u(s,{modelValue:p(de),"onUpdate:modelValue":t[1]||(t[1]=e=>f(de)?de.value=e:null),label:"",classes:{wrapper:"w-full sm:w-40"}},{default:c((()=>[h("option",Y,"10 "+w(l.$t("per page")),1),h("option",H,"25 "+w(l.$t("per page")),1),h("option",K,"50 "+w(l.$t("per page")),1),h("option",W,"100 "+w(l.$t("per page")),1)])),_:1},8,["modelValue"])])),default:c((()=>[h("div",null,[p(ue)||0!==p(ye)?.length?(v(),n("div",Z,[u(q,{class:"pt-5"},{default:c((()=>[u(_,{"enter-active-class":"transform-gpu","enter-from-class":"opacity-0 translate-y-2","enter-to-class":"opacity-100 translate-y-0","leave-active-class":"transform-gpu","leave-from-class":"opacity-100 translate-y-0","leave-to-class":"opacity-0 translate-y-2"},{default:c((()=>[(v(!0),n(b,null,y(p(ye),((e,a)=>(v(),g(O,{key:e.id,spaced:""},{start:c((()=>[u(i,{label:"Condition","hide-label":a>0,title:e.title,subtitle:e.description},null,8,["hide-label","title","subtitle"])])),end:c((()=>[u(d,{label:"Reward","hide-label":a>0,class:"w-20 xs:w-full text-xs"},{default:c((()=>[C(w(e.reward)+w("PERCENTAGE"===e.reward_type?"%":` ${e.reward_currency}`),1)])),_:2},1032,["hide-label"]),u(d,{label:"Status","hide-label":a>0,class:"w-20 xs:w-full"},{default:c((()=>[u(M,{onClick:a=>(async e=>{const a=await fe(e.id,!e.status);"success"===a.status?(L.success(a),we.value=we.value.map((a=>(a.id===e.id&&(a.status=!a.status),a)))):L.danger(a)})(e),color:e.status?"success":"danger",flavor:"pastel",condensed:"","data-nui-tooltip":e.status?"Disable":"Enable",class:"cursor-pointer"},{default:c((()=>[C(w(e.status?"Active":"Disabled"),1)])),_:2},1032,["onClick","color","data-nui-tooltip"])])),_:2},1032,["hide-label"]),u(d,{label:"Actions","hide-label":a>0,class:"w-20 xs:w-full"},{default:c((()=>[u($,{color:"warning",size:"sm",onClick:a=>{return l=e,Re.value=l,je.value=!0,ke("title",l.title),ke("description",l.description),ke("reward",l.reward),ke("reward_type",l.reward_type),void ke("reward_currency",l.reward_currency);var l},"data-nui-tooltip":"Edit Condition"},{default:c((()=>[u(P,{name:"line-md:edit",class:"h-4 w-4"})])),_:2},1032,["onClick"])])),_:2},1032,["hide-label"])])),_:2},1024)))),128))])),_:1})])),_:1})])):(v(),g(o,{key:0,title:p(ie)&&""!==p(ie)?"No matching results":"No results",subtitle:p(ie)&&""!==p(ie)?"Looks like we couldn't find any matching results for your search terms. Try other search terms.":"Looks like we don't have any data here yet."},{image:c((()=>[J,Q])),_:1},8,["title","subtitle"])),h("div",ee,[p(be).length>p(de)?(v(),g(X,{key:0,"total-items":p(be).length,"current-page":p(ne),"item-per-page":p(de)},null,8,["total-items","current-page","item-per-page"])):E("",!0)])])])),_:1}),u(_e,{open:p(je),size:"md",onClose:t[4]||(t[4]=e=>je.value=!1)},{header:c((()=>[h("div",ae,[h("h3",le,w(l.$t("Edit Condition")),1),u(pe,{onClick:t[2]||(t[2]=e=>je.value=!1)})])])),footer:c((()=>[h("div",se,[h("div",oe,[u(ge,{onClick:t[3]||(t[3]=e=>je.value=!1)},{default:c((()=>[C(w(l.$t("Cancel")),1)])),_:1}),u(ge,{color:"primary",flavor:"solid",onClick:p(Ue),disabled:p(Te),loading:p(Te)},{default:c((()=>[C(w(l.$t("Update")),1)])),_:1},8,["onClick","disabled","loading"])])])])),default:c((()=>[h("div",te,[h("div",re,[u(p(G),{name:"title"},{default:c((({field:e,errorMessage:a,handleChange:l,handleBlur:t})=>[u(r,{modelValue:e.value,"onUpdate:modelValue":[a=>e.value=a,l],error:a,disabled:p(Te),type:"text",label:"Title",placeholder:"Enter Condition Title",onBlur:t},null,8,["modelValue","onUpdate:modelValue","error","disabled","onBlur"])])),_:1}),u(p(G),{name:"description"},{default:c((({field:e,errorMessage:a,handleChange:l,handleBlur:t})=>[u(ve,{modelValue:e.value,"onUpdate:modelValue":[a=>e.value=a,l],error:a,disabled:p(Te),label:"Description",placeholder:"Enter Condition Description",onBlur:t},null,8,["modelValue","onUpdate:modelValue","error","disabled","onBlur"])])),_:1}),u(p(G),{name:"reward"},{default:c((({field:e,errorMessage:a,handleChange:l,handleBlur:t})=>[u(r,{modelValue:e.value,"onUpdate:modelValue":[a=>e.value=a,l],error:a,disabled:p(Te),type:"number",label:"Reward",placeholder:"Enter Reward Amount",onBlur:t},null,8,["modelValue","onUpdate:modelValue","error","disabled","onBlur"])])),_:1}),u(p(G),{name:"reward_type"},{default:c((({field:e,errorMessage:a,handleChange:l,handleBlur:t})=>[u(he,{"model-value":e.value,error:a,disabled:p(Te),items:["FIXED","PERCENTAGE"],placeholder:"Select Rewarding Calculation Type",label:"Rewarding Type",shape:"rounded","onUpdate:modelValue":l,onBlur:t},null,8,["model-value","error","disabled","onUpdate:modelValue","onBlur"])])),_:1}),u(p(G),{name:"reward_currency"},{default:c((({field:e,errorMessage:a,handleChange:l,handleBlur:t})=>[u(he,{"model-value":e.value,error:a,disabled:p(Te),items:p(me),placeholder:"Select Reward Currency",label:"Reward Currency",shape:"rounded","onUpdate:modelValue":l,onBlur:t},null,8,["model-value","error","disabled","items","onUpdate:modelValue","onBlur"])])),_:1})])])])),_:1},8,["open"])])}}});export{ie as default};
