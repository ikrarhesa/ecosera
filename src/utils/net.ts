export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  if (typeof navigator.onLine === 'boolean') return navigator.onLine;
  return true;
}

export function onOnlineOnce(cb: () => void): () => void {
  const handler = () => {
    window.removeEventListener('online', handler);
    cb();
  };
  window.addEventListener('online', handler);
  return () => window.removeEventListener('online', handler);
}
