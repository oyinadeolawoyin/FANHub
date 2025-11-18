import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./authContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { SquareLogo } from "../css/logo";

function Signup() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    country: "",
    gender: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSignupError("");
    setSignupLoading(true);

    try {
      const response = await fetch("https://fanhub-server.onrender.com/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.status === 500) {
        navigate("/error", { state: { message: data.message || "Signup failed" } });
        return;
      } else if (!response.ok) {
        setSignupError(data.message);
        return;
      }

      setUser(data.user);
      navigate("/login");
    } catch (err) {
      navigate("/error", {
        state: { message: "Network error: Please check your internet connection." },
      });
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <main className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-[var(--background-color)] text-[var(--foreground-color)] px-6 py-10 gap-10">
      {/* LEFT SIDE — Logo + Tagline */}
      <div className="hidden md:flex flex-col items-center justify-center w-full md:w-1/2 text-center md:text-left space-y-5 animate-fadeIn">
        <div className="animate-spin-slow">
          <SquareLogo theme="light" size={24} />
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--accent-color)] tracking-tight leading-tight">
          The Voices
        </h1>
        <p className="text-lg md:text-2xl text-[var(--secondary-text)] font-medium italic">
          where stories come alive ✨
        </p>
      </div>

      {/* RIGHT SIDE — Signup Form */}
      <div className="w-full md:w-1/2 flex justify-center">
        <Card className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--dropdown-border)] shadow-lg rounded-2xl text-[var(--card-text)]">
          <CardHeader className="text-center space-y-1">
            <div className="md:hidden mb-4">
              <h1 className="text-2xl font-bold text-[var(--accent-color)]">The Voices</h1>
              <p className="text-sm text-[var(--secondary-text)] italic">where stories come alive ✨</p>
            </div>
            <CardTitle className="gradient-text text-2xl font-bold text-[var(--accent-color)]">
              Create Your Account ✨
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4" aria-label="Sign up form">
              {/* Username */}
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                  className="mt-1 bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--border-color)] focus:border-[var(--accent-color)]"
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className="mt-1 bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--border-color)] focus:border-[var(--accent-color)]"
                />
              </div>

              {/* Password with toggle */}
              <div className="relative">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  className="mt-1 pr-10 bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--border-color)] focus:border-[var(--accent-color)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 top-6 flex items-center text-[var(--secondary-text)] hover:text-[var(--accent-color)]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Country */}
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  type="text"
                  value={form.country}
                  onChange={handleChange}
                  required
                  className="mt-1 bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--border-color)] focus:border-[var(--accent-color)]"
                />
              </div>

              {/* Gender */}
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Input
                  id="gender"
                  name="gender"
                  type="text"
                  value={form.gender}
                  onChange={handleChange}
                  required
                  className="mt-1 bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--border-color)] focus:border-[var(--accent-color)]"
                />
              </div>

              {/* Error */}
              {signupError && (
                <p className="text-red-500 text-sm font-medium text-center" role="alert">
                  {signupError}
                </p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-[var(--button-bg)] text-[var(--button-text)] hover:opacity-90 focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)]"
                disabled={signupLoading}
              >
                {signupLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>

              {/* Login Link */}
              <p className="text-sm text-center text-[var(--secondary-text)] mt-2">
                Already have an account?{" "}
                <Link to="/login" className="text-[var(--accent-color)] hover:underline font-medium">
                  Log in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default Signup;