
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



