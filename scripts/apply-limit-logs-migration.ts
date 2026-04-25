/**
 * 套用 0006_limit_logs.sql migration 到 Turso
 * 用法：npx tsx scripts/apply-limit-logs-migration.ts
 */
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnvOverride(path: string) {
  const content = readFileSync(path, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[m[1]] = val;
  }
}
loadEnvOverride(resolve(process.cwd(), ".env.local"));

async function main() {
  const { createClient } = await import("@libsql/client");
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const sqlFile = resolve(
    process.cwd(),
    "drizzle/0006_limit_logs.sql"
  );
  const sqlContent = readFileSync(sqlFile, "utf8");

  // 拆解 statement-breakpoint 分隔的 statements
  const statements = sqlContent
    .split(/-->\s*statement-breakpoint/g)
    .map((s) => s.trim())
    .filter(Boolean);

  console.log(`要執行 ${statements.length} 個 SQL statements`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    console.log(`\n[${i + 1}/${statements.length}] 執行：`);
    console.log(stmt.split("\n").slice(0, 3).join("\n") + "...");
    try {
      await client.execute(stmt);
      console.log("  ✓ 成功");
    } catch (e) {
      const msg = (e as Error).message;
      if (
        msg.includes("already exists") ||
        msg.includes("duplicate column")
      ) {
        console.log(`  · 已存在，略過：${msg}`);
      } else {
        throw e;
      }
    }
  }

  // 驗證表已建立
  const result = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='campaign_product_limit_logs'"
  );
  console.log(`\n驗證：表 campaign_product_limit_logs ${result.rows.length > 0 ? "已存在 ✓" : "未建立 ✗"}`);

  client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
