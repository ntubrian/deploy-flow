<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

## project settings

```json
{
  "format": "codex_readable_context_v1",
  "language": "zh-TW",
  "topic": "AWS ECS Fargate 的角色 + 「不用碰 EC2」的精準含義",
  "final_conclusion": [
    "ECS Fargate 的角色＝讓你「只管容器怎麼跑」，不用自己管理用來跑容器的 EC2/Linux 主機。",
    "「不用碰 EC2」＝你通常不需要在自己的 AWS 帳號裡開 EC2 Linux、SSH 登入、裝 Docker/ECS Agent、打 OS patch、管主機容量與擴縮；這些由 AWS 代管。",
    "但這不代表世界上沒有 EC2：AWS 底層仍用機器承載工作負載，只是那不是你要維運、也不會讓你登入的主機。"
  ],
  "full_context": {
    "starting_architecture": {
      "frontend": "app.example.com -> CloudFront -> S3 (static site)",
      "backend": "api.example.com -> ALB -> ECS Fargate (NestJS container)",
      "database": "RDS PostgreSQL (or Aurora Serverless v2) in private subnets"
    },
    "what_is_ecs_fargate": {
      "ecs_definition": "ECS = orchestration/control plane，負責『管理』：決定跑幾個容器、部署/更新策略、健康檢查失敗就替換、與 ALB 掛載、Auto Scaling 等。",
      "fargate_definition": "Fargate = serverless compute for containers/data plane，負責『執行』：提供 CPU/RAM、把容器排到 AWS 代管的基礎設施上跑起來。",
      "one_liner": "ECS 負責『管』，Fargate 負責『跑』。"
    },
    "simple_analogy": {
      "restaurant_model": {
        "nestjs_container": "料理包（程式＋依賴都封裝好）",
        "ecs": "接單＋排班系統（決定哪道菜在哪個爐台做、做幾份、忙了要加開）",
        "fargate": "雲端中央廚房（爐台/瓦斯/清潔都由 AWS 管，你只交料理包就能出餐）"
      },
      "humor_note": "你只要專心把菜做好（容器），不用同時當廚師＋水電工＋清潔隊。"
    },
    "meaning_of_no_need_to_touch_ec2": {
      "what_you_typically_do_NOT_need_in_fargate": [
        "不需要在自己帳號裡建立 EC2、選 AMI、挑 instance type",
        "不需要 SSH 登入主機",
        "不需要管理 OS 更新/安全修補/重開機",
        "不需要安裝與維護 Docker、ECS Agent",
        "不需要自己做『主機層』擴容縮容（EC2 Auto Scaling）",
        "不需要處理主機壞掉/磁碟滿了/容量規劃等主機維運事項"
      ],
      "what_you_STILL_configure_in_fargate": [
        "ECS Task Definition：image、CPU/RAM、port、env、secrets、logging",
        "ECS Service：desired count、deployment strategy、auto scaling policy",
        "與 ALB 的整合：target group、health check path、listener rules",
        "網路與安全：VPC、subnets（公/私）、security groups、NAT（如需對外）",
        "觀測：CloudWatch logs/metrics、tracing（如 X-Ray/OpenTelemetry）",
        "權限：IAM task role / execution role（拉 image、寫 log、讀 secrets）"
      ],
      "important_caveat": "AWS 底層一定有運算主機（可視為 EC2/實體機），但那是 AWS 管、不是你管；你不會有『那台機器』可登入與維運。"
    },
    "how_it_fits_your_flow": {
      "request_path": "Client -> ALB -> (ECS Service) -> Fargate Tasks (NestJS containers) -> RDS (private)",
      "why_alb_exists": [
        "把流量分配到多個容器副本",
        "健康檢查：壞的 task 不中斷服務",
        "可以做 path-based routing（/v1/* -> service A）"
      ],
      "common_result": "你用『服務』的角度運營 API，而不是用『主機』的角度運營 API。"
    }
  }
}
```
