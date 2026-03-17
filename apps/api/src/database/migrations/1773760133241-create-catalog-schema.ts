import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCatalogSchema1773760133241 implements MigrationInterface {
    name = 'CreateCatalogSchema1773760133241'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sale_products" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "cover_asset_id" uuid NOT NULL, "organization_id" uuid NOT NULL, "price_amount" numeric(12,2) NOT NULL, "title" character varying(255) NOT NULL, CONSTRAINT "PK_671035d8536ad74771c78804d6e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_sale_products_organization_id" ON "sale_products" ("organization_id") `);
        await queryRunner.query(`CREATE INDEX "idx_sale_products_cover_asset_id" ON "sale_products" ("cover_asset_id") `);
        await queryRunner.query(`CREATE INDEX "idx_sale_products_created_at_id" ON "sale_products" ("created_at", "id") `);
        await queryRunner.query(`CREATE TABLE "product_categories" ("category_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "sale_product_id" uuid NOT NULL, CONSTRAINT "PK_e900dbddc4d935c35e15e98191e" PRIMARY KEY ("category_id", "sale_product_id"))`);
        await queryRunner.query(`CREATE INDEX "idx_product_categories_category_sale_product" ON "product_categories" ("category_id", "sale_product_id") `);
        await queryRunner.query(`CREATE TABLE "project_categories" ("category_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "donation_project_id" uuid NOT NULL, CONSTRAINT "PK_e3f803b2a68ae6413724b424176" PRIMARY KEY ("category_id", "donation_project_id"))`);
        await queryRunner.query(`CREATE INDEX "idx_project_categories_category_project" ON "project_categories" ("category_id", "donation_project_id") `);
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying(120) NOT NULL, "sort_order" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_categories_sort_order_id" ON "categories" ("sort_order", "id") `);
        await queryRunner.query(`CREATE TABLE "organization_categories" ("category_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "organization_id" uuid NOT NULL, CONSTRAINT "PK_1116d896cfceafe70dc424f623f" PRIMARY KEY ("category_id", "organization_id"))`);
        await queryRunner.query(`CREATE INDEX "idx_organization_categories_category_organization" ON "organization_categories" ("category_id", "organization_id") `);
        await queryRunner.query(`CREATE TABLE "organizations" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "logo_asset_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "summary" text NOT NULL, CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_organizations_logo_asset_id" ON "organizations" ("logo_asset_id") `);
        await queryRunner.query(`CREATE INDEX "idx_organizations_created_at_id" ON "organizations" ("created_at", "id") `);
        await queryRunner.query(`CREATE TABLE "donation_projects" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "cover_asset_id" uuid NOT NULL, "organization_id" uuid NOT NULL, "title" character varying(255) NOT NULL, CONSTRAINT "PK_95e67ebb7c94c3212799b494cdd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_donation_projects_organization_id" ON "donation_projects" ("organization_id") `);
        await queryRunner.query(`CREATE INDEX "idx_donation_projects_cover_asset_id" ON "donation_projects" ("cover_asset_id") `);
        await queryRunner.query(`CREATE INDEX "idx_donation_projects_created_at_id" ON "donation_projects" ("created_at", "id") `);
        await queryRunner.query(`CREATE TABLE "assets" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "alt_text" character varying(255) NOT NULL, "url" character varying(2048) NOT NULL, CONSTRAINT "PK_da96729a8b113377cfb6a62439c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "sale_products" ADD CONSTRAINT "FK_965d7372f31cd6bcb4f47f974ca" FOREIGN KEY ("cover_asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sale_products" ADD CONSTRAINT "FK_d36d1b81a542c4ff351f63e4a72" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_categories" ADD CONSTRAINT "FK_9148da8f26fc248e77a387e3112" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_categories" ADD CONSTRAINT "FK_074b3425975e978712a9e03486c" FOREIGN KEY ("sale_product_id") REFERENCES "sale_products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "project_categories" ADD CONSTRAINT "FK_678d720a87c534b1043688d8d96" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "project_categories" ADD CONSTRAINT "FK_75f09a37381a00ef40efd5c32d9" FOREIGN KEY ("donation_project_id") REFERENCES "donation_projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization_categories" ADD CONSTRAINT "FK_d962c9a0f8de3a2310e53e9f0fa" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization_categories" ADD CONSTRAINT "FK_6624cac5a4f0b4d0d36f1366f13" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organizations" ADD CONSTRAINT "FK_a9ae6e19168f0f55e7b1266ae93" FOREIGN KEY ("logo_asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "donation_projects" ADD CONSTRAINT "FK_77dbe322cfa174d39af1a4ebf3a" FOREIGN KEY ("cover_asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "donation_projects" ADD CONSTRAINT "FK_5270f5700bbac38b6bf33217a5f" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "donation_projects" DROP CONSTRAINT "FK_5270f5700bbac38b6bf33217a5f"`);
        await queryRunner.query(`ALTER TABLE "donation_projects" DROP CONSTRAINT "FK_77dbe322cfa174d39af1a4ebf3a"`);
        await queryRunner.query(`ALTER TABLE "organizations" DROP CONSTRAINT "FK_a9ae6e19168f0f55e7b1266ae93"`);
        await queryRunner.query(`ALTER TABLE "organization_categories" DROP CONSTRAINT "FK_6624cac5a4f0b4d0d36f1366f13"`);
        await queryRunner.query(`ALTER TABLE "organization_categories" DROP CONSTRAINT "FK_d962c9a0f8de3a2310e53e9f0fa"`);
        await queryRunner.query(`ALTER TABLE "project_categories" DROP CONSTRAINT "FK_75f09a37381a00ef40efd5c32d9"`);
        await queryRunner.query(`ALTER TABLE "project_categories" DROP CONSTRAINT "FK_678d720a87c534b1043688d8d96"`);
        await queryRunner.query(`ALTER TABLE "product_categories" DROP CONSTRAINT "FK_074b3425975e978712a9e03486c"`);
        await queryRunner.query(`ALTER TABLE "product_categories" DROP CONSTRAINT "FK_9148da8f26fc248e77a387e3112"`);
        await queryRunner.query(`ALTER TABLE "sale_products" DROP CONSTRAINT "FK_d36d1b81a542c4ff351f63e4a72"`);
        await queryRunner.query(`ALTER TABLE "sale_products" DROP CONSTRAINT "FK_965d7372f31cd6bcb4f47f974ca"`);
        await queryRunner.query(`DROP TABLE "assets"`);
        await queryRunner.query(`DROP INDEX "public"."idx_donation_projects_created_at_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_donation_projects_cover_asset_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_donation_projects_organization_id"`);
        await queryRunner.query(`DROP TABLE "donation_projects"`);
        await queryRunner.query(`DROP INDEX "public"."idx_organizations_created_at_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_organizations_logo_asset_id"`);
        await queryRunner.query(`DROP TABLE "organizations"`);
        await queryRunner.query(`DROP INDEX "public"."idx_organization_categories_category_organization"`);
        await queryRunner.query(`DROP TABLE "organization_categories"`);
        await queryRunner.query(`DROP INDEX "public"."idx_categories_sort_order_id"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP INDEX "public"."idx_project_categories_category_project"`);
        await queryRunner.query(`DROP TABLE "project_categories"`);
        await queryRunner.query(`DROP INDEX "public"."idx_product_categories_category_sale_product"`);
        await queryRunner.query(`DROP TABLE "product_categories"`);
        await queryRunner.query(`DROP INDEX "public"."idx_sale_products_created_at_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_sale_products_cover_asset_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_sale_products_organization_id"`);
        await queryRunner.query(`DROP TABLE "sale_products"`);
    }

}
