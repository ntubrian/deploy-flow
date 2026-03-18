# deploy-flow

## 專案範圍

目前只實作 `fig.pen` 已定義的 donation catalog 列表流程：

- 公益團體列表
- 捐款專案列表
- 義賣商品列表
- 搜尋
- 類別篩選 modal
- infinite scroll / 分頁
- 搜尋中 / 無結果狀態

目前不做：

- 卡片點擊後 detail page
- 捐款流程
- 商品購物車 / 結帳
- 後台

## Web 基本驗證策略

- 這一層是 `shared secret access gate`，用途是保護 web preview / internal access，不是正式會員登入系統
- 前端不保存原始 secret key 到 `localStorage`、`sessionStorage` 或一般可被 JavaScript 讀取的 cookie
- 首次進站時，前端先呼叫 `GET /api/auth/session`
- 若 API 回 `401`，前端顯示 key 輸入流程；MVP 可先用原生 prompt，後續可換成自製 modal
- 使用者輸入 key 後，前端呼叫 `POST /api/auth/access-key`
- API 驗證成功後，回傳 `HttpOnly + Secure + SameSite=Strict` 的 session cookie
- 後續 API / GraphQL request 一律使用 cookie session，前端 request 預設帶 `credentials: 'include'`
- API 層使用全域 guard 驗證 cookie，白名單只保留 `auth/access-key`、`auth/session`、`health`
- session cookie 存的是驗證後的 session，不是原始 shared secret
- EC2 部署時，shared secret 與 cookie signing secret 預設存放在 AWS Systems Manager Parameter Store `SecureString`
- 若未來需要自動 rotation、跨區域 replication 或更完整的 secret lifecycle，再升級為 AWS Secrets Manager
- EC2 instance 透過 IAM role / instance profile 讀取 secret，應用程式啟動時載入到記憶體中使用，不在每個 request 重抓
- 需要額外補強 rate limit、失敗登入紀錄、session 過期時間與 key rotation 機制

## 後端設定來源策略

- `APP_STAGE=local` 時，database 預設連到本機 Docker PostgreSQL，可用 `.env` 覆寫 host / port / db name / username / password / ssl
- `APP_STAGE=local` 時，web gate secrets 也從 local `.env` 讀取，不依賴 AWS SSM
- `APP_STAGE=staging` 或 `APP_STAGE=production` 時，database connection 與 web gate secrets 都從 AWS Systems Manager Parameter Store 讀取
- 本機開發只有在你主動驗證 non-local stage 設定時，才需要 AWS CLI / AWS SSO 登入與對應 parameter path / KMS decrypt 權限
- 若目標 PostgreSQL 需要自訂 CA 憑證，使用一般 env `DB_SSL_ROOT_CERT_PATH` 指向 container 內的憑證檔案路徑；此值不放 SSM
- 建議 Parameter Store 命名規則為：
- `/<service>/<stage>/api/database/host`
- `/<service>/<stage>/api/database/port`
- `/<service>/<stage>/api/database/name`
- `/<service>/<stage>/api/database/username`
- `/<service>/<stage>/api/database/password`
- `/<service>/<stage>/api/database/ssl`
- `/<service>/<stage>/api/web-gate/shared-secret`
- `/<service>/<stage>/api/web-gate/session-secret`

## Migration 策略

- local / dev 的 migration 可由開發者手動執行，用來驗證本機 Docker PostgreSQL schema
- staging migration 由 deploy workflow 在 EC2 上先執行 `db-migration-show -> db-migration-run -> db-migration-show`，再更新 container
- staging migration 不建議由開發者從本機手動連 staging database 執行
- production migration 也應走 deploy workflow，並在 release 過程中確保同一時間只會有一個 migration job 執行
- deploy workflow 內的 migration job 應使用與應用程式相同的 SSM 參數來源與 IAM 權限
- rollback 不應預設自動執行；若 migration 失敗，先停止 release，再依 migration 內容決定人工 rollback 策略

## Local API 開發流程

- 啟動本機 PostgreSQL：`pnpm nx run @deploy-flow/api:dev-db-up`
- 執行 migration：`pnpm nx run @deploy-flow/api:db-migration-run`
- 查看 migration 狀態：`pnpm nx run @deploy-flow/api:db-migration-show`
- 產生 migration：`pnpm nx run @deploy-flow/api:db-migration-generate --name=<migration-name>`
- 建立空白 migration：`pnpm nx run @deploy-flow/api:db-migration-create --name=<migration-name>`
- 寫入 demo seed：`pnpm nx run @deploy-flow/api:db-seed-run`
- 啟動 API：`pnpm nx serve @deploy-flow/api`
- local Docker PostgreSQL host port：`5433`
- local 預設不需要 AWS 登入；只要 `.env` 內的 DB 與 `WEB_GATE_*` 設定齊全即可
- local GraphQL Sandbox：`http://localhost:3000/api/graphql`
- local Swagger UI：`http://localhost:3000/api/docs/`
- local OpenAPI JSON：`http://localhost:3000/api/openapi.json`
- 詳細 migration 流程文件：`docs/typeorm-migrations.md`
- 若要關閉本機 PostgreSQL：`pnpm nx run @deploy-flow/api:dev-db-down`

## Staging API 操作規則

- staging GraphQL Sandbox 路徑固定為 `https://stg.bin-hq.com/api/graphql`
- staging Swagger UI 路徑固定為 `https://stg.bin-hq.com/api/docs/`
- staging OpenAPI JSON 路徑固定為 `https://stg.bin-hq.com/api/openapi.json`
- staging deploy 時，GitHub Actions 會把 `APP_STAGE=staging` 與 `AWS_SSM_PARAMETER_PREFIX` 傳給 EC2 上的 compose stack
- staging deploy 會先在 EC2 repo checkout 上執行 `pnpm nx run @deploy-flow/api:db-migration-show`、`db-migration-run`、`db-migration-show`
- staging host 需要有 `node`、`corepack/pnpm` 與 workspace dependencies，deploy workflow 會在 `git pull` 後執行 `pnpm install --frozen-lockfile`
- 若 staging RDS 需要 CA bundle，先把憑證放到 EC2 的 `deploy/certs/rds/`，再把 GitHub Actions environment variable `STAGING_DB_SSL_ROOT_CERT_PATH` 設成 container 內路徑，例如 `/run/certs/rds/ap-southeast-2-bundle.pem`
- deploy workflow 會用上述 container 路徑自動推導 host 端 migration runner 的憑證路徑，例如 `${STAGING_APP_DIR}/deploy/certs/rds/ap-southeast-2-bundle.pem`
- `ap-southeast-2` 的 RDS CA bundle 可從 `https://truststore.pki.rds.amazonaws.com/ap-southeast-2/ap-southeast-2-bundle.pem` 下載到 `deploy/certs/rds/ap-southeast-2-bundle.pem`
- staging 的 `api` / `client` / `nginx` container logs 會透過 Docker `awslogs` driver 送到 CloudWatch Logs，預設 log group 分別為 `/deploy-flow/staging/api`、`/deploy-flow/staging/client`、`/deploy-flow/staging/nginx`
- 若要改名，可在 deploy shell 額外提供 `CLOUDWATCH_LOG_GROUP_API`、`CLOUDWATCH_LOG_GROUP_CLIENT`、`CLOUDWATCH_LOG_GROUP_NGINX`
- EC2 instance role 需要至少具備 `logs:CreateLogGroup`、`logs:CreateLogStream`、`logs:PutLogEvents`、`logs:DescribeLogStreams`
- staging demo seed 不建議在每次 deploy 自動執行；應保留為手動 job 或另開管理指令

## 進度維護規則

- 未完成：`- [ ] 任務名稱`
- 完成後再改成：`- [x] 任務名稱（YYYY-MM-DD）`
- 先不要預先打勾；確認完成後再逐項補日期

## 前端進度

### 基本驗證

- [ ] 建立首次進站 `auth/session` 檢查流程
- [ ] 建立 shared secret 輸入 UI
- [ ] 建立驗證失敗時重試輸入流程
- [ ] 建立驗證成功後重試資料載入流程
- [ ] 設定前端 API client 預設帶 `credentials: 'include'`
- [ ] 建立未驗證前阻擋 catalog query 的規則
- [ ] 建立驗證失敗提示文案

### GraphQL Client

- [x] 建立 Apollo GraphQL client（2026-03-18）
- [x] 設定 ApolloProvider 掛到前端 root route（2026-03-18）
- [x] 設定 GraphQL client 預設帶 `credentials: 'include'`（2026-03-18）
- [x] 建立前端 catalog query documents（2026-03-18）

### 頁面骨架

- [x] 建立 donation catalog 頁面路由（2026-03-18）
- [x] 建立頁面外層 layout（2026-03-18）
- [x] 建立頁首標題區塊（2026-03-18）
- [x] 建立三個 tab 切換區塊（2026-03-18）
- [x] 建立 tab active state 樣式（2026-03-18）
- [x] 建立 tab 切換事件與狀態管理（2026-03-18）

### 搜尋與篩選 UI

- [x] 建立搜尋輸入框元件（2026-03-18）
- [x] 建立搜尋 icon 按鈕（2026-03-18）
- [x] 建立搜尋 placeholder 文案（2026-03-18）
- [x] 建立搜尋輸入狀態（2026-03-18）
- [x] 建立搜尋 debounce（2026-03-18）
- [x] 建立搜尋清空行為（2026-03-18）
- [x] 建立搜尋送出後重置分頁行為（2026-03-18）
- [x] 建立類別篩選 trigger（2026-03-18）
- [x] 建立所有類別 modal 容器（2026-03-18）
- [x] 建立 modal header（2026-03-18）
- [x] 建立 modal 關閉按鈕（2026-03-18）
- [x] 建立類別 chip/button 元件（2026-03-18）
- [x] 建立類別選取 active state（2026-03-18）
- [x] 建立類別切換後重置分頁行為（2026-03-18）
- [x] 建立 modal 關閉後保留目前篩選狀態（2026-03-18）

### 公益團體列表

- [x] 建立公益團體卡元件（2026-03-18）
- [x] 顯示團體 logo（2026-03-18）
- [x] 顯示團體名稱（2026-03-18）
- [x] 顯示團體簡介（2026-03-18）
- [x] 建立公益團體列表容器（2026-03-18）
- [x] 串接公益團體 query（2026-03-18）
- [x] 套用公益團體 keyword 搜尋（2026-03-18）
- [x] 套用公益團體 category 篩選（2026-03-18）
- [x] 套用公益團體 infinite scroll（2026-03-18）

### 捐款專案列表

- [x] 建立捐款專案卡元件（2026-03-18）
- [x] 顯示專案封面圖（2026-03-18）
- [x] 顯示所屬團體名稱（2026-03-18）
- [x] 顯示專案標題（2026-03-18）
- [x] 顯示專案類別 tags（2026-03-18）
- [x] 建立捐款專案列表容器（2026-03-18）
- [x] 串接捐款專案 query（2026-03-18）
- [x] 套用捐款專案 keyword 搜尋（2026-03-18）
- [x] 套用捐款專案 category 篩選（2026-03-18）
- [x] 套用捐款專案 infinite scroll（2026-03-18）

### 義賣商品列表

- [x] 建立義賣商品卡元件（2026-03-18）
- [x] 顯示商品封面圖（2026-03-18）
- [x] 顯示所屬團體名稱（2026-03-18）
- [x] 顯示商品名稱（2026-03-18）
- [x] 顯示商品價格（2026-03-18）
- [x] 建立義賣商品列表容器（2026-03-18）
- [x] 串接義賣商品 query（2026-03-18）
- [x] 套用義賣商品 keyword 搜尋（2026-03-18）
- [x] 套用義賣商品 category 篩選（2026-03-18）
- [x] 套用義賣商品 infinite scroll（2026-03-18）

### 共用狀態處理

- [x] 建立搜尋中 loading UI（2026-03-18）
- [x] 建立列表初次載入 loading UI（2026-03-18）
- [x] 建立載入更多 loading UI（2026-03-18）
- [x] 建立搜尋無結果 UI（2026-03-18）
- [x] 建立 API error UI（2026-03-18）
- [ ] 建立 tab 切換時的資料重置規則
- [x] 建立 keyword 與 category 同步查詢規則（2026-03-18）

### 前端測試

- [ ] 測首次進站未通過驗證會先進入 key 驗證流程
- [ ] 測驗證成功後可正常載入 catalog
- [ ] 測驗證失敗時不會載入 catalog
- [ ] 測 tab 切換顯示正確列表
- [ ] 測搜尋輸入會觸發正確 query 參數
- [ ] 測類別 modal 開關行為
- [ ] 測類別選取 active state
- [ ] 測切換類別後列表重置
- [ ] 測 infinite scroll 追加資料
- [ ] 測無結果畫面
- [ ] 測 API error 畫面

## 後端進度

### 基礎建設

- database schema 變更一律走 migration，不使用 TypeORM auto sync / `synchronize: true`

- [x] 安裝 `express`（2026-03-17）
- [x] 安裝 `@apollo/server`（2026-03-17）
- [x] 安裝 `@as-integrations/express5`（2026-03-17）
- [x] 安裝 TypeORM database driver（2026-03-17）
- [x] 建立 Express app bootstrap（2026-03-17）
- [x] 建立 Apollo GraphQL middleware 設定（2026-03-17）
- [x] 建立 TypeORM `DataSource` 設定（2026-03-17）
- [x] 確認所有環境關閉 TypeORM auto sync（2026-03-17）
- [x] 建立環境變數設定檔（2026-03-17）
- [x] 定義 `local full env + non-local full SSM` 設定策略（2026-03-17）

### Staging / Deploy

- [x] 設定 staging API 透過 SSM 讀取 database 與 web gate secrets（2026-03-17）
- [x] 設定 staging RDS CA bundle 掛載到 API container（2026-03-17）
- [x] 設定 staging `api` / `client` / `nginx` logs 送到 CloudWatch Logs（2026-03-17）
- [x] 設定 staging deploy 先執行 migration 再更新 container（2026-03-18）
- [x] 驗證 staging `/api/health` 可用（2026-03-17）
- [x] 驗證 staging `/api/graphql` 可載入 Apollo Sandbox（2026-03-17）

### 基本驗證 / Security

- [ ] 建立 `POST /api/auth/access-key`
- [ ] 建立 `GET /api/auth/session`
- [ ] 建立 shared secret 驗證 service
- [ ] 建立 session cookie 簽發邏輯
- [ ] 建立 session 驗證邏輯
- [ ] 建立全域 auth middleware
- [ ] 設定 auth whitelist
- [ ] 加入 cookie parser
- [x] 設定 CORS credentials 策略（2026-03-17）
- [x] 定義 SSM shared secret 載入策略（2026-03-17）
- [x] 定義 SSM session secret 載入策略（2026-03-17）
- [ ] 定義 cookie expiration 設定
- [ ] 加入 auth rate limiting
- [x] 定義 EC2 啟動時讀取 secret 的策略（2026-03-17）
- [x] 定義 Parameter Store / Secrets Manager secret 路徑命名（2026-03-17）

### 資料表 / Entity

- [x] 建立 `AssetEntity`（2026-03-17）
- [x] 建立 `CategoryEntity`（2026-03-17）
- [x] 建立 `OrganizationEntity`（2026-03-17）
- [x] 建立 `DonationProjectEntity`（2026-03-17）
- [x] 建立 `SaleProductEntity`（2026-03-17）
- [x] 建立 `OrganizationCategoryEntity`（2026-03-17）
- [x] 建立 `ProjectCategoryEntity`（2026-03-17）
- [x] 建立 `ProductCategoryEntity`（2026-03-17）
- [x] 設定 organization -> logo relation（2026-03-17）
- [x] 設定 organization -> categories relation（2026-03-17）
- [x] 設定 donation project -> organization relation（2026-03-17）
- [x] 設定 donation project -> categories relation（2026-03-17）
- [x] 設定 donation project -> cover relation（2026-03-17）
- [x] 設定 sale product -> organization relation（2026-03-17）
- [x] 設定 sale product -> categories relation（2026-03-17）
- [x] 設定 sale product -> cover relation（2026-03-17）

### Migration / Seed

- [x] 建立初始 migration（2026-03-18）
- [x] 建立 migration 執行指令（2026-03-17）
- [x] 建立 migration rollback 指令（2026-03-17）
- [x] 建立 categories seed（2026-03-18）
- [x] 建立 organizations seed（2026-03-18）
- [x] 建立 donation projects seed（2026-03-18）
- [x] 建立 sale products seed（2026-03-18）
- [x] 建立 asset seed（2026-03-18）
- [x] 建立 organization_categories seed（2026-03-18）
- [x] 建立 project_categories seed（2026-03-18）
- [x] 建立 product_categories seed（2026-03-18）
- [x] 建立 seed 執行指令（2026-03-17）
- [ ] 驗證 seed 後三個 tab 都有資料

### Repository Pattern

- [x] 建立 TypeORM `AssetRepository` implementation（2026-03-18）
- [x] 建立 TypeORM `CategoryRepository` implementation（2026-03-18）
- [x] 建立 TypeORM `OrganizationRepository` implementation（2026-03-18）
- [x] 建立 TypeORM `DonationProjectRepository` implementation（2026-03-18）
- [x] 建立 TypeORM `SaleProductRepository` implementation（2026-03-18）
- [x] 建立 request-scoped catalog DataLoader（2026-03-18）

### Query 邏輯

- 所有列表 pagination 一律採用 cursor-based pagination strategy

- [x] 實作公益團體 keyword 搜尋（2026-03-18）
- [x] 實作公益團體 category 篩選（2026-03-18）
- [x] 實作公益團體 cursor pagination（2026-03-18）
- [x] 實作捐款專案 keyword 搜尋（2026-03-18）
- [x] 實作捐款專案 category 篩選（2026-03-18）
- [x] 實作捐款專案 cursor pagination（2026-03-18）
- [x] 實作捐款專案 categories 載入（2026-03-18）
- [x] 實作義賣商品 keyword 搜尋（2026-03-18）
- [x] 實作義賣商品 category 篩選（2026-03-18）
- [x] 實作義賣商品 cursor pagination（2026-03-18）
- [x] 實作義賣商品 categories 載入（2026-03-18）
- [x] 實作義賣商品 price 欄位返回（2026-03-18）
- [x] 實作 categories 排序查詢（2026-03-18）

### GraphQL Schema / Resolver

- [x] 建立 code-first GraphQL schema 建構流程（2026-03-18）
- [x] 自動產出 `graphql/schema.graphql`（2026-03-18）
- [x] 建立 `Asset` GraphQL type（2026-03-18）
- [x] 建立 `Category` GraphQL type（2026-03-18）
- [x] 建立 `Organization` GraphQL type（2026-03-18）
- [x] 建立 `DonationProject` GraphQL type（2026-03-18）
- [x] 建立 `SaleProduct` GraphQL type（2026-03-18）
- [x] 建立 `PageInfo` GraphQL type（2026-03-18）
- [x] 建立 `OrganizationConnection` type（2026-03-18）
- [x] 建立 `DonationProjectConnection` type（2026-03-18）
- [x] 建立 `SaleProductConnection` type（2026-03-18）
- [x] 建立 `CatalogConnectionArgs`（2026-03-18）
- [x] 建立 catalog query resolver（2026-03-18）
- [x] 建立 `OrganizationResolver`（2026-03-18）
- [x] 建立 `DonationProjectResolver`（2026-03-18）
- [x] 建立 `SaleProductResolver`（2026-03-18）

### 後端測試

- [ ] 測 `POST /api/auth/access-key` 驗證成功
- [ ] 測 `POST /api/auth/access-key` 驗證失敗
- [ ] 測 `GET /api/auth/session` 未登入回 401
- [ ] 測 `GET /api/auth/session` 已登入回成功
- [ ] 測全域 auth guard 會擋住未授權 request
- [ ] 測過期 session cookie 會被拒絕
- [x] 測 cursor pagination helper（2026-03-18）
- [x] 測 catalog DataLoader 映射（2026-03-18）
- [x] 測 catalog query resolver input / output（2026-03-18）
- [x] 測 code-first schema 產出內容（2026-03-18）
- [x] 測 field resolvers 透過 DataLoader 取值（2026-03-18）
- [ ] 測 seed 後 query 可正常回資料

## Nx 常用指令

```bash
pnpm nx show projects
pnpm nx test @deploy-flow/api
pnpm nx test @deploy-flow/client
pnpm nx test @deploy-flow/api-e2e
```
