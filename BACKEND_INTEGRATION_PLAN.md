# Backend Integration Plan: Supabase

This document outlines the strategy for migrating the **Service Marketplace Website** from mock data to a live backend using **Supabase**.

## 🚀 Overview
Supabase provides a Postgres database, Authentication, and Storage which fits perfectly with our React + TypeScript stack. Gemini can assist in generating the SQL schemas, configuring the client, and refactoring components to fetch real data.

---

## 📅 Implementation Phases

### Phase 1: Setup & Configuration
- [ ] **Create Supabase Project**: Set up a new project at [supabase.com](https://supabase.com).
- [ ] **Install Dependencies**:
  ```bash
  npm install @supabase/supabase-js
  ```
- [ ] **Environment Variables**: Create a `.env` file to store `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- [ ] **Supabase Client**: Initialize the client in `src/app/lib/supabase.ts`.

### Phase 2: Database Design
We will need to create the following tables based on our `mock-data.ts`:

#### 1. `categories`
- `id`: uuid (primary key)
- `name`: text (e.g., "Plumber")
- `slug`: text (unique, e.g., "plumber")
- `icon`: text (Lucide icon name)

#### 2. `profiles`
- `id`: uuid (references `auth.users`)
- `full_name`: text
- `avatar_url`: text

#### 3. `service_providers`
- `id`: uuid (primary key)
- `user_id`: uuid (references `profiles.id`)
- `name`: text
- `category_id`: uuid (references `categories.id`)
- `description`: text
- `skills`: text[]
- `location`: text (District)
- `phone`: text
- `email`: text
- `whatsapp`: text
- `social_links`: jsonb (facebook, instagram, linkedin)
- `image_url`: text
- `rating`: numeric
- `is_featured`: boolean
- `created_at`: timestamp with time zone

### Phase 3: Data Migration
- [ ] Export `mock-data.ts` to a JSON format.
- [ ] Use a script or Supabase Dashboard to seed the initial categories and providers.

### Phase 4: Frontend Refactoring
- [ ] **Data Fetching**: Replace `mockServiceProviders` imports with async calls using the Supabase client.
- [ ] **Filters**: Update the `browse-page.tsx` to use Supabase filters (e.g., `.eq('category', selectedCategory)`).
- [ ] **Create Service**: Connect the `create-service-page.tsx` form to `supabase.from('service_providers').insert()`.
- [ ] **Images**: Set up Supabase Storage for uploading provider profile pictures.

### Phase 5: Authentication
- [ ] Implement Sign Up / Login using Supabase Auth.
- [ ] Protect the "Create Service" and "My Profile" routes so only logged-in users can access them.

---

## 🤖 How Gemini Can Help

Gemini can automate most of the heavy lifting:

1.  **SQL Generation**: "Gemini, generate the SQL to create the tables described in Phase 2 with RLS (Row Level Security) policies."
2.  **Code Refactoring**: "Gemini, refactor `browse-page.tsx` to fetch data from Supabase instead of using the mock data."
3.  **Form Integration**: "Gemini, update the `CreateServicePage` to handle form submission to Supabase."
4.  **Auth Hooks**: "Gemini, create a custom `useAuth` hook to manage the Supabase session."

---

## 🛠️ Next Steps
1. Create your Supabase project.
2. Ask Gemini to: **"Install Supabase and set up the client in my project."**
3. Ask Gemini to: **"Generate the SQL for my database tables based on the backend plan."**

