# Quick Start Testing Guide for Notifications

## Prerequisites
1. Backend server running on port 5000
2. Frontend running on port 5173
3. MongoDB connected
4. At least one teacher and one student account

---

## Test Scenarios

### 1. Course Approval Notification (Teacher)
**Steps:**
1. Login as a teacher
2. Create and submit a course for review
3. Login as admin at `/admin`
4. Go to pending courses and approve the course
5. Logout and login again as the teacher
6. Check the notification bell - should show "Course Approved!" ✅

**Expected Result:**
- Bell icon shows unread count badge (red circle with "1")
- Dropdown shows: "Course Approved! Your course '[course name]' has been approved and published."
- Notification has green checkmark icon ✅

---

### 2. Course Rejection Notification (Teacher)
**Steps:**
1. Login as a teacher
2. Create and submit another course for review
3. Login as admin
4. Reject the course with a reason (e.g., "Content needs improvement")
5. Logout and login again as the teacher
6. Check notification bell

**Expected Result:**
- Notification shows: "Course Rejected - Your course '[course name]' was rejected. Reason: [reason]"
- Notification has red X icon ❌

---

### 3. Enrollment Notification (Student)
**Steps:**
1. Login as a student
2. Browse courses and enroll in an approved course (free or paid)
3. Check notification bell immediately

**Expected Result:**
- Notification shows: "Enrollment Successful! You have successfully enrolled in '[course name]'."
- Notification has book icon 📚
- **Note:** If paid course, you may also see a payment notification

---

### 4. Review Notification (Teacher)
**Steps:**
1. Login as a student enrolled in a course
2. Go to the course page and submit a review (rating + comment)
3. Logout and login as the teacher who owns that course
4. Check notification bell

**Expected Result:**
- Notification shows: "New Course Review - A student left a [X]-star review on '[course name]'."
- Notification has star icon ⭐

---

### 5. Payment Success Notification (Student)
**Steps:**
1. Login as a student
2. Try to enroll in a paid course
3. Complete Stripe payment successfully
4. Check notification bell after payment confirmation

**Expected Result:**
- Notification shows: "Payment Successful - Your payment for '[course name]' was successful."
- Notification has credit card icon 💳

---

### 6. Real-Time Testing (Socket.IO)
**Steps:**
1. Open two browser windows side by side
2. Login as teacher in one, admin in the other
3. Admin approves a course
4. Watch teacher's notification bell in real-time

**Expected Result:**
- Teacher's bell badge updates instantly (no page refresh needed)
- New notification appears in dropdown without refresh

---

## Debugging Tips

### Check Backend Logs
Look for these console messages:
- `🟢 Socket connected: [socket.id]`
- `🔔 [socket.id] joined user room: user_[userId]`
- `📢 Notification sent to [userId]: [type]`
- `💬 Message saved: [messageId]` (for chat)

### Check Frontend Console
Look for:
- `🔔 New notification received: [notification object]`
- Socket connection errors
- API call errors from notificationService

### Common Issues

**Bell doesn't show:**
- Check that user role is "teacher" or "student" (not "admin")
- Verify `NotificationsProvider` wraps the routes in App.jsx

**No real-time updates:**
- Check socket connection in browser DevTools → Network → WS
- Verify backend emits `join_user_room` event
- Check server logs for room join confirmation

**Notifications not persisting:**
- Check MongoDB connection
- Verify notification is saved in database (use MongoDB Compass or CLI)
- Check API calls in Network tab

---

## API Endpoints to Test Manually

### Get Notifications
```bash
GET http://localhost:5000/api/notifications
Headers: Authorization: Bearer [token]
```

### Get Unread Count
```bash
GET http://localhost:5000/api/notifications/unread
Headers: Authorization: Bearer [token]
```

### Mark as Read
```bash
PUT http://localhost:5000/api/notifications/[notificationId]/read
Headers: Authorization: Bearer [token]
```

### Mark All as Read
```bash
PUT http://localhost:5000/api/notifications/read-all
Headers: Authorization: Bearer [token]
```

---

## Notification Types Reference

| Icon | Type | Trigger |
|------|------|---------|
| ✅ | `course_approved` | Admin approves course |
| ❌ | `course_rejected` | Admin rejects course |
| 📚 | `enrollment` | Student enrolls |
| ⭐ | `review` | Student posts review |
| 🚨 | `report_status` | Review removed |
| 💳 | `payment` | Payment succeeds |

---

## Next Steps After Testing

If everything works:
1. Test with multiple users simultaneously
2. Test edge cases (network disconnect/reconnect)
3. Test with large notification lists (100+ notifications)
4. Verify mobile responsiveness of dropdown
5. Consider adding notification preferences (future enhancement)

If issues found:
1. Check browser console for errors
2. Check backend server logs
3. Verify MongoDB collections exist
4. Check network requests in DevTools
5. Verify authentication tokens are valid
