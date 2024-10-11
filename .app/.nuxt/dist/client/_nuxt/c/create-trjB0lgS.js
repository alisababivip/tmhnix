import{a as e,ad as a,ac as l,c as s,E as r,O as t,w as o,o as n,e as u,q as i,t as d,u as m,f as c,_ as p,x as f,X as g,Y as v}from"../e/entry-8qgg5CL-.js";import{_ as y}from"./BaseListbox.vue-1Dy9Ui3z.js";import{_ as h}from"./BaseTextarea.vue-8st5U0qk.js";import{_ as b}from"./TairoFormSave.vue-aLVbwikq.js";import{_}from"./TairoContentWrapper.vue-JqAKR4O_.js";import{u as w}from"./useFaq-K_svOq1B.js";import{z as j,u as q,t as B,F as C}from"./vee-validate.esm-n59zZCC5.js";import{u as V}from"./categories-4ILOaku6.js";import{u as x}from"./entries-UqKw90l3.js";import"./BaseIconBox.vue-qjQCKz6R.js";import"./BaseAvatar.vue-XYSxxLJP.js";import"./use-text-value-9iwzs_EA.js";import"./input-id-wZ-Ta08j.js";const F={class:"grid gap-5 grid-cols-1 sm:grid-cols-2"},S=e({__name:"create",setup(e){const{toast:S}=a(),U=l(),T=V(),k=x(),{createAdminFaq:A}=w(),E=s((()=>T.categories));r((async()=>{0===T.categories.length&&await T.fetchCategories()}));const $=j.object({question:j.string().nonempty("Question is required"),answer:j.string().nonempty("Answer is required"),category:j.object({label:j.string().nonempty("Category is required"),value:j.number().nullable()})}),M=s((()=>({question:"",answer:"",category:{label:"Please select a category",value:null}}))),{handleSubmit:W,isSubmitting:P,resetForm:Q,values:z,setFieldValue:I}=q({validationSchema:B($),initialValues:M}),J=W((async e=>{if(e.category.value)try{const a=await A(e.question,e.answer,e.category.value);S.response(a),"success"===a.status&&(await k.fetchFaqs(),U.push("/admin/extensions/faq/entries"))}catch(a){S.danger(a)}else S.dangerText("Please select a category")}));return(e,a)=>{const l=p,s=f,r=g,w=y,j=h,q=v,B=b,V=_;return n(),t(V,null,{left:o((()=>[u(l,{size:"lg"},{default:o((()=>[i(d(e.$t("Create Faq Entry")),1)])),_:1})])),right:o((()=>[u(r,{type:"button",color:"muted",class:"hover:bg-gray-300 dark:hover:bg-gray-800",to:"/admin/extensions/faq/entries"},{default:o((()=>[u(s,{name:"line-md:chevron-left",class:"h-4 w-4 mr-2"}),i(" "+d(e.$t("Back")),1)])),_:1}),u(r,{type:"submit",color:"primary",disabled:m(P),class:"w-full",onClick:m(J)},{default:o((()=>[i(d(e.$t("Create Entry")),1)])),_:1},8,["disabled","onClick"])])),default:o((()=>[c("form",{onSubmit:a[0]||(a[0]=(...e)=>m(J)&&m(J)(...e)),class:"space-y-8"},[u(q,{class:"p-5 space-y-5"},{default:o((()=>[c("div",F,[u(m(C),{name:"category"},{default:o((({field:e,errorMessage:a,handleChange:l,handleBlur:s})=>[u(w,{"model-value":e.value,error:a,items:m(E).map((e=>({label:e.identifier,value:e.id}))),properties:{label:"label",value:"value"},label:"Category",placeholder:"Select a category",shape:"rounded","onUpdate:modelValue":l,onBlur:s},null,8,["model-value","error","items","onUpdate:modelValue","onBlur"])])),_:1})]),u(m(C),{name:"question"},{default:o((({field:e,errorMessage:a,handleChange:l,handleBlur:s})=>[u(j,{modelValue:e.value,"onUpdate:modelValue":[a=>e.value=a,l],error:a,label:"Question",shape:"rounded",placeholder:"Write a question",class:"w-full",onBlur:s},null,8,["modelValue","onUpdate:modelValue","error","onBlur"])])),_:1}),u(m(C),{name:"answer"},{default:o((({field:e,errorMessage:a,handleChange:l,handleBlur:s})=>[u(j,{modelValue:e.value,"onUpdate:modelValue":[a=>e.value=a,l],error:a,label:"Answer",shape:"rounded",placeholder:"Write an answer",class:"w-full",onBlur:s},null,8,["modelValue","onUpdate:modelValue","error","onBlur"])])),_:1})])),_:1}),u(B,null,{default:o((()=>[u(r,{type:"submit",color:"primary",disabled:m(P),class:"w-full"},{default:o((()=>[i(d(e.$t("Create Entry")),1)])),_:1},8,["disabled"])])),_:1})],32)])),_:1})}}});export{S as default};
