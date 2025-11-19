import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./authContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const response = await fetch("https://fanhub-server.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });

      const data = await response.json();

      if (response.status === 500) {
        navigate("/error", { state: { message: data.message || "Login failed" } });
        return;
      } else if (!response.ok) {
        setLoginError(data.message);
        return;
      }

      setUser(data.user);
      navigate("/");
    } catch (err) {
      navigate("/error", {
        state: { message: "Network error: Please check your internet connection." },
      });
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <main
      className="flex items-center justify-center min-h-screen bg-theme px-6 py-10"
      role="main"
    >
      <Card className="w-full max-w-md bg-card-theme border-theme shadow-lg rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="gradient-text text-2xl font-bold">Welcome Back 👋</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Log in to your account</p>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            className="space-y-4"
            aria-label="Login form"
          >
            {/* Username Field */}
            <div>
              <Label htmlFor="username" className="block mb-1">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                required
                autoComplete="username"
                className="mt-1 bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--border-color)] focus:border-[var(--primary)]"
                aria-required="true"
              />
            </div>

            {/* Password Field with Toggle */}
            <div className="relative">
              <Label htmlFor="password" className="block mb-1">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  className="mt-1 pr-10 bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--border-color)] focus:border-[var(--primary)]"
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-[var(--primary)] focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {loginError && (
              <p
                className="text-red-500 text-sm font-medium text-center"
                role="alert"
              >
                {loginError}
              </p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full btn focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              disabled={loginLoading}
            >
              {loginLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging In...
                </>
              ) : (
                "Log In"
              )}
            </Button>

            {/* Links */}
            <div className="flex flex-col items-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => navigate("/forget-password")}
                className="text-sm text-primary hover:underline focus:underline focus:outline-none"
              >
                Forgot Password?
              </button>
              <p className="text-sm text-gray-500">
                Don’t have an account?{" "}
                <Link
                  to="/signup"
                  className="text-primary font-medium hover:underline focus:underline focus:outline-none"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

export default Login;