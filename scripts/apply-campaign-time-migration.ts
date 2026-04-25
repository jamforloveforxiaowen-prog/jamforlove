/**
 * 套用 0008_campaign_time.sql migration 到 Turso
 * 用法：npx tsx scripts/apply-campaign-time-migration.ts
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

  const sqlContent = readFileSync(
    resolve(process.cwd(), "drizzle/0008_campaign_time.sql"),
    "utf8"
  );
  const statements = sqlContent
    .split(/-->\s*statement-breakpoint/g)
    .map((s) => s.trim())
    .filter(Boolean);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    console.log(`[${i + 1}/${statements.length}] 執行：${stmt.slice(0, 80)}...`);
    try {
      await client.execute(stmt);
      console.log("  ✓ 成功");
    } catch (e) {
      const msg = (e as Error).message;
      if (msg.includes("duplicate column")) {
        console.log(`  · 欄位已存在，略過`);
      } else {
        throw e;
      }
    }
  }

  // 驗證
  const result = await client.execute("PRAGMA table_info('campaigns')");
  const hasStartTime = result.rows.some((r) => r.name === "start_time");
  const hasEndTime = result.rows.some((r) => r.name === "end_time");
  console.log(
    `\n驗證：start_time ${hasStartTime ? "✓" : "✗"} / end_time ${hasEndTime ? "✓" : "✗"}`
  );

  client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
