# TurboStarter

**TurboStarter** is a ready-to-use TypeScript Node.js monorepo template designed to accelerate web application development. It comes with modern tools and configurations to streamline your workflow and boost productivity.

---

## 🚀 Features

- **Fastify**: High-performance Node.js web framework.
- **PostgreSQL**: Scalable and reliable relational database integration.
- **AWS S3**: File storage setup for handling uploads and downloads.
- **Docker & Docker Compose**: Simplified containerization for local and production environments.
- **TurboRepo**: Monorepo support with efficient task execution.
- **ESLint & Prettier**: Enforced code quality and consistent formatting.
- **User Module**: Module for managing users, auth and email support.
- **Fly.io Deployment**: Ready for seamless cloud deployment.
- **Config Validation**: Environment-specific configuration validation using a [config](https://www.npmjs.com/package/config) library.
- **Error Handling**: Robust and centralized error handling.
- **Vitest Setup**: Preconfigured testing setup with Vitest.

---

## 🔧 Customizing TurboStarter for Your Application

To tailor TurboStarter to your specific application needs, follow these steps:

1. **Update Configuration Files**:
   - Modify the configuration files in the `apps/backend/config` directory to match your environment settings. For example, update `default.json`, `production.json`, `local.json`, and `test.json` with your database credentials, AWS keys, and other environment-specific settings.

2. **Modify Deployment Workflows**:
   - Edit the GitHub Actions workflows in the `.github/workflows` directory to suit your deployment process. For example, you can enable or disable certain steps in `ci.yml`, `deployment-backend.yml`, and `deployment-frontend.yml`. If you want to use existing Fly.io deployment workflows, you need to set up a Fly.io account and configure the necessary secrets in your GitHub repository.

3. **Update Documentation**:
   - Ensure that you update the documentation in the `README.md` file and any other relevant documentation files to reflect the changes and customizations you have made.

4. **Rename the Project**:
   - Rename the project from `TurboStarter` to your desired project name. Update the `name` field in the `package.json` file and any other references to `TurboStarter`, `turbo-starter` in the codebase.
