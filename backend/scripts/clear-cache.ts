
import Redis from 'ioredis';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Construct path to .env file relative to this script
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

async function clearCache() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
        console.error('REDIS_URL is not defined in .env');
        process.exit(1);
    }

    console.log('Connecting to Redis...');
    const redis = new Redis(redisUrl);

    try {
        // Check connection
        await redis.ping();
        console.log('Connected!');

        // Find keys matching the pattern
        const pattern = 'providers:nearby*';
        let cursor = '0';
        let keysToDelete: string[] = [];

        do {
            const result = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
            cursor = result[0];
            const keys = result[1];
            if (keys.length > 0) {
                keysToDelete.push(...keys);
            }
        } while (cursor !== '0');

        // Also clear specific provider cache just in case
        const dashboardKeys = await redis.keys('providers:dashboard*');
        if (dashboardKeys.length > 0) keysToDelete.push(...dashboardKeys);

        // Also clear public provider keys
        const publicKeys = await redis.keys('providers:public*');
        if (publicKeys.length > 0) keysToDelete.push(...publicKeys);

        if (keysToDelete.length > 0) {
            console.log(`Found ${keysToDelete.length} keys to delete:`, keysToDelete);
            await redis.del(keysToDelete);
            console.log('Keys deleted successfully.');
        } else {
            console.log('No keys found matching pattern.');
        }

    } catch (error) {
        console.error('Error clearing cache:', error);
    } finally {
        redis.disconnect();
        console.log('Disconnected');
    }
}

clearCache();
