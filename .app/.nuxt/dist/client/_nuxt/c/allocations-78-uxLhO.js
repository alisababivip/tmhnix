import{d as o}from"../e/entry-8qgg5CL-.js";import{u as t}from"./useIco-3A31FykS.js";const l=o({id:"icoAdminAllocation",state:()=>({allocations:[],loading:!1,selectedAllocation:null}),getters:{getAllocationById:o=>t=>o.allocations.find((o=>o.id===t))},actions:{async fetchIcoAllocations(){this.loading=!0;try{const{getAdminIcoAllocations:o}=t(),l=await o();this.allocations=l.data.result}catch(o){console.error("Error fetching deposit allocations:",o)}this.loading=!1},async removeAllocation(o){const t=this.allocations.findIndex((t=>t.id===o));this.allocations.splice(t,1)},async selectAllocation(o){this.selectedAllocation=o},async selectAllocationById(o){this.selectedAllocation=this.allocations.find((t=>t.id===o))||null}}});export{l as u};
