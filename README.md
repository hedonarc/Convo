# 💬 Convo

Convo is a modern, real-time chat application designed for scalability and performance. It features a robust Django-based API and is built with modern development tooling.

---

## 🏗️ Architecture

The project is structured as a monorepo:

- **`/backend`**: Django REST Framework API, handling authentication, messaging logic, and user management.
- **`/frontend`**: *(Coming Soon)* Modern web interface built with React/Next.js.

---

## 🚀 Quick Start

To get the project running locally, follow the setup guides for each component:

1.  **Backend Setup**: Follow the instructions in [backend/README.md](./backend/README.md).
2.  **Frontend Setup**: *(Coming Soon)*

### Global Prerequisites

- **Git**: For version control.
- **uv**: For Python dependency management. [Install uv](https://github.com/astral-sh/uv).

---

## 🛠️ Development & Contributing

We maintain high standards for code quality and consistency.

- **Global Standards**: Please review [CONTRIBUTING.md](./CONTRIBUTING.md) for commit conventions and pre-commit hook setup.
- **Backend Development**: See [backend/DEVELOPMENT.md](./backend/DEVELOPMENT.md) for Python/Django specific workflows and tools (Ruff).
- **Frontend Development**: *(Coming Soon)*

---

## 🤝 Contributors

This project is developed by:

* **Abubakar Khawaja** — Full Stack Developer (React + Django)
* **Muhammad Suleman Butt** — Full Stack Developer (React / React Native + Django)

---

## 🧠 Project Notes & Roadmap

- **Database**: SQLite is used for development; easily extendable to PostgreSQL.
- **Real-time**: Integration with WebSockets (Django Channels) is planned.
- **Auth**: Fully integrated with JWT (JSON Web Tokens) using `djangorestframework-simplejwt`.
