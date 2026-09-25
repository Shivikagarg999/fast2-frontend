// Lightweight, anonymous first-party analytics. Events are batched and sent to our own backend
// (/proxy/api/analytics/track). No personal data is collected: only a random visitor id, page path,
// and the product/category/search the action was about.

const ENDPOINT = '/proxy/api/analytics/track';
const FLUSH_DELAY_MS = 2000;
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

let memoryVisitorId = null;
let queue = [];
let flushTimer = null;

const randomId = () => {
  try {
    if (crypto?.randomUUID) return crypto.randomUUID();
  } catch {
    // fall through
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
};

const getVisitorId = () => {
  try {
    let id = localStorage.getItem('gm_vid');
    if (!id) {
      id = randomId();
      localStorage.setItem('gm_vid', id);
    }
    return id;
  } catch {
    // storage blocked: still count the visit, per page load
    if (!memoryVisitorId) memoryVisitorId = randomId();
    return memoryVisitorId;
  }
};

// A session ends after 30 minutes without activity.
const getSessionId = () => {
  const now = Date.now();
  try {
    const saved = JSON.parse(sessionStorage.getItem('gm_sid') || 'null');
    if (saved?.id && now - saved.last < SESSION_TIMEOUT_MS) {
      sessionStorage.setItem('gm_sid', JSON.stringify({ id: saved.id, last: now }));
      return saved.id;
    }
    const id = randomId();
    sessionStorage.setItem('gm_sid', JSON.stringify({ id, last: now }));
    return id;
  } catch {
    return getVisitorId();
  }
};

const getDevice = () => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

const isLoggedIn = () => {
  try {
    return !!localStorage.getItem('token');
  } catch {
    return false;
  }
};

const flush = () => {
  clearTimeout(flushTimer);
  flushTimer = null;
  if (!queue.length) return;

  const payload = JSON.stringify({
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    device: getDevice(),
    isLoggedIn: isLoggedIn(),
    referrer: document.referrer ? new URL(document.referrer).hostname : '',
    events: queue.splice(0, 20),
  });

  try {
    // sendBeacon survives the tab closing; fall back to fetch if unavailable
    const sent = navigator.sendBeacon?.(ENDPOINT, new Blob([payload], { type: 'application/json' }));
    if (!sent) {
      fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {});
    }
  } catch {
    // analytics must never break the site
  }

  if (queue.length) flushTimer = setTimeout(flush, FLUSH_DELAY_MS);
};

export const track = (event, meta = {}) => {
  if (typeof window === 'undefined') return;
  try {
    queue.push({ event, path: window.location.pathname, meta });
    if (!flushTimer) flushTimer = setTimeout(flush, FLUSH_DELAY_MS);
  } catch {
    // ignore
  }
};

export const flushAnalytics = flush;
