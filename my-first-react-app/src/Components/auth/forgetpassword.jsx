import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

function ForgetPassword() {
  const [form, setForm] = useState({ email: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
        "https://fanhub-server.onrender.com/api/auth/forget-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
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

      setMessage(data.message);
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

  return (
    <main
      className="flex items-center justify-center min-h-screen bg-theme px-6 py-10"
      role="main"
    >
      <Card className="w-full max-w-md bg-card-theme border-theme shadow-lg rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="gradient-text text-2xl font-bold">
            Forgot Password
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Enter your registered email address
          </p>
        </CardHeader>

        <CardContent>
          {!message ? (
            <form
              onSubmit={handleSubmit}
              autoComplete="off"
              className="space-y-5"
              aria-label="Forget password form"
            >
              {/* Email Field */}
              <div>
                <Label htmlFor="email" className="block mb-1">
                  Email Address
                </Label>
                <Input
                  type="email"
                  name="email"
                  id="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          ) : (
            <p
              className="text-center font-medium mt-2 text-[var(--primary)]"
              aria-live="polite"
            >
              {message}
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

export default ForgetPassword;