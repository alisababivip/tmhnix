import{d as t}from"../e/entry-8qgg5CL-.js";import{u as s}from"./useInvestment-ZaAPyLmc.js";const e=t({id:"investment",state:()=>({investments:[],userInvestment:null,loading:!1}),getters:{count:t=>t.investments.length},actions:{async fetchInvestments(){this.loading=!0;const{getInvestments:t}=s(),e=await t();"success"===e.status&&(this.investments=e.data.result),this.loading=!1},async fetchUserInvestment(){const{getUserInvestment:t}=s(),e=await t();"success"===e.status&&(this.userInvestment=e.data.result??null)},async createInvestment(t,e){const{createInvestment:n}=s(),a=await n(t,e);"success"===a.status&&this.investments.push(a.data.result)},async cancelInvestment(t){const{cancelInvestment:e}=s();try{const s=await e(t);return this.investments.map((s=>{s.uuid===t&&(s.status="CANCELLED")})),s}catch(n){return n}},async deleteInvestment(t){const{deleteInvestment:e}=s();"success"===(await e(t)).status&&(this.investments=this.investments.filter((s=>s.id!==t)))}}});export{e as u};
