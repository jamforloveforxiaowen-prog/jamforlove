/**
 * 假訂單確認信測試寄送
 * 用法：npx tsx scripts/send-fake-order-email.ts <to-email>
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
  const to = process.argv[2];
  if (!to) {
    console.error("請指定收件人 email");
    process.exit(1);
  }

  const { sendOrderConfirmationEmail } = await import("../src/lib/email");

  await sendOrderConfirmationEmail(
    {
      customerName: "測試客人",
      email: to,
      combos: [
        {
          name: "Jam for Love 綜合禮盒",
          items: ["草莓果醬 × 1", "藍莓果醬 × 1", "手工餅乾 × 1"],
          quantity: 1,
          price: 680,
        },
      ],
      addons: [
        { name: "手寫卡片", quantity: 2, price: 50 },
      ],
      total: 830,
      discountAmount: 0,
      shippingFee: 80,
      deliveryMethod: "shipping",
      paymentMethod: "transfer",
      address: "台北市中正區測試路 1 號 2 樓",
      notes: "這是一封測試信,請忽略。",
      orderId: 9999,
      bankTransferInfo:
        "銀行：國泰世華 (013)\n帳號：000-000-0000000\n戶名：Jam for Love",
    },
    { bypassRateLimit: true }
  );

  console.log(`已寄出測試訂單確認信 → ${to}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
