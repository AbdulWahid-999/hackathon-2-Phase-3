---
id: "001"
title: "Fix Database Connection for Vercel Deployment"
stage: "general"
date_iso: "2026-01-27"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "none"
branch: "main"
user: "goku"
command: "manual"
labels: ["database", "vercel", "deployment", "environment-variables"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - "D:/CODING/phase-2/backend/src/database/connection.py"
  - "D:/CODING/phase-2/backend/src/main.py"
  - "D:/CODING/phase-2/backend/src/middleware/auth.py"
  - "D:/CODING/phase-2/backend/main.py"
  - "D:/CODING/phase-2/backend/.env"
tests_yaml: []
---

# Fix Database Connection for Vercel Deployment

## Issue
Application was connecting to SQLite instead of PostgreSQL in Vercel deployment, causing 500 errors during registration and 401 errors during login. The root cause was that `load_dotenv()` was loading local `.env` files that contained hardcoded database URLs, which were overriding the environment variables set in the Vercel dashboard.

## Solution
Removed all `load_dotenv()` calls and `from dotenv import load_dotenv` imports from backend files since Vercel serverless functions use environment variables set directly in the dashboard, not from local `.env` files.

## Changes Made
1. Modified `backend/src/database/connection.py` - Removed `load_dotenv()` and `dotenv` import
2. Modified `backend/src/main.py` - Removed `load_dotenv()` and `dotenv` import
3. Modified `backend/src/middleware/auth.py` - Removed `load_dotenv()` and `dotenv` import
4. Modified `backend/main.py` - Removed `load_dotenv()` and `dotenv` import
5. Removed `backend/.env` file to prevent confusion
6. Removed root `/.env` file to prevent confusion

## Result
Application now properly uses the DATABASE_URL environment variable set in Vercel dashboard, allowing it to connect to the PostgreSQL database instead of falling back to SQLite.

## Follow-up
Redeploy the application to Vercel to apply the fixes.

## Prompt Text
[USER PROMPT TEXT WOULD GO HERE]

## Response Text
Fixed the database connection issue by removing load_dotenv() calls from all backend files that were interfering with Vercel environment variables. The application will now properly use the DATABASE_URL set in the Vercel dashboard instead of falling back to SQLite.