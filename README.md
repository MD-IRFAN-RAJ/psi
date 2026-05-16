# TaskSuite

TaskSuite is a comprehensive task management system designed for teams to manage projects, sprints, and tasks efficiently. It features role-based access control (RBAC), a modern UI, and a scalable backend.

## Features

### General
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for Admins and Users.
- **Authentication**: Secure login with JWT-based authentication.
- **Responsive Design**: Optimized for desktop and mobile.

### Task Management
- Create,Read, update, and delete tasks.
- Assign tasks to team members.
- Track task progress with statuses (TODO, IN_PROGRESS, DONE).

### Project Management
- Manage multiple projects.
- Organize tasks into sprints.

### File Uploads
- Attach files to tasks.
- Download and manage attachments.

## Tech Stack

### Frontend
- **React + Vite**: Fast and modern development experience.
- **TypeScript**: Type-safe codebase.
- **TailwindCSS**: Utility-first CSS framework.
- **Zustand**: Lightweight state management.

### Backend
- **Node.js + Express.js**: Scalable RESTful API.
- **Prisma ORM**: Type-safe database queries.
- **PostgreSQL**: Reliable relational database.

### DevOps
- **Docker**: Containerized development and deployment.
- **Swagger**: Interactive API documentation.

## Getting Started

### Prerequisites
- Node.js (v16+)
- Docker
- PostgreSQL

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MD-IRFAN-RAJ/psi.git
   cd psi
   ```

2. Set up environment variables:
   - add a .env directory in the same folder as .env.example
   - Copy `.env.example` to `.env` and update values.

3. Start the services:
   ```bash
   docker-compose up -d
   ```

4. Generate Prisma client:
   ```bash
   cd backend
   npx prisma generate
   ```

5. Start the development servers in seperate terminals:
   - Backend:
     ```bash
     cd backend
     npm run dev
     ```
   - Frontend:
     ```bash
     cd frontend
     npm run dev
     ```

### Running Tests
- Backend:
  ```bash
  cd backend
  npm run test
  ```
- Frontend:
  ```bash
  cd frontend
  npm run test
  ```

## Folder Structure

### Backend
- `src/`
  - `controllers/`: API controllers.
  - `services/`: Business logic.
  - `routes/`: API routes.
  - `prisma/`: Database schema and migrations.

### Frontend
- `src/`
  - `components/`: Reusable UI components.
  - `pages/`: Route-specific components.
  - `store/`: Global state management.

## Complete End to End Task management platform