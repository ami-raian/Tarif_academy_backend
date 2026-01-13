# Video Streaming API Reference

## 🔐 Authentication

সব protected routes এ JWT token দরকার:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📹 Video Management APIs

### 1. Create Video (Admin Only)

Video entry তৈরি করুন Bunny.net এ upload করার জন্য।

**Endpoint:** `POST /api/v1/videos`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Introduction to JavaScript",
  "description": "Learn JavaScript basics",
  "courseId": "677ef123456789abcdef0123",
  "sectionTitle": "Getting Started",
  "order": 1,
  "isFree": false
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Video created successfully. You can now upload the video file.",
  "data": {
    "video": {
      "_id": "677ef987654321fedcba9876",
      "title": "Introduction to JavaScript",
      "courseId": "677ef123456789abcdef0123",
      "bunnyVideoId": "123456",
      "bunnyGuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "status": "processing"
    },
    "uploadUrl": "https://video.bunnycdn.com/library/123456/videos/a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "bunnyGuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}
```

**Upload করার পদ্ধতি:**
```bash
# PowerShell দিয়ে
curl -X PUT "https://video.bunnycdn.com/library/YOUR_LIBRARY_ID/videos/BUNNY_GUID" \
  -H "AccessKey: YOUR_API_KEY" \
  -H "Content-Type: application/octet-stream" \
  --data-binary "@path/to/video.mp4"
```

---

### 2. Get Course Videos

একটি course এর সব videos দেখুন (sections অনুযায়ী grouped)।

**Endpoint:** `GET /api/v1/videos/course/:courseId`

**Headers:**
```
Authorization: Bearer <student_or_admin_token>
```

**Response (200 OK) - For Enrolled Student:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "sections": {
      "Getting Started": [
        {
          "_id": "677ef987654321fedcba9876",
          "title": "Introduction to JavaScript",
          "description": "Learn JavaScript basics",
          "order": 1,
          "duration": 1234,
          "isFree": false,
          "status": "ready",
          "locked": false,
          "completed": false
        }
      ],
      "Advanced Topics": [
        {
          "_id": "677ef987654321fedcba9877",
          "title": "Async/Await in JavaScript",
          "order": 1,
          "duration": 2100,
          "isFree": false,
          "locked": false,
          "completed": true
        }
      ]
    },
    "isEnrolled": true
  }
}
```

**Response (200 OK) - For Non-Enrolled Student:**
```json
{
  "success": true,
  "data": {
    "sections": {
      "Getting Started": [
        {
          "_id": "677ef987654321fedcba9876",
          "title": "Introduction to JavaScript",
          "order": 1,
          "duration": 1234,
          "isFree": true,
          "locked": false
        },
        {
          "_id": "677ef987654321fedcba9877",
          "title": "Variables and Data Types",
          "order": 2,
          "duration": 1500,
          "isFree": false,
          "locked": true
        }
      ]
    },
    "isEnrolled": false
  }
}
```

---

### 3. Get Video Stream URL (Student Only)

Video streaming URL নিন (requires enrollment অথবা free video)।

**Endpoint:** `GET /api/v1/videos/:videoId/stream`

**Headers:**
```
Authorization: Bearer <student_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "streamUrl": "https://vz-12345678.b-cdn.net/a1b2c3d4-e5f6-7890-abcd-ef1234567890/playlist.m3u8?token=abc123&expires=1234567890",
    "embedUrl": "https://iframe.mediadelivery.net/embed/123456/a1b2c3d4-e5f6-7890-abcd-ef1234567890?token=abc123&expires=1234567890",
    "video": {
      "_id": "677ef987654321fedcba9876",
      "title": "Introduction to JavaScript",
      "description": "Learn JavaScript basics",
      "duration": 1234
    }
  }
}
```

**Error (403 Forbidden):**
```json
{
  "success": false,
  "statusCode": 403,
  "message": "You are not enrolled in this course"
}
```

---

### 4. Mark Video as Completed (Student Only)

Video সম্পূর্ণ দেখা শেষ হলে mark করুন।

**Endpoint:** `POST /api/v1/videos/:videoId/complete`

**Headers:**
```
Authorization: Bearer <student_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Video marked as completed",
  "data": {
    "progress": 35
  }
}
```

---

### 5. Update Video (Admin Only)

Video এর details update করুন।

**Endpoint:** `PATCH /api/v1/videos/:videoId`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "order": 2,
  "isFree": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Video updated successfully",
  "data": {
    "_id": "677ef987654321fedcba9876",
    "title": "Updated Title",
    "description": "Updated description",
    "order": 2,
    "isFree": true
  }
}
```

---

### 6. Delete Video (Admin Only)

Video delete করুন (Bunny.net থেকেও delete হবে)।

**Endpoint:** `DELETE /api/v1/videos/:videoId`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "message": "Video deleted successfully"
  }
}
```

---

### 7. Check Encoding Status (Admin Only)

Video এর encoding status check করুন।

**Endpoint:** `GET /api/v1/videos/:videoId/status`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "video": {
      "_id": "677ef987654321fedcba9876",
      "status": "ready",
      "duration": 1234
    },
    "encodingStatus": {
      "status": 3,
      "title": "Introduction to JavaScript",
      "length": 1234,
      "availableResolutions": "240p,360p,480p,720p,1080p"
    }
  }
}
```

**Encoding Status Codes:**
- `0` = Queued
- `1` = Processing
- `2` = Encoding
- `3` = Finished
- `4` = Resolution Finished
- `5` = Failed

---

## 🎓 Enrollment APIs

### 1. Enroll in Course (Student Only)

Course এ enroll করুন।

**Endpoint:** `POST /api/v1/enrollments`

**Headers:**
```
Authorization: Bearer <student_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "courseId": "677ef123456789abcdef0123",
  "paymentAmount": 1500,
  "transactionId": "txn_12345"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Successfully enrolled in course",
  "data": {
    "_id": "677ef111222333444555666",
    "studentId": "677ef987654321fedcba9876",
    "courseId": "677ef123456789abcdef0123",
    "paymentAmount": 1500,
    "paymentStatus": "completed",
    "progress": 0,
    "isActive": true
  }
}
```

---

### 2. Get My Enrolled Courses (Student Only)

নিজের সব enrolled courses দেখুন।

**Endpoint:** `GET /api/v1/enrollments/my-courses`

**Headers:**
```
Authorization: Bearer <student_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "_id": "677ef111222333444555666",
      "courseId": {
        "_id": "677ef123456789abcdef0123",
        "title": "Complete JavaScript Course",
        "description": "Learn JavaScript from scratch",
        "thumbnail": "js-course.jpg",
        "price": 1500
      },
      "progress": 35,
      "enrolledAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 3. Check Enrollment (Student Only)

একটি নির্দিষ্ট course এ enrolled কিনা check করুন।

**Endpoint:** `GET /api/v1/enrollments/check/:courseId`

**Headers:**
```
Authorization: Bearer <student_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "isEnrolled": true,
    "enrollment": {
      "_id": "677ef111222333444555666",
      "progress": 35,
      "enrolledAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

### 4. Get Course Progress (Student Only)

একটি course এর progress দেখুন।

**Endpoint:** `GET /api/v1/enrollments/progress/:courseId`

**Headers:**
```
Authorization: Bearer <student_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "progress": 35,
    "completedVideos": [
      "677ef987654321fedcba9876",
      "677ef987654321fedcba9877"
    ],
    "lastAccessedAt": "2024-01-15T14:30:00.000Z"
  }
}
```

---

### 5. Cancel Enrollment (Admin Only)

Enrollment cancel করুন।

**Endpoint:** `DELETE /api/v1/enrollments/:enrollmentId`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Enrollment cancelled successfully",
  "data": {
    "_id": "677ef111222333444555666",
    "isActive": false
  }
}
```

---

## 🎬 Complete Workflow Example

### Admin Workflow (Upload Video)

1. **Create video entry:**
```bash
POST /api/v1/videos
Body: { title, courseId, sectionTitle, order }
Response: { bunnyGuid, uploadUrl }
```

2. **Upload video file to Bunny.net:**
```bash
PUT https://video.bunnycdn.com/library/{libraryId}/videos/{bunnyGuid}
Header: AccessKey: {apiKey}
Body: video file (binary)
```

3. **Check encoding status:**
```bash
GET /api/v1/videos/:videoId/status
Response: { status: "ready" }
```

---

### Student Workflow (Watch Video)

1. **Enroll in course:**
```bash
POST /api/v1/enrollments
Body: { courseId, paymentAmount, transactionId }
```

2. **Get course videos:**
```bash
GET /api/v1/videos/course/:courseId
Response: { sections: {...}, isEnrolled: true }
```

3. **Get video stream URL:**
```bash
GET /api/v1/videos/:videoId/stream
Response: { streamUrl, embedUrl }
```

4. **Play video in frontend:**
```html
<iframe src="{embedUrl}" width="640" height="360"></iframe>
```

5. **Mark as completed:**
```bash
POST /api/v1/videos/:videoId/complete
Response: { progress: 35 }
```

---

## 🔒 Security Notes

1. **Token Expiration:** Video URLs expire after 2 hours
2. **Enrollment Check:** Automatically checks before providing stream URL
3. **Free Videos:** Can be accessed without enrollment if `isFree: true`
4. **Admin Protection:** Video upload/delete/update requires admin token

---

## ❌ Common Error Responses

**401 Unauthorized:**
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "statusCode": 403,
  "message": "You are not enrolled in this course"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Video not found"
}
```

**500 Server Error:**
```json
{
  "success": false,
  "statusCode": 500,
  "message": "Failed to create video in Bunny Stream"
}
```
