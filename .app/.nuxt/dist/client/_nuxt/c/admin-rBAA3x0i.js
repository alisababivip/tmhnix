import{d as t}from"../e/entry-8qgg5CL-.js";import{u as s}from"./useSupport-ffNMpQhG.js";const e=t({id:"adminSupport",state:()=>({tickets:[],currentTicket:null,chat:null,loading:!1}),getters:{ticketCount:t=>t.tickets.length},actions:{async fetchTickets(){this.loading=!0;const{getTicketsAdmin:t}=s(),e=await t();"success"===e.status&&(this.tickets=e.data.result),this.loading=!1},async fetchTicket(t){const{getTicketAdmin:e}=s(),a=await e(t);"success"===a.status&&(this.currentTicket=a.data.result)},async fetchChat(t){const{getMessages:e}=s(),a=await e(t);"success"===a.status&&(this.chat=a.data.result)}}});export{e as u};
