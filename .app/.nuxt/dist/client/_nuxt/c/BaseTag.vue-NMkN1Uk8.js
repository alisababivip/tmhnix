import{a,h as t,c as s,o as u,b as e,j as n,n as i,u as o}from"../e/entry-8qgg5CL-.js";const d=a({__name:"BaseTag",props:{flavor:{default:"solid"},color:{default:"default"},shape:{default:void 0},size:{default:"md"},shadow:{default:void 0}},setup(a){const d=a,l=t(),r=s((()=>d.shape??l.nui.defaultShapes?.tag)),g={solid:"nui-tag-solid",pastel:"nui-tag-pastel",outline:"nui-tag-outline"},f={straight:"",rounded:"nui-tag-rounded",smooth:"nui-tag-smooth",curved:"nui-tag-curved",full:"nui-tag-full"},h={default:"nui-tag-default",muted:"nui-tag-muted",primary:"nui-tag-primary",info:"nui-tag-info",success:"nui-tag-success",warning:"nui-tag-warning",danger:"nui-tag-danger"},m={flat:"nui-tag-shadow",hover:"nui-tag-shadow-hover"},p={sm:"nui-tag-sm",md:"nui-tag-md"},c=s((()=>["nui-tag",p[d.size],g[d.flavor],h[d.color],r.value&&f[r.value],d.shadow&&"solid"===d.flavor&&m[d.shadow]]));return(a,t)=>(u(),e("span",{class:i(o(c))},[n(a.$slots,"default")],2))}});export{d as _};
