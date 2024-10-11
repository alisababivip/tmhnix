import{_ as e}from"./BaseInput.vue-iInHQMIA.js";import{d as s,a as t,ad as l,z as a,r,c as n,E as c,b as u,e as i,w as o,u as d,an as m,o as f,p,f as x,t as v,F as h,B as y,af as g,O as w,q as C,k,x as b,X as j,s as _,Y as B,ag as $,_ as F,g as V,ao as I}from"../e/entry-8qgg5CL-.js";import{_ as L}from"./TairoButtonIcon.vue-KqKLsAHm.js";import{_ as T}from"./BasePagination.vue-eKZkqxB7.js";import{_ as P}from"./TairoContentWrapper.vue-JqAKR4O_.js";import{_ as S}from"./BaseListbox.vue-1Dy9Ui3z.js";import{_ as z}from"./BaseSwitchThin.vue-BxMY_B8T.js";import{u as U}from"./useForex-v_V55_1y.js";import{u as A}from"./currency-9FjTf2Bf.js";import{_ as D,a as q}from"./placeholder-search-1-dark-6GG3FkNl.js";import{z as E,u as N,t as M,F as X}from"./vee-validate.esm-n59zZCC5.js";import"./input-id-wZ-Ta08j.js";import"./BaseFocusLoop.vue-E4yqAJcg.js";import"./BaseIconBox.vue-qjQCKz6R.js";import"./BaseAvatar.vue-XYSxxLJP.js";import"./use-text-value-9iwzs_EA.js";import"./useExchange-VMAYQu3P.js";const O=s({id:"forexCurrency",state:()=>({currencies:[],loading:!1,selectedCurrency:null}),getters:{getCurrencyById:e=>s=>e.currencies.find((e=>e.id===s))},actions:{async fetchForexCurrencies(){this.loading=!0;try{const{getForexCurrencies:e}=U(),s=await e();this.currencies=s.data.result}catch(e){console.error("Error fetching currencies:",e)}this.loading=!1},async removeCurrency(e){const s=this.currencies.findIndex((s=>s.id===e));this.currencies.splice(s,1)},async selectCurrency(e){this.selectedCurrency=e},async selectCurrencyById(e){this.selectedCurrency=this.currencies.find((s=>s.id===e))||null}}}),W={class:"pb-10"},Y={class:"w-full"},G={key:0,class:"space-y-4"},H={class:"flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:justify-start sm:text-left"},J={class:"space-y-2"},K={class:"flex flex-col gap-4 pt-4 sm:ms-auto sm:flex-row sm:items-center sm:justify-end sm:pt-0"},Q={class:"flex w-full items-center justify-center sm:w-[160px] sm:justify-end"},R={class:"ptablet:hidden divide-muted-200 dark:divide-muted-700 flex items-center justify-center divide-x"},Z={class:"flex flex-col gap-1 px-4 text-center"},ee={class:"flex flex-col gap-1 px-4 text-center"},se={class:"flex flex-col gap-1 px-4 text-center"},te={class:"ptablet:hidden flex w-full items-center justify-center gap-1 py-3 sm:w-[160px] sm:justify-end sm:py-0"},le={class:"sm:ms-6"},ae={key:1},re=x("img",{class:"block dark:hidden",src:D,alt:"Placeholder image"},null,-1),ne=x("img",{class:"hidden dark:block",src:q,alt:"Placeholder image"},null,-1),ce={key:2,class:"space-y-4"},ue={class:"flex flex-col items-center justify-start gap-3 text-center sm:flex-row sm:justify-start sm:text-left"},ie=["src"],oe={class:"flex flex-col gap-4 pt-4 sm:ms-auto sm:flex-row sm:items-center sm:justify-end sm:pt-0"},de={class:"divide-muted-200 dark:divide-muted-700 flex items-center justify-center divide-x"},me={class:"flex flex-col gap-1 px-4 text-center"},fe={class:"flex w-full items-center justify-between p-4 md:p-6"},pe={class:"font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"},xe={class:"p-4 md:p-6"},ve={class:"mx-auto w-full text-start"},he={class:"font-alt text-muted-500 dark:text-muted-400 text-sm leading-5 mb-3"},ye={class:"space-y-5"},ge={class:"p-4 md:p-6"},we={class:"flex gap-x-2"},Ce={class:"flex w-full items-center justify-between p-4 md:p-6"},ke={class:"font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"},be={class:"p-4 md:p-6"},je={class:"mx-auto w-full text-center"},_e={class:"font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"},Be={class:"font-alt text-muted-500 dark:text-muted-400 text-sm leading-5 mb-3"},$e={class:"p-4 md:p-6"},Fe={class:"flex gap-x-2"},Ve=t({__name:"index",setup(s){const{toast:t}=l(),D=a(),q=r(!0),{createForexCurrency:Ve,deleteForexCurrency:Ie}=U(),Le=O(),Te=A(),Pe=n((()=>Le.currencies)),Se=n((()=>Te.currencies));c((async()=>{q.value=!0,0===Le.currencies.length&&await Le.fetchForexCurrencies(),0===Te.currencies.length&&await Te.fetchCurrencies(),q.value=!1}));const ze=r(""),Ue=r(10),Ae=n((()=>parseInt(D.query.page??"1"))),De=r(!1),qe=n((()=>Pe.value&&Array.isArray(Pe.value)?Pe.value.filter((e=>e.currency.toLowerCase().includes(ze.value.toLowerCase()))):[])),Ee=n((()=>{const e=(Ae.value-1)*Ue.value,s=e+Ue.value;return qe.value.slice(e,s)})),Ne=E.object({currency:E.string().nonempty("Title cannot be empty"),status:E.boolean()}),Me=n((()=>({currency:"",status:!0}))),{handleSubmit:Xe,isSubmitting:Oe,meta:We,resetForm:Ye}=N({validationSchema:M(Ne),initialValues:Me}),Ge=Xe((async e=>{try{const s=await Ve(e.currency,e.status);t.response(s),"success"===s.status&&(await Le.fetchForexCurrencies(),Ye())}catch(s){t.danger(s)}De.value=!1})),He=r(!1),Je=r(!1),Ke=r(null);return(s,l)=>{const a=e,r=b,n=j,c=_,U=B,A=$,D=F,E=V,N=L,M=T,O=P,Ve=I,Te=S,qe=z,Ne=m;return f(),u("div",W,[i(O,null,{left:o((()=>[i(a,{modelValue:d(ze),"onUpdate:modelValue":l[0]||(l[0]=e=>p(ze)?ze.value=e:null),icon:"lucide:search",placeholder:"Filter currencies...",classes:{wrapper:"w-full sm:w-auto"}},null,8,["modelValue"])])),right:o((()=>[x("div",Y,[i(n,{color:"success",class:"w-full",onClick:l[1]||(l[1]=e=>De.value=!0),flavor:"outline"},{default:o((()=>[i(r,{name:"line-md:plus",class:"h-4 w-4"}),x("span",null,v(s.$t("Create Currency")),1)])),_:1})])])),default:o((()=>[x("div",null,[d(q)?(f(),u("div",G,[(f(),u(h,null,y(3,(e=>i(U,{key:e,class:"flex flex-col p-5 sm:flex-row sm:items-center"},{default:o((()=>[x("div",H,[i(c,{class:"h-16 w-16 shrink-0 rounded-full"}),x("div",J,[i(c,{class:"mx-auto h-3 w-[100px] rounded-lg sm:mx-0"}),i(c,{class:"mx-auto h-3 w-[75px] rounded-lg sm:mx-0"})])]),x("div",K,[x("div",Q,[i(c,{class:"h-6 w-24 rounded-full"})]),x("div",R,[x("div",Z,[i(c,{class:"h-3 w-16 rounded-lg"})]),x("div",ee,[i(c,{class:"h-3 w-16 rounded-lg"})]),x("div",se,[i(c,{class:"h-3 w-16 rounded-lg"})])]),x("div",te,[i(c,{class:"h-8 w-8 shrink-0 rounded-full"}),i(c,{class:"h-8 w-8 shrink-0 rounded-full"}),i(c,{class:"hidden h-3 w-12 rounded-full sm:block"})]),x("div",le,[i(c,{class:"mx-auto h-8 w-40 rounded-lg sm:mx-0 sm:w-20"})])])])),_:2},1024))),64))])):d(q)||0!==d(Ee).length?(f(),u("div",ce,[i(g,{"enter-active-class":"transform-gpu","enter-from-class":"opacity-0 -translate-x-full","enter-to-class":"opacity-100 translate-x-0","leave-active-class":"absolute transform-gpu","leave-from-class":"opacity-100 translate-x-0","leave-to-class":"opacity-0 -translate-x-full"},{default:o((()=>[(f(!0),u(h,null,y(d(Ee),(e=>(f(),w(U,{key:e.id,class:"flex flex-col px-4 py-3 sm:flex-row sm:items-center"},{default:o((()=>[x("div",ue,[x("img",{src:`/img/crypto/${e.currency.toLowerCase()}.png`,class:"h-12 w-12 shrink-0 rounded-lg"},null,8,ie),i(D,{tag:"h3",size:"sm",weight:"medium",class:"text-muted-800 dark:text-muted-100"},{default:o((()=>[C(v(e.currency),1)])),_:2},1024)]),x("div",oe,[x("div",de,[x("div",me,[i(D,{tag:"h3",size:"md",weight:"semibold",class:"text-muted-800 dark:text-muted-100"},{default:o((()=>[x("span",null,v(d(Se).find((s=>s.currency===e.currency))?.price),1)])),_:2},1024),i(E,{lead:"none",weight:"semibold",class:"text-muted-400 !text-[0.65rem] uppercase"},{default:o((()=>[x("span",null,v(s.$t("Price")),1)])),_:1})]),x("div",null,[i(N,{onClick:s=>function(e){Ke.value=e,He.value=!0}(e),color:"danger",flavor:"outline","data-nui-tooltip":"Delete Currency",condensed:"",class:"ml-4"},{default:o((()=>[i(r,{name:"line-md:close",class:"h-4 w-4"})])),_:2},1032,["onClick"])])])])])),_:2},1024)))),128))])),_:1}),x("div",null,[d(Pe).length>d(Ue)?(f(),w(M,{key:0,"total-items":d(Pe).length,"item-per-page":d(Ue),"current-page":d(Ae),shape:"full"},null,8,["total-items","item-per-page","current-page"])):k("",!0)])])):(f(),u("div",ae,[i(A,{title:d(ze)&&""!==d(ze)?"No matching results":"No results",subtitle:d(ze)&&""!==d(ze)?"Looks like we couldn't find any matching results for your search terms. Try other search terms.":"Looks like we don't have any data here yet."},{image:o((()=>[re,ne])),_:1},8,["title","subtitle"])]))])])),_:1}),i(Ne,{open:d(De),size:"sm",onClose:l[4]||(l[4]=e=>De.value=!1)},{header:o((()=>[x("div",fe,[x("h3",pe,v(s.$t("Create New Currency")),1),i(Ve,{onClick:l[2]||(l[2]=e=>De.value=!1)})])])),footer:o((()=>[x("div",ge,[x("div",we,[i(n,{onClick:l[3]||(l[3]=e=>De.value=!1)},{default:o((()=>[C(v(s.$t("Cancel")),1)])),_:1}),i(n,{color:"primary",flavor:"solid",onClick:d(Ge),disabled:d(Oe),loading:d(Oe)},{default:o((()=>[C(v(s.$t("Create")),1)])),_:1},8,["onClick","disabled","loading"])])])])),default:o((()=>[x("div",xe,[x("div",ve,[x("p",he,v(s.$t("Please provide a unique currency and timeframe for the new currency"))+". ",1),x("div",ye,[i(d(X),{name:"currency"},{default:o((({field:e,errorMessage:s,handleChange:t,handleBlur:l})=>[i(Te,{"model-value":e.value,error:s,disabled:d(Oe),items:d(Se).map((e=>e.currency)),placeholder:"Please select a currency",label:"Currency",shape:"rounded","onUpdate:modelValue":t,onBlur:l},null,8,["model-value","error","disabled","items","onUpdate:modelValue","onBlur"])])),_:1}),i(d(X),{name:"status"},{default:o((({field:e,errorMessage:s,handleChange:t,handleBlur:l})=>[i(qe,{modelValue:e.value,"onUpdate:modelValue":[s=>e.value=s,t],error:s,disabled:d(Oe),label:"Status",color:"success",onBlur:l},null,8,["modelValue","onUpdate:modelValue","error","disabled","onBlur"])])),_:1})])])])])),_:1},8,["open"]),i(Ne,{open:d(He),size:"sm",onClose:l[8]||(l[8]=e=>He.value=!1)},{header:o((()=>[x("div",Ce,[x("h3",ke,v(s.$t("Delete"))+" "+v(s.$t("Forex Currency")),1),i(Ve,{onClick:l[5]||(l[5]=e=>He.value=!1)})])])),footer:o((()=>[x("div",$e,[x("div",Fe,[i(n,{onClick:l[6]||(l[6]=e=>He.value=!1)},{default:o((()=>[C(v(s.$t("Cancel")),1)])),_:1}),i(n,{color:"danger",flavor:"solid",onClick:l[7]||(l[7]=e=>async function(){Je.value=!0;try{const e=await Ie(Ke.value?.id);t.response(e),"success"===e.status&&Le.removeCurrency(Ke.value?.id)}catch(e){t.danger(e)}He.value=!1,Je.value=!1,Ke.value=null}()),disabled:d(Je),loading:d(Je)},{default:o((()=>[C(v(s.$t("Delete")),1)])),_:1},8,["disabled","loading"])])])])),default:o((()=>[x("div",be,[x("div",je,[x("h3",_e,v(s.$t("Are you sure?")),1),x("p",Be,v(s.$t("Do you really want to delete this"))+" "+v(s.$t("currency"))+" "+v(s.$t("This process cannot be undone"))+". ",1)])])])),_:1},8,["open"])])}}});export{Ve as default};
