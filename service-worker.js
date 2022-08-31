importScripts("/precache-manifest.b6b6f939b06d3b40071c37b075810762.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

import workbox from "register-service-worker";

self.addEventListener('fetch', function (event) {
  console.log(event);
});

