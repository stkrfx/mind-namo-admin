"use client";

import { useActionState, use } from "react";
import { resetPassword } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Loader2, LockKeyhole, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

const initialState = {
  error: null,
  success: null,
};

export default function ResetPasswordPage({ params }) {
  // Unwrap the params Promise (Next.js 15 requirement)
  const { token } = use(params);

  // Bind the token to the server action so it's passed automatically on submit
  const resetPasswordWithToken = resetPassword.bind(null, token);

  const [state, dispatch, isPending] = useActionState(
    resetPasswordWithToken,
    initialState
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <LockKeyhole className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Create a strong password for your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {state?.success ? (
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="flex flex-col items-center justify-center space-y-2 text-center rounded-md bg-green-50 p-4 w-full border border-green-200 text-green-900">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <p className="text-sm font-medium">{state.success}</p>
              </div>
              <Button asChild className="w-full">
                <Link href="/login">Return to Login</Link>
              </Button>
            </div>
          ) : (
            <form action={dispatch} className="space-y-4">
              {state?.error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {state.error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  className="bg-background"
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  required
                  className="bg-background"
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  "Set New Password"
                )}
              </Button>
            </form>
          )}
        </CardContent>

        {!state?.success && (
          <CardFooter className="justify-center">
            <Link
              href="/login"
              className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

// Helper for error icon if needed inside the error block
function AlertCircle(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}