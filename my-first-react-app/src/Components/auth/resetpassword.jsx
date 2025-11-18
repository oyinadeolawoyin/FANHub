import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "../utils/toast-modal";

function ResetPassword() {
  const [form, setForm] = useState({ password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Extract token from query parameters
  const token = new URLSearchParams(location.search).get("token");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://fanhub-server.onrender.com/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            newPassword: form.password,
          }),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.status === 500) {
        navigate("/error", {
          state: { message: data.message || "Process failed" },
        });
        return;
      }

      if (!response.ok) {
        setError(data.message || "Something went wrong.");
        return;
      }

      handlePasswordReset(data);
      navigate("/");
    } catch (err) {
      navigate("/error", {
        state: {
          message: "Network error: Please check your internet connection.",
        },
      });
    } finally {
      setLoading(false);
    }
  }

  function handlePasswordReset(data) {
    showToast(data.message, "info");
  }

  return (
    <main
      className="flex items-center justify-center min-h-screen bg-theme px-6 py-10"
      role="main"
    >
      <Card className="w-full max-w-md bg-card-theme border-theme shadow-lg rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="gradient-text text-2xl font-bold">
            Reset Your Password
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Enter your new password below
          </p>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            className="space-y-5"
            aria-label="Reset password form"
          >
            {/* Password Field */}
            <div>
              <Label htmlFor="password" className="block mb-1">
                New Password
              </Label>
              <Input
                type="password"
                name="password"
                id="password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--border-color)] focus:border-[var(--primary)]"
                aria-required="true"
              />
            </div>

            {/* Error Message */}
            {error && (
              <p
                className="text-red-500 text-sm font-medium text-center"
                role="alert"
              >
                {error}
              </p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

export default ResetPassword;