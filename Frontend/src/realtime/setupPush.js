import api from '../utils/api';

export async function setupPush() {
  if(!('serviceWorker' in navigator)||!('PushManager' in window)) return { enabled:false };
  const permission = await Notification.requestPermission();
  if(permission!=='granted') return { enabled:false };

  const reg = await navigator.serviceWorker.register('/sw.js');
  const { data } = await api.get('/push/public-key');
  const vapidKey = urlBase64ToUint8Array(data.key);

  const sub = await reg.pushManager.subscribe({ userVisibleOnly:true, applicationServerKey:vapidKey });
  await api.post('/push/subscribe',{ endpoint:sub.endpoint, keys:sub.toJSON().keys, userAgent:navigator.userAgent });
  return { enabled:true };
}

function urlBase64ToUint8Array(base64String){
  const padding='='.repeat((4-base64String.length%4)%4);
  const base64=(base64String+padding).replace(/\-/g,'+').replace(/_/g,'/');
  const raw=window.atob(base64);
  return new Uint8Array([...raw].map(c=>c.charCodeAt(0)));
}
