# Notification System Implementation Summary

## Overview
Implemented a comprehensive web-based notification system for teachers and students in MindQuest. Notifications are triggered on key events: course approval/rejection, enrollment, reviews, report status changes, and successful payments.

---

## Backend Implementation

### 1. Database Model
**File:** `backend/src/models/mongo/notificationModel.js`
- MongoDB schema with fields:
  - `recipientId`: User receiving the notification
  - `type`: Enum of notification types (course_approved, course_rejected, enrollment, review, report_status, payment)
  - `title`, `message`: Display content
  - `entityId`: Related entity (course, review, etc.)
  - `metadata`: Additional data as JSON
  - `isRead`: Boolean flag
  - `createdAt`: Timestamp
- Indexes for efficient querying by recipient and read status

### 2. API Endpoints
**Files:** `backend/src/controllers/notificationController.js`, `backend/src/routes/notificationRoutes.js`

Routes (all protected by auth middleware):
- `GET /api/notifications` - Get paginated notifications
- `GET /api/notifications/unread` - Get unread count
- `PUT /api/notifications/:notificationId/read` - Mark single as read
- `PUT /api/notifications/read-all` - Mark all as read

### 3. Notification Service
**File:** `backend/src/services/notificationService.js`
- `createNotification()`: Creates notification in DB and emits via Socket.IO
- `emitUnreadCount()`: Sends real-time count updates

### 4. Event Hooks
Notifications are emitted in the following controllers:

#### Course Approval Flow
**File:** `backend/src/controllers/courseController.js`
- `approveCourse()`: Notifies teacher when course is approved
- `rejectCourse()`: Notifies teacher when course is rejected (with reason)

#### Enrollment Flow
**File:** `backend/src/controllers/studentController.js`
- `enrollCourse()`: Notifies student on successful enrollment

#### Review Flow
**File:** `backend/src/controllers/reviewController.js`
- `createReview()`: Notifies course teacher when student posts a review

#### Report Status Flow
**File:** `backend/src/controllers/reportController.js`
- `deleteReportedReview()`: Notifies review author when their review is removed

#### Payment Flow
**File:** `backend/src/controllers/paymentController.js`
- `handleWebhook()`: Notifies student on successful payment (webhook event)

### 5. Socket.IO Integration
**File:** `backend/src/server.js`
- Added `join_user_room` event handler for users to join their personal notification room
- Service emits `notification:new` and `notification:count` events to user rooms
- Integrated notification routes into Express app

---

## Frontend Implementation

### 1. Notification API Service
**File:** `frontend/src/services/notificationService.js`
- Axios client with auth interceptor
- Methods: `getNotifications()`, `getUnreadCount()`, `markAsRead()`, `markAllAsRead()`

### 2. Notification Context
**File:** `frontend/src/context/NotificationsContext.jsx`
- Replaced localStorage-only implementation with backend API integration
- Fetches notifications and unread count on mount
- Socket listeners for real-time `notification:new` and `notification:count` events
- Emits `join_user_room` when user is authenticated
- Provides: `notifications`, `unreadCount`, `loading`, `markRead()`, `markAllRead()`, `refreshNotifications()`, `refreshUnreadCount()`

### 3. NotificationBell Component
**File:** `frontend/src/components/shared/NotificationBell.jsx`
- Bell icon with unread badge
- Dropdown list with notification items
- Icons per notification type (✅ ❌ 📚 ⭐ 🚨 💳)
- Relative timestamps using `date-fns`
- Mark as read on click
- Mark all as read button

### 4. UI Integration
**File:** `frontend/src/components/shared/AppHeader.jsx`
- Replaced inline notification UI with `<NotificationBell />` component
- Shows only for student and teacher roles
- Already wired into `TeacherProfilePage` and `StudentProfilePage` via `<AppHeader />`

### 5. App Wiring
**File:** `frontend/src/App.jsx`
- `NotificationsProvider` already wraps all routes
- No additional setup needed

---

## Notification Types & Events

| Type               | Trigger Event                        | Recipient | Backend File                          |
|--------------------|--------------------------------------|-----------|---------------------------------------|
| `course_approved`  | Admin approves course                | Teacher   | `courseController.js`                 |
| `course_rejected`  | Admin rejects course                 | Teacher   | `courseController.js`                 |
| `enrollment`       | Student enrolls in course            | Student   | `studentController.js`                |
| `review`           | Student posts review                 | Teacher   | `reviewController.js`                 |
| `report_status`    | Admin/teacher removes reported review| Student   | `reportController.js`                 |
| `payment`          | Stripe payment succeeds (webhook)    | Student   | `paymentController.js`                |

---

## Socket.IO Events

### Client → Server
- `join_user_room(userId)` - Join personal notification room

### Server → Client
- `notification:new(notification)` - Real-time new notification
- `notification:count({ count })` - Real-time unread count update

---

## Dependencies Added
- **Frontend:** `date-fns` (for timestamp formatting)

---

## Testing Checklist

### Backend
- [ ] Start backend server and verify no errors
- [ ] Test notification endpoints with Postman/REST client
- [ ] Verify Socket.IO connection and room joins in server logs

### Frontend
- [ ] Login as teacher/student and verify bell appears in header
- [ ] Check unread count displays correctly
- [ ] Open notification dropdown and verify list rendering
- [ ] Mark single notification as read
- [ ] Mark all notifications as read
- [ ] Test real-time updates (create notification from backend, see it appear instantly)

### End-to-End Flows
1. **Course Approval:** Admin approves course → Teacher sees "Course Approved!" notification
2. **Course Rejection:** Admin rejects course → Teacher sees "Course Rejected" notification with reason
3. **Enrollment:** Student enrolls → Student sees "Enrollment Successful!" notification
4. **Review:** Student posts review → Teacher sees "New Course Review" notification
5. **Report Status:** Admin deletes reported review → Review author sees "Review Removed" notification
6. **Payment:** Stripe payment succeeds → Student sees "Payment Successful" notification

---

## Notes
- Mobile app was explicitly excluded from this implementation (web-only)
- Notifications are created only on **status changes** (not on initial requests)
- Payment notifications only trigger on **successful** payments (not failures)
- All notification endpoints require authentication
- Socket.IO rooms are per-user (format: `user_${userId}`)
- Unread badge shows "9+" for counts > 9

---

## Future Enhancements
- Add notification preferences (email, push, in-app toggles)
- Add notification filtering by type
- Add pagination in notification dropdown
- Add "View All" link to full notifications page
- Add notification sound effects
- Add mobile push notifications (FCM/APNs)
- Add notification grouping/threading
