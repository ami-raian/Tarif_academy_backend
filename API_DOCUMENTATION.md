# 📚 Tarif Academy — API Documentation

> **Base URL:** `http://localhost:5000/api/v1`
> **Live URL:** `http://api.tarifacademy.com/api/v1`

---

## 📋 Table of Contents

- [Authentication Overview](#-authentication-overview)
- [Response Format](#-response-format)
- [🔐 Auth APIs](#-auth-apis-both-panels)
- [👨‍💼 ADMIN PANEL APIs](#-admin-panel-apis)
  - [Admin Management](#1-admin-management)
  - [Student Management](#2-student-management-admin)
  - [Course Management](#3-course-management-admin)
  - [Video Management](#4-video-management-admin)
  - [Enrollment Management](#5-enrollment-management-admin)
  - [MCQ / Exam Management](#6-mcq--exam-management-admin)
- [🎓 STUDENT PANEL APIs](#-student-panel-apis)
  - [Student Registration & Profile](#1-student-registration--profile)
  - [Course Browsing](#2-course-browsing-student)
  - [Video Streaming](#3-video-streaming-student)
  - [Enrollment](#4-enrollment-student)
  - [MCQ / Exam](#5-mcq--exam-student)
- [🔗 Webhook APIs](#-webhook-apis)
- [📊 Data Models Reference](#-data-models-reference)
- [⚡ Quick Reference Table](#-quick-reference-table)

---

## 🔑 Authentication Overview

এই API তে **JWT Bearer Token** ব্যবহার করা হয়।

### Token পাঠানোর নিয়ম

প্রতিটি protected route এ Header এ token পাঠাতে হবে:

```
Authorization: Bearer <your_access_token>
```

### Token Types

| Token         | মেয়াদ | ব্যবহার                |
| ------------- | ------ | ---------------------- |
| Access Token  | ৭ দিন  | সব protected route     |
| Refresh Token | ৩০ দিন | নতুন access token নিতে |

### Auth Guards

| Guard            | মানে                            |
| ---------------- | ------------------------------- |
| `protectAdmin`   | Admin token থাকতে হবে           |
| `protectStudent` | Student token থাকতে হবে         |
| `super_admin`    | Super admin role দরকার          |
| `admin`          | Admin বা super_admin role দরকার |

### Admin Roles

| Role          | Permission                              |
| ------------- | --------------------------------------- |
| `super_admin` | সব কিছু — admin তৈরি/মুছা, সব manage    |
| `admin`       | Course, student, exam manage করতে পারবে |
| `moderator`   | Limited access                          |

---

## 📤 Response Format

### ✅ Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Data fetched successfully",
  "data": {}
}
```

### ✅ Paginated Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Data fetched successfully",
  "data": [],
  "pagination": {
    "totalItems": 100,
    "totalPages": 10,
    "currentPage": 1,
    "pageSize": 10
  }
}
```

### ❌ Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Valid email required" }]
}
```

### HTTP Status Codes

| Code  | মানে                            |
| ----- | ------------------------------- |
| `200` | সফল                             |
| `201` | তৈরি হয়েছে                     |
| `400` | Validation error                |
| `401` | Token নেই বা invalid            |
| `403` | Permission নেই                  |
| `404` | পাওয়া যায়নি                   |
| `409` | Duplicate (email, roll ইত্যাদি) |
| `500` | Server error                    |

---

## 🔐 Auth APIs (Both Panels)

**Base Path:** `/api/v1/auth`

---

### POST `/auth/admin/login`

**Admin login করুন**

**Auth:** কোনো token লাগবে না

**Request Body:**

```json
{
  "email": "admin@tarifacademy.com",
  "password": "yourpassword"
}
```

| Field      | Type   | Required | Details        |
| ---------- | ------ | :------: | -------------- |
| `email`    | string |    ✅    | Admin এর email |
| `password` | string |    ✅    | Password       |

**Response:**

```json
{
  "success": true,
  "data": {
    "admin": {
      "_id": "6788abc...",
      "name": "Super Admin",
      "email": "admin@tarifacademy.com",
      "role": "super_admin",
      "isActive": true,
      "lastLogin": "2024-02-18T10:00:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### POST `/auth/student/login`

**Student login করুন**

**Auth:** কোনো token লাগবে না

**Request Body:**

```json
{
  "email": "student@example.com",
  "password": "yourpassword"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "student": {
      "_id": "6788def...",
      "roll": "TAS-2024-00001",
      "fullName": "Md. Raihan Ahmed",
      "email": "student@example.com",
      "isVerified": true,
      "isActive": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### POST `/auth/refresh-token`

**Access token expired হলে নতুন token নিন**

**Auth:** কোনো token লাগবে না

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:** নতুন `accessToken` এবং `refreshToken`

---

### POST `/auth/change-password`

**Password পরিবর্তন করুন (Admin এবং Student উভয়ের জন্য)**

**Auth:** `protectAdmin` অথবা `protectStudent`

**Request Body:**

```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

| Field             | Type   | Required | Details                         |
| ----------------- | ------ | :------: | ------------------------------- |
| `currentPassword` | string |    ✅    | বর্তমান password                |
| `newPassword`     | string |    ✅    | নতুন password (কমপক্ষে ৬ অক্ষর) |

---

---

# 👨‍💼 ADMIN PANEL APIs

> Admin panel এ সব route এ **Admin Access Token** পাঠাতে হবে।

---

## 1. Admin Management

**Base Path:** `/api/v1/auth/admin` এবং `/api/v1/admins`

---

### GET `/auth/admin/me`

**নিজের admin profile দেখুন**

**Auth:** `protectAdmin`

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "6788abc...",
    "name": "Super Admin",
    "email": "admin@tarifacademy.com",
    "role": "super_admin",
    "phone": "01700000000",
    "avatar": "https://cdn.example.com/avatar.jpg",
    "isActive": true,
    "lastLogin": "2024-02-18T10:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### POST `/auth/admin/register`

**নতুন Admin তৈরি করুন**

**Auth:** `protectAdmin` + `super_admin` role

**Request Body:**

```json
{
  "name": "New Admin",
  "email": "newadmin@tarifacademy.com",
  "password": "securepassword123",
  "role": "admin",
  "phone": "01711111111"
}
```

| Field      | Type   | Required | Details                                                   |
| ---------- | ------ | :------: | --------------------------------------------------------- |
| `name`     | string |    ✅    | Admin এর পুরো নাম                                         |
| `email`    | string |    ✅    | Unique email address                                      |
| `password` | string |    ✅    | কমপক্ষে ৬ অক্ষর                                           |
| `role`     | string |    ❌    | `super_admin`, `admin`, বা `moderator` (default: `admin`) |
| `phone`    | string |    ❌    | Phone number                                              |

---

### GET `/admins`

**সব Admin এর লিস্ট দেখুন**

**Auth:** `protectAdmin` (`super_admin` বা `admin`)

**Response:** Admin objects এর array

---

### GET `/admins/:id`

**একটি Admin এর বিস্তারিত দেখুন**

**Auth:** `protectAdmin`

**URL Params:**
| Param | Type | Details |
|-------|------|---------|
| `id` | ObjectId | Admin এর MongoDB ID |

---

### PUT `/admins/:id`

**Admin এর তথ্য আপডেট করুন**

**Auth:** `protectAdmin` + `super_admin` only

**Request Body (সব optional):**

```json
{
  "name": "Updated Admin Name",
  "email": "updated@tarifacademy.com",
  "role": "moderator",
  "phone": "01799999999",
  "avatar": "https://cdn.example.com/new-avatar.jpg"
}
```

| Field    | Type   | Details                             |
| -------- | ------ | ----------------------------------- |
| `name`   | string | Admin এর নাম                        |
| `email`  | string | Unique email                        |
| `role`   | string | `super_admin`, `admin`, `moderator` |
| `phone`  | string | Phone number                        |
| `avatar` | string | Profile image URL                   |

---

### DELETE `/admins/:id`

**Admin মুছে ফেলুন**

**Auth:** `protectAdmin` + `super_admin` only

> ⚠️ Permanent delete — undo করা যাবে না।

---

### PATCH `/admins/:id/toggle-status`

**Admin এর active/inactive status পরিবর্তন করুন**

**Auth:** `protectAdmin` + `super_admin` only

**Response:** Updated admin with new `isActive` value

---

---

## 2. Student Management (Admin)

**Base Path:** `/api/v1/students`

---

### GET `/students`

**সব Student এর লিস্ট দেখুন (Filter সহ)**

**Auth:** কোনো token লাগবে না

**Query Parameters:**
| Param | Type | Default | Details | Example |
|-------|------|---------|---------|---------|
| `page` | number | 1 | Page number | `?page=2` |
| `limit` | number | 10 | প্রতি পেজে কতজন | `?limit=20` |
| `board` | string | - | SSC board অনুযায়ী filter | `?board=dhaka` |
| `group` | string | - | Group অনুযায়ী filter | `?group=science` |
| `passingYear` | number | - | SSC passing year | `?passingYear=2023` |
| `district` | string | - | জেলা অনুযায়ী filter | `?district=Dhaka` |
| `search` | string | - | নাম বা email দিয়ে খুঁজুন | `?search=Rahman` |

**Example Request:**

```
GET /students?page=1&limit=10&board=dhaka&group=science&search=Ahmed
```

---

### GET `/students/stats`

**Student এর statistics দেখুন**

**Auth:** কোনো token লাগবে না

**Response:**

```json
{
  "data": {
    "total": 500,
    "verified": 420,
    "unverified": 80,
    "byBoard": {
      "dhaka": 200,
      "rajshahi": 100,
      "chittagong": 80,
      "sylhet": 60,
      "others": 60
    },
    "byGroup": {
      "science": 300,
      "commerce": 150,
      "arts": 50
    }
  }
}
```

---

### GET `/students/:id`

**একজন Student এর বিস্তারিত দেখুন**

**Auth:** কোনো token লাগবে না

---

### PATCH `/students/:id/verify`

**Student কে verify করুন**

**Auth:** কোনো token লাগবে না (Admin action)

Verify করলে student এর `isVerified: true` হয়।

---

### PATCH `/students/:id/toggle-status`

**Student এর active/inactive status পরিবর্তন করুন**

**Auth:** কোনো token লাগবে না

---

### DELETE `/students/:id`

**Student মুছে ফেলুন**

**Auth:** কোনো token লাগবে না

---

---

## 3. Course Management (Admin)

**Base Path:** `/api/v1/courses`

---

### GET `/courses`

**সব Course এর লিস্ট দেখুন**

**Auth:** কোনো token লাগবে না

**Query Parameters:**
| Param | Type | Details |
|-------|------|---------|
| `page` | number | Page number (default: 1) |
| `limit` | number | প্রতি পেজে কতটি (default: 10) |
| `category` | string | Category অনুযায়ী filter |
| `level` | string | `beginner`, `intermediate`, `advanced` |
| `search` | string | Title এ search |
| `isPublished` | boolean | Published/unpublished filter |

---

### GET `/courses/:id`

**একটি Course এর বিস্তারিত দেখুন**

**Auth:** কোনো token লাগবে না

---

### GET `/courses/slug/:slug`

**Slug দিয়ে Course খুঁজুন**

**Auth:** কোনো token লাগবে না

**Example:** `GET /courses/slug/complete-web-development-bangla`

---

### GET `/courses/instructor/:instructorId`

**Instructor এর সব Course দেখুন**

**Auth:** কোনো token লাগবে না

---

### POST `/courses`

**নতুন Course তৈরি করুন**

**Auth:** `protectAdmin` + (`super_admin` বা `admin`)

**Request Body:**

```json
{
  "title": "Complete Web Development in Bangla",
  "description": "A comprehensive web development course from scratch covering HTML, CSS, JavaScript, React, Node.js and MongoDB.",
  "price": 1500,
  "discountPrice": 999,
  "thumbnail": "https://cdn.example.com/course-thumbnail.jpg",
  "instructor": "60d21b4667d0d8992e610c85",
  "category": "Web Development",
  "level": "beginner",
  "language": "Bangla",
  "duration": 3600,
  "totalLessons": 120
}
```

| Field           | Type     | Required | Details                                   |
| --------------- | -------- | :------: | ----------------------------------------- |
| `title`         | string   |    ✅    | Course এর নাম (সর্বোচ্চ ২০০ অক্ষর)        |
| `description`   | string   |    ✅    | বিস্তারিত বিবরণ                           |
| `price`         | number   |    ✅    | আসল মূল্য (BDT, কমপক্ষে 0)                |
| `discountPrice` | number   |    ❌    | ছাড়ের মূল্য (price এর কম হতে হবে)        |
| `thumbnail`     | string   |    ✅    | Cover image URL                           |
| `instructor`    | ObjectId |    ✅    | Instructor এর user ID                     |
| `category`      | string   |    ✅    | Course category                           |
| `level`         | string   |    ✅    | `beginner`, `intermediate`, বা `advanced` |
| `language`      | string   |    ❌    | মাধ্যম (default: `Bangla`)                |
| `duration`      | number   |    ❌    | মোট সময় মিনিটে                           |
| `totalLessons`  | number   |    ❌    | মোট lesson সংখ্যা                         |

> 💡 **Note:** `slug` টি title থেকে automatically তৈরি হয়।

---

### PUT `/courses/:id`

**Course আপডেট করুন**

**Auth:** `protect` (Admin বা course owner)

**Request Body:** Create এর মতো — সব field optional

---

### DELETE `/courses/:id`

**Course মুছুন (Soft Delete)**

**Auth:** `protectAdmin` + `super_admin`

> Course টি database থেকে মুছবে না — `isDeleted: true` হবে।

---

### PATCH `/courses/:id/publish`

**Course Publish/Unpublish করুন**

**Auth:** `protectAdmin` + (`super_admin` বা `admin`)

Published course student রা দেখতে পাবে।

---

---

## 4. Video Management (Admin)

**Base Path:** `/api/v1/videos`

Videos **Bunny.net CDN** তে store ও stream হয়।

---

### POST `/videos`

**Video record তৈরি করুন (ফাইল upload ছাড়া)**

**Auth:** `protectAdmin`

**Request Body:**

```json
{
  "title": "Introduction to HTML",
  "description": "Learn the basics of HTML structure and tags",
  "courseId": "60d21b4667d0d8992e610c85",
  "sectionTitle": "Module 1: HTML Basics",
  "order": 1,
  "isFree": true
}
```

| Field          | Type     | Required | Details                          |
| -------------- | -------- | :------: | -------------------------------- |
| `title`        | string   |    ✅    | Video এর নাম                     |
| `description`  | string   |    ❌    | সংক্ষিপ্ত বিবরণ                  |
| `courseId`     | ObjectId |    ✅    | কোন course এর video              |
| `sectionTitle` | string   |    ✅    | Section/Module এর নাম            |
| `order`        | number   |    ✅    | Section এ কত নম্বর video         |
| `isFree`       | boolean  |    ❌    | Free preview? (default: `false`) |

---

### POST `/videos/upload`

**Video ফাইল Bunny.net CDN তে upload করুন**

**Auth:** `protectAdmin`

**Content-Type:** `multipart/form-data`

**Form Fields:**
| Field | Type | Required | Details |
|-------|------|:--------:|---------|
| `video` | File | ✅ | Video ফাইল |
| `title` | string | ✅ | Video এর নাম |
| `courseId` | string | ✅ | Course ID |
| `sectionTitle` | string | ✅ | Section এর নাম |
| `order` | number | ✅ | Video এর ক্রম |
| `description` | string | ❌ | Video বিবরণ |
| `isFree` | boolean | ❌ | Free preview |

**Upload Limits:**
| Property | মান |
|----------|-----|
| সর্বোচ্চ size | 500 MB |
| Allowed format | `.mp4`, `.webm`, `.mov`, `.avi`, `.mkv`, `.m4v` |

---

### GET `/videos/course/:courseId`

**Course এর সব Video দেখুন**

**Auth:** `protect` (authenticated user)

**Response:**

```json
{
  "data": [
    {
      "_id": "...",
      "title": "Introduction to HTML",
      "sectionTitle": "Module 1: HTML Basics",
      "order": 1,
      "duration": 1800,
      "status": "ready",
      "thumbnailUrl": "https://cdn.bunny.net/...",
      "isFree": true
    }
  ]
}
```

---

### GET `/videos/:videoId/status`

**Bunny.net এ Video encoding status চেক করুন**

**Auth:** `protectAdmin`

**Response:**

```json
{
  "data": {
    "videoId": "...",
    "status": "ready",
    "bunnyVideoId": "abc123def",
    "thumbnailUrl": "https://cdn.example.com/thumb.jpg",
    "duration": 1800
  }
}
```

**Status Values:**
| Status | মানে |
|--------|------|
| `processing` | Encoding চলছে |
| `ready` | Stream করার জন্য প্রস্তুত |
| `failed` | Encoding fail হয়েছে |

---

### PATCH `/videos/:videoId`

**Video এর তথ্য আপডেট করুন**

**Auth:** `protectAdmin`

**Request Body (সব optional):**

```json
{
  "title": "Updated Video Title",
  "description": "Updated description text",
  "sectionTitle": "Module 2: CSS Basics",
  "order": 3,
  "isFree": false
}
```

---

### DELETE `/videos/:videoId`

**Video মুছে ফেলুন**

**Auth:** `protectAdmin`

> Bunny.net থেকেও মুছে যাবে এবং database থেকেও।

---

---

## 5. Enrollment Management (Admin)

**Base Path:** `/api/v1/enrollments`

---

### GET `/enrollments/admin/all`

**Platform এর সব Enrollment দেখুন**

**Auth:** `protectAdmin`

**Response:** সব enrollment এর list — student ও course info সহ

---

### PATCH `/enrollments/:enrollmentId/approve`

**Enrollment Approve করুন**

**Auth:** `protectAdmin`

Student কে course এ access দেওয়া হবে।

**Response:**

```json
{
  "data": {
    "_id": "...",
    "status": "approved",
    "approvedBy": "admin_id",
    "approvedAt": "2024-02-18T10:00:00Z"
  }
}
```

---

### PATCH `/enrollments/:enrollmentId/reject`

**Enrollment Reject করুন**

**Auth:** `protectAdmin`

**Request Body:**

```json
{
  "rejectionReason": "Payment verification failed. Please contact support."
}
```

| Field             | Type   | Required | Details            |
| ----------------- | ------ | :------: | ------------------ |
| `rejectionReason` | string |    ❌    | কেন reject করা হলো |

---

### DELETE `/enrollments/:enrollmentId`

**Enrollment বাতিল/মুছুন**

**Auth:** `protectAdmin`

---

---

## 6. MCQ / Exam Management (Admin)

**Base Path:** `/api/v1/mcq`

---

### GET `/mcq/exams`

**সব Exam এর লিস্ট দেখুন**

**Auth:** `protectAdmin`

**Query Parameters:**
| Param | Type | Details |
|-------|------|---------|
| `page` | number | Page number |
| `limit` | number | প্রতি পেজে কতটি |
| `isPublished` | boolean | Published/unpublished filter |
| `search` | string | Title এ search |

---

### POST `/mcq/exams`

**নতুন Exam তৈরি করুন**

**Auth:** `protectAdmin` + (`super_admin` বা `admin`)

**Request Body:**

```json
{
  "title": "SSC Physics Mock Test — Chapter 1",
  "description": "এই পরীক্ষাটি SSC Physics Chapter 1 এর উপর ভিত্তি করে তৈরি।",
  "duration": 60,
  "passingMarks": 40,
  "accessCode": "PHY2024",
  "startTime": "2024-03-01T09:00:00.000Z",
  "endTime": "2024-03-01T10:00:00.000Z"
}
```

| Field          | Type   | Required | Details                                       |
| -------------- | ------ | :------: | --------------------------------------------- |
| `title`        | string |    ✅    | Exam এর নাম (সর্বোচ্চ ২০০ অক্ষর)              |
| `description`  | string |    ❌    | Exam এর বিবরণ                                 |
| `duration`     | number |    ✅    | সময় মিনিটে (কমপক্ষে ১)                       |
| `passingMarks` | number |    ✅    | Pass করতে ন্যূনতম marks                       |
| `accessCode`   | string |    ❌    | Secret code (শুধু code জানলে exam দিতে পারবে) |
| `startTime`    | date   |    ❌    | Exam শুরুর সময় (ISO format)                  |
| `endTime`      | date   |    ❌    | Exam শেষের সময় (ISO format)                  |

---

### GET `/mcq/exams/:id`

**একটি Exam এর বিস্তারিত দেখুন (সব answer সহ)**

**Auth:** `protectAdmin`

---

### PUT `/mcq/exams/:id`

**Exam আপডেট করুন**

**Auth:** `protectAdmin` + (`super_admin` বা `admin`)

**Request Body:** Create এর মতো — সব field optional

---

### DELETE `/mcq/exams/:id`

**Exam মুছুন (Soft Delete)**

**Auth:** `protectAdmin` + `super_admin`

---

### PATCH `/mcq/exams/:id/publish`

**Exam Publish/Unpublish করুন**

**Auth:** `protectAdmin` + (`super_admin` বা `admin`)

Published exam student দের কাছে দৃশ্যমান হবে।

---

### PATCH `/mcq/exams/:id/publish-results`

**Exam এর Result Student দের দেখাতে শুরু করুন**

**Auth:** `protectAdmin` + (`super_admin` বা `admin`)

---

### PATCH `/mcq/exams/:id/unpublish-results`

**Exam এর Result Student দের কাছ থেকে লুকান**

**Auth:** `protectAdmin` + (`super_admin` বা `admin`)

---

### GET `/mcq/exams/:examId/questions`

**Exam এর সব Question দেখুন (Correct Answer সহ)**

**Auth:** `protectAdmin`

---

### POST `/mcq/questions`

**নতুন Question তৈরি করুন**

**Auth:** `protectAdmin` + (`super_admin` বা `admin`)

**Request Body:**

```json
{
  "examId": "60d21b4667d0d8992e610c85",
  "questionText": "নিউটনের গতির দ্বিতীয় সূত্র অনুযায়ী, যদি ভর 10 kg এবং ত্বরণ 5 m/s² হয়, তাহলে বল কত?",
  "options": [
    { "text": "50 N", "isCorrect": true },
    { "text": "20 N", "isCorrect": false },
    { "text": "2 N", "isCorrect": false },
    { "text": "15 N", "isCorrect": false }
  ],
  "marks": 1,
  "order": 1
}
```

| Field                 | Type     | Required | Details                            |
| --------------------- | -------- | :------: | ---------------------------------- |
| `examId`              | ObjectId |    ✅    | কোন exam এ add করবেন               |
| `questionText`        | string   |    ✅    | প্রশ্নের text (Bangla সাপোর্ট করে) |
| `options`             | array    |    ✅    | উত্তর options (২–৫টি)              |
| `options[].text`      | string   |    ✅    | Option এর text                     |
| `options[].isCorrect` | boolean  |    ✅    | এটি সঠিক উত্তর কিনা                |
| `marks`               | number   |    ❌    | এই প্রশ্নের marks (default: 1)     |
| `order`               | number   |    ❌    | প্রশ্নের ক্রম                      |

---

### POST `/mcq/exams/:examId/questions/bulk`

**একসাথে অনেক Question add করুন**

**Auth:** `protectAdmin` + (`super_admin` বা `admin`)

**Request Body (Array):**

```json
[
  {
    "questionText": "বাংলাদেশের রাজধানীর নাম কী?",
    "options": [
      { "text": "ঢাকা", "isCorrect": true },
      { "text": "চট্টগ্রাম", "isCorrect": false },
      { "text": "রাজশাহী", "isCorrect": false },
      { "text": "খুলনা", "isCorrect": false }
    ],
    "marks": 1,
    "order": 1
  },
  {
    "questionText": "বাংলাদেশ কত সালে স্বাধীন হয়?",
    "options": [
      { "text": "1971", "isCorrect": true },
      { "text": "1952", "isCorrect": false },
      { "text": "1947", "isCorrect": false },
      { "text": "1975", "isCorrect": false }
    ],
    "marks": 1,
    "order": 2
  }
]
```

---

### PUT `/mcq/questions/:id`

**Question আপডেট করুন**

**Auth:** `protectAdmin` + (`super_admin` বা `admin`)

**Request Body:** Create এর মতো — সব field optional

---

### DELETE `/mcq/questions/:id`

**Question মুছুন**

**Auth:** `protectAdmin` + `super_admin`

---

### GET `/mcq/exams/:examId/submissions`

**Exam এর সব Student Submission দেখুন**

**Auth:** `protectAdmin`

---

---

# 🎓 STUDENT PANEL APIs

> Student panel এ protected route গুলোতে **Student Access Token** পাঠাতে হবে।

---

## 1. Student Registration & Profile

**Base Path:** `/api/v1/students` এবং `/api/v1/auth/student`

---

### POST `/students/register`

**নতুন Student হিসেবে Registration করুন**

**Auth:** কোনো token লাগবে না

**Request Body:**

```json
{
  "fullName": "Md. Raihan Ahmed",
  "email": "raihan@example.com",
  "password": "securepass123",
  "mobile": "01712345678",
  "whatsapp": "01712345678",
  "dateOfBirth": "2003-05-15",
  "gender": "male",
  "bloodGroup": "B+",
  "photo": "https://cdn.example.com/photo.jpg",
  "nidOrBirthCert": "1234567890123",
  "educationalInfo": {
    "ssc": {
      "roll": "123456",
      "registration": "2021123456",
      "schoolName": "Dhaka Government High School",
      "board": "dhaka",
      "passingYear": 2021,
      "group": "science",
      "gpa": 5.0
    },
    "hsc": {
      "roll": "654321",
      "registration": "2023654321",
      "collegeName": "Notre Dame College",
      "board": "dhaka",
      "passingYear": 2023,
      "group": "science",
      "gpa": 4.83
    }
  },
  "guardian": {
    "type": "father",
    "name": "Md. Karim Ahmed",
    "mobile": "01987654321",
    "occupation": "Business",
    "relation": "Father"
  },
  "address": {
    "present": "House 12, Road 5, Mirpur, Dhaka-1216",
    "district": "Dhaka",
    "permanent": "Village: Goalanda, Upazila: Goalandaghat, Dist: Rajbari"
  }
}
```

**সব Field এর বিস্তারিত:**

**ব্যক্তিগত তথ্য:**
| Field | Type | Required | Validation |
|-------|------|:--------:|-----------|
| `fullName` | string | ✅ | ৩–১০০ অক্ষর |
| `email` | string | ✅ | Valid email format |
| `password` | string | ✅ | কমপক্ষে ৬ অক্ষর |
| `mobile` | string | ✅ | বাংলাদেশি format: `01XXXXXXXXX` (11 digits) |
| `whatsapp` | string | ❌ | বাংলাদেশি format: `01XXXXXXXXX` |
| `dateOfBirth` | date | ✅ | ISO format: `YYYY-MM-DD` |
| `gender` | string | ✅ | `male`, `female`, বা `other` |
| `bloodGroup` | string | ✅ | `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-` |
| `photo` | string | ✅ | Photo URL |
| `nidOrBirthCert` | string | ✅ | NID বা জন্মনিবন্ধন নম্বর |

**শিক্ষাগত তথ্য (SSC):**
| Field | Type | Required | Validation |
|-------|------|:--------:|-----------|
| `educationalInfo.ssc.roll` | string | ❌ | Roll number |
| `educationalInfo.ssc.registration` | string | ❌ | Registration number |
| `educationalInfo.ssc.schoolName` | string | ❌ | School এর নাম |
| `educationalInfo.ssc.board` | string | ❌ | নিচের board list দেখুন |
| `educationalInfo.ssc.passingYear` | number | ❌ | ২০০০ থেকে বর্তমান বছর পর্যন্ত |
| `educationalInfo.ssc.group` | string | ❌ | `science`, `commerce`, বা `arts` |
| `educationalInfo.ssc.gpa` | number | ❌ | ১.০০ থেকে ৫.০০ |

**শিক্ষাগত তথ্য (HSC):** SSC এর মতো একই structure, `schoolName` এর বদলে `collegeName`

**Valid Board Names:**
`dhaka` | `rajshahi` | `chittagong` | `sylhet` | `barishal` | `khulna` | `dinajpur` | `comilla` | `jessore` | `mymensingh` | `technical` | `madrasah`

**অভিভাবকের তথ্য:**
| Field | Type | Required | Validation |
|-------|------|:--------:|-----------|
| `guardian.type` | string | ✅ | `father`, `mother`, `brother`, `sister`, `uncle`, `aunt`, `other` |
| `guardian.name` | string | ✅ | অভিভাবকের নাম |
| `guardian.mobile` | string | ✅ | বাংলাদেশি mobile number |
| `guardian.occupation` | string | ❌ | পেশা |
| `guardian.relation` | string | ❌ | সম্পর্ক |

**ঠিকানা:**
| Field | Type | Required | Details |
|-------|------|:--------:|---------|
| `address.present` | string | ✅ | বর্তমান ঠিকানা |
| `address.district` | string | ✅ | জেলা |
| `address.permanent` | string | ❌ | স্থায়ী ঠিকানা |

> 💡 **Auto Generated:** Registration এর সময় `TAS-YYYY-XXXXX` format এ unique roll number তৈরি হয়।

---

### GET `/auth/student/me`

**নিজের Profile দেখুন**

**Auth:** `protectStudent`

**Response:**

```json
{
  "data": {
    "_id": "6788def...",
    "roll": "TAS-2024-00001",
    "fullName": "Md. Raihan Ahmed",
    "email": "raihan@example.com",
    "mobile": "01712345678",
    "gender": "male",
    "bloodGroup": "B+",
    "photo": "https://cdn.example.com/photo.jpg",
    "educationalInfo": {
      "ssc": {
        "board": "dhaka",
        "gpa": 5.0,
        "group": "science",
        "passingYear": 2021
      },
      "hsc": {
        "board": "dhaka",
        "gpa": 4.83,
        "group": "science",
        "passingYear": 2023
      }
    },
    "isVerified": true,
    "isActive": true,
    "createdAt": "2024-01-15T00:00:00Z"
  }
}
```

---

### PUT `/students/:id`

**Profile আপডেট করুন**

**Auth:** কোনো token লাগবে না

**Request Body:** Registration এর মতো — সব field optional

---

---

## 2. Course Browsing (Student)

**Base Path:** `/api/v1/courses`

---

### GET `/courses`

**সব Published Course দেখুন**

**Auth:** কোনো token লাগবে না

**Query Parameters:**
| Param | Type | Details |
|-------|------|---------|
| `page` | number | Page number (default: 1) |
| `limit` | number | প্রতি পেজে কতটি (default: 10) |
| `category` | string | Category filter |
| `level` | string | `beginner`, `intermediate`, `advanced` |
| `search` | string | Title এ search |

**Response:**

```json
{
  "data": [
    {
      "_id": "...",
      "title": "Complete Web Development in Bangla",
      "slug": "complete-web-development-in-bangla",
      "description": "...",
      "price": 1500,
      "discountPrice": 999,
      "thumbnail": "...",
      "level": "beginner",
      "language": "Bangla",
      "duration": 3600,
      "totalLessons": 120,
      "enrolledStudents": 500,
      "rating": 4.8,
      "isPublished": true
    }
  ],
  "pagination": {
    "totalItems": 50,
    "totalPages": 5,
    "currentPage": 1,
    "pageSize": 10
  }
}
```

---

### GET `/courses/slug/:slug`

**Course Details দেখুন (slug দিয়ে)**

**Auth:** কোনো token লাগবে না

**Example:** `GET /courses/slug/complete-web-development-in-bangla`

---

---

## 3. Video Streaming (Student)

**Base Path:** `/api/v1/videos`

---

### GET `/videos/course/:courseId`

**Course এর সব Video এর লিস্ট দেখুন**

**Auth:** `protect` (authenticated user)

---

### GET `/videos/:videoId/stream`

**Video Stream করার URL পান**

**Auth:** `protectStudent`

> Student অবশ্যই enrolled এবং approved হতে হবে।

**Response:**

```json
{
  "data": {
    "streamUrl": "https://vz-xxxxxx.b-cdn.net/VIDEO_GUID/playlist.m3u8",
    "videoTitle": "Introduction to HTML",
    "duration": 1800
  }
}
```

---

### POST `/videos/:videoId/complete`

**Video দেখা শেষ হলে mark করুন**

**Auth:** `protectStudent`

Course এর progress automatically update হয়।

**Response:**

```json
{
  "data": {
    "progress": 25,
    "completedVideos": 3,
    "totalVideos": 12
  }
}
```

---

---

## 4. Enrollment (Student)

**Base Path:** `/api/v1/enrollments`

---

### POST `/enrollments`

**Course এ Enroll করুন**

**Auth:** `protectStudent`

**Request Body:**

```json
{
  "courseId": "60d21b4667d0d8992e610c85",
  "paymentAmount": 999,
  "transactionId": "TXN-20240218-ABC123"
}
```

| Field           | Type     | Required | Details                     |
| --------------- | -------- | :------: | --------------------------- |
| `courseId`      | ObjectId |    ✅    | যে course এ enroll করতে চান |
| `paymentAmount` | number   |    ✅    | পরিশোধিত amount (BDT)       |
| `transactionId` | string   |    ❌    | Payment reference number    |

> 💡 **Note:** Enrollment শুরু হয় `status: "pending"` দিয়ে। Admin approve করলে course access পাবেন।

---

### GET `/enrollments/my-courses`

**নিজের সব Enrolled Course দেখুন**

**Auth:** `protectStudent`

**Response:**

```json
{
  "data": [
    {
      "_id": "...",
      "courseId": {
        "_id": "...",
        "title": "Complete Web Development in Bangla",
        "thumbnail": "...",
        "totalLessons": 120
      },
      "status": "approved",
      "paymentStatus": "completed",
      "progress": 45,
      "enrolledAt": "2024-01-15T10:00:00Z",
      "lastAccessedAt": "2024-02-10T08:30:00Z"
    }
  ]
}
```

---

### GET `/enrollments/check/:courseId`

**কোনো Course এ Enrolled কিনা check করুন**

**Auth:** `protectStudent`

**Response:**

```json
{
  "data": {
    "isEnrolled": true,
    "status": "approved",
    "enrollmentId": "6788xyz..."
  }
}
```

---

### GET `/enrollments/progress/:courseId`

**Course এ আপনার Progress দেখুন**

**Auth:** `protectStudent`

**Response:**

```json
{
  "data": {
    "progress": 65,
    "completedVideos": ["videoId1", "videoId2", "videoId3"],
    "totalVideos": 30,
    "lastAccessedAt": "2024-02-10T08:30:00Z"
  }
}
```

---

---

## 5. MCQ / Exam (Student)

**Base Path:** `/api/v1/mcq`

---

### GET `/mcq/exams/published`

**সব Published Exam দেখুন**

**Auth:** `protectStudent`

**Query Parameters:** `page`, `limit`, `search`

**Response:**

```json
{
  "data": [
    {
      "_id": "...",
      "title": "SSC Physics Mock Test — Chapter 1",
      "description": "...",
      "duration": 60,
      "totalQuestions": 50,
      "totalMarks": 50,
      "passingMarks": 40,
      "startTime": "2024-03-01T09:00:00Z",
      "endTime": "2024-03-01T10:00:00Z",
      "hasAccessCode": true
    }
  ]
}
```

---

### GET `/mcq/exams/published/:id`

**একটি Published Exam এর বিস্তারিত দেখুন**

**Auth:** `protectStudent`

---

### GET `/mcq/my-exams`

**নিজের Exam History দেখুন**

**Auth:** `protectStudent`

**Response:**

```json
{
  "data": [
    {
      "examId": { "title": "SSC Physics Mock Test", "_id": "..." },
      "obtainedMarks": 38,
      "totalMarks": 50,
      "percentage": 76,
      "isPassed": true,
      "submittedAt": "2024-03-01T09:55:00Z"
    }
  ]
}
```

---

### POST `/mcq/exams/:examId/verify-code`

**Access Code দিয়ে Exam এর দরজা খুলুন**

**Auth:** `protectStudent`

**Request Body:**

```json
{
  "accessCode": "PHY2024"
}
```

| Field        | Type   | Required | Details                    |
| ------------ | ------ | :------: | -------------------------- |
| `accessCode` | string |    ✅    | Exam এর secret access code |

---

### POST `/mcq/exams/:examId/start`

**Exam শুরু করুন**

**Auth:** `protectStudent`

**Response:**

```json
{
  "data": {
    "submissionId": "6788exam...",
    "startedAt": "2024-03-01T09:05:00Z",
    "expiresAt": "2024-03-01T10:05:00Z",
    "totalQuestions": 50,
    "duration": 60
  }
}
```

---

### GET `/mcq/exams/:examId/questions/student`

**Exam এর সব Question পান (সঠিক উত্তর ছাড়া)**

**Auth:** `protectStudent`

**Response:**

```json
{
  "data": [
    {
      "_id": "...",
      "questionText": "নিউটনের গতির দ্বিতীয় সূত্র কী?",
      "options": [
        { "text": "F = ma", "index": 0 },
        { "text": "F = mv", "index": 1 },
        { "text": "F = m/a", "index": 2 },
        { "text": "F = m²a", "index": 3 }
      ],
      "marks": 1,
      "order": 1
    }
  ]
}
```

---

### POST `/mcq/exams/:examId/answer`

**একটি Question এর উত্তর save করুন**

**Auth:** `protectStudent`

> Submit করার আগে যেকোনো সময় উত্তর পরিবর্তন করা যাবে।

**Request Body:**

```json
{
  "questionId": "60d21b4667d0d8992e610c85",
  "selectedOptionIndex": 0
}
```

| Field                 | Type     | Required | Details                               |
| --------------------- | -------- | :------: | ------------------------------------- |
| `questionId`          | ObjectId |    ✅    | কোন প্রশ্নের উত্তর                    |
| `selectedOptionIndex` | number   |    ✅    | কোন option select করলেন (0 থেকে শুরু) |

---

### GET `/mcq/exams/:examId/submission`

**Ongoing Exam এর current status দেখুন**

**Auth:** `protectStudent`

**Response:**

```json
{
  "data": {
    "submissionId": "...",
    "answeredCount": 35,
    "totalQuestions": 50,
    "timeRemaining": 1500,
    "status": "in_progress"
  }
}
```

---

### POST `/mcq/exams/:examId/submit`

**Exam Submit করুন**

**Auth:** `protectStudent`

> ⏰ Timer শেষ হলে automatically submit হয়ে যাবে।

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Exam submitted successfully!",
    "totalMarks": 50,
    "obtainedMarks": 38,
    "percentage": 76.0,
    "isPassed": true,
    "submittedAt": "2024-03-01T09:55:00Z"
  }
}
```

---

### GET `/mcq/exams/:examId/result`

**Exam এর বিস্তারিত Result দেখুন**

**Auth:** `protectStudent`

> Admin results publish করলে তবেই দেখা যাবে।

**Response:**

```json
{
  "data": {
    "examTitle": "SSC Physics Mock Test — Chapter 1",
    "totalMarks": 50,
    "obtainedMarks": 38,
    "percentage": 76.0,
    "isPassed": true,
    "passingMarks": 40,
    "answers": [
      {
        "questionId": "...",
        "questionText": "নিউটনের গতির দ্বিতীয় সূত্র কী?",
        "selectedOptionIndex": 0,
        "correctOptionIndex": 0,
        "isCorrect": true,
        "marksObtained": 1
      }
    ],
    "startedAt": "2024-03-01T09:05:00Z",
    "submittedAt": "2024-03-01T09:55:00Z"
  }
}
```

---

### GET `/mcq/exams/:examId/leaderboard`

**Exam এর Leaderboard দেখুন**

**Auth:** কোনো token লাগবে না (Public)

**Response:**

```json
{
  "data": [
    {
      "rank": 1,
      "studentName": "Md. Raihan Ahmed",
      "roll": "TAS-2024-00001",
      "obtainedMarks": 48,
      "percentage": 96.0,
      "submittedAt": "2024-03-01T09:30:00Z"
    },
    {
      "rank": 2,
      "studentName": "Fatima Akter",
      "roll": "TAS-2024-00002",
      "obtainedMarks": 45,
      "percentage": 90.0,
      "submittedAt": "2024-03-01T09:45:00Z"
    }
  ]
}
```

---

---

## 🔗 Webhook APIs

**Base Path:** `/api/v1/webhooks`

এই endpoints গুলো frontend থেকে call করা হয় না — external services থেকে call আসে।

---

### POST `/webhooks/bunny`

**Bunny.net থেকে Video encoding status update পান**

**Auth:** None (Bunny.net signature দিয়ে validate)

**Handled Events:**
| Event | কী হয় |
|-------|--------|
| Encoding completed | Video `status: "ready"` হয় |
| Encoding failed | Video `status: "failed"` হয় |
| Video deleted | Record মুছে যায় |

---

### POST `/webhooks/sync-all-videos`

**Processing state এ আটকে থাকা সব Video sync করুন**

**Auth:** None

Bunny.net webhook miss হলে manual recovery হিসেবে ব্যবহার করুন।

---

---

## 📊 Data Models Reference

### Admin Model

| Field       | Type     | Details                                 |
| ----------- | -------- | --------------------------------------- |
| `_id`       | ObjectId | Unique ID                               |
| `name`      | string   | পুরো নাম                                |
| `email`     | string   | Unique email                            |
| `password`  | string   | bcrypt hashed                           |
| `role`      | string   | `super_admin` \| `admin` \| `moderator` |
| `phone`     | string   | Phone number                            |
| `avatar`    | string   | Profile image URL                       |
| `isActive`  | boolean  | Account active কিনা                     |
| `lastLogin` | date     | সর্বশেষ login                           |
| `createdBy` | ObjectId | কোন admin তৈরি করেছে                    |
| `createdAt` | date     | তৈরির সময়                              |
| `updatedAt` | date     | শেষ update                              |

---

### Student Model

| Field                 | Type     | Details                       |
| --------------------- | -------- | ----------------------------- |
| `_id`                 | ObjectId | Unique ID                     |
| `roll`                | string   | Auto: `TAS-YYYY-XXXXX`        |
| `fullName`            | string   | পুরো নাম                      |
| `email`               | string   | Unique email                  |
| `password`            | string   | bcrypt hashed                 |
| `mobile`              | string   | BD mobile                     |
| `whatsapp`            | string   | WhatsApp number               |
| `dateOfBirth`         | date     | জন্ম তারিখ                    |
| `gender`              | string   | `male` \| `female` \| `other` |
| `bloodGroup`          | string   | Blood group                   |
| `photo`               | string   | Photo URL                     |
| `nidOrBirthCert`      | string   | ID document number            |
| `educationalInfo.ssc` | object   | SSC তথ্য                      |
| `educationalInfo.hsc` | object   | HSC তথ্য                      |
| `guardian`            | object   | অভিভাবকের তথ্য                |
| `address`             | object   | ঠিকানা                        |
| `isVerified`          | boolean  | Admin verify করেছে কিনা       |
| `isActive`            | boolean  | Account active কিনা           |

---

### Course Model

| Field              | Type     | Details                                    |
| ------------------ | -------- | ------------------------------------------ |
| `_id`              | ObjectId | Unique ID                                  |
| `title`            | string   | Course নাম                                 |
| `slug`             | string   | URL-friendly (auto)                        |
| `description`      | string   | বিস্তারিত                                  |
| `price`            | number   | মূল্য (BDT)                                |
| `discountPrice`    | number   | ছাড়ের মূল্য                               |
| `thumbnail`        | string   | Cover image URL                            |
| `instructor`       | ObjectId | Instructor                                 |
| `category`         | string   | Category                                   |
| `level`            | string   | `beginner` \| `intermediate` \| `advanced` |
| `language`         | string   | মাধ্যম                                     |
| `duration`         | number   | মিনিটে মোট সময়                            |
| `totalLessons`     | number   | Lesson সংখ্যা                              |
| `isPublished`      | boolean  | Published কিনা                             |
| `enrolledStudents` | number   | Enrolled সংখ্যা                            |
| `rating`           | number   | গড় rating (0–5)                           |
| `isDeleted`        | boolean  | Soft delete                                |
| `deletedAt`        | date     | Deletion সময়                              |
| `deletedBy`        | ObjectId | কে মুছেছে                                  |

---

### Video Model

| Field          | Type     | Details                             |
| -------------- | -------- | ----------------------------------- |
| `_id`          | ObjectId | Unique ID                           |
| `title`        | string   | Video নাম                           |
| `description`  | string   | বিবরণ                               |
| `courseId`     | ObjectId | Parent course                       |
| `sectionTitle` | string   | Section নাম                         |
| `order`        | number   | Section এ ক্রম                      |
| `duration`     | number   | সেকেন্ডে সময়                       |
| `bunnyVideoId` | string   | Bunny.net ID                        |
| `bunnyGuid`    | string   | Bunny.net GUID                      |
| `thumbnailUrl` | string   | Auto thumbnail                      |
| `status`       | string   | `processing` \| `ready` \| `failed` |
| `isFree`       | boolean  | Enrollment ছাড়া দেখা যাবে          |

---

### Enrollment Model

| Field             | Type       | Details                               |
| ----------------- | ---------- | ------------------------------------- |
| `_id`             | ObjectId   | Unique ID                             |
| `studentId`       | ObjectId   | Student                               |
| `courseId`        | ObjectId   | Course                                |
| `status`          | string     | `pending` \| `approved` \| `rejected` |
| `paymentStatus`   | string     | `pending` \| `completed` \| `failed`  |
| `paymentAmount`   | number     | পরিশোধিত amount (BDT)                 |
| `transactionId`   | string     | Payment reference                     |
| `progress`        | number     | Completion % (0–100)                  |
| `completedVideos` | ObjectId[] | দেখা শেষ video গুলো                   |
| `lastAccessedAt`  | date       | সর্বশেষ access                        |
| `isActive`        | boolean    | Active কিনা                           |
| `approvedBy`      | ObjectId   | কোন admin approve করেছে               |
| `approvedAt`      | date       | Approval সময়                         |
| `rejectedBy`      | ObjectId   | কোন admin reject করেছে                |
| `rejectedAt`      | date       | Rejection সময়                        |
| `rejectionReason` | string     | Rejection কারণ                        |

---

### MCQ Exam Model

| Field               | Type     | Details                     |
| ------------------- | -------- | --------------------------- |
| `_id`               | ObjectId | Unique ID                   |
| `title`             | string   | Exam নাম                    |
| `description`       | string   | বিবরণ                       |
| `duration`          | number   | মিনিটে সময়                 |
| `totalQuestions`    | number   | মোট প্রশ্ন (auto)           |
| `totalMarks`        | number   | মোট marks (auto)            |
| `passingMarks`      | number   | Pass এর ন্যূনতম marks       |
| `isPublished`       | boolean  | Students দেখতে পাবে         |
| `isResultPublished` | boolean  | Result visible কিনা         |
| `accessCode`        | string   | Optional access restriction |
| `startTime`         | date     | শুরুর সময়                  |
| `endTime`           | date     | শেষের সময়                  |
| `createdBy`         | ObjectId | কোন admin তৈরি করেছে        |
| `isDeleted`         | boolean  | Soft delete                 |

---

### MCQ Submission Model

| Field                           | Type     | Details                                     |
| ------------------------------- | -------- | ------------------------------------------- |
| `_id`                           | ObjectId | Unique ID                                   |
| `examId`                        | ObjectId | Exam                                        |
| `studentId`                     | ObjectId | Student                                     |
| `answers`                       | array    | উত্তরগুলো                                   |
| `answers[].questionId`          | ObjectId | প্রশ্ন                                      |
| `answers[].selectedOptionIndex` | number   | Selected option (0-based)                   |
| `answers[].isCorrect`           | boolean  | সঠিক কিনা                                   |
| `answers[].marksObtained`       | number   | প্রাপ্ত marks                               |
| `totalMarks`                    | number   | সর্বোচ্চ marks                              |
| `obtainedMarks`                 | number   | প্রাপ্ত marks                               |
| `percentage`                    | number   | শতকরা                                       |
| `isPassed`                      | boolean  | Pass/Fail                                   |
| `startedAt`                     | date     | শুরুর সময়                                  |
| `submittedAt`                   | date     | Submit সময়                                 |
| `status`                        | string   | `in_progress` \| `submitted` \| `evaluated` |
| `isAutoSubmitted`               | boolean  | Timer শেষে auto submit                      |

---

## ⚡ Quick Reference Table

### 🔐 Auth APIs (উভয় Panel)

| Method | Endpoint                | Auth     | বিবরণ             |
| ------ | ----------------------- | -------- | ----------------- |
| POST   | `/auth/admin/login`     | None     | Admin login       |
| POST   | `/auth/student/login`   | None     | Student login     |
| POST   | `/auth/refresh-token`   | None     | Token refresh     |
| POST   | `/auth/change-password` | Any Auth | Password পরিবর্তন |

---

### 👨‍💼 Admin Panel APIs

| Method | Endpoint                            | Auth        | বিবরণ                    |
| ------ | ----------------------------------- | ----------- | ------------------------ |
| GET    | `/auth/admin/me`                    | Admin       | Admin profile            |
| POST   | `/auth/admin/register`              | Super Admin | Admin তৈরি               |
| GET    | `/admins`                           | Admin       | সব admin                 |
| GET    | `/admins/:id`                       | Admin       | Admin details            |
| PUT    | `/admins/:id`                       | Super Admin | Admin update             |
| DELETE | `/admins/:id`                       | Super Admin | Admin মুছুন              |
| PATCH  | `/admins/:id/toggle-status`         | Super Admin | Status toggle            |
| GET    | `/students`                         | None        | সব student               |
| GET    | `/students/stats`                   | None        | Student stats            |
| GET    | `/students/:id`                     | None        | Student details          |
| PATCH  | `/students/:id/verify`              | None        | Student verify           |
| PATCH  | `/students/:id/toggle-status`       | None        | Status toggle            |
| DELETE | `/students/:id`                     | None        | Student মুছুন            |
| GET    | `/courses`                          | None        | সব course                |
| POST   | `/courses`                          | Admin       | Course তৈরি              |
| PUT    | `/courses/:id`                      | Auth        | Course update            |
| DELETE | `/courses/:id`                      | Super Admin | Course মুছুন             |
| PATCH  | `/courses/:id/publish`              | Admin       | Publish toggle           |
| POST   | `/videos`                           | Admin       | Video record তৈরি        |
| POST   | `/videos/upload`                    | Admin       | Video upload             |
| GET    | `/videos/course/:courseId`          | Auth        | Course videos            |
| GET    | `/videos/:id/status`                | Admin       | Encoding status          |
| PATCH  | `/videos/:id`                       | Admin       | Video update             |
| DELETE | `/videos/:id`                       | Admin       | Video মুছুন              |
| GET    | `/enrollments/admin/all`            | Admin       | সব enrollment            |
| PATCH  | `/enrollments/:id/approve`          | Admin       | Approve                  |
| PATCH  | `/enrollments/:id/reject`           | Admin       | Reject                   |
| DELETE | `/enrollments/:id`                  | Admin       | Cancel                   |
| GET    | `/mcq/exams`                        | Admin       | সব exam                  |
| POST   | `/mcq/exams`                        | Admin       | Exam তৈরি                |
| GET    | `/mcq/exams/:id`                    | Admin       | Exam details             |
| PUT    | `/mcq/exams/:id`                    | Admin       | Exam update              |
| DELETE | `/mcq/exams/:id`                    | Super Admin | Exam মুছুন               |
| PATCH  | `/mcq/exams/:id/publish`            | Admin       | Publish toggle           |
| PATCH  | `/mcq/exams/:id/publish-results`    | Admin       | Results publish          |
| PATCH  | `/mcq/exams/:id/unpublish-results`  | Admin       | Results unpublish        |
| GET    | `/mcq/exams/:examId/questions`      | Admin       | Questions (with answers) |
| POST   | `/mcq/questions`                    | Admin       | Question তৈরি            |
| POST   | `/mcq/exams/:examId/questions/bulk` | Admin       | Bulk questions           |
| PUT    | `/mcq/questions/:id`                | Admin       | Question update          |
| DELETE | `/mcq/questions/:id`                | Super Admin | Question মুছুন           |
| GET    | `/mcq/exams/:examId/submissions`    | Admin       | সব submission            |

---

### 🎓 Student Panel APIs

| Method | Endpoint                           | Auth    | বিবরণ             |
| ------ | ---------------------------------- | ------- | ----------------- |
| POST   | `/students/register`               | None    | Registration      |
| GET    | `/auth/student/me`                 | Student | Profile দেখুন     |
| PUT    | `/students/:id`                    | None    | Profile update    |
| GET    | `/courses`                         | None    | সব course         |
| GET    | `/courses/:id`                     | None    | Course details    |
| GET    | `/courses/slug/:slug`              | None    | Course by slug    |
| GET    | `/videos/course/:courseId`         | Auth    | Course videos     |
| GET    | `/videos/:id/stream`               | Student | Stream URL        |
| POST   | `/videos/:id/complete`             | Student | Video complete    |
| POST   | `/enrollments`                     | Student | Enroll করুন       |
| GET    | `/enrollments/my-courses`          | Student | আমার courses      |
| GET    | `/enrollments/check/:courseId`     | Student | Enrollment check  |
| GET    | `/enrollments/progress/:courseId`  | Student | Progress দেখুন    |
| GET    | `/mcq/exams/published`             | Student | Published exams   |
| GET    | `/mcq/exams/published/:id`         | Student | Exam details      |
| GET    | `/mcq/my-exams`                    | Student | Exam history      |
| POST   | `/mcq/exams/:id/verify-code`       | Student | Code verify       |
| POST   | `/mcq/exams/:id/start`             | Student | Exam শুরু         |
| GET    | `/mcq/exams/:id/questions/student` | Student | Questions         |
| POST   | `/mcq/exams/:id/answer`            | Student | Answer save       |
| GET    | `/mcq/exams/:id/submission`        | Student | Submission status |
| POST   | `/mcq/exams/:id/submit`            | Student | Exam submit       |
| GET    | `/mcq/exams/:id/result`            | Student | Result দেখুন      |
| GET    | `/mcq/exams/:id/leaderboard`       | None    | Leaderboard       |

---

### 🔗 Webhook APIs

| Method | Endpoint                    | Auth | বিবরণ             |
| ------ | --------------------------- | ---- | ----------------- |
| POST   | `/webhooks/bunny`           | None | Bunny.net webhook |
| POST   | `/webhooks/sync-all-videos` | None | Video sync        |

---

_Built with ❤️ for Tarif Academy — Empowering students across Bangladesh._
