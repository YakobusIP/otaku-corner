import GeneralFooter from "@/components/GeneralFooter";
import { Button } from "@/components/ui/button";

import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex flex-col items-center">
          <img src="/unauthorized.gif" className="w-64 rounded-xl" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Unauthorized Access
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Oops! It looks like you don't have permission to access this page.
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <Link to="/">
            <Button className="w-full">Go back to homepage</Button>
          </Link>
        </div>
      </div>
      <div className="absolute bottom-0 w-full">
        <GeneralFooter />
      </div>
    </div>
  );
}
