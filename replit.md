# Overview

This is a comprehensive claims management system (Gestão de Sinistros) built for an insurance brokerage. The application provides a complete workflow for managing insurance claims from creation to closure, featuring a modern web interface, webhook integrations with n8n automation, and persistent data storage with PostgreSQL. The system includes four main pages: Dashboard, New Claim (Novo Sinistro), Claim Details (Detalhe do Sinistro), and Reports (Relatórios).

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built as a Single Page Application using React 18 with TypeScript. The architecture follows a component-based design pattern with:

- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Form Handling**: React Hook Form with Zod schema validation
- **Build Tool**: Vite for fast development and optimized production builds

The application implements a dual-theme design system with dark backgrounds (#060606) for standard sections and light backgrounds (#f9f9f9) for report areas, featuring consistent gradient containers and blue gradient buttons.

## Backend Architecture
The backend is implemented as a REST API using Express.js with TypeScript:

- **Framework**: Express.js with middleware for JSON parsing and request logging
- **API Design**: RESTful endpoints for CRUD operations on claims, documents, and reports
- **Error Handling**: Centralized error middleware with structured error responses
- **Development Setup**: Hot reloading with tsx and Vite integration for seamless full-stack development

The server provides endpoints for dashboard data, individual claim details, document management, and report generation.

## Data Storage Solutions
The application uses a hybrid storage approach:

- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Tables**: Five core tables (sinistros, documentos, pendencias, andamentos, workflow_logs) with proper foreign key relationships
- **Development Storage**: In-memory storage implementation for development/testing purposes

The database schema supports the complete claims lifecycle with proper audit trails and document attachments stored as base64 encoded data.

## Authentication and Authorization
The codebase includes a basic user management structure with:

- **User Schema**: Defined user types with username-based identification
- **Storage Interface**: Abstract storage interface allowing for multiple authentication backends
- **Session Management**: Basic session structure for future authentication implementation

Currently configured for development without active authentication, but architected for easy integration of authentication providers.

## External Dependencies

### Third-Party Services
- **n8n Automation Platform**: Webhook-based integration for workflow automation
  - Claim list retrieval (WH_SINISTRO_LIST)
  - Claim creation (WH_SINISTRO_CREATE)
  - Document upload processing (WH_DOC_UPLOAD)
  - Notification sending (WH_SINISTRO_ENVIAR_AVISO)
  - Status updates (WH_SINISTRO_UPDATE_STATUS)
  - Pending task management (WH_PENDENCIA_CREATE)
  - Claim closure (WH_SINISTRO_CLOSE)
  - Monthly report generation (WH_RELATORIO_GERAR_MENSAL)

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting (@neondatabase/serverless)
- **Connection Management**: Environment-based database URL configuration with connection pooling

### Development Tools
- **Replit Integration**: Custom plugins for development environment integration
- **Error Monitoring**: Runtime error overlay for development debugging
- **Code Analysis**: Cartographer plugin for code navigation and analysis

### UI Component Libraries
- **Radix UI**: Complete set of accessible component primitives
- **Lucide React**: Icon system with consistent styling
- **Date Handling**: date-fns for date manipulation and formatting
- **Carousel**: Embla Carousel for interactive content display

All external service configurations are managed through environment variables to ensure security and flexibility across different deployment environments.