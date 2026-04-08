import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/* ── 寄信防濫用機制 ──────────────────────── */

// 全域：每小時最多寄 30 封
const GLOBAL_LIMIT = 30;
const GLOBAL_WINDOW_MS = 60 * 60 * 1000;
let globalSendCount = 0;
let globalWindowStart = Date.now();

// 每個收件人：每小時最多 3 封
const PER_RECIPIENT_LIMIT = 3;
const recipientStore = new Map<string, { count: number; windowStart: number }>();

function checkEmailRateLimit(recipient: string): { allowed: boolean; reason?: string } {
  const now = Date.now();

  // 全域限制
  if (now - globalWindowStart >= GLOBAL_WINDOW_MS) {
    globalSendCount = 0;
    globalWindowStart = now;
  }
  if (globalSendCount >= GLOBAL_LIMIT) {
    return { allowed: false, reason: `Global email limit exceeded (${GLOBAL_LIMIT}/hr)` };
  }

  // 單一收件人限制
  const key = recipient.toLowerCase();
  const record = recipientStore.get(key);
  if (record && now - record.windowStart < GLOBAL_WINDOW_MS) {
    if (record.count >= PER_RECIPIENT_LIMIT) {
      return { allowed: false, reason: `Per-recipient limit exceeded for ${key}` };
    }
    record.count += 1;
  } else {
    recipientStore.set(key, { count: 1, windowStart: now });
  }

  globalSendCount += 1;
  return { allowed: true };
}

// 驗證 email 格式，防止注入
function isValidEmail(email: string): boolean {
  if (email.length > 254) return false;
  // 基本格式檢查 + 禁止換行符（防止 header injection）
  const emailRegex = /^[^\s@\r\n]+@[^\s@\r\n]+\.[^\s@\r\n]+$/;
  return emailRegex.test(email);
}

interface OrderItem {
  name: string;
  items?: string[];
  quantity: number;
  price: number;
}

interface OrderEmailData {
  customerName: string;
  email: string;
  combos: OrderItem[];
  addons: OrderItem[];
  total: number;
  discountAmount?: number;
  deliveryMethod: string;
  address: string;
  notes: string;
  orderId: number;
}

// HTML escape 防止 XSS
function esc(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildOrderRows(combos: OrderItem[], addons: OrderItem[]) {
  let rows = "";

  for (const c of combos) {
    const itemsText = c.items ? c.items.join("、") : "";
    rows += `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px dashed #ebe2d4; color: #5c3d2e; font-size: 15px;">
          ${esc(c.name)}${itemsText ? `<br><span style="color: #5c3d2e80; font-size: 13px;">${esc(itemsText)}</span>` : ""}
        </td>
        <td style="padding: 10px 0; border-bottom: 1px dashed #ebe2d4; color: #5c3d2e; text-align: center; font-size: 15px;">×${c.quantity}</td>
        <td style="padding: 10px 0; border-bottom: 1px dashed #ebe2d4; color: #1e0f08; text-align: right; font-weight: 600; font-size: 15px;">NT$ ${c.price * c.quantity}</td>
      </tr>`;
  }

  for (const a of addons) {
    rows += `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px dashed #ebe2d4; color: #5c3d2e; font-size: 15px;">
          ${esc(a.name)}
        </td>
        <td style="padding: 10px 0; border-bottom: 1px dashed #ebe2d4; color: #5c3d2e; text-align: center; font-size: 15px;">×${a.quantity}</td>
        <td style="padding: 10px 0; border-bottom: 1px dashed #ebe2d4; color: #1e0f08; text-align: right; font-weight: 600; font-size: 15px;">NT$ ${a.price * a.quantity}</td>
      </tr>`;
  }

  return rows;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const {
    customerName, email, combos, addons,
    total, discountAmount, deliveryMethod, address, notes, orderId,
  } = data;

  if (!email) return;

  // 驗證 email 格式
  if (!isValidEmail(email)) {
    console.error("Invalid email format, skipping:", email);
    return;
  }

  // 檢查寄信頻率限制
  const rateCheck = checkEmailRateLimit(email);
  if (!rateCheck.allowed) {
    console.error("Email rate limit hit:", rateCheck.reason);
    return;
  }

  const deliveryText = deliveryMethod === "shipping" ? "郵寄" : "面交 / 暨大取貨";
  const safeNotes = notes ? esc(notes) : "";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background: #faf6f0; font-family: 'Georgia', serif;">
  <div style="max-width: 520px; margin: 0 auto; padding: 40px 24px;">

    <!-- 標頭 -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-size: 26px; color: #1e0f08; margin: 0 0 4px; font-style: italic;">Jam for Love</h1>
      <p style="color: #5c3d2e80; font-size: 14px; margin: 0;">~ 用愛手工熬煮 ~</p>
      <div style="margin-top: 16px;">
        <span style="color: #c4506a;">— ♥ —</span>
      </div>
    </div>

    <!-- 問候 -->
    <div style="background: white; border-radius: 12px; padding: 28px 24px; border: 2px dashed #ebe2d4;">
      <p style="color: #1e0f08; font-size: 17px; margin: 0 0 8px; font-weight: 600;">
        ${esc(customerName)}，你好！
      </p>
      <p style="color: #5c3d2e; font-size: 15px; line-height: 1.7; margin: 0;">
        收到你的心意了！謝謝你支持 Jam for Love，你的每一份溫暖，都是學生們繼續手作的最大動力。
      </p>
    </div>

    <!-- 訂單明細 -->
    <div style="margin-top: 20px; background: white; border-radius: 12px; padding: 24px; border: 2px dashed #ebe2d4;">
      <h2 style="font-size: 18px; color: #1e0f08; margin: 0 0 4px; font-style: italic;">訂單明細</h2>
      <p style="color: #5c3d2e80; font-size: 13px; margin: 0 0 16px;">訂單編號 #${orderId}</p>

      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align: left; padding-bottom: 8px; border-bottom: 2px dashed #ebe2d4; color: #5c3d2e80; font-size: 13px; font-weight: 500;">品項</th>
            <th style="text-align: center; padding-bottom: 8px; border-bottom: 2px dashed #ebe2d4; color: #5c3d2e80; font-size: 13px; font-weight: 500;">數量</th>
            <th style="text-align: right; padding-bottom: 8px; border-bottom: 2px dashed #ebe2d4; color: #5c3d2e80; font-size: 13px; font-weight: 500;">小計</th>
          </tr>
        </thead>
        <tbody>
          ${buildOrderRows(combos, addons)}
        </tbody>
      </table>

      <!-- 合計 -->
      <div style="margin-top: 16px; padding-top: 16px; border-top: 2px dashed rgba(196,80,106,0.25);">
        ${discountAmount && discountAmount > 0 ? `
        <table style="width: 100%; margin-bottom: 8px;"><tr>
          <td style="font-size: 14px; color: #5c3d2e; font-weight: 500;">小計</td>
          <td style="font-size: 14px; color: #5c3d2e; text-align: right;">NT$ ${total + discountAmount}</td>
        </tr></table>
        <table style="width: 100%; margin-bottom: 8px;"><tr>
          <td style="font-size: 14px; color: #c4506a; font-weight: 500;">♥ 舊朋友折扣</td>
          <td style="font-size: 14px; color: #c4506a; text-align: right;">-NT$ ${discountAmount}</td>
        </tr></table>
        ` : ""}
        <table style="width: 100%;"><tr>
          <td style="font-size: 16px; color: #1e0f08; font-weight: 600;">合計</td>
          <td style="font-size: 22px; color: #c4506a; font-weight: 700; text-align: right;">NT$ ${total}</td>
        </tr></table>
      </div>
    </div>

    <!-- 收件資訊 -->
    <div style="margin-top: 20px; background: white; border-radius: 12px; padding: 24px; border: 2px dashed #ebe2d4;">
      <h2 style="font-size: 18px; color: #1e0f08; margin: 0 0 16px; font-style: italic;">收件資訊</h2>
      <table style="width: 100%;">
        <tr>
          <td style="padding: 6px 0; color: #5c3d2e80; font-size: 14px; width: 80px;">姓名</td>
          <td style="padding: 6px 0; color: #1e0f08; font-size: 15px;">${esc(customerName)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #5c3d2e80; font-size: 14px;">取貨方式</td>
          <td style="padding: 6px 0; color: #1e0f08; font-size: 15px;">${deliveryText}</td>
        </tr>
        ${deliveryMethod === "shipping" ? `
        <tr>
          <td style="padding: 6px 0; color: #5c3d2e80; font-size: 14px;">寄送地址</td>
          <td style="padding: 6px 0; color: #1e0f08; font-size: 15px;">${esc(address)}</td>
        </tr>` : ""}
        ${safeNotes ? `
        <tr>
          <td style="padding: 6px 0; color: #5c3d2e80; font-size: 14px;">備註</td>
          <td style="padding: 6px 0; color: #1e0f08; font-size: 15px;">${safeNotes}</td>
        </tr>` : ""}
      </table>
    </div>

    <!-- 結尾 -->
    <div style="text-align: center; margin-top: 28px; padding: 24px;">
      <p style="color: #5c3d2e; font-size: 15px; line-height: 1.7; margin: 0 0 8px;">
        我們會用心為你準備每一份商品，<br>
        有任何問題都歡迎隨時聯繫我們！
      </p>
      <p style="color: #c4506a; font-size: 20px; margin: 16px 0 0;">♥</p>
    </div>

    <!-- 頁尾 -->
    <div style="border-top: 1px solid #ebe2d4; margin-top: 24px; padding-top: 20px; text-align: center;">
      <p style="color: #5c3d2e60; font-size: 12px; margin: 0; line-height: 1.6;">
        Jam for Love — 用愛手工熬煮<br>
        此為系統自動發送的訂單確認信，請勿直接回覆
      </p>
    </div>

  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Jam for Love" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `收到你的心意了！— 訂單 #${orderId} 確認`,
    html,
  });
}
