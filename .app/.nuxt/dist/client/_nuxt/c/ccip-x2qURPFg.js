import{d7 as e,d8 as a,d9 as t,da as r,db as s,dc as n,dd as o,de as d,df as c,dg as l,dh as u}from"../e/entry-8qgg5CL-.js";class i extends e{constructor({callbackSelector:e,cause:t,data:r,extraData:s,sender:n,urls:o}){super(t.shortMessage||"An error occurred while fetching for an offchain result.",{cause:t,metaMessages:[...t.metaMessages||[],t.metaMessages?.length?"":[],"Offchain Gateway Call:",o&&["  Gateway URL(s):",...o.map((e=>`    ${a(e)}`))],`  Sender: ${n}`,`  Data: ${r}`,`  Callback selector: ${e}`,`  Extra data: ${s}`].flat()}),Object.defineProperty(this,"name",{enumerable:!0,configurable:!0,writable:!0,value:"OffchainLookupError"})}}class f extends e{constructor({result:e,url:r}){super("Offchain gateway response is malformed. Response data must be a hex value.",{metaMessages:[`Gateway URL: ${a(r)}`,`Response: ${t(e)}`]}),Object.defineProperty(this,"name",{enumerable:!0,configurable:!0,writable:!0,value:"OffchainLookupResponseMalformedError"})}}class b extends e{constructor({sender:e,to:a}){super("Reverted sender address does not match target contract address (`to`).",{metaMessages:[`Contract address: ${a}`,`OffchainLookup sender address: ${e}`]}),Object.defineProperty(this,"name",{enumerable:!0,configurable:!0,writable:!0,value:"OffchainLookupSenderMismatchError"})}}const h="0x556f1830",p={name:"OffchainLookup",type:"error",inputs:[{name:"sender",type:"address"},{name:"urls",type:"string[]"},{name:"callData",type:"bytes"},{name:"callbackFunction",type:"bytes4"},{name:"extraData",type:"bytes"}]};async function m(e,{blockNumber:a,blockTag:t,data:l,to:u}){const{args:f}=n({data:l,abi:[p]}),[h,m,w,g,k]=f;try{if(!function(e,a){if(!r(e))throw new s({address:e});if(!r(a))throw new s({address:a});return e.toLowerCase()===a.toLowerCase()}(u,h))throw new b({sender:h,to:u});const n=await y({data:w,sender:h,urls:m}),{data:l}=await c(e,{blockNumber:a,blockTag:t,data:d([g,o([{type:"bytes"},{type:"bytes"}],[n,k])]),to:u});return l}catch(O){throw new i({callbackSelector:g,cause:O,data:l,extraData:k,sender:h,urls:m})}}async function y({data:e,sender:a,urls:r}){let s=new Error("An unknown error occurred.");for(let o=0;o<r.length;o++){const d=r[o],c=d.includes("{data}")?"GET":"POST",i="POST"===c?{data:e,sender:a}:void 0;try{const r=await fetch(d.replace("{sender}",a).replace("{data}",e),{body:JSON.stringify(i),method:c});let n;if(n=r.headers.get("Content-Type")?.startsWith("application/json")?(await r.json()).data:await r.text(),!r.ok){s=new l({body:i,details:n?.error?t(n.error):r.statusText,headers:r.headers,status:r.status,url:d});continue}if(!u(n)){s=new f({result:n,url:d});continue}return n}catch(n){s=new l({body:i,details:n.message,url:d})}}throw s}export{y as ccipFetch,m as offchainLookup,p as offchainLookupAbiItem,h as offchainLookupSignature};
