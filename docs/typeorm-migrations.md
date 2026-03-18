# TypeORM Migration Workflow

這份文件定義本專案日後建立、檢查、執行 TypeORM migration 的標準流程。

## 前提

- local database 使用 `docker-compose.dev.yml` 內的 PostgreSQL
- migration 一律由 TypeORM migration 檔管理，不開 `synchronize: true`
- 產生 migration 前，local database 必須先跑到目前最新 schema
- TypeORM CLI datasource 只用於 local create / generate 類指令
- `db-migration-run`、`db-migration-revert`、`db-migration-show` 走應用程式自己的 config loader，因此 local / staging / production 都會共用同一套 `APP_STAGE + AWS_SSM_PARAMETER_PREFIX` 規則

## 指令總覽

全部指令都在 repo root 執行：

```bash
pnpm nx run @deploy-flow/api:dev-db-up
pnpm nx run @deploy-flow/api:dev-db-down
pnpm nx run @deploy-flow/api:db-migration-run
pnpm nx run @deploy-flow/api:db-migration-revert
pnpm nx run @deploy-flow/api:db-migration-show
pnpm nx run @deploy-flow/api:db-migration-create --name=<migration-name>
pnpm nx run @deploy-flow/api:db-migration-generate --name=<migration-name>
pnpm nx run @deploy-flow/api:db-seed-run
```

## 標準流程

### 1. 啟動 local database

```bash
pnpm nx run @deploy-flow/api:dev-db-up
```

預設 `.env` 應至少包含：

```env
APP_STAGE=local
DB_HOST=127.0.0.1
DB_PORT=5433
DB_NAME=deploy_flow
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_SSL=false
```

### 2. 先把 database 跑到最新 migration

```bash
pnpm nx run @deploy-flow/api:db-migration-run
```

這一步不能跳。`migration:generate` 會拿目前 entities 跟實際資料庫 schema 做 diff；如果 local database 不是最新狀態，產出的 migration 很容易混進舊變更。

### 3. 修改 entity

例如修改：

- `apps/api/src/database/entities/*.entity.ts`

### 4. 先看目前 migration 狀態

```bash
pnpm nx run @deploy-flow/api:db-migration-show
```

### 5. 產生 migration

```bash
pnpm nx run @deploy-flow/api:db-migration-generate --name=add-organization-slug
```

產物會出現在：

- `apps/api/src/database/migrations/`

TypeORM 會自動在檔名前面加 timestamp。

### 6. 如果只想先開一個空 migration

```bash
pnpm nx run @deploy-flow/api:db-migration-create --name=backfill-organization-slug
```

這個指令不會做 schema diff，只會建立空白 migration 檔。

### 7. 檢查 migration 內容

確認：

- `up()` 只包含這次預期的 schema 變更
- `down()` 有正確 rollback
- 沒有不必要的 table recreate / column drop

### 8. 重新執行 migration 驗證

```bash
pnpm nx run @deploy-flow/api:db-migration-run
```

如果要檢查 rollback：

```bash
pnpm nx run @deploy-flow/api:db-migration-revert
pnpm nx run @deploy-flow/api:db-migration-run
```

### 9. 如有 demo data 需求，再補 seed

```bash
pnpm nx run @deploy-flow/api:db-seed-run
```

## 命名建議

建議 migration 名稱使用動詞開頭、描述單一變更：

- `add-organization-slug`
- `add-project-publish-status`
- `rename-sale-product-title`
- `backfill-category-sort-order`

避免：

- `update-stuff`
- `fix-db`
- `temp-change`

## 常見注意事項

- `db-migration-generate` 沒偵測到 schema 變更時，TypeORM 可能直接以非 0 code 結束
- 若 `DB_SSL=true`，請一併確認 `DB_SSL_ROOT_CERT_PATH` 是否指到正確檔案
- staging / production 不建議從開發者本機直接產 migration；migration 檔應在 local 產生、commit 後再透過 deploy workflow 執行
- 若 migration 內容明顯不合理，先確認 local DB 是否已經先跑到最新 migration

## Staging Deploy 流程

- staging deploy workflow 會固定執行 `db-migration-show -> db-migration-run -> db-migration-show`
- `db-migration-run` 不需要先手動判斷是否有新 migration；TypeORM 會依照 `typeorm_migrations` 自己判斷 pending migrations
- `db-migration-show` 會列出目前已套用與待套用 migration 名稱，且支援 staging / production 的 SSM config
- 若 staging 沒有新的 migration 檔需要套用，`db-migration-run` 會直接成功結束
- 若 migration 失敗，deploy workflow 會中止，不會繼續更新 API / client container
- `db-seed-run` 不會在 staging deploy 自動執行，避免覆寫既有資料
