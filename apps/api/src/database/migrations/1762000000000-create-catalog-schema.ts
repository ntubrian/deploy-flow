import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCatalogSchema1762000000000 implements MigrationInterface {
  name = 'CreateCatalogSchema1762000000000';

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "idx_product_categories_category_sale_product"'
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "idx_project_categories_category_project"'
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "idx_organization_categories_category_organization"'
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "idx_sale_products_created_at_id"'
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "idx_donation_projects_created_at_id"'
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "idx_organizations_created_at_id"'
    );
    await queryRunner.query('DROP INDEX IF EXISTS "idx_categories_sort_order_id"');

    await queryRunner.query('DROP TABLE IF EXISTS "product_categories"');
    await queryRunner.query('DROP TABLE IF EXISTS "project_categories"');
    await queryRunner.query('DROP TABLE IF EXISTS "organization_categories"');
    await queryRunner.query('DROP TABLE IF EXISTS "sale_products"');
    await queryRunner.query('DROP TABLE IF EXISTS "donation_projects"');
    await queryRunner.query('DROP TABLE IF EXISTS "organizations"');
    await queryRunner.query('DROP TABLE IF EXISTS "categories"');
    await queryRunner.query('DROP TABLE IF EXISTS "assets"');
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    await queryRunner.query(`
      CREATE TABLE "assets" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "url" varchar(2048) NOT NULL,
        "alt_text" varchar(255) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "pk_assets_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar(120) NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "pk_categories_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "organizations" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar(255) NOT NULL,
        "summary" text NOT NULL,
        "logo_asset_id" uuid NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "pk_organizations_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_organizations_logo_asset_id"
          FOREIGN KEY ("logo_asset_id")
          REFERENCES "assets"("id")
          ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "donation_projects" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "organization_id" uuid NOT NULL,
        "title" varchar(255) NOT NULL,
        "cover_asset_id" uuid NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "pk_donation_projects_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_donation_projects_organization_id"
          FOREIGN KEY ("organization_id")
          REFERENCES "organizations"("id")
          ON DELETE RESTRICT,
        CONSTRAINT "fk_donation_projects_cover_asset_id"
          FOREIGN KEY ("cover_asset_id")
          REFERENCES "assets"("id")
          ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "sale_products" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "organization_id" uuid NOT NULL,
        "title" varchar(255) NOT NULL,
        "price_amount" numeric(12,2) NOT NULL,
        "cover_asset_id" uuid NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "pk_sale_products_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_sale_products_organization_id"
          FOREIGN KEY ("organization_id")
          REFERENCES "organizations"("id")
          ON DELETE RESTRICT,
        CONSTRAINT "fk_sale_products_cover_asset_id"
          FOREIGN KEY ("cover_asset_id")
          REFERENCES "assets"("id")
          ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "organization_categories" (
        "organization_id" uuid NOT NULL,
        "category_id" uuid NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "pk_organization_categories" PRIMARY KEY ("organization_id", "category_id"),
        CONSTRAINT "fk_organization_categories_organization_id"
          FOREIGN KEY ("organization_id")
          REFERENCES "organizations"("id")
          ON DELETE CASCADE,
        CONSTRAINT "fk_organization_categories_category_id"
          FOREIGN KEY ("category_id")
          REFERENCES "categories"("id")
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "project_categories" (
        "donation_project_id" uuid NOT NULL,
        "category_id" uuid NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "pk_project_categories" PRIMARY KEY ("donation_project_id", "category_id"),
        CONSTRAINT "fk_project_categories_donation_project_id"
          FOREIGN KEY ("donation_project_id")
          REFERENCES "donation_projects"("id")
          ON DELETE CASCADE,
        CONSTRAINT "fk_project_categories_category_id"
          FOREIGN KEY ("category_id")
          REFERENCES "categories"("id")
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "product_categories" (
        "sale_product_id" uuid NOT NULL,
        "category_id" uuid NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "pk_product_categories" PRIMARY KEY ("sale_product_id", "category_id"),
        CONSTRAINT "fk_product_categories_sale_product_id"
          FOREIGN KEY ("sale_product_id")
          REFERENCES "sale_products"("id")
          ON DELETE CASCADE,
        CONSTRAINT "fk_product_categories_category_id"
          FOREIGN KEY ("category_id")
          REFERENCES "categories"("id")
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_categories_sort_order_id"
      ON "categories" ("sort_order" ASC, "id" ASC)
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_organizations_created_at_id"
      ON "organizations" ("created_at" DESC, "id" DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_donation_projects_created_at_id"
      ON "donation_projects" ("created_at" DESC, "id" DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_sale_products_created_at_id"
      ON "sale_products" ("created_at" DESC, "id" DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_organization_categories_category_organization"
      ON "organization_categories" ("category_id", "organization_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_project_categories_category_project"
      ON "project_categories" ("category_id", "donation_project_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_product_categories_category_sale_product"
      ON "product_categories" ("category_id", "sale_product_id")
    `);
  }
}
