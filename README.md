# Golf Improve Management

This is the frontend component of the Golf Improve Management, built with a modern React stack optimized for performance and enterprise-scale tooling.

## 🚀 Technologies

* **Framework:** React 19 + TypeScript
* **Build Tool:** Vite
* **State Management:** Redux Toolkit & React Query (TanStack Query)
* **Styling & UI:** TailwindCSS v4, Ant Design (antd)
* **Routing:** React Router v7
* **Form Handling:** React Hook Form
* **Charts:** ApexCharts

## 📦 Installation & Setup

1. **Clone the repository and jump to the client directory (if not already):**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   Using npm:
   ```bash
   npm install
   ```
   Or using yarn/pnpm:
   ```bash
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root of the `client` directory based on available config (e.g., `.env.example`).
   ```env
   VITE_PUBLIC_URL=http://localhost:9090/api/v1
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The application will be running on `http://localhost:3000` by default.

## 📜 Available Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Compiles and bundles the application for production.
- `npm run preview`: Previews the production build locally.
- `npm run lint`: Runs ESLint to check for code quality issues.

## 📁 Project Structure

* `src/components/`: Reusable, generic UI components.
* `src/view/`: Page-level components organized by features (e.g., auth, admin, employee, common).
* `src/redux/`: Redux configuration, slices, and RTK Query API endpoints.
* `src/routes/`: Router configurations distinguishing layouts and roles.
* `src/types/`: Shared TypeScript type definitions.

---
*Maintained by the ERP Management Development Team.*