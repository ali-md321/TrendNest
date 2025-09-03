self.addEventListener("push", event => {
  console.log("Push event received:", event.data ? event.data.text() : "NO DATA");
  if (!event.data) return;
  let data = {};
  try {
    data = event.data.json();
    console.log("Raw push:", event.data.text());
  } catch (err) {
    data = { title: "Notification", message: event.data.text() };
  }

  const title = data.title || "TrendNest";
  const options = {
    body: data.message || "You have a new notification",
    icon: "/Logo.png",  // adjust to your logo path
    data: { route: data.route || "/" }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const route = event.notification.data?.route || '/';
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
      // focus a client if already open
      for (const client of clientList) {
        try {
          const clientUrl = new URL(client.url);
          if (clientUrl.origin === self.location.origin) {
            client.focus();
            client.postMessage({ action: 'navigate', route });
            return;
          }
        } catch (e) {
          // ignore
        }
      }
      // otherwise open a new window/tab
      return clients.openWindow(route);
    })
  );
});
