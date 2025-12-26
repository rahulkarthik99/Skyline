import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Secure JWT secret - must be set in environment
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET not set. Please configure this in your secrets.");
}

// Default system prompt for new businesses
const DEFAULT_SYSTEM_PROMPT = `You are SkylineKAI 🏙️, the Real Estate AI assistant.

Context:
- You specialize in real estate and help users BUY 🏠, SELL 💰, or RENT 🏘️ properties
- You're friendly, enthusiastic, and professional with a warm personality
- Always greet users warmly and use emojis to make conversations engaging
- You ask smart follow-up questions: budget 💵, location 📌, BHK 🛏️, property type 🏢, urgency ⏰
- When user shows intent, gently collect their contact details for follow-up

Rules:
- Always start with a warm greeting! 👋
- Use emojis naturally throughout responses 😊
- Keep responses conversational and structured
- Show enthusiasm when helping users! 🎉
`;

// OpenRouter client using Replit AI Integrations
let openai: OpenAI | null = null;
if (process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL && process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY) {
  openai = new OpenAI({
    baseURL: process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL,
    apiKey: process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY,
  });
} else {
  console.warn("WARNING: OpenRouter integration not configured. Chat features will be limited.");
}

// Validation schemas
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const businessSchema = z.object({
  businessName: z.string().min(1),
  industry: z.string().min(1),
});

const leadSchema = z.object({
  businessId: z.string(),
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  message: z.string().optional(),
  source: z.string().optional(),
});

const chatSchema = z.object({
  history: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
  })).optional(),
  message: z.string().optional(),
  businessId: z.string().optional(),
  sessionId: z.string().optional(),
}).refine(data => data.history || data.message, {
  message: "Either 'history' or 'message' is required",
});

const botSettingsSchema = z.object({
  systemPrompt: z.string().optional(),
  theme: z.string().optional(),
  welcomeMessage: z.string().optional(),
  modelName: z.string().optional(),
});

// Extended request type with user context
interface AuthenticatedRequest extends Request {
  userId?: string;
}

// JWT verification helper
function verifyToken(token: string): { userId: string } | null {
  if (!JWT_SECRET) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

// Authentication middleware
function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.userId = decoded.userId;
  next();
}

// Business ownership verification helper
async function verifyBusinessOwnership(userId: string, businessId: string): Promise<boolean> {
  const business = await storage.getBusiness(businessId);
  return business?.userId === userId;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ===================== AUTH =====================

  app.post("/api/signup", async (req, res) => {
    try {
      if (!JWT_SECRET) {
        return res.status(500).json({ error: "Server configuration error" });
      }

      const { email, password, name } = signupSchema.parse(req.body);
      
      // Check if user exists
      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name,
      });

      // Generate token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

      res.json({ 
        token, 
        user: { id: user.id, email: user.email, name: user.name } 
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      res.status(400).json({ error: error.message || "Signup failed" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      if (!JWT_SECRET) {
        return res.status(500).json({ error: "Server configuration error" });
      }

      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

      res.json({ 
        token, 
        user: { id: user.id, email: user.email, name: user.name } 
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(401).json({ error: error.message || "Login failed" });
    }
  });

  app.get("/api/me", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ user: { id: user.id, email: user.email, name: user.name } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===================== BUSINESSES =====================

  app.get("/api/businesses", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const businesses = await storage.getBusinessesByUserId(req.userId!);
      res.json({ businesses });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/businesses", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { businessName, industry } = businessSchema.parse(req.body);
      
      const business = await storage.createBusiness({
        userId: req.userId!,
        businessName,
        industry,
        plan: "FREE",
      });

      // Create default bot settings
      await storage.createBotSettings({
        businessId: business.id,
        systemPrompt: DEFAULT_SYSTEM_PROMPT,
        theme: "dark",
        welcomeMessage: "👋 Hello! I'm your AI assistant. How can I help you today?",
      });

      // Create free subscription
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      
      await storage.createSubscription({
        businessId: business.id,
        plan: "FREE",
        status: "active",
        creditsTotal: 100,
        creditsUsed: 0,
        periodEnd,
      });

      res.json({ business });
    } catch (error: any) {
      console.error("Create business error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/businesses/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const business = await storage.getBusiness(req.params.id);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }

      // Verify ownership
      if (business.userId !== req.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      res.json({ business });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===================== LEADS / CRM =====================

  app.get("/api/leads/:businessId", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      // Verify business ownership
      const isOwner = await verifyBusinessOwnership(req.userId!, req.params.businessId);
      if (!isOwner) {
        return res.status(403).json({ error: "Access denied" });
      }

      const leads = await storage.getLeads(req.params.businessId);
      res.json({ leads });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const data = leadSchema.parse(req.body);
      
      // Verify business exists (leads can be created by widgets without auth)
      const business = await storage.getBusiness(data.businessId);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }

      const lead = await storage.createLead({
        ...data,
        source: data.source || "web",
        status: "new",
      });
      res.json({ lead });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/leads/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const lead = await storage.getLead(req.params.id);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }

      // Verify business ownership
      const isOwner = await verifyBusinessOwnership(req.userId!, lead.businessId);
      if (!isOwner) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updated = await storage.updateLead(req.params.id, req.body);
      res.json({ lead: updated });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ===================== BOT SETTINGS =====================

  app.get("/api/bot-settings/:businessId", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      // Verify business ownership
      const isOwner = await verifyBusinessOwnership(req.userId!, req.params.businessId);
      if (!isOwner) {
        return res.status(403).json({ error: "Access denied" });
      }

      const settings = await storage.getBotSettings(req.params.businessId);
      res.json({ settings });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/bot-settings/:businessId", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      // Verify business ownership
      const isOwner = await verifyBusinessOwnership(req.userId!, req.params.businessId);
      if (!isOwner) {
        return res.status(403).json({ error: "Access denied" });
      }

      const data = botSettingsSchema.parse(req.body);
      let settings = await storage.getBotSettings(req.params.businessId);
      
      if (!settings) {
        settings = await storage.createBotSettings({
          businessId: req.params.businessId,
          ...data,
        });
      } else {
        settings = await storage.updateBotSettings(req.params.businessId, data);
      }
      
      res.json({ settings });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ===================== SUBSCRIPTIONS =====================

  app.get("/api/subscriptions/:businessId", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      // Verify business ownership
      const isOwner = await verifyBusinessOwnership(req.userId!, req.params.businessId);
      if (!isOwner) {
        return res.status(403).json({ error: "Access denied" });
      }

      const subscription = await storage.getSubscription(req.params.businessId);
      res.json({ subscription });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===================== CHATBOT =====================

  app.post("/api/chat", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      if (!openai) {
        return res.status(503).json({ 
          error: "AI service not configured",
          reply: "Sorry, the AI service is currently unavailable. Please try again later. 🔧"
        });
      }

      const { history, message, businessId: requestedBusinessId } = chatSchema.parse(req.body);
      
      // Build message history - either use provided history or create from single message
      const chatHistory = history || (message ? [{ role: "user" as const, content: message }] : []);

      // Determine the business to use - either from request or user's first business
      let businessId = requestedBusinessId;
      if (businessId) {
        // Verify ownership of the requested business
        const isOwner = await verifyBusinessOwnership(req.userId!, businessId);
        if (!isOwner) {
          return res.status(403).json({ error: "Access denied" });
        }
      } else {
        // Get user's first business as fallback
        const businesses = await storage.getBusinessesByUserId(req.userId!);
        if (businesses.length > 0) {
          businessId = businesses[0].id;
        }
      }

      // Get bot settings for the business
      let systemPrompt = DEFAULT_SYSTEM_PROMPT;
      if (businessId) {
        const settings = await storage.getBotSettings(businessId);
        if (settings?.systemPrompt) {
          systemPrompt = settings.systemPrompt;
        }

        // Update credits used
        const subscription = await storage.getSubscription(businessId);
        if (subscription) {
          await storage.updateSubscription(subscription.id, {
            creditsUsed: (subscription.creditsUsed || 0) + 1,
          });
        }
      }

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...chatHistory,
      ];

      const completion = await openai.chat.completions.create({
        model: "deepseek/deepseek-chat",
        messages,
      });

      const reply = completion.choices[0]?.message?.content || 
                    "Sorry, I couldn't process that right now. 😅 Please try again!";

      res.json({ reply });
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ 
        error: "Failed to get response",
        reply: "Sorry, I'm having trouble right now. Please try again! 😅"
      });
    }
  });

  // Widget chat endpoint (uses API key instead of JWT)
  // Handle CORS preflight for widget
  app.options("/api/widget/chat", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, X-API-Key");
    res.sendStatus(200);
  });

  app.post("/api/widget/chat", async (req, res) => {
    // Enable CORS for widget
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, X-API-Key");
    try {
      if (!openai) {
        return res.status(503).json({ 
          error: "AI service not configured",
          reply: "Sorry, the AI service is currently unavailable. 🔧"
        });
      }

      const apiKey = req.headers["x-api-key"] as string;
      if (!apiKey) {
        return res.status(401).json({ error: "API key required" });
      }

      const business = await storage.getBusinessByApiKey(apiKey);
      if (!business) {
        return res.status(401).json({ error: "Invalid API key" });
      }

      const { history, sessionId } = req.body;
      
      const settings = await storage.getBotSettings(business.id);
      const systemPrompt = settings?.systemPrompt || DEFAULT_SYSTEM_PROMPT;

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...history,
      ];

      const completion = await openai.chat.completions.create({
        model: settings?.modelName || "deepseek/deepseek-chat",
        messages,
      });

      const reply = completion.choices[0]?.message?.content || 
                    "Sorry, I couldn't process that right now. 😅";

      // Update credits
      const subscription = await storage.getSubscription(business.id);
      if (subscription) {
        await storage.updateSubscription(subscription.id, {
          creditsUsed: (subscription.creditsUsed || 0) + 1,
        });
      }

      res.json({ reply, welcomeMessage: settings?.welcomeMessage });
    } catch (error: any) {
      console.error("Widget chat error:", error);
      res.status(500).json({ 
        error: "Failed to get response",
        reply: "Sorry, I'm having trouble right now. 😅"
      });
    }
  });

  // ===================== WEBHOOKS =====================

  // WhatsApp webhook for Twilio
  app.post("/api/whatsapp-webhook", async (req, res) => {
    try {
      if (!openai) {
        const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Service temporarily unavailable</Message></Response>`;
        return res.type("text/xml").send(twiml);
      }

      const { From, Body } = req.body;
      console.log("WhatsApp message received:", { From, Body });

      const messages = [
        { role: "system" as const, content: DEFAULT_SYSTEM_PROMPT },
        { role: "user" as const, content: Body || "" },
      ];

      const completion = await openai.chat.completions.create({
        model: "deepseek/deepseek-chat",
        messages,
      });

      const reply = completion.choices[0]?.message?.content || 
                    "Sorry, I couldn't process that right now. 😅";

      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${reply}</Message>
</Response>`;

      res.type("text/xml");
      res.send(twiml);
    } catch (error: any) {
      console.error("WhatsApp webhook error:", error);
      const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Sorry, an error occurred.</Message></Response>`;
      res.type("text/xml").send(twiml);
    }
  });

  // Instagram webhook
  app.post("/api/instagram-webhook", async (req, res) => {
    try {
      const body = req.body;
      console.log("Instagram webhook payload:", JSON.stringify(body, null, 2));

      if (body.object === "instagram") {
        body.entry?.forEach((entry: any) => {
          entry.messaging?.forEach((event: any) => {
            if (event.message?.text) {
              console.log("Instagram message:", event.message.text);
            }
          });
        });
      }

      res.status(200).json({ status: "ok" });
    } catch (error: any) {
      console.error("Instagram webhook error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/instagram-webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN || "skylinekai_verify_token";

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Instagram webhook verified!");
      res.status(200).send(challenge);
    } else {
      res.status(403).send("Forbidden");
    }
  });

  // ===================== INTEGRATIONS =====================

  // Get all integrations for a business (sanitized - no credentials exposed)
  app.get("/api/integrations/:businessId", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const isOwner = await verifyBusinessOwnership(req.userId!, req.params.businessId);
      if (!isOwner) {
        return res.status(403).json({ error: "Access denied" });
      }

      const integrations = await storage.getIntegrationChannels(req.params.businessId);
      
      // Sanitize response - remove sensitive credentials
      const sanitizedIntegrations = integrations.map(integration => ({
        id: integration.id,
        businessId: integration.businessId,
        channel: integration.channel,
        status: integration.status,
        webhookUrl: integration.webhookUrl,
        lastSyncedAt: integration.lastSyncedAt,
        createdAt: integration.createdAt,
        updatedAt: integration.updatedAt,
        // Only indicate if credentials exist, don't expose values
        hasCredentials: !!integration.credentials,
      }));
      
      res.json({ integrations: sanitizedIntegrations });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create or update an integration
  app.post("/api/integrations/:businessId", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const isOwner = await verifyBusinessOwnership(req.userId!, req.params.businessId);
      if (!isOwner) {
        return res.status(403).json({ error: "Access denied" });
      }

      const { channel, credentials, webhookSecret } = req.body;
      
      // Check if integration already exists
      const existing = await storage.getIntegrationChannel(req.params.businessId, channel);
      
      // Generate webhook URL for this business
      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}`
        : `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
      const webhookUrl = `${baseUrl}/api/webhooks/${channel}/${req.params.businessId}`;

      if (existing) {
        const updated = await storage.updateIntegrationChannel(existing.id, {
          credentials: credentials ? JSON.stringify(credentials) : existing.credentials,
          webhookSecret: webhookSecret || existing.webhookSecret,
          webhookUrl,
          status: "connected",
          lastSyncedAt: new Date(),
        });
        // Return sanitized response
        res.json({ 
          integration: {
            id: updated?.id,
            businessId: updated?.businessId,
            channel: updated?.channel,
            status: updated?.status,
            webhookUrl: updated?.webhookUrl,
            lastSyncedAt: updated?.lastSyncedAt,
            hasCredentials: !!updated?.credentials,
          }
        });
      } else {
        const integration = await storage.createIntegrationChannel({
          businessId: req.params.businessId,
          channel,
          credentials: credentials ? JSON.stringify(credentials) : null,
          webhookSecret: webhookSecret || null,
          webhookUrl,
          status: "connected",
        });
        // Return sanitized response
        res.json({ 
          integration: {
            id: integration.id,
            businessId: integration.businessId,
            channel: integration.channel,
            status: integration.status,
            webhookUrl: integration.webhookUrl,
            lastSyncedAt: integration.lastSyncedAt,
            hasCredentials: !!integration.credentials,
          }
        });
      }
    } catch (error: any) {
      console.error("Create integration error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Disconnect an integration
  app.delete("/api/integrations/:businessId/:channel", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const isOwner = await verifyBusinessOwnership(req.userId!, req.params.businessId);
      if (!isOwner) {
        return res.status(403).json({ error: "Access denied" });
      }

      const integration = await storage.getIntegrationChannel(req.params.businessId, req.params.channel);
      if (integration) {
        await storage.deleteIntegrationChannel(integration.id);
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===================== CHANNEL WEBHOOKS =====================

  // Generic webhook handler for all channels
  app.post("/api/webhooks/:channel/:businessId", async (req, res) => {
    try {
      const { channel, businessId } = req.params;
      const business = await storage.getBusiness(businessId);
      
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }

      const integration = await storage.getIntegrationChannel(businessId, channel);
      if (!integration || integration.status !== "connected") {
        return res.status(400).json({ error: "Integration not configured" });
      }

      // Get bot settings for this business
      const settings = await storage.getBotSettings(businessId);
      const systemPrompt = settings?.systemPrompt || DEFAULT_SYSTEM_PROMPT;

      // Handle based on channel type
      let incomingMessage = "";
      let senderId = "";
      let responseFormat = "json";

      switch (channel) {
        case "whatsapp":
          // Twilio WhatsApp format
          incomingMessage = req.body.Body || "";
          senderId = req.body.From || "";
          responseFormat = "twiml";
          break;
        case "instagram":
        case "messenger":
          // Meta format
          if (req.body.entry?.[0]?.messaging?.[0]?.message?.text) {
            incomingMessage = req.body.entry[0].messaging[0].message.text;
            senderId = req.body.entry[0].messaging[0].sender?.id || "";
          }
          break;
        case "twitter":
          // Twitter DM format
          if (req.body.direct_message_events?.[0]?.message_create?.message_data?.text) {
            incomingMessage = req.body.direct_message_events[0].message_create.message_data.text;
            senderId = req.body.direct_message_events[0].message_create.sender_id || "";
          }
          break;
        case "shopify":
          // Shopify webhook - could be order, customer, etc.
          const topic = req.headers["x-shopify-topic"] as string;
          if (topic?.includes("orders")) {
            // Create a lead from order
            const order = req.body;
            if (order.customer) {
              await storage.createLead({
                businessId,
                name: `${order.customer.first_name || ""} ${order.customer.last_name || ""}`.trim() || "Shopify Customer",
                email: order.customer.email,
                phone: order.customer.phone,
                message: `Order #${order.order_number} - Total: ${order.total_price} ${order.currency}`,
                source: "shopify",
                status: "new",
              });
            }
            return res.json({ success: true, message: "Order processed" });
          }
          break;
        default:
          // Web widget or unknown
          incomingMessage = req.body.message || "";
          senderId = req.body.sessionId || "anonymous";
      }

      // If we have a message, process with AI
      if (incomingMessage && openai) {
        const messages = [
          { role: "system" as const, content: systemPrompt },
          { role: "user" as const, content: incomingMessage },
        ];

        const completion = await openai.chat.completions.create({
          model: settings?.modelName || "deepseek/deepseek-chat",
          messages,
        });

        const reply = completion.choices[0]?.message?.content || 
                      "Sorry, I couldn't process that right now. 😅";

        // Update subscription credits
        const subscription = await storage.getSubscription(businessId);
        if (subscription) {
          await storage.updateSubscription(subscription.id, {
            creditsUsed: (subscription.creditsUsed || 0) + 1,
          });
        }

        // Return response based on format
        if (responseFormat === "twiml") {
          const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${reply}</Message>
</Response>`;
          res.type("text/xml");
          return res.send(twiml);
        }

        return res.json({ reply, senderId });
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Webhook error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Webhook verification for Meta platforms (Instagram/Messenger)
  app.get("/api/webhooks/:channel/:businessId", async (req, res) => {
    const { channel, businessId } = req.params;
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    // Get the integration to check the verify token
    const integration = await storage.getIntegrationChannel(businessId, channel);
    const expectedToken = integration?.webhookSecret || process.env.META_VERIFY_TOKEN || "skylinekai_verify";

    if (mode === "subscribe" && token === expectedToken) {
      console.log(`${channel} webhook verified for business ${businessId}`);
      res.status(200).send(challenge);
    } else {
      res.status(403).send("Forbidden");
    }
  });

  // Twitter CRC challenge
  app.get("/api/webhooks/twitter/:businessId", async (req, res) => {
    const crcToken = req.query.crc_token as string;
    if (crcToken) {
      const integration = await storage.getIntegrationChannel(req.params.businessId, "twitter");
      const consumerSecret = integration?.webhookSecret || process.env.TWITTER_CONSUMER_SECRET || "";
      
      const crypto = require("crypto");
      const hmac = crypto.createHmac("sha256", consumerSecret).update(crcToken).digest("base64");
      return res.json({ response_token: `sha256=${hmac}` });
    }
    res.status(400).json({ error: "CRC token required" });
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      bot: "SkylineKAI SaaS Platform",
      aiConfigured: !!openai,
      jwtConfigured: !!JWT_SECRET,
    });
  });

  return httpServer;
}
