import{d as t}from"../e/entry-8qgg5CL-.js";import{u as e}from"./useFaq-K_svOq1B.js";const s=t({id:"faq-categories",state:()=>({categories:[],loading:!1}),actions:{async fetchCategories(){this.loading=!0;try{const{getCategories:t}=e(),s=await t();this.categories=s.data.result}catch(t){console.error("Error fetching user categories:",t)}this.loading=!1}}});export{s as u};
