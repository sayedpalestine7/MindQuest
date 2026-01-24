
# Chapter 3: Methodology

## 3.1 Tools, Methods, and Programming Languages

### 3.1.1 Tools

This section describes the principal development tools employed during the MindQuest project and explains the role each played in coding, testing, database management, and team collaboration.

- Visual Studio Code:

	Visual Studio Code served as the primary integrated development environment. It facilitated source code authoring, navigation, and refactoring through language-aware editors and extensions. The environment supported debugging sessions, linting, and local testing workflows, enabling rapid iteration on both frontend and backend components while maintaining code quality through editor-integrated diagnostics.

- Git and GitHub:

	Version control using Git, with a remote repository hosted on GitHub, provided the foundation for collaborative development. Branching and pull request workflows were used to isolate features, conduct code review, and manage integration. The version control system preserved change history, enabled reproducible builds, and supported coordination among team members working on concurrent tasks.

- Postman:

	Postman was used for systematic API testing and exploratory verification of backend endpoints. It provided a convenient mechanism for composing HTTP requests, inspecting responses, and validating API contracts during development. Collections of requests served as informal documentation and were useful for regression checks following iterative backend changes.

- XAMPP (MySQL):

    XAMPP was used as a local development environment to support database management during the MindQuest project. Through its MySQL component, XAMPP enabled the team to run and manage relational databases locally, providing a controlled and easily configurable environment for development and testing. The platform facilitated database creation, schema updates, and direct inspection of stored data using graphical management tools such as phpMyAdmin. This setup allowed the team to verify database behavior, validate query results, and debug data-related issues efficiently without relying on external or production-grade database infrastructure.

- Local development servers:

	Local servers were used to run frontend and backend components during development and integration testing. Hosting services locally enabled end-to-end verification of user interfaces, API interactions, and database transactions in a controlled environment. The use of development servers accelerated feedback loops through hot reloading and simplified debugging of cross-layer interactions prior to any deployment.

Collectively, these tools supported a disciplined development workflow that emphasised reproducibility, incremental verification, and collaborative code management. They enabled the team to move from specification to implementation while maintaining traceability and testability of system components.

### 3.1.2 Programming Languages & Frameworks

This subsection describes the principal programming languages and frameworks used in the MindQuest project, separating frontend and backend technologies and explaining the rationale for their selection.

- Frontend:

	- React: Employed as the principal user interface framework to build component-based, reusable UI elements. React’s declarative model and component composition facilitated the development of interactive lesson pages and modular interface elements that could be maintained and extended with minimal coupling.

	- Vite: Adopted as the development build tool and bundler to provide fast incremental builds and development server features. Vite’s lightweight configuration and rapid hot-module replacement contributed to quicker development cycles and more efficient frontend iteration.

	- Tailwind CSS: Used as a utility-first styling framework to accelerate consistent visual design and reduce custom CSS overhead. Tailwind enabled rapid layout and styling adjustments through composable utility classes, simplifying maintenance in a component-driven UI.

	- JavaScript (JSX): JavaScript with JSX syntax was the primary language for frontend logic and component templates. The ubiquity of JavaScript in browser environments and its synergy with the chosen frameworks justified this selection.

	Rationale: The chosen frontend stack balances developer productivity, maintainability, and performance for a single-page application setting. The combination of component-based design, fast tooling, and utility-oriented styling supports rapid feature development and consistent UI behaviour across the application.

- Backend:

	- Node.js: Selected as the server‑side runtime to enable JavaScript-based development on the backend. Node.js’s event-driven, non-blocking I/O model supports efficient handling of concurrent requests, which is appropriate for API-driven services and real-time notification patterns.

	- Express.js: Used as a minimal and flexible web framework for routing, middleware composition, and request handling. Express facilitates the construction of RESTful endpoints and integrates cleanly with middleware for authentication, validation, and error handling.

	Rationale: Choosing Node.js and Express allows end-to-end JavaScript development, reducing cognitive context switching for the team and leveraging a mature ecosystem of libraries for web services. Their simplicity and wide adoption make them suitable for implementing robust RESTful APIs within the project’s timeframe.

- Authentication:

	- JWT-based authentication: JSON Web Tokens were used to represent authenticated sessions in a stateless manner. JWTs support token-based access across decoupled clients and servers and are compatible with RESTful API patterns.

	Rationale: JWTs provide a pragmatic and well-understood mechanism for authentication in API-centric applications. They align with the project’s architectural choices and enable straightforward implementation of role-based access controls.

Collectively, these technologies were selected for their interoperability, developer ergonomics, and suitability for constructing a modular, API-driven web application within the constraints of this project.

### 3.1.3 Database

The MindQuest system employs a hybrid data persistence strategy that utilises a relational database for structured transactional data and a document-oriented store for selected unstructured data types. This approach reflects the differing consistency, queryability, and schema flexibility requirements of the system's data domains.

- MySQL (primary relational database via XAMPP):

    MySQL, deployed through the XAMPP stack, functions as the primary authoritative store for structured, transactional entities such as user accounts, roles, enrollments, course metadata, quiz definitions, and progress records. The relational model supports normalized schemas, referential integrity, and ACID-compliant transactional semantics that are appropriate for operations requiring strong consistency (for example, enrollment workflows and payment-related updates). Careful schema design and indexing strategies were applied to balance query performance, data integrity, and long-term maintainability.

- Prisma ORM:

    Prisma is used as the data access and schema management layer for the MySQL database. Its declarative schema definition and migration tools provide a structured and repeatable approach to defining data models and evolving the database schema over time. Prisma generates a type-safe client API that simplifies database interactions, reduces boilerplate code, and minimizes runtime errors. The use of an ORM improves developer productivity while maintaining clear alignment between application-level models and the underlying relational schema.

- MongoDB (selected use cases):

	MongoDB is retained for data types that benefit from schema flexibility or document-oriented storage, such as rich animation metadata, large JSON payloads, or auxiliary content where rigid relational structures are inefficient. The document store accommodates variable content shapes and supports efficient retrieval of nested content without complex joins. MongoDB is therefore used selectively where its strengths outweigh the benefits of relational normalization.

High-level data organisation:

    The system clearly differentiates between core transactional data (residing in MySQL) and flexible content artifacts (stored in MongoDB). Core entities are modelled using explicit relationships, constraints, and foreign keys to ensure consistency and integrity, while document collections are used to capture media-rich or evolving data without imposing rigid schemas. Data access patterns were designed to minimise cross-database transactional complexity: operations requiring strong consistency are confined to the relational domain, while read-oriented aggregated views are composed at the application layer when necessary.

This layered data strategy provides a pragmatic balance between consistency, flexibility, and performance within the scope of the project, while allowing for future optimisation, scaling, or consolidation as operational requirements evolve.

### 3.1.4 Libraries & Tooling

The following groups of libraries and tooling were selected to support core functionality, maintainability, and code quality in the MindQuest project. Libraries are described by role rather than exhaustively enumerated to emphasise purpose and engineering trade-offs.

- Backend libraries and utilities:

	Authentication and authorization libraries provide middleware-level support for parsing and validating token-based credentials and for enforcing role-based access control at API boundaries. Database client and ORM tooling supply schema-driven access to the relational store, manage connection pooling, and facilitate migrations and type-safe queries. Additional server-side utilities include request validation, structured logging, and error-handling helpers that standardise API behaviour and reduce runtime faults.

- Frontend UI and styling libraries:

	Frontend libraries include component-oriented UI utilities that promote reuse of interactive patterns, accessibility primitives, and responsive layout helpers. Styling utilities and CSS frameworks offer a consistent design vocabulary and responsive utility classes that reduce bespoke styling work. These libraries collectively accelerate UI construction while preserving consistency and accessibility across lesson and administrative interfaces.

- Development, testing, and quality tooling:

	Tooling for code quality includes static analysis tools, linters, and formatters that enforce consistent style and catch common issues early in the development cycle. Automated testing frameworks and test runners support unit, integration, and API-level tests to verify behaviour and guard against regressions. Continuous integration practices are recommended to run these checks automatically on changes, increasing confidence in merges and releases.

By organising libraries and tooling according to backend, frontend, and quality concerns, the project sustains clear responsibility boundaries and enables targeted improvements. This approach supports maintainability, simplifies dependency management, and aligns with established software engineering best practices for medium-scale web applications.

## 3.2 Standards and Specifications

This section documents the standards, design principles, and development practices that guided the MindQuest project. The stated standards provide a basis for consistent implementation, interoperability, and maintainability across the system.

- API design and communication:

	The system adopts RESTful API principles for server‑side endpoints, using JSON as the primary interchange format for request and response payloads. This choice supports clear resource modelling, stateless interactions, and straightforward integration between the frontend and backend. Conforming to REST conventions facilitates predictable endpoint behavior, uniform error handling, and simplified client consumption of services.

- Authentication and authorization:

	Authentication is implemented using JSON Web Tokens (JWT) to establish and verify client identity in a stateless manner. Role‑based access control (RBAC) complements authentication to enforce privileges for students, teachers, and administrators. These practices ensure consistent access policies across API endpoints and allow authorization logic to be expressed and audited centrally.

- Data handling and security:

	The project follows security‑oriented handling of sensitive data and credentials. Passwords and other secrets are treated as confidential artifacts; storage and transport considerations emphasize minimisation of exposure. Input validation and principled sanitisation are applied at API boundaries to reduce injection and other common vulnerabilities. Where appropriate, data minimisation and least-privilege principles are observed when persisting and transmitting personally identifiable information.

- Architectural separation (layering):

	The system maintains a clear separation between frontend, backend, and database layers. This delineation enforces modularity, clarifies component responsibilities, and simplifies testing and deployment. Layered architecture supports independent development and substitution of components and reduces coupling between user interface concerns and data persistence or business logic.

Taken together, these standards and codes provide a pragmatic framework that informed implementation choices and quality assurance practices throughout the project. The documentation acknowledges that additional controls—such as formal secure development lifecycles, API versioning policies, and comprehensive security audits—are desirable for production deployment and are recommended as follow‑on work.

## 3.3 Constraints

This section documents the principal constraints that shaped design and implementation decisions for the MindQuest project, and explains how each constraint influenced engineering trade‑offs.

- Limited development time within an academic semester:

	The restricted timeline required prioritisation of core functionality and delivery of a minimum viable system that could be implemented and evaluated within the semester. Consequently, design choices favoured pragmatic, well-understood approaches that reduced development risk and supported incremental delivery. Feature selection was governed by value-to-effort considerations; higher‑risk or lower‑value capabilities were deferred to future work.

- Small development team:

	A compact team encouraged modularization and reuse to minimise duplicated effort and simplify coordination. The architecture emphasizes clear separation of concerns and small, testable components so that individual team members could work on discrete subsystems independently. The team size also influenced documentation and code conventions to accelerate onboarding and reduce integration friction.

- Limited budget and infrastructure:

	Budgetary constraints limited access to paid services, commercial tooling, and extensive cloud resources. The project therefore leverages cost-effective or open solutions and emphasises local development and lightweight deployment practices. Choices about third‑party services and external integrations were evaluated with attention to recurring costs and ease of replacement.

- Use of local and development environments only:

	Deployment and operational testing were primarily conducted in local or development environments rather than fully provisioned production systems. This limitation reduced opportunities for large‑scale performance and resilience testing; as a result, design decisions avoided complex, hard-to-test distributed architectures and instead focused on modular components that could be validated in development settings. Clear notes on deployment hardening and scalability requirements are provided for future work.

- Limited user testing and security hardening:

	User evaluation was constrained to small-scale testing with available participants, and comprehensive security hardening was limited by time and resources. The project therefore emphasises basic security best practices and careful input validation, while acknowledging that exhaustive penetration testing and enterprise-grade security measures remain outside the present scope. Evaluation of usability and educational effectiveness relies on structured, small-cohort studies, with findings interpreted in light of the limited sample sizes.

Collectively, these constraints informed a responsible engineering approach in which scope was bounded, risk was managed through incremental delivery, and design decisions prioritized maintainability and evaluability. The project documentation highlights deferred enhancements and recommended steps for scaling, security, and broader evaluation in subsequent development phases.



