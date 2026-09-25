"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { track, flushAnalytics } from "../../utils/analytics";

// Staff/partner pages are not customer traffic
const IGNORED_PREFIXES = ["/deliver", "/warehouse", "/promotor"];

const refFromPath = (path, prefix) => {
  const ref = path.slice(prefix.length).split(/[/?#]/)[0];
  return ref ? decodeURIComponent(ref).slice(0, 100) : "";
};

const safeSessionGet = (key) => {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const AnalyticsTracker = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const ignored = IGNORED_PREFIXES.some((prefix) => pathname?.startsWith(prefix));

  // Page views + the funnel pages
  useEffect(() => {
    if (ignored || !pathname) return;
    track("page_view");

    if (pathname.startsWith("/product/")) {
      track("product_view", { ref: refFromPath(pathname, "/product/") });
    } else if (pathname.startsWith("/login")) {
      track("login_page_view");
    } else if (pathname.startsWith("/checkout")) {
      track("checkout_start");
    } else if (pathname.startsWith("/order-confirmed")) {
      // Count each order once even if the page is refreshed
      let orderId = "";
      try {
        orderId = JSON.parse(safeSessionGet("orderConfirmation") || "null")?.orderId || "";
      } catch {
        orderId = "";
      }
      const alreadyCounted = orderId && safeSessionGet("gm_tracked_order") === orderId;
      if (!alreadyCounted) {
        track("order_placed");
        try {
          if (orderId) sessionStorage.setItem("gm_tracked_order", orderId);
        } catch {
          // ignore
        }
      }
    }
  }, [pathname, ignored]);

  // Searches (home page ?search=...)
  useEffect(() => {
    if (ignored || !search) return;
    track("search", { query: search.slice(0, 100) });
  }, [search, ignored]);

  // Clicks on product / category / subcategory links anywhere on the site
  useEffect(() => {
    if (ignored) return;
    const handleClick = (e) => {
      const link = e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (!link) return;
      let path;
      try {
        path = new URL(link.href, window.location.origin).pathname;
      } catch {
        return;
      }
      if (path.startsWith("/product/")) track("product_click", { ref: refFromPath(path, "/product/") });
      else if (path.startsWith("/subcategory/")) track("subcategory_click", { ref: refFromPath(path, "/subcategory/") });
      else if (path.startsWith("/category/")) track("category_click", { ref: refFromPath(path, "/category/") });
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [ignored]);

  // Login success, location chosen, add-to-cart: observed from existing events / requests,
  // so the many components that trigger them don't each need instrumenting.
  useEffect(() => {
    const onLogin = () => track("login_success");
    const onLocation = () => track("location_set");
    window.addEventListener("userLoggedIn", onLogin);
    window.addEventListener("locationUpdated", onLocation);

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      try {
        const [input, init] = args;
        const url = typeof input === "string" ? input : input?.url || "";
        const method = (init?.method || (typeof input !== "string" && input?.method) || "GET").toUpperCase();
        if (response.ok && method === "POST" && url.includes("/api/cart/add")) {
          let ref = "";
          try {
            const body = typeof init?.body === "string" ? JSON.parse(init.body) : null;
            ref = String(body?.productId || body?.product || "").slice(0, 100);
          } catch {
            ref = "";
          }
          track("add_to_cart", ref ? { ref } : {});
        }
      } catch {
        // never let tracking affect the real request
      }
      return response;
    };

    const onHide = () => {
      if (document.visibilityState === "hidden") flushAnalytics();
    };
    document.addEventListener("visibilitychange", onHide);

    return () => {
      window.removeEventListener("userLoggedIn", onLogin);
      window.removeEventListener("locationUpdated", onLocation);
      document.removeEventListener("visibilitychange", onHide);
      window.fetch = originalFetch;
    };
  }, []);

  return null;
};

export default AnalyticsTracker;
