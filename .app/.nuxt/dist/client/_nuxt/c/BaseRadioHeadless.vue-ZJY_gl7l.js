import{a as e,i as a,r as s,o as l,b as t,u as o,t as i,k as u,f as d,l as r,a9 as n,m as p,p as m,j as f,aa as v,ab as c}from"../e/entry-8qgg5CL-.js";import{u as b}from"./input-id-wZ-Ta08j.js";const y={class:"group/nui-radio-headless relative"},k=["for"],x={class:"relative"},V=["id","value","name"],_=e({inheritAttrs:!1,__name:"BaseRadioHeadless",props:{id:{default:void 0},value:{default:void 0},modelValue:{default:void 0},name:{default:void 0},label:{default:void 0}},emits:["update:modelValue"],setup(e,{expose:_,emit:h}){const j=e,g=a(j,"modelValue",h,{passive:!0}),R=s();_({el:R});const $=b((()=>j.id));return(e,a)=>(l(),t("div",y,[e.label?(l(),t("label",{key:0,for:o($),class:"text-muted-400 mb-1 inline-block cursor-pointer select-none font-sans text-sm"},i(j.label),9,k)):u("",!0),d("div",x,[r(d("input",p({id:o($),ref_key:"inputRef",ref:R,"onUpdate:modelValue":a[0]||(a[0]=e=>m(g)?g.value=e:null)},e.$attrs,{type:"radio",value:j.value,name:j.name,class:"peer absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"}),null,16,V),[[n,o(g)]]),f(e.$slots,"default",v(c({value:o(g)})))])]))}});export{_};
