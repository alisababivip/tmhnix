import{Z as e}from"../e/entry-8qgg5CL-.js";function t(){return{...function(){const t=e().public.apiPath;return{getAuthors:async function(e,a){return await $fetch(t+"/api/blog/authors",{credentials:"include",headers:{"client-platform":"browser"},query:{status:a,posts:e}})},getAuthor:async function(e,a){return await $fetch(t+`/api/blog/authors/${e}`,{credentials:"include",headers:{"client-platform":"browser"},query:{posts:a}})},createAuthor:async function(){return await $fetch(t+"/api/blog/authors",{method:"POST",credentials:"include",headers:{"client-platform":"browser"}})},updateAuthor:async function(e,a){return await $fetch(t+`/api/blog/authors/${e}`,{method:"PUT",credentials:"include",headers:{"client-platform":"browser"},body:{status:a}})},deleteAuthor:async function(e){return await $fetch(t+`/api/blog/authors/${e}`,{method:"DELETE",credentials:"include",headers:{"client-platform":"browser"}})}}}(),...function(){const t=e().public.apiPath;return{getCategories:async function(e=!0){return await $fetch(t+"/api/blog/categories",{credentials:"include",headers:{"client-platform":"browser"},query:{posts:e}})},getCategory:async function(e,a=!0){return await $fetch(t+`/api/blog/categories/${e}`,{credentials:"include",headers:{"client-platform":"browser"},query:{posts:a}})},createCategory:async function(e){return await $fetch(t+"/api/blog/categories",{method:"POST",credentials:"include",headers:{"client-platform":"browser"},body:{category:e}})},updateCategory:async function(e,a){return await $fetch(t+`/api/blog/categories/${e}`,{method:"PUT",credentials:"include",headers:{"client-platform":"browser"},body:{category:a}})},deleteCategory:async function(e){return await $fetch(t+`/api/blog/categories/${e}`,{method:"DELETE",credentials:"include",headers:{"client-platform":"browser"}})}}}(),...function(){const t=e().public.apiPath;return{getTags:async function(e=!0){return await $fetch(t+"/api/blog/tags",{credentials:"include",headers:{"client-platform":"browser"},query:{posts:e}})},getTag:async function(e,a=!0){return await $fetch(t+`/api/blog/tags/${e}`,{credentials:"include",headers:{"client-platform":"browser"},query:{posts:a}})},createTag:async function(e){return await $fetch(t+"/api/blog/tags",{method:"POST",credentials:"include",headers:{"client-platform":"browser"},body:{tag:e}})},updateTag:async function(e,a){return await $fetch(t+`/api/blog/tags/${e}`,{method:"PUT",credentials:"include",headers:{"client-platform":"browser"},body:{tag:a}})},deleteTag:async function(e){return await $fetch(t+`/api/blog/tags/${e}`,{method:"DELETE",credentials:"include",headers:{"client-platform":"browser"}})}}}(),...function(){const t=e().public.apiPath;return{getPosts:async function(e,a,r,n){return await $fetch(t+"/api/blog/posts",{credentials:"include",headers:{"client-platform":"browser"},query:{user:e,category:a,tag:r,status:n}})},getPost:async function(e){return await $fetch(t+`/api/blog/posts/${e}`,{credentials:"include",headers:{"client-platform":"browser"}})},createPost:async function(e){return await $fetch(t+"/api/blog/posts",{method:"POST",credentials:"include",headers:{"client-platform":"browser"},body:{post:e}})},updatePost:async function(e,a){return await $fetch(t+`/api/blog/posts/${e}`,{method:"PUT",credentials:"include",headers:{"client-platform":"browser"},body:{post:a}})},deletePost:async function(e){return await $fetch(t+`/api/blog/posts/${e}`,{method:"DELETE",credentials:"include",headers:{"client-platform":"browser"}})},updatePostStatus:async function(e,a){return await $fetch(t+`/api/blog/posts/${e}/status`,{method:"PUT",credentials:"include",headers:{"client-platform":"browser"},body:{status:a}})}}}()}}export{t as u};
