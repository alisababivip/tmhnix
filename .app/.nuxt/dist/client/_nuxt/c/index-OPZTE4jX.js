import{_ as e}from"./BaseInput.vue-iInHQMIA.js";import{a,z as l,ad as t,c as s,r as o,ac as u,E as r,b as n,e as i,w as d,u as c,an as m,o as p,f as v,p as f,O as g,q as h,t as y,af as w,k as b,n as x,F as _,B as k,x as j,X as V,Y as $,ag as C,ao as P}from"../e/entry-8qgg5CL-.js";import{_ as T}from"./BaseSelect.vue-p0KYznCX.js";import{_ as D}from"./BaseListbox.vue-1Dy9Ui3z.js";import{_ as B,a as S}from"./FlexTableRow.vue-LmGXINIn.js";import{_ as A}from"./FlexTableCell.vue-Rbj2Whgl.js";import{_ as U}from"./BaseTag.vue-NMkN1Uk8.js";import{_ as F,a as q}from"./BaseDropdown.vue-wSpyT9xX.js";import{_ as I}from"./TairoFlexTable-zdoraqRc.js";import{_ as L}from"./BasePagination.vue-eKZkqxB7.js";import{_ as E}from"./TairoContentWrapper.vue-JqAKR4O_.js";import{u as R}from"./useBlog-0Y19BpbN.js";import{_ as H,a as z}from"./placeholder-search-4-dark-Jht91LnM.js";import{u as N}from"./post-3bPFKFhV.js";import{u as O}from"./category-0GoymeMT.js";import{u as W}from"./tag-Rn_CdU8R.js";import"./input-id-wZ-Ta08j.js";import"./BaseIconBox.vue-qjQCKz6R.js";import"./BaseAvatar.vue-XYSxxLJP.js";import"./use-text-value-9iwzs_EA.js";import"./menu-KWZreDHB.js";import"./BaseFocusLoop.vue-E4yqAJcg.js";const X={class:"w-full flex gap-2 xs:flex-col sm:flex-row"},Y={value:10},G={value:25},J={value:50},K={value:100},M=v("img",{class:"block dark:hidden",src:H,alt:"Placeholder image"},null,-1),Q=v("img",{class:"hidden dark:block",src:z,alt:"Placeholder image"},null,-1),Z={key:1,class:"w-full sm:pt-5"},ee={class:"mt-6"},ae={class:"flex w-full items-center justify-between p-4 md:p-6"},le={class:"font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"},te={class:"p-4 md:p-6"},se={class:"mx-auto w-full text-start"},oe={class:"font-alt text-muted-500 dark:text-muted-400 text-sm leading-5 mb-3"},ue={class:"space-y-2"},re={class:"p-4 md:p-6"},ne={class:"flex gap-x-2"},ie={class:"flex w-full items-center justify-between p-4 md:p-6"},de={class:"font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"},ce={class:"p-4 md:p-6"},me={class:"mx-auto w-full text-center"},pe={class:"font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"},ve={class:"font-alt text-muted-500 dark:text-muted-400 text-sm leading-5 mb-3"},fe={class:"p-4 md:p-6"},ge={class:"flex gap-x-2"},he=a({__name:"index",setup(a){const H=N(),z=O(),he=W(),ye=l(),{formatedDate:we,toast:be}=t(),xe=s((()=>ye.query.user)),_e=s((()=>ye.query.category)),ke=s((()=>ye.query.tag)),je=s((()=>ye.query.status)),Ve=o(!1),$e=o(""),Ce=u(),Pe=o(""),Te=o(10),De=s((()=>parseInt(ye.query.page??"1"))),Be=s((()=>H.posts)),Se=s((()=>z.categories)),Ae=s((()=>he.tags));r((async()=>{Ve.value=!0,0===z.categories.length&&await z.fetchCategories(!1),0===he.tags.length&&await he.fetchTags(!1),0===H.posts.length&&await H.fetchPosts(xe.value,_e.value,ke.value,je.value),Ve.value=!1}));const Ue=s((()=>Be.value.filter((e=>(!xe.value||e.author.user.uuid===xe.value)&&((!Le.value||"All"===Le.value||e.category.name===Le.value)&&((!Ee.value||"All"===Ee.value||void 0!==e.post_tag.find((e=>e.tag.name===Ee.value)))&&((!Re.value||"All"===Re.value||e.status===Re.value)&&(!(He.value&&new Date(e.created_at)<new Date(He.value))&&(!(ze.value&&new Date(e.created_at)>new Date(ze.value))&&($e.value&&""!==$e.value&&void 0!==$e.value&&$e.value!==Pe.value&&(Ce.push({query:{...ye.query,page:"1",filter:$e.value}}),Pe.value=$e.value),!$e.value||e.title?.includes($e.value))))))))).sort(((e,a)=>new Date(a.created_at).getTime()-new Date(e.created_at).getTime())))),Fe=s((()=>{const e=(De.value-1)*Te.value,a=e+Te.value;return Ue.value.slice(e,a)})),qe=e=>{switch(e){case"PUBLISHED":return"success";case"DRAFT":return"warning";case"TRASH":return"danger";default:return"info"}},Ie=o(!1),Le=o(""),Ee=o(""),Re=o(""),He=o(""),ze=o(""),Ne=["All","DRAFT","PUBLISHED"],Oe=s((()=>{let e=3;return _e.value&&e--,ke.value&&e--,je.value&&e--,e})),We=o(!1),Xe=o(!1);const{updatePostStatus:Ye}=R(),Ge=o(""),Je=o(!1),Ke=o(!1),Me=["DRAFT","PUBLISHED","TRASH"],Qe=o(null);const Ze=async()=>{Ke.value=!0;try{const e=await Ye(Qe.value?.id,Ge.value);be.response(e),"success"===e.status&&await H.fetchPosts(xe.value,_e.value,ke.value,je.value)}catch(e){be.danger(e)}Je.value=!1,Ke.value=!1,Qe.value=null};return(a,l)=>{const t=e,s=j,o=V,u=T,r=D,R=$,z=C,N=B,O=A,W=U,he=F,ye=q,xe=S,Ce=I,Pe=L,Be=E,Ye=P,ea=m;return p(),n("div",null,[i(Be,null,{left:d((()=>[v("div",X,[i(t,{modelValue:c($e),"onUpdate:modelValue":l[0]||(l[0]=e=>f($e)?$e.value=e:null),icon:"lucide:search",classes:{wrapper:"w-full sm:w-auto"},placeholder:"Search Post Title..."},null,8,["modelValue"]),i(o,{onClick:l[1]||(l[1]=e=>Ie.value=!c(Ie)),color:"muted",block:""},{default:d((()=>[c(Ie)?(p(),g(s,{key:0,name:"line-md:arrow-up",class:"h-4 w-4 mr-2"})):(p(),g(s,{key:1,name:"line-md:arrow-down",class:"h-4 w-4 mr-2"})),h(" "+y(a.$t("Filters")),1)])),_:1})])])),right:d((()=>[i(u,{modelValue:c(Te),"onUpdate:modelValue":l[2]||(l[2]=e=>f(Te)?Te.value=e:null),label:"",classes:{wrapper:"w-full sm:w-40"}},{default:d((()=>[v("option",Y,"10 "+y(a.$t("per page")),1),v("option",G,"25 "+y(a.$t("per page")),1),v("option",J,"50 "+y(a.$t("per page")),1),v("option",K,"100 "+y(a.$t("per page")),1)])),_:1},8,["modelValue"])])),default:d((()=>[v("div",null,[i(w,{"enter-active-class":"transform-gpu","enter-from-class":"opacity-0 -translate-y-4","enter-to-class":"opacity-100 translate-y-0","leave-active-class":"absolute transform-gpu","leave-from-class":"opacity-100 translate-y-0","leave-to-class":"opacity-0 -translate-y-4"},{default:d((()=>[c(Ie)?(p(),g(R,{key:0,class:x(`grid gap-4 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-${c(Oe)} lg:grid-cols-${c(Oe)+2} mb-6 p-5`)},{default:d((()=>[c(_e)?b("",!0):(p(),g(r,{key:0,modelValue:c(Le),"onUpdate:modelValue":l[3]||(l[3]=e=>f(Le)?Le.value=e:null),label:"Category",items:c(Se).map((e=>e.name)),placeholder:"Select a Category"},null,8,["modelValue","items"])),c(ke)?b("",!0):(p(),g(r,{key:1,modelValue:c(Ee),"onUpdate:modelValue":l[4]||(l[4]=e=>f(Ee)?Ee.value=e:null),label:"Tag",items:c(Ae).map((e=>e.name)),placeholder:"Select a Tag"},null,8,["modelValue","items"])),c(je)?b("",!0):(p(),g(r,{key:2,modelValue:c(Re),"onUpdate:modelValue":l[5]||(l[5]=e=>f(Re)?Re.value=e:null),label:"Status",items:Ne,placeholder:"Select a Status"},null,8,["modelValue"])),i(t,{modelValue:c(He),"onUpdate:modelValue":l[6]||(l[6]=e=>f(He)?He.value=e:null),type:"date",label:"From"},null,8,["modelValue"]),i(t,{modelValue:c(ze),"onUpdate:modelValue":l[7]||(l[7]=e=>f(ze)?ze.value=e:null),type:"date",label:"To"},null,8,["modelValue"])])),_:1},8,["class"])):b("",!0)])),_:1}),c(Ve)||0!==c(Fe)?.length?(p(),n("div",Z,[i(Ce,null,{default:d((()=>[i(w,{"enter-active-class":"transform-gpu","enter-from-class":"opacity-0 -translate-x-full","enter-to-class":"opacity-100 translate-x-0","leave-active-class":"absolute transform-gpu","leave-from-class":"opacity-100 translate-x-0","leave-to-class":"opacity-0 -translate-x-full"},{default:d((()=>[(p(!0),n(_,null,k(c(Fe),((e,a)=>(p(),g(xe,{key:e.id,spaced:""},{start:d((()=>[i(N,{label:"Post","hide-label":a>0,picture:e.image||"/img/placeholder.png",title:e.title,subtitle:c(we)(e.created_at,!0)},null,8,["hide-label","picture","title","subtitle"])])),end:d((()=>[i(O,{label:"Category","hide-label":a>0,class:"w-20 xs:w-full"},{default:d((()=>[h(y(e.category?.name),1)])),_:2},1032,["hide-label"]),i(O,{label:"Status","hide-label":a>0,class:"w-24 xs:w-full"},{default:d((()=>[i(W,{color:qe(e.status),flavor:"pastel",condensed:""},{default:d((()=>[h(y(e.status),1)])),_:2},1032,["color"])])),_:2},1032,["hide-label"]),i(O,{label:"Actions","hide-label":a>0,class:"w-20 xs:justify-end xs:w-full"},{default:d((()=>[i(ye,{flavor:"context",label:"Dropdown",orientation:"end"},{default:d((()=>[i(he,{to:`/blog/${e.slug}`,title:"View Post"},{start:d((()=>[i(s,{name:"ph:eye-duotone",class:"me-2 block h-5 w-5"})])),_:2},1032,["to"]),i(he,{onClick:a=>{return l=e,Qe.value=l,Ge.value=l.status,void(Je.value=!0);var l},title:"Edit Post Status"},{start:d((()=>[i(s,{name:"line-md:edit-twotone",class:"me-2 block h-5 w-5"})])),_:2},1032,["onClick"]),i(he,{onClick:a=>function(e){H.selectedPost=e,We.value=!0}(e),title:"Delete Post"},{start:d((()=>[i(s,{name:"line-md:close",class:"me-2 block h-5 w-5"})])),_:2},1032,["onClick"])])),_:2},1024)])),_:2},1032,["hide-label"])])),_:2},1024)))),128))])),_:1})])),_:1})])):(p(),g(z,{key:0,title:c($e)&&""!==c($e)?"No matching results":"No results",subtitle:c($e)&&""!==c($e)?"Looks like we couldn't find any matching results for your search terms. Try other search terms.":"Looks like we don't have any data here yet."},{image:d((()=>[M,Q])),_:1},8,["title","subtitle"])),v("div",ee,[c(Ue).length>c(Te)?(p(),g(Pe,{key:0,"total-items":c(Ue).length,"current-page":c(De),"item-per-page":c(Te)},null,8,["total-items","current-page","item-per-page"])):b("",!0)])])])),_:1}),i(ea,{open:c(Je),size:"sm",onClose:l[11]||(l[11]=e=>Je.value=!1)},{header:d((()=>[v("div",ae,[v("h3",le,y(a.$t("Edit"))+" "+y(a.$t("Post")),1),i(Ye,{onClick:l[8]||(l[8]=e=>Je.value=!1)})])])),footer:d((()=>[v("div",re,[v("div",ne,[i(o,{onClick:l[10]||(l[10]=e=>Je.value=!1)},{default:d((()=>[h(y(a.$t("Cancel")),1)])),_:1}),i(o,{color:"primary",flavor:"solid",onClick:Ze,disabled:c(Ke),loading:c(Ke)},{default:d((()=>[h(y(a.$t("Update")),1)])),_:1},8,["disabled","loading"])])])])),default:d((()=>[v("div",te,[v("div",se,[v("p",oe,y(a.$t("Please update the"))+" "+y(a.$t("post"))+" "+y(a.$t("status"))+". ",1),v("div",ue,[i(r,{modelValue:c(Ge),"onUpdate:modelValue":l[9]||(l[9]=e=>f(Ge)?Ge.value=e:null),disabled:c(Ke),items:Me,placeholder:"Please select an option",label:"Status",shape:"rounded"},null,8,["modelValue","disabled"])])])])])),_:1},8,["open"]),i(ea,{open:c(We),size:"sm",onClose:l[15]||(l[15]=e=>We.value=!1)},{header:d((()=>[v("div",ie,[v("h3",de,y(a.$t("Delete"))+" "+y(a.$t("Post")),1),i(Ye,{onClick:l[12]||(l[12]=e=>We.value=!1)})])])),footer:d((()=>[v("div",fe,[v("div",ge,[i(o,{onClick:l[13]||(l[13]=e=>We.value=!1)},{default:d((()=>[h(y(a.$t("Cancel")),1)])),_:1}),i(o,{color:"danger",flavor:"solid",onClick:l[14]||(l[14]=e=>async function(){Xe.value=!0;try{const e=await H.deletePostById(H.selectedPost?.id);be.response(e),"success"===e.status&&(H.posts=H.posts.filter((e=>e.id!==H.selectedPost?.id)))}catch(e){be.danger(e)}We.value=!1,Xe.value=!1}()),disabled:c(Xe),loading:c(Xe)},{default:d((()=>[h(y(a.$t("Delete")),1)])),_:1},8,["disabled","loading"])])])])),default:d((()=>[v("div",ce,[v("div",me,[v("h3",pe,y(a.$t("Are you sure?")),1),v("p",ve,y(a.$t("Do you really want to delete this"))+" "+y(a.$t("post"))+"? "+y(a.$t("This process cannot be undone"))+". ",1)])])])),_:1},8,["open"])])}}});export{he as default};
