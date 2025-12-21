import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddAllowOnlineBookingToServices1766320000000 implements MigrationInterface {
    name = 'AddAllowOnlineBookingToServices1766320000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if column exists to avoid errors on run
        const table = await queryRunner.getTable("services");
        const column = table?.findColumnByName("allow_online_booking");
        if (!column) {
            await queryRunner.addColumn("services", new TableColumn({
                name: "allow_online_booking",
                type: "boolean",
                default: true
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("services", "allow_online_booking");
    }
}
