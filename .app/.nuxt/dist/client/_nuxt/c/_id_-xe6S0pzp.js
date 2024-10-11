import{a as e,ad as t,ac as r,z as a,c as s,E as o,r as l,J as d,O as n,w as i,o as u,e as m,q as c,t as p,u as v,f as b,p as f,W as g,b as h,A as y,F as x,B as k,n as w,k as j,_ as C,x as _,X as B,Y as V}from"../e/entry-8qgg5CL-.js";import{_ as I}from"./BaseInput.vue-iInHQMIA.js";import{_ as S}from"./BaseListbox.vue-1Dy9Ui3z.js";import{_ as U}from"./BaseProgress.vue-xH0Mhn3Z.js";import{_ as F}from"./BaseInputFileHeadless.vue-LOgyN9kF.js";import{_ as E}from"./TairoFormSave.vue-aLVbwikq.js";import{_ as $}from"./TairoContentWrapper.vue-JqAKR4O_.js";import{u as A}from"./useEcommerce-2nLxpPKu.js";import{u as D}from"./fetch-i3Y1jjTS.js";import{b as T}from"./strings-rQgUKePI.js";import{_ as z}from"./placeholder-file-IxKzOaSl.js";import{z as N,u as P,t as O,F as R}from"./vee-validate.esm-n59zZCC5.js";import{u as q}from"./categories-M541zqEW.js";import"./input-id-wZ-Ta08j.js";import"./BaseIconBox.vue-qjQCKz6R.js";import"./BaseAvatar.vue-XYSxxLJP.js";import"./use-text-value-9iwzs_EA.js";const K={class:"grid grid-cols-1 sm:grid-cols-2 gap-6"},L=["onDrop"],M=["onClick","onKeydown"],W={class:"p-5 text-center"},J={class:"text-muted-400 font-sans text-sm"},H={class:"text-muted-400 font-sans text-[0.7rem] font-semibold uppercase"},X={for:"file",class:"text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 cursor-pointer font-sans text-sm underline underline-offset-4 transition-colors duration-300"},Y={key:1,class:"mt-6 space-y-2"},G={class:"border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative flex items-center justify-end gap-2 rounded-xl border bg-white p-3"},Q={class:"flex items-center gap-2"},Z={class:"shrink-0"},ee=["src"],te={key:1,class:"h-14 w-14 rounded-xl object-cover object-center",src:z,alt:"Image preview"},re={class:"font-sans"},ae={class:"text-muted-800 dark:text-muted-100 line-clamp-1 block text-sm"},se={class:"text-muted-400 block text-xs"},oe={class:"flex gap-2"},le={class:"border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60",disabled:"",type:"button",tooltip:"Cancel"},de=b("span",{class:"sr-only"},"Cancel",-1),ne={class:"border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300",type:"button",tooltip:"Upload"},ie=b("span",{class:"sr-only"},"Upload",-1),ue=["onClick"],me=b("span",{class:"sr-only"},"Remove",-1),ce={key:0,class:"mb-4 h-36 w-full flex items-center justify-center overflow-hidden rounded-xl"},pe=["src"],ve={class:"text-warning-400 dark:text-warning-600 font-sans text-[0.7rem] font-semibold"},be=e({__name:"[id]",setup(e){const{toast:z}=t(),be=r(),{id:fe}=a().params,ge=q(),{updateAdminCategory:he}=A(),ye=s((()=>ge.selectedCategory||ge.getCategoryById(fe)));o((async()=>{0===ge.categories.length&&(ge.loading=!0,await ge.fetchCategories(),ge.loading=!1),await ge.selectCategoryById(Number(fe))}));const xe=N.object({name:N.string().nonempty("Name is required"),description:N.string().optional(),status:N.enum(["ACTIVE","INACTIVE"])}),{handleSubmit:ke,isSubmitting:we,values:je,resetForm:Ce}=P({validationSchema:O(xe),initialValues:s((()=>ye.value))}),_e=l(null),Be=l(ye.value?.image||null);d(_e,(e=>{const t=e?.item(0)||null;if(_e.value){const e=new FileReader;e.onload=e=>{Be.value=e.target?.result},e.readAsDataURL(t)}}));const Ve=ke((async e=>{try{let t=null;if(_e.value){const e=new FormData;e.append("files",_e.value[0]),e.append("type","ecommerceProducts");const r=await D("/api/upload",{method:"POST",body:e},"$FsggItbOav");r&&""!==r.data.value&&(t=r.data.value[0])}const r=await he(Number(fe),e.name,e.description,e.status,t??void 0);z.response(r),"success"===r.status&&(await ge.fetchCategories(),be.push("/admin/extensions/ecommerce/categories"))}catch(t){z.danger(t)}}));return(e,t)=>{const r=C,a=_,s=B,o=I,l=S,d=V,A=U,D=F,z=E,N=$;return u(),n(N,null,{left:i((()=>[m(r,{size:"lg"},{default:i((()=>[c(p(e.$t("Edit Category")),1)])),_:1})])),right:i((()=>[m(s,{type:"button",color:"muted",class:"hover:bg-gray-300 dark:hover:bg-gray-800",to:"/admin/extensions/ecommerce/categories"},{default:i((()=>[m(a,{name:"line-md:chevron-left",class:"h-4 w-4 mr-2"}),c(" "+p(e.$t("Back to Categories")),1)])),_:1}),m(s,{type:"submit",color:"primary",disabled:v(we),class:"ml-2",onClick:v(Ve)},{default:i((()=>[c(p(e.$t("Save Changes")),1)])),_:1},8,["disabled","onClick"])])),default:i((()=>[b("form",{onSubmit:t[3]||(t[3]=g(((...e)=>v(Ve)&&v(Ve)(...e)),["prevent"])),class:"space-y-8"},[m(d,{class:"p-5 space-y-5"},{default:i((()=>[m(v(R),{name:"name"},{default:i((({field:e,errorMessage:t,handleChange:r,handleBlur:a})=>[m(o,{modelValue:e.value,"onUpdate:modelValue":[t=>e.value=t,r],error:t,disabled:v(we),type:"text",label:"Name",placeholder:"Enter name",shape:"rounded",class:"w-full",onBlur:a},null,8,["modelValue","onUpdate:modelValue","error","disabled","onBlur"])])),_:1}),m(v(R),{name:"description"},{default:i((({field:e,errorMessage:t,handleChange:r,handleBlur:a})=>[m(o,{modelValue:e.value,"onUpdate:modelValue":[t=>e.value=t,r],error:t,disabled:v(we),type:"text",label:"Description",placeholder:"Enter description",shape:"rounded",class:"w-full",onBlur:a},null,8,["modelValue","onUpdate:modelValue","error","disabled","onBlur"])])),_:1}),m(v(R),{name:"status"},{default:i((({field:e,errorMessage:t,handleChange:r,handleBlur:a})=>[m(l,{"model-value":e.value,error:t,items:["ACTIVE","INACTIVE"],placeholder:"Select a status",label:"Status",shape:"rounded","onUpdate:modelValue":r,onBlur:a},null,8,["model-value","error","onUpdate:modelValue","onBlur"])])),_:1})])),_:1}),m(d,{class:"p-5"},{default:i((()=>[b("div",K,[m(D,{modelValue:v(_e),"onUpdate:modelValue":t[2]||(t[2]=e=>f(_e)?_e.value=e:null)},{default:i((({open:r,remove:s,preview:o,drop:l,files:d})=>[b("div",{class:"",onDragenter:t[0]||(t[0]=g((()=>{}),["stop","prevent"])),onDragover:t[1]||(t[1]=g((()=>{}),["stop","prevent"])),onDrop:l},[d?.length?(u(),h("ul",Y,[(u(!0),h(x,null,k(d,(t=>(u(),h("li",{key:t.name},[b("div",G,[b("div",Q,[b("div",Z,[t.type.startsWith("image")?(u(),h("img",{key:0,class:"h-14 w-14 rounded-xl object-cover object-center",src:o(t).value,alt:"Image preview"},null,8,ee)):(u(),h("img",te))]),b("div",re,[b("span",ae,p(t.name),1),b("span",se,p(("formatFileSize"in e?e.formatFileSize:v(T))(t.size)),1)])]),b("div",{class:w(["ms-auto w-32 px-4 transition-opacity duration-300","opacity-100"])},[m(A,{value:0,size:"xs",color:"success"})]),b("div",oe,[b("button",le,[m(a,{name:"lucide:slash",class:"h-4 w-4"}),de]),b("button",ne,[m(a,{name:"lucide:arrow-up",class:"h-4 w-4"}),ie]),b("button",{class:"border-muted-200 hover:border-primary-500 text-muted-700 dark:text-muted-200 hover:text-primary-600 dark:border-muted-700 dark:bg-muted-900 dark:hover:border-primary-500 dark:hover:text-primary-600 relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-white transition-colors duration-300",type:"button",tooltip:"Remove",onClick:g((e=>s(t)),["prevent"])},[m(a,{name:"lucide:x",class:"h-4 w-4"}),me],8,ue)])])])))),128))])):(u(),h("div",{key:0,class:"nui-focus border-muted-300 dark:border-muted-700 hover:border-muted-400 focus:border-muted-400 dark:hover:border-muted-600 dark:focus:border-muted-700 group cursor-pointer rounded-lg border-[3px] border-dashed transition-colors duration-300",tabindex:"0",role:"button",onClick:r,onKeydown:y(g(r,["prevent"]),["enter"])},[b("div",W,[m(a,{name:"mdi-light:cloud-upload",class:"text-muted-400 group-hover:text-primary-500 group-focus:text-primary-500 mb-2 h-10 w-10 transition-colors duration-300"}),b("h4",J,p(e.$t("Drop file to upload")),1),b("div",null,[b("span",H,p(e.$t("Or")),1)]),b("label",X,p(e.$t("Select Image")),1)])],40,M))],40,L)])),_:1},8,["modelValue"]),v(Be)?(u(),h("div",ce,[b("img",{src:v(Be),alt:"Image Preview",class:"max-h-full max-w-full object-cover object-center"},null,8,pe)])):j("",!0)]),b("div",null,[b("span",ve,p(e.$t("Note"))+": Preferred image size is 600x400px ",1)])])),_:1}),m(z,null,{default:i((()=>[m(s,{type:"submit",color:"primary",disabled:v(we),class:"w-full"},{default:i((()=>[c(p(e.$t("Update Category")),1)])),_:1},8,["disabled"])])),_:1})],32)])),_:1})}}});export{be as default};
