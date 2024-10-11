import{a as e,r as t,z as a,ac as r,ad as s,c as l,S as c,E as o,o as n,O as d,w as i,u,e as m,t as f,q as p,f as x,b as g,k as y,F as b,B as h,x as v,X as k,Y as _}from"../e/entry-8qgg5CL-.js";import{_ as $}from"./BaseTag.vue-NMkN1Uk8.js";import{_ as T}from"./BaseAvatar.vue-XYSxxLJP.js";import{_ as w}from"./TairoContentWrapper.vue-JqAKR4O_.js";import{u as D}from"./useWallet-8iHzU2hV.js";import{f as E,a as A}from"./strings-rQgUKePI.js";const B={class:"flex items-center justify-between mb-6"},R={class:"text-2xl font-semibold text-gray-800 dark:text-gray-200"},C={class:"flex items-center xs:flex-col sm:flex-row gap-2"},I={class:"grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-gray-700 dark:text-gray-400"},M={class:"flex flex-col"},N={class:"text-sm font-semibold text-gray-600 dark:text-gray-200"},P={key:0,class:"flex flex-col"},j={class:"text-sm font-semibold text-gray-600 dark:text-gray-200"},O={key:1,class:"flex flex-col"},S={class:"text-sm font-semibold text-gray-600 dark:text-gray-200"},F={class:"p-4 border rounded-md mb-6 text-gray-700 dark:border-gray-600 dark:text-gray-400"},H={class:"text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200"},z={class:"mb-4"},L={key:1},W={class:"text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200"},X=["href"],G={key:2},U={class:"text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200"},Y={class:"grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-gray-700 dark:text-gray-400"},q={class:"p-4 border rounded-md dark:border-gray-600"},J={class:"flex jsutify-start items-center"},K={class:"font-bold"},Z={class:"p-4 border rounded-md dark:border-gray-600"},Q={class:"text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200"},V={key:0,class:"p-4 border rounded-md dark:border-gray-600 mb-6"},ee={class:"text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200"},te={class:"grid gap-5 grid-cols-3"},ae={class:"text-sm font-semibold text-gray-600 dark:text-gray-200"},re={key:0},se=["src"],le={key:1,class:"p-4 border rounded-md dark:border-gray-600 mb-6"},ce={class:"text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200"},oe=["innerHTML"],ne=e({__name:"index",props:{flutter:{type:Boolean,default:!1}},setup(e){const ne=t(null),{getTransaction:de}=D(),ie=a(),ue=r(),{toast:me}=s(),fe=l((()=>ie.params.uuid));c(),o((async()=>{try{const e=await de(fe.value);ne.value=e.data.result}catch(e){ue.back(),me.danger(e)}}));const pe=l((()=>{if(!ne.value?.metadata?.chain)return null;switch(ne.value.metadata.chain){case"ETH":return`https://etherscan.io/tx/${ne.value.reference_id}`;case"BTC":return`https://www.blockchain.com/btc/tx/${ne.value.reference_id}`;case"LTC":return`https://blockchair.com/litecoin/transaction/${ne.value.reference_id}`;case"BCH":return`https://blockchair.com/bitcoin-cash/transaction/${ne.value.reference_id}`;case"XRP":return`https://xrpscan.com/tx/${ne.value.reference_id}`;case"XLM":return`https://stellarscan.io/transaction/${ne.value.reference_id}`;case"TRX":return`https://tronscan.org/#/transaction/${ne.value.reference_id}`;case"DOGE":return`https://dogechain.info/tx/${ne.value.reference_id}`;case"DASH":return`https://chainz.cryptoid.info/dash/tx.dws?${ne.value.reference_id}.htm`;case"ZEC":return`https://chainz.cryptoid.info/zec/tx.dws?${ne.value.reference_id}.htm`;case"XMR":return`https://xmrchain.net/tx/${ne.value.reference_id}`;case"BSC":case"BNB":return`https://bscscan.com/tx/${ne.value.reference_id}`;case"SOL":return`https://explorer.solana.com/tx/${ne.value.reference_id}`;case"ADA":return`https://explorer.cardano.org/en/transaction?id=${ne.value.reference_id}`;case"DOT":return`https://polkascan.io/polkadot/transaction/${ne.value.reference_id}`;case"KSM":return`https://polkascan.io/kusama/transaction/${ne.value.reference_id}`;default:return null}})),xe=["DEPOSIT","WITHDRAW","OUTGOING_TRANSFER","INCOMING_TRANSFER","PAYMENT","REFUND"],{transactionItemDetails:ge,statusMap:ye}=s();return(e,t)=>{const a=v,r=k,s=$,l=T,c=_,o=w;return n(),d(o,{class:"mb-20"},{right:i((()=>[m(r,{onClick:t[0]||(t[0]=e=>u(ue).back()),color:"muted"},{default:i((()=>[m(a,{name:"line-md:chevron-left",class:"mr-2"}),p(" "+f(e.$t("Back")),1)])),_:1})])),default:i((()=>[m(c,{class:"px-8 pt-8 pb-4 mx-auto"},{default:i((()=>[x("div",B,[x("h1",R,f(e.$t("Transaction Details")),1),x("div",C,[m(s,{shape:"rounded",color:u(ye)[u(ne)?.status]?.color,flavor:"pastel",class:"dark:bg-opacity-80"},{default:i((()=>[p(f(u(ye)[u(ne)?.status]?.title),1)])),_:1},8,["color"]),m(s,{shape:"rounded",color:u(ge)[u(ne)?.type]?.color,class:"dark:bg-opacity-80"},{default:i((()=>[p(f(u(ge)[u(ne)?.type]?.title),1)])),_:1},8,["color"])])]),x("div",I,[x("div",M,[x("label",N,f(e.$t("Total Amount"))+":",1),p(" "+f("FIAT"===u(ne)?.wallet?.type?("formatPrice"in e?e.formatPrice:u(E))(u(ne)?.amount,u(ne)?.wallet?.currency):u(ne)?.amount+" "+u(ne)?.wallet?.currency),1)]),xe.includes(u(ne)?.type)?(n(),g("div",P,[x("label",j,f(e.$t("Total Fee"))+":",1),p(" "+f("FIAT"===u(ne)?.wallet?.type?("formatPrice"in e?e.formatPrice:u(E))(u(ne)?.fee??0,u(ne)?.wallet?.currency):(u(ne)?.fee??0)+" "+u(ne)?.wallet?.currency),1)])):y("",!0),u(ne)?.metadata?.method?(n(),g("div",O,[x("label",S,f(e.$t("Payment Method"))+":",1),p(" "+f(u(ne)?.metadata?.method),1)])):y("",!0)]),x("div",F,[u(ne)?.description?(n(),g(b,{key:0},[x("h2",H,f(e.$t("Description"))+": ",1),x("p",z,f(u(ne)?.description),1)],64)):y("",!0),u(pe)?(n(),g("div",L,[x("h2",W,f(e.$t("Blockchain Transaction"))+": ",1),x("a",{href:u(pe),target:"_blank",rel:"noopener noreferrer",class:"text-blue-500 hover:underline"},f(u(ne)?.reference_id),9,X)])):(n(),g("div",G,[x("h2",U,f(e.$t("Transaction ID"))+": ",1),x("p",null,f(u(ne)?.uuid),1)]))]),x("div",Y,[x("div",q,[x("div",J,[m(l,{src:u(ne)?.user.avatar,size:"lg",shape:"curved",class:"mr-2"},null,8,["src"]),x("div",null,[x("div",K,f(u(ne)?.user.first_name)+" "+f(u(ne)?.user.last_name),1),x("div",null,f(u(ne)?.user.uuid),1)])])]),x("div",Z,[x("h2",Q,f(e.$t("Date"))+": ",1),x("p",null,f(("formatDate"in e?e.formatDate:u(A))(u(ne)?.created_at)),1)])]),u(ne)?.metadata?.custom_data?(n(),g("div",V,[x("h2",ee,f(e.$t("Withdraw Details"))+": ",1),x("div",te,[(n(!0),g(b,null,h(u(ne)?.metadata?.custom_data,((e,t)=>(n(),g("div",{key:t},[x("label",ae,f(e.title)+": ",1),"input"===e.type||"textarea"===e.type?(n(),g("p",re,f(e.value),1)):"file upload"===e.type?(n(),g("img",{key:1,src:e.value,height:"180"},null,8,se)):y("",!0)])))),128))])])):y("",!0),u(ne)?.metadata?.note&&"REJECTED"===u(ne)?.status?(n(),g("div",le,[x("h2",ce,f(e.$t("Note"))+": ",1),x("p",{innerHTML:u(ne)?.metadata?.note?.replace(/\n/g,"<br />")},null,8,oe)])):y("",!0)])),_:1})])),_:1})}}});export{ne as _};
