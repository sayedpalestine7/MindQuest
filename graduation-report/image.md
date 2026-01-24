### 4.2.5 High-level Interaction Flow

The following diagram summarises the common interaction pattern for student activity (enrol, learn, assess, report):

```mermaid
sequenceDiagram
	participant Student
	participant Frontend
	participant Backend
	participant Database

	Student->>Frontend: Enrol / Open lesson / Submit quiz
	Frontend->>Backend: Authenticated request
	Backend->>Database: Persist enrolment, event, attempt
	Backend->>Frontend: Acknowledgement / feedback
	Backend->>Database: Update aggregates / progress
	Backend->>Frontend: Updated report / notification
	Frontend->>Student: Display feedback and report
```


### 4.3.5 High-level Interaction Flow (Teacher)

The sequence below summarises the typical teacher workflow for authoring, publishing, and monitoring:

```mermaid
sequenceDiagram
	participant Teacher
	participant Frontend
	participant Backend
	participant Database

	Teacher->>Frontend: Create course / Upload animation / Author quiz
	Frontend->>Backend: Authenticated authoring request
	Backend->>Database: Persist course/lesson/asset/quiz records
	Backend->>Frontend: Confirmation / preview link
	Teacher->>Frontend: Publish / Schedule
	Backend->>Database: Update lifecycle state (published)
	Student->>Frontend: Access course / Attempt quiz
	Frontend->>Backend: Read requests / submit attempts
	Backend->>Database: Persist attempts, update aggregates
	Backend->>Frontend: Provide monitoring data
	Frontend->>Teacher: Display dashboard and reports
```

### High-level Interaction Flow (Admin)

```mermaid
sequenceDiagram
	participant Admin
	participant Frontend
	participant Backend
	participant Database
	participant PaymentProvider

	Admin->>Frontend: Create/edit user, review content, request refund
	Frontend->>Backend: Authenticated admin request
	Backend->>Database: Persist changes, write audit record
	Note right of Backend: Enforce policy checks and role validation
	Backend->>PaymentProvider: (if payment) reconcile / refund
	Backend->>Frontend: Confirmation / report data
	Frontend->>Admin: Display updated state and audit trail
```