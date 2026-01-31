# MCQ Module API Routes

Base URL: `/api/v1/mcq`

## Exam Routes (Admin)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/exams` | সব পরীক্ষা দেখুন | Admin |
| POST | `/exams` | নতুন পরীক্ষা তৈরি | Admin |
| GET | `/exams/:id` | একটি পরীক্ষার বিবরণ | Admin |
| PUT | `/exams/:id` | পরীক্ষা আপডেট | Admin |
| DELETE | `/exams/:id` | পরীক্ষা মুছুন | Super Admin |
| PATCH | `/exams/:id/publish` | পাবলিশ/আনপাবলিশ টগল | Admin |
| PATCH | `/exams/:id/publish-results` | ফলাফল প্রকাশ | Admin |
| PATCH | `/exams/:id/unpublish-results` | ফলাফল লুকান | Admin |
| GET | `/exams/:examId/submissions` | সব শিক্ষার্থীর সাবমিশন | Admin |

## Question Routes (Admin)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/exams/:examId/questions` | প্রশ্ন দেখুন (উত্তর সহ) | Admin |
| POST | `/questions` | প্রশ্ন যোগ করুন | Admin |
| PUT | `/questions/:id` | প্রশ্ন আপডেট | Admin |
| DELETE | `/questions/:id` | প্রশ্ন মুছুন | Admin |
| POST | `/exams/:examId/questions/bulk` | একসাথে অনেক প্রশ্ন যোগ | Admin |

## Student Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/exams/published` | প্রকাশিত পরীক্ষা দেখুন | Student |
| GET | `/exams/:examId/questions/student` | প্রশ্ন দেখুন (উত্তর ছাড়া) | Student |
| POST | `/exams/:examId/start` | পরীক্ষা শুরু | Student |
| GET | `/exams/:examId/submission` | নিজের সাবমিশন দেখুন | Student |
| POST | `/exams/:examId/answer` | উত্তর সেভ করুন | Student |
| POST | `/exams/:examId/submit` | পরীক্ষা জমা দিন | Student |
| GET | `/my-exams` | নিজের সব পরীক্ষা | Student |
| GET | `/exams/:examId/result` | ফলাফল দেখুন (প্রকাশিত হলে) | Student |

## Public Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/exams/:examId/leaderboard` | লিডারবোর্ড | None |

---

## Request/Response Examples

### Create Exam
```json
POST /api/v1/mcq/exams
{
  "title": "অধ্যায় ১ - MCQ টেস্ট",
  "description": "প্রথম অধ্যায়ের উপর পরীক্ষা",
  "duration": 30,
  "passingMarks": 40
}
```

### Create Question
```json
POST /api/v1/mcq/questions
{
  "examId": "exam_id_here",
  "questionText": "বাংলাদেশের রাজধানী কোথায়?",
  "options": [
    { "text": "ঢাকা", "isCorrect": true },
    { "text": "চট্টগ্রাম", "isCorrect": false },
    { "text": "রাজশাহী", "isCorrect": false },
    { "text": "খুলনা", "isCorrect": false }
  ],
  "marks": 1
}
```

### Save Answer (During Exam)
```json
POST /api/v1/mcq/exams/:examId/answer
{
  "questionId": "question_id_here",
  "selectedOptionIndex": 0
}
```

### Submit Exam
```json
POST /api/v1/mcq/exams/:examId/submit
{
  "isAutoSubmit": false
}
```

---

## Features

- ✅ Dynamic question options (2-4 options)
- ✅ Timer-based exam with auto-submit
- ✅ Real-time answer saving
- ✅ Automatic result calculation
- ✅ Admin-controlled result publishing
- ✅ Leaderboard support
- ✅ Exam history tracking
