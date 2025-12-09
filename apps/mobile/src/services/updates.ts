import * as Updates from 'expo-updates';

export async function checkAndReloadUpdates(): Promise<{ updated: boolean; message: string }> {
  try {
    const canCheck = typeof Updates.checkForUpdateAsync === 'function';
    if (!canCheck) {
      return { updated: false, message: 'Updates API nicht verfügbar' };
    }
    const available = await Updates.checkForUpdateAsync();
    if (available?.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
      return { updated: true, message: 'App aktualisiert' };
    }
    return { updated: false, message: 'Keine Aktualisierung verfügbar' };
  } catch (e: any) {
    return { updated: false, message: e?.message || 'Aktualisierung fehlgeschlagen' };
  }
}

