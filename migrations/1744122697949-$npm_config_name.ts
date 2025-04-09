import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1744122697949 implements MigrationInterface {
    name = ' $npmConfigName1744122697949'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "refreshToken" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "refreshToken"`);
    }

}
