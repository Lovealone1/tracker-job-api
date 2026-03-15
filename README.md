# 🚀 Job Tracker API

A robust, enterprise-grade backend ecosystem built with **NestJS 11**, designed to power the Job Tracker application. This API handles everything from job application management to advanced LaTeX resume rendering and automated notifications.

---

## Core Technologies
- **Framework**: [NestJS](https://nestjs.com/) (Version 11)
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: JWT with Passport.js strategy
- **Resume Engine**: Python 3.x with **RenderCV[full]** (LaTeX support)
- **Email Service**: Resend API integration (AES-256 encrypted keys)
- **Storage**: @aws-sdk (S3-compatible) with Supabase Storage integration
- **Documentation**: Swagger/OpenAPI

---

## Key Features

### Smart Resume Rendering
- **Dual-Runtime**: Seamlessly executes Python-based RenderCV CLI tasks from within the Node.js environment.
- **LaTeX Quality**: Generates professional-grade PDF resumes with high-fidelity PNG previews.

### Automated Lifecycle
- **Interview Monitoring**: Integrated cron jobs that track upcoming interviews.
- **Automated Notifications**: Sends smart email reminders via Resend to ensure you never miss a career opportunity.

### Security & Reliability
- **Vault Encryption**: Industry-standard AES-256 encryption for external service API keys.
- **Standardized DTOs**: Strict request validation and transformation using class-validator and class-transformer.
- **Detailed Logging**: Structured JSON logging for production environments and human-readable logging for development.

---

## Deployment

Optimized for **Railway** deployment using a custom multi-runtime Docker environment:
- **Base Image**: `node:22-bullseye`
- **Extra Runtime**: Python 3 installer & `rendercv[full]`
- **Sync**: Automated Prisma client generation during the build lifecycle.

---

## Getting Started

### Prerequisites
- Node.js 22+
- Pnpm 9+
- Python 3.12+ (for local resume rendering)

### Local Development

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Environment Setup**:
   Configure your `.env` following the provided template (at least `DATABASE_URL` and `SUPABASE_*` configs).

3. **Generate Client**:
   ```bash
   npx prisma generate
   ```

4. **Run Application**:
   ```bash
   # development
   pnpm run start:dev

   # production
   pnpm run start:prod
   ```

5. **Swagger Documentation**:
   Access the interactive API docs at `http://localhost:3001/api/docs`

---

## GitHub About Description
> "Advanced NestJS 11 backend for job application tracking. Features integrated Python RenderCV engine for LaTeX resumes, automated interview reminders, and S3-compatible cloud storage."

---
