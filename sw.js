self.addEventListener("fetch",e=>{
	e.respondWith(fetch(e.request))
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
