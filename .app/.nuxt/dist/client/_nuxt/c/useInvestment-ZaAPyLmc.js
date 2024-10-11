import{Z as e}from"../e/entry-8qgg5CL-.js";function t(){return{...function(){const t=e().public.apiPath;return{getInvestmentPlans:async function(){return await $fetch(t+"/api/investment-plan",{credentials:"include",headers:{"client-platform":"browser"}})},getInvestmentPlan:async function(e){return await $fetch(t+`/api/investment-plan/${e}`,{credentials:"include",headers:{"client-platform":"browser"}})},getAdminInvestmentPlans:async function(){return await $fetch(t+"/api/admin/investment-plan",{credentials:"include",headers:{"client-platform":"browser"}})},getAdminInvestmentPlan:async function(e){return await $fetch(t+`/api/admin/investment-plan/${e}`,{credentials:"include",headers:{"client-platform":"browser"}})},createInvestmentPlan:async function(e){return await $fetch(t+"/api/admin/investment-plan",{method:"POST",credentials:"include",headers:{"client-platform":"browser"},body:{plan:e}})},updateInvestmentPlan:async function(e,n){return await $fetch(t+`/api/admin/investment-plan/${e}`,{method:"PUT",credentials:"include",headers:{"client-platform":"browser"},body:{plan:n}})},deleteInvestmentPlan:async function(e){return await $fetch(t+`/api/admin/investment-plan/${e}`,{method:"DELETE",credentials:"include",headers:{"client-platform":"browser"}})},updateInvestmentPlanStatus:async function(e,n){return await $fetch(t+"/api/admin/investment-plan/update-status",{method:"PUT",credentials:"include",headers:{"client-platform":"browser"},body:{ids:e,status:n}})}}}(),...function(){const t=e().public.apiPath;return{getInvestments:async function(){return await $fetch(t+"/api/investment",{credentials:"include",headers:{"client-platform":"browser"}})},getInvestment:async function(e){return await $fetch(t+`/api/investment/uuid/${e}`,{credentials:"include",headers:{"client-platform":"browser"}})},getUserInvestment:async function(){return await $fetch(t+"/api/investment/user",{credentials:"include",headers:{"client-platform":"browser"}})},createInvestment:async function(e,n){return await $fetch(t+"/api/investment",{method:"POST",credentials:"include",headers:{"client-platform":"browser"},body:{plan:e,amount:n}})},updateInvestment:async function(e,n){return await $fetch(t+`/api/investment/${e}`,{method:"PUT",credentials:"include",headers:{"client-platform":"browser"},body:n})},deleteInvestment:async function(e){return await $fetch(t+`/api/investment/${e}`,{method:"DELETE",credentials:"include",headers:{"client-platform":"browser"}})},cancelInvestment:async function(e){return await $fetch(t+`/api/investment/${e}/cancel`,{method:"PUT",credentials:"include",headers:{"client-platform":"browser"}})}}}()}}export{t as u};
