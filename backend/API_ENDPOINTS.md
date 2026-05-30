# BMS (Booking Management System) - API Endpoints Documentation

## Base URL
```
http://localhost:PORT
```

---

## 🔐 Authentication Endpoints

### 1. **User Signup**
- **URL**: `/auth/signup`
- **Method**: `POST`
- **Auth Required**: ❌ No
- **Description**: Register a new user account

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Success Response (201)**:
```json
{
  "message": "User created successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### 2. **User Login**
- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth Required**: ❌ No
- **Description**: Login with email and password

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Success Response (200)**:
```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### 3. **Refresh Token**
- **URL**: `/auth/refresh`
- **Method**: `POST`
- **Auth Required**: ❌ No
- **Description**: Get a new access token using refresh token

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Success Response (200)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### 4. **Logout**
- **URL**: `/auth/logout`
- **Method**: `POST`
- **Auth Required**: ❌ No
- **Description**: Logout user (invalidate refresh token)

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Success Response (200)**:
```json
{
  "message": "Logged out"
}
```

---

## 🎬 Movie Endpoints

### 5. **Get All Movies**
- **URL**: `/api/v1/movies`
- **Method**: `GET`
- **Auth Required**: ❌ No
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
- **Description**: Fetch paginated list of all movies

**Example Request**:
```
GET /api/v1/movies?page=1&limit=10
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "title": "Avengers",
      "duration": 180,
      "language": "English",
      "genre": "Action",
      "release_date": "2024-01-15",
      "poster_url": "https://example.com/poster.jpg"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50
  }
}
```

---

### 6. **Get Movie by ID**
- **URL**: `/api/v1/movies/:id`
- **Method**: `GET`
- **Auth Required**: ❌ No
- **Path Parameters**:
  - `id` (required): Movie UUID
- **Description**: Fetch details of a specific movie

**Example Request**:
```
GET /api/v1/movies/550e8400-e29b-41d4-a716-446655440000
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Avengers",
    "duration": 180,
    "language": "English",
    "genre": "Action",
    "release_date": "2024-01-15",
    "poster_url": "https://example.com/poster.jpg"
  }
}
```

---

### 7. **Create Movie** ⭐ (Admin Only)
- **URL**: `/api/v1/movies`
- **Method**: `POST`
- **Auth Required**: ✅ Yes (Admin)
- **Headers**: `Authorization: Bearer <accessToken>`
- **Description**: Create a new movie (Admin only)

**Request Body**:
```json
{
  "title": "Avengers",
  "duration": 180,
  "language": "English",
  "genre": "Action",
  "release_date": "2024-01-15",
  "poster_url": "https://example.com/poster.jpg"
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Movie created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Avengers",
    "duration": 180,
    "language": "English",
    "genre": "Action",
    "release_date": "2024-01-15",
    "poster_url": "https://example.com/poster.jpg"
  }
}
```

---

## 🏢 Theatre Endpoints

### 8. **Create Theatre** ⭐ (Admin Only)
- **URL**: `/api/v1/theatres`
- **Method**: `POST`
- **Auth Required**: ✅ Yes (Admin)
- **Headers**: `Authorization: Bearer <accessToken>`
- **Description**: Create a new theatre (Admin only)

**Request Body**:
```json
{
  "name": "PVR Cinemas",
  "city": "Mumbai",
  "address": "123 Main Street, Downtown Mall, Mumbai 400001"
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Theatre created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "PVR Cinemas",
    "city": "Mumbai",
    "address": "123 Main Street, Downtown Mall, Mumbai 400001"
  }
}
```

---

## 📺 Screen Endpoints

### 9. **Create Screen** ⭐ (Admin Only)
- **URL**: `/api/v1/screens`
- **Method**: `POST`
- **Auth Required**: ✅ Yes (Admin)
- **Headers**: `Authorization: Bearer <accessToken>`
- **Description**: Create a new screen in a theatre (Admin only)

**Request Body**:
```json
{
  "theatre_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Screen 1",
  "capacity": 100
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Screen created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "theatre_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Screen 1",
    "capacity": 100
  }
}
```

---

## 🎞️ Show Endpoints

### 10. **Create Show** ⭐ (Admin Only)
- **URL**: `/api/v1/shows`
- **Method**: `POST`
- **Auth Required**: ✅ Yes (Admin)
- **Headers**: `Authorization: Bearer <accessToken>`
- **Description**: Create a new show (Admin only)

**Request Body**:
```json
{
  "movie_id": "a3a08ea1-c371-4d84-be1d-b8f8dc3b6b10",
  "screen_id": "fa077aa3-36d8-4d4a-808d-94c1991d479b",
  "show_time": "2026-05-02T00:30:00Z",
  "pricing": {
    "silver": 200
  }
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Show created successfully",
  "data": {
    "id": "fecaeb31-d5e7-4754-91b9-04bb756d1819",
    "movie_id": "a3a08ea1-c371-4d84-be1d-b8f8dc3b6b10",
    "screen_id": "fa077aa3-36d8-4d4a-808d-94c1991d479b",
    "show_time": "2026-05-02T00:30:00Z",
    "pricing": {
      "silver": 200
    }
  }
}
```

---

### 11. **Get All Shows**
- **URL**: `/api/v1/shows`
- **Method**: `GET`
- **Auth Required**: ❌ No
- **Query Parameters**:
  - `movie_id` (required): Movie UUID
  - `city` (required): City name
- **Description**: Get all shows for a movie in a specific city

**Example Request**:
```
GET http://localhost:8000/api/v1/shows?movie_id=a3a08ea1-c371-4d84-be1d-b8f8dc3b6b10&city=Bangalore
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "movie_id": "550e8400-e29b-41d4-a716-446655440000",
      "screen_id": "550e8400-e29b-41d4-a716-446655440001",
      "show_time": "2024-02-15T18:30:00Z",
      "pricing": {
        "standard": 250,
        "premium": 350,
        "luxury": 500
      },
      "available_seats": 85
    }
  ]
}
```

---

### 12. **Get Seats for a Show**
- **URL**: `/api/v1/shows/:id/seats`
- **Method**: `GET`
- **Auth Required**: ❌ No
- **Path Parameters**:
  - `id` (required): Show UUID
- **Description**: Get all seats and their status for a show

**Example Request**:
```
http://localhost:8000/api/v1/shows/fecaeb31-d5e7-4754-91b9-04bb756d1819/seats
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "show_id": "550e8400-e29b-41d4-a716-446655440002",
      "seat_number": "A1",
      "category": "standard",
      "is_available": true
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "show_id": "550e8400-e29b-41d4-a716-446655440002",
      "seat_number": "A2",
      "category": "premium",
      "is_available": false
    }
  ]
}
```

---

## 💺 Seat Endpoints

### 13. **Bulk Create Seats** ⭐ (Admin Only)
- **URL**: `/api/v1/seats/bulk`
- **Method**: `POST`
- **Auth Required**: ✅ Yes (Admin)
- **Headers**: `Authorization: Bearer <accessToken>`
- **Description**: Create multiple seats for a show in bulk

**Request Body**:
```json
{
  "show_id": "550e8400-e29b-41d4-a716-446655440002",
  "seats": [
    {
      "seat_number": "A1",
      "category": "standard"
    },
    {
      "seat_number": "A2",
      "category": "premium"
    },
    {
      "seat_number": "A3",
      "category": "luxury"
    }
  ]
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Seats created successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "show_id": "550e8400-e29b-41d4-a716-446655440002",
      "seat_number": "A1",
      "category": "standard",
      "is_available": true
    }
  ]
}
```

---

## 🔒 Seat Lock Endpoints

### 14. **Lock Seats** ⭐ (Auth Required)
- **URL**: `/seats/lock`
- **Method**: `POST`
- **Auth Required**: ✅ Yes
- **Headers**: `Authorization: Bearer <accessToken>`
- **Description**: Lock seats for a specific show (holds for 5 minutes)

**Request Body**:
```json
{
  "showId": "550e8400-e29b-41d4-a716-446655440002",
  "seatIds": [
    "550e8400-e29b-41d4-a716-446655440003",
    "550e8400-e29b-41d4-a716-446655440004"
  ]
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Seats locked for 5 minutes",
  "lockedUntil": 1708078200000
}
```

**Error Response (409)** - If seats unavailable:
```json
{
  "success": false,
  "message": "Some seats are already booked or locked",
  "unavailableSeats": [
    "550e8400-e29b-41d4-a716-446655440004"
  ]
}
```

---

### 15. **Unlock Seats** ⭐ (Auth Required)
- **URL**: `/seats/unlock`
- **Method**: `POST`
- **Auth Required**: ✅ Yes
- **Headers**: `Authorization: Bearer <accessToken>`
- **Description**: Unlock previously locked seats

**Request Body**:
```json
{
  "showId": "550e8400-e29b-41d4-a716-446655440002",
  "seatIds": [
    "550e8400-e29b-41d4-a716-446655440003",
    "550e8400-e29b-41d4-a716-446655440004"
  ]
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Seats unlocked successfully"
}
```

---

## Testing Tips

### Using cURL:

**Login first to get token:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Use token for protected endpoints:**
```bash
curl -X POST http://localhost:3000/api/v1/movies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Avengers",
    "duration": 180,
    "language": "English",
    "genre": "Action",
    "release_date": "2024-01-15",
    "poster_url": "https://example.com/poster.jpg"
  }'
```

### Using Postman:

1. Create a new collection
2. Set up environment variable: `base_url = http://localhost:3000`
3. Set up environment variable: `token = <accessToken>`
4. For each protected endpoint, add header: `Authorization: Bearer {{token}}`
5. Use the request bodies provided above

### Using Thunder Client / REST Client:

```
### Login
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

### Get All Movies
GET http://localhost:3000/api/v1/movies?page=1&limit=10
Content-Type: application/json

### Lock Seats (requires auth)
POST http://localhost:3000/seats/lock
Content-Type: application/json
Authorization: Bearer {{accessToken}}

{
  "showId": "550e8400-e29b-41d4-a716-446655440002",
  "seatIds": ["550e8400-e29b-41d4-a716-446655440003"]
}
```

---

## Status Codes Legend

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request body/parameters |
| 401 | Unauthorized - Invalid/missing authentication |
| 403 | Forbidden - Authenticated but not authorized (e.g., non-admin) |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource conflict (e.g., seats already booked) |
| 500 | Server Error - Internal server error |
| 503 | Service Unavailable - Service temporarily unavailable |

---

## Notes

- ⭐ = Admin-only endpoints or requires authentication
- All timestamps are in ISO 8601 format (UTC)
- All IDs are UUIDs
- UUIDs must be valid (version 4 recommended)
- Seat locks expire after 5 minutes
- Pagination defaults: page=1, limit=10
