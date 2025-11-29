# Migrations

Place TypeORM migration files in this directory.

Usage (CLI):

- Generate a migration:
  - npm run typeorm -- migration:generate src/database/migrations/<MigrationName>
- Run migrations:
  - npm run typeorm -- migration:run
- Revert last migration:
  - npm run typeorm -- migration:revert

The CLI uses the DataSource defined at `src/database/data-source.ts`.