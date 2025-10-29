import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-orange-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center px-4">
        {/* 404 Text */}
        <h1 className="text-8xl font-bold mb-4 text-primary">404</h1>

        {/* Main Message */}
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Oops! This Dish Doesn&apos;t Exist
        </h2>

        {/* Subtitle */}
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Looks like this page is not on our menu. The recipe you&apos;re
          looking for might have been moved or doesn&apos;t exist.
        </p>

        {/* Fun Facts */}
        <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md mx-auto">
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            🍔 Fun fact: While you&apos;re here, did you know that YumYum
            connects buyers with the best OEM manufacturers?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white px-8"
            >
              🏠 Back to Home
            </Button>
          </Link>
          <Link href="/oems">
            <Button
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 px-8"
            >
              🔍 Browse OEMs
            </Button>
          </Link>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center gap-4 text-4xl opacity-50">
          <span className="animate-bounce [animation-delay:0s]">🍕</span>
          <span className="animate-bounce [animation-delay:100ms]">🍱</span>
          <span className="animate-bounce [animation-delay:200ms]">🍰</span>
          <span className="animate-bounce [animation-delay:300ms]">🍣</span>
          <span className="animate-bounce [animation-delay:400ms]">🥘</span>
        </div>
      </div>
    </div>
  );
}
