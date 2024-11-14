import GeneralFooter from "@/components/GeneralFooter";
import { Button } from "@/components/ui/button";

import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Fetch Error | Otaku Corner"
};

export default function Page() {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center w-full space-y-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/fetch-error.gif"
            width={256}
            height={256}
            className="w-64 rounded-xl"
            alt="Fetch error"
            unoptimized
          />
          <h1 className="text-gray-900">Oops! Something went wrong</h1>
          <p className="mt-2 text-sm text-gray-600">
            We couldn&apos;t load the data. Please try again later.
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <Link href="/">
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
