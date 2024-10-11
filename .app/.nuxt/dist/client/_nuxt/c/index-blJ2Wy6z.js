import{_ as e}from"./marketplace.vue-_Ddabicy.js";import{d as s,a as t,r as a,c as l,E as r,b as i,f as o,n,e as d,w as c,u,F as p,B as m,k as g,_ as v,g as h,X as f,o as x,O as w,t as y,x as b,C as _,Y as k,c7 as j,c5 as C,q as E,y as O}from"../e/entry-8qgg5CL-.js";import{_ as S}from"./BaseButtonAction.vue-hzSHyI6o.js";import{_ as z}from"./Faqs.vue-my_shOF5.js";import{u as T}from"./useEcommerce-2nLxpPKu.js";import{N as q,S as A,C as B}from"./carousel-tMbU9gzZ.js";import"./client-only-nGApKnAn.js";import"./useFaq-K_svOq1B.js";const F=s({id:"userEcommerceCategories",state:()=>({categories:[],loading:!1}),getters:{getCategoryById:e=>s=>e.categories.find((e=>e.id===s))},actions:{async fetchCategories(){this.loading=!0;try{const{getUserCategories:e}=T(),s=await e();this.categories=s.data.result}catch(e){console.error("Error fetching user categories:",e)}this.loading=!1}}}),$=e=>(j("data-v-b20eb093"),e=e(),C(),e),L={class:"ltablet:col-span-8 col-span-12 lg:col-span-8"},I={class:"flex flex-col gap-6"},M={class:"col-span-12"},N={class:"bg-primary-800 flex flex-col items-center rounded-2xl p-4 sm:flex-row w-full mb-8"},D={class:"mt-6 grow sm:mt-0"},G={class:"pb-4 text-center sm:pb-0 sm:text-left"},K=$((()=>o("span",null,[E(" Welcome to Our Online Store "),o("span",{class:"text-3xl"},"🎉")],-1))),R=$((()=>o("span",null," Explore our wide selection of products and find what you love. ",-1))),U={class:"relative"},V={class:"mb-14"},W={class:"flex items-center justify-between"},X=$((()=>o("span",null," Shop by Category",-1))),Y=["src","alt"],H=$((()=>o("div",{class:"bg-muted-900 absolute inset-0 z-10 h-full w-full opacity-0 transition-opacity duration-300 group-hover:opacity-50"},null,-1))),J={class:"absolute inset-0 z-20 flex h-full w-full flex-col justify-between p-6"},P={class:"flex items-center justify-between"},Q={class:"-translate-y-2 font-sans tracking-wider text-white opacity-0 transition-all delay-100 duration-300 group-hover:translate-y-0 group-hover:opacity-100"},Z={class:"flex items-center justify-between"},ee=$((()=>o("h3",{class:"translate-y-2 font-sans text-sm text-white underline underline-offset-4 opacity-0 transition-all delay-300 duration-300 group-hover:translate-y-0 group-hover:opacity-100"}," View products ",-1))),se={class:"grid gap-x-3 gap-y-6 sm:grid-cols-3"},te={class:"ltablet:h-48 bg-muted-100 dark:bg-muted-900 relative mb-3 h-48 w-full rounded-xl sm:h-32 md:h-48"},ae=["src","alt"],le={class:"mb-2"},re={class:"flex items-center justify-between"},ie={class:"divide-muted-200 dark:divide-muted-700 flex items-center divide-x"},oe={class:"pe-4"},ne={class:"text-muted-800 dark:text-muted-100 font-sans font-bold"},de={class:"flex items-center gap-1 ps-4"},ce={class:"text-muted-400 font-sans text-xs"},ue=$((()=>o("span",null,"Order",-1))),pe={key:1},me={key:0,class:"my-16 flex items-center justify-center"},ge=$((()=>o("span",null,"Load more",-1))),ve=t({__name:"index",setup(s){const t=F(),j=a(null),C=a(9),E=l((()=>t.categories.map((e=>({...e,products:e.products?e.products.map((e=>({...e,rating:e.reviews&&e.reviews.length?e.reviews.reduce(((e,s)=>e+s.rating),0)/e.reviews.length:0,reviewsCount:e.reviews?e.reviews.length:0}))):[]}))))),O=l((()=>{const e=E.value.find((e=>e.id===j.value));return e?e.products.slice(0,C.value):[]}));function T(){C.value+=9}return r((async()=>{0===t.categories.length&&await t.fetchCategories(),t.categories.length&&!j.value&&(j.value=t.categories[0].id)})),(s,t)=>{const a=e,l=v,r=h,F=b,$=_,ve=S,he=k,fe=f,xe=z;return x(),i("div",null,[o("div",L,[o("div",I,[o("div",M,[o("div",N,[o("div",{class:n(["relative w-[320px]",{"h-[170px] mb-16":s.$viewport.isLessThan("sm"),"h-[175px]":s.$viewport.isGreaterOrEquals("sm")}])},[d(a,{classes:"pointer-events-none absolute -top-6 start-3 sm:-start-5 sm:-top-8",height:"280px"})],2),o("div",D,[o("div",G,[d(l,{tag:"h1",class:"mb-2 text-white opacity-90"},{default:c((()=>[K])),_:1}),d(r,{size:"sm",class:"max-w-xs text-white opacity-70"},{default:c((()=>[R])),_:1})])])])]),o("div",U,[o("div",V,[o("div",W,[d(l,{tag:"h3",size:"xl",weight:"semibold"},{default:c((()=>[X])),_:1})]),d(u(B),{itemsToShow:3.4,slides:u(E),breakpoints:{300:{itemsToShow:1.5,snapAlign:"start"},768:{itemsToShow:2.5,snapAlign:"start"},1024:{itemsToShow:3.4,snapAlign:"start"}}},{addons:c((()=>[d(u(q))])),default:c((()=>[(x(!0),i(p,null,m(u(E),((e,s)=>(x(),w(u(A),{key:s},{default:c((()=>[d($,{class:n(["group relative flex w-full flex-col border overflow-hidden rounded-3xl cursor-pointer",{"border-primary-500":u(j)===e.id,"border-white":u(j)!==e.id}]),onClick:s=>{return t=e.id,j.value=t,void(C.value=9);var t}},{default:c((()=>[o("img",{class:"h-48 w-full object-cover object-center rounded-2xl transition-all duration-300 ease-in-out group-hover:scale-105",src:e.image||"/img/placeholder.png",alt:e.name},null,8,Y),H,o("div",J,[o("div",P,[o("h3",Q,y(e.name),1)]),o("div",Z,[ee,d(F,{name:"lucide:arrow-right",class:"h-4 w-4 translate-y-2 text-white opacity-0 transition-all delay-700 duration-300 group-hover:translate-y-0 group-hover:opacity-100"})])])])),_:2},1032,["onClick","class"])])),_:2},1024)))),128))])),_:1},8,["slides"])]),o("div",se,[u(j)?(x(!0),i(p,{key:0},m(u(O),(e=>(x(),w($,{key:e.id,to:`/user/shop/product/${e.id}-${e.name.replace(/ /g,"-")}`,class:"relative"},{default:c((()=>[d(he,{shape:"curved",class:"hover:border-primary-500 hover:shadow-muted-300/30 dark:hover:shadow-muted-900/40 p-3 hover:shadow-xl group"},{default:c((()=>[o("div",te,[o("img",{class:"absolute inset-0 h-full w-full object-cover rounded-xl border border-transparent transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:-translate-y-1",src:e.image||"/img/placeholder.png",alt:e.name},null,8,ae)]),o("div",le,[d(l,{tag:"h4",size:"sm",weight:"medium",class:"text-muted-800 dark:text-muted-100"},{default:c((()=>[o("span",null,y(e.name),1)])),_:2},1024),d(r,{size:"xs",class:"text-muted-500 dark:text-muted-400 line-clamp-1"},{default:c((()=>[o("span",null,y(e.description),1)])),_:2},1024)]),o("div",re,[o("div",ie,[o("div",oe,[o("span",ne,y(e.price)+" "+y(e.currency),1)]),o("div",de,[d(F,{name:"uiw:star-on",class:n(["h-3 w-3 text-yellow-400",0==e.rating?"grayscale":""])},null,8,["class"]),o("span",ce,y(e.rating.toFixed(1))+" ("+y(e.reviewsCount)+") ",1)])]),o("div",null,[d(ve,{shape:"curved"},{default:c((()=>[ue])),_:1})])])])),_:2},1024)])),_:2},1032,["to"])))),128)):(x(),i("p",pe,"No products available."))]),u(O).length<u(E)?.find((e=>e.id===u(j)))?.products?.length?(x(),i("div",me,[d(fe,{shape:"full",color:"default",onClick:T},{default:c((()=>[d(F,{name:"ph:dots-nine-bold",class:"h-4 w-4"}),ge])),_:1})])):g("",!0)])])]),d(xe,{category:"ECOMMERCE"})])}}}),he=O(ve,[["__scopeId","data-v-b20eb093"]]);export{he as default};
