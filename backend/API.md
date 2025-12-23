# HealthStack API Documentation

Base URL: `http://localhost:3001/api`

## Authentication

All endpoints except `/auth/register` and `/auth/login` require authentication.

Include the JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Auth Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Current User
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Food Log Endpoints

### Create Food Log
**POST** `/food-logs`

**Request Body:**
```json
{
  "foodName": "Grilled Chicken",
  "calories": 165,
  "protein": 31,
  "carbs": 0,
  "fat": 3.6,
  "fiber": 0,
  "mealType": "LUNCH",
  "servingSize": "100g",
  "notes": "Grilled with olive oil",
  "loggedAt": "2024-01-01T12:30:00.000Z" // optional, defaults to now
}
```

**Meal Types:** `BREAKFAST`, `LUNCH`, `DINNER`, `SNACK`

**Response:**
```json
{
  "message": "Food log created successfully",
  "foodLog": {
    "id": "uuid",
    "userId": "uuid",
    "foodName": "Grilled Chicken",
    "calories": 165,
    "protein": 31,
    "carbs": 0,
    "fat": 3.6,
    "fiber": 0,
    "mealType": "LUNCH",
    "servingSize": "100g",
    "notes": "Grilled with olive oil",
    "loggedAt": "2024-01-01T12:30:00.000Z",
    "createdAt": "2024-01-01T12:30:00.000Z"
  }
}
```

### Get Food Logs
**GET** `/food-logs?startDate=2024-01-01&endDate=2024-01-31&mealType=BREAKFAST`

**Query Parameters:**
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string
- `mealType` (optional): BREAKFAST, LUNCH, DINNER, SNACK

**Response:**
```json
{
  "foodLogs": [
    {
      "id": "uuid",
      "userId": "uuid",
      "foodName": "Grilled Chicken",
      "calories": 165,
      "protein": 31,
      "carbs": 0,
      "fat": 3.6,
      "fiber": 0,
      "mealType": "LUNCH",
      "servingSize": "100g",
      "loggedAt": "2024-01-01T12:30:00.000Z"
    }
  ],
  "totals": {
    "calories": 165,
    "protein": 31,
    "carbs": 0,
    "fat": 3.6,
    "fiber": 0
  },
  "count": 1
}
```

### Get Single Food Log
**GET** `/food-logs/:id`

**Response:**
```json
{
  "foodLog": {
    "id": "uuid",
    "foodName": "Grilled Chicken",
    "calories": 165,
    // ... full food log object
  }
}
```

### Update Food Log
**PUT** `/food-logs/:id`

**Request Body:** (all fields optional)
```json
{
  "foodName": "Updated name",
  "calories": 200,
  "notes": "Updated notes"
}
```

**Response:**
```json
{
  "message": "Food log updated successfully",
  "foodLog": {
    // ... updated food log object
  }
}
```

### Delete Food Log
**DELETE** `/food-logs/:id`

**Response:**
```json
{
  "message": "Food log deleted successfully"
}
```

---

## Exercise Endpoints

### Create Exercise
**POST** `/exercises`

**Request Body:**
```json
{
  "exerciseName": "Morning Run",
  "exerciseType": "CARDIO",
  "duration": 30,
  "calories": 280,
  "distance": 5.0,
  "intensity": "MODERATE",
  "notes": "Felt good",
  "loggedAt": "2024-01-01T07:00:00.000Z" // optional
}
```

**Exercise Types:** `CARDIO`, `STRENGTH`, `FLEXIBILITY`, `SPORTS`, `OTHER`
**Intensity Levels:** `LOW`, `MODERATE`, `HIGH`

**Response:**
```json
{
  "message": "Exercise logged successfully",
  "exercise": {
    "id": "uuid",
    "userId": "uuid",
    "exerciseName": "Morning Run",
    "exerciseType": "CARDIO",
    "duration": 30,
    "calories": 280,
    "distance": 5.0,
    "intensity": "MODERATE",
    "notes": "Felt good",
    "loggedAt": "2024-01-01T07:00:00.000Z",
    "createdAt": "2024-01-01T07:00:00.000Z"
  }
}
```

### Get Exercises
**GET** `/exercises?startDate=2024-01-01&endDate=2024-01-31&exerciseType=CARDIO`

**Query Parameters:**
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string
- `exerciseType` (optional): CARDIO, STRENGTH, FLEXIBILITY, SPORTS, OTHER

**Response:**
```json
{
  "exercises": [
    {
      "id": "uuid",
      "exerciseName": "Morning Run",
      "exerciseType": "CARDIO",
      "duration": 30,
      "calories": 280,
      "distance": 5.0,
      "intensity": "MODERATE",
      "loggedAt": "2024-01-01T07:00:00.000Z"
    }
  ],
  "totals": {
    "duration": 30,
    "calories": 280,
    "distance": 5.0
  },
  "count": 1
}
```

### Get Single Exercise
**GET** `/exercises/:id`

### Update Exercise
**PUT** `/exercises/:id`

### Delete Exercise
**DELETE** `/exercises/:id`

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message"
}
```

**Common Status Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found
- `409` - Conflict (duplicate email, etc.)
- `500` - Internal Server Error

**Validation Error Format:**
```json
{
  "error": "Validation error",
  "details": [
    {
      "path": "email",
      "message": "Invalid email address"
    }
  ]
}
```

---

## Rate Limiting

API is rate-limited to **100 requests per 15 minutes** per IP address.

---

## Demo Account

For testing, use these credentials:

```
Email: demo@healthstack.com
Password: Demo1234
```
