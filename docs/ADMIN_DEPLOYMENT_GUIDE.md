# Admin Panel Deployment Guide

This guide explains why and how to deploy your Admin Panel separately from your Backend.

## Why is it separate?

Your application architecture consists of two distinct parts:

1.  **The Backend (API)**: Built with NestJS. It runs as a **Web Service** on Render. It processes data, talks to the database, and provides an API (e.g., `https://api.hairconnekt.de`). It *does not* have a user interface itself.
2.  **The Admin Panel (Frontend)**: Built with React & Vite. It is a **Static Site**. It runs in the user's browser and "talks" to your Backend API to get data.

Because they are different types of software (one runs on a server, one runs in a browser), they need to be deployed as separate services on Render.

## Step-by-Step Deployment on Render

### 1. Create a New Static Site
1.  Go to your [Render Dashboard](https://dashboard.render.com).
2.  Click **New +** and select **Static Site**.
3.  Connect your GitHub repository (`Hairconnekt`).

### 2. Configure Build Settings
Fill in the settings as follows:

*   **Name**: `hairconnekt-admin` (or similar)
*   **Root Directory**: `apps/admin` (Important! This tells Render where the admin code lives)
*   **Build Command**: `npm install && npm run build`
*   **Publish Directory**: `dist` (This is where Vite outputs the finished website)

### 3. Configure Environment Variables
In the Render dashboard for your new Static Site, go to the **Environment** tab and add:

*   **Key**: `VITE_API_URL`
*   **Value**: `https://api.hairconnekt.de/api/v1`

**Important**: Do not skip this step! Your code uses `.env` files locally, but these files are hidden from GitHub (via `.gitignore`) for security. Render needs this variable explicitly set to know where your backend is.

### 4. Setup Custom Domain (Hostinger)
Once the Static Site is deployed, Render will give you a generic URL like `hairconnekt-admin.onrender.com`.

1.  Go to the **Settings** tab in Render.
2.  Under **Custom Domains**, add `admin.hairconnekt.de`.
3.  Render will ask you to verify ownership.
4.  Go to **Hostinger DNS Zone Editor** (as explained in the previous guide).
5.  Add a **CNAME** record:
    *   **Name**: `admin`
    *   **Target**: `hairconnekt-admin.onrender.com` (copy the value Render gives you).
    *   **TTL**: 300 (or default).

### 5. Verify
Visit `https://admin.hairconnekt.de`. It should load your React app and show the login screen.
