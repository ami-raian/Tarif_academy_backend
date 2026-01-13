# Bunny.net Stream Setup Guide

এই guide অনুসরণ করে আপনি আপনার course selling website এর জন্য Bunny.net Stream setup করতে পারবেন।

## 📋 কেন Bunny.net Stream?

- ✅ **সবচেয়ে সস্তা** - $5/1TB storage থেকে শুরু
- ✅ **DRM Protection** - video চুরি হবে না
- ✅ **Token-based Security** - শুধু enrolled students দেখতে পারবে
- ✅ **CDN included** - 114+ locations, fast loading
- ✅ **No bandwidth limits** - যত ইচ্ছা streaming করতে পারবেন
- ✅ **Auto video encoding** - সব device এ play হবে

---

## 🚀 Step 1: Bunny.net Account তৈরি করুন

1. যান: https://bunny.net
2. **Sign Up** করুন (Email দিয়ে)
3. Email verify করুন

---

## 🎬 Step 2: Stream Library তৈরি করুন

1. Dashboard এ যান: https://dash.bunny.net
2. Left sidebar থেকে **"Stream"** এ ক্লিক করুন
3. **"Create Stream Library"** বাটনে ক্লিক করুন
4. নিচের তথ্য দিন:
   - **Library Name**: `tarifacademy-videos` (বা যেকোনো নাম)
   - **Region**: **Asia** (Bangladesh এর কাছে)
   - **Enable Token Authentication**: ✅ **ON করুন** (গুরুত্বপূর্ণ!)
   - **Player Settings**: Default রাখতে পারেন

5. **Create Library** বাটনে ক্লিক করুন

---

## 🔑 Step 3: API Credentials সংগ্রহ করুন

Library তৈরির পর, আপনার Library এ ক্লিক করুন। এখন 3টি গুরুত্বপূর্ণ তথ্য collect করতে হবে:

### 3.1 Library ID
- Library page এর উপরে **"Library ID"** দেখতে পাবেন
- Example: `123456`
- এটা কপি করে রাখুন

### 3.2 API Key (Stream API Key)
- Same page এ **"API"** tab এ ক্লিক করুন
- **"API Key"** দেখতে পাবেন
- **"Show"** বাটনে ক্লিক করে API Key copy করুন
- Example: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

### 3.3 CDN Hostname
- **"Player Settings"** বা **"Video Player"** section এ যান
- **"Video CDN Hostname"** দেখতে পাবেন
- Example: `vz-12345678.b-cdn.net`
- এটা কপি করুন

---

## ⚙️ Step 4: Backend এ Configure করুন

আপনার `.env` file এ নিচের তথ্য যোগ করুন:

```env
# Bunny.net Stream Configuration
BUNNY_STREAM_API_KEY=your_api_key_here
BUNNY_LIBRARY_ID=your_library_id_here
BUNNY_CDN_HOSTNAME=your_cdn_hostname.b-cdn.net
```

**উদাহরণ:**
```env
BUNNY_STREAM_API_KEY=a1b2c3d4-e5f6-7890-abcd-ef1234567890
BUNNY_LIBRARY_ID=123456
BUNNY_CDN_HOSTNAME=vz-12345678.b-cdn.net
```

---

## 🔨 Step 5: Server চালু করুন

```bash
npm run dev
```

---

## 📺 কীভাবে Video Upload করবেন?

### Admin হিসেবে Video Upload করার Process:

1. **Video entry তৈরি করুন** (POST request):
```bash
POST /api/v1/videos
Authorization: Bearer <admin_token>

{
  "title": "Introduction to JavaScript",
  "description": "Learn JavaScript basics",
  "courseId": "course_id_here",
  "sectionTitle": "Getting Started",
  "order": 1,
  "isFree": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "video": { ... },
    "uploadUrl": "https://video.bunnycdn.com/library/123456/videos/guid-here",
    "bunnyGuid": "guid-here"
  }
}
```

2. **Video file upload করুন** (Bunny.net এ সরাসরি):

**Method 1: Command Line দিয়ে (Windows PowerShell)**
```powershell
$apiKey = "your_bunny_api_key"
$libraryId = "your_library_id"
$videoGuid = "guid_from_step_1"
$filePath = "C:\path\to\your\video.mp4"

$headers = @{
    "AccessKey" = $apiKey
    "Content-Type" = "application/octet-stream"
}

Invoke-RestMethod -Uri "https://video.bunnycdn.com/library/$libraryId/videos/$videoGuid" `
    -Method Put `
    -Headers $headers `
    -InFile $filePath
```

**Method 2: Postman দিয়ে**
- Method: **PUT**
- URL: `https://video.bunnycdn.com/library/YOUR_LIBRARY_ID/videos/VIDEO_GUID`
- Headers:
  - `AccessKey`: your_bunny_api_key
  - `Content-Type`: application/octet-stream
- Body: **Binary** > Select your video file

**Method 3: Frontend থেকে direct upload**
```javascript
// Frontend code
const uploadVideo = async (file, bunnyGuid, apiKey, libraryId) => {
  const response = await fetch(
    `https://video.bunnycdn.com/library/${libraryId}/videos/${bunnyGuid}`,
    {
      method: 'PUT',
      headers: {
        'AccessKey': apiKey,
        'Content-Type': 'application/octet-stream',
      },
      body: file
    }
  );
  return response;
};
```

3. **Encoding status check করুন:**
```bash
GET /api/v1/videos/:videoId/status
Authorization: Bearer <admin_token>
```

Upload এর পর Bunny.net automatically video encode করবে। 5-10 মিনিট সময় লাগতে পারে (video size অনুযায়ী)।

---

## 👨‍🎓 Student কীভাবে Video দেখবে?

### Student Flow:

1. **Course এ Enroll করুন:**
```bash
POST /api/v1/enrollments
Authorization: Bearer <student_token>

{
  "courseId": "course_id_here",
  "paymentAmount": 1500,
  "transactionId": "txn_12345"
}
```

2. **Course এর video list দেখুন:**
```bash
GET /api/v1/videos/course/:courseId
Authorization: Bearer <student_token>
```

Response:
- Enrolled হলে: সব videos দেখাবে
- Not enrolled: শুধু `isFree: true` videos দেখাবে

3. **Video stream URL নিন:**
```bash
GET /api/v1/videos/:videoId/stream
Authorization: Bearer <student_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "streamUrl": "https://vz-xxx.b-cdn.net/guid/playlist.m3u8?token=xxx&expires=xxx",
    "embedUrl": "https://iframe.mediadelivery.net/embed/123456/guid?token=xxx&expires=xxx",
    "video": { ... }
  }
}
```

**Frontend এ video player:**
```html
<!-- Option 1: iframe embed (সবচেয়ে সহজ) -->
<iframe
  src="embedUrl_from_api"
  width="640"
  height="360"
  frameborder="0"
  allowfullscreen>
</iframe>

<!-- Option 2: Video.js বা Plyr.js দিয়ে -->
<video id="player" controls>
  <source src="streamUrl_from_api" type="application/x-mpegURL">
</video>

<script src="https://cdn.plyr.io/3.7.8/plyr.js"></script>
<script>
  const player = new Plyr('#player');
</script>
```

4. **Video complete mark করুন:**
```bash
POST /api/v1/videos/:videoId/complete
Authorization: Bearer <student_token>
```

---

## 🔒 Security Features

✅ **Token-based Authentication**:
- প্রতিটি video URL এ একটি token থাকে
- Token 2 hours পর expire হয়ে যায়
- কেউ link share করলেও 2 hours পর কাজ করবে না

✅ **Enrollment Check**:
- Video দেখার আগে check করা হয় student enrolled কিনা
- Not enrolled = access denied

✅ **Domain Restriction** (Optional):
- Bunny.net dashboard থেকে শুধুমাত্র আপনার domain allow করতে পারবেন
- অন্য কোনো website এ embed হবে না

---

## 💰 Pricing Calculator

**Bunny.net Stream Pricing:**

| Storage | Bandwidth | Monthly Cost |
|---------|-----------|--------------|
| 1TB | Unlimited | $5 |
| 3TB | Unlimited | $15 |
| 10TB | Unlimited | $50 |

**Example:**
- 100টি course
- প্রতি course এ 10টি video (average 500MB/video)
- Total: 100 × 10 × 0.5GB = **500GB storage**
- Cost: **$5/month** (1TB এর মধ্যে)

**Bandwidth:** একদম ফ্রি! যত ইচ্ছা students দেখতে পারবে।

---

## 🛠️ API Endpoints Summary

### Admin APIs:
- `POST /api/v1/videos` - Create video entry
- `PATCH /api/v1/videos/:videoId` - Update video details
- `DELETE /api/v1/videos/:videoId` - Delete video
- `GET /api/v1/videos/:videoId/status` - Check encoding status

### Student APIs:
- `POST /api/v1/enrollments` - Enroll in course
- `GET /api/v1/enrollments/my-courses` - Get enrolled courses
- `GET /api/v1/enrollments/check/:courseId` - Check enrollment
- `GET /api/v1/enrollments/progress/:courseId` - Get course progress
- `GET /api/v1/videos/course/:courseId` - Get course videos
- `GET /api/v1/videos/:videoId/stream` - Get stream URL (requires enrollment)
- `POST /api/v1/videos/:videoId/complete` - Mark video as completed

---

## 🐛 Troubleshooting

### Problem 1: "Bunny.net credentials not configured" error
**Solution:** `.env` file এ credentials সঠিকভাবে add করেছেন কিনা check করুন।

### Problem 2: Video upload হচ্ছে না
**Solution:**
- API Key সঠিক আছে কিনা verify করুন
- Library ID match করছে কিনা check করুন
- Video file size 5GB এর কম আছে কিনা দেখুন

### Problem 3: Student video দেখতে পারছে না
**Solution:**
- Student enrolled আছে কিনা check করুন
- Token authentication enable আছে কিনা Bunny dashboard এ verify করুন
- Token expire হয়েছে কিনা দেখুন (2 hours validity)

---

## 📞 Support

যদি কোনো সমস্যা হয় বা প্রশ্ন থাকে:
- Bunny.net Support: https://support.bunny.net
- Documentation: https://docs.bunny.net/docs/stream

---

## ✅ Next Steps

1. ✅ Bunny.net account তৈরি করুন
2. ✅ Stream library setup করুন
3. ✅ `.env` এ credentials add করুন
4. ✅ Server run করুন
5. ✅ Test video upload করুন
6. ✅ Frontend এ video player integrate করুন

**আপনার video streaming system সম্পূর্ণ ready! 🎉**
