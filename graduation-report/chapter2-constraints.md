
## 2.1 Constraints and Limitations

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

## 2.2 Standards and Codes

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

## 2.3 Earlier Coursework

Software Engineering:

The Software Engineering course established foundational methodologies for systematic development, including requirements analysis, architectural design, testing, and project management. These principles were applied in MindQuest through explicit requirements specification, modular architecture, iterative development cycles, and an emphasis on automated and manual testing to ensure software quality and maintainability.

Database Systems:

Database Systems coursework contributed essential knowledge of data modelling, relational schema design, indexing, and transaction management. These concepts informed the design of persistent data structures for courses, enrollments, and progress records, and guided decisions regarding consistency, normalization, and performance trade-offs in the implementation.

Web Programming:

Introductory web programming provided practical grounding in client-server interactions, markup, styling, and client-side scripting. The course material underpinned the construction of interactive lesson interfaces and the integration of frontend components with backend endpoints, ensuring a usable and accessible web experience.

Advanced Web Programming:

Advanced topics in web development offered deeper exposure to modern web frameworks, single-page application patterns, state management, and asynchronous communication. These principles were applied to implement component-based interfaces, efficient API consumption, and real-time notification mechanisms within the MindQuest frontend.

Advanced Software Engineering:

Advanced Software Engineering coursework expanded upon foundational development practices by emphasizing scalable system design, design patterns, software architecture styles, and maintainability in large-scale applications. These concepts influenced MindQuest through the adoption of layered architecture, clear separation of concerns, and the use of reusable components and service abstractions. Attention to code quality, refactoring, and documentation supported long-term maintainability, while exposure to agile and iterative development practices informed the project’s incremental implementation and continuous improvement process.

