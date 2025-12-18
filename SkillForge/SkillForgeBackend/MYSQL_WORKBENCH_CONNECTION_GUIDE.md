# MySQL Workbench Connection Guide - SkillForge Backend

## Overview

Your Spring Boot backend uses **JPA/Hibernate** which can automatically create tables, OR you can create them manually in MySQL Workbench. This guide covers both approaches.

---

## Option 1: Automatic Table Creation (Recommended)

### Step 1: Create Database in MySQL Workbench

1. **Open MySQL Workbench 8.0 CE**

2. **Connect to your MySQL server:**
   - Click on your local connection (usually `root@localhost`)
   - Enter your MySQL root password

3. **Create the database:**
   ```sql
   CREATE DATABASE skillforge_db;
   ```

4. **Verify database was created:**
   ```sql
   SHOW DATABASES;
   ```
   You should see `skillforge_db` in the list.

5. **Select the database:**
   ```sql
   USE skillforge_db;
   ```

---

### Step 2: Configure Backend Connection

1. **Open:** `SkillForge/SkillForgeBackend/src/main/resources/application.properties`

2. **Update MySQL connection settings:**
   ```properties
   # MySQL Database Configuration
   spring.datasource.url=jdbc:mysql://localhost:3306/skillforge_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=YOUR_MYSQL_PASSWORD_HERE
   spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
   ```

3. **Replace `YOUR_MYSQL_PASSWORD_HERE`** with your actual MySQL root password

4. **Save the file**

---

### Step 3: Start Backend (Tables Auto-Created)

1. **Start your backend:**
   ```bash
   cd SkillForge/SkillForgeBackend
   mvn spring-boot:run
   ```

2. **Watch the console** - You'll see SQL queries creating tables:
   ```
   Hibernate: create table users ...
   Hibernate: create table courses ...
   Hibernate: create table enrollments ...
   ```

3. **Verify in MySQL Workbench:**
   - Refresh the database in Workbench
   - Expand `skillforge_db` → `Tables`
   - You should see all tables created automatically:
     - `users`
     - `courses`
     - `enrollments`
     - `batches`
     - `videos`
     - `exams`
     - `exam_attempts`

---

## Option 2: Manual Table Creation

If you prefer to create tables manually in MySQL Workbench:

### Step 1: Create Database
```sql
CREATE DATABASE skillforge_db;
USE skillforge_db;
```

### Step 2: Create Tables Manually

Run these SQL scripts in MySQL Workbench:

```sql
-- Users Table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at DATETIME,
    updated_at DATETIME
);

-- Courses Table
CREATE TABLE courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id BIGINT NOT NULL,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (instructor_id) REFERENCES users(id)
);

-- Enrollments Table
CREATE TABLE enrollments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    progress_percentage DOUBLE DEFAULT 0.0,
    enrolled_at DATETIME,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Batches Table
CREATE TABLE batches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id BIGINT NOT NULL,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (instructor_id) REFERENCES users(id)
);

-- Videos Table
CREATE TABLE videos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    course_id BIGINT NOT NULL,
    video_type VARCHAR(20),
    file_path VARCHAR(500),
    external_url VARCHAR(1000),
    uploaded_at DATETIME,
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Exams Table
CREATE TABLE exams (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    course_id BIGINT NOT NULL,
    instructor_id BIGINT,
    start_time DATETIME,
    end_time DATETIME,
    duration_minutes INT,
    total_questions INT,
    max_attempts INT DEFAULT 1,
    negative_marking BOOLEAN DEFAULT FALSE,
    negative_mark_value DOUBLE DEFAULT 0.25,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (instructor_id) REFERENCES users(id)
);

-- Exam Attempts Table
CREATE TABLE exam_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    exam_id BIGINT NOT NULL,
    score DOUBLE,
    percentage DOUBLE,
    total_questions INT,
    correct_answers INT,
    wrong_answers INT,
    attempted_at DATETIME,
    time_taken_minutes INT,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (exam_id) REFERENCES exams(id)
);

-- Batch Students (Many-to-Many)
CREATE TABLE batch_students (
    batch_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    PRIMARY KEY (batch_id, student_id),
    FOREIGN KEY (batch_id) REFERENCES batches(id),
    FOREIGN KEY (student_id) REFERENCES users(id)
);

-- Batch Courses (Many-to-Many)
CREATE TABLE batch_courses (
    batch_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    PRIMARY KEY (batch_id, course_id),
    FOREIGN KEY (batch_id) REFERENCES batches(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);
```

### Step 3: Update Backend Configuration

**Change `application.properties`:**
```properties
# Change from 'update' to 'validate' or 'none'
spring.jpa.hibernate.ddl-auto=validate
```

This tells Hibernate to **validate** existing tables instead of creating them.

---

## Connection Testing

### Test Connection in MySQL Workbench

1. **Open MySQL Workbench**
2. **Click "Test Connection"** on your connection
3. **Should show:** "Successfully made the MySQL connection"

### Test Connection from Backend

1. **Start backend:**
   ```bash
   mvn spring-boot:run
   ```

2. **Look for these messages:**
   ```
   HikariPool-1 - Starting...
   HikariPool-1 - Start completed.
   ```

3. **If connection fails, you'll see:**
   ```
   Communications link failure
   Access denied for user 'root'@'localhost'
   ```

---

## Common Connection Issues

### Issue 1: Access Denied
**Error:** `Access denied for user 'root'@'localhost'`

**Solution:**
- Check password in `application.properties`
- Verify MySQL root password is correct
- Try resetting MySQL password if needed

### Issue 2: Connection Refused
**Error:** `Communications link failure`

**Solution:**
- Check MySQL server is running
- Verify port 3306 is correct
- Check firewall settings

### Issue 3: Database Not Found
**Error:** `Unknown database 'skillforge_db'`

**Solution:**
- Create database first: `CREATE DATABASE skillforge_db;`
- Or use `createDatabaseIfNotExist=true` in connection URL

### Issue 4: Timezone Error
**Error:** `The server time zone value 'XYZ' is unrecognized`

**Solution:**
- Already fixed in connection URL: `serverTimezone=UTC`
- If still occurs, add to MySQL: `SET GLOBAL time_zone = '+00:00';`

---

## Connection URL Breakdown

```properties
jdbc:mysql://localhost:3306/skillforge_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
```

- `jdbc:mysql://` - JDBC protocol for MySQL
- `localhost:3306` - MySQL server address and port
- `skillforge_db` - Database name
- `createDatabaseIfNotExist=true` - Auto-create database if missing
- `useSSL=false` - Disable SSL (for local development)
- `serverTimezone=UTC` - Set timezone to avoid errors

---

## Recommended Setup

**For Development:**
- Use **Option 1 (Automatic)** - Let Hibernate create tables
- Set `spring.jpa.hibernate.ddl-auto=update`
- Tables auto-created on first run
- Schema updates automatically when entities change

**For Production:**
- Use **Option 2 (Manual)** - Create tables manually
- Set `spring.jpa.hibernate.ddl-auto=validate`
- More control over database schema
- Better for production environments

---

## Quick Start Checklist

- [ ] MySQL Workbench installed and running
- [ ] MySQL server running on port 3306
- [ ] Database `skillforge_db` created
- [ ] Password updated in `application.properties`
- [ ] Backend starts without connection errors
- [ ] Tables visible in MySQL Workbench

---

## Verification Steps

1. **In MySQL Workbench:**
   ```sql
   USE skillforge_db;
   SHOW TABLES;
   ```
   Should show all 7+ tables

2. **In Backend Console:**
   - Look for: `Started SkillForgeBackendApplication`
   - No connection errors
   - SQL queries visible (if `show-sql=true`)

3. **Test API:**
   - Register a user via Postman
   - Check MySQL Workbench: `SELECT * FROM users;`
   - Should see the new user record

---

## Next Steps

Once connected:
1. ✅ Backend can read/write to database
2. ✅ All API endpoints work with database
3. ✅ Data persists across restarts
4. ✅ You can view data in MySQL Workbench

**Your backend is now fully connected to MySQL! 🎉**
