# Flowcharts & Application Flow

## 1. Authentication Flow
This describes how a user logs into the system and receives an access token.

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant DB

    Client->>API: POST /api/v1/auth/login (email, password)
    API->>DB: Query User by Email
    DB-->>API: Return User Record
    alt User not found or Password invalid
        API-->>Client: 401 Unauthorized
    else Valid Credentials
        API->>API: Generate JWT Access & Refresh Tokens
        API-->>Client: 200 OK (Tokens, User Info)
    end
```

## 2. Authorization Flow (Role-Based Access)
When a user requests a protected resource.

```mermaid
sequenceDiagram
    participant Client
    participant AuthMiddleware
    participant RoleMiddleware
    participant Controller
    
    Client->>AuthMiddleware: GET /api/v1/users (Authorization: Bearer <token>)
    AuthMiddleware->>AuthMiddleware: Verify Token & Extract Payload
    alt Token Invalid
        AuthMiddleware-->>Client: 401 Unauthorized
    else Token Valid
        AuthMiddleware->>RoleMiddleware: Pass req.user
        RoleMiddleware->>RoleMiddleware: Check if req.user.role == 'ADMIN'
        alt Role Invalid
            RoleMiddleware-->>Client: 403 Forbidden
        else Role Valid
            RoleMiddleware->>Controller: Next()
            Controller-->>Client: 200 OK (Users Data)
        end
    end
```

## 3. General Application Flowchart
High-level overview of the application navigation.

```mermaid
graph TD
    Start[User Visits App] --> CheckAuth{Is Authenticated?}
    
    CheckAuth -->|No| Login[Login / Register Page]
    Login --> AuthSubmit[Submit Credentials]
    AuthSubmit --> CheckAuth
    
    CheckAuth -->|Yes| Dashboard[Task Dashboard]
    
    Dashboard --> CreateTask[Create New Task Modal]
    Dashboard --> ViewTask[Task Details Drawer]
    Dashboard --> Filters[Apply Filters/Sort]
    
    ViewTask --> EditTask[Edit Task]
    ViewTask --> UploadDocs[Upload Attachments]
    
    Dashboard --> RoleCheck{Is Admin?}
    RoleCheck -->|Yes| AdminPanel[User Management Panel]
    AdminPanel --> ManageUsers[Create/Edit/Delete Users]
```
