# Correct JSON Formats for Authentication API

## **Issue Fixed:** JSON Structure Error

The error you encountered was due to incorrect JSON nesting. Here are the correct formats for each endpoint:

---

## **1. User Signup**
**Endpoint:** `POST /auth/signup`

✅ **Correct JSON:**
```json
{
  "email": "yonalem21@gmail.com",
  "password": "MTfw7eGbKR8APj@",
  "first_name": "Yonas",
  "last_name": "Alem"
}
```

**Complete curl command:**
```bash
curl -X POST "http://localhost:8000/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "yonalem21@gmail.com",
    "password": "MTfw7eGbKR8APj@",
    "first_name": "Yonas",
    "last_name": "Alem"
  }'
```

---

## **2. User Login**
**Endpoint:** `POST /auth/login`

✅ **Correct JSON:**
```json
{
  "email": "yonalem21@gmail.com",
  "password": "MTfw7eGbKR8APj@"
}
```

**Complete curl command:**
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "yonalem21@gmail.com",
    "password": "MTfw7eGbKR8APj@"
  }'
```

---

## **3. Password Reset Request**
**Endpoint:** `POST /auth/reset-password`

✅ **Correct JSON:**
```json
{
  "email": "yonalem21@gmail.com"
}
```

**Complete curl command:**
```bash
curl -X POST "http://localhost:8000/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "yonalem21@gmail.com"
  }'
```

---

## **4. Password Reset Confirmation**
**Endpoint:** `POST /auth/reset-password/confirm`

✅ **Correct JSON:**
```json
{
  "token": "reset_token_here",
  "new_password": "newpassword123"
}
```

**Complete curl command:**
```bash
curl -X POST "http://localhost:8000/auth/reset-password/confirm" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "reset_token_here",
    "new_password": "newpassword123"
  }'
```

---

## **5. Get Current User Profile**
**Endpoint:** `GET /auth/me` (No JSON body, uses Authorization header)

✅ **Correct format:**
```bash
curl -X GET "http://localhost:8000/auth/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## **6. User Logout**
**Endpoint:** `POST /auth/logout` (No JSON body, uses Authorization header)

✅ **Correct format:**
```bash
curl -X POST "http://localhost:8000/auth/logout" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## **Common JSON Mistakes to Avoid:**

❌ **Wrong - Nested structure:**
```json
{
  "email": {
    "email": "user@example.com",
    "password": "password123"
  }
}
```

❌ **Wrong - Missing quotes:**
```json
{
  email: "user@example.com",
  password: "password123"
}
```

❌ **Wrong - Trailing comma:**
```json
{
  "email": "user@example.com",
  "password": "password123",
}
```

✅ **Correct - Flat structure:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

---

## **Frontend Integration**

If you're using the frontend authentication system we built, the JSON is handled automatically by the `authService`. The service methods handle the correct JSON structure:

```typescript
// Login
await authService.login({
  email: "yonalem21@gmail.com",
  password: "MTfw7eGbKR8APj@"
});

// Signup
await authService.signup({
  email: "yonalem21@gmail.com",
  password: "MTfw7eGbKR8APj@",
  first_name: "Yonas",
  last_name: "Alem"
});
```

---

## **Testing Your Specific Case**

Based on your email and password, here are the working commands:

**Login Test:**
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "yonalem21@gmail.com",
    "password": "MTfw7eGbKR8APj@"
  }'
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "yonalem21@gmail.com",
    "first_name": "Yonas",
    "last_name": "Alem",
    "created_at": "2025-08-06T20:42:34.521254",
    "is_active": true
  }
}
```

The authentication system is working correctly - the issue was just the JSON format structure!
