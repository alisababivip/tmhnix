import{a as e,U as a,Q as l,c as t,r as s,as as o,b as r,e as i,w as d,u as n,W as u,Y as p,o as m,f as b,q as v,t as c,O as h,k as w,_ as f,a0 as g,X as _}from"../e/entry-8qgg5CL-.js";import{_ as x}from"./BaseMessage.vue-Kpn2u5Rn.js";import{_ as y}from"./BaseListbox.vue-1Dy9Ui3z.js";import{_ as B}from"./TairoFormGroup.vue--3qC-osX.js";import{_ as j}from"./TairoFormSave.vue-aLVbwikq.js";import{z as S,u as D,t as U,F as V}from"./vee-validate.esm-n59zZCC5.js";import"./BaseIconBox.vue-qjQCKz6R.js";import"./BaseAvatar.vue-XYSxxLJP.js";import"./use-text-value-9iwzs_EA.js";const E={class:"flex items-center justify-between p-4"},$={class:"flex items-center gap-2"},W={class:"px-8"},k={class:"mx-auto space-y-12 py-8"},T={class:"text-gray-700 dark:text-gray-300"},C={class:"grid grid-cols-12 gap-4 pt-2"},M={class:"col-span-12 sm:col-span-6"},F={class:"text-xs text-warning-500"},A={class:"col-span-12 sm:col-span-6"},O={class:"text-xs text-warning-500"},G={class:"col-span-12 sm:col-span-6"},Y={class:"text-xs text-warning-500"},z={class:"col-span-12 sm:col-span-6"},R={class:"text-xs text-warning-500"},q={class:"grid grid-cols-12 gap-4 pt-2"},I={class:"col-span-12 sm:col-span-6"},J={class:"text-xs text-warning-500"},L={class:"col-span-12 sm:col-span-6"},P={class:"text-xs text-warning-500"},Q=e({__name:"wallets",setup(e){const{updateSettings:Q}=a(),X=l(),H=t((()=>X.settings)),K=S.object({deposit_expiration:S.object({label:S.string(),value:S.boolean()}).nullable(),fiat_wallets:S.object({label:S.string(),value:S.boolean()}),deposit:S.object({label:S.string(),value:S.boolean()}),withdraw:S.object({label:S.string(),value:S.boolean()}),transfer:S.object({label:S.string(),value:S.boolean()}),spot_wallet_withdrawal:S.string().nullable()}),N=U(K),Z=t((()=>({deposit_expiration:{label:H.value.deposit_expiration?"Enabled":"Disabled",value:!!H.value.deposit_expiration},fiat_wallets:{label:H.value.fiat_wallets?"Enabled":"Disabled",value:!!H.value.fiat_wallets},deposit:{label:H.value.deposit?"Enabled":"Disabled",value:!!H.value.deposit},withdraw:{label:H.value.withdraw?"Enabled":"Disabled",value:!!H.value.withdraw},transfer:{label:H.value.transfer?"Enabled":"Disabled",value:!!H.value.transfer},spot_wallet_withdrawal:H.value.spot_wallet_withdrawal||"Automatic"}))),ee=[{label:"Enabled",value:!0},{label:"Disabled",value:!1}],{handleSubmit:ae,isSubmitting:le,setFieldError:te,meta:se,errors:oe,resetForm:re,setErrors:ie}=D({validationSchema:N,initialValues:Z}),de=s(!1),ne=t((()=>Object.keys(oe.value).length));o((()=>{if(se.value.dirty)return confirm("You have unsaved changes. Are you sure you want to leave?")}));const ue=ae((async e=>{e.deposit_expiration&&(e.deposit_expiration=e.deposit_expiration.value),e.fiat_wallets&&(e.fiat_wallets=e.fiat_wallets.value),e.deposit&&(e.deposit=e.deposit.value),e.withdraw&&(e.withdraw=e.withdraw.value),e.transfer&&(e.transfer=e.transfer.value),de.value=!1;try{const a=await Q(e);"success"===a.status&&(await Q(e),document.documentElement.scrollTo({top:0,behavior:"smooth"}),de.value=!0,X.setSettings(Object.values(a.data.result)),setTimeout((()=>{de.value=!1}),3e3))}catch(a){if(a.data&&a.data.errors)for(const[e,l]of Object.entries(a.data.errors))te(e,l[0]);else console.error("An unknown error occurred:",a)}}));return(e,a)=>{const l=f,t=g,s=_,o=x,S=y,D=B,U=p,Q=j;return m(),r("form",{method:"POST",action:"",class:"w-full pb-16",onSubmit:a[2]||(a[2]=u(((...e)=>n(ue)&&n(ue)(...e)),["prevent"]))},[i(U,null,{default:d((()=>[b("div",E,[b("div",null,[i(l,{tag:"h2",size:"sm",weight:"medium",lead:"normal",class:"uppercase tracking-wider"},{default:d((()=>[v(c(e.$t("General Settings")),1)])),_:1}),i(t,{size:"xs",class:"text-muted-400"},{default:d((()=>[v(c(e.$t("Edit your site settings")),1)])),_:1})]),b("div",$,[i(s,{type:"submit",color:"primary",class:"w-24",disabled:n(le)||!n(se).dirty,loading:n(le)},{default:d((()=>[v(c(e.$t("Save")),1)])),_:1},8,["disabled","loading"])])]),b("div",W,[b("div",k,[n(de)?(m(),h(o,{key:0,onClose:a[0]||(a[0]=e=>de.value=!1)},{default:d((()=>[b("span",T,c(e.$t("Your settings have been saved"))+"!",1)])),_:1})):w("",!0),n(ne)?(m(),h(o,{key:1,type:"danger",onClose:a[1]||(a[1]=()=>n(ie)({}))},{default:d((()=>[v(c(e.$t("This form has"))+" "+c(n(ne))+" "+c(e.$t("errors, please check them before submitting")),1)])),_:1})):w("",!0),i(D,{label:"Global Settings",sublabel:"Global settings for the all wallets"},{default:d((()=>[b("div",C,[b("div",M,[i(n(V),{name:"deposit_expiration"},{default:d((({field:a,errorMessage:l,handleChange:t,handleBlur:s})=>[i(S,{"model-value":a.value,error:l,disabled:n(le),items:ee,properties:{label:"label",value:"value"},placeholder:"Deposit Expiration",label:"Deposit Expiration",shape:"rounded","onUpdate:modelValue":t,onBlur:s},null,8,["model-value","error","disabled","onUpdate:modelValue","onBlur"]),b("small",null,[b("span",F,c(e.$t("Spot wallet deposit expiration limit to prevent lookups from use random transactions that sent to the spot wallet address")),1)])])),_:1})]),b("div",A,[i(n(V),{name:"fiat_wallets"},{default:d((({field:a,errorMessage:l,handleChange:t,handleBlur:s})=>[i(S,{"model-value":a.value,error:l,disabled:n(le),items:ee,properties:{label:"label",value:"value"},placeholder:"Fiat Wallets",label:"Fiat Wallets",shape:"rounded","onUpdate:modelValue":t,onBlur:s},null,8,["model-value","error","disabled","onUpdate:modelValue","onBlur"]),b("small",null,[b("span",O,c(e.$t("Disable this option if you want to disable fiat wallets and everything related to it")),1)])])),_:1})]),b("div",G,[i(n(V),{name:"deposit"},{default:d((({field:a,errorMessage:l,handleChange:t,handleBlur:s})=>[i(S,{"model-value":a.value,error:l,disabled:n(le),items:ee,properties:{label:"label",value:"value"},placeholder:"Deposit",label:"Deposit",shape:"rounded","onUpdate:modelValue":t,onBlur:s},null,8,["model-value","error","disabled","onUpdate:modelValue","onBlur"]),b("small",null,[b("span",Y,c(e.$t("Disable this option if you want to disable deposits")),1)])])),_:1})]),b("div",z,[i(n(V),{name:"transfer"},{default:d((({field:a,errorMessage:l,handleChange:t,handleBlur:s})=>[i(S,{"model-value":a.value,error:l,disabled:n(le),items:ee,properties:{label:"label",value:"value"},placeholder:"Transfer",label:"Transfer",shape:"rounded","onUpdate:modelValue":t,onBlur:s},null,8,["model-value","error","disabled","onUpdate:modelValue","onBlur"]),b("small",null,[b("span",R,c(e.$t("Disable this option if you want to disable transfers")),1)])])),_:1})])])])),_:1}),i(D,{label:"Withdraw",sublabel:"Withdraw settings"},{default:d((()=>[b("div",q,[b("div",I,[i(n(V),{name:"withdraw"},{default:d((({field:a,errorMessage:l,handleChange:t,handleBlur:s})=>[i(S,{"model-value":a.value,error:l,disabled:n(le),items:ee,properties:{label:"label",value:"value"},placeholder:"Withdraw",label:"Withdraw",shape:"rounded","onUpdate:modelValue":t,onBlur:s},null,8,["model-value","error","disabled","onUpdate:modelValue","onBlur"]),b("small",null,[b("span",J,c(e.$t("Disable this option if you want to disable withdraws")),1)])])),_:1})]),b("div",L,[i(n(V),{name:"spot_wallet_withdrawal"},{default:d((({field:a,errorMessage:l,handleChange:t,handleBlur:s})=>[i(S,{"model-value":a.value,error:l,disabled:n(le),items:["Automatic","Manual"],placeholder:"Spot Wallet Withdrawal",label:"Spot Wallet Withdrawal",shape:"rounded","onUpdate:modelValue":t,onBlur:s},null,8,["model-value","error","disabled","onUpdate:modelValue","onBlur"]),b("small",null,[b("span",P,c(e.$t("Spot wallet withdrawal limit to prevent lookups from use random transactions that sent to the spot wallet address")),1)])])),_:1})])])])),_:1})])])])),_:1}),i(Q,{disabled:n(le),loading:n(le),onReset:n(re)},null,8,["disabled","loading","onReset"])],32)}}});export{Q as default};
