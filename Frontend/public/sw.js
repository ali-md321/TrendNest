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
  const route = event.notification.data?.route || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientsArr => {
      // If a tab with your app is open, focus it
      for (const client of clientsArr) {
        if (client.url.includes(location.origin)) {
          client.focus();
          client.postMessage({ action: "navigate", route });
          return;
        }
      }
      // Otherwise open a new tab
      clients.openWindow(route);
    })
  );
});
