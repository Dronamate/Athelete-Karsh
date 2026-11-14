import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const success = useCallback((msg) => addToast('success', msg), [addToast]);
  const error = useCallback((msg) => addToast('error', msg), [addToast]);
  const info = useCallback((msg) => addToast('info', msg), [addToast]);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      {/* Toast container floating in bottom-right (or top-center on mobile) */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl p-3.5 shadow-xl border flex items-start justify-between gap-3 text-xs sm:text-sm font-semibold transition-all duration-300 transform translate-y-0 opacity-100 ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 shadow-emerald-500/10'
                : toast.type === 'error'
                  ? 'bg-red-50 text-red-900 border-red-300 shadow-red-500/10'
                  : 'bg-[#0c2340] text-white border-slate-700 shadow-slate-900/20'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <span className="text-base leading-none">
                {toast.type === 'success' ? '✓' : toast.type === 'error' ? '⚠️' : 'ℹ️'}
              </span>
              <p className="leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold p-0.5"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      success: (msg) => console.log('Success:', msg),
      error: (msg) => console.error('Error:', msg),
      info: (msg) => console.log('Info:', msg),
    };
  }
  return ctx;
}

