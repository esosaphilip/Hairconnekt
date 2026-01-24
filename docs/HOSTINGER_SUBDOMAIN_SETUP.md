# Hostinger Subdomain Setup Guide for Render

Since your domain `hairconnekt.de` uses Hostinger's nameservers (`ns1.dns-parking.com`) but your application is hosted on Render, you cannot use the "Subdomains" feature in the Hostinger Web Hosting dashboard (which attempts to create local folders for shared hosting).

Instead, you must use the **DNS Zone Editor**.

## Step 1: Decide on your Subdomain
Common subdomains for this project structure:
- `api.hairconnekt.de` (for your NestJS backend)
- `admin.hairconnekt.de` (for your Admin panel)

## Step 2: Configure Render
1. Go to your **Render Dashboard**.
2. Select the service you want to attach the subdomain to (e.g., your Backend Web Service).
3. Go to **Settings** > **Custom Domains**.
4. Click **Add Custom Domain**.
5. Enter `api.hairconnekt.de` (or your chosen subdomain).
6. Render will provide you with a **CNAME** value (usually something like `hairconnekt-backend.onrender.com`) or an **A Record** IP address.

## Step 3: Configure Hostinger DNS
1. Log in to your **Hostinger Account**.
2. Navigate to **DNS Zone Editor** (usually under "Advanced" or just "DNS" for the domain `hairconnekt.de`).
3. **Add a New Record**:
   - **Type**: `CNAME` (Recommended by Render) or `A`.
   - **Name**: `api` (If you want `api.hairconnekt.de`. Do not type the full domain, just the prefix. If you type `@`, it affects the root).
   - **Target / Points to**: The value Render gave you (e.g., `hairconnekt-backend.onrender.com`).
   - **TTL**: Default (14400 or similar).
4. Click **Add Record**.

## Step 4: Verification
- It may take up to 24 hours for DNS to propagate, but usually it happens within minutes.
- You can verify it by running `nslookup api.hairconnekt.de` in your terminal.

## Important Note regarding CORS
Your backend code (`backend/src/main.ts`) is configured to allow requests from `process.env.FRONTEND_URL`.

```typescript
const corsOrigin = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL, 'http://localhost:5173']
    : true;
app.enableCors({ origin: corsOrigin });
```

**After setting up the subdomain:**
1. Go to your **Backend Service** key/value settings in Render.
2. Ensure `FRONTEND_URL` is set to your frontend's URL (e.g., `https://hairconnekt.de` or `https://www.hairconnekt.de`).
3. If you have an Admin panel on `admin.hairconnekt.de`, you might need to update the backend code to allow multiple origins or use a comma-separated list if you modify the code to support it (currently it accepts a single string or array, but `process.env.FRONTEND_URL` is usually one string).

If you need to support **both** the mobile app (which doesn't have a specific origin in the web sense, but API calls are direct) and a web admin panel, you might want to adjust the CORS logic in `backend/src/main.ts` to accept a comma-separated list of allowed origins.
