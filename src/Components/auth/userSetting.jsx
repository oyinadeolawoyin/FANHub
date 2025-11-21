import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./usersContext";
import {
  User,
  Globe,
  UserCircle,
  FileText,
  Instagram,
  Facebook,
  Twitter,
  DollarSign,
  Upload,
  Loader2,
  Save,
} from "lucide-react";
import Header from "../css/header";
import Footer from "../css/footer";
import DiscordIcon from "../css/discord";

function Usersettings() {
  const { user, setUser } = useUser();
  const [form, setForm] = useState({
    username: user?.username || "",
    country: user?.country || "",
    gender: user?.gender || "",
    bio: user?.bio || "",
    instagram: user?.instagram || "",
    facebook: user?.facebook || "",
    twitter: user?.twitter || "",
    discord: user?.discord || "",
    donation: user?.donation || "",
    file: null,
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(user?.coverImage || null);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file" && files[0]) {
      setForm({ ...form, [name]: files[0] });
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(files[0]);
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    try {
      const response = await fetch(
        `https://fanhub-server.onrender.com/api/users/${user.id}/update`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Update failed");
        return;
      }

      setUser(data.user);
      localStorage.removeItem("user");
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate(`/profile/${user.username}/${user.id}/about`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Fixed header with proper spacing */}
      <Header user={user} darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="min-h-screen bg-theme pt-28 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-theme flex items-center gap-3">
              <User className="w-8 h-8 text-[#2563eb]" aria-hidden="true" />
              Update Your Profile
            </h1>
            <p className="text-secondary mt-2">
              Manage your personal information and social links
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-theme">
                <div className="form-card-icon p-2 rounded-lg">
                  <UserCircle className="icon-primary w-5 h-5" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-semibold text-theme">Basic Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-theme mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="username"
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg focus:outline-none"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-theme mb-2">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary" />
                      <input
                        id="country"
                        type="text"
                        name="country"
                        value={form.country}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-theme mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg focus:outline-none"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-theme mb-2">
                    Bio
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-5 h-5 text-secondary" />
                    <textarea
                      id="bio"
                      name="bio"
                      value={form.bio}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Tell us about yourself..."
                      className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cover Picture Upload */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-theme">
                <Upload className="icon-primary w-5 h-5" />
                <h2 className="text-xl font-semibold text-theme">Cover Picture</h2>
              </div>

              {preview && (
                <img
                  src={preview}
                  alt="Cover preview"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <label
                htmlFor="file-upload"
                className="cursor-pointer border-2 border-dashed rounded-lg p-6 text-center hover:border-[#2563eb] transition-all duration-300 block"
              >
                <input
                  id="file-upload"
                  type="file"
                  name="file"
                  accept="image/*"
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="w-12 h-12 mx-auto flex items-center justify-center mb-3 rounded-full bg-blue-50 dark:bg-gray-800">
                  <Upload className="w-6 h-6 text-[#2563eb]" />
                </div>
                <p className="text-sm font-medium text-theme">
                  {preview ? "Change cover picture" : "Upload cover picture"}
                </p>
                <p className="text-xs text-secondary mt-1">PNG, JPG up to 10MB</p>
              </label>
            </div>

            {/* Social Links */}
            <div className="card">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-theme">
                <Globe className="icon-primary w-5 h-5" />
                <h2 className="text-xl font-semibold text-theme">Social Links</h2>
              </div>

              <div className="space-y-4">
                {[ 
                  { id: "instagram", label: "Instagram", icon: <Instagram className="w-5 h-5 text-secondary" />, placeholder: "@username" },
                  { id: "facebook", label: "Facebook", icon: <Facebook className="w-5 h-5 text-secondary" />, placeholder: "facebook.com/username" },
                  { id: "twitter", label: "Twitter / X", icon: <Twitter className="w-5 h-5 text-secondary" />, placeholder: "@username" },
                  { id: "discord", label: "Discord", icon: <DiscordIcon className="w-5 h-5 text-secondary" />, placeholder: "username#0000" },
                  { id: "donation", label: "Patreon", icon: <DollarSign className="w-5 h-5 text-secondary" />, placeholder: "https://..." },
                ].map(({ id, label, icon, placeholder }) => (
                  <div key={id}>
                    <label htmlFor={id} className="block text-sm font-medium text-theme mb-2">
                      {label}
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">{icon}</div>
                      <input
                        id={id}
                        name={id}
                        value={form[id]}
                        onChange={handleChange}
                        placeholder={placeholder}
                        className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Buttons (responsive) */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => navigate(`/profile/${user.username}/${user.id}/about`)}
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg font-medium text-theme hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 flex items-center justify-center gap-2 rounded-lg bg-[#2563eb] text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* FOOTER */}
      <Footer />
    </>
  );
}

export default Usersettings;