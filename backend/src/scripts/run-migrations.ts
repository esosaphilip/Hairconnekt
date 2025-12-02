import { AppDataSource } from '../database/data-source';

async function run() {
  const ds = await AppDataSource.initialize();
  try {
    const migrations = await ds.runMigrations();
    console.log(`[MIGRATIONS] Applied ${migrations.length} migrations`);
  } finally {
    await ds.destroy();
  }
}

run().then(() => {
  console.log('[MIGRATIONS] Done');
  process.exit(0);
}).catch((err) => {
  console.error('[MIGRATIONS] Failed:', err?.message || err);
  process.exit(1);
});

