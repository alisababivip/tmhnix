import{d as t}from"../e/entry-8qgg5CL-.js";import{u as s}from"./useSupport-ffNMpQhG.js";const c=t({id:"userSupport",state:()=>({tickets:[],currentTicket:null,chat:null,loading:!1}),getters:{ticketCount:t=>t.tickets.length},actions:{async fetchTickets(){this.loading=!0;const{getTickets:t}=s();try{const s=await t();"success"===s.status&&(this.tickets=s.data.result)}catch(c){return c}this.loading=!1},async fetchTicket(t){const{getTicket:c}=s();try{const s=await c(t);"success"===s.status&&(this.currentTicket=s.data.result)}catch(e){return e}},async fetchChat(t){const{getMessages:c}=s();try{const s=await c(t);"success"===s.status&&(this.chat=s.data.result)}catch(e){return e}}}});export{c as u};
