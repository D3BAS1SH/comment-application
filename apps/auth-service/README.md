# Authentication Service Documentation

## Table of Contents

1. [What is this service?](#what-is-this-service)
2. [How to set up the service](#how-to-set-up-the-service)
3. [Available Routes (API Endpoints)](#available-routes-api-endpoints)
4. [Data Structures (DTOs)](#data-structures-dtos)
5. [Business Logic (Services)](#business-logic-services)
6. [Database Models](#database-models)
7. [Security Features](#security-features)
8. [Environment Variables](#environment-variables)
9. [Error Messages](#error-messages)

---

## What is this service?

The **Authentication Service** is like a security guard for our application. It handles everything related to user accounts - creating new accounts, checking if users are who they say they are (login), and making sure they can access the right things.

Think of it like this:

- When you create a social media account → **Registration**
- When you log into that account → **Login**
- When you get logged out automatically → **Token expiration**
- When you forgot your password → **Password reset**

This service does all of that and more!

### Key Features:

- ✅ **User Registration** - Create new user accounts
- ✅ **Email Verification** - Confirm email addresses are real
- ✅ **User Login/Logout** - Secure sign in and sign out
- ✅ **Password Reset** - Help users who forgot passwords
- ✅ **Token Management** - Keep users logged in securely
- ✅ **File Upload Support** - Profile picture uploads via Cloudinary
- ✅ **Security Protection** - Prevents fake emails and malicious attacks

---

## How to set up the service

### Prerequisites (Things you need first):

- Node.js installed on your computer
- A PostgreSQL database (we use Neon cloud database)
- An email service account (for sending verification emails)
- A Cloudinary account (for profile picture uploads)

### Installation Steps:

1. **Install dependencies** (like downloading all the tools we need):

```bash
pnpm install
```

2. **Set up your environment variables** (secret configuration):
   Create a `.env` file and add your settings (see [Environment Variables](#environment-variables) section)

3. **Set up the database**:

```bash
npx prisma migrate deploy
npx prisma generate
```

4. **Start the service**:

```bash
# For development (with auto-restart when you make changes)
pnpm run start:dev

# For production (final version)
pnpm run start:prod
```

The service will start running on port 3033 (or whatever you set in AUTH_PORT).

---

## Available Routes (API Endpoints)

Think of routes as different doors you can knock on to ask the service to do something. Each door handles a specific task.

### 1. Health Check Route

**What it does**: Checks if the service is running properly

- **URL**: `GET /`
- **Purpose**: Like asking "Are you awake?" to the service
- **Response**: Returns "Hello World!" if everything is working

### 2. User Registration Route

**What it does**: Creates a new user account

- **URL**: `POST /register`
- **Purpose**: Sign up new users
- **What you send**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@gmail.com",
    "password": "mySecretPassword123",
    "imageUrl": "https://example.com/profile.jpg" (optional)
  }
  ```
- **What happens**:
  1. Checks if email is already used
  2. Makes sure password is strong enough (at least 8 characters)
  3. Sends verification email
  4. Creates account (but it's not active until verified)

### 3. Email Verification Route

**What it does**: Confirms user's email address is real

- **URL**: `GET /verify-email?token=abc123xyz`
- **Purpose**: Activate account after clicking email link
- **What you send**: A special token (sent via email)
- **What happens**:
  1. Checks if token is valid and not expired
  2. Marks user account as verified
  3. Allows user to log in

### 4. User Login Route

**What it does**: Signs in a user who already has an account

- **URL**: `POST /login`
- **Purpose**: Let verified users access their account
- **What you send**:
  ```json
  {
    "email": "john.doe@gmail.com",
    "password": "mySecretPassword123"
  }
  ```
- **What you get back**:
  ```json
  {
    "id": "user123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@gmail.com",
    "isVerified": true,
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### 5. Token Refresh Route

**What it does**: Gets a new access token without logging in again

- **URL**: `POST /refresh`
- **Purpose**: Keep users logged in even after their session expires
- **What you send**: Your refresh token (usually automatic)
- **What happens**:
  1. Checks if refresh token is still valid
  2. Creates new access and refresh tokens
  3. Keeps you logged in

### 6. User Logout Route

**What it does**: Signs out a user

- **URL**: `POST /logout`
- **Purpose**: Securely end user session
- **What happens**:
  1. Blacklists your current access token
  2. Removes your refresh token
  3. Forces you to log in again next time

### 7. Forgot Password Route

**What it does**: Starts password reset process

- **URL**: `POST /forget-password`
- **Purpose**: Help users who forgot their password
- **What you send**:
  ```json
  {
    "email": "john.doe@gmail.com"
  }
  ```
- **What happens**:
  1. Checks if account exists and is verified
  2. Sends password reset link to email
  3. Link is valid for 30 minutes

### 8. Reset Password Route

**What it does**: Actually changes the password

- **URL**: `POST /reset-password`
- **Purpose**: Set new password using reset link
- **What you send**:
  ```json
  {
    "password": "myNewSecretPassword456",
    "token": "reset-token-from-email"
  }
  ```
- **What happens**:
  1. Checks if reset token is valid
  2. Updates password with new one
  3. Removes reset token (can only be used once)

### 9. File Upload URL Route

**What it does**: Gets a secure link for uploading profile pictures

- **URL**: `GET /cloudinary-utility/upload-url`
- **Purpose**: Prepare for profile picture upload
- **What you get back**: A special URL you can use to upload images to Cloudinary

---

## Data Structures (DTOs)

DTOs are like forms that define exactly what information is needed for each action. Think of them as templates that make sure all required information is provided in the correct format.

### CreateUserDto (Registration Form)

**Used for**: Creating new user accounts

```typescript
{
  firstName: string,    // Must be 3-20 characters
  lastName: string,     // Must be under 20 characters
  email: string,        // Must be valid email, no disposable emails
  password: string,     // Must be at least 8 characters
  imageUrl?: string     // Optional profile picture URL
}
```

### LoginUser (Login Form)

**Used for**: User sign in

```typescript
{
  email: string,        // Must be valid email
  password: string      // Must be at least 8 characters
}
```

### ForgetPasswordBodyDto (Forgot Password Form)

**Used for**: Starting password reset

```typescript
{
  email: string; // Must be valid email
}
```

### ResetPasswordBodyDto (Reset Password Form)

**Used for**: Completing password reset

```typescript
{
  password: string,     // Must be at least 8 characters
  token: string         // Reset token from email
}
```

### LoginResponseDto (Login Success Response)

**What you get back after successful login**:

```typescript
{
  id: string,           // Unique user identifier
  firstName: string,    // User's first name
  lastName: string,     // User's last name
  email: string,        // User's email
  imageUrl?: string,    // Profile picture URL (if any)
  createdAt?: Date,     // When account was created
  isVerified: boolean,  // Whether email is verified
  accessToken: string,  // Token for accessing protected routes
  refreshToken: string  // Token for getting new access tokens
}
```

### UserResponse (User Information)

**Basic user information (without sensitive data)**:

```typescript
{
  id: string,           // Unique user identifier
  firstName: string,    // User's first name
  lastName: string,     // User's last name
  email: string,        // User's email
  imageUrl?: string,    // Profile picture URL (if any)
  createdAt?: Date,     // When account was created
  isVerified: boolean   // Whether email is verified
  // Note: password and deletedAt are hidden for security
}
```

---

## Business Logic (Services)

Services contain the actual "brains" of the application - the step-by-step instructions for how to handle each request.

### UsersService

**Main responsibilities**: Handle all user-related operations

#### Key Methods:

**create(userInfo)** - Register New User

1. Check if email is already taken
2. Hash (encrypt) the password for security
3. Create user record in database
4. Generate verification token
5. Send verification email
6. Return success message

**verifyEmailToken(token)** - Verify Email Address

1. Find token in database
2. Check if token hasn't expired
3. Mark user as verified
4. Delete used token
5. Return success message

**login(credentials)** - Sign In User

1. Find user by email
2. Check if account is verified
3. Verify password matches
4. Check device limit (max 3 devices)
5. Generate access and refresh tokens
6. Return user info with tokens

**logout(userInfo, accessToken)** - Sign Out User

1. Add access token to blacklist
2. Remove refresh token from database
3. Calculate remaining token time
4. Return success message

**forgotPasswordInit(email)** - Start Password Reset

1. Find user by email
2. Check if account is verified
3. Generate reset token
4. Send reset email
5. Return success message

**resetPassword(newPassword, token)** - Complete Password Reset

1. Verify reset token is valid
2. Hash new password
3. Update user's password
4. Delete reset token
5. Return success message

### TokenService

**Main responsibilities**: Handle all token-related operations

#### Key Methods:

**generateTokens(user)** - Create New Tokens

1. Check user's device limit
2. Create unique session identifier
3. Generate access token (short-lived)
4. Generate refresh token (long-lived)
5. Save tokens in database
6. Return both tokens

**refreshToken(oldToken)** - Get New Access Token

1. Verify refresh token is valid
2. Create new session identifier
3. Generate new access and refresh tokens
4. Replace old tokens in database
5. Return new tokens

**createVerificationToken(userId)** - Make Email Verification Token

1. Generate unique token
2. Set expiration time (30 minutes)
3. Remove any old verification tokens
4. Save new token in database
5. Return token for email

**verifyVerificationToken(token)** - Check Email Verification

1. Find token in database
2. Check if expired (if so, delete user)
3. Mark user as verified
4. Delete verification token
5. Return success message

---

## Database Models

The database stores all our information in organized tables. Think of each table like a spreadsheet with specific columns.

### User Table

**Stores**: All user account information

```sql
- id: Unique identifier for each user
- firstName: User's first name
- lastName: User's last name
- email: User's email address (must be unique)
- password: Encrypted password
- imageUrl: Profile picture URL
- isVerified: Whether email is confirmed (true/false)
- createdAt: When account was created
- updatedAt: When account was last modified
- deletedAt: When account was deleted (for soft deletes)
```

### VerificationToken Table

**Stores**: Email verification tokens

```sql
- id: Unique identifier
- token: The verification code
- userId: Which user this token belongs to
- expiresAt: When token becomes invalid
- createdAt: When token was created
```

### Token Table (Refresh Tokens)

**Stores**: Login session tokens

```sql
- id: Unique identifier
- refreshToken: The actual token string
- sessionTokenId: Unique session identifier
- ownerId: Which user this token belongs to
- createdAt: When token was created
```

### PasswordResetToken Table

**Stores**: Password reset tokens

```sql
- id: Unique identifier
- token: The reset code (encrypted)
- userId: Which user requested the reset
- expiresAt: When token becomes invalid
- createdAt: When token was created
```

---

## Security Features

This service takes security very seriously. Here are the protection measures in place:

### 1. Password Security

- **Hashing**: Passwords are encrypted using bcrypt before storing
- **Salt**: Each password gets a unique "salt" for extra security
- **Minimum Length**: Passwords must be at least 8 characters

### 2. Email Validation

- **Format Check**: Ensures emails look like real email addresses
- **Disposable Email Block**: Prevents use of temporary/fake email services
- **Verification Required**: Users must confirm their email before login

### 3. Token Security

- **JWT Tokens**: Uses industry-standard JSON Web Tokens
- **Short Access Tokens**: Expire quickly (configurable)
- **Refresh Tokens**: Allow secure token renewal
- **Token Blacklisting**: Logged out tokens can't be reused
- **Session Management**: Tracks and limits active sessions

### 4. Rate Limiting & Device Management

- **Device Limit**: Maximum 3 active sessions per user
- **Token Expiration**: Automatic logout after specified time
- **Unique Sessions**: Each device gets unique session identifier

### 5. Data Validation

- **Input Sanitization**: All input is validated and cleaned
- **Type Checking**: Ensures data is in correct format
- **Length Limits**: Prevents overly long inputs
- **Required Fields**: Ensures necessary information is provided

### 6. Error Handling

- **Generic Error Messages**: Don't reveal sensitive information
- **Logging**: Tracks errors for debugging (without sensitive data)
- **Graceful Failures**: Service continues running even if some requests fail

---

## Environment Variables

These are secret configuration settings that tell the service how to behave. They're kept in a `.env` file and never shared publicly.

### Required Settings:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/auth_db"

# Server Configuration
AUTH_PORT=3033
NODE_ENV=development

# JWT (Token) Security
JWT_ACCESS_SECRET="your-super-secret-access-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# Password Security
BCRYPT_SALT_NUMBER=12

# Email Service (for verification and password reset)
MAIL_HOST="smtp.gmail.com"
MAIL_PORT=587
MAIL_USER="your-email@gmail.com"
MAIL_PASS="your-app-password"
MAIL_FROM="noreply@yourapp.com"

# Token Expiration Settings
EMAIL_VERIFICATION_TOKEN_EXPIRATION_MINUTES=30

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### What each setting means:

- **DATABASE_URL**: Where to find your database
- **AUTH_PORT**: Which port the service runs on
- **JWT\_\*\_SECRET**: Secret keys for creating secure tokens
- **JWT\_\*\_EXPIRATION**: How long tokens stay valid
- **BCRYPT_SALT_NUMBER**: How many times to encrypt passwords
- **MAIL\_\***: Email service settings for sending verification emails
- **CLOUDINARY\_\***: Settings for profile picture uploads

---

## Error Messages

When something goes wrong, the service sends helpful error messages. Here are the common ones you might see:

### Registration Errors:

- `"User already exists with {email}"` - Someone already has that email
- `"Check In the email, we have sent you the verification mail"` - Verification email already sent
- `"Password must be at least of 8 character long"` - Password too short
- `"Email address from such domain are not allowed"` - Using disposable email service

### Login Errors:

- `"User with the email: {email} doesn't exists"` - No account with that email
- `"A Verification Token was sent to the email"` - Need to verify email first
- `"Your verification Token has expired! Register again"` - Verification expired
- `"Incorrect Password"` - Wrong password entered
- `"You have already logged in 3 times"` - Too many active sessions

### Token Errors:

- `"Verification token is required"` - Missing verification token
- `"Verification Token not found or invalid"` - Bad verification token
- `"Verification Token has expired"` - Verification token too old
- `"Access Denied: Invalid Refresh Token"` - Can't refresh token
- `"Exceeding Device limits"` - Too many devices logged in

### Password Reset Errors:

- `"An active password reset link is shared to your email"` - Reset already in progress
- `"Token not found or invalid token or the token is expired"` - Bad reset token
- `"Something has went wrong. Contact Admin"` - Unexpected error

### General Errors:

- `"Something went wrong"` - General error message
- `"User creation Failed for some reason"` - Database error during registration
- `"Token generation failed"` - Problem creating login tokens

---

## How Everything Works Together

1. **User Registration Flow**:
   - User fills out registration form → CreateUserDto validates data → UsersService creates account → Email sent → Account created but inactive

2. **Email Verification Flow**:
   - User clicks email link → Token verified → Account activated → User can now log in

3. **Login Flow**:
   - User enters credentials → LoginUser validates data → UsersService checks password → TokenService creates tokens → User logged in

4. **Using the Application**:
   - User makes requests → Access token checked → If valid, request processed → If expired, use refresh token

5. **Logout Flow**:
   - User logs out → Access token blacklisted → Refresh token deleted → User must log in again

6. **Password Reset Flow**:
   - User requests reset → Reset email sent → User clicks link → New password set → Old tokens invalidated

This service is designed to be secure, user-friendly, and reliable. Every feature has been carefully designed to protect user data while providing a smooth experience.
