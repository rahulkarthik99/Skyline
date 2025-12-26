import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc, and } from "drizzle-orm";
import {
  users,
  businesses,
  subscriptions,
  leads,
  botSettings,
  conversations,
  integrationChannels,
  type User,
  type InsertUser,
  type Business,
  type InsertBusiness,
  type Subscription,
  type InsertSubscription,
  type Lead,
  type InsertLead,
  type BotSettings,
  type InsertBotSettings,
  type Conversation,
  type InsertConversation,
  type IntegrationChannel,
  type InsertIntegrationChannel,
} from "@shared/schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Businesses
  getBusiness(id: string): Promise<Business | undefined>;
  getBusinessByApiKey(apiKey: string): Promise<Business | undefined>;
  getBusinessesByUserId(userId: string): Promise<Business[]>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  updateBusiness(id: string, data: Partial<Business>): Promise<Business | undefined>;

  // Subscriptions
  getSubscription(businessId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription | undefined>;

  // Leads
  getLeads(businessId: string): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, data: Partial<Lead>): Promise<Lead | undefined>;

  // Bot Settings
  getBotSettings(businessId: string): Promise<BotSettings | undefined>;
  createBotSettings(settings: InsertBotSettings): Promise<BotSettings>;
  updateBotSettings(businessId: string, data: Partial<BotSettings>): Promise<BotSettings | undefined>;

  // Conversations
  getConversation(businessId: string, sessionId: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, messages: string): Promise<Conversation | undefined>;

  // Integration Channels
  getIntegrationChannels(businessId: string): Promise<IntegrationChannel[]>;
  getIntegrationChannel(businessId: string, channel: string): Promise<IntegrationChannel | undefined>;
  createIntegrationChannel(integration: InsertIntegrationChannel): Promise<IntegrationChannel>;
  updateIntegrationChannel(id: string, data: Partial<IntegrationChannel>): Promise<IntegrationChannel | undefined>;
  deleteIntegrationChannel(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  // Businesses
  async getBusiness(id: string): Promise<Business | undefined> {
    const result = await db.select().from(businesses).where(eq(businesses.id, id));
    return result[0];
  }

  async getBusinessByApiKey(apiKey: string): Promise<Business | undefined> {
    const result = await db.select().from(businesses).where(eq(businesses.apiKey, apiKey));
    return result[0];
  }

  async getBusinessesByUserId(userId: string): Promise<Business[]> {
    return await db.select().from(businesses).where(eq(businesses.userId, userId));
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    const result = await db.insert(businesses).values(business).returning();
    return result[0];
  }

  async updateBusiness(id: string, data: Partial<Business>): Promise<Business | undefined> {
    const result = await db.update(businesses).set(data).where(eq(businesses.id, id)).returning();
    return result[0];
  }

  // Subscriptions
  async getSubscription(businessId: string): Promise<Subscription | undefined> {
    const result = await db.select().from(subscriptions).where(eq(subscriptions.businessId, businessId));
    return result[0];
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const result = await db.insert(subscriptions).values(subscription).returning();
    return result[0];
  }

  async updateSubscription(id: string, data: Partial<Subscription>): Promise<Subscription | undefined> {
    const result = await db.update(subscriptions).set(data).where(eq(subscriptions.id, id)).returning();
    return result[0];
  }

  // Leads
  async getLeads(businessId: string): Promise<Lead[]> {
    return await db.select().from(leads).where(eq(leads.businessId, businessId)).orderBy(desc(leads.createdAt));
  }

  async getLead(id: string): Promise<Lead | undefined> {
    const result = await db.select().from(leads).where(eq(leads.id, id));
    return result[0];
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const result = await db.insert(leads).values(lead).returning();
    return result[0];
  }

  async updateLead(id: string, data: Partial<Lead>): Promise<Lead | undefined> {
    const result = await db.update(leads).set(data).where(eq(leads.id, id)).returning();
    return result[0];
  }

  // Bot Settings
  async getBotSettings(businessId: string): Promise<BotSettings | undefined> {
    const result = await db.select().from(botSettings).where(eq(botSettings.businessId, businessId));
    return result[0];
  }

  async createBotSettings(settings: InsertBotSettings): Promise<BotSettings> {
    const result = await db.insert(botSettings).values(settings).returning();
    return result[0];
  }

  async updateBotSettings(businessId: string, data: Partial<BotSettings>): Promise<BotSettings | undefined> {
    const result = await db.update(botSettings).set(data).where(eq(botSettings.businessId, businessId)).returning();
    return result[0];
  }

  // Conversations
  async getConversation(businessId: string, sessionId: string): Promise<Conversation | undefined> {
    const result = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.businessId, businessId), eq(conversations.sessionId, sessionId)));
    return result[0];
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const result = await db.insert(conversations).values(conversation).returning();
    return result[0];
  }

  async updateConversation(id: string, messages: string): Promise<Conversation | undefined> {
    const result = await db
      .update(conversations)
      .set({ messages, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return result[0];
  }

  // Integration Channels
  async getIntegrationChannels(businessId: string): Promise<IntegrationChannel[]> {
    return await db.select().from(integrationChannels).where(eq(integrationChannels.businessId, businessId));
  }

  async getIntegrationChannel(businessId: string, channel: string): Promise<IntegrationChannel | undefined> {
    const result = await db
      .select()
      .from(integrationChannels)
      .where(and(eq(integrationChannels.businessId, businessId), eq(integrationChannels.channel, channel)));
    return result[0];
  }

  async createIntegrationChannel(integration: InsertIntegrationChannel): Promise<IntegrationChannel> {
    const result = await db.insert(integrationChannels).values(integration).returning();
    return result[0];
  }

  async updateIntegrationChannel(id: string, data: Partial<IntegrationChannel>): Promise<IntegrationChannel | undefined> {
    const result = await db
      .update(integrationChannels)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(integrationChannels.id, id))
      .returning();
    return result[0];
  }

  async deleteIntegrationChannel(id: string): Promise<void> {
    await db.delete(integrationChannels).where(eq(integrationChannels.id, id));
  }
}

export const storage = new DatabaseStorage();
