import{a as e,cL as a,S as l,c as o,r,J as t,ad as s,as as d,b as n,e as i,w as u,u as m,W as c,Y as p,o as b,f as v,q as f,t as h,O as g,k as y,p as B,_,a0 as U,X as x,C as V,x as w}from"../e/entry-8qgg5CL-.js";import{_ as j}from"./BaseMessage.vue-Kpn2u5Rn.js";import{_ as C}from"./BaseFullscreenDropfile.vue-QiSzg2sB.js";import{_ as k}from"./BaseButtonIcon.vue-6tAU_b7C.js";import{_ as M}from"./BaseInputFileHeadless.vue-LOgyN9kF.js";import{_ as T}from"./TairoFormGroup.vue--3qC-osX.js";import{_ as L}from"./BaseInput.vue-iInHQMIA.js";import{_ as S}from"./BaseTextarea.vue-8st5U0qk.js";import{_ as F}from"./BaseListbox.vue-1Dy9Ui3z.js";import{_ as R}from"./TairoFormSave.vue-aLVbwikq.js";import{u as P}from"./fetch-i3Y1jjTS.js";import{z as I,u as z,a as E,t as A,F as J}from"./vee-validate.esm-n59zZCC5.js";import"./input-id-wZ-Ta08j.js";import"./BaseIconBox.vue-qjQCKz6R.js";import"./BaseAvatar.vue-XYSxxLJP.js";import"./use-text-value-9iwzs_EA.js";const O={class:"flex items-center justify-between p-4"},Y={class:"flex items-center gap-2"},$={class:"p-4"},D={class:"mx-auto max-w-lg space-y-12 py-8"},G={class:"relative flex flex-col items-center justify-center gap-4"},W={class:"relative h-24 w-24"},Z=["src"],q=["src"],H={key:2,class:"absolute bottom-0 end-0 z-20"},K={key:3,class:"absolute bottom-0 end-0 z-20"},N={class:"relative","data-nui-tooltip":"Upload image"},X={key:0,class:"text-danger-600 inline-block font-sans text-[.8rem]"},Q={class:"grid grid-cols-12 gap-4"},ee={class:"col-span-12"},ae={class:"col-span-12 sm:col-span-6"},le={class:"col-span-12 sm:col-span-6"},oe={class:"col-span-12"},re={class:"col-span-12 sm:col-span-6"},te={class:"col-span-12 sm:col-span-6"},se={class:"col-span-12 sm:col-span-6"},de={class:"col-span-12 sm:col-span-6"},ne={class:"col-span-12"},ie={class:"grid grid-cols-12 gap-4"},ue={class:"col-span-12 sm:col-span-6"},me={class:"col-span-12 sm:col-span-6"},ce={class:"col-span-12 sm:col-span-6"},pe={class:"col-span-12 sm:col-span-6"},be={class:"grid grid-cols-12 gap-4"},ve={class:"col-span-12 sm:col-span-6"},fe={class:"col-span-12 sm:col-span-6"},he={class:"col-span-12 sm:col-span-6"},ge={class:"col-span-12 sm:col-span-6"},ye={class:"col-span-12 sm:col-span-6"},Be={class:"col-span-12 sm:col-span-6"},_e=e({__name:"index",setup(e){const{updateProfile:_e}=a(),Ue=l(),xe=o((()=>Ue.getProfile)),Ve="Your first name can't be empty",we="Your last name can't be empty",je=I.object({avatar:I.union([I.string(),I.custom((e=>e instanceof File))]).nullable(),first_name:I.string().min(1,Ve),last_name:I.string().min(1,we),email:I.string().email(),metadata:I.object({location:I.object({address:I.string(),city:I.string(),country:I.string(),zip:I.string()}),role:I.string().optional(),bio:I.string(),info:I.object({experience:I.union([I.literal("0-2 years"),I.literal("2-5 years"),I.literal("5-10 years"),I.literal("10+ years")]).nullable(),firstJob:I.object({label:I.string(),value:I.boolean()}).nullable(),flexible:I.object({label:I.string(),value:I.boolean()}).nullable(),remote:I.object({label:I.string(),value:I.boolean()}).nullable()}),social:I.object({facebook:I.string(),twitter:I.string(),dribbble:I.string(),instagram:I.string(),github:I.string(),gitlab:I.string()})})}),Ce=A(je),ke=o((()=>({avatar:xe.value?.avatar||null,first_name:xe.value?.first_name||"",last_name:xe.value?.last_name||"",email:xe.value?.email||"",metadata:{location:{address:xe.value?.metadata?.location?.address||"",city:xe.value?.metadata?.location?.city||"",country:xe.value?.metadata?.location?.country||"",zip:xe.value?.metadata?.location?.zip||""},role:xe.value?.metadata?.role||"",bio:xe.value?.metadata?.bio||"",info:{experience:["0-2 years","2-5 years","5-10 years","10+ years"].includes(xe.value?.metadata?.info?.experience)?xe.value?.metadata?.info?.experience:null,firstJob:xe.value?.metadata?.info?.firstJob||null,flexible:xe.value?.metadata?.info?.flexible||null,remote:xe.value?.metadata?.info?.remote||null},social:{facebook:xe.value?.metadata?.social?.facebook||"",twitter:xe.value?.metadata?.social?.twitter||"",dribbble:xe.value?.metadata?.social?.dribbble||"",instagram:xe.value?.metadata?.social?.instagram||"",github:xe.value?.metadata?.social?.github||"",gitlab:xe.value?.metadata?.social?.gitlab||""}}}))),Me=["0-2 years","2-5 years","5-10 years","10+ years"],Te=[{label:"Yes",value:!0},{label:"No",value:!1}],Le=o((()=>Ue.getProfile?.avatar||null)),{handleSubmit:Se,isSubmitting:Fe,setFieldError:Re,meta:Pe,errors:Ie,resetForm:ze,setFieldValue:Ee,setErrors:Ae}=z({validationSchema:Ce,initialValues:ke}),Je=r(!1),Oe=o((()=>Object.keys(Ie.value).length)),Ye=r(xe.value?.avatar),$e=E("avatar");t(Ye,(e=>{const a=e?.item(0)||null;Ee("avatar",a),Ye.value&&Ge()}));const{toast:De}=s(),Ge=async()=>{const e=new FormData;e.append("files",Ye.value[0]),e.append("oldImagePath",xe.value?.avatar),e.append("type","avatar");const a=await P("/api/upload",{method:"POST",body:e},"$fj1yKS5ScC");if(""!==a?.data?.value){const e=await _e(void 0,void 0,void 0,void 0,a.data.value);if("success"===e.status)De.successText("Your avatar has been updated!"),Ue.fetchProfile();else if(e.error.data.errors)for(const[a,l]of Object.entries(e.error.data.errors))Re(a,l[0]);else console.error(e.error.message)}else if(a.error.data&&a.error.data.errors)for(const[l,o]of Object.entries(a.error.data.errors))Re(l,o[0]);else De.dangerText("Something went wrong, please try again later")};d((()=>{if(Pe.value.dirty)return confirm("You have unsaved changes. Are you sure you want to leave?")}));const We=Se((async e=>{try{Je.value=!1;const{error:l}=await _e(e.first_name,e.last_name,e.email,e.metadata);if(l){try{De.danger(l);for(const[e,a]of Object.entries(l.data.errors))Re(e,a[0])}catch(a){console.error(a)}return}De.successText("Your profile has been updated!"),document.documentElement.scrollTo({top:0,behavior:"smooth"}),Je.value=!0,Ue.fetchProfile(),setTimeout((()=>{Je.value=!1}),3e3)}catch(l){De.danger(l)}})),Ze=e=>e instanceof File||e instanceof Blob;return(e,a)=>{const l=_,o=U,r=x,t=V,s=j,d=C,P=w,I=k,z=M,E=T,A=L,_e=S,Ue=F,xe=p,Ve=R;return b(),n("form",{method:"POST",action:"",class:"w-full pb-16",onSubmit:a[4]||(a[4]=c(((...e)=>m(We)&&m(We)(...e)),["prevent"]))},[i(xe,null,{default:u((()=>[v("div",O,[v("div",null,[i(l,{tag:"h2",size:"sm",weight:"medium",lead:"normal",class:"uppercase tracking-wider"},{default:u((()=>[f(h(e.$t("General info")),1)])),_:1}),i(o,{size:"xs",class:"text-muted-400"},{default:u((()=>[f(h(e.$t("Edit your account's general information")),1)])),_:1})]),v("div",Y,[i(t,{to:"/user"},{default:u((()=>[i(r,{class:"w-24"},{default:u((()=>[f(h(e.$t("Cancel")),1)])),_:1})])),_:1}),i(r,{type:"submit",color:"primary",class:"w-24",disabled:m(Fe),loading:m(Fe)},{default:u((()=>[f(h(e.$t("Save")),1)])),_:1},8,["disabled","loading"])])]),v("div",$,[v("div",D,[m(Je)?(b(),g(s,{key:0,onClose:a[0]||(a[0]=e=>Je.value=!1)},{default:u((()=>[f(h(e.$t("Your profile has been updated"))+"! ",1)])),_:1})):y("",!0),m(Oe)?(b(),g(s,{key:1,type:"danger",onClose:a[1]||(a[1]=()=>m(Ae)({}))},{default:u((()=>[f(h(e.$t("This form has"))+" "+h(m(Oe))+" "+h(e.$t("errors, please check them before submitting")),1)])),_:1})):y("",!0),i(E,{label:"Profile picture",sublabel:"This is how others will recognize you"},{default:u((()=>[v("div",G,[i(d,{icon:"ph:image-duotone","filter-file-dropped":e=>e.type.startsWith("image"),onDrop:a[2]||(a[2]=e=>{Ye.value=e})},null,8,["filter-file-dropped"]),i(z,{accept:"image/*",modelValue:m(Ye),"onUpdate:modelValue":a[3]||(a[3]=e=>B(Ye)?Ye.value=e:null)},{default:u((({open:e,remove:a,preview:l,files:o})=>[v("div",W,[o?.length&&Ze(o[0])?(b(),n("img",{key:0,src:l(o.item(0)).value,alt:"Upload preview",class:"bg-muted-200 dark:bg-muted-700/60 h-24 w-24 rounded-full object-cover object-center"},null,8,Z)):(b(),n("img",{key:1,src:m(Le)??"/img/avatars/1.svg",alt:"Upload preview",class:"bg-muted-200 dark:bg-muted-700/60 h-24 w-24 rounded-full object-cover object-center"},null,8,q)),o?.length&&Ze(o[0])?(b(),n("div",H,[i(I,{condensed:"",shape:"full",onClick:e=>a(o.item(0)),"data-nui-tooltip":"Remove image"},{default:u((()=>[i(P,{name:"lucide:x",class:"h-4 w-4"})])),_:2},1032,["onClick"])])):(b(),n("div",K,[v("div",N,[i(I,{condensed:"",shape:"full",onClick:e},{default:u((()=>[i(P,{name:"lucide:plus",class:"h-4 w-4"})])),_:2},1032,["onClick"])])]))])])),_:1},8,["modelValue"]),m($e)?(b(),n("div",X,h(m($e)),1)):y("",!0)])])),_:1}),i(E,{label:"Profile Info",sublabel:"Others diserve to know you more"},{default:u((()=>[v("div",Q,[v("div",ee,[i(m(J),{name:"email"},{default:u((({field:e,errorMessage:a,handleChange:l,handleBlur:o})=>[i(A,{"model-value":e.value,error:a,disabled:m(Fe),color:"success",type:"email",icon:"ic:outline-alternate-email",label:"Email",placeholder:"Email","onUpdate:modelValue":l,onBlur:o},null,8,["model-value","error","disabled","onUpdate:modelValue","onBlur"])])),_:1})]),v("div",ae,[i(m(J),{name:"first_name"},{default:u((({field:e,errorMessage:a,handleChange:l,handleBlur:o})=>[i(A,{"model-value":e.value,error:a,disabled:m(Fe),type:"text",icon:"ph:user-duotone",label:"First name",placeholder:"First name","onUpdate:modelValue":l,onBlur:o},null,8,["model-value","error","disabled","onUpdate:modelValue","onBlur"])])),_:1})]),v("div",le,[i(m(J),{name:"last_name"},{default:u((({field:e,errorMessage:a,handleChange:l,handleBlur:o})=>[i(A,{"model-value":e.value,error:a,disabled:m(Fe),type:"text",icon:"ph:user-duotone",label:"Last name",placeholder:"Last name","onUpdate:modelValue":l,onBlur:o},null,8,["model-value","error","disabled","onUpdate:modelValue","onBlur"])])),_:1})]),v("div",oe,[i(m(J),{name:"metadata.role"},{default:u((({field:e,errorMessage:a,handleChange:l,handleBlur:o})=>[i(A,{"model-value":e.value,error:a,disabled:m(Fe),type:"text",icon:"ph:suitcase-duotone",label:"Job title",placeholder:"Job title","onUpdate:modelValue":l,onBlur:o},null,8,["model-value","error","disabled","onUpdate:modelValue","onBlur"])])),_:1})]),v("div",re,[i(m(J),{name:"metadata.location.address"},{default:u((({field:e,errorMessage:a,handleChange:l,handleBlur:o})=>[i(A,{"model-value":e.value,error:a,disabled:m(Fe),type:"text",icon:"ph:map-pin-line-duotone",label:"Address",placeholder:"Address","onUpdate:modelValue":l,onBlur:o},null,8,["model-value","error","disabled","onUpdate:modelValue","onBlur"])])),_:1})]),v("div",te,[i(m(J),{name:"metadata.location.city"},{default:u((({field:e,errorMessage:a,handleChange:l,handleBlur:o})=>[i(A,{"model-value":e.value,error:a,disabled:m(Fe),type:"text",icon:"ph:map-pin-duotone",label:"City",placeholder:"City","onUpdate:modelValue":l,onBlur:o},null,8,["model-value","error","disabled","onUpdate:modelValue","onBlur"])])),_:1})]),v("div",se,[i(m(J),{name:"metadata.location.country"},{default:u((({field:e,errorMessage:a,handleChange:l,handleBlur:o})=>[i(A,{"model-value":e.value,error:a,disabled:m(Fe),type:"text",icon:"ph:map-pin-duotone",label:"Country",placeholder:"Country","onUpdate:modelValue":l,onBlur:o},null,8,["model-value","error","disabled","onUpdate:modelValue","onBlur"])])),_:1})]),v("div",de,[i(m(J),{name:"metadata.location.zip"},{default:u((({field:e,errorMessage:a,handleChange:l,handleBlur:o})=>[i(A,{"model-value":e.value,error:a,disabled:m(Fe),type:"text",icon:"ph:map-trifold-duotone",label:"ZIP",placeholder:"ZIP","onUpdate:modelValue":l,onBlur:o},null,8,["model-value","error","disabled","onUpdate:modelValue","onBlur"])])),_:1})]),v("div",ne,[i(m(J),{name:"metadata.bio"},{default:u((({field:e,errorMessage:a,handleChange:l,handleBlur:o})=>[i(_e,{"model-value":e.value,error:a,disabled:m(Fe),rows:"4",label:"About you / Short bio...",placeholder:"About you / Short bio...","onUpdate:modelValue":l,onBlur:o},null,8,["model-value","error","disabled","onUpdate:modelValue","onBlur"])])),_:1})])])])),_:1}),i(E,{label:"Professional Info",sublabel:"This can help you to win some opportunities"},{default:u((()=>[v("div",ie,[v("div",ue,[i(m(J),{name:"metadata.info.experience"},{default:u((({field:e,errorMessage:a,handleChange:l,handleBlur:o})=>[i(Ue,{"model-value":e.value,error:a,disabled:m(Fe),items:Me,shape:"rounded",label:"Experience",placeholder:"Experience","onUpdate:modelValue":l,onBlur:o},null,8,["model-value","error","disabled","onUpdate:modelValue","onBlur"])])),_:1})]),v("div",me,[i(m(J),{name:"metadata.info.firstJob"},{default:u((({field:e,errorMessage:a,handleChange:l,handleBlur:o})=>[i(Ue,{"model-value":e.value,error:a,disabled:m(Fe),items:Te,properties:{label:"label",value:"value"},shape:"rounded",label:"Is this your first job?",placeholder:"Is this your first job?","onUpdate:modelValue":l,onBlur:o},null,8,["model-value","error","disabled","onUpdate:modelValue","onBlur"])])),_:1})]),v("div",ce,[i(m(J),{name:"metadata.info.flexible"},{default:u((({field:e,errorMessage:a,handleChange:l,handleBlur:o})=>[i(Ue,{"model-value":e.value,error:a,disabled:m(Fe),items:Te,properties:{label:"label",value:"value"},shape:"rounded",label:"Are you flexible?",placeholder:"Are you flexible?","onUpdate:modelValue":l,onBlur:o},null,8,["model-value","error","disabled","onUpdate:modelValue","onBlur"])])),_:1})]),v("div",pe,[i(m(J),{name:"metadata.info.remote"},{default:u((({field:e,errorMessage:a,handleChange:l,handleBlur:o})=>[i(Ue,{"model-value":e.value,error:a,disabled:m(Fe),items:Te,properties:{label:"label",value:"value"},shape:"rounded",label:"Do you work remotely?",placeholder:"Do you work remotely?","onUpdate:modelValue":l,onBlur:o},null,8,["model-value","error","disabled","onUpdate:modelValue","onBlur"])])),_:1})])])])),_:1}),i(E,{label:"Social Profiles",sublabel:"This can help others finding you on social media"},{default:u((()=>[v("div",be,[v("div",ve,[i(m(J),{name:"metadata.social.facebook"},{default:u((({field:e,errorMessage:a,handleChange:l,handleBlur:o})=>[i(A,{"model-value":e.value,error:a,disabled:m(Fe),type:"text",icon:"fa6-brands:facebook-f",label:"Facebook URL",placeholder:"Facebook URL","onUpdate:modelValue":l,onBlur:o},null,8,["model-value","error","disabled","onUpdate:modelValue","onBlur"])])),_:1})]),v("div",fe,[i(m(J),{name:"metadata.social.twitter"},{default:u((({field:e,errorMessage:a,handleChange:l,handleBlur:o})=>[i(A,{"model-value":e.value,error:a,disabled:m(Fe),type:"text",icon:"fa6-brands:twitter",label:"Twitter URL",placeholder:"Twitter URL","onUpdate:modelValue":l,onBlur:o},null,8,["model-value","error","disabled","onUpdate:modelValue","onBlur"])])),_:1})]),v("div",he,[i(m(J),{name:"metadata.social.dribbble"},{default:u((({field:e,errorMessage:a,handleChange:l,handleBlur:o})=>[i(A,{"model-value":e.value,error:a,disabled:m(Fe),type:"text",icon:"fa6-brands:dribbble",label:"Dribbble URL",placeholder:"Dribbble URL","onUpdate:modelValue":l,onBlur:o},null,8,["model-value","error","disabled","onUpdate:modelValue","onBlur"])])),_:1})]),v("div",ge,[i(m(J),{name:"metadata.social.instagram"},{default:u((({field:e,errorMessage:a,handleChange:l,handleBlur:o})=>[i(A,{"model-value":e.value,error:a,disabled:m(Fe),type:"text",icon:"fa6-brands:instagram",label:"Instagram URL",placeholder:"Instagram URL","onUpdate:modelValue":l,onBlur:o},null,8,["model-value","error","disabled","onUpdate:modelValue","onBlur"])])),_:1})]),v("div",ye,[i(m(J),{name:"metadata.social.github"},{default:u((({field:e,errorMessage:a,handleChange:l,handleBlur:o})=>[i(A,{"model-value":e.value,error:a,disabled:m(Fe),type:"text",icon:"fa6-brands:github",label:"Github URL",placeholder:"Github URL","onUpdate:modelValue":l,onBlur:o},null,8,["model-value","error","disabled","onUpdate:modelValue","onBlur"])])),_:1})]),v("div",Be,[i(m(J),{name:"metadata.social.gitlab"},{default:u((({field:e,errorMessage:a,handleChange:l,handleBlur:o})=>[i(A,{"model-value":e.value,error:a,disabled:m(Fe),type:"text",icon:"fa6-brands:gitlab",label:"Gitlab URL",placeholder:"Gitlab URL","onUpdate:modelValue":l,onBlur:o},null,8,["model-value","error","disabled","onUpdate:modelValue","onBlur"])])),_:1})])])])),_:1})])])])),_:1}),i(Ve,{disabled:m(Fe),loading:m(Fe),onReset:m(ze)},null,8,["disabled","loading","onReset"])],32)}}});export{_e as default};
