# API Planning

Base URL: `/api/v1`

## Authentication

| Method | Endpoint | Description | Auth Required | Role | Request Body | Response |
|--------|----------|-------------|---------------|------|--------------|----------|
| POST | `/auth/register` | Register a new user | No | Any | Email, Password, Name | `201`, User data & JWT |
| POST | `/auth/login` | Authenticate user | No | Any | Email, Password | `200`, User data & JWT |
| POST | `/auth/refresh` | Get new access token | No | Any | Refresh Token | `200`, New Access Token |
| GET | `/auth/me` | Get current user profile | Yes | Any | None | `200`, User data |

## Users Management

| Method | Endpoint | Description | Auth Required | Role | Request Body | Response |
|--------|----------|-------------|---------------|------|--------------|----------|
| GET | `/users` | Get all users (paginated) | Yes | ADMIN | None | `200`, Array of Users |
| GET | `/users/:id` | Get specific user | Yes | ADMIN | None | `200`, User |
| PUT | `/users/:id` | Update user details/role| Yes | ADMIN | Name, Role, etc | `200`, Updated User |
| DELETE | `/users/:id` | Soft delete user | Yes | ADMIN | None | `204 No Content` |

## Task Management

| Method | Endpoint | Description | Auth Required | Role | Query Params | Request Body | Response |
|--------|----------|-------------|---------------|------|--------------|--------------|----------|
| GET | `/tasks` | List tasks | Yes | Any | `page`, `limit`, `status`, `assignee`, `sortBy` | None | `200`, Paginated Tasks |
| POST | `/tasks` | Create new task | Yes | Any | Title, Desc, Priority, Assignee | `201`, Task |
| GET | `/tasks/:id` | Get task details | Yes | Any | None | None | `200`, Task |
| PUT | `/tasks/:id` | Update task | Yes | Any | Status, Desc, Assignee, etc | `200`, Updated Task |
| DELETE | `/tasks/:id` | Delete task | Yes | Any | None | None | `204 No Content` |

## File Uploads

| Method | Endpoint | Description | Auth Required | Role | Request Body | Response |
|--------|----------|-------------|---------------|------|--------------|----------|
| POST | `/tasks/:taskId/attachments` | Upload PDF (max 3) | Yes | Any | FormData (file) | `201`, Attachment |
| DELETE | `/attachments/:id` | Delete attachment | Yes | Any | None | `204 No Content` |
| GET | `/attachments/:id/download` | Download file | Yes | Any | None | File Stream |
