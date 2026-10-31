# WhatsApp Business CRM & Conversational AI Platform (Multi-Tenant)

An enterprise-ready **Next.js B2B platform** that enables you to provide **WhatsApp Automation, Live Product Catalogues, and Gemini AI Chatbots as a Service** to multiple businesses.

---

## 🎯 End-to-End System Workflow

```
1. Business Onboarding  ──► Business registers & connects their WhatsApp Business Number
2. Catalogue Sync       ──► Products, prices, specs & inventory are saved in the CRM
3. Customer Inquiries   ──► Customer asks via WhatsApp: "How much is your iPhone 15?"
4. AI Auto-Lookup       ──► Gemini AI queries the live catalogue, verifies stock & quotes $799
5. Smart Auto-Reply     ──► Instant answer is transmitted to the customer on WhatsApp
6. Shared CRM Inbox     ──► Message thread and customer contact are recorded in real-time
7. Human Handoff Alert  ──► If customer says "talk to sales rep", CRM alerts employees with 🚨
```

---

### 📱 Detailed Example: "How much is your iPhone 15?"

1. **Detects incoming message:** Customer texts your client's WhatsApp number: *"How much is your iPhone 15?"*
2. **Meta Webhook routing:** Meta passes `phone_number_id` to `/api/webhook`, which instantly identifies the business (*TechHub Electronics*).
3. **Checks product catalogue:** The Gemini AI engine reads the business's live catalogue:
   - `Apple iPhone 15 (128GB) | Price: $799 (₹74,900) | In Stock | Colors: Black, Blue, Green...`
4. **Sends automatic response:** The AI drafts a natural WhatsApp reply:
   > *"Hello Priya! ✨ The Apple iPhone 15 (128GB) is available in stock for $799 (₹74,900). We have it in Black, Blue, and Green! Would you like to reserve one or have a sales representative assist you?"*
5. **Saves conversation:** Automatically logs the message into the **Live Shared Inbox**.
6. **Human takeover:** If the customer replies *"Can I speak to a real person to get a discount?"*, the system flags the contact with **🚨 Action Needed: Human Assistance Requested**, notifying your team in the dashboard to jump in!

---

## 🚀 Quick Setup & Configuration

### 1. Fill `.env`
Open `[.env](file:///d:/Company/ZEVARONE/Projects/WhatsappCRM/.env)` in the project root:

```env
# Master WhatsApp Cloud API (Meta Developers)
WHATSAPP_TOKEN=your_whatsapp_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_default_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_waba_id_here
WHATSAPP_VERIFY_TOKEN=zevarone_whatsapp_crm_secret_2026
WHATSAPP_API_VERSION=v21.0

# Master Google Gemini API (Google AI Studio)
GEMINI_API_KEY=AIzaSyYourFreeKeyHere
GEMINI_MODEL=gemini-3.8-flash

# Base App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Run the Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 🌟 Key Platform Features

1. **Multi-Business Support:** Each business client has their own WhatsApp number, Meta credentials, and isolated inbox.
2. **Live Product Catalogue Database:** Add products with name, price, stock status, category, and specs. The AI reads this database in real time.
3. **Smart Human Assistance Handoff:** Automatic detection of customer requests for human sales reps, with high-priority visual flags and instant employee takeover.
4. **Shared Inbox:** Real-time two-way messaging with manual agent reply, mode switching, and unread badges.
5. **Customer Message Simulator:** Includes 1-click test buttons for product price lookups and human handoff simulation.
