# Repository Summary: Anjyl/budget_flow_v3

This document provides a summary of the `Anjyl/budget_flow_v3` repository, outlining its structure, key components, and overall purpose.

## Project Overview

The repository contains two main projects, both related to a web-based budgeting application:

1.  **`G Sheet`**: A client-side application that connects to Google Sheets and allows users to view and edit their budget data directly within a web interface. It uses Google OAuth for authentication and the Google Sheets API for data manipulation.

2.  **`G Sheet/budget-web-app`**: A more comprehensive full-stack web application that extends the functionality of the `G Sheet` project. It includes a backend server, a database, and a more feature-rich client application. This application appears to be a more robust and scalable solution for personal budget management.

## Key Technologies

The projects leverage a modern web development stack, including:

| Technology          | Description                                                                 |
| ------------------- | --------------------------------------------------------------------------- |
| **React**           | A popular JavaScript library for building user interfaces.                    |
| **TypeScript**      | A typed superset of JavaScript that enhances code quality and maintainability. |
| **Vite**            | A fast and modern build tool for web development.                           |
| **Tailwind CSS**    | A utility-first CSS framework for rapid UI development.                     |
| **tRPC**            | A framework for building end-to-end typesafe APIs.                          |
| **Drizzle ORM**     | A TypeScript ORM for interacting with the database.                         |
| **MySQL**           | A popular open-source relational database.                                  |
| **Google APIs**     | Used for authentication (OAuth) and data access (Google Sheets API).        |

## `G Sheet` Project Details

-   **Purpose**: To provide a simple, client-side interface for viewing and editing Google Sheets data.
-   **Authentication**: Uses client-side Google OAuth.
-   **Data Storage**: Relies entirely on Google Sheets for data persistence.
-   **Key Files**:
    -   `G Sheet/README.md`: Provides setup and usage instructions.
    -   `G Sheet/package.json`: Lists project dependencies and scripts.

## `G Sheet/budget-web-app` Project Details

-   **Purpose**: A full-stack budgeting application with a dedicated backend and database.
-   **Architecture**: Comprises a `client` (React frontend) and a `server` (Node.js/Express backend).
-   **Authentication**: Implements a more secure authentication flow with a backend server managing user sessions.
-   **Data Storage**: Uses a MySQL database to store user data, categories, transactions, and budgets.
-   **Key Files**:
    -   `G Sheet/budget-web-app/package.json`: Defines the project's dependencies and scripts.
    -   `G Sheet/budget-web-app/server/routers.ts`: Defines the API endpoints for managing transactions, categories, and budgets.
    -   `G Sheet/budget-web-app/drizzle/schema.ts`: Defines the database schema for users, categories, transactions, and budgets.

## Conclusion

The `Anjyl/budget_flow_v3` repository contains a well-structured and modern web application for personal finance management. The `budget-web-app` project, in particular, provides a solid foundation for a feature-rich and scalable budgeting tool. I am now familiar with the repository and ready for your instructions on the changes to be made.
