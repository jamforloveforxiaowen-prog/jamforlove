import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email").notNull().default(""),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["user", "admin"] })
    .notNull()
    .default("user"),
  name: text("name").notNull().default(""),
  phone: text("phone").notNull().default(""),
  address: text("address").notNull().default(""),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const passwordResetTokens = sqliteTable("password_reset_tokens", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  used: integer("used", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  price: integer("price").notNull(),
  imageUrl: text("image_url").notNull().default(""),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  notes: text("notes").notNull().default(""),
  status: text("status", {
    enum: ["pending", "confirmed", "shipped", "completed"],
  })
    .notNull()
    .default("pending"),
  total: integer("total").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const banners = sqliteTable("banners", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull().default(""),
  subtitle: text("subtitle").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const storyBlocks = sqliteTable("story_blocks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sortOrder: integer("sort_order").notNull().default(0),
  heading: text("heading").notNull().default(""),
  content: text("content").notNull(),
  imageUrl: text("image_url").notNull().default(""),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const cartItems = sqliteTable("cart_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

/* ─── 銷售活動 ────────────────────────────────────── */

export const campaigns = sqliteTable("campaigns", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  status: text("status", { enum: ["draft", "active", "closed"] })
    .notNull()
    .default("draft"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  // 開放/結束時間（HH:MM 格式），預設整天開放
  startTime: text("start_time").notNull().default("00:00"),
  endTime: text("end_time").notNull().default("23:59"),
  bannerUrl: text("banner_url").notNull().default(""),
  description: text("description").notNull().default(""),
  formStyle: text("form_style").notNull().default("classic"),
  // 舊客戶折扣（> 0 表示啟用支持者折扣選項）
  supporterDiscount: integer("supporter_discount").notNull().default(0),
  // JSON 陣列：支持者折扣選項，例 [{"label":"曾經購買","discount":10}]
  supportOptions: text("support_options").notNull().default("[]"),
  // JSON 陣列：取貨選項，例 ["小川阿姨","台大面交","宜蘭面交"]
  pickupOptions: text("pickup_options").notNull().default("[]"),
  // 草稿商品結構（編輯中尚未發佈），結構為 [{ name, isRequired, products: [...] }]
  // null 表示沒有未發佈變更
  draftPayload: text("draft_payload"),
  // 預覽連結用的 token（隨機字串）
  previewToken: text("preview_token"),
  // 上次發佈商品結構的時間
  publishedAt: text("published_at"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const campaignGroups = sqliteTable("campaign_groups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  campaignId: integer("campaign_id")
    .notNull()
    .references(() => campaigns.id),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  isRequired: integer("is_required", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const campaignProducts = sqliteTable("campaign_products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  campaignId: integer("campaign_id")
    .notNull()
    .references(() => campaigns.id),
  groupId: integer("group_id")
    .notNull()
    .references(() => campaignGroups.id),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  price: integer("price").notNull(),
  limit: integer("limit"),
  unit: text("unit").notNull().default("份"),
  sortOrder: integer("sort_order").notNull().default(0),
  note: text("note").notNull().default(""),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const campaignProductLimitLogs = sqliteTable(
  "campaign_product_limit_logs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    campaignId: integer("campaign_id")
      .notNull()
      .references(() => campaigns.id),
    productId: integer("product_id")
      .notNull()
      .references(() => campaignProducts.id),
    delta: integer("delta").notNull(),
    prevLimit: integer("prev_limit"),
    newLimit: integer("new_limit"),
    note: text("note").notNull().default(""),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  }
);

/* ─── 訂單 ──────────────────────────────────────── */

export const fundraiseOrders = sqliteTable("fundraise_orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull().default(""),
  address: text("address").notNull(),
  deliveryMethod: text("delivery_method", {
    enum: ["shipping", "pickup"],
  }).notNull().default("shipping"),
  items: text("items").notNull().default("[]"),
  combos: text("combos").notNull().default("[]"),
  addons: text("addons").notNull().default("[]"),
  paymentMethod: text("payment_method", {
    enum: ["cash", "transfer"],
  }).notNull().default("cash"),
  // 匯款後五碼（匯款付款時用於對帳）
  transferLast5: text("transfer_last5").notNull().default(""),
  isSupporter: integer("is_supporter", { mode: "boolean" }).notNull().default(false),
  supportType: text("support_type").notNull().default(""),
  discountAmount: integer("discount_amount").notNull().default(0),
  shippingFee: integer("shipping_fee").notNull().default(0),
  notes: text("notes").notNull().default(""),
  total: integer("total").notNull(),
  status: text("status", {
    enum: ["pending", "confirmed", "shipped", "completed"],
  }).notNull().default("pending"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

/* ─── 訂單修改申請 ─────────────────────────────── */

export const orderModifyRequests = sqliteTable("order_modify_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id")
    .notNull()
    .references(() => fundraiseOrders.id),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  handled: integer("handled", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
});
