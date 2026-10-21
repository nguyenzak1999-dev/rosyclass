# System Architecture: RosyClass

## 1. Tech Stack
- **Frontend Framework**: Next.js (App Router), chạy trên Cloudflare Workers qua vinext
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **Database**: Cloudflare D1 (SQLite)
- **ORM**: Prisma + @prisma/adapter-d1
- **Authentication**: bảng `User` + cookie phiên ký HMAC (`src/lib/auth`)
- **Media Storage**: Cloudinary (REST API có chữ ký)
- **Form Handling**: React Hook Form + Zod
- **Tables & Charts**: TanStack Table, Recharts

## 2. Core Modules (Based on MVP Spec)
1. **Dashboard**: Metrics & Reports (Leads, Revenue, Classes).
2. **Lead CRM**: Registration, Tracking, and Conversion.
3. **Student/Parent Management**: Profiles, History, Linkages.
4. **Course & Class Management**: Levels, Teachers, Arrangement, Capacity tracking.
5. **Schedule & Attendance**: Calendar generation, Check-in/out tracking.
6. **Financials**: Payments, Debts, Tuition Tracking.
7. **Website CMS**: Landing Page, Blog, Banners, Testimonials.

## 3. Application Structure
- `/src/app/(public)`: Public facing website (Home, Courses, Teachers, Blog).
- `/src/app/(admin)`: Protected Admin CRM/CMS dashboard.
- `/src/components/ui`: Shadcn UI primitives.
- `/src/components/shared`: Reusable components across the app.
- `/src/lib`: Utilities (Prisma client, auth, media storage, utils).
- `/prisma`: Database schema; `/migrations`: migration SQL cho D1. Triển khai: xem `docs/deploy-cloudflare.md`.

## 4. Next Steps
- Translate Prisma Schema from MVP spec.
- Configure Supabase and Cloudinary environments.
- Build Admin Dashboard Layout & Authentication.
