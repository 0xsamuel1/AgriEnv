export const dynamic = "force-dynamic";

export function GET() {
  const deploymentVersion =
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ||
    process.env.VERCEL_URL ||
    `local-${process.env.npm_package_version || "1"}`;

  const script = String.raw`
const DEPLOYMENT_VERSION = ${JSON.stringify(deploymentVersion)};
const CACHE_PREFIX = "agrienv";
const SHELL_CACHE = CACHE_PREFIX + "-shell-" + DEPLOYMENT_VERSION;
const RUNTIME_CACHE = CACHE_PREFIX + "-runtime-" + DEPLOYMENT_VERSION;
const OFFLINE_PAGE = "/offline.html";

const APP_SHELL = [
  OFFLINE_PAGE,
  "/manifest.json",
  "/icons/agrienv-192.png",
  "/icons/agrienv-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && ![SHELL_CACHE, RUNTIME_CACHE].includes(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

async function fetchNavigation(request) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  const url = new URL(request.url);
  const cacheKey = new Request(url.origin + url.pathname);

  try {
    const response = await fetch(request, { signal: controller.signal });

    if (response.ok) {
      const copy = response.clone();
      void caches.open(RUNTIME_CACHE).then((cache) => cache.put(cacheKey, copy));
    }

    return response;
  } catch {
    const cachedPage = await caches.match(cacheKey);
    if (cachedPage) return cachedPage;

    const offlineResponse = await caches.match(OFFLINE_PAGE);
    return offlineResponse || Response.error();
  } finally {
    clearTimeout(timeout);
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) return;

  if (request.mode === "navigate") {
    event.respondWith(fetchNavigation(request));
    return;
  }

  const cacheableAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/image") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/images/") ||
    ["font", "image", "script", "style", "worker"].includes(request.destination);

  if (!cacheableAsset) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const networkResponse = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            void caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cachedResponse || Response.error());

      return cachedResponse || networkResponse;
    })
  );
});
`;

  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Service-Worker-Allowed": "/",
    },
  });
}
