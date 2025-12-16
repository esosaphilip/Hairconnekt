import 'dotenv/config';
import { DataSource } from 'typeorm';

// Keep DataSource config aligned with AppModule so scripts use the same DB
const useSqlite = process.env.USE_SQLITE === 'true';
const url = process.env.DATABASE_URL;
const sslEnabled = process.env.DATABASE_SSL === 'true';

export const AppDataSource = new DataSource(
  useSqlite
    ? {
        type: 'sqlite',
        database: process.env.SQLITE_DB_PATH || 'dev-db.sqlite',
        synchronize: false,
        logging: false,
        // Limit entities to core modules to avoid compile-time errors from excluded modules during seeding/dev
        entities: [
          'src/modules/users/entities/*.entity{.ts,.js}',
          'src/modules/providers/entities/*.entity{.ts,.js}',
          'src/modules/services/entities/*.entity{.ts,.js}',
          'src/modules/appointments/entities/*.entity{.ts,.js}',
          'src/modules/reviews/entities/*.entity{.ts,.js}',
          'src/modules/portfolio/entities/*.entity{.ts,.js}',
        ],
        migrations: ['src/database/migrations/*{.ts,.js}'],
      }
    : url
    ? {
        type: 'postgres',
        url,
        ssl: sslEnabled ? { rejectUnauthorized: false } : false,
        synchronize: false,
        logging: false,
        entities: [
          'src/modules/users/entities/*.entity{.ts,.js}',
          'src/modules/providers/entities/*.entity{.ts,.js}',
          'src/modules/services/entities/*.entity{.ts,.js}',
          'src/modules/appointments/entities/*.entity{.ts,.js}',
          'src/modules/reviews/entities/*.entity{.ts,.js}',
          'src/modules/portfolio/entities/*.entity{.ts,.js}',
        ],
        migrations: ['src/database/migrations/*{.ts,.js}'],
      }
    : {
        type: 'postgres',
        host: process.env.DATABASE_HOST || 'localhost',
        port: Number(process.env.DATABASE_PORT || 5432),
        username: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'postgres',
        database: process.env.DATABASE_NAME || 'hairconnekt',
        ssl: sslEnabled ? { rejectUnauthorized: false } : false,
        synchronize: false,
        logging: false,
        entities: [
          'src/modules/users/entities/*.entity{.ts,.js}',
          'src/modules/providers/entities/*.entity{.ts,.js}',
          'src/modules/services/entities/*.entity{.ts,.js}',
          'src/modules/appointments/entities/*.entity{.ts,.js}',
          'src/modules/reviews/entities/*.entity{.ts,.js}',
          'src/modules/portfolio/entities/*.entity{.ts,.js}',
        ],
        migrations: ['src/database/migrations/*{.ts,.js}'],
      },
);