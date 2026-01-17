import { SignupForm } from "@/components/auth/signup-form";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900">
            <Card className="w-full max-w-md border-0 shadow-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                        Create Account
                    </CardTitle>
                    <CardDescription className="text-center">
                        Get started with your billing journey
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SignupForm />
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="text-purple-500 hover:underline font-medium">
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
