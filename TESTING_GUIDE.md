# 🧪 Step 4: Testing Guide - Stripe Payment Integration

## ✅ Implementation Status

**Backend:**
- ✅ Stripe SDK initialized
- ✅ Payment routes registered (`/api/payments/create-intent`)
- ✅ Payment controller with server-side price validation
- ✅ Amount calculated from database (secure)
- ✅ Webhook endpoint ready (optional, currently skipped)

**Frontend:**
- ✅ Stripe packages installed
- ✅ Payment service created
- ✅ Payment modal with Stripe Elements
- ✅ Enrollment flow with free/paid detection
- ✅ Toast notifications for feedback

**Servers Running:**
- 🟢 Backend: http://localhost:5000
- 🟢 Frontend: http://localhost:5174

---

## 🎯 Testing Scenarios

### Scenario 1: Free Course Enrollment
**Expected Behavior:** Student enrolls immediately without payment

1. Navigate to `/courses` or `/browse`
2. Find a course with price = 0 (displays "Free" badge)
3. Click "View Course"
4. Click "Enroll Now"
5. ✅ Should enroll immediately without payment modal
6. ✅ Should navigate to course content
7. ✅ Toast: "Successfully enrolled!"

---

### Scenario 2: Paid Course Enrollment (Success)
**Expected Behavior:** Payment modal → Enter card → Payment succeeds → Enrollment

1. Navigate to `/courses` or `/browse`
2. Find a course with price > 0 (displays "$29" or price)
3. Click "View Course"
4. Click "Enroll Now"
5. ✅ Payment modal should open
6. ✅ Course title and price displayed
7. Enter test card: `4242 4242 4242 4242`
8. Enter any future expiry date (e.g., 12/25)
9. Enter any CVC (e.g., 123)
10. Click "Pay $XX"
11. ✅ Button shows "Processing..." with spinner
12. ✅ Payment succeeds
13. ✅ Modal closes
14. ✅ Student enrolled
15. ✅ Navigate to course content
16. ✅ Toast: "Payment successful! Enrolling..."

**Backend Logs:**
```
✅ PaymentIntent created: pi_xxx Amount: $29
```

---

### Scenario 3: Paid Course Enrollment (Declined)
**Expected Behavior:** Payment fails, enrollment doesn't happen

1. Follow steps 1-6 from Scenario 2
2. Enter declined test card: `4000 0000 0000 9995`
3. Enter any future expiry and CVC
4. Click "Pay $XX"
5. ✅ Error message appears: "Your card was declined"
6. ✅ Student remains NOT enrolled
7. ✅ Can try again or cancel

---

### Scenario 4: Cancel Payment
**Expected Behavior:** Modal closes, no enrollment

1. Follow steps 1-6 from Scenario 2
2. Click "Cancel" button
3. ✅ Modal closes
4. ✅ No enrollment happens
5. ✅ Toast: "Payment cancelled"
6. ✅ Can try again by clicking "Enroll Now"

---

### Scenario 5: Already Enrolled (Free Course)
**Expected Behavior:** Skip enrollment, go to course

1. Enroll in a free course (Scenario 1)
2. Navigate back to `/courses`
3. Find the same course
4. ✅ "View Course" button shows "Continue" if already enrolled
5. Click "Continue"
6. ✅ Navigate directly to course content
7. ✅ No payment or enrollment needed

---

### Scenario 6: Already Enrolled (Paid Course)
**Expected Behavior:** Skip payment, go to course

1. Complete paid enrollment (Scenario 2)
2. Navigate back to `/courses`
3. Find the same course
4. ✅ "View Course" button shows "Continue"
5. Click "Continue"
6. ✅ Navigate directly to course content
7. ✅ No payment modal shown

---

## 🧰 Stripe Test Cards

| Card Number         | Scenario                  | CVC | Expiry      |
|---------------------|---------------------------|-----|-------------|
| 4242 4242 4242 4242 | ✅ Success               | Any | Any future  |
| 4000 0000 0000 9995 | ❌ Decline (generic)     | Any | Any future  |
| 4000 0000 0000 0069 | ❌ Expire (card expired) | Any | Any future  |
| 4000 0000 0000 0341 | ❌ Decline (lost card)   | Any | Any future  |
| 4000 0025 0000 3155 | 🔐 3D Secure required    | Any | Any future  |

---

## 🔍 Verification Checklist

### Backend Verification
- [ ] Backend server running on port 5000
- [ ] Stripe initialized with secret key
- [ ] `/api/payments/create-intent` endpoint accessible
- [ ] Course price fetched from database (not client)
- [ ] Amount converted to cents (Stripe format)
- [ ] Metadata includes courseId, studentId

### Frontend Verification
- [ ] Frontend server running on port 5174
- [ ] Stripe publishable key loaded from env
- [ ] Payment modal renders correctly
- [ ] Stripe Elements load (card input visible)
- [ ] Free courses skip payment
- [ ] Paid courses trigger payment modal
- [ ] Success/error states handled
- [ ] Toast notifications appear

### Security Verification
- [ ] ✅ Secret key only on backend
- [ ] ✅ Publishable key only on frontend
- [ ] ✅ Price never sent from frontend
- [ ] ✅ Amount calculated server-side
- [ ] ✅ Enrollment only after payment success
- [ ] ✅ No card details stored in app

---

## 🐛 Common Issues & Solutions

### Issue: Payment modal doesn't open
**Solution:** Check browser console for errors. Verify `VITE_STRIPE_PUBLISHABLE_KEY` in `.env`

### Issue: "Failed to create payment intent"
**Solution:** Check backend logs. Verify `STRIPE_SECRET_KEY` in backend `.env`

### Issue: Port 5173 in use
**Solution:** Frontend auto-switched to 5174. Update `CLIENT_URL` in backend `.env` if needed.

### Issue: CORS error
**Solution:** Backend `CLIENT_URL` should match frontend URL (http://localhost:5174)

### Issue: Course price not found
**Solution:** Create/update a course with `price > 0` using TeacherCourseBuilder

---

## 🎬 Demo Flow (Quick Test)

1. **Create a Paid Course (Teacher):**
   - Login as teacher
   - Go to `/teacher/courseBuilder`
   - Create course with price = $29
   - Save course

2. **Test Enrollment (Student):**
   - Logout and login as student
   - Go to `/courses`
   - Find the paid course
   - Click "View Course"
   - Click "Enroll Now"
   - Payment modal appears
   - Enter: `4242 4242 4242 4242`
   - Click "Pay $29"
   - Success! Navigate to course

3. **Verify Payment in Stripe Dashboard:**
   - Go to https://dashboard.stripe.com/test/payments
   - See payment with amount $29
   - Click payment to see metadata (courseId, studentId)

---

## 📊 Success Criteria

✅ Free courses enroll without payment  
✅ Paid courses require payment before enrollment  
✅ Payment modal displays correctly  
✅ Test card (4242...) succeeds  
✅ Declined card (9995...) shows error  
✅ Cancel closes modal without enrollment  
✅ Successful payment enrolls student  
✅ Already enrolled courses skip payment  
✅ Toast notifications provide feedback  
✅ No errors in console  

---

## 🚀 Next Steps After Testing

1. **Production Checklist:**
   - Replace test keys with live keys
   - Enable webhook verification
   - Add webhook endpoint to Stripe dashboard
   - Test with real cards (small amounts)
   - Add receipt emails
   - Add refund functionality (optional)

2. **Enhancements (Optional):**
   - Save payment history to database
   - Allow teachers to set discounts/coupons
   - Support multiple currencies
   - Add subscription model
   - Implement 3D Secure for EU compliance

---

**Status:** ✅ Ready for testing!

Test the flows above and report any issues. The implementation is complete and secure.
