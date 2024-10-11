import{a as e,ad as a,ac as l,z as t,c as r,r as o,E as n,J as s,O as u,w as d,o as i,e as m,q as p,t as c,u as f,f as h,p as g,W as v,b,A as x,F as y,B as w,n as _,k as V,_ as k,x as B,X as j,Y as U}from"../e/entry-8qgg5CL-.js";import{_ as C}from"./BaseInput.vue-iInHQMIA.js";import{_ as M}from"./BaseProgress.vue-xH0Mhn3Z.js";import{_ as $}from"./BaseInputFileHeadless.vue-LOgyN9kF.js";import{_ as P}from"./BaseTextarea.vue-8st5U0qk.js";import{_ as S}from"./BaseListbox.vue-1Dy9Ui3z.js";import{_ as D}from"./BaseTag.vue-NMkN1Uk8.js";import{_ as T}from"./BaseCheckbox.vue-cNhyVlDH.js";import{_ as I}from"./TairoFormSave.vue-aLVbwikq.js";import{_ as A}from"./TairoContentWrapper.vue-JqAKR4O_.js";import{u as q}from"./useAiTrading-wIB0sHyU.js";import{u as E}from"./fetch-i3Y1jjTS.js";import{b as F}from"./strings-rQgUKePI.js";import{_ as N}from"./placeholder-file-IxKzOaSl.js";import{z as R,u as W,t as z,F as O}from"./vee-validate.esm-n59zZCC5.js";import{u as L}from"./plans-w2zjFGwh.js";import{u as H}from"./durations-gSTqwGyf.js";import"./input-id-wZ-Ta08j.js";import"./BaseIconBox.vue-qjQCKz6R.js";import"./BaseAvatar.vue-XYSxxLJP.js";import"./use-text-value-9iwzs_EA.js";import"./IconCheck-JvP9GQU1.js";const J={class:"grid grid-cols-1 sm:grid-cols-2 gap-6"},K={class:"text-warning-500 text-xs"},G={class:"text-warning-500 text-xs"},Q={class:"grid grid-cols-1 sm:grid-cols-2 gap-6"},X=["onDrop"],Y=["onClick","onKeydown"],Z={class:"p-5 text-center"},ee={class:"text-muted-400 font-sans text-sm"},ae={class:"text-muted-400 font-sans text-[0.7rem] font-semibold uppercase"},le={for:"file",class:"text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 cursor-pointer font-sans text-sm underline underline-offset-4 transition-colors duration-300"},te={key:1,class:"mt-6 space-y-2"},re={class:"border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-end gap-2 rounded-xl border bg-white p-3"},oe={class:"flex items-center gap-2"},ne={class:"shrink-0"},se=["src"],ue={key:1,class:"h-14 w-14 rounded-xl object-cover object-center",src:N,alt:"Image preview"},de={class:"font-sans"},ie={class:"text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm"},me={class:"text-muted-400 block text-xs"},pe={class:"flex gap-2"},ce={class:"border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60",disabled:"",type:"button",tooltip:"Cancel"},fe=h("span",{class:"sr-only"},"Cancel",-1),he={class:"border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300",type:"button",tooltip:"Upload"},ge=h("span",{class:"sr-only"},"Upload",-1),ve=["onClick"],be=h("span",{class:"sr-only"},"Remove",-1),xe={key:0,class:"mb-4 h-36 w-full flex items-center justify-center overflow-hidden rounded-xl"},ye=["src"],we={class:"grid grid-cols-1 sm:grid-cols-3 gap-6"},_e={class:"text-warning-500 text-xs"},Ve={class:"text-warning-500 text-xs"},ke={class:"text-info-500 dark:text-info-400"},Be={class:"text-warning-500 text-xs"},je={class:"text-warning-500 text-xs"},Ue={class:"text-warning-500 text-xs"},Ce={class:"text-warning-500 text-xs"},Me={class:"space-y-5 w-full"},$e={class:"flex flex-col sm:flex-row justify-between items-center gap-5"},Pe={class:"flex justify-end gap-5 mt-5 w-full"},Se={key:0,class:"grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-t pt-5 border-gray-300 dark:border-gray-700"},De=e({__name:"[id]",setup(e){const{toast:N}=a(),De=l(),Te=t().params.id,Ie=L(),Ae=H(),{updateAITradingPlan:qe}=q(),Ee=r((()=>Ie.selectedPlan||Ie.getPlanById(Te))),Fe=o(null),Ne=o(Ee.value?.image||null),Re=r((()=>Ae.durations.map((e=>({label:`${e.duration} ${e.timeframe}`,value:e.id})))));n((async()=>{const e=Number(Te);0===Ie.plans.length&&await Ie.fetchAiTradingPlans(),await Ie.selectPlanById(e),Ne.value=Ee.value?.image||null,Ie.selectedPlan||De.push("/admin/extensions/ai-trading/plans"),0===Ae.durations.length&&await Ae.fetchAiTradingDurations(),Ee.value?.ai_trading_plan_duration?We.value=Re.value.filter((e=>Ee.value?.ai_trading_plan_duration.some((a=>a.duration_id===e.value)))):We.value=[]}));const We=o([]),ze=()=>{We.value=Re.value},Oe=()=>{We.value=[]},Le=o(((e,a)=>0===e.length?"No duration selected":e.length>1?`${e.length} durations selected`:String(a?e[0][a]:e[0]))),He=R.object({title:R.string().nonempty("Title is required"),name:R.string().nonempty("Name is required"),description:R.string().nonempty("Description are required"),image:R.union([R.string(),R.null()]).optional(),min_amount:R.number().min(0,"Minimum amount must be greater or equal to 0"),max_amount:R.number().gt(0,"Maximum amount must be greater than 0"),min_profit:R.number().min(0,"Minimum profit must be greater or equal to 0"),max_profit:R.number().gt(0,"Maximum profit must be greater than 0"),default_profit:R.number().min(0,"Default profit must be greater or equal to 0"),default_result:R.enum(["WIN","LOSS","DRAW"]),trending:R.boolean(),status:R.boolean()}).refine((e=>e.max_amount>e.min_amount),{message:"Maximum amount must be greater than minimum amount",path:["max_amount"]}),Je=r((()=>({...Ee.value}))),{handleSubmit:Ke,isSubmitting:Ge,errors:Qe}=W({validationSchema:z(He),initialValues:Je});s(Fe,(e=>{const a=e?.item(0)||null;if(Fe.value){const e=new FileReader;e.onload=e=>{Ne.value=e.target?.result},e.readAsDataURL(a)}}));const Xe=Ke((async e=>{if(We.value.length)try{let a={...e,image:Ne.value,durations:We.value.map((e=>e.value))};if(Fe.value){const e=new FormData;e.append("files",Fe.value[0]),e.append("type","aiTradingPlan");const l=await E("/api/upload",{method:"POST",body:e},"$Hmnh1COJsQ");l&&""!==l.data.value&&(a.image=l.data.value[0])}const l=await qe(Number(Te),a);N.response(l),"success"===l.status&&(await Ie.fetchAiTradingPlans(),De.push("/admin/extensions/ai-trading/plans"))}catch(a){N.danger(a)}else N.dangerText("Please select at least one duration")}));return(e,a)=>{const l=k,t=B,r=j,o=C,n=U,s=M,q=$,E=P,N=S,R=D,W=T,z=I,L=A;return i(),u(L,null,{left:d((()=>[m(l,{size:"lg"},{default:d((()=>[p(c(e.$t("Create AI Trading Plan")),1)])),_:1})])),right:d((()=>[m(r,{type:"button",color:"muted",class:"hover:bg-gray-300 dark:hover:bg-gray-800",to:"/admin/extensions/ai-trading/plans"},{default:d((()=>[m(t,{name:"line-md:chevron-left",class:"h-4 w-4 mr-2"}),p(" "+c(e.$t("Back")),1)])),_:1}),m(r,{onClick:f(Xe),color:"primary",disabled:f(Ge),class:"w-full"},{default:d((()=>[p(c(e.$t("Update Plan")),1)])),_:1},8,["onClick","disabled"])])),default:d((()=>[h("form",{onSubmit:a[4]||(a[4]=(...e)=>f(Xe)&&f(Xe)(...e)),class:"space-y-8"},[h("div",J,[m(n,{class:"p-5 space-y-5"},{default:d((()=>[m(f(O),{name:"title"},{default:d((({field:a,errorMessage:l,handleChange:t,handleBlur:r})=>[m(o,{modelValue:a.value,"onUpdate:modelValue":[e=>a.value=e,t],error:l,disabled:f(Ge),type:"text",label:"Title",placeholder:"Enter title",shape:"rounded",class:"w-full",onBlur:r},null,8,["modelValue","onUpdate:modelValue","error","disabled","onBlur"]),h("small",null,[h("span",K,c(e.$t("Title is used to identify the plan in the frontend.")),1)])])),_:1}),m(f(O),{name:"name"},{default:d((({field:a,errorMessage:l,handleChange:t,handleBlur:r})=>[m(o,{modelValue:a.value,"onUpdate:modelValue":[e=>a.value=e,t],error:l,disabled:f(Ge),type:"text",label:"Name",placeholder:"Enter name",shape:"rounded",class:"w-full",onBlur:r},null,8,["modelValue","onUpdate:modelValue","error","disabled","onBlur"]),h("small",null,[h("span",G,c(e.$t("Name is used to identify the plan in the admin panel. It will not be shown in the frontend")),1)])])),_:1})])),_:1}),m(n,{class:"p-5"},{default:d((()=>[h("div",Q,[m(q,{modelValue:f(Fe),"onUpdate:modelValue":a[2]||(a[2]=e=>g(Fe)?Fe.value=e:null)},{default:d((({open:l,remove:r,preview:o,drop:n,files:u})=>[h("div",{class:"",onDragenter:a[0]||(a[0]=v((()=>{}),["stop","prevent"])),onDragover:a[1]||(a[1]=v((()=>{}),["stop","prevent"])),onDrop:n},[u?.length?(i(),b("ul",te,[(i(!0),b(y,null,w(u,(a=>(i(),b("li",{key:a.name},[h("div",re,[h("div",oe,[h("div",ne,[a.type.startsWith("image")?(i(),b("img",{key:0,class:"h-14 w-14 rounded-xl object-cover object-center",src:o(a).value,alt:"Image preview"},null,8,se)):(i(),b("img",ue))]),h("div",de,[h("span",ie,c(a.name),1),h("span",me,c(("formatFileSize"in e?e.formatFileSize:f(F))(a.size)),1)])]),h("div",{class:_(["ms-auto w-32 px-4 transition-opacity duration-300","opacity-100"])},[m(s,{value:0,size:"xs",color:"success"})]),h("div",pe,[h("button",ce,[m(t,{name:"lucide:slash",class:"h-4 w-4"}),fe]),h("button",he,[m(t,{name:"lucide:arrow-up",class:"h-4 w-4"}),ge]),h("button",{class:"border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300",type:"button",tooltip:"Remove",onClick:v((e=>r(a)),["prevent"])},[m(t,{name:"lucide:x",class:"h-4 w-4"}),be],8,ve)])])])))),128))])):(i(),b("div",{key:0,class:"nui-focus border-muted-300 dark:border-muted-700 hover:border-muted-400 focus:border-muted-400 dark:hover:border-muted-600 dark:focus:border-muted-700 group cursor-pointer rounded-lg border-[3px] border-dashed transition-colors duration-300",tabindex:"0",role:"button",onClick:l,onKeydown:x(v(l,["prevent"]),["enter"])},[h("div",Z,[m(t,{name:"mdi-light:cloud-upload",class:"text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 mb-2 h-10 w-10 transition-colors duration-300"}),h("h4",ee,c(e.$t("Drop file to upload")),1),h("div",null,[h("span",ae,c(e.$t("Or")),1)]),h("label",le,c(e.$t("Select Image")),1)])],40,Y))],40,X)])),_:1},8,["modelValue"]),f(Ne)?(i(),b("div",xe,[h("img",{src:f(Ne),alt:"Image Preview",class:"max-h-full max-w-full object-cover object-center"},null,8,ye)])):V("",!0)])])),_:1})]),m(n,{class:"p-5"},{default:d((()=>[m(f(O),{name:"description"},{default:d((({field:e,errorMessage:a,handleChange:l,handleBlur:t})=>[m(E,{modelValue:e.value,"onUpdate:modelValue":[a=>e.value=a,l],error:a,label:"Description",shape:"rounded",placeholder:"Write a description",class:"w-full",onBlur:t},null,8,["modelValue","onUpdate:modelValue","error","onBlur"])])),_:1})])),_:1}),h("div",we,[m(n,{class:"p-5 space-y-5"},{default:d((()=>[m(f(O),{name:"min_profit"},{default:d((({field:a,errorMessage:l,handleChange:t,handleBlur:r})=>[m(o,{modelValue:a.value,"onUpdate:modelValue":[e=>a.value=e,t],error:l,type:"number",label:"Minimum Profit",placeholder:"Enter minimum profit",shape:"rounded",class:"w-full",onBlur:r},null,8,["modelValue","onUpdate:modelValue","error","onBlur"]),h("small",null,[h("span",_e,c(e.$t("Minimum profit that can be earned in this plan.")),1)])])),_:1}),m(f(O),{name:"max_profit"},{default:d((({field:a,errorMessage:l,handleChange:t,handleBlur:r})=>[m(o,{modelValue:a.value,"onUpdate:modelValue":[e=>a.value=e,t],error:l,type:"number",label:"Maximum Profit",placeholder:"Enter maximum profit",shape:"rounded",class:"w-full",onBlur:r},null,8,["modelValue","onUpdate:modelValue","error","onBlur"]),h("small",null,[h("span",Ve,c(e.$t("Maximum profit that can be earned in this plan.")),1)])])),_:1}),h("div",null,[h("small",null,[h("span",ke,c(e.$t("If the admin does not set any profit for the investment, this profit will be randomly between the minimum and maximum profit")),1)])])])),_:1}),m(n,{class:"p-5 space-y-5"},{default:d((()=>[m(f(O),{name:"min_amount"},{default:d((({field:a,errorMessage:l,handleChange:t,handleBlur:r})=>[m(o,{modelValue:a.value,"onUpdate:modelValue":[e=>a.value=e,t],error:l,type:"number",label:"Minimum Amount",placeholder:"Enter minimum amount",shape:"rounded",class:"w-full",onBlur:r},null,8,["modelValue","onUpdate:modelValue","error","onBlur"]),h("small",null,[h("span",Be,c(e.$t("Minimum amount that can be invested in this plan")),1)])])),_:1}),m(f(O),{name:"max_amount"},{default:d((({field:a,errorMessage:l,handleChange:t,handleBlur:r})=>[m(o,{modelValue:a.value,"onUpdate:modelValue":[e=>a.value=e,t],error:l,type:"number",label:"Maximum Amount",placeholder:"Enter maximum amount",shape:"rounded",class:"w-full",onBlur:r},null,8,["modelValue","onUpdate:modelValue","error","onBlur"]),h("small",null,[h("span",je,c(e.$t("Maximum amount that can be invested in this plan")),1)])])),_:1})])),_:1}),m(n,{class:"p-5 space-y-5"},{default:d((()=>[m(f(O),{name:"default_profit"},{default:d((({field:a,errorMessage:l,handleChange:t,handleBlur:r})=>[m(o,{modelValue:a.value,"onUpdate:modelValue":[e=>a.value=e,t],error:l,type:"number",label:"Default Profit",placeholder:"Enter default profit",shape:"rounded",class:"w-full",onBlur:r},null,8,["modelValue","onUpdate:modelValue","error","onBlur"]),h("small",null,[h("span",Ue,c(e.$t("Default profit that will be used if the admin does not set any profit for the investment")),1)])])),_:1}),m(f(O),{name:"default_result"},{default:d((({field:a,errorMessage:l,handleChange:t,handleBlur:r})=>[m(N,{"model-value":a.value,error:l,items:["WIN","LOSS","DRAW"],placeholder:"Select a default result",label:"Default Result",shape:"rounded","onUpdate:modelValue":t,onBlur:r},null,8,["model-value","error","onUpdate:modelValue","onBlur"]),h("small",null,[h("span",Ce,c(e.$t("Default result that will be used if the admin does not set any result for the investment")),1)])])),_:1})])),_:1})]),m(n,{class:"p-5 flex gap-5"},{default:d((()=>[h("div",Me,[h("div",$e,[m(N,{shape:"curved",modelValue:f(We),"onUpdate:modelValue":a[3]||(a[3]=e=>g(We)?We.value=e:null),"multiple-label":f(Le),label:"Durations",items:f(Re),properties:{value:"value",label:"label"},multiple:"",disabled:0===f(Re)?.length,loading:!f(Re)},null,8,["modelValue","multiple-label","items","disabled","loading"]),h("div",Pe,[m(r,{onClick:ze,shape:"curved",color:"primary"},{default:d((()=>[p(c(e.$t("Select All")),1)])),_:1}),m(r,{onClick:Oe,shape:"curved",color:"danger"},{default:d((()=>[p(c(e.$t("Clear Selection")),1)])),_:1})])]),f(We).length>0?(i(),b("div",Se,[(i(!0),b(y,null,w(f(We),(e=>(i(),u(R,{key:e.id,shape:"rounded",color:"default",shadow:"hover"},{default:d((()=>[p(c(e.label),1)])),_:2},1024)))),128))])):V("",!0)])])),_:1}),m(n,{class:"p-5 flex gap-5"},{default:d((()=>[m(f(O),{name:"trending"},{default:d((({field:e,handleChange:a,handleBlur:l})=>[m(W,{modelValue:e.value,"onUpdate:modelValue":[a=>e.value=a,a],label:"Trending",shape:"rounded",class:"w-full",color:"warning",onBlur:l},null,8,["modelValue","onUpdate:modelValue","onBlur"])])),_:1}),m(f(O),{name:"status"},{default:d((({field:e,handleChange:a,handleBlur:l})=>[m(W,{modelValue:e.value,"onUpdate:modelValue":[a=>e.value=a,a],label:"Status",shape:"rounded",class:"w-full",color:"success",onBlur:l},null,8,["modelValue","onUpdate:modelValue","onBlur"])])),_:1})])),_:1}),m(z,null,{default:d((()=>[m(r,{type:"submit",color:"primary",disabled:f(Ge),class:"w-full"},{default:d((()=>[p(c(e.$t("Update Plan")),1)])),_:1},8,["disabled"])])),_:1})],32)])),_:1})}}});export{De as default};
