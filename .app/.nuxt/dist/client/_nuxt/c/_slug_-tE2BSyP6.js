import{a as t,z as a,ac as s,r as e,S as l,c as o,E as r,cK as n,ad as i,b as c,u as d,O as u,w as m,n as p,ag as x,o as g,f,e as b,q as v,t as w,F as h,B as y,C as k,x as _,X as j}from"../e/entry-8qgg5CL-.js";import{_ as B}from"./BaseTag.vue-NMkN1Uk8.js";import{_ as C}from"./TairoContentWrapper.vue-JqAKR4O_.js";import{u as L}from"./blog-ktBDzU-N.js";import{_ as P}from"./magician-0Hwh6bW5.js";import"./useBlog-0Y19BpbN.js";const T={class:"relative w-full pb-20 px-2 lg:px-4 overflow-hidden"},$={class:"w-full max-w-7xl mx-auto grid grid-cols-12 md:gap-x-10 gap-y-10 pt-6 sm:pt-10"},S={class:"col-span-12 ltablet:col-span-5 ltablet:col-start-2 lg:col-span-5"},z=["src"],D={class:"col-span-12 ltablet:col-span-5 lg:col-span-5 ltablet:col-start-7 lg:col-start-7"},H={class:"h-full flex items-center"},M={class:"w-full max-w-md ptablet:mx-auto"},q={class:"mb-4"},A={class:"flex flex-row flex-wrap items-start gap-2"},E={class:"font-sans text-muted-800 dark:text-white font-bold text-3xl"},F={class:"font-sans text-sm text-muted-500 dark:text-muted-400 my-4"},I={class:"flex items-center justify-between"},K={class:"flex items-center gap-2"},O=["src"],U={class:"font-sans text-sm"},W={class:"text-muted-800 dark:text-muted-100 font-medium leading-none hover:text-indigo-600 transition duration-500 ease-in-out"},X={class:"text-muted-600 dark:text-muted-400 text-xs"},G={class:"font-sans text-xs sm:text-sm text-muted-400"},J=f("span",{class:"pr-2"},"—",-1),N={class:"px-16 py-10 bg-white dark:bg-muted-800 -mx-16"},Q={class:"max-w-2xl mx-auto"},R=["innerHTML"],V={class:"py-10 mt-10 border-t border-muted-200 dark:border-muted-700/60"},Y={class:"flex flex-row flex-wrap items-start gap-4 lg:gap-2 mt-2"},Z={class:"pb-16"},tt=f("img",{src:P,class:"slow-bounce",alt:"Placeholder image"},null,-1),at=t({__name:"[slug]",setup(t){const P=a(),at=s(),st=P.params.slug,et=L(),lt=e(null),ot=l(),rt=o((()=>ot.getProfile));r((async()=>{ot.isLoggedIn&&n("default"),0===et.posts.length&&await et.fetchPosts(),lt.value=et.posts.find((t=>t.slug===st))}));const nt=o((()=>new Date(lt.value?.created_at).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}))),{time_since:it}=i();return(t,a)=>{const s=k,e=B,l=_,o=C,r=j,n=x;return g(),c("div",{class:p({"p-10 pt-20":!d(rt)})},[d(lt)?(g(),u(o,{key:0},{default:m((()=>[f("div",T,[f("div",$,[f("div",S,[f("img",{src:d(lt)?.image||"/img/illustrations/dashboards/writer/post-1.svg",alt:"featured image",class:"block max-w-full w-full md:w-[540px] md:h-[447px] ltablet:w-[459px] ltablet:h-[380px] object-cover rounded-2xl mx-auto"},null,8,z)]),f("div",D,[f("div",H,[f("div",M,[f("div",q,[f("div",A,[b(s,{to:`/blog/categories/${d(lt)?.category?.slug}`,class:"inline-block font-sans text-xs capitalize text-white py-1 px-3 rounded-full bg-primary-500 shadow-lg shadow-primary-500/20"},{default:m((()=>[v(w(d(lt)?.category?.name),1)])),_:1},8,["to"])])]),f("h1",E,w(d(lt)?.title),1),f("p",F,w(d(lt)?.description),1),f("div",I,[f("div",K,[f("img",{src:d(lt)?.author.user.avatar||"/img/placeholder.png",alt:"Author",class:"sm:w-12 sm:h-12 w-10 h-10 rounded-full"},null,8,O),f("div",U,[f("span",W,w(d(lt)?.author.user.first_name)+" "+w(d(lt)?.author.user.last_name),1),f("p",X,w(d(nt)),1)])]),f("div",G,[J,f("span",null,w(d(it)(d(lt)?.created_at)),1)])])])])])])]),f("section",N,[f("div",Q,[f("div",{class:"post-body",innerHTML:d(lt)?.content},null,8,R),f("div",V,[f("div",Y,[(g(!0),c(h,null,y(d(lt)?.post_tag,(t=>(g(),u(s,{key:t.id,to:`/blog/tags/${t.tag.slug}`},{default:m((()=>[b(e,{shape:"rounded"},{default:m((()=>[v(w(t.tag.name),1)])),_:2},1024)])),_:2},1032,["to"])))),128))])]),f("div",Z,[f("a",{class:"flex items-center gap-2 font-sans text-sm no-underline text-primary-500 cursor-pointer",onClick:a[0]||(a[0]=t=>d(at).back())},[b(l,{name:"lucide:arrow-left"}),f("span",null,w(t.$t("Back")),1)])])])])])),_:1})):(g(),u(n,{key:1,title:"Post not found",subtitle:"Looks like the post you're looking for doesn't exist.",class:"h-[calc(100vh_-_200px)]"},{image:m((()=>[tt])),default:m((()=>[b(r,{onClick:a[1]||(a[1]=t=>d(at).back()),shape:"rounded",color:"primary",flavor:"outline",class:"mt-8"},{default:m((()=>[b(l,{name:"lucide:arrow-left"}),f("span",null,w(t.$t("Back")),1)])),_:1})])),_:1}))],2)}}});export{at as default};
