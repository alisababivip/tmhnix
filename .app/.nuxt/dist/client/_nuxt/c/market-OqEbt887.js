import{d as t}from"../e/entry-8qgg5CL-.js";import{u as s}from"./useEcosystem-9eBUNbsT.js";const e=t("ecoMarket",{state:()=>({markets:[],selected:[],selectedMarket:null,loading:!0,orders:[],watchlists:[],ordersNextPageState:null}),getters:{items:t=>t.markets},actions:{async fetchWatchlists(){this.loading=!0;const{getWatchlists:t}=s();try{const s=await t();this.watchlists=s.data.result}catch(e){console.log(e)}this.loading=!1},updateItem(t,s){t.priceStatus=s.priceStatus,t.changeStatus=s.changeStatus,t.price=s.price,t.change=s.change,t.baseVolume=s.baseVolume,t.quoteVolume=s.quoteVolume},appendMarketData(t){t.forEach((t=>{const s=this.markets.find((s=>s.symbol===t.symbol));s&&this.updateItem(s,t);const e=this.watchlists.find((s=>s.symbol===t.symbol));e&&this.updateItem(e,t)}))},async fetchMarkets(){this.loading=!0;const{getMarkets:t}=s(),e=await t();this.markets=e.data.result,this.loading=!1},async fetchOrders(t){this.loading=!0;const{getOrders:e}=s();try{const s=await e(t);"success"===s.status&&(this.orders=s.data.result)}catch(a){console.log(a)}this.loading=!1}}});export{e as u};
