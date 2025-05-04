import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1746336135417 implements MigrationInterface {
    name = ' $npmConfigName1746336135417'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "monthly_analytics" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "month" date NOT NULL, "totalViews" integer NOT NULL DEFAULT '0', "totalOrders" integer NOT NULL DEFAULT '0', "totalRevenue" numeric(12,2) NOT NULL DEFAULT '0', "totalNewUsers" integer NOT NULL DEFAULT '0', "topProductSlugs" text array, CONSTRAINT "PK_504549cf318c1f60f9b003378a5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product" ADD "views" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "order" ADD "total_price" numeric(10,2) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "total_price"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "views"`);
        await queryRunner.query(`DROP TABLE "monthly_analytics"`);
    }

}
