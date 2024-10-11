import{a as e,z as a,c as r,E as t,ad as l,ac as o,r as s,J as n,O as u,w as d,o as i,e as m,q as c,t as p,f,u as v,p as h,W as b,b as g,A as y,F as x,B as w,n as k,k as B,_,x as V,X as j,Y as U}from"../e/entry-8qgg5CL-.js";import{_ as C}from"./BaseInput.vue-iInHQMIA.js";import{_ as I}from"./BaseProgress.vue-xH0Mhn3Z.js";import{_ as M}from"./BaseInputFileHeadless.vue-LOgyN9kF.js";import{_ as P}from"./BaseTextarea.vue-8st5U0qk.js";import{_ as D}from"./BaseListbox.vue-1Dy9Ui3z.js";import{_ as z}from"./TairoContentWrapper.vue-JqAKR4O_.js";import{u as R}from"./useInvestment-ZaAPyLmc.js";import{u as q}from"./fiatCurrency-EA2f5t5g.js";import{u as S}from"./fetch-i3Y1jjTS.js";import{b as F}from"./strings-rQgUKePI.js";import{_ as O}from"./placeholder-file-IxKzOaSl.js";import{z as E,u as $,t as T,F as A}from"./vee-validate.esm-n59zZCC5.js";import{u as W}from"./plan-Urxr1Gf-.js";import"./input-id-wZ-Ta08j.js";import"./BaseIconBox.vue-qjQCKz6R.js";import"./BaseAvatar.vue-XYSxxLJP.js";import"./use-text-value-9iwzs_EA.js";const L={class:"grid grid-cols-1 sm:grid-cols-2 gap-6"},N={class:"grid grid-cols-1 sm:grid-cols-2 gap-6"},K=["onDrop"],Y=["onClick","onKeydown"],H={class:"p-5 text-center"},J={class:"text-muted-400 font-sans text-sm"},X={class:"text-muted-400 font-sans text-[0.7rem] font-semibold uppercase"},Z={for:"file",class:"text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 cursor-pointer font-sans text-sm underline underline-offset-4 transition-colors duration-300"},G={key:1,class:"mt-6 space-y-2"},Q={class:"border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-end gap-2 rounded-xl border bg-white p-3"},ee={class:"flex items-center gap-2"},ae={class:"shrink-0"},re=["src"],te={key:1,loading:"lazy",class:"h-14 w-14 rounded-xl object-cover object-center",src:O,alt:"Image preview"},le={class:"font-sans"},oe={class:"text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm"},se={class:"text-muted-400 block text-xs"},ne={class:"flex gap-2"},ue={class:"border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60",disabled:"",type:"button",tooltip:"Cancel"},de=f("span",{class:"sr-only"},"Cancel",-1),ie={class:"border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300",type:"button",tooltip:"Upload"},me=f("span",{class:"sr-only"},"Upload",-1),ce=["onClick"],pe=f("span",{class:"sr-only"},"Remove",-1),fe={key:0,class:"mb-4 h-36 w-full flex items-center justify-center overflow-hidden rounded-xl"},ve=["src"],he={class:"grid grid-cols-1 sm:grid-cols-2 gap-6"},be={class:"flex gap-5 justify-between xs:flex-col"},ge=e({__name:"[id]",setup(e){const O=a().params.id,ge=W(),{updateInvestmentPlan:ye}=R(),xe=r((()=>ge.selectedPlan||ge.getPlanById(O)));t((async()=>{const e=Number(O);0===ge.plans.length&&await ge.fetchInvestmentPlans(),ge.selectPlanById(e),Pe.value=xe.value?.image||null,ge.selectedPlan||ke.push("/admin/finance/investment-plans")}));const{toast:we}=l(),ke=o(),Be=E.object({title:E.string().nonempty("Title is required"),name:E.string().nonempty("Name is required"),description:E.string().nonempty("Description are required"),image:E.union([E.string(),E.null()]).optional(),roi:E.number().min(0,"ROI must be greater or equal to 0").max(100,"ROI must be less than or equal to 100").refine((e=>{const a=Math.pow(10,4);return Math.round(e*a)/a===e}),{message:"ROI can have up to 4 decimal places"}),min_amount:E.number().min(0,"Minimum amount must be greater or equal to 0"),max_amount:E.number().gt(0,"Maximum amount must be greater than 0"),duration:E.number().min(1,"Duration must be greater than 1 day"),currency:E.string().nonempty("Currency is required")}).refine((e=>e.max_amount>e.min_amount),{message:"Maximum amount must be greater than minimum amount",path:["max_amount"]}),_e=r((()=>({...xe.value}))),Ve=q();t((async()=>{0===Ve.currencies.length&&await Ve.fetchCurrencies()}));const je=r((()=>Ve.currencies.filter((e=>e.status)))),{handleSubmit:Ue,isSubmitting:Ce,errors:Ie}=$({validationSchema:T(Be),initialValues:_e}),Me=s(null),Pe=s(xe.value?.image||null);n(Me,(e=>{const a=e?.item(0)||null;if(Me.value){const e=new FileReader;e.onload=e=>{Pe.value=e.target?.result},e.readAsDataURL(a)}}));const De=Ue((async e=>{try{let a={...e};if(Me.value){const e=new FormData;e.append("files",Me.value[0]),e.append("type","investmentPlan");const r=await S("/api/upload",{method:"POST",body:e},"$8zZYWD4xLz");r&&""!==r.data.value&&(a.image=r.data.value[0])}"success"===(await ye(O,a)).status&&(await ge.fetchInvestmentPlans(),ke.push("/admin/finance/investment-plans"))}catch(a){we.danger(a)}}));return(e,a)=>{const r=_,t=V,l=j,o=C,s=U,n=I,R=M,q=P,S=D,O=z;return i(),u(O,null,{left:d((()=>[m(r,{size:"lg"},{default:d((()=>[c(p(e.$t("Edit Investment Plan")),1)])),_:1})])),right:d((()=>[m(l,{type:"button",color:"muted",to:"/admin/finance/investment-plans"},{default:d((()=>[m(t,{name:"line-md:chevron-left",class:"h-4 w-4 mr-2"}),c(" "+p(e.$t("Back")),1)])),_:1})])),default:d((()=>[f("form",{onSubmit:a[3]||(a[3]=(...e)=>v(De)&&v(De)(...e)),class:"space-y-8"},[f("div",L,[m(s,{class:"p-5 space-y-5"},{default:d((()=>[m(v(A),{name:"title"},{default:d((({field:e,errorMessage:a,handleChange:r,handleBlur:t})=>[m(o,{modelValue:e.value,"onUpdate:modelValue":[a=>e.value=a,r],error:a,disabled:v(Ce),type:"text",label:"Title",placeholder:"Enter title",shape:"rounded",class:"w-full",onBlur:t},null,8,["modelValue","onUpdate:modelValue","error","disabled","onBlur"])])),_:1}),m(v(A),{name:"name"},{default:d((({field:e,errorMessage:a,handleChange:r,handleBlur:t})=>[m(o,{modelValue:e.value,"onUpdate:modelValue":[a=>e.value=a,r],error:a,disabled:v(Ce),type:"text",label:"Name",placeholder:"Enter name",shape:"rounded",class:"w-full",onBlur:t},null,8,["modelValue","onUpdate:modelValue","error","disabled","onBlur"])])),_:1})])),_:1}),m(s,{class:"p-5"},{default:d((()=>[f("div",N,[m(R,{modelValue:v(Me),"onUpdate:modelValue":a[2]||(a[2]=e=>h(Me)?Me.value=e:null)},{default:d((({open:r,remove:l,preview:o,drop:s,files:u})=>[f("div",{class:"",onDragenter:a[0]||(a[0]=b((()=>{}),["stop","prevent"])),onDragover:a[1]||(a[1]=b((()=>{}),["stop","prevent"])),onDrop:s},[u?.length?(i(),g("ul",G,[(i(!0),g(x,null,w(u,(a=>(i(),g("li",{key:a.name},[f("div",Q,[f("div",ee,[f("div",ae,[a.type.startsWith("image")?(i(),g("img",{key:0,loading:"lazy",class:"h-14 w-14 rounded-xl object-cover object-center",src:o(a).value,alt:"Image preview"},null,8,re)):(i(),g("img",te))]),f("div",le,[f("span",oe,p(a.name),1),f("span",se,p(("formatFileSize"in e?e.formatFileSize:v(F))(a.size)),1)])]),f("div",{class:k(["ms-auto w-32 px-4 transition-opacity duration-300","opacity-100"])},[m(n,{value:0,size:"xs",color:"success"})]),f("div",ne,[f("button",ue,[m(t,{name:"lucide:slash",class:"h-4 w-4"}),de]),f("button",ie,[m(t,{name:"lucide:arrow-up",class:"h-4 w-4"}),me]),f("button",{class:"border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300",type:"button",tooltip:"Remove",onClick:b((e=>l(a)),["prevent"])},[m(t,{name:"lucide:x",class:"h-4 w-4"}),pe],8,ce)])])])))),128))])):(i(),g("div",{key:0,class:"nui-focus border-muted-300 dark:border-muted-700 hover:border-muted-400 focus:border-muted-400 dark:hover:border-muted-600 dark:focus:border-muted-700 group cursor-pointer rounded-lg border-[3px] border-dashed transition-colors duration-300",tabindex:"0",role:"button",onClick:r,onKeydown:y(b(r,["prevent"]),["enter"])},[f("div",H,[m(t,{name:"mdi-light:cloud-upload",class:"text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 mb-2 h-10 w-10 transition-colors duration-300"}),f("h4",J,p(e.$t("Drop file to upload")),1),f("div",null,[f("span",X,p(e.$t("Or")),1)]),f("label",Z,p(e.$t("Select Image")),1)])],40,Y))],40,K)])),_:1},8,["modelValue"]),v(Pe)?(i(),g("div",fe,[f("img",{loading:"lazy",src:v(Pe),alt:"Image Preview",class:"max-h-full max-w-full object-cover object-center"},null,8,ve)])):B("",!0)])])),_:1})]),m(s,{class:"p-5"},{default:d((()=>[m(v(A),{name:"description"},{default:d((({field:e,errorMessage:a,handleChange:r,handleBlur:t})=>[m(q,{modelValue:e.value,"onUpdate:modelValue":[a=>e.value=a,r],error:a,label:"Description",shape:"rounded",placeholder:"Write a description",class:"w-full",onBlur:t},null,8,["modelValue","onUpdate:modelValue","error","onBlur"])])),_:1})])),_:1}),f("div",he,[m(s,{class:"p-5 space-y-5"},{default:d((()=>[m(v(A),{name:"duration"},{default:d((({field:e,errorMessage:a,handleChange:r,handleBlur:t})=>[m(o,{modelValue:e.value,"onUpdate:modelValue":[a=>e.value=a,r],error:a,type:"number",label:"Duration",placeholder:"Enter duration in days",shape:"rounded",class:"w-full",onBlur:t},null,8,["modelValue","onUpdate:modelValue","error","onBlur"])])),_:1}),m(v(A),{name:"roi"},{default:d((({field:e,errorMessage:a,handleChange:r,handleBlur:t})=>[m(o,{modelValue:e.value,"onUpdate:modelValue":[a=>e.value=a,r],error:a,type:"number",label:"ROI",icon:"%",placeholder:"Return on investment (ROI) in % at the end of the plan",shape:"rounded",class:"w-full",onBlur:t},null,8,["modelValue","onUpdate:modelValue","error","onBlur"])])),_:1})])),_:1}),m(s,{class:"p-5 space-y-5"},{default:d((()=>[m(v(A),{name:"currency"},{default:d((({field:e,errorMessage:a,handleChange:r,handleBlur:t})=>[m(S,{"model-value":e.value,error:a,disabled:v(Ce),items:v(je).map((e=>e.code)),properties:{label:"label",value:"value"},placeholder:"Please select a currency",label:"Currency",shape:"rounded","onUpdate:modelValue":r,onBlur:t},null,8,["model-value","error","disabled","items","onUpdate:modelValue","onBlur"])])),_:1}),f("div",be,[m(v(A),{name:"min_amount"},{default:d((({field:e,errorMessage:a,handleChange:r,handleBlur:t})=>[m(o,{modelValue:e.value,"onUpdate:modelValue":[a=>e.value=a,r],error:a,type:"number",label:"Minimum Amount",placeholder:"Enter minimum amount",shape:"rounded",class:"w-full",onBlur:t},null,8,["modelValue","onUpdate:modelValue","error","onBlur"])])),_:1}),m(v(A),{name:"max_amount"},{default:d((({field:e,errorMessage:a,handleChange:r,handleBlur:t})=>[m(o,{modelValue:e.value,"onUpdate:modelValue":[a=>e.value=a,r],error:a,type:"number",label:"Maximum Amount",placeholder:"Enter maximum amount",shape:"rounded",class:"w-full",onBlur:t},null,8,["modelValue","onUpdate:modelValue","error","onBlur"])])),_:1})])])),_:1})]),m(l,{type:"submit",color:"primary",disabled:v(Ce),class:"px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"},{default:d((()=>[c(p(e.$t("Update Plan")),1)])),_:1},8,["disabled"])],32)])),_:1})}}});export{ge as default};
