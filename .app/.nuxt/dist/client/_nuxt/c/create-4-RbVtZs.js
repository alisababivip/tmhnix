import{a as e,ad as a,ac as l,c as t,ap as n,Q as r,E as s,J as u,r as o,O as m,w as i,o as d,e as c,q as p,t as h,u as f,f as y,b as v,k as g,_ as x,x as b,X as _,Y as w}from"../e/entry-8qgg5CL-.js";import{_ as B}from"./BaseListbox.vue-1Dy9Ui3z.js";import{_ as V}from"./BaseInput.vue-iInHQMIA.js";import{_ as C}from"./TairoFormSave.vue-aLVbwikq.js";import{_ as j}from"./TairoContentWrapper.vue-JqAKR4O_.js";import{u as P}from"./useP2P-NV4dmDWU.js";import{u as T}from"./useWallet-8iHzU2hV.js";import{u as U}from"./currency-9FjTf2Bf.js";import{u as M}from"./fiatCurrency-EA2f5t5g.js";import{z as S,u as E,t as O,F as k}from"./vee-validate.esm-n59zZCC5.js";import{u as A}from"./admin-Nwh6nXjV.js";import{u as F}from"./offers-pCoDOi_A.js";import{u as I}from"./payment-methods-MEQZc0hn.js";import"./BaseIconBox.vue-qjQCKz6R.js";import"./BaseAvatar.vue-XYSxxLJP.js";import"./use-text-value-9iwzs_EA.js";import"./input-id-wZ-Ta08j.js";import"./useExchange-VMAYQu3P.js";import"./useEcosystem-9eBUNbsT.js";const $={class:"grid grid-cols-1 sm:grid-cols-2 gap-6"},W=y("small",null,[y("span",{class:"text-xs text-warning-500"}," Select a payment method to receive the payment ")],-1),q=y("small",null,[y("span",{class:"text-xs text-warning-500"}," Select a wallet type to receive the payment ")],-1),J=y("small",null,[y("span",{class:"text-xs text-warning-500"}," Select a currency of the wallet type ")],-1),Q={key:0},Y=y("small",null,[y("span",{class:"text-xs text-warning-500"}," Select a chain of the wallet type ")],-1),z=y("small",null,[y("span",{class:"text-xs text-warning-500"}," Balance of the selected currency ")],-1),L=y("small",null,[y("span",{class:"text-xs text-warning-500"}," Enter the amount you want to sell, it will be deducted from your wallet ")],-1),X=y("small",null,[y("span",{class:"text-xs text-warning-500"}," Enter the price you want to sell at ")],-1),D=y("small",null,[y("span",{class:"text-xs text-warning-500"}," Enter the minimum amount you want to sell ")],-1),G=y("small",null,[y("span",{class:"text-xs text-warning-500"}," Enter the maximum amount you want to sell ")],-1),H=e({__name:"create",setup(e){const{toast:H}=a(),K=l(),N=F(),{createUserP2POffer:R}=P(),{fetchWallet:Z}=T(),ee=I(),ae=t((()=>ee.methods)),le=n(),te=t((()=>le.extensions)),ne=t((()=>te.value?.find((e=>"ecosystem"===e.name)))),re=r(),se=t((()=>re.settings)),ue=U(),oe=t((()=>ue.currencies)),me=M(),ie=t((()=>me.currencies)),de=A(),ce=t((()=>de.tokens)),pe=["FIAT"];s((async()=>{0===ee.methods.length&&await ee.fetchPaymentMethods(),0===ee.methods.length&&(K.push("/user/p2p/payment-methods/create"),H.dangerText("You need to create a payment method first")),0===le.extensions.length&&await le.fetchExtensions(),se.value?.spot_exchange&&(pe.push("SPOT"),0===ue.currencies.length&&await ue.fetchCurrencies()),ne.value?.status&&(pe.push("ECO"),0===de.tokens.length&&await de.fetchTokensAll()),0===me.currencies.length&&await me.fetchCurrencies(),xe()}));const he=t((()=>{let e=[];"SPOT"===be.wallet_type?e=oe.value.map((e=>e.currency)):"ECO"===be.wallet_type?e=ce.value.map((e=>e.currency)):"FIAT"===be.wallet_type&&(e=ie.value.map((e=>e.code)));return[...new Set(e)]})),fe=S.object({wallet_type:S.enum(pe),currency:S.string().nonempty("Currency is required"),chain:S.string().optional(),amount:S.number().positive("Amount must be positive"),price:S.number().positive("Price must be positive"),payment_method:S.object({label:S.string(),value:S.number()}),min_amount:S.number().positive("Minimum amount must be positive"),max_amount:S.number().positive("Maximum amount must be positive")}),ye=t((()=>({wallet_type:"",currency:"",amount:0,price:0,payment_method:{label:"Select a payment method",value:0},min_amount:0,max_amount:0}))),{handleSubmit:ve,isSubmitting:ge,resetForm:xe,values:be,setFieldValue:_e}=E({validationSchema:O(fe),initialValues:ye});u((()=>be.wallet_type),(e=>{e&&_e("currency","")}));const we=o(null);u((()=>be.currency),(async e=>{if(e&&be.wallet_type){const a=await Z(e,be.wallet_type);we.value=a.data.result}}));const Be=t((()=>we.value?.addresses?Object.keys(we.value.addresses):[])),Ve=ve((async e=>{if(we.value)if(e.amount>we.value?.balance)H.dangerText("Insufficient balance");else if(e.min_amount>e.max_amount)H.dangerText("Minimum trade amount cannot be greater than maximum trade amount");else if(e.min_amount>e.amount)H.dangerText("Minimum trade amount cannot be greater than offer amount");else if(e.max_amount>e.amount)H.dangerText("Maximum trade amount cannot be greater than offer amount");else if(e.price<=0)H.dangerText("Price must be greater than 0");else if("FIAT"===e.wallet_type||""!==e.chain)try{const a=await R(e.wallet_type,e.currency,e.amount,e.price,e.payment_method.value,e.min_amount,e.max_amount,e.chain);H.response(a),"success"===a.status&&(await N.fetchP2POffers(),await N.fetchUserP2POffers(),K.push("/user/p2p/offers"))}catch(a){H.danger(a)}else H.dangerText("Chain is required");else H.dangerText("Wallet not found")}));return(e,a)=>{const l=x,t=b,n=_,r=B,s=V,u=w,o=C,P=j;return d(),m(P,null,{left:i((()=>[c(l,{size:"lg"},{default:i((()=>[p(h(e.$t("Create P2P Offer")),1)])),_:1})])),right:i((()=>[c(n,{type:"button",color:"muted",class:"hover:bg-gray-300 dark:hover:bg-gray-800",to:"/user/p2p/offers"},{default:i((()=>[c(t,{name:"line-md:chevron-left",class:"h-4 w-4 mr-2"}),p(" "+h(e.$t("Back")),1)])),_:1}),c(n,{type:"submit",color:"primary",disabled:f(ge),class:"w-full",onClick:f(Ve)},{default:i((()=>[p(h(e.$t("Create")),1)])),_:1},8,["disabled","onClick"])])),default:i((()=>[y("form",{onSubmit:a[0]||(a[0]=(...e)=>f(Ve)&&f(Ve)(...e)),class:"space-y-8"},[c(u,{class:"p-5"},{default:i((()=>[y("div",$,[y("div",null,[c(f(k),{name:"payment_method"},{default:i((({field:e,errorMessage:a,handleChange:l,handleBlur:t})=>[c(r,{"model-value":e.value,error:a,items:f(ae)?.map((e=>({label:e.name,value:e.id}))),properties:{label:"label",value:"value"},placeholder:"Select a payment method",label:"Payment Method",shape:"rounded","onUpdate:modelValue":l,onBlur:t},null,8,["model-value","error","items","onUpdate:modelValue","onBlur"]),W])),_:1})]),y("div",null,[c(f(k),{name:"wallet_type"},{default:i((({field:e,errorMessage:a,handleChange:l,handleBlur:t})=>[c(r,{"model-value":e.value,error:a,items:pe,label:"Purchase Wallet Type",placeholder:"Select wallet type",shape:"rounded","onUpdate:modelValue":l,onBlur:t},null,8,["model-value","error","onUpdate:modelValue","onBlur"]),q])),_:1})]),y("div",null,[c(f(k),{name:"currency"},{default:i((({field:e,errorMessage:a,handleChange:l,handleBlur:t})=>[c(r,{"model-value":e.value,error:a,items:f(he),label:"Purchase Currency",placeholder:"Select purchase currency",disabled:!f(be)?.wallet_type||""===f(be)?.wallet_type,"onUpdate:modelValue":l,onBlur:t},null,8,["model-value","error","items","disabled","onUpdate:modelValue","onBlur"]),J])),_:1})]),f(be).wallet_type&&"FIAT"!==f(be).wallet_type?(d(),v("div",Q,[c(f(k),{name:"chain"},{default:i((({field:e,errorMessage:a,handleChange:l,handleBlur:t})=>[c(r,{"model-value":e.value,error:a,items:f(Be),label:"Chain",placeholder:"Select chain",disabled:!f(be)?.wallet_type||""===f(be)?.wallet_type,"onUpdate:modelValue":l,onBlur:t},null,8,["model-value","error","items","disabled","onUpdate:modelValue","onBlur"]),Y])),_:1})])):g("",!0),y("div",null,[c(s,{"model-value":`${f(we)?.balance??0} ${f(be)?.currency??""}`,label:"Balance",shape:"rounded",placeholder:"Please select a currency",readonly:"",disabled:""},null,8,["model-value"]),z]),y("div",null,[c(f(k),{name:"amount"},{default:i((({field:e,errorMessage:a,handleChange:l,handleBlur:t})=>[c(s,{modelValue:e.value,"onUpdate:modelValue":[a=>e.value=a,l],error:a,label:"Amount",shape:"rounded",placeholder:"Enter amount",type:"number",min:"0",max:f(we)?.balance??0,step:"0.00000001",onBlur:t},null,8,["modelValue","onUpdate:modelValue","error","max","onBlur"]),L])),_:1})]),y("div",null,[c(f(k),{name:"price"},{default:i((({field:e,errorMessage:a,handleChange:l,handleBlur:t})=>[c(s,{modelValue:e.value,"onUpdate:modelValue":[a=>e.value=a,l],error:a,label:"Price",shape:"rounded",placeholder:"Enter price",type:"number",min:"0",step:"0.00000001",onBlur:t},null,8,["modelValue","onUpdate:modelValue","error","onBlur"]),X])),_:1})]),y("div",null,[c(f(k),{name:"min_amount"},{default:i((({field:e,errorMessage:a,handleChange:l,handleBlur:t})=>[c(s,{modelValue:e.value,"onUpdate:modelValue":[a=>e.value=a,l],error:a,label:"Minimum Amount",shape:"rounded",placeholder:"Enter minimum amount",type:"number",min:"0",step:"0.00000001",onBlur:t},null,8,["modelValue","onUpdate:modelValue","error","onBlur"]),D])),_:1})]),y("div",null,[c(f(k),{name:"max_amount"},{default:i((({field:e,errorMessage:a,handleChange:l,handleBlur:t})=>[c(s,{modelValue:e.value,"onUpdate:modelValue":[a=>e.value=a,l],error:a,label:"Maximum Amount",shape:"rounded",placeholder:"Enter maximum amount",type:"number",min:"0",step:"0.00000001",onBlur:t},null,8,["modelValue","onUpdate:modelValue","error","onBlur"]),G])),_:1})])])])),_:1}),c(o,null,{default:i((()=>[c(n,{type:"submit",color:"primary",disabled:f(ge),class:"w-full"},{default:i((()=>[p(h(e.$t("Create Offer")),1)])),_:1},8,["disabled"])])),_:1})],32)])),_:1})}}});export{H as default};
