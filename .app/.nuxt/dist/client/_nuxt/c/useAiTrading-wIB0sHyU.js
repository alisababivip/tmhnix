import{Z as a}from"../e/entry-8qgg5CL-.js";function n(){return{...function(){const n=a().public.apiPath;return{getAITradingDurations:async function(){return await $fetch(n+"/api/admin/ai-trading/durations",{credentials:"include",headers:{"client-platform":"browser"}})},getAITradingDuration:async function(a){return await $fetch(n+`/api/admin/ai-trading/durations/${a}`,{credentials:"include",headers:{"client-platform":"browser"}})},createAITradingDuration:async function(a){return await $fetch(n+"/api/admin/ai-trading/durations",{method:"POST",credentials:"include",headers:{"client-platform":"browser"},body:{duration:a}})},updateAITradingDuration:async function(a,t){return await $fetch(n+`/api/admin/ai-trading/durations/${a}`,{method:"PUT",credentials:"include",headers:{"client-platform":"browser"},body:{duration:t}})},deleteAITradingDuration:async function(a){return await $fetch(n+`/api/admin/ai-trading/durations/${a}`,{method:"DELETE",credentials:"include",headers:{"client-platform":"browser"}})}}}(),...function(){const n=a().public.apiPath;return{getAdminAITradingPlans:async function(){return await $fetch(n+"/api/admin/ai-trading/plans",{credentials:"include",headers:{"client-platform":"browser"}})},getAdminAITradingPlan:async function(a){return await $fetch(n+`/api/admin/ai-trading/plans/${a}`,{credentials:"include",headers:{"client-platform":"browser"}})},createAITradingPlan:async function(a){return await $fetch(n+"/api/admin/ai-trading/plans",{method:"POST",credentials:"include",headers:{"client-platform":"browser"},body:{plan:a}})},updateAITradingPlan:async function(a,t){return await $fetch(n+`/api/admin/ai-trading/plans/${a}`,{method:"PUT",credentials:"include",headers:{"client-platform":"browser"},body:{plan:t}})},deleteAITradingPlan:async function(a){return await $fetch(n+`/api/admin/ai-trading/plans/${a}`,{method:"DELETE",credentials:"include",headers:{"client-platform":"browser"}})},updateAITradingPlanStatus:async function(a,t){return await $fetch(n+"/api/admin/ai-trading/plans/update-status",{method:"PUT",credentials:"include",headers:{"client-platform":"browser"},body:{ids:a,status:t}})}}}(),...function(){const n=a().public.apiPath;return{getAdminAITradings:async function(){return await $fetch(n+"/api/admin/ai-trading",{credentials:"include",headers:{"client-platform":"browser"}})},getAdminAITrading:async function(a){return await $fetch(n+`/api/admin/ai-trading/${a}`,{credentials:"include",headers:{"client-platform":"browser"}})},updateAITrading:async function(a,t,i){return await $fetch(n+`/api/admin/ai-trading/${a}`,{method:"PUT",credentials:"include",headers:{"client-platform":"browser"},body:{result:t,profit:i}})},deleteAITrading:async function(a){return await $fetch(n+`/api/admin/ai-trading/${a}`,{method:"DELETE",credentials:"include",headers:{"client-platform":"browser"}})},updateAITradingStatus:async function(a,t){return await $fetch(n+"/api/admin/ai-trading/update-status",{method:"PUT",credentials:"include",headers:{"client-platform":"browser"},body:{uuids:a,status:t}})},getAdminAiTradingAnalytics:async function(){return await $fetch(n+"/api/admin/ai-trading/analytics",{credentials:"include",headers:{"client-platform":"browser"}})}}}(),...function(){const n=a().public.apiPath;return{getAITradings:async function(){return await $fetch(n+"/api/ai-trading",{credentials:"include",headers:{"client-platform":"browser"}})},getActiveAITradings:async function(){return await $fetch(n+"/api/ai-trading/fetch/active",{credentials:"include",headers:{"client-platform":"browser"}})},getAITrading:async function(a){return await $fetch(n+`/api/ai-trading/${a}`,{credentials:"include",headers:{"client-platform":"browser"}})},createOrder:async function(a,t,i,e,r){return await $fetch(n+"/api/ai-trading",{method:"POST",credentials:"include",headers:{"client-platform":"browser"},body:{plan_id:a,duration:t,amount:i,currency:e,pair:r}})}}}(),...function(){const n=a().public.apiPath;return{getAITradingPlans:async function(){return await $fetch(n+"/api/ai-trading/plans",{credentials:"include",headers:{"client-platform":"browser"}})},getAITradingPlan:async function(a){return await $fetch(n+`/api/ai-trading/plans/${a}`,{credentials:"include",headers:{"client-platform":"browser"}})}}}()}}export{n as u};
