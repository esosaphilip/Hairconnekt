import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAdminRole1761800100000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "users_user_type_enum" ADD VALUE 'ADMIN'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Enums cannot easily remove values in Postgres without recreating the type
    }
}
