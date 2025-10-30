# MyBeauty - AI-Powered Fragrance E-Commerce Platform

![MyBeauty Homepage](https://nextjs-fpl-datn.vercel.app/captureUI/trang-chu.png)

**Live Demo:** [https://nextjs-fpl-datn.vercel.app/](https://nextjs-fpl-datn.vercel.app/)

## About The Project

MyBeauty is a modern, full-stack e-commerce web application designed for a seamless fragrance shopping experience. Built from the ground up as a final graduation project, it showcases a blend of robust back-end functionality with a sleek, responsive user interface.

The core mission of this project was to explore and implement cutting-edge web technologies to solve real-world e-commerce challenges. This includes creating an intuitive shopping flow, managing complex product data, and integrating intelligent features to enhance user engagement and discovery.

This repository serves as a comprehensive portfolio piece, demonstrating proficiency in modern full-stack development practices.

## Key Features

While the platform includes all standard e-commerce functionalities, here are some of the standout features we're proud of:

### 🤖 **AI-Powered Discovery**

- **AI Smart Search:** Goes beyond simple keyword matching. Users can describe a mood, occasion, or scent profile in natural language (e.g., _"a fresh scent for summer evenings"_) and receive intelligent, relevant product recommendations.
- **AI Conversational Chatbot:** An interactive assistant trained on the store's product catalog. It can answer detailed product questions, provide personalized suggestions, and guide users through their fragrance discovery journey, creating a boutique-like consultative experience online.

![AI Chatbot Feature](https://nextjs-fpl-datn.vercel.app/captureUI/AI-chat.png)
![AI Chatbot Feature](https://nextjs-fpl-datn.vercel.app/captureUI/AI-search.png)

### 💳 **Modern & Secure Payments**

- **MoMo Payment Gateway:** Integrated one of Vietnam's most popular digital wallets, offering users a fast, secure, and familiar checkout option.
- **Guest & Authenticated Checkout:** A flexible system that supports both registered users and guest checkouts, complete with order tracking capabilities for both.

### ⚙️ **Comprehensive Admin Dashboard**

- **Full Store Management:** A feature-rich dashboard allows administrators to manage products, categories, brands, discounts, and orders.
- **User & Role Management:** Control access and permissions for different user roles (Admin, Staff, etc.).
- **Activity Logging:** A detailed logging system tracks important actions within the admin panel for accountability and debugging.

![Admin Dashboard](https://nextjs-fpl-datn.vercel.app/captureUI/dashboard.png)

## Tech Stack

This project was built with a focus on performance, scalability, and developer experience, using a modern, type-safe technology stack.

- **Framework:** [Next.js](https://nextjs.org/) 14+ (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Database & Backend:** [Supabase](https://supabase.io/) (PostgreSQL, Auth, Storage)
- **State Management:** [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **AI Integration:** [Groq API](https://groq.com/) for fast LLM inference
- **Payment Gateway:** [MoMo API](https://developers.momo.vn/)
- **Deployment:** [Vercel](https://vercel.com/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18 or later)
- Yarn (or npm/pnpm)
- A Supabase account for your database, auth, and storage.

### Installation

1.  **Clone the repo**

    ```sh
    git clone https://github.com/your-username/mybeauty-project.git
    cd mybeauty-project
    ```

2.  **Install dependencies**

    ```sh
    yarn install
    ```

3.  **Set up environment variables**

    - Create a `.env.local` file in the root of the project.
    - Copy the contents of `.env.example` (if available) or add your Supabase project URL and Anon Key.

    ```env
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    # ... other keys for AI, payments, etc.
    ```

4.  **Run the development server**
    ```sh
    yarn dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
