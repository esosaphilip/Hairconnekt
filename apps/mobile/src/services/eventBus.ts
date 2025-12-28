type Handler = (payload?: any) => void;
const listeners: Record<string, Handler[]> = {};

export function on(event: string, handler: Handler) {
  listeners[event] = listeners[event] || [];
  listeners[event].push(handler);
  return () => {
    listeners[event] = (listeners[event] || []).filter((h) => h !== handler);
  };
}

export function off(event: string, handler: Handler) {
  listeners[event] = (listeners[event] || []).filter((h) => h !== handler);
}

export function emit(event: string, payload?: any) {
  (listeners[event] || []).forEach((h) => {
    try { h(payload); } catch { }
  });
}

