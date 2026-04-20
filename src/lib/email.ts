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
  shippingFee?: number;
  deliveryMethod: string;
  paymentMethod?: string;
  address: string;
  notes: string;
  orderId: number;
  bankTransferInfo?: string;
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

interface RenderOptions {
  isCorrection?: boolean;
}

export function renderOrderConfirmationHtml(data: OrderEmailData, opts: RenderOptions = {}): string {
  const {
    customerName, combos, addons,
    total, discountAmount, shippingFee, deliveryMethod, paymentMethod, address, notes,
    bankTransferInfo,
  } = data;

  const isShipping = deliveryMethod === "shipping";
  const pickupLocation = address ? esc(address) : "面交";
  const deliveryText = isShipping ? "郵寄" : `面交 — ${pickupLocation}`;
  const safeNotes = notes ? esc(notes) : "";
  const showBankInfo = paymentMethod === "transfer" && !!bankTransferInfo;

  const correctionNotice = opts.isCorrection ? `
    <div style="background: #fff5f5; border: 2px solid #c4506a; border-radius: 12px; padding: 18px 20px; margin-bottom: 20px;">
      <p style="color: #c4506a; font-size: 15px; font-weight: 700; margin: 0 0 8px;">訂單資訊更正通知</p>
      <p style="color: #5c3d2e; font-size: 14px; line-height: 1.7; margin: 0 0 10px;">
        先前寄出的訂單確認信，「取貨方式」欄位固定顯示為「面交 / 暨大取貨」，未呈現您實際選擇的地點。在此為您補上完整、正確的訂單資訊。造成困擾，非常抱歉！
      </p>
      <p style="color: #5c3d2e80; font-size: 12px; line-height: 1.6; margin: 0;">
        此信為系統自動寄送，請勿直接回覆本信件。如需聯繫，請來信 jam.for.love.wny@gmail.com。
      </p>
    </div>
  ` : "";

  return `
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

    ${correctionNotice}

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
      <h2 style="font-size: 18px; color: #1e0f08; margin: 0 0 16px; font-style: italic;">訂單明細</h2>

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
        ${(discountAmount && discountAmount > 0) || (shippingFee && shippingFee > 0) ? `
        <table style="width: 100%; margin-bottom: 8px;"><tr>
          <td style="font-size: 14px; color: #5c3d2e; font-weight: 500;">小計</td>
          <td style="font-size: 14px; color: #5c3d2e; text-align: right;">NT$ ${total - (shippingFee || 0) + (discountAmount || 0)}</td>
        </tr></table>
        ` : ""}
        ${discountAmount && discountAmount > 0 ? `
        <table style="width: 100%; margin-bottom: 8px;"><tr>
          <td style="font-size: 14px; color: #c4506a; font-weight: 500;">♥ 支持者折扣</td>
          <td style="font-size: 14px; color: #c4506a; text-align: right;">-NT$ ${discountAmount}</td>
        </tr></table>
        ` : ""}
        ${shippingFee && shippingFee > 0 ? `
        <table style="width: 100%; margin-bottom: 8px;"><tr>
          <td style="font-size: 14px; color: #5c3d2e; font-weight: 500;">運費</td>
          <td style="font-size: 14px; color: #5c3d2e; text-align: right;">NT$ ${shippingFee}</td>
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
        <tr>
          <td style="padding: 6px 0; color: #5c3d2e80; font-size: 14px;">付款方式</td>
          <td style="padding: 6px 0; color: #1e0f08; font-size: 15px;">${paymentMethod === "transfer" ? "匯款" : "現金"}</td>
        </tr>
        ${isShipping ? `
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

    ${showBankInfo ? `
    <!-- 匯款資訊 -->
    <div style="margin-top: 20px; background: #fff9ed; border-radius: 12px; padding: 24px; border: 2px dashed #d4b88a;">
      <h2 style="font-size: 18px; color: #1e0f08; margin: 0 0 12px; font-style: italic;">匯款資訊</h2>
      <p style="color: #5c3d2e; font-size: 15px; line-height: 1.8; margin: 0; white-space: pre-wrap;">${esc(bankTransferInfo!)}</p>
    </div>` : ""}

    <!-- 結尾 -->
    <div style="text-align: center; margin-top: 28px; padding: 24px;">
      <p style="color: #5c3d2e; font-size: 15px; line-height: 1.7; margin: 0 0 8px;">
        我們會用心為你準備每一份商品，<br>
        有任何問題都歡迎隨時聯繫我們！
      </p>
      <p style="color: #5c3d2e; font-size: 14px; line-height: 1.6; margin: 0;">
        聯絡信箱：<a href="mailto:jam.for.love.wny@gmail.com" style="color: #c4506a; text-decoration: none;">jam.for.love.wny@gmail.com</a>
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
}

interface SendOptions extends RenderOptions {
  bypassRateLimit?: boolean;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData, opts: SendOptions = {}) {
  const { email } = data;

  if (!email) return;

  if (!isValidEmail(email)) {
    console.error("Invalid email format, skipping:", email);
    return;
  }

  if (!opts.bypassRateLimit) {
    const rateCheck = checkEmailRateLimit(email);
    if (!rateCheck.allowed) {
      console.error("Email rate limit hit:", rateCheck.reason);
      return;
    }
  }

  const html = renderOrderConfirmationHtml(data, opts);
  const subjectPrefix = opts.isCorrection ? "【更正版】" : "";

  await transporter.sendMail({
    from: `"Jam for Love" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `${subjectPrefix}收到你的心意了！— 訂單確認`,
    html,
  });
}

/* ── 訂單修改通知信（寄給管理員）──── */

interface ModifyNotificationData {
  orderId: number;
  customerName: string;
  phone: string;
  campaignName: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  message: string;
  notifyEmails: string[];
}

export async function sendOrderModifyNotification(data: ModifyNotificationData) {
  const { orderId, customerName, phone, campaignName, items, total, message, notifyEmails } = data;

  const itemRows = items.map((i) =>
    `<tr>
      <td style="padding: 6px 0; border-bottom: 1px dashed #ebe2d4; color: #5c3d2e; font-size: 14px;">${esc(i.name)}</td>
      <td style="padding: 6px 0; border-bottom: 1px dashed #ebe2d4; color: #5c3d2e; text-align: center; font-size: 14px;">×${i.quantity}</td>
      <td style="padding: 6px 0; border-bottom: 1px dashed #ebe2d4; color: #1e0f08; text-align: right; font-size: 14px;">NT$ ${i.price * i.quantity}</td>
    </tr>`
  ).join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background: #faf6f0; font-family: 'Georgia', serif;">
  <div style="max-width: 520px; margin: 0 auto; padding: 40px 24px;">

    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="font-size: 22px; color: #1e0f08; margin: 0 0 4px;">訂單修改通知</h1>
      <p style="color: #c4506a; font-size: 14px; margin: 0;">訂單 #${orderId}</p>
    </div>

    <div style="background: white; border-radius: 12px; padding: 24px; border: 2px dashed #ebe2d4; margin-bottom: 16px;">
      <h2 style="font-size: 16px; color: #1e0f08; margin: 0 0 12px;">用戶資訊</h2>
      <table style="width: 100%;">
        <tr><td style="padding: 4px 0; color: #5c3d2e80; font-size: 14px; width: 60px;">姓名</td><td style="padding: 4px 0; color: #1e0f08; font-size: 14px;">${esc(customerName)}</td></tr>
        <tr><td style="padding: 4px 0; color: #5c3d2e80; font-size: 14px;">電話</td><td style="padding: 4px 0; color: #1e0f08; font-size: 14px;">${esc(phone)}</td></tr>
      </table>
    </div>

    <div style="background: white; border-radius: 12px; padding: 24px; border: 2px dashed #ebe2d4; margin-bottom: 16px;">
      <h2 style="font-size: 16px; color: #1e0f08; margin: 0 0 4px;">原訂單內容</h2>
      ${campaignName ? `<p style="color: #5c3d2e80; font-size: 13px; margin: 0 0 12px;">${esc(campaignName)}</p>` : ""}
      <table style="width: 100%; border-collapse: collapse;">
        ${itemRows}
      </table>
      <div style="margin-top: 12px; padding-top: 12px; border-top: 2px dashed rgba(196,80,106,0.25);">
        <table style="width: 100%;"><tr>
          <td style="font-size: 14px; color: #1e0f08; font-weight: 600;">合計</td>
          <td style="font-size: 18px; color: #c4506a; font-weight: 700; text-align: right;">NT$ ${total}</td>
        </tr></table>
      </div>
    </div>

    <div style="background: #fff5f5; border-radius: 12px; padding: 24px; border: 2px dashed #c4506a40;">
      <h2 style="font-size: 16px; color: #c4506a; margin: 0 0 8px;">修改內容</h2>
      <p style="color: #1e0f08; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${esc(message)}</p>
    </div>

    <div style="border-top: 1px solid #ebe2d4; margin-top: 24px; padding-top: 20px; text-align: center;">
      <p style="color: #5c3d2e60; font-size: 12px; margin: 0;">Jam for Love — 訂單修改通知（系統自動發送）</p>
    </div>
  </div>
</body>
</html>`;

  // 寄給所有管理員
  for (const email of notifyEmails) {
    if (!isValidEmail(email)) continue;
    const rateCheck = checkEmailRateLimit(email);
    if (!rateCheck.allowed) {
      console.error("Email rate limit hit for admin:", rateCheck.reason);
      continue;
    }
    await transporter.sendMail({
      from: `"Jam for Love" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `訂單修改通知 — #${orderId} ${customerName}`,
      html,
    });
  }
}
