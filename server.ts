import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { createServer as createViteServer } from "vite";

dotenv.config();

// Simple in-memory server database to sync with client
export const serverStore = {
  beats: [] as any[],
  beatPacks: [] as any[],
  orders: [] as any[],
  sales: [] as any[],
  customRequests: [] as any[],
  newsletterSubscribers: [] as any[]
};

const PAYPAL_API_BASE = process.env.PAYPAL_ENVIRONMENT === "live" 
  ? "https://api-m.paypal.com" 
  : "https://api-m.sandbox.paypal.com";

async function generateAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");
  
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  const data = await response.json();
  return data.access_token;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- API ROUTES ---

  // Endpoint to keep server store synced with client uploads (since there's no real DB yet)
  app.post("/api/sync", (req, res) => {
    const { beats, beatPacks } = req.body;
    if (beats) serverStore.beats = beats;
    if (beatPacks) serverStore.beatPacks = beatPacks;
    res.json({ success: true });
  });

  // Create PayPal Order
  app.post("/api/paypal/create-order", async (req, res) => {
    try {
      const { productId, productType, licenseId } = req.body;
      
      if (!productId || !productType) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // 1. Look up the real product
      let product;
      if (productType === "Single Beat") {
        product = serverStore.beats.find(b => b.id === productId);
      } else if (productType === "Beat Pack") {
        product = serverStore.beatPacks.find(p => p.packId === productId);
      }

      if (!product) {
        return res.status(404).json({ error: "Product not found or unavailable." });
      }

      // 2. Retrieve real price
      // For this implementation, if a specific license is requested on a single beat, we'd look it up.
      // But based on current Store context, 'price' is typically on the product root or we fallback to 39.99
      let finalPrice = product.price || 39.99;
      
      // If product has licenses array, verify licenseId
      if (licenseId && product.licenses) {
        const license = product.licenses.find((l: any) => l.name === licenseId);
        if (license && license.price) {
          finalPrice = parseFloat(license.price);
        } else {
          return res.status(400).json({ error: "Invalid license selected." });
        }
      }

      if (isNaN(finalPrice) || finalPrice <= 0) {
        return res.status(400).json({ error: "Invalid product price." });
      }

      // 3. Create PayPal Order
      const accessToken = await generateAccessToken();
      const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: finalPrice.toFixed(2),
              },
              description: `${productType}: ${product.title || product.packName}`
            },
          ],
        }),
      });

      const orderData = await response.json();
      if (!response.ok) {
        throw new Error(orderData.message || "Failed to create PayPal order");
      }

      // 4. Store pending NightRunna order
      const nightRunnaOrderId = `NR-ORD-${Date.now()}`;
      const pendingOrder = {
        orderId: nightRunnaOrderId,
        paypalOrderId: orderData.id,
        productId,
        productType,
        licenseId,
        amount: finalPrice,
        currency: "USD",
        status: "PENDING",
        timestamp: new Date().toISOString()
      };
      
      serverStore.orders.push(pendingOrder);

      res.json({ id: orderData.id, pendingOrder });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Capture PayPal Order
  app.post("/api/paypal/capture-order", async (req, res) => {
    try {
      const { paypalOrderId } = req.body;
      
      // 1. Find corresponding pending order
      const orderIndex = serverStore.orders.findIndex(o => o.paypalOrderId === paypalOrderId);
      if (orderIndex === -1) {
        return res.status(404).json({ error: "Order not found in system." });
      }
      
      const order = serverStore.orders[orderIndex];
      if (order.status === "PAID") {
        return res.status(400).json({ error: "Duplicate capture detected." });
      }

      // 2. Capture on PayPal
      const accessToken = await generateAccessToken();
      const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${paypalOrderId}/capture`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const captureData = await response.json();

      if (captureData.status === "COMPLETED") {
        // Verify amount and currency
        const capture = captureData.purchase_units[0].payments.captures[0];
        const capturedAmount = parseFloat(capture.amount.value);
        const capturedCurrency = capture.amount.currency_code;

        if (capturedAmount !== order.amount || capturedCurrency !== order.currency) {
          return res.status(400).json({ error: "Amount or currency mismatch." });
        }

        // Update to PAID
        serverStore.orders[orderIndex].status = "PAID";
        
        // Record Sale internally
        const newSale = {
          orderId: order.orderId,
          paypalOrderId: paypalOrderId,
          productId: order.productId,
          productType: order.productType,
          amount: order.amount,
          date: new Date().toISOString(),
          status: "Completed",
          license: order.licenseId || "Standard",
          customer: captureData.payer.email_address || "Guest"
        };
        serverStore.sales.push(newSale);

        res.json({ success: true, sale: newSale });
      } else {
        res.status(400).json({ error: "Capture was not completed on PayPal.", details: captureData });
      }
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

// Server-Side Email Dispatcher Adapter (Supports Gmail App Password, Gmail OAuth2, & Generic SMTP)
async function sendEmail({ to, subject, text, html, replyTo }: { to: string; subject: string; text: string; html: string; replyTo?: string }) {
  const gmailUser = process.env.GMAIL_USER || process.env.ADMIN_EMAIL || "nightrunna842@gmail.com";
  const gmailAppPass = process.env.GMAIL_APP_PASSWORD;
  const gmailClientId = process.env.GMAIL_CLIENT_ID;
  const gmailClientSecret = process.env.GMAIL_CLIENT_SECRET;
  const gmailRefreshToken = process.env.GMAIL_REFRESH_TOKEN;

  let transporter: any = null;
  let fromAddress = process.env.SMTP_FROM || `NightRunna Studio <${gmailUser}>`;

  // Option A: Gmail App Password (Direct authenticated Gmail SMTP)
  if (gmailUser && gmailAppPass) {
    const cleanPass = gmailAppPass.replace(/\s+/g, "");
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // SSL
      auth: {
        user: gmailUser,
        pass: cleanPass,
      },
    });
  } 
  // Option B: Gmail OAuth 2.0 Authentication
  else if (gmailUser && gmailClientId && gmailClientSecret && gmailRefreshToken) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: gmailUser,
        clientId: gmailClientId,
        clientSecret: gmailClientSecret,
        refreshToken: gmailRefreshToken,
      },
    });
  } 
  // Option C: Generic SMTP Credentials
  else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;
  }

  // Execute authenticated dispatch if transport was initialized
  if (transporter) {
    try {
      const mailOptions = {
        from: fromAddress,
        to,
        replyTo: replyTo || fromAddress,
        subject,
        text,
        html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[AUTHENTICATED GMAIL SENT] To: ${to} | Subject: "${subject}" | MsgId: ${info.messageId}`);
      return { 
        success: true, 
        messageId: info.messageId, 
        realProvider: true, 
        authMethod: gmailAppPass ? "Gmail App Password" : (gmailRefreshToken ? "Gmail OAuth2" : "Custom SMTP")
      };
    } catch (err: any) {
      console.error(`[GMAIL DISPATCH ERROR] Failed to deliver email to ${to}:`, err.message || err);
      return { 
        success: false, 
        error: err.message || "Failed to deliver email through Gmail SMTP transport", 
        realProvider: true 
      };
    }
  }

  // Fallback internal logger when credentials are not yet configured
  console.log(`==================================================`);
  console.log(`[NIGHTRUNNA EMAIL DISPATCH (PENDING GMAIL CREDENTIALS)]`);
  console.log(`TO: ${to}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`REPLY-TO: ${replyTo || fromAddress}`);
  console.log(`TIME: ${new Date().toISOString()}`);
  console.log(`==================================================`);

  return { 
    success: false, 
    mode: 'pending-credentials', 
    realProvider: false, 
    error: "Gmail authentication credentials missing. Add GMAIL_USER & GMAIL_APP_PASSWORD in environment variables." 
  };
}

function generateWelcomeEmail(subscriberEmail: string, originUrl: string) {
  const unsubscribeUrl = `${originUrl}/unsubscribe?email=${encodeURIComponent(subscriberEmail)}`;
  
  const text = `WELCOME TO NIGHTRUNNA

Thank you for joining the NightRunna mailing list!

You are now subscribed to receive official updates directly from NightRunna Studio.
As a subscriber, you will receive announcements about:
- New beat releases & catalog drops
- Limited beat pack discounts & promo codes
- Merch releases & custom producer services
- Important NightRunna store announcements

To unsubscribe from future email updates at any time, visit:
${unsubscribeUrl}

NightRunna Studio | Official Producer Storefront
nightrunna842@gmail.com`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; color: #f4f4f5; padding: 32px 24px; border-radius: 16px; border: 1px solid #27272a;">
      <div style="text-align: center; border-bottom: 1px solid #27272a; padding-bottom: 24px; margin-bottom: 24px;">
        <div style="display: inline-block; background-color: #4f46e5; color: #ffffff; width: 48px; height: 48px; border-radius: 12px; font-weight: 900; line-height: 48px; font-size: 20px; margin-bottom: 12px;">
          NR
        </div>
        <h1 style="color: #ffffff; margin: 0 0 6px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">Welcome to NightRunna</h1>
        <p style="margin: 0; font-size: 14px; color: #818cf8; font-weight: 600;">Official Subscriber Confirmation</p>
      </div>

      <div style="line-height: 1.6; color: #d4d4d8; font-size: 15px; margin-bottom: 24px;">
        <p style="margin: 0 0 16px 0;">Thank you for joining the <strong>NightRunna</strong> mailing list!</p>
        <p style="margin: 0 0 16px 0;">You are now on the VIP list to receive direct announcements from NightRunna Studio, including:</p>
        
        <div style="background-color: #18181b; padding: 16px 20px; border-radius: 12px; border: 1px solid #27272a; margin-bottom: 20px;">
          <ul style="margin: 0; padding-left: 20px; color: #e4e4e7; font-size: 14px;">
            <li style="margin-bottom: 8px;">🔥 <strong>New Beat Drops</strong> & catalog releases</li>
            <li style="margin-bottom: 8px;">🏷️ <strong>Exclusive Beat Pack Discounts</strong> & promo codes</li>
            <li style="margin-bottom: 8px;">👕 <strong>Merch & Custom Services</strong> updates</li>
            <li style="margin-bottom: 0;">📢 <strong>Important Store Announcements</strong></li>
          </ul>
        </div>

        <p style="margin: 0 0 8px 0; font-size: 13px; color: #a1a1aa;">
          We respect your inbox. You can manage your preferences or unsubscribe at any time.
        </p>
      </div>

      <div style="border-top: 1px solid #27272a; padding-top: 20px; text-align: center; font-size: 12px; color: #71717a;">
        <p style="margin: 0 0 12px 0;">Sent by <strong>NightRunna Studio</strong> • All Rights Reserved</p>
        <p style="margin: 0;">
          <a href="${unsubscribeUrl}" style="color: #a1a1aa; text-decoration: underline;">Click here to Unsubscribe</a>
        </p>
      </div>
    </div>
  `;

  return { subject: "Welcome to NightRunna", text, html };
}

function generateAdminNewSubscriberEmail(subscriberEmail: string) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

  const text = `New NightRunna mailing-list signup

Subscriber Details:
- Subscriber Email: ${subscriberEmail}
- Signup Date/Time: ${dateStr}
- Status: Confirmed & Added to NightRunna Mailing List

NightRunna Studio System Notification`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 550px; margin: 0 auto; background-color: #09090b; color: #f4f4f5; padding: 24px; border-radius: 12px; border: 1px solid #27272a;">
      <h2 style="color: #34d399; margin: 0 0 12px 0; font-size: 18px; font-weight: bold;">New NightRunna mailing-list signup</h2>
      <p style="color: #a1a1aa; font-size: 14px; margin: 0 0 16px 0;">A new subscriber has joined the official store mailing list.</p>
      
      <div style="background-color: #18181b; padding: 16px; border-radius: 8px; border: 1px solid #27272a; font-size: 14px; margin-bottom: 16px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #a1a1aa; width: 140px;">Subscriber Email:</td>
            <td style="padding: 6px 0; color: #ffffff; font-weight: bold;"><a href="mailto:${subscriberEmail}" style="color: #818cf8; text-decoration: underline;">${subscriberEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #a1a1aa;">Signup Date/Time:</td>
            <td style="padding: 6px 0; color: #ffffff;">${dateStr}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #a1a1aa;">Status:</td>
            <td style="padding: 6px 0; color: #34d399; font-weight: bold;">Successfully Added & Verified</td>
          </tr>
        </table>
      </div>

      <p style="color: #71717a; font-size: 12px; margin: 0; text-align: center;">NightRunna Studio Automatic Notification System</p>
    </div>
  `;

  return { subject: "New NightRunna mailing-list signup", text, html };
}

  // --- API ROUTE: Newsletter Subscription ---
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { email, consentGiven, source } = req.body;
      if (!email || typeof email !== "string") {
        return res.status(400).json({ success: false, message: "Email address is required." });
      }

      const trimmed = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        return res.status(400).json({ success: false, message: "Please enter a valid email address." });
      }

      // Check duplicate
      const existingIndex = serverStore.newsletterSubscribers.findIndex(
        (s: any) => s.email.toLowerCase() === trimmed
      );

      let isNewSignup = false;

      if (existingIndex >= 0) {
        const existing = serverStore.newsletterSubscribers[existingIndex];
        if (existing.status === "Active") {
          // Strict duplicate prevention - DO NOT send admin notification or duplicate welcome email
          return res.json({
            success: false,
            isDuplicate: true,
            message: "This email is already subscribed to the NightRunna mailing list."
          });
        } else {
          // Reactivate subscriber
          serverStore.newsletterSubscribers[existingIndex].status = "Active";
          serverStore.newsletterSubscribers[existingIndex].consentGiven = consentGiven ?? true;
        }
      } else {
        // Brand NEW subscriber
        isNewSignup = true;
        const newSub = {
          id: `SUB-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          email: trimmed,
          subscribedAt: new Date().toISOString(),
          consentGiven: consentGiven ?? true,
          status: "Active",
          source: source || "Storefront Newsletter Form"
        };
        serverStore.newsletterSubscribers.push(newSub);
      }

      const originUrl = req.get("origin") || "https://nightrunna.com";

      // 1. Send Welcome Email to subscriber
      const welcomeMail = generateWelcomeEmail(trimmed, originUrl);
      const welcomeResult = await sendEmail({
        to: trimmed,
        subject: welcomeMail.subject,
        text: welcomeMail.text,
        html: welcomeMail.html
      });

      // 2. Send Admin Notification Email to nightrunna842@gmail.com ONLY if brand NEW signup!
      let adminResult = null;
      if (isNewSignup) {
        const adminEmail = process.env.ADMIN_EMAIL || "nightrunna842@gmail.com";
        const adminMail = generateAdminNewSubscriberEmail(trimmed);
        adminResult = await sendEmail({
          to: adminEmail,
          subject: adminMail.subject,
          text: adminMail.text,
          html: adminMail.html
        });
      }

      return res.json({
        success: true,
        message: "Subscribed successfully! Thank you for joining the NightRunna mailing list.",
        isNewSignup,
        welcomeEmailStatus: welcomeResult.success ? "Sent" : "Queued",
        adminNotificationStatus: adminResult ? (adminResult.success ? "Sent" : "Queued") : "Skipped (Existing)",
        realProviderConfigured: welcomeResult.realProvider
      });
    } catch (err: any) {
      console.error("Error in /api/newsletter/subscribe:", err);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }
  });

  // --- API ROUTE: Newsletter Unsubscribe ---
  app.post("/api/newsletter/unsubscribe", (req, res) => {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ success: false, message: "Email is required." });
    }
    const trimmed = email.trim().toLowerCase();
    const sub = serverStore.newsletterSubscribers.find((s: any) => s.email.toLowerCase() === trimmed);
    if (sub) {
      sub.status = "Unsubscribed";
    }
    res.json({ success: true, message: "You have been unsubscribed from the NightRunna mailing list." });
  });

  // --- Send Email Notification for Custom Beat Request ---
  app.post("/api/custom-requests/notify", async (req, res) => {
    try {
      const customRequest = req.body;
      if (!customRequest || !customRequest.id || !customRequest.email) {
        return res.status(400).json({ success: false, error: "Invalid custom request data" });
      }

      // Save/sync in serverStore
      const existingIdx = serverStore.customRequests.findIndex(r => r.id === customRequest.id);
      if (existingIdx >= 0) {
        serverStore.customRequests[existingIdx] = customRequest;
      } else {
        serverStore.customRequests.push(customRequest);
      }

      const adminEmail = process.env.ADMIN_EMAIL || "nightrunna842@gmail.com";
      const subject = `New Custom Beat Request — ${customRequest.id}`;
      const submittedDate = customRequest.createdAt 
        ? new Date(customRequest.createdAt).toLocaleString() 
        : new Date().toLocaleString();

      const plainTextContent = `NEW CUSTOM BEAT REQUEST

Request ID: ${customRequest.id}
Customer Name: ${customRequest.name}
Artist Name: ${customRequest.artistName}
Email: ${customRequest.email}
Requested Style: ${customRequest.beatTitleOrConcept}
Genre: ${customRequest.genre}
Budget: ${customRequest.budget}
Submitted: ${submittedDate}`;

      const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; color: #f4f4f5; padding: 24px; border-radius: 12px; border: 1px solid #27272a;">
          <h2 style="color: #818cf8; margin: 0 0 6px 0; font-size: 20px;">NEW CUSTOM BEAT REQUEST</h2>
          <p style="margin: 0 0 16px 0; font-size: 14px; color: #a1a1aa;">Request ID: <strong style="color: #ffffff;">${customRequest.id}</strong></p>
          <p style="color: #e4e4e7; font-size: 14px;"><strong>Customer:</strong> ${customRequest.name} (${customRequest.email})</p>
          <p style="color: #e4e4e7; font-size: 14px;"><strong>Concept:</strong> ${customRequest.beatTitleOrConcept}</p>
        </div>
      `;

      const result = await sendEmail({
        to: adminEmail,
        replyTo: customRequest.email,
        subject,
        text: plainTextContent,
        html: htmlContent
      });

      return res.json({
        success: result.success,
        emailStatus: result.success ? "Sent" : "Queued",
        timestamp: new Date().toISOString(),
        messageId: (result as any).messageId,
        previewUrl: (result as any).previewUrl
      });
    } catch (err: any) {
      console.error("Error sending custom request email notification:", err);
      return res.status(500).json({
        success: false,
        emailStatus: "Failed",
        error: err.message || "Failed to deliver email notification",
        timestamp: new Date().toISOString()
      });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
