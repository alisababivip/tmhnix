import{a as e,ad as a,ac as t,z as s,r as l,E as u,c as r,O as n,w as m,o,e as i,q as d,t as p,u as f,f as c,_ as h,x as v,X as g,Y as _}from"../e/entry-8qgg5CL-.js";import{_ as b}from"./BaseInput.vue-iInHQMIA.js";import{_ as x}from"./TairoFormSave.vue-aLVbwikq.js";import{_ as y}from"./TairoContentWrapper.vue-JqAKR4O_.js";import{u as w}from"./useP2P-NV4dmDWU.js";import{z as P,u as V,t as j,F as B}from"./vee-validate.esm-n59zZCC5.js";import{u as U}from"./offers-pCoDOi_A.js";import"./input-id-wZ-Ta08j.js";const M={class:"grid grid-cols-1 sm:grid-cols-2 gap-6"},O=c("small",null,[c("span",{class:"text-xs text-warning-500"}," Enter the minimum amount you want to sell ")],-1),E=c("small",null,[c("span",{class:"text-xs text-warning-500"}," Enter the maximum amount you want to sell ")],-1),C=e({__name:"[uuid]",setup(e){const{toast:C}=a(),S=t(),$=s(),{uuid:k}=$.params,F=U(),{editP2POffer:T,getUserP2POffer:z}=w(),A=l(null);u((async()=>{const e=await z(k);A.value=e.data.result,X()}));const q=P.object({min_amount:P.number().positive("Minimum amount must be positive"),max_amount:P.number().positive("Maximum amount must be positive")}),I=r((()=>({...A.value}))),{handleSubmit:J,isSubmitting:W,resetForm:X,values:Y,setFieldValue:D}=V({validationSchema:j(q),initialValues:I}),G=J((async e=>{if(e.min_amount>e.max_amount)C.dangerText("Minimum trade amount cannot be greater than maximum trade amount");else try{const a=await T(k,e.min_amount,e.max_amount);C.response(a),"success"===a.status&&(await F.fetchP2POffers(),await F.fetchUserP2POffers(),S.push("/user/p2p/offers"))}catch(a){C.danger(a)}}));return(e,a)=>{const t=h,s=v,l=g,u=b,r=_,w=x,P=y;return o(),n(P,null,{left:m((()=>[i(t,{size:"lg"},{default:m((()=>[d(p(e.$t(`\n        Editing Offer: #${f(k)}\n      `)),1)])),_:1})])),right:m((()=>[i(l,{type:"button",color:"muted",class:"hover:bg-gray-300 dark:hover:bg-gray-800",to:"/user/p2p/offers"},{default:m((()=>[i(s,{name:"line-md:chevron-left",class:"h-4 w-4 mr-2"}),d(" "+p(e.$t("Back")),1)])),_:1}),i(l,{type:"submit",color:"primary",disabled:f(W),class:"w-full",onClick:f(G)},{default:m((()=>[d(p(e.$t("Update")),1)])),_:1},8,["disabled","onClick"])])),default:m((()=>[c("form",{onSubmit:a[0]||(a[0]=(...a)=>e.create&&e.create(...a)),class:"space-y-8"},[i(r,{class:"p-5"},{default:m((()=>[c("div",M,[c("div",null,[i(f(B),{name:"min_amount"},{default:m((({field:e,errorMessage:a,handleChange:t,handleBlur:s})=>[i(u,{modelValue:e.value,"onUpdate:modelValue":[a=>e.value=a,t],error:a,label:"Minimum Amount",shape:"rounded",placeholder:"Enter minimum amount",type:"number",min:"0",step:"0.00000001",onBlur:s},null,8,["modelValue","onUpdate:modelValue","error","onBlur"]),O])),_:1})]),c("div",null,[i(f(B),{name:"max_amount"},{default:m((({field:e,errorMessage:a,handleChange:t,handleBlur:s})=>[i(u,{modelValue:e.value,"onUpdate:modelValue":[a=>e.value=a,t],error:a,label:"Maximum Amount",shape:"rounded",placeholder:"Enter maximum amount",type:"number",min:"0",step:"0.00000001",onBlur:s},null,8,["modelValue","onUpdate:modelValue","error","onBlur"]),E])),_:1})])])])),_:1}),i(w,null,{default:m((()=>[i(l,{type:"submit",color:"primary",disabled:f(W),class:"w-full"},{default:m((()=>[d(p(e.$t("Update Offer")),1)])),_:1},8,["disabled"])])),_:1})],32)])),_:1})}}});export{C as default};
