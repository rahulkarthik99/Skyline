import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Businesses table - multi-tenant workspaces
export const businesses = pgTable("businesses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  businessName: text("business_name").notNull(),
  industry: text("industry").notNull(),
  plan: text("plan").notNull().default("FREE"),
  apiKey: varchar("api_key").default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
  apiKey: true,
  createdAt: true,
});
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businesses.$inferSelect;

// Subscriptions table - billing & plans
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: varchar("business_id").notNull().references(() => businesses.id),
  plan: text("plan").notNull(),
  status: text("status").notNull().default("active"),
  creditsTotal: integer("credits_total").notNull().default(100),
  creditsUsed: integer("credits_used").notNull().default(0),
  periodStart: timestamp("period_start").defaultNow(),
  periodEnd: timestamp("period_end"),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
});
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// Leads table - CRM
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: varchar("business_id").notNull().references(() => businesses.id),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  message: text("message"),
  source: text("source").default("web"),
  status: text("status").default("new"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

// Bot Settings table - per-business chatbot configuration
export const botSettings = pgTable("bot_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: varchar("business_id").notNull().references(() => businesses.id).unique(),
  systemPrompt: text("system_prompt"),
  theme: text("theme").default("dark"),
  welcomeMessage: text("welcome_message"),
  modelName: text("model_name").default("deepseek/deepseek-chat"),
});

export const insertBotSettingsSchema = createInsertSchema(botSettings).omit({
  id: true,
});
export type InsertBotSettings = z.infer<typeof insertBotSettingsSchema>;
export type BotSettings = typeof botSettings.$inferSelect;

// Conversations table - chat history
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: varchar("business_id").notNull().references(() => businesses.id),
  sessionId: varchar("session_id").notNull(),
  channel: text("channel").default("web"),
  externalThreadId: text("external_thread_id"),
  messages: text("messages").notNull().default("[]"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// Integration Channels - store per-business channel configurations
export const integrationChannels = pgTable("integration_channels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: varchar("business_id").notNull().references(() => businesses.id),
  channel: text("channel").notNull(),
  status: text("status").notNull().default("disconnected"),
  credentials: text("credentials"),
  webhookSecret: text("webhook_secret"),
  webhookUrl: text("webhook_url"),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertIntegrationChannelSchema = createInsertSchema(integrationChannels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertIntegrationChannel = z.infer<typeof insertIntegrationChannelSchema>;
export type IntegrationChannel = typeof integrationChannels.$inferSelect;

// Channel types for reference
export const CHANNEL_TYPES = {
  WHATSAPP: "whatsapp",
  INSTAGRAM: "instagram",
  MESSENGER: "messenger",
  TWITTER: "twitter",
  SHOPIFY: "shopify",
  WEB_WIDGET: "web_widget",
} as const;

export type ChannelType = typeof CHANNEL_TYPES[keyof typeof CHANNEL_TYPES];
