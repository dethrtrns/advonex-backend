# Advonex Backend Project Summary

This document provides a comprehensive overview of the Advonex backend project, including its architecture, key technologies, and operational commands.

## 1. Project Overview

The Advonex backend is a robust, scalable server-side application built with the **NestJS framework** and written in **TypeScript**. It serves as the backbone for the Advonex platform, a service designed to connect clients with legal professionals.

The application handles a wide range of functionalities, including:

- **User Authentication & Authorization**: Secure sign-up, login, and role-based access control (Client, Lawyer, Admin).
- **Profile Management**: Separate, detailed profiles for clients and lawyers.
- **Lawyer Discovery**: Features for clients to browse, search, and save lawyer profiles.
- **Consultation Requests**: A system for clients to send consultation requests to lawyers.
- **File Uploads**: Integrated with Cloudinary for handling file and image uploads.
- **Notifications**: Manages email and SMS notifications for key events.

The project follows a modular architecture, with features organized into distinct modules (e.g., `auth`, `profiles`, `lawyers`), promoting separation of concerns and maintainability.

## 2. Key Technologies & Libraries

- **Framework**: [NestJS](https://nestjs.com/) (v11.0.1)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (v5.7.3)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/) (v6.5.0)
- **Authentication**: [Passport.js](http://www.passportjs.org/) with JWT and refresh token strategies
- **API Documentation**: [Swagger](https://swagger.io/)
- **File Storage**: [Cloudinary](https://cloudinary.com/)
- **Email Service**: [Resend](https://resend.com/)
- **Linting & Formatting**: ESLint and Prettier
- **Package Manager**: [pnpm](https://pnpm.io/)

## 3. Project Structure

The project is organized into the following key directories:

- **`src/`**: Contains the application's source code, with each feature in its own module directory (e.g., `src/auth`, `src/profiles`).
- **`prisma/`**: Includes the Prisma schema (`schema.prisma`), database migrations, and seeding scripts.
- **`test/`**: Holds end-to-end tests.
- **`dist/`**: The output directory for the compiled JavaScript code.

## 4. Important Commands

The following commands are essential for developing and running the application. They should be executed from the project's root directory.

- **Install Dependencies**:
  ```bash
  pnpm install
  ```

- **Run in Development Mode (with watch)**:
  ```bash
  pnpm run start:dev
  ```

- **Build for Production**:
  ```bash
  pnpm run build
  ```

- **Run in Production Mode**:
  ```bash
  pnpm run start:prod
  ```

- **Run Tests**:
  - **Unit Tests**:
    ```bash
    pnpm run test
    ```
  - **End-to-End (E2E) Tests**:
    ```bash
    pnpm run test:e2e
    ```

- **Lint and Format**:
  - **Lint**:
    ```bash
    pnpm run lint
    ```
  - **Format**:
    ```bash
    pnpm run format
    ```

- **Prisma Commands**:
  - **Generate Prisma Client**:
    ```bash
    npx prisma generate
    ```
  - **Run Database Migrations**:
    ```bash
    npx prisma migrate deploy
    ```
  - **Seed the Database**:
    ```bash
    pnpm run prisma:seed
    ```

## 5. Code Style and Conventions

- **Code Style**: The project uses **Prettier** for automatic code formatting. Please run `pnpm run format` before committing changes.
- **Linting**: **ESLint** is configured to enforce code quality and consistency. Run `pnpm run lint` to check for issues.
- **Modularity**: New features should be developed in their own modules to maintain a clean and organized codebase.
- **source of truth**: prisma schema should be a single source of truth as far as possible for all DTO and type definitions.
- **DTOs**: Data Transfer Objects (DTOs) are used extensively for validating and shaping API request and response bodies.
- **Error Handling**: The application uses custom decorators for standardized API error responses.
- **Comments**: Write clear and concise comments to explain complex logic.

This summary should provide a solid foundation for understanding and contributing to the Advonex backend project.
