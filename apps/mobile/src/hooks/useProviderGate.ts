import { useEffect, useState } from 'react';
import { providersApi } from '@/services/providers';

type GateStatus = 'ok' | 'pending' | 'not_provider' | 'error';

export function useProviderGate() {
  const [status, setStatus] = useState<GateStatus>('ok');
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const profile: any = await providersApi.getMyProfile();
        const isProvider = !!(profile?.id || profile?.provider?.id);
        const pending = String(profile?.status || '').toLowerCase() === 'pending';
        if (!isProvider) setStatus('not_provider');
        else if (pending) setStatus('pending');
        else setStatus('ok');
      } catch {
        setStatus('error');
      } finally {
        setChecked(true);
      }
    })();
  }, []);

  return { status, checked };
}

