import { ROUTES } from "@convo/constants";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 mb-4">
          Convo
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          A secured messaging app
        </p>
        <div className="space-x-4">
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90"
          >
            Login
          </Link>
          <Link
            to={ROUTES.REGISTER}
            className="inline-flex h-9 items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-50"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
