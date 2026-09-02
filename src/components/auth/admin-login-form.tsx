import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { loginSchema, type LoginFormValues } from "@/config/login-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setAuthError(null);
    const ok = await login(values.username, values.password);
    if (!ok) {
      setAuthError("Incorrect username or password.");
      return;
    }
    const from = (location.state as { from?: string } | null)?.from ?? "/admin";
    navigate(from, { replace: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full max-w-sm space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="login-username">Username</Label>
        <Input
          id="login-username"
          autoComplete="username"
          autoFocus
          aria-invalid={!!errors.username}
          aria-describedby={errors.username ? "login-username-error" : undefined}
          {...register("username")}
        />
        {errors.username && (
          <p id="login-username-error" className="text-destructive text-xs">
            {errors.username.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="login-password">Password</Label>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "login-password-error" : undefined}
            className="pr-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-0 top-0 h-full px-3 flex items-center text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-r-md"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {errors.password && (
          <p id="login-password-error" className="text-destructive text-xs">
            {errors.password.message}
          </p>
        )}
      </div>

      {authError && (
        <p role="alert" className="text-destructive text-sm bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
          {authError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
        <LogIn size={15} />
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
