const CACHE_NAME = 'ecto-os-v0-2-0';
const APP_SHELL = [
  './','./index.html','./manifest.json',
  './icons/icon-192.png','./icons/icon-512.png','./icons/maskable-512.png',
  './sounds/button.wav','./sounds/pke-scan.wav','./sounds/warning.wav','./sounds/containment-alert.wav',
  './sounds/pack-connect.wav','./sounds/pack-disconnect.wav','./sounds/trap-deploy.wav','./sounds/radio-chirp.wav'
];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  const isHtml=event.request.mode==='navigate'||url.pathname.endsWith('/index.html')||url.pathname.endsWith('/');
  if(isHtml){
    event.respondWith(fetch(event.request).then(r=>{const copy=r.clone();caches.open(CACHE_NAME).then(c=>c.put('./index.html',copy));return r;}).catch(()=>caches.match('./index.html')));return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(r=>{const copy=r.clone();caches.open(CACHE_NAME).then(c=>c.put(event.request,copy));return r;}).catch(()=>caches.match('./index.html'))));
});
