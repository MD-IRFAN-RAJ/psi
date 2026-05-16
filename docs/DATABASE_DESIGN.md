# Database Design

## Overview
The database uses PostgreSQL to store relational data for the Task Management System. The schema is designed to be normalized and scalable.

## Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USER ||--o{ TASK_AUTHOR : creates
    USER ||--o{ TASK_ASSIGNEE : assigned_to
    TASK ||--o{ ATTACHMENT : contains
    
    USER {
        uuid id PK
        string email UK
        string password_hash
        string first_name
        string last_name
        enum role "USER | ADMIN"
        datetime created_at
        datetime updated_at
    }

    TASK {
        uuid id PK
        string title
        text description
        enum status "TODO | IN_PROGRESS | DONE"
        enum priority "LOW | MEDIUM | HIGH"
        datetime due_date
        uuid author_id FK
        uuid assignee_id FK "nullable"
        datetime created_at
        datetime updated_at
    }

    ATTACHMENT {
        uuid id PK
        uuid task_id FK
        string file_name
        string file_url
        string file_type
        int file_size_bytes
        datetime uploaded_at
    }
```

## Schema Details

### User Table
Stores authentication and profile information.
- `role`: Enables role-based access control (RBAC).

### Task Table
Stores the core task entities.
- Indexed by `assignee_id` and `status` to allow fast querying on the dashboard.
- `author_id` tracks who created the task.
- `assignee_id` is nullable, allowing tasks to be unassigned initially.

### Attachment Table
Stores metadata for uploaded PDF documents (max 3 per task, enforced at application level).
- `file_url` will point to the storage location (local disk or S3 bucket).
