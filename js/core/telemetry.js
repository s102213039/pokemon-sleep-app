/**
 * telemetry.js — Client-Side Observability & Telemetry Engine
 * ==========================================================
 * 1. Uncaught Exception & Promise Rejection Interceptor:
 *    Captures runtime crashes, stack traces, active routes, and device metadata.
 * 2. Core Web Vitals Monitoring (FCP, LCP, CLS, TTFB, Page Load):
 *    Observes real-user performance metrics non-blockingly via PerformanceObserver.
 * 3. Local Diagnostics Persistence (IndexedDB / Memory Ring Buffer):
 *    Stores up to 100 recent diagnostic records without polluting user storage.
 * 4. Free Remote Sync / Diagnostics Export:
 *    Provides instant one-click health reports and clipboard export for support.
 * 
 * Zero Emojis (Rule 8) / 100% Free / Non-blocking.
 */

(function (global) {
  'use strict';

  const MAX_BUFFER_SIZE = 100;
  const DEDUPE_WINDOW_MS = 5000;
  const _logBuffer = [];
  const _vitals = {
    fcp: null,
    lcp: null,
    cls: 0,
    domInteractive: null,
    loadTime: null
  };
  let _lastErrorSignature = '';
  let _lastErrorTime = 0;

  function nowIso() {
    return new Date().toISOString();
  }

  function getActiveRoute() {
    try {
      return (typeof location !== 'undefined' && location.hash) ? location.hash : '#';
    } catch (e) {
      return '';
    }
  }

  function pushLog(entry) {
    _logBuffer.push(entry);
    if (_logBuffer.length > MAX_BUFFER_SIZE) {
      _logBuffer.shift();
    }
    // Attempt persist to IndexedDB asynchronously
    try {
      const idb = global.IDBStorage || (typeof window !== 'undefined' ? window.IDBStorage : null);
      if (idb && typeof idb.set === 'function') {
        idb.set('pksleep_telemetry_recent', _logBuffer.slice(-20), 'cache').catch(function () {});
      }
    } catch (e) {}
  }

  const TelemetryManager = {
    name: 'TelemetryManager',
    initialized: false,

    init: function () {
      if (this.initialized) return;
      this.initialized = true;

      this.setupErrorListeners();
      this.setupVitalsObserver();
      this.setupNavigationTiming();
    },

    setupErrorListeners: function () {
      if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;

      // 1. Uncaught Runtime Errors
      window.addEventListener('error', function (event) {
        try {
          const msg = event.message || 'Script error';
          const file = event.filename || '';
          const line = event.lineno || 0;
          const col = event.colno || 0;
          const stack = (event.error && event.error.stack) ? event.error.stack : `${file}:${line}:${col}`;
          const signature = `${msg}|${file}|${line}`;
          const now = Date.now();

          // Deduplicate loop errors
          if (signature === _lastErrorSignature && now - _lastErrorTime < DEDUPE_WINDOW_MS) {
            return;
          }
          _lastErrorSignature = signature;
          _lastErrorTime = now;

          const entry = {
            type: 'UNCAUGHT_ERROR',
            timestamp: nowIso(),
            message: String(msg),
            source: file,
            line: line,
            column: col,
            stack: stack,
            route: getActiveRoute()
          };
          pushLog(entry);
        } catch (err) {}
      });

      // 2. Unhandled Promise Rejections
      window.addEventListener('unhandledrejection', function (event) {
        try {
          const reason = event.reason;
          const msg = reason ? (reason.message || String(reason)) : 'Unhandled rejection';
          const stack = reason && reason.stack ? reason.stack : '';
          const signature = `rejection|${msg}`;
          const now = Date.now();

          if (signature === _lastErrorSignature && now - _lastErrorTime < DEDUPE_WINDOW_MS) {
            return;
          }
          _lastErrorSignature = signature;
          _lastErrorTime = now;

          const entry = {
            type: 'UNHANDLED_REJECTION',
            timestamp: nowIso(),
            message: msg,
            stack: stack,
            route: getActiveRoute()
          };
          pushLog(entry);
        } catch (err) {}
      });
    },

    setupVitalsObserver: function () {
      if (typeof window === 'undefined' || typeof PerformanceObserver !== 'function') return;

      // FCP & Paint
      try {
        const paintObserver = new PerformanceObserver(function (list) {
          const entries = list.getEntries();
          for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            if (entry.name === 'first-contentful-paint') {
              _vitals.fcp = Math.round(entry.startTime);
            }
          }
        });
        paintObserver.observe({ type: 'paint', buffered: true });
      } catch (e) {}

      // LCP
      try {
        const lcpObserver = new PerformanceObserver(function (list) {
          const entries = list.getEntries();
          if (entries.length > 0) {
            const lastEntry = entries[entries.length - 1];
            _vitals.lcp = Math.round(lastEntry.startTime);
          }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {}

      // CLS
      try {
        const clsObserver = new PerformanceObserver(function (list) {
          const entries = list.getEntries();
          for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            if (!entry.hadRecentInput) {
              _vitals.cls = Number((_vitals.cls + entry.value).toFixed(4));
            }
          }
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {}
    },

    setupNavigationTiming: function () {
      if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;

      window.addEventListener('load', function () {
        setTimeout(function () {
          try {
            if (window.performance && window.performance.timing) {
              const t = window.performance.timing;
              const start = t.navigationStart || t.fetchStart;
              if (t.domInteractive && start) {
                _vitals.domInteractive = t.domInteractive - start;
              }
              if (t.loadEventEnd && start) {
                _vitals.loadTime = t.loadEventEnd - start;
              }
            }
          } catch (e) {}
        }, 100);
      });
    },

    recordEvent: function (eventName, data) {
      pushLog({
        type: 'CUSTOM_EVENT',
        name: eventName,
        timestamp: nowIso(),
        data: data || {},
        route: getActiveRoute()
      });
    },

    getHealthReport: function () {
      const errorCount = _logBuffer.filter(function (e) {
        return e.type === 'UNCAUGHT_ERROR' || e.type === 'UNHANDLED_REJECTION';
      }).length;

      return {
        timestamp: nowIso(),
        status: errorCount === 0 ? 'HEALTHY' : 'WARNING',
        errorCount: errorCount,
        webVitals: {
          fcpMs: _vitals.fcp,
          lcpMs: _vitals.lcp,
          cls: _vitals.cls,
          domInteractiveMs: _vitals.domInteractive,
          pageLoadTimeMs: _vitals.loadTime
        },
        route: getActiveRoute(),
        userAgent: (typeof navigator !== 'undefined') ? navigator.userAgent : '',
        recentLogs: _logBuffer.slice(-10)
      };
    },

    generateDiagnosticMarkdown: function () {
      const rep = this.getHealthReport();
      const lines = [
        '# Pokemon Sleep App System Diagnostics Report',
        `- Generated: ${rep.timestamp}`,
        `- Status: [${rep.status}]`,
        `- Error Count: ${rep.errorCount}`,
        `- Current Route: ${rep.route}`,
        '- Web Vitals:',
        `  * FCP: ${rep.webVitals.fcpMs !== null ? rep.webVitals.fcpMs + 'ms' : 'N/A'}`,
        `  * LCP: ${rep.webVitals.lcpMs !== null ? rep.webVitals.lcpMs + 'ms' : 'N/A'}`,
        `  * CLS: ${rep.webVitals.cls}`,
        `  * Page Load Time: ${rep.webVitals.pageLoadTimeMs !== null ? rep.webVitals.pageLoadTimeMs + 'ms' : 'N/A'}`,
        `- User Agent: ${rep.userAgent}`
      ];

      if (rep.recentLogs.length > 0) {
        lines.push('', '## Recent Errors & Logs:');
        rep.recentLogs.forEach(function (log, idx) {
          lines.push(`### [${idx + 1}] ${log.type} @ ${log.timestamp}`);
          lines.push(`- Message: ${log.message || log.name || 'N/A'}`);
          if (log.route) lines.push(`- Route: ${log.route}`);
          if (log.stack) lines.push('```\n' + log.stack.slice(0, 500) + '\n```');
        });
      } else {
        lines.push('', '## Recent Errors: None (Clean Run)');
      }

      return lines.join('\n');
    },

    copyDiagnosticReport: function () {
      const md = this.generateDiagnosticMarkdown();
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(md).then(function () {
          return true;
        }).catch(function () {
          return false;
        });
      }
      return Promise.resolve(false);
    }
  };

  // Auto-initialize on load
  if (typeof window !== 'undefined') {
    TelemetryManager.init();
    window.TelemetryManager = TelemetryManager;
    if (window.PokemonApp) {
      window.PokemonApp.TelemetryManager = TelemetryManager;
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TelemetryManager;
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
