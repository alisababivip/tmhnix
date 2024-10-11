import{_ as e}from"./BaseInput.vue-iInHQMIA.js";import{a,z as l,ad as t,c as s,r as o,ac as u,E as r,b as n,e as i,w as c,u as d,an as m,o as p,f,p as v,O as g,q as h,t as k,af as w,k as y,n as b,F as _,B as x,x as j,X as T,Y as D,ag as $,ao as V}from"../e/entry-8qgg5CL-.js";import{_ as C}from"./BaseSelect.vue-p0KYznCX.js";import{_ as I}from"./BaseListbox.vue-1Dy9Ui3z.js";import{_ as E,a as B}from"./FlexTableRow.vue-LmGXINIn.js";import{_ as L}from"./BaseTag.vue-NMkN1Uk8.js";import{_ as S}from"./FlexTableCell.vue-Rbj2Whgl.js";import{_ as N,a as P}from"./BaseDropdown.vue-wSpyT9xX.js";import{_ as O}from"./TairoFlexTable-zdoraqRc.js";import{_ as U}from"./BasePagination.vue-eKZkqxB7.js";import{_ as A}from"./TairoContentWrapper.vue-JqAKR4O_.js";import{u as F}from"./useSupport-ffNMpQhG.js";import{a as q}from"./strings-rQgUKePI.js";import{_ as G,a as H}from"./placeholder-search-4-dark-Jht91LnM.js";import{u as M}from"./user-j76Gmn-L.js";import"./input-id-wZ-Ta08j.js";import"./BaseIconBox.vue-qjQCKz6R.js";import"./BaseAvatar.vue-XYSxxLJP.js";import"./use-text-value-9iwzs_EA.js";import"./menu-KWZreDHB.js";import"./BaseFocusLoop.vue-E4yqAJcg.js";const z={class:"w-full flex gap-2 xs:flex-col sm:flex-row"},W={value:10},R={value:25},X={value:50},Y={value:100},J=f("img",{class:"block dark:hidden",src:G,alt:"Placeholder image"},null,-1),K=f("img",{class:"hidden dark:block",src:H,alt:"Placeholder image"},null,-1),Q={key:1,class:"w-full sm:pt-5"},Z={class:"mt-6"},ee={class:"flex w-full items-center justify-between p-4 md:p-6"},ae={class:"font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"},le={class:"p-4 md:p-6"},te={class:"mx-auto w-full text-center"},se={class:"font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"},oe={class:"font-alt text-muted-500 dark:text-muted-400 text-sm leading-5 mb-3"},ue={class:"p-4 md:p-6"},re={class:"flex gap-x-2"},ne=a({__name:"index",setup(a){const G=M(),H=l(),{toast:ne}=t(),ie=s((()=>H.query.status)),ce=s((()=>H.query.importance)),de=o(!1),me=o(""),pe=o(10),fe=s((()=>parseInt(H.query.page??"1"))),ve=u(),ge=o(""),he=s((()=>G.tickets));r((async()=>{de.value=!0,0===G.tickets.length&&await G.fetchTickets(),de.value=!1}));const ke=s((()=>he.value.filter((e=>(!xe.value||"All"===xe.value||e.status===xe.value)&&((!ce.value||"All"===ce.value||e.importance===ce.value)&&(!(Te.value&&new Date(e.created_at)<new Date(Te.value))&&(!(De.value&&new Date(e.created_at)>new Date(De.value))&&(me.value&&""!==me.value&&void 0!==me.value&&me.value!==ge.value&&(ve.push({query:{...H.query,page:"1",filter:me.value}}),ge.value=me.value),!me.value||e.uuid?.includes(me.value))))))).sort(((e,a)=>new Date(a.created_at).getTime()-new Date(e.created_at).getTime())))),we=s((()=>{const e=(fe.value-1)*pe.value,a=e+pe.value;return ke.value.slice(e,a)})),ye=e=>{switch(e){case"PENDING":return"warning";case"OPEN":return"success";case"CLOSED":return"danger";default:return"info"}},be=e=>{switch(e){case"LOW":default:return"info";case"MEDIUM":return"warning";case"HIGH":return"danger"}},_e=o(!1),xe=o(""),je=o(""),Te=o(""),De=o(""),$e=["All","PENDING","OPEN","REPLIED","CLOSED"],Ve=["All","LOW","MEDIUM","HIGH"],Ce=s((()=>{let e=2;return ie.value&&e--,ce.value&&e--,e})),Ie=o(!1),Ee=o(!1);const{closeTicket:Be}=F();return(a,l)=>{const t=e,s=j,o=T,u=C,r=I,F=D,H=$,M=E,ve=L,ge=S,he=N,Le=P,Se=B,Ne=O,Pe=U,Oe=A,Ue=V,Ae=m;return p(),n("div",null,[i(Oe,null,{left:c((()=>[f("div",z,[i(t,{modelValue:d(me),"onUpdate:modelValue":l[0]||(l[0]=e=>v(me)?me.value=e:null),icon:"lucide:search",classes:{wrapper:"w-full sm:w-auto"},placeholder:"Search Ticket ID..."},null,8,["modelValue"]),i(o,{onClick:l[1]||(l[1]=e=>_e.value=!d(_e)),color:"muted",block:""},{default:c((()=>[d(_e)?(p(),g(s,{key:0,name:"line-md:arrow-up",class:"h-4 w-4 mr-2"})):(p(),g(s,{key:1,name:"line-md:arrow-down",class:"h-4 w-4 mr-2"})),h(" "+k(a.$t("Filters")),1)])),_:1}),i(u,{modelValue:d(pe),"onUpdate:modelValue":l[2]||(l[2]=e=>v(pe)?pe.value=e:null),label:"",classes:{wrapper:"w-full sm:w-40"}},{default:c((()=>[f("option",W,"10 "+k(a.$t("per page")),1),f("option",R,"25 "+k(a.$t("per page")),1),f("option",X,"50 "+k(a.$t("per page")),1),f("option",Y,"100 "+k(a.$t("per page")),1)])),_:1},8,["modelValue"])])])),right:c((()=>[i(o,{color:"primary",to:"/user/support/ticket/new"},{default:c((()=>[i(s,{name:"lucide:plus",size:"16",class:"mr-2"}),h(" "+k(a.$t("New Ticket")),1)])),_:1})])),default:c((()=>[f("div",null,[i(w,{"enter-active-class":"transform-gpu","enter-from-class":"opacity-0 -translate-y-4","enter-to-class":"opacity-100 translate-y-0","leave-active-class":"absolute transform-gpu","leave-from-class":"opacity-100 translate-y-0","leave-to-class":"opacity-0 -translate-y-4"},{default:c((()=>[d(_e)?(p(),g(F,{key:0,class:b(`grid gap-4 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-${d(Ce)} lg:grid-cols-${d(Ce)+2} mb-6 p-5`)},{default:c((()=>[d(ie)?y("",!0):(p(),g(r,{key:0,modelValue:d(xe),"onUpdate:modelValue":l[3]||(l[3]=e=>v(xe)?xe.value=e:null),label:"Status",items:$e,placeholder:"Select status"},null,8,["modelValue"])),d(ce)?y("",!0):(p(),g(r,{key:1,modelValue:d(je),"onUpdate:modelValue":l[4]||(l[4]=e=>v(je)?je.value=e:null),label:"Importance",items:Ve,placeholder:"Select ticket importance"},null,8,["modelValue"])),i(t,{modelValue:d(Te),"onUpdate:modelValue":l[5]||(l[5]=e=>v(Te)?Te.value=e:null),type:"date",label:"From"},null,8,["modelValue"]),i(t,{modelValue:d(De),"onUpdate:modelValue":l[6]||(l[6]=e=>v(De)?De.value=e:null),type:"date",label:"To"},null,8,["modelValue"])])),_:1},8,["class"])):y("",!0)])),_:1}),d(de)||0!==d(we)?.length?(p(),n("div",Q,[i(Ne,null,{default:c((()=>[i(w,{"enter-active-class":"transform-gpu","enter-from-class":"opacity-0 -translate-x-full","enter-to-class":"opacity-100 translate-x-0","leave-active-class":"absolute transform-gpu","leave-from-class":"opacity-100 translate-x-0","leave-to-class":"opacity-0 -translate-x-full"},{default:c((()=>[(p(!0),n(_,null,x(d(we),((e,l)=>(p(),g(Se,{key:e.id,spaced:""},{start:c((()=>[i(M,{label:"Ticket","hide-label":l>0,title:`${e.subject}`,subtitle:("formatDate"in a?a.formatDate:d(q))(e.created_at)},null,8,["hide-label","title","subtitle"])])),end:c((()=>[i(ge,{label:"Importance","hide-label":l>0,class:"w-20 xs:w-full"},{default:c((()=>[i(ve,{color:be(e.importance),flavor:"pastel",condensed:""},{default:c((()=>[h(k(e.importance),1)])),_:2},1032,["color"])])),_:2},1032,["hide-label"]),i(ge,{label:"Status","hide-label":l>0,class:"w-20 xs:w-full"},{default:c((()=>[i(ve,{color:ye(e.status),flavor:"pastel",condensed:""},{default:c((()=>[h(k(e.status),1)])),_:2},1032,["color"])])),_:2},1032,["hide-label"]),i(ge,{label:"Actions","hide-label":l>0,class:"w-20 xs:justify-end xs:w-full"},{default:c((()=>[i(Le,{flavor:"context",label:"Dropdown",orientation:"end"},{default:c((()=>[i(he,{to:`/user/support/ticket/${e.uuid}`,title:"View Ticket"},{start:c((()=>[i(s,{name:"ph:eye-duotone",class:"me-2 block h-5 w-5"})])),_:2},1032,["to"]),"CLOSED"!==e.status?(p(),g(he,{key:0,onClick:a=>function(e){G.currentTicket=e,Ie.value=!0}(e),title:"Close Ticket"},{start:c((()=>[i(s,{name:"line-md:close",class:"me-2 block h-5 w-5"})])),_:2},1032,["onClick"])):y("",!0)])),_:2},1024)])),_:2},1032,["hide-label"])])),_:2},1024)))),128))])),_:1})])),_:1})])):(p(),g(H,{key:0,title:d(me)&&""!==d(me)?"No matching results":"No results",subtitle:d(me)&&""!==d(me)?"Looks like we couldn't find any matching results for your search terms. Try other search terms.":"Looks like we don't have any data here yet."},{image:c((()=>[J,K])),_:1},8,["title","subtitle"])),f("div",Z,[d(ke).length>d(pe)?(p(),g(Pe,{key:0,"total-items":d(ke).length,"item-per-page":d(pe),"current-page":d(fe)},null,8,["total-items","item-per-page","current-page"])):y("",!0)])])])),_:1}),i(Ae,{open:d(Ie),size:"sm",onClose:l[10]||(l[10]=e=>Ie.value=!1)},{header:c((()=>[f("div",ee,[f("h3",ae,k(a.$t("Close"))+" "+k(a.$t("Ticket")),1),i(Ue,{onClick:l[7]||(l[7]=e=>Ie.value=!1)})])])),footer:c((()=>[f("div",ue,[f("div",re,[i(o,{onClick:l[8]||(l[8]=e=>Ie.value=!1)},{default:c((()=>[h(k(a.$t("Cancel")),1)])),_:1}),i(o,{color:"danger",flavor:"solid",onClick:l[9]||(l[9]=e=>async function(){Ee.value=!0;try{const e=await Be(G.currentTicket?.uuid);ne.response(e),"success"===e.status&&await G.fetchTickets()}catch(e){ne.danger(e)}Ie.value=!1,Ee.value=!1,G.currentTicket=null}()),disabled:d(Ee),loading:d(Ee)},{default:c((()=>[h(k(a.$t("Close")),1)])),_:1},8,["disabled","loading"])])])])),default:c((()=>[f("div",le,[f("div",te,[f("h3",se,k(a.$t("Are you sure?")),1),f("p",oe,k(a.$t("Do you really want to close this"))+" "+k(a.$t("ticket"))+" "+k(a.$t("This process cannot be undone"))+". "+k(a.$t("you will not be able to recover this ticket after closing it"))+". ",1)])])])),_:1},8,["open"])])}}});export{ne as default};
