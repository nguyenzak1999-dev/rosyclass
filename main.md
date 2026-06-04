# Project: English Center Management System

Build a full MVP web application for an English language center.
Name; RosyClass
Website; rosyclass.edu.vn
Address: Gia Lâm, Hà Nội, Việt Nam
Language: Vietnamese

## Tech Stack

Use:
- Next.js App Router
- TypeScript
- Tailwind CSS
- Shadcn UI
- PostgreSQL
- Prisma ORM
- NextAuth or Supabase Auth
- React Hook Form
- Zod
- TanStack Table
- Recharts
- date-fns

## Main Goal

Create a CMS + CRM + class management system for an English center.

The system must allow the center to:
- Manage website content
- Manage leads
- Manage students
- Manage parents
- Manage teachers
- Manage courses
- Manage classes
- Arrange students into classes
- Manage class schedules
- Mark attendance
- Track tuition payments
- Track student debt
- View reports

## UI Style

Use Shadcn UI as the main component system.

Style:
- Modern SaaS dashboard
- Clean and minimal
- Light theme first
- Responsive
- Sidebar layout
- Table-heavy admin interface
- Rounded cards
- Clear typography
- Easy-to-use forms
- Optimized for desktop admin usage
- Attendance screen must work well on mobile

Use these Shadcn components:
- Sidebar
- Button
- Card
- Input
- Textarea
- Select
- Table
- Badge
- Dropdown Menu
- Dialog
- Sheet
- Tabs
- Form
- Calendar
- Popover
- Command
- Checkbox
- Radio Group
- Toast
- Chart
- Avatar
- Separator
- Breadcrumb

## Layout

Create two main areas:

### Public Website

Routes:
- /
- /courses
- /courses/[slug]
- /teachers
- /blog
- /blog/[slug]
- /contact
- /placement-test

Public website features:
- Homepage
- Course listing
- Course detail
- Teacher section
- Testimonials
- Blog
- Contact form
- Lead registration form
- Placement test booking form

### Admin Dashboard

Routes:
- /admin/dashboard
- /admin/leads
- /admin/leads/[id]
- /admin/students
- /admin/students/[id]
- /admin/parents
- /admin/courses
- /admin/classes
- /admin/classes/[id]
- /admin/classes/arrange
- /admin/schedules
- /admin/attendance
- /admin/teachers
- /admin/payments
- /admin/reports
- /admin/cms/pages
- /admin/cms/blog
- /admin/cms/banners
- /admin/cms/testimonials
- /admin/settings/users
- /admin/settings/roles
- /admin/settings/branches
- /admin/settings/rooms

## User Roles

Create role-based access control.

Roles:
- SUPER_ADMIN
- ADMIN
- CONSULTANT
- ACCOUNTANT
- TEACHER
- STUDENT
- PARENT

Permissions:

SUPER_ADMIN:
- Full access

ADMIN:
- Manage students
- Manage teachers
- Manage courses
- Manage classes
- Manage schedules
- Manage attendance
- View reports
- Manage CMS

CONSULTANT:
- Manage leads
- Add consultation notes
- Book placement tests
- Convert lead to student
- View courses and classes

ACCOUNTANT:
- Manage payments
- Create invoices
- View debts
- View revenue reports

TEACHER:
- View assigned classes
- View teaching schedule
- Mark attendance
- Add student comments
- Add scores

STUDENT/PARENT:
- View schedule
- View attendance
- View scores
- View payment status
- View announcements

## Core Modules

### 1. Dashboard

Show metric cards:
- Total leads
- New leads today
- Total active students
- Active classes
- Monthly revenue
- Unpaid tuition amount
- Today classes
- Upcoming placement tests

Show charts:
- Revenue by month
- Leads by source
- Lead conversion rate
- Class occupancy

Show tables:
- Recent leads
- Upcoming classes
- Students with unpaid tuition

### 2. Lead CRM

Lead fields:
- fullName
- phone
- email
- age
- parentName
- parentPhone
- learningGoal
- currentLevel
- interestedCourseId
- source
- assignedToId
- status
- followUpDate
- notes

Lead statuses:
- NEW
- CONTACTED
- NO_ANSWER
- CONSULTED
- PLACEMENT_TEST_BOOKED
- TESTED
- WAITING_FOR_PAYMENT
- ENROLLED
- LOST

Features:
- Create lead
- Edit lead
- Search leads
- Filter by status
- Filter by source
- Filter by assigned consultant
- Add consultation notes
- Set follow-up date
- Book placement test
- Convert lead to student
- Show timeline of lead activities

### 3. Student Management

Student fields:
- fullName
- phone
- email
- dateOfBirth
- gender
- address
- parentId
- currentLevel
- learningGoal
- status
- source
- joinedAt
- notes

Student statuses:
- ACTIVE
- WAITING_CLASS
- RESERVED
- PAUSED
- COMPLETED
- DROPPED

Features:
- Create student
- Edit student
- Search students
- Filter by class
- Filter by status
- View student profile
- View class history
- View attendance history
- View payment history
- View scores
- View teacher comments

Student detail page tabs:
- Overview
- Classes
- Attendance
- Scores
- Payments
- Notes

### 4. Parent Management

Parent fields:
- fullName
- phone
- email
- relationship
- address
- notes

Features:
- Link parent to student
- One parent can have multiple students
- View all children of a parent

### 5. Course Management

Course fields:
- name
- slug
- level
- description
- targetAudience
- learningOutcomes
- totalSessions
- sessionDurationMinutes
- tuitionFee
- salePrice
- thumbnail
- isPublished
- status

Course levels:
- KIDS
- STARTER
- A1
- A2
- B1
- B2
- IELTS_FOUNDATION
- IELTS_5_5
- IELTS_6_5
- TOEIC
- COMMUNICATION
- ONE_ON_ONE

Features:
- Create course
- Edit course
- Publish/unpublish course
- Display selected courses on public website

### 6. Class Management

Class fields:
- name
- courseId
- teacherId
- teachingAssistantId
- branchId
- roomId
- maxStudents
- startDate
- expectedEndDate
- status
- notes

Class statuses:
- UPCOMING
- ACTIVE
- COMPLETED
- PAUSED
- CANCELLED

Features:
- Create class
- Edit class
- Assign teacher
- Assign room
- Add students to class
- Remove students from class
- Transfer student to another class
- Show current student count
- Show remaining seats
- Prevent adding students if class is full
- View class detail

Class detail tabs:
- Overview
- Students
- Schedule
- Attendance
- Payments
- Notes

### 7. Class Arrangement

Create a dedicated page: /admin/classes/arrange

Layout:
- Left panel: students waiting for class
- Right panel: suitable classes
- Filters:
  - Level
  - Course
  - Branch
  - Available time
  - Teacher
  - Class status

For each waiting student show:
- Name
- Age
- Current level
- Learning goal
- Preferred schedule
- Placement test score
- Notes

For each suggested class show:
- Class name
- Course
- Teacher
- Schedule
- Branch
- Room
- Current students / max students
- Remaining seats
- Status

Business logic:
- Suggest classes based on level, course, available schedule, and remaining seats.
- Do not allow adding student if class is full.
- Show confirmation dialog before adding student to class.
- After adding, student status becomes ACTIVE.
- Create ClassStudent record.

### 8. Schedule Management

Schedule features:
- Create recurring weekly schedule for class
- Generate class sessions
- Change session date/time
- Change teacher for a specific session
- Change room
- Cancel session
- Create make-up session
- View calendar by day/week/month
- Filter by teacher, room, branch, class

ClassSchedule fields:
- classId
- dayOfWeek
- startTime
- endTime
- roomId
- teacherId

ClassSession fields:
- classId
- scheduleId
- sessionDate
- startTime
- endTime
- roomId
- teacherId
- status
- topic
- notes

Session statuses:
- SCHEDULED
- COMPLETED
- CANCELLED
- MAKE_UP

### 9. Attendance

Attendance features:
- Teacher can mark attendance per session
- Admin can edit attendance
- Show attendance rate per student
- Alert if student is absent too many times

Attendance statuses:
- PRESENT
- ABSENT_WITH_PERMISSION
- ABSENT_WITHOUT_PERMISSION
- LATE
- MAKE_UP

Attendance screen requirements:
- Mobile-friendly
- Big buttons
- Easy to mark quickly
- Show student list of selected class session
- Add note per student
- Save attendance

### 10. Payment Management

Payment features:
- Create payment record
- Track tuition fee
- Track paid amount
- Track remaining debt
- Support partial payment
- Generate receipt
- View unpaid students
- View payment history
- Monthly revenue report

Payment fields:
- studentId
- classId
- courseId
- totalAmount
- paidAmount
- remainingAmount
- paymentMethod
- paymentDate
- dueDate
- status
- note
- createdById

Payment methods:
- CASH
- BANK_TRANSFER
- CARD
- OTHER

Payment statuses:
- UNPAID
- PARTIAL
- PAID
- REFUNDED
- CANCELLED

Business logic:
- remainingAmount = totalAmount - paidAmount
- If paidAmount = 0, status is UNPAID
- If paidAmount > 0 and paidAmount < totalAmount, status is PARTIAL
- If paidAmount >= totalAmount, status is PAID
- Show students with overdue payments

### 11. Placement Test

Placement test fields:
- leadId
- studentId
- testDate
- listeningScore
- readingScore
- writingScore
- speakingScore
- totalScore
- levelResult
- teacherComment
- suggestedCourseId
- suggestedClassId

Features:
- Book placement test
- Enter test result
- Suggest course/class
- Convert lead to student after test

### 12. Teacher Management

Teacher fields:
- fullName
- phone
- email
- avatar
- bio
- specialties
- certificates
- hourlyRate
- status

Features:
- Create teacher
- Edit teacher
- Assign teacher to class
- View teacher schedule
- View assigned classes
- Count teaching sessions
- Basic salary calculation by number of completed sessions

### 13. Website CMS

CMS modules:
- Pages
- Banners
- Blog posts
- Testimonials
- FAQ
- SEO settings

Blog fields:
- title
- slug
- excerpt
- content
- thumbnail
- status
- publishedAt
- seoTitle
- seoDescription

Page fields:
- title
- slug
- content
- seoTitle
- seoDescription
- status

Banner fields:
- title
- subtitle
- image
- buttonText
- buttonUrl
- position
- isActive

### 14. Reports

Reports:
- Lead conversion report
- Revenue report
- Debt report
- Class occupancy report
- Attendance report
- Teacher workload report
- Student progress report

Use cards, tables, and charts.

## Database Models

Create Prisma models for:

- User
- Role
- Permission
- Lead
- LeadNote
- Student
- Parent
- Teacher
- Course
- Class
- ClassStudent
- ClassSchedule
- ClassSession
- Attendance
- Payment
- PlacementTest
- Branch
- Room
- Page
- BlogPost
- Banner
- Testimonial
- Notification
- ActivityLog

## Important Business Rules

- A class cannot exceed maxStudents.
- A student can join multiple classes over time.
- A student can only be active once in the same class.
- A class must have a course.
- A class should have a teacher before becoming ACTIVE.
- Attendance is recorded per student per session.
- Payment can be partial or full.
- Student debt is calculated automatically.
- Leads can be converted into students.
- Placement test result should suggest suitable course/class.
- Cancelled sessions should not require attendance.
- Completed sessions should be counted for teacher salary.
- Public website only shows published courses, pages, banners, and blog posts.

## UI Requirements For List Pages

Every list page must have:
- Page title
- Description
- Search input
- Filters
- Data table
- Pagination
- Row actions
- Create button
- Empty state
- Loading state
- Error state

Use:
- Sheet for quick create/edit
- Dialog for delete confirmation
- Badge for status
- Dropdown menu for row actions
- Toast after successful actions

## Form Requirements

Use:
- React Hook Form
- Zod validation
- Shadcn Form components

Every form must:
- Validate required fields
- Show clear error messages
- Disable submit button while saving
- Show toast after success
- Keep UI clean and easy to scan

## API / Server Actions

Create server actions or API routes for:
- CRUD leads
- CRUD students
- CRUD parents
- CRUD courses
- CRUD classes
- Add student to class
- Transfer student between classes
- Generate class sessions
- Mark attendance
- CRUD payments
- CRUD teachers
- CRUD CMS content
- Dashboard statistics
- Reports

## Seed Data

Create seed data for:
- 5 users with different roles
- 20 leads
- 30 students
- 10 parents
- 8 teachers
- 8 courses
- 12 classes
- 5 branches
- 15 rooms
- 50 class sessions
- 100 attendance records
- 30 payment records
- 5 blog posts
- 3 banners
- 5 testimonials

## Deliverables

Generate:
- Project structure
- Prisma schema
- Seed script
- Authentication setup
- Role-based access control
- Admin layout with sidebar
- Public website layout
- CRUD screens for core modules
- Dashboard page
- Data tables
- Forms with validation
- Class arrangement page
- Schedule page
- Attendance page
- Payment page
- Reports page

Prioritize clean architecture and reusable components.