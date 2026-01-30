export const normalizeDay = (d: string): number => {
  const s = d.toLowerCase().trim();
  // Check English full/short
  if (s.startsWith('mon')) return 0;
  if (s.startsWith('tue')) return 1;
  if (s.startsWith('wed')) return 2;
  if (s.startsWith('thu')) return 3;
  if (s.startsWith('fri')) return 4;
  if (s.startsWith('sat')) return 5;
  if (s.startsWith('sun')) return 6;
  // Check German full/short
  if (s.startsWith('mo')) return 0;
  if (s.startsWith('di')) return 1;
  if (s.startsWith('mi')) return 2;
  if (s.startsWith('do')) return 3;
  if (s.startsWith('fr')) return 4;
  if (s.startsWith('sa')) return 5;
  if (s.startsWith('so')) return 6;
  
  // Fallback for number strings "0", "1" etc if backend returns those
  const n = parseInt(s, 10);
  if (!isNaN(n) && n >= 0 && n <= 6) return n; // 0=Mon? Or 0=Sun? 
  // Standard Backend often uses 0=Mon or 0=Sun. 
  // Our system (ProvidersService) seems to use 0=Mon based on `weekdayToNumber`.
  // '0': 0 (Mon), '1': 1 (Tue)...
  
  return -1;
};
