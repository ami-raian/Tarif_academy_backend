# 🎥 Video Streaming System - Complete Setup

আপনার **TarifAcademy Backend** এ এখন সম্পূর্ণ video streaming system যুক্ত করা হয়েছে!

## ✅ কী কী যুক্ত হয়েছে?

### 1. **Video Management System**
- ✅ Video upload করুন Bunny.net এ
- ✅ Video details update/delete করুন
- ✅ Encoding status track করুন
- ✅ Section-wise video organization
- ✅ Free preview videos support

### 2. **Enrollment System**
- ✅ Course purchase & enrollment
- ✅ Student enrollment tracking
- ✅ Course progress tracking (0-100%)
- ✅ Completed videos tracking
- ✅ Payment integration ready

### 3. **Secure Video Streaming**
- ✅ Token-based authentication (2 hour expiry)
- ✅ Enrollment verification before streaming
- ✅ Signed URLs for security
- ✅ CDN-powered fast streaming
- ✅ Auto video encoding (multiple resolutions)

### 4. **API Endpoints**
- ✅ Admin APIs for video management
- ✅ Student APIs for video streaming
- ✅ Enrollment APIs
- ✅ Progress tracking APIs

---

## 📁 নতুন Files যা যুক্ত হয়েছে

```
src/
├── modules/
│   ├── video/
│   │   ├── video.interface.ts       # Video types & interfaces
│   │   ├── video.model.ts           # Video database schema
│   │   ├── video.service.ts         # Video business logic
│   │   ├── video.controller.ts      # Video API controllers
│   │   ├── video.routes.ts          # Video routes
│   │   └── index.ts                 # Exports
│   │
│   └── enrollment/
│       ├── enrollment.interface.ts  # Enrollment types
│       ├── enrollment.model.ts      # Enrollment schema
│       ├── enrollment.service.ts    # Enrollment logic
│       ├── enrollment.controller.ts # Enrollment controllers
│       ├── enrollment.routes.ts     # Enrollment routes
│       └── index.ts                 # Exports
│
└── services/
    └── bunny.service.ts             # Bunny.net API integration

Documentation Files:
├── BUNNY_STREAM_SETUP.md            # Bunny.net setup guide (বাংলা)
├── API_REFERENCE.md                 # Complete API documentation
└── VIDEO_STREAMING_README.md        # This file
```

---

## 🚀 Quick Start

### Step 1: Bunny.net Account Setup

1. https://bunny.net এ গিয়ে account তৈরি করুন
2. Stream Library তৈরি করুন (Asia region)
3. API credentials collect করুন:
   - Library ID
   - Stream API Key
   - CDN Hostname

**বিস্তারিত:** [BUNNY_STREAM_SETUP.md](BUNNY_STREAM_SETUP.md) দেখুন

---

### Step 2: Environment Variables

আপনার `.env` file এ এই credentials যুক্ত করুন:

```env
# Bunny.net Stream Configuration
BUNNY_STREAM_API_KEY=your_api_key_here
BUNNY_LIBRARY_ID=your_library_id_here
BUNNY_CDN_HOSTNAME=your_cdn_hostname.b-cdn.net
```

---

### Step 3: Install Dependencies

Dependencies ইতিমধ্যে install করা আছে:
```bash
npm install
```

Installed packages:
- `axios` - Bunny.net API calls এর জন্য
- `form-data` - File upload এর জন্য

---

### Step 4: Run Server

```bash
npm run dev
```

Server চলবে: `http://localhost:5000`

---

## 🎯 How It Works

### Architecture Overview

```
┌─────────────┐
│   Admin     │
│  Dashboard  │
└──────┬──────┘
       │ 1. Create video entry
       ▼
┌─────────────────┐
│  Your Backend   │
│  (Node.js API)  │
└────────┬────────┘
         │ 2. Create video in Bunny.net
         │ 3. Return upload URL
         ▼
┌──────────────────┐
│   Bunny.net      │
│   Stream API     │
└────────┬─────────┘
         │ 4. Upload video file
         │ 5. Encode video (auto)
         ▼
┌──────────────────┐
│   Student        │
│   Watches Video  │
└────────┬─────────┘
         │ 6. Request stream URL (with token)
         ▼
┌─────────────────┐
│  Your Backend   │
│  Check Enrollment│
└────────┬────────┘
         │ 7. Generate signed URL (2h expiry)
         ▼
┌──────────────────┐
│   Bunny CDN      │
│   Video Delivery │
└──────────────────┘
```

---

## 📊 Database Models

### Video Model
```typescript
{
  title: string
  description: string
  courseId: ObjectId
  sectionTitle: string
  order: number
  duration: number
  bunnyVideoId: string
  bunnyGuid: string
  status: "processing" | "ready" | "failed"
  isFree: boolean
}
```

### Enrollment Model
```typescript
{
  studentId: ObjectId
  courseId: ObjectId
  enrolledAt: Date
  paymentStatus: "pending" | "completed" | "failed"
  paymentAmount: number
  progress: number (0-100)
  completedVideos: ObjectId[]
  isActive: boolean
}
```

---

## 🔌 API Endpoints Summary

### Admin APIs (Requires Admin Token)
- `POST /api/v1/videos` - Create video
- `PATCH /api/v1/videos/:videoId` - Update video
- `DELETE /api/v1/videos/:videoId` - Delete video
- `GET /api/v1/videos/:videoId/status` - Check encoding
- `DELETE /api/v1/enrollments/:enrollmentId` - Cancel enrollment

### Student APIs (Requires Student Token)
- `GET /api/v1/videos/course/:courseId` - Get course videos
- `GET /api/v1/videos/:videoId/stream` - Get stream URL
- `POST /api/v1/videos/:videoId/complete` - Mark completed
- `POST /api/v1/enrollments` - Enroll in course
- `GET /api/v1/enrollments/my-courses` - My enrollments
- `GET /api/v1/enrollments/check/:courseId` - Check enrollment
- `GET /api/v1/enrollments/progress/:courseId` - Get progress

**বিস্তারিত:** [API_REFERENCE.md](API_REFERENCE.md) দেখুন

---

## 💡 Usage Examples

### Example 1: Admin Upload Video

```javascript
// 1. Create video entry
const response = await fetch('http://localhost:5000/api/v1/videos', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ADMIN_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: "Introduction to React",
    description: "Learn React basics",
    courseId: "COURSE_ID",
    sectionTitle: "Getting Started",
    order: 1,
    isFree: false
  })
});

const { data } = await response.json();
console.log('Upload URL:', data.uploadUrl);
console.log('Bunny GUID:', data.bunnyGuid);

// 2. Upload video file to Bunny.net
const formData = new FormData();
formData.append('file', videoFile);

await fetch(data.uploadUrl, {
  method: 'PUT',
  headers: {
    'AccessKey': 'YOUR_BUNNY_API_KEY',
    'Content-Type': 'application/octet-stream'
  },
  body: videoFile
});
```

---

### Example 2: Student Watch Video

```javascript
// 1. Check if enrolled
const checkEnrollment = await fetch(
  `http://localhost:5000/api/v1/enrollments/check/${courseId}`,
  {
    headers: { 'Authorization': 'Bearer STUDENT_TOKEN' }
  }
);

// 2. Get stream URL
const streamResponse = await fetch(
  `http://localhost:5000/api/v1/videos/${videoId}/stream`,
  {
    headers: { 'Authorization': 'Bearer STUDENT_TOKEN' }
  }
);

const { data } = await streamResponse.json();

// 3. Play video
const videoPlayer = document.getElementById('player');
videoPlayer.src = data.streamUrl;

// Or use iframe
const iframe = `<iframe src="${data.embedUrl}" width="640" height="360"></iframe>`;
```

---

### Example 3: Frontend Video Player (React)

```jsx
import { useState, useEffect } from 'react';

function VideoPlayer({ videoId, token }) {
  const [streamUrl, setStreamUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStreamUrl() {
      try {
        const response = await fetch(
          `http://localhost:5000/api/v1/videos/${videoId}/stream`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        const { data } = await response.json();
        setStreamUrl(data.embedUrl);
      } catch (error) {
        console.error('Failed to load video:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStreamUrl();
  }, [videoId, token]);

  if (loading) return <div>Loading video...</div>;

  return (
    <iframe
      src={streamUrl}
      width="100%"
      height="500"
      frameBorder="0"
      allowFullScreen
    />
  );
}
```

---

## 🔒 Security Features

### 1. Token-Based Authentication
- প্রতিটি video URL এ unique token থাকে
- Token 2 hours পর expire হয়
- কেউ link share করলেও limited time এর জন্য valid

### 2. Enrollment Verification
- Video streaming এর আগে enrollment check করা হয়
- Not enrolled = Access Denied (403)

### 3. Signed URLs
- SHA256 hashing দিয়ে URL sign করা হয়
- Tamper-proof URLs

### 4. Role-Based Access
- Admin: Video upload, delete, update
- Student: শুধু enrolled courses দেখতে পারে

---

## 💰 Cost Estimation

### Bunny.net Pricing

**Starter Plan:**
- Storage: 1TB = $5/month
- Bandwidth: Unlimited (Free!)
- Encoding: Free

**Example:**
- 50 courses × 10 videos × 500MB = 250GB storage
- Monthly Cost: **$5** (1TB plan এর মধ্যে)
- Students: যত ইচ্ছা (bandwidth unlimited)

**বিকল্প:**
- AWS S3 + CloudFront: ~$10-50/month (bandwidth charges apply)
- Vimeo Pro: $20/month (limited storage)

---

## 🐛 Troubleshooting

### Problem: "Bunny.net credentials not configured"
**Solution:** `.env` file এ `BUNNY_STREAM_API_KEY`, `BUNNY_LIBRARY_ID`, এবং `BUNNY_CDN_HOSTNAME` যুক্ত করুন।

### Problem: Video upload failed
**Solution:**
- API Key সঠিক আছে কিনা verify করুন
- Video file size 5GB এর কম কিনা check করুন
- Internet connection stable আছে কিনা দেখুন

### Problem: Student video দেখতে পারছে না
**Solution:**
- Student enrolled আছে কিনা check করুন
- Video status "ready" আছে কিনা verify করুন
- Token expire হয়েছে কিনা দেখুন (2 hours validity)

---

## 📚 Additional Resources

- **Bunny.net Documentation:** https://docs.bunny.net/docs/stream
- **API Reference:** [API_REFERENCE.md](API_REFERENCE.md)
- **Setup Guide:** [BUNNY_STREAM_SETUP.md](BUNNY_STREAM_SETUP.md)

---

## ✅ Next Steps

1. ✅ Bunny.net account তৈরি করুন
2. ✅ `.env` এ credentials add করুন
3. ✅ Test video upload করুন
4. ✅ Frontend তে video player integrate করুন
5. ⬜ Payment gateway integrate করুন (পরবর্তী step)
6. ⬜ Course completion certificates add করুন

---

## 🎉 Congratulations!

আপনার course selling platform এখন সম্পূর্ণ video streaming সহ ready! 🚀

এখন আপনি:
- ✅ Admin panel থেকে video upload করতে পারবেন
- ✅ Students enroll করে secure ভাবে video দেখতে পারবে
- ✅ Progress track করতে পারবেন
- ✅ Free preview videos দিতে পারবেন

**Happy Coding! 🎊**
