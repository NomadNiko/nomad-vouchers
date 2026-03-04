# Gift Card Management System

A comprehensive web-based gift card management system for restaurants, enabling managers to create customizable gift card templates, sell them through an embeddable widget, and manage redemptions through a dedicated console.

## Table of Contents <!-- omit in toc -->

- [Gift Card Management System](#gift-card-management-system)
  - [Description](#description)
  - [Key Features](#key-features)
  - [Getting Started](#getting-started)
  - [Architecture](#architecture)
  - [Documentation](#documentation)
  - [Screenshots](#screenshots)
  - [Contributors](#contributors)
  - [Support](#support)

## Description

This application provides a complete solution for restaurants to manage digital gift cards. Restaurant managers can create beautiful gift card templates, customers can purchase them through an embeddable widget, and managers can track and redeem gift cards through an intuitive console.

**Design Document**: [DESIGN.md](/DESIGN.md)

**Demo**: <https://gift-cards.nomadsoft.us>

**Backend**: <https://gift-cards-server.nomadsoft.us>

**Backend Repository**: [gift-cards-server](/var/www/gift-cards-server/)

## Getting Started

First, run the development server:

```bash
cp example.env.local .env.local

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Key Features

### For Restaurant Managers
- **Template Management**: Create and customize gift card templates with custom images
- **Purchase Tracking**: View all gift card purchases and their current balances
- **Redemption Console**: Redeem full or partial gift card amounts with audit trail
- **Reports & Analytics**: Track sales, redemptions, and outstanding balances
- **Balance Lookup**: Quick lookup of gift card balances by code or email

### For Customers
- **Easy Purchase**: Buy gift cards through an embeddable widget on restaurant websites
- **Email Delivery**: Receive gift cards via email with unique redemption codes
- **Balance Checking**: Check remaining balance anytime via public lookup page
- **Printable Cards**: Download and print gift cards for physical gifting

### Technical Features
- **Embeddable Widget**: Lightweight widget that can be embedded on any website
- **Secure Codes**: Cryptographically secure unique gift card codes
- **Partial Redemptions**: Support for using gift cards across multiple visits
- **Audit Trail**: Complete history of all redemptions and transactions
- **Email Integration**: Automated email delivery using Resend
- **File Management**: Support for local and S3 storage for template images

## Features

- [x] Next.js
- [x] TypeScript
- [x] [i18n](https://react.i18next.com/) (based on https://github.com/i18next/next-13-app-dir-i18next-example)
- [x] [Material UI](https://mui.com/). Supports dark mode.
- [x] [React Hook Form](https://react-hook-form.com/)
- [x] React Query
- [x] Auth (Sign in, Sign up, Reset password, Confirm email, Refresh Token)
- [x] User management (CRUD)
- [x] File Upload
- [x] E2E tests ([Playwright](https://playwright.dev/))
- [x] ESLint
- [x] CI (GitHub Actions)


## Architecture

The system consists of three main components:

1. **Manager Console** (Next.js/React): Admin interface for managing templates, viewing purchases, and processing redemptions
2. **Embeddable Widget** (React): Standalone component that can be embedded on any website for gift card purchases
3. **REST API** (NestJS): Backend service handling all business logic, data persistence, and email delivery

### Tech Stack

**Frontend:**
- Next.js 15 with App Router
- React 19
- TypeScript
- Material UI
- React Hook Form + Yup validation
- React Query for data fetching
- i18next for internationalization

**Backend:**
- NestJS framework
- MongoDB with Mongoose
- JWT authentication
- Resend for email delivery
- File uploads (local/S3)
- Swagger API documentation

### Data Flow

```
Customer → Widget → API → Database
                    ↓
                  Email Service
                    
Manager → Console → API → Database
```

## Documentation

- [Design Document](DESIGN.md) - Comprehensive system design and architecture
- [Installing and Running](docs/installing-and-running.md)
- [Architecture](docs/architecture.md)
- [Forms](docs/forms.md)
- [Authentication](docs/auth.md)
- [Testing](docs/testing.md)

## Screenshots

<img width="1552" alt="Sign In" src="https://github.com/brocoders/extensive-react-boilerplate/assets/6001723/5d42cd15-685b-4ae7-951d-4c8ed89c5390">

<img width="1552" alt="Sign Up" src="https://github.com/brocoders/extensive-react-boilerplate/assets/6001723/aca2d405-2155-4755-8d0e-d41bdc0db852">

<img width="1552" alt="Users list" src="https://github.com/brocoders/extensive-react-boilerplate/assets/6001723/244409c0-2235-4018-b062-44fb54ea4321">

<img width="1552" alt="Create user" src="https://github.com/brocoders/extensive-react-boilerplate/assets/6001723/cb86a3e1-331f-4bd7-9668-3c6cf44eb372">

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Shchepotin"><img src="https://avatars.githubusercontent.com/u/6001723?v=4?s=100" width="100px;" alt="Vladyslav Shchepotin"/><br /><sub><b>Vladyslav Shchepotin</b></sub></a><br /><a href="#maintenance-Shchepotin" title="Maintenance">🚧</a> <a href="#doc-Shchepotin" title="Documentation">📖</a> <a href="#code-Shchepotin" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ElenVlass"><img src="https://avatars.githubusercontent.com/u/72293912?v=4?s=100" width="100px;" alt="Elena Vlasenko"/><br /><sub><b>Elena Vlasenko</b></sub></a><br /><a href="#doc-ElenVlass" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/TetianaFomina"><img src="https://avatars.githubusercontent.com/u/72749258?v=4?s=100" width="100px;" alt="TetianaFomina"/><br /><sub><b>TetianaFomina</b></sub></a><br /><a href="#test-TetianaFomina" title="Tests">⚠️</a> <a href="#bug-TetianaFomina" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/LiudmylaKostenko"><img src="https://avatars.githubusercontent.com/u/55603883?v=4?s=100" width="100px;" alt="Liudmyla Kostenko"/><br /><sub><b>Liudmyla Kostenko</b></sub></a><br /><a href="#code-LiudmylaKostenko" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://brocoders.com"><img src="https://avatars.githubusercontent.com/u/226194?v=4?s=100" width="100px;" alt="Rodion"/><br /><sub><b>Rodion</b></sub></a><br /><a href="#business-sars" title="Business development">💼</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## Support

If you seek consulting, support, or wish to collaborate, please get in touch with us via [boilerplates@brocoders.com](boilerplates@brocoders.com) or feel free to ask us on [GitHub Discussions](https://github.com/brocoders/extensive-react-boilerplate/discussions). We are totally open to any suggestions and improvements.
