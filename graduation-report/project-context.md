# Appendix A: Project Context

PROJECT NAME: MindQuest

PROJECT TYPE: Software Project
Software Engineering Graduation Project

PROJECT DESCRIPTION:
MindQuest is an interactive learning platform that delivers courses with animations, quizzes, and progress tracking. It enables students to enroll in structured content, complete assessments, and receive real-time notifications. Teachers manage courses and lessons, while payments support premium content access.

TECH STACK:
Frontend: React, Vite, Tailwind CSS, JavaScript (JSX)
Backend: Node.js, Express
Database: PostgreSQL (Prisma), MongoDB
Authentication: JWT-based auth
Deployment: Not specified (local/dev configuration)

MAIN FEATURES:
- User authentication and role-based access (student/teacher/admin)
- Course, lesson, and animation-based learning content
- Quizzes, progress tracking, and performance reports
- Payments and enrollment for premium content
- Real-time notifications and messaging

TARGET USERS:
- Students
- Teachers/Content creators
- Administrators

CONSTRAINTS:
- Time (academic semester timeline)
- Team size (small student team)
- Budget (limited student resources)

## System Data Layer (Schema Summary)

This section provides a high-level description of the system’s data layer, the principal entities that underpin MindQuest, and how the persisted shape of data supports the platform’s functional requirements. The presentation is intentionally descriptive rather than prescriptive: it explains the logical schema, relationship patterns, and access constraints without providing implementation-level DDL or migration scripts.

Database strategy and provenance

- Authoritative store: The relational datastore is presented as the authoritative source of truth for core domain records (user accounts and profiles, course metadata, lesson structure, quiz definitions, progress summaries, and payment state). For the purposes of this exposition the relational store is MySQL (for example, a XAMPP-hosted instance) and serves as the canonical repository for structured, relational data used in reporting and transactional workflows.
- ORM posture: Prisma is included in the codebase as an application-level abstraction and a candidate for future refactoring. In the current project state Prisma is summarised as partially utilised: it exists to improve type-safety and maintainability over time but does not, at present, fully replace existing controller-level data access patterns.
- Document-store usage: The implementation also makes use of a document store for high-volume or schemaless artefacts where appropriate (for example event logs, notifications, or large media metadata). Where document collections are present they are used to complement rather than replace relational structures. See [backend/src/db/mongoConnect.js](backend/src/db/mongoConnect.js) for the document-store connection used by the project.

Principal logical entities and relationships

- Users: Central actor records include identity attributes (unique identifier, email), authentication metadata, and a role attribute that governs access (for example, student, teacher, administrator). Role and status fields are used by the access-control layer to determine permitted operations and are recorded alongside core user profile fields. Controller interactions that authoritatively update user records are found in [backend/src/controllers/userController.js](backend/src/controllers/userController.js) and [backend/src/controllers/studentController.js](backend/src/controllers/studentController.js).
- Roles and permissions: Roles are represented as attributes on the user entity and are enforced by API-layer checks; administrative or elevated operations require role validation and are logged for auditability (see `userController` and middleware in the repository).
- Courses and lessons: Courses are modelled as top-level entities with referential links to ordered lesson records. Lessons carry sequencing and media references and are associated with course identifiers; controllers responsible for these records include [backend/src/controllers/courseController.js](backend/src/controllers/courseController.js) and [backend/src/controllers/lessonController.js](backend/src/controllers/lessonController.js).
- Quizzes and questions: Quiz definitions are persisted as structured records that reference a set of question items. Question items include type metadata, scoring weight, and feedback fields. Quiz and question artefacts are authored and read by the quiz controller: [backend/src/controllers/quizController.js](backend/src/controllers/quizController.js).
- Enrolments and progress: Enrolment relationships associate users with courses and are represented so they can be joined to progress summaries and assessment attempts. Progress summaries aggregate lesson completions, quiz results, and instructor evaluations to produce a normalized view of course progress; the aggregation and read paths are implemented in [backend/src/controllers/progressController.js](backend/src/controllers/progressController.js) and [backend/src/controllers/reportController.js](backend/src/controllers/reportController.js).
- Payments (state): Payment processing is handled externally via Stripe, with only minimal payment state persisted in the relational database. The persisted payment state captures transactional metadata necessary for reconciliation and enrolment gating (for example: transaction identifier, payment status, timestamp, and association to user and course). Payment interactions and webhook reconciliation logic are implemented in [backend/src/controllers/paymentController.js](backend/src/controllers/paymentController.js) and setup notes appear in [backend/STRIPE_SETUP.md](backend/STRIPE_SETUP.md).

Role-based constraints and integrity

- Uniqueness and referential integrity: The relational design enforces uniqueness for identity attributes (for example, email) and referential integrity between courses, lessons, quizzes and their parent entities. These constraints support consistent joins and reliable aggregation for reporting.
- Access enforcement: Role-based access is implemented at the API layer and enforced prior to data mutation; administrative changes to role attributes are recorded and take effect immediately with session/token invalidation where required.
- Auditability: Administrative and financial actions are accompanied by audit metadata (actor, operation, timestamp) to support traceability and compliance reporting.

How relational data supports features

- Transactional operations: Enrolment and payment state updates are handled in transactional sequences to ensure that payment reconciliation and enrolment are consistent (for example, atomically marking an enrolment paid when a confirmed payment is received).
- Aggregation and reporting: Structured relational joins and materialised aggregates (or cached summaries) supply dashboard views, course progress metrics, and institutional reports. These aggregates are refreshed by backend routines and are exposed through reporting controllers ([backend/src/controllers/reportController.js](backend/src/controllers/reportController.js)).
- Performance considerations: High-volume event data (fine-grained interaction logs, raw media analytics) may be shunted to the document store to avoid overloading relational tables; the relational store retains summary artefacts required for authoritative reports.

Scope and limitations

- Prisma is described here as a partial abstraction layer retained for future refactoring; the current codebase contains both direct data-access patterns and Prisma client code. The report intentionally avoids asserting that Prisma fully drives controller behaviour.
- Export formats (CSV/PDF) are described only when present in the codebase; no export schema or generation logic is assumed in this section unless explicit implementation is discovered.

Key references

- Relational schema and client: [backend/prisma/schema.prisma](backend/prisma/schema.prisma), [backend/src/prisma/client.js](backend/src/prisma/client.js)
- Document-store connection: [backend/src/db/mongoConnect.js](backend/src/db/mongoConnect.js)
- Controllers (representative): [backend/src/controllers/userController.js](backend/src/controllers/userController.js), [backend/src/controllers/courseController.js](backend/src/controllers/courseController.js), [backend/src/controllers/lessonController.js](backend/src/controllers/lessonController.js), [backend/src/controllers/quizController.js](backend/src/controllers/quizController.js), [backend/src/controllers/progressController.js](backend/src/controllers/progressController.js), [backend/src/controllers/paymentController.js](backend/src/controllers/paymentController.js)
