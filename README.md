# 🚀 Blog API (NestJS + Prisma)

## 📦 Tech Stack

- NestJS
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Swagger
- Jest (Unit + E2E)

---

## ⚙️ Setup

```bash
pnpm install
```

---

## 🔐 Environment Variables

Create .env file:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/blog_db
JWT_SECRET=supersecretkey
PORT=3000
```

---

## 🗄️ Database

Run migrations:

```bash
npx prisma migrate dev
```

Seed (optional):

```bash
npx prisma db seed
```

---

## ▶️ Run Application

```bash
pnpm run start:dev
```

---

## 📚 API Documentation

Swagger UI:

```bash
http://localhost:3000/swagger/api/document
```

---

## 🔑 Authentication

Register

```bash
POST /auth/register
```

Login

```bash
POST /auth/login
```

Use returned token:

```bash
Authorization: Bearer <access_token>
```

Logout

```bash
POST /auth/logout
```

---

## 📝 Posts API

- POST /posts → Create post (Auth)
- GET /posts → List posts (pagination + search)
- GET /posts/:slug → Get single post
- PATCH /posts/:uuid → Update post (owner/admin)
- DELETE /posts/:uuid → Delete post (owner/admin)
- PATCH /posts/:uuid/publish → Toggle publish (ADMIN)

---

## 💬 Comments API

- POST /comments/posts/:postId/comments → Create comment
- GET /comments/posts/:postId/comments → Get comments (paginated)
- DELETE /comments/comments/:uuid → Delete comment

---

## 🧪 Testing

Unit Tests

```bash
pnpm run test
```

E2E Tests

```bash
pnpm run test:e2e
```

---

## 📁 Project Structure

```bash
src/
  ├── auth/
  ├── post/
  ├── comment/
  ├── user/
  ├── prisma/
  ├── common/
```

---

## ✨ Features

- JWT authentication
- Role-based authorization (ADMIN)
- Pagination & search
- Swagger documentation
- Global response wrapper
- Prisma adapter (PostgreSQL)
- Clean architecture (DTOs, guards, services)

---

## 👩‍💻 Contact

**Author:** Zahra Hayati  
**Project:** Blog API (NestJS + Prisma)
**Email:** zahrahyt.7@gmail.com  
**LinkedIn:** [linkedin.com/in/zahra-hayati-data-science](https://www.linkedin.com/in/zahra-hayati-data-science)  
**GitHub:** [github.com/zahra-hayati](https://github.com/zahra-hayati)
