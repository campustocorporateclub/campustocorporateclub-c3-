import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 8000,
});

/* ==========================================================================
   Slow Server Connection Banner (> 4 seconds in-flight)
   ========================================================================== */
let activeInFlightRequests = 0;
let slowRequestTimer = null;
let bannerNode = null;

function showConnectingBanner() {
  if (typeof document === 'undefined' || bannerNode) return;
  bannerNode = document.createElement('div');
  bannerNode.id = 'c3-slow-server-banner';
  bannerNode.setAttribute('role', 'status');
  bannerNode.setAttribute('aria-live', 'polite');
  bannerNode.style.cssText =
    'position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:99999;pointer-events:none;transition:opacity 0.25s ease;';
  bannerNode.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;padding:8px 16px;background:rgba(9,9,11,0.92);color:#e4e4e7;border:1px solid rgba(255,255,255,0.15);border-radius:9999px;font-size:12px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;box-shadow:0 10px 30px rgba(0,0,0,0.6);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);">
      <span style="width:7px;height:7px;border-radius:50%;background:#f59e0b;display:inline-block;box-shadow:0 0 8px #f59e0b;"></span>
      <span>Connecting to server... this can take a moment</span>
    </div>
  `;
  document.body.appendChild(bannerNode);
}

function hideConnectingBanner() {
  if (slowRequestTimer) {
    clearTimeout(slowRequestTimer);
    slowRequestTimer = null;
  }
  if (bannerNode) {
    if (bannerNode.parentNode) {
      bannerNode.parentNode.removeChild(bannerNode);
    }
    bannerNode = null;
  }
}

function trackRequestStart() {
  activeInFlightRequests++;
  if (!slowRequestTimer) {
    slowRequestTimer = setTimeout(() => {
      if (activeInFlightRequests > 0) {
        showConnectingBanner();
      }
    }, 4000);
  }
}

function trackRequestEnd() {
  activeInFlightRequests = Math.max(0, activeInFlightRequests - 1);
  if (activeInFlightRequests === 0) {
    hideConnectingBanner();
  }
}

// Automatically inject JWT token from localStorage if present; reject immediately if offline
api.interceptors.request.use(
  (config) => {
    // If client is definitively offline, reject immediately without 10-second TCP stall
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      const offlineErr = new Error('You are offline. Turn on your internet to continue.');
      offlineErr.code = 'ERR_OFFLINE';
      offlineErr.isOffline = true;
      return Promise.reject(offlineErr);
    }

    if (!config.silent) {
      trackRequestStart();
    }
    if (!config.headers.Authorization) {
      try {
        const storedUser = localStorage.getItem('c3user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed?.token) {
            config.headers.Authorization = `Bearer ${parsed.token}`;
          }
        }
      } catch {
        // ignore parse error
      }
    }
    return config;
  },
  (error) => {
    if (!error.config?.silent) {
      trackRequestEnd();
    }
    return Promise.reject(error);
  }
);

// Response interceptor: GET retry on sleep/502/503/504 & session expiration
api.interceptors.response.use(
  (response) => {
    if (!response.config?.silent) {
      trackRequestEnd();
    }
    return response;
  },
  async (error) => {
    const config = error.config;

    // Retry only GET requests on 502/503/504 server sleep (at most 1 retry with 1s delay)
    if (config && !config.silent) {
      const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
      const method = (config.method || 'get').toLowerCase();
      const status = error.response?.status;
      const isRetryableStatus = status === 502 || status === 503 || status === 504;

      if (!isOffline && method === 'get' && isRetryableStatus) {
        config.__retryCount = config.__retryCount || 0;
        if (config.__retryCount < 1) {
          config.__retryCount += 1;
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return api(config);
        }
      }
    }

    if (!config?.silent) {
      trackRequestEnd();
    }

    // 401 Unauthorized handling
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isAuthCall = Boolean(
        requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register')
      );

      if (!isAuthCall) {
        localStorage.removeItem('c3user');

        if (typeof window !== 'undefined') {
          const pathname = window.location.pathname;
          const isPublic =
            (pathname === '/') ||
            (pathname === '/login') ||
            (pathname === '/register') ||
            (pathname === '/gallery') ||
            (pathname === '/sessions-archive') ||
            (pathname.startsWith('/apply')) ||
            (pathname.startsWith('/events/')) ||
            (pathname === '/events');

          // Redirect to /login unless on a public route (avoids redirect loops)
          if (!isPublic) {
            window.location.href = '/login';
          }
        }
      }
    } else if (error.response?.status === 403) {
      const isPasswordChangeRequired =
        error.response?.data?.code === 'PASSWORD_CHANGE_REQUIRED' ||
        Boolean(error.response?.data?.mustChangePassword);

      if (isPasswordChangeRequired) {
        try {
          const stored = localStorage.getItem('c3user');
          if (stored) {
            const parsed = JSON.parse(stored);
            parsed.mustChangePassword = true;
            localStorage.setItem('c3user', JSON.stringify(parsed));
          }
        } catch {}
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('c3:password-change-required'));
        }
      } else {
        const requestUrl = error.config?.url || '';
        // If 403 Forbidden received on non-auth endpoint, refresh permissions immediately
        if (!requestUrl.includes('/auth/me')) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('c3:auth-refresh'));
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;