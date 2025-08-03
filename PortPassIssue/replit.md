# Overview

This is a Node.js web application for managing digital port passes and vehicle stickers with comprehensive authentication and administrative features. The system allows authenticated internal staff to manually issue passes through a secure web interface. It features a React frontend with role-based access control, staff management capabilities, and an Express.js backend with session-based authentication, file uploads, pass generation, and data storage. The application generates printable pass cards with QR codes containing staff designation information and supports three types of passes: Daily Pass (MVR 6.11), Vehicle Sticker (MVR 11.21), and Crane Lorry Vehicle Sticker Pass (MVR 81.51).

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with Tailwind CSS for styling using the shadcn/ui design system
- **State Management**: React Hook Form for form handling with Zod validation, TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build System**: Vite with custom configuration for development and production builds

## Backend Architecture
- **Framework**: Express.js with TypeScript and session-based authentication
- **Authentication**: bcryptjs for password hashing, express-session for session management
- **Authorization**: Role-based access control with staff and administrator roles
- **File Handling**: Multer middleware for bank transfer slip uploads with 5MB file size limit
- **Storage**: In-memory storage implementation with interface for future database integration, includes staff management
- **API Design**: RESTful endpoints for pass creation, retrieval, authentication, and staff management
- **Development Setup**: Custom Vite integration for hot module replacement in development

## Data Storage Solutions
- **Current Implementation**: In-memory storage using Maps for transactions, passes, and staff management
- **Database Ready**: Drizzle ORM configured for PostgreSQL with schema definitions including staff table and migrations setup
- **Authentication Storage**: Staff credentials with hashed passwords and role-based permissions
- **File Storage**: Local file system storage for uploaded bank transfer slips in `/uploads/slips` directory
- **Session Storage**: Express session configuration for maintaining authentication state

## Form Validation and Data Flow
- **Validation Strategy**: Zod schemas for both frontend form validation and backend data validation
- **Data Structure**: Shared TypeScript types between frontend and backend via shared schema definitions
- **Pass Generation**: Unique pass numbers using year-timestamp-random format, QR code generation using qrcode library
- **QR Code Enhancement**: QR codes contain comprehensive pass data including staff designation, customer details, pass type, validity, amount, creation timestamp, and status for verification purposes

## Print System Design
- **Print Strategy**: Browser-based printing using CSS print media queries for professional pass card layouts
- **QR Code Integration**: Data URL generation for embedded QR codes containing pass numbers
- **Pass Card Layout**: Responsive design supporting company logo, customer details, pass information, and pricing

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18 with TypeScript, React Hook Form with Zod resolvers for form management
- **Backend Framework**: Express.js with TypeScript support using tsx for development runtime
- **Build Tools**: Vite for frontend bundling, esbuild for backend production builds

## UI and Styling
- **Component Library**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with custom design tokens and shadcn/ui component system
- **Icons**: Lucide React for consistent iconography

## Database and ORM
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Driver**: Neon Database serverless driver for PostgreSQL connections
- **Migration System**: Drizzle Kit for database schema migrations

## File Processing
- **File Uploads**: Multer for handling multipart form data and file storage
- **QR Code Generation**: qrcode library for generating QR codes as data URLs

## Development Tools
- **Replit Integration**: Custom plugins for development environment integration and error handling
- **Session Management**: connect-pg-simple for PostgreSQL session storage (configured but not actively used with current in-memory storage)