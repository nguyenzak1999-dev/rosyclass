# RosyClass CMS + CRM + LMS

A comprehensive web application for an English language center built with Next.js, TypeScript, Tailwind CSS, Shadcn UI, and PostgreSQL.

## Features
- **Dashboard**: High-level overview of leads, students, revenue, etc.
- **Website CMS**: Manage pages, courses, testimonials, blog, etc.
- **Lead CRM**: Track potential students, consultation notes, pipeline status.
- **Student Management**: Profiles, attendance, payments, progress.
- **Course & Class Management**: Manage courses, classes, schedules, and rooms.
- **Attendance & Payments**: Track student attendance and tuition fees.
- **Portals**: Separate views for Admins, Teachers, and Students/Parents.

## Tech Stack
- Framework: [Next.js (App Router)](https://nextjs.org/)
- UI: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- Database: [PostgreSQL](https://www.postgresql.org/)
- ORM: [Prisma](https://www.prisma.io/)
- Authentication: [NextAuth.js](https://next-auth.js.org/)

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your `.env` file (see `.env.example`)
4. Apply database migrations: `npx prisma db push`
5. Run the development server: `npm run dev`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
