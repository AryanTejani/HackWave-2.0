// app/not-found.tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
            <h1 className="text-4xl font-bold mb-4">404 – Page Not Found</h1>
            <p className="text-lg text-gray-600 dark:text-gray-200 mb-6">
                Oops! The page you are looking for doesn’t exist.
            </p>
            <Link
                href="/"
            >
                <Button>
                    Go Home
                </Button>

            </Link>
        </div>
    )
}
