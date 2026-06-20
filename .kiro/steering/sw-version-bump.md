---
inclusion: fileMatch
fileMatchPattern: 'src/**'
---

# Service Worker version bump

When any file under `src/` is modified, remember to bump the cache version in `src/sw.js` (`const cacheName = 'Flux-vNNN'`) before building or committing. This ensures browsers invalidate the old cache on deploy.
