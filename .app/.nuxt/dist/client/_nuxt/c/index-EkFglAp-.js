import{_ as e}from"./BaseInput.vue-iInHQMIA.js";import{_ as a}from"./BaseSelect.vue-p0KYznCX.js";import{a as s,z as l,r as t,c as r,E as o,ad as i,b as u,e as d,w as n,u as c,an as m,o as p,p as f,f as v,t as h,O as g,F as _,B as b,q as k,k as w,ag as y,x as j,ao as x,X as C}from"../e/entry-8qgg5CL-.js";import{_ as E,a as D}from"./FlexTableRow.vue-LmGXINIn.js";import{_ as $}from"./FlexTableCell.vue-Rbj2Whgl.js";import{_ as O}from"./BaseTag.vue-NMkN1Uk8.js";import{_ as T,a as B}from"./BaseDropdown.vue-wSpyT9xX.js";import{_ as L}from"./TairoFlexTable-zdoraqRc.js";import{_ as P}from"./BasePagination.vue-eKZkqxB7.js";import{_ as V}from"./TairoContentWrapper.vue-JqAKR4O_.js";import{u as F}from"./useEcommerce-2nLxpPKu.js";import{a as I}from"./strings-rQgUKePI.js";import{_ as A,a as N}from"./placeholder-search-4-dark-Jht91LnM.js";import{u as M}from"./orders-6snY74Ln.js";import"./input-id-wZ-Ta08j.js";import"./BaseAvatar.vue-XYSxxLJP.js";import"./BaseIconBox.vue-qjQCKz6R.js";import"./menu-KWZreDHB.js";import"./use-text-value-9iwzs_EA.js";import"./BaseFocusLoop.vue-E4yqAJcg.js";const S={value:10},U={value:25},q={value:50},z={value:100},R=v("img",{class:"block dark:hidden",src:A,alt:"Placeholder image"},null,-1),G=v("img",{class:"hidden dark:block",src:N,alt:"Placeholder image"},null,-1),J={key:1,class:"w-full"},W={class:"mt-6"},X={class:"flex items-center justify-between p-4"},H=v("h3",{class:"text-lg font-medium"},"Update Order",-1),K={class:"p-4"},Q={class:"text-center"},Y={class:"text-lg font-medium"},Z={class:"text-sm my-3"},ee={class:"flex justify-end gap-x-2 p-4"},ae=s({__name:"index",setup(s){const A=M(),{updateAdminOrderStatus:N}=F(),ae=l(),se=t(""),le=t(10),te=r((()=>parseInt(ae.query.page??"1"))),re=r((()=>A.orders.filter((e=>e.id.toString().includes(se.value)||e.user.email?.includes(se.value)))??[])),oe=r((()=>{const e=(te.value-1)*le.value,a=e+le.value;return re.value.slice(e,a)}));o((async()=>{0===A.orders.length&&(A.loading=!0,await A.fetchOrders(),A.loading=!1)}));const ie=e=>{switch(e){case"PENDING":return"warning";case"COMPLETED":return"success";case"CANCELLED":case"REJECTED":return"danger";default:return"secondary"}},{toast:ue}=i(),de=t(!1),ne=t(!1),ce=t(null),me=async e=>{ne.value=!0;try{const e=await N(ce.value?.id,"COMPLETED");ue.response(e),"success"===e.status&&await A.fetchOrders()}catch(a){ue.danger(a)}ne.value=!1,de.value=!1,ce.value=null};return(s,l)=>{const t=e,r=a,o=y,i=E,F=$,N=O,M=j,ae=T,ue=B,pe=D,fe=L,ve=P,he=V,ge=x,_e=C,be=m;return p(),u("div",null,[d(he,null,{left:n((()=>[d(t,{modelValue:c(se),"onUpdate:modelValue":l[0]||(l[0]=e=>f(se)?se.value=e:null),icon:"lucide:search",classes:{wrapper:"w-full sm:w-auto"},placeholder:"Filter orders..."},null,8,["modelValue"])])),right:n((()=>[d(r,{modelValue:c(le),"onUpdate:modelValue":l[1]||(l[1]=e=>f(le)?le.value=e:null),label:"",classes:{wrapper:"w-full sm:w-40"}},{default:n((()=>[v("option",S,"10 "+h(s.$t("per page")),1),v("option",U,"25 "+h(s.$t("per page")),1),v("option",q,"50 "+h(s.$t("per page")),1),v("option",z,"100 "+h(s.$t("per page")),1)])),_:1},8,["modelValue"])])),default:n((()=>[v("div",null,[c(A)?.loading||0!==c(oe)?.length?(p(),u("div",J,[d(fe,{class:"pt-5"},{default:n((()=>[(p(!0),u(_,null,b(c(oe),((e,a)=>(p(),g(pe,{key:e.id,spaced:""},{start:n((()=>[d(i,{label:"Customer","hide-label":a>0,logo:e.user?.avatar,title:`${e.user?.first_name} ${e.user?.last_name}`,subtitle:("formatDate"in s?s.formatDate:c(I))(e.created_at)},null,8,["hide-label","logo","title","subtitle"])])),end:n((()=>[d(F,{label:"Order ID","hide-label":a>0,class:"w-20 xs:w-full"},{default:n((()=>[k(" #"+h(e.id),1)])),_:2},1032,["hide-label"]),d(F,{label:"Status","hide-label":a>0,class:"w-20 xs:w-full"},{default:n((()=>[d(N,{color:ie(e.status),flavor:"pastel",condensed:""},{default:n((()=>[k(h(e.status),1)])),_:2},1032,["color"])])),_:2},1032,["hide-label"]),d(F,{label:"Actions","hide-label":a>0},{default:n((()=>[d(ue,{flavor:"context",label:"Dropdown",orientation:"end"},{default:n((()=>["COMPLETED"!==e.status?(p(),g(ae,{key:0,onClick:a=>{return s=e,ce.value=s,void(de.value=!0);var s},title:"Mark as Completed"},{start:n((()=>[d(M,{name:"mdi:check",class:"me-2 block h-5 w-5"})])),_:2},1032,["onClick"])):w("",!0),d(ae,{to:`/admin/extensions/ecommerce/orders/${e.id}`,title:"View Order Items"},{start:n((()=>[d(M,{name:"mdi:eye",class:"me-2 block h-5 w-5"})])),_:2},1032,["to"])])),_:2},1024)])),_:2},1032,["hide-label"])])),_:2},1024)))),128))])),_:1})])):(p(),g(o,{key:0,title:c(se)&&""!==c(se)?"No matching orders":"No orders found",subtitle:c(se)&&""!==c(se)?"Looks like we couldn't find any matching orders for your search terms. Try other search terms.":"Looks like we don't have any orders here yet."},{image:n((()=>[R,G])),_:1},8,["title","subtitle"])),v("div",W,[c(re).length>c(le)?(p(),g(ve,{key:0,"total-items":c(re).length,"current-page":c(te),"item-per-page":c(le)},null,8,["total-items","current-page","item-per-page"])):w("",!0)])])])),_:1}),d(be,{open:c(de),size:"sm",onClose:l[5]||(l[5]=e=>de.value=!1)},{header:n((()=>[v("div",X,[H,d(ge,{onClick:l[2]||(l[2]=e=>de.value=!1)})])])),footer:n((()=>[v("div",ee,[d(_e,{onClick:l[3]||(l[3]=e=>de.value=!1)},{default:n((()=>[k(h(s.$t("Cancel")),1)])),_:1}),d(_e,{color:"success",onClick:l[4]||(l[4]=e=>me()),disabled:c(ne),loading:c(ne)},{default:n((()=>[k(h(s.$t("Update")),1)])),_:1},8,["disabled","loading"])])])),default:n((()=>[v("div",K,[v("div",Q,[v("h3",Y,h(s.$t("Are you sure?")),1),v("p",Z,h(s.$t("Do you really want to mark this order as completed? Did you add the keys to the order items?")),1)])])])),_:1},8,["open"])])}}});export{ae as default};
