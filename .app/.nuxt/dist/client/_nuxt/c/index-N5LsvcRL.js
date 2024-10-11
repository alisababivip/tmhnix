import{_ as e}from"./BaseInput.vue-iInHQMIA.js";import{_ as a}from"./BaseSelect.vue-p0KYznCX.js";import{d as l,a as t,z as s,r as i,c as o,E as r,ad as n,b as u,e as d,w as c,u as v,an as m,o as p,p as w,f,t as h,O as g,F as y,B as b,q as k,k as _,ag as R,ao as x,X as j}from"../e/entry-8qgg5CL-.js";import{_ as P,a as C}from"./FlexTableRow.vue-LmGXINIn.js";import{_ as B}from"./FlexTableCell.vue-Rbj2Whgl.js";import{_ as $,a as D}from"./BaseDropdown.vue-wSpyT9xX.js";import{_ as I}from"./TairoFlexTable-zdoraqRc.js";import{_ as F}from"./BasePagination.vue-eKZkqxB7.js";import{_ as V}from"./TairoContentWrapper.vue-JqAKR4O_.js";import{u as T}from"./useP2P-NV4dmDWU.js";import{_ as A,a as L}from"./placeholder-search-4-dark-Jht91LnM.js";import"./input-id-wZ-Ta08j.js";import"./BaseAvatar.vue-XYSxxLJP.js";import"./BaseIconBox.vue-qjQCKz6R.js";import"./menu-KWZreDHB.js";import"./use-text-value-9iwzs_EA.js";import"./BaseFocusLoop.vue-E4yqAJcg.js";const q=l({id:"adminP2PReviews",state:()=>({reviews:[],loading:!1,selectedReview:null}),getters:{getReviewById:e=>a=>e.reviews.find((e=>e.id===a))},actions:{async fetchP2PReviews(){this.loading=!0;try{const{getAdminP2PReviews:e}=T(),a=await e();this.reviews=a.data.result}catch(e){console.error("Error fetching P2P reviews:",e)}this.loading=!1},async removeReview(e){const a=this.reviews.findIndex((a=>a.id===e));-1!==a&&this.reviews.splice(a,1)},async selectReview(e){this.selectedReview=e},async selectReviewById(e){this.selectedReview=this.getReviewById(e)}}}),z={value:10},E={value:25},N={value:50},U={value:100},O=f("img",{class:"block dark:hidden",src:A,alt:"Placeholder image"},null,-1),S=f("img",{class:"hidden dark:block",src:L,alt:"Placeholder image"},null,-1),W={key:1,class:"w-full"},X={class:"mt-6"},G={class:"flex w-full items-center justify-between p-4 md:p-6"},H={class:"font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"},J={class:"p-4 md:p-6"},K={class:"mx-auto w-full text-center"},M={class:"font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"},Q={class:"p-4 md:p-6"},Y={class:"flex gap-x-2"},Z=t({__name:"index",setup(l){const t=q(),{deleteAdminP2PReview:A}=T(),L=s(),Z=i(""),ee=i(10),ae=o((()=>parseInt(L.query.page??"1"))),le=o((()=>t.reviews.filter((e=>e.comment?.toLowerCase().includes(Z.value.toLowerCase()))))),te=o((()=>{const e=(ae.value-1)*ee.value,a=e+ee.value;return le.value.slice(e,a)}));r((async()=>{0===t.reviews.length&&(t.loading=!0,await t.fetchP2PReviews(),t.loading=!1)}));const{toast:se}=n(),ie=i(!1),oe=i(!1),re=i(null);async function ne(){if(re.value){oe.value=!0;try{await A(re.value.id),t.removeReview(re.value.id),se.success("Review deleted successfully")}catch(e){se.error("Failed to delete review")}ie.value=!1,oe.value=!1,re.value=null}}return(l,s)=>{const i=e,o=a,r=R,n=P,T=B,A=$,L=D,q=C,se=I,ue=F,de=V,ce=x,ve=j,me=m;return p(),u("div",null,[d(de,null,{left:c((()=>[d(i,{modelValue:v(Z),"onUpdate:modelValue":s[0]||(s[0]=e=>w(Z)?Z.value=e:null),icon:"lucide:search",classes:{wrapper:"w-full sm:w-auto"},placeholder:"Filter reviews..."},null,8,["modelValue"])])),right:c((()=>[d(o,{modelValue:v(ee),"onUpdate:modelValue":s[1]||(s[1]=e=>w(ee)?ee.value=e:null),label:"",classes:{wrapper:"w-full sm:w-40"}},{default:c((()=>[f("option",z,"10 "+h(l.$t("per page")),1),f("option",E,"25 "+h(l.$t("per page")),1),f("option",N,"50 "+h(l.$t("per page")),1),f("option",U,"100 "+h(l.$t("per page")),1)])),_:1},8,["modelValue"])])),default:c((()=>[f("div",null,[v(t).loading||0!==v(te).length?(p(),u("div",W,[d(se,{class:"pt-5"},{default:c((()=>[(p(!0),u(y,null,b(v(te),((e,a)=>(p(),g(q,{key:e.id,spaced:""},{start:c((()=>[d(n,{label:"Review","hide-label":a>0,title:`ID: ${e.id}`,subtitle:e.comment},null,8,["hide-label","title","subtitle"])])),end:c((()=>[d(T,{label:"Rating","hide-label":a>0},{default:c((()=>[k(h(e.rating),1)])),_:2},1032,["hide-label"]),d(T,{label:"Actions","hide-label":a>0},{default:c((()=>[d(L,{flavor:"context",label:"Dropdown",orientation:"end"},{default:c((()=>[d(A,{onClick:a=>l.viewReviewDetails(e),title:"View Details"},null,8,["onClick"]),d(A,{onClick:a=>function(e){re.value=e,ie.value=!0}(e),title:"Delete Review"},null,8,["onClick"])])),_:2},1024)])),_:2},1032,["hide-label"])])),_:2},1024)))),128))])),_:1})])):(p(),g(r,{key:0,title:v(Z)&&""!==v(Z)?"No matching results":"No results",subtitle:v(Z)&&""!==v(Z)?"Looks like we couldn't find any matching results for your search terms. Try other search terms.":"Looks like we don't have any data here yet."},{image:c((()=>[O,S])),_:1},8,["title","subtitle"])),f("div",X,[v(le).length>v(ee)?(p(),g(ue,{key:0,"total-items":v(le).length,"current-page":v(ae),"item-per-page":v(ee)},null,8,["total-items","current-page","item-per-page"])):_("",!0)])])])),_:1}),d(me,{open:v(ie),size:"sm",onClose:s[4]||(s[4]=()=>ie.value=!1)},{header:c((()=>[f("div",G,[f("h3",H,h(l.$t("Delete Review")),1),d(ce,{onClick:s[2]||(s[2]=()=>ie.value=!1)})])])),footer:c((()=>[f("div",Q,[f("div",Y,[d(ve,{onClick:s[3]||(s[3]=()=>ie.value=!1)},{default:c((()=>[k(h(l.$t("Cancel")),1)])),_:1}),d(ve,{color:"danger",flavor:"solid",onClick:ne,disabled:v(oe),loading:v(oe)},{default:c((()=>[k(h(l.$t("Delete")),1)])),_:1},8,["disabled","loading"])])])])),default:c((()=>[f("div",J,[f("div",K,[f("h3",M,h(l.$t("Are you sure you want to delete this review?")),1)])])])),_:1},8,["open"])])}}});export{Z as default};
