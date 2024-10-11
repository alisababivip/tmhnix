import{_ as e}from"./BaseInput.vue-iInHQMIA.js";import{_ as a}from"./BaseSelect.vue-p0KYznCX.js";import{a as l,z as t,r as s,c as i,E as n,ad as o,ac as r,b as u,e as d,w as c,u as m,an as p,av as g,o as f,p as h,f as v,t as w,q as b,O as _,F as x,B as C,l as k,k as j,x as y,X as T,ag as $,ao as D}from"../e/entry-8qgg5CL-.js";import{_ as B,a as E}from"./FlexTableRow.vue-LmGXINIn.js";import{_ as P}from"./FlexTableCell.vue-Rbj2Whgl.js";import{_ as z}from"./BaseProgressCircle-QIQdw43q.js";import{_ as V}from"./BaseTag.vue-NMkN1Uk8.js";import{_ as A,a as F}from"./BaseDropdown.vue-wSpyT9xX.js";import{_ as L}from"./TairoFlexTable-zdoraqRc.js";import{_ as N}from"./BasePagination.vue-eKZkqxB7.js";import{_ as S}from"./TairoContentWrapper.vue-JqAKR4O_.js";import{u as I}from"./useMailwizard-mGGEZWYz.js";import{_ as M,a as O}from"./placeholder-search-4-dark-Jht91LnM.js";import{u as U}from"./campaigns-yRjF5fLV.js";import"./input-id-wZ-Ta08j.js";import"./BaseAvatar.vue-XYSxxLJP.js";import"./BaseIconBox.vue-qjQCKz6R.js";import"./menu-KWZreDHB.js";import"./use-text-value-9iwzs_EA.js";import"./BaseFocusLoop.vue-E4yqAJcg.js";const q={value:10},G={value:25},R={value:50},W={value:100},X=v("img",{class:"block dark:hidden",src:M,alt:"Placeholder image"},null,-1),H=v("img",{class:"hidden dark:block",src:O,alt:"Placeholder image"},null,-1),J={key:1,class:"w-full"},K=v("span",{class:"text-muted-500"},"/hr",-1),Q={class:"mt-6"},Y={class:"flex w-full items-center justify-between p-4 md:p-6"},Z={class:"font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"},ee={class:"p-4 md:p-6"},ae={class:"mx-auto w-full text-center"},le={class:"font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"},te={class:"font-alt text-muted-500 dark:text-muted-400 text-sm leading-5 mb-3"},se={class:"p-4 md:p-6"},ie={class:"flex gap-x-2"},ne=l({__name:"index",setup(l){const M=U(),{deleteCampaign:O}=I(),ne=t(),oe=s(""),re=s(10),ue=i((()=>parseInt(ne.query.page??"1"))),de=i((()=>M.campaigns.filter((e=>e.name.includes(oe.value))).map((e=>({...e,progress:Math.round(e.targets.filter((e=>"SENT"===e.status)).length/e.targets.length*100)})))??[])),ce=i((()=>{const e=(ue.value-1)*re.value,a=e+re.value;return de.value.slice(e,a)}));n((async()=>{0===M.campaigns.length&&(M.loading=!0,await M.fetchCampaigns(),M.loading=!1)}));const{toast:me}=o(),pe=r();const ge=s(!1),fe=s(!1),he=s(null);const ve=e=>{switch(e){case"PENDING":return"warning";case"ACTIVE":default:return"primary";case"PAUSED":return"info";case"COMPLETED":return"success";case"CANCELED":case"STOPPED":return"danger"}};return(l,t)=>{const s=e,i=a,n=y,o=T,r=$,I=B,U=P,ne=z,we=V,be=A,_e=F,xe=E,Ce=L,ke=N,je=S,ye=D,Te=p,$e=g("can");return f(),u("div",null,[d(je,null,{left:c((()=>[d(s,{modelValue:m(oe),"onUpdate:modelValue":t[0]||(t[0]=e=>h(oe)?oe.value=e:null),icon:"lucide:search",classes:{wrapper:"w-full sm:w-auto"},placeholder:"Filter campaigns..."},null,8,["modelValue"]),d(i,{modelValue:m(re),"onUpdate:modelValue":t[1]||(t[1]=e=>h(re)?re.value=e:null),label:"",classes:{wrapper:"w-full sm:w-40"}},{default:c((()=>[v("option",q,"10 "+w(l.$t("per page")),1),v("option",G,"25 "+w(l.$t("per page")),1),v("option",R,"50 "+w(l.$t("per page")),1),v("option",W,"100 "+w(l.$t("per page")),1)])),_:1},8,["modelValue"])])),right:c((()=>[d(o,{color:"primary",to:"/admin/extensions/mailwizard/campaigns/create"},{default:c((()=>[d(n,{name:"lucide:plus",size:"16",class:"mr-2"}),b(" "+w(l.$t("Create Campaign")),1)])),_:1})])),default:c((()=>[v("div",null,[m(M)?.loading||0!==m(ce)?.length?(f(),u("div",J,[d(Ce,{class:"pt-5"},{default:c((()=>[(f(!0),u(x,null,C(m(ce),((e,a)=>(f(),_(xe,{key:e.id,spaced:""},{start:c((()=>[d(I,{label:"Campaign","hide-label":a>0,picture:e.image,title:e.name,subtitle:e.description},null,8,["hide-label","picture","title","subtitle"])])),end:c((()=>[d(U,{label:"Targets","hide-label":a>0,class:"w-20 xs:w-full"},{default:c((()=>[b(w(e.targets.length),1)])),_:2},1032,["hide-label"]),d(U,{label:"Progress","hide-label":a>0,class:"w-20 xs:w-full"},{default:c((()=>[d(ne,{size:45,value:e.progress,class:"text-success-500"},null,8,["value"])])),_:2},1032,["hide-label"]),d(U,{label:"Speed","hide-label":a>0,class:"w-20 xs:w-full"},{default:c((()=>[b(w(e.speed),1),K])),_:2},1032,["hide-label"]),d(U,{label:"Status","hide-label":a>0,class:"w-24 xs:w-full"},{default:c((()=>[d(we,{color:ve(e.status),flavor:"pastel",condensed:""},{default:c((()=>[b(w(e.status),1)])),_:2},1032,["color"])])),_:2},1032,["hide-label"]),d(U,{label:"Actions","hide-label":a>0},{default:c((()=>[d(_e,{flavor:"context",label:"Dropdown",orientation:"end"},{default:c((()=>[d(be,{to:`/admin/extensions/mailwizard/campaigns/view/${e.id}`,title:"View Campaign"},{start:c((()=>[d(n,{name:"mdi:eye",class:"me-2 block h-5 w-5"})])),_:2},1032,["to"]),d(be,{onClick:a=>function(e){M.selectCampaign(e),pe.push(`/admin/extensions/mailwizard/campaigns/edit/${e.id}`)}(e),title:"Edit Campaign"},{start:c((()=>[d(n,{name:"line-md:edit-twotone",class:"me-2 block h-5 w-5"})])),_:2},1032,["onClick"]),k((f(),_(be,{onClick:a=>function(e){he.value=e,ge.value=!0}(e),title:"Delete Campaign"},{start:c((()=>[d(n,{name:"line-md:close",class:"me-2 block h-5 w-5"})])),_:2},1032,["onClick"])),[[$e,"Delete Mailwizard Campaign"]])])),_:2},1024)])),_:2},1032,["hide-label"])])),_:2},1024)))),128))])),_:1})])):(f(),_(r,{key:0,title:m(oe)&&""!==m(oe)?"No matching results":"No results",subtitle:m(oe)&&""!==m(oe)?"Looks like we couldn't find any matching results for your search terms. Try other search terms.":"Looks like we don't have any data here yet."},{image:c((()=>[X,H])),_:1},8,["title","subtitle"])),v("div",Q,[m(de).length>m(re)?(f(),_(ke,{key:0,"total-items":m(de).length,"current-page":m(ue),"item-per-page":m(re)},null,8,["total-items","current-page","item-per-page"])):j("",!0)])])])),_:1}),d(Te,{open:m(ge),size:"sm",onClose:t[5]||(t[5]=e=>ge.value=!1)},{header:c((()=>[v("div",Y,[v("h3",Z,w(l.$t("Delete Campaign")),1),d(ye,{onClick:t[2]||(t[2]=e=>ge.value=!1)})])])),footer:c((()=>[v("div",se,[v("div",ie,[d(o,{onClick:t[3]||(t[3]=e=>ge.value=!1)},{default:c((()=>[b(w(l.$t("Cancel")),1)])),_:1}),d(o,{color:"danger",flavor:"solid",onClick:t[4]||(t[4]=e=>async function(){fe.value=!0;try{const e=await O(he.value?.id);me.response(e),"success"===e.status&&M.removeCampaign(he.value?.id)}catch(e){me.danger(e)}ge.value=!1,fe.value=!1,he.value=null}()),disabled:m(fe),loading:m(fe)},{default:c((()=>[b(w(l.$t("Delete")),1)])),_:1},8,["disabled","loading"])])])])),default:c((()=>[v("div",ee,[v("div",ae,[v("h3",le,w(l.$t("Are you sure?")),1),v("p",te,w(l.$t("Do you really want to delete this campaign? This process cannot be undone.")),1)])])])),_:1},8,["open"])])}}});export{ne as default};
