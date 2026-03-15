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
