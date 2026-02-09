# React Dashboard with Neon DB

A minimalist, high-performance React dashboard featuring role-based authentication (Admin/User), secure sessions, and a modern dark UI. Built with **Next.js 16**, **Tailwind CSS v4**, and **PostgreSQL (Neon DB)**.

## 🚀 Features

-   **Authentication**: Secure Signup, Login, and Logout using HttpOnly cookies and JWT (`jose`).
-   **Role-Based Access Control (RBAC)**:
    -   **Admin**:
        -   **System Overview**: Real-time metrics for Total Users, Server Status, and API Usage.
        -   **User Management**: Enhanced table with avatars, role badges, and actions (**Approve**, **Revoke**, **Delete**).
    -   **User**: Protected dashboard with **Activity Graph**, **Profile**, and **Recent Logs**.
-   **Database**: Serverless PostgreSQL via Neon DB.
-   **Styling**: Premium "Minimalist Dark" theme using Tailwind CSS.
-   **Performance**: Fast, server-side rendered pages with Next.js App Router.

## 🛠 Tech Stack

-   **Framework**: Next.js 16 (App Router)
-   **Styling**: Tailwind CSS v4
-   **Database**: PostgreSQL (Neon Tech)
-   **ORM/Driver**: `pg` (node-postgres)
-   **Auth**: `jose` (JWT), `bcrypt` (Password Hashing)
-   **Icons**: `lucide-react`

## ⚙️ Local Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Atul-Snigh/React-dashboard.git
    cd React-dashboard
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env.local` file in the root directory:
    ```env
    DATABASE_URL=postgresql://neondb_owner:npg_9GdVJ7AZxRop@ep-curly-dew-a1qy6f5w-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
    JWT_SECRET=supersecretkey12345
    ```

4.  **Initialize Database**:
    Run the setup script to create tables and seed the admin user:
    ```bash
    node scripts/setup-db.js
    ```
    *(Note: This script handles local DNS resolution for Neon DB automatically)*

5.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) (or the port shown in terminal).

## 📖 Usage Guide

### 1. Admin Login
-   **URL**: `/login`
-   **Email**: `test@test.com`
-   **Password**: `Test123@123`
-   **Action**: Login to view the dashboard. Use the **"Approve"** or **"Revoke"** buttons to manage user access.

### 2. User Registration Flow
1.  Go to `/signup` and create a new account.
2.  You will see a message: *"Registration successful! Please wait for admin approval."*
3.  Login attempt will fail with *"Account pending admin approval"*.
4.  **Admin** logs in and clicks **"Approve"**.
5.  **User** can now login successfully to `/user`.

## 📦 Deployment

This project is optimized for deployment on **Vercel**.

1.  Push your code to GitHub.
2.  Import the project in Vercel.
3.  Add `DATABASE_URL` and `JWT_SECRET` in Vercel Environment Variables.
4.  Click **Deploy**.

---
*Created by [Antigravity]*
