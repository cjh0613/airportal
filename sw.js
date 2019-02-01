const currentCache="airportal-19w05c2-2"
self.addEventListener("fetch",e=>{
	e.respondWith(caches.match(e.request).then(response=>{
		if(response){
			return response
		}else{
			return fetch(e.request).catch(()=>{})
		}
	}).then(data=>{
		if(data){
			return data
		}else{
			return new Response(null,{
				"status":502,
				"statusText":"Bad Gateway"
			})
		}
	}))
})
self.addEventListener("activate",e=>{
	e.waitUntil(caches.keys().then(cacheNames=>{
		return Promise.all(cacheNames.map(cacheName=>{
			if(cacheName.indexOf("airportal")!=-1){
				return caches.delete(cacheName)
			}
		}))
	}))
})
