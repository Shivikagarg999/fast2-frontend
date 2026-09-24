"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { XMarkIcon, DevicePhoneMobileIcon } from "@heroicons/react/24/outline";

const SHOW_AFTER_MS = 12000;
const RETRY_MS = 4000;
const SESSION_KEY = "loginPopupShown";

// Pages where a login prompt would get in the way (or that have their own auth)
const HIDDEN_PREFIXES = ["/login", "/checkout", "/order-confirmed", "/deliver", "/warehouse", "/promotor", "/delete-account"];

const safeGet = (storage, key) => {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
};

const hasSavedLocation = () => {
  try {
    const data = JSON.parse(localStorage.getItem("userLocationData") || "null");
    return data?.latitude != null && data?.longitude != null;
  } catch {
    return false;
  }
};

const LoginPopup = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const hiddenHere = HIDDEN_PREFIXES.some((prefix) => pathname?.startsWith(prefix));

  useEffect(() => {
    if (hiddenHere) return;
    if (safeGet(localStorage, "token") || safeGet(sessionStorage, SESSION_KEY)) return;

    let timer;
    const tryOpen = () => {
      if (safeGet(localStorage, "token")) return;
      // Let the first-visit location prompt go first so two modals never stack
      const locationSorted = hasSavedLocation() || safeGet(sessionStorage, "locationPromptDismissed");
      if (!locationSorted) {
        timer = setTimeout(tryOpen, RETRY_MS);
        return;
      }
      setOpen(true);
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // storage blocked - worst case the popup shows again on the next page load
      }
    };
    timer = setTimeout(tryOpen, SHOW_AFTER_MS);

    const handleAuthChange = () => {
      if (safeGet(localStorage, "token")) setOpen(false);
    };
    window.addEventListener("authChange", handleAuthChange);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, [hiddenHere]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    setOpen(false);
    router.push(`/login?phone=${phone}`);
  };

  if (!open || hiddenHere) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4">
      <div className="w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-6 relative">
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          aria-label="Close"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mb-3">
          <DevicePhoneMobileIcon className="w-6 h-6 text-brand-600" />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900">Login to GMKart</h2>
        <p className="text-sm text-gray-500 mt-1 mb-4">
          Enter your mobile number to get an OTP. Save addresses, track orders and check out faster.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="flex">
            <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-700">
              +91
            </span>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              autoFocus
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                setError("");
              }}
              placeholder="Enter mobile number"
              className="min-w-0 w-full rounded-r-lg border border-gray-200 px-3 py-3 text-sm font-medium text-gray-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

          <button
            type="submit"
            className="w-full mt-4 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Get OTP
          </button>
        </form>

        <button
          onClick={() => setOpen(false)}
          className="w-full mt-2 text-sm font-medium text-gray-500 hover:text-gray-700 py-2"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
};

export default LoginPopup;
