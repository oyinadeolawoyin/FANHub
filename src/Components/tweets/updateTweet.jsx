import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import { tags } from "../genre/tags";
import Header from "../css/header";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import "../css/quill-theme.css";
import { 
  ImagePlus, 
  Video, 
  X, 
  Tag, 
  Send,
  AlertCircle,
  Loader2,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  Lightbulb
} from "lucide-react";
import { useToast } from "../utils/toast-modal";

// UpdateTweet Component
export default function UpdateTweet() {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    file: null,
    type: "",
    tags: [],
  });

  const { id } = useParams();
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [tweet, setTweet] = useState(null);
  const [tweetLoading, setTweetLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [tweetContent, setTweetContent] = useState("");
  const navigate = useNavigate();
  const quillRef = useRef(null);
  const editorRef = useRef(null);
  const { showToast } = useToast();

  // Load tweet data
  useEffect(() => {
    let mounted = true;

    async function fetchTweet() {
      setError("");
      setTweetLoading(true);
      try {
        const response = await fetch(
          `https://fanhub-server.onrender.com/api/tweets/${id}/tweet`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!mounted) return;

        if (response.status === 500) {
          navigate("/error", { state: { message: data.message || "Process failed" } });
          return;
        } else if (!response.ok) {
          setError(data.message);
          setTweetLoading(false);
          return;
        }

        setTweet(data.tweet);
        setTweetContent(data.tweet.content || "");
        
        if (mounted) {
          setTweetLoading(false);
        }
      } catch (err) {
        if (mounted) {
          navigate("/error", { state: { message: "Network error: Please check your connection." } });
        }
      }
    }

    fetchTweet();

    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  // Initialize Quill
  useEffect(() => {
    if (!editorRef.current || quillRef.current || tweetLoading) return;

    const toolbarOptions = [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      [{ color: [] }, { background: [] }],
      ["link"],
      ["clean"],
    ];

    const quillInstance = new Quill(editorRef.current, {
      theme: 'snow',
      placeholder: 'Update your tweet content...',
      modules: {
        toolbar: {
          container: toolbarOptions,
        },
      },
    });

    quillRef.current = quillInstance;

    quillInstance.on('text-change', () => {
      const html = quillInstance.root.innerHTML;
      setFormData(prev => ({ ...prev, content: html }));
    });

    // Style toolbar
    const toolbar = editorRef.current.parentNode.querySelector(".ql-toolbar");
    if (toolbar) {
      toolbar.classList.add(
        "flex",
        "flex-wrap",
        "justify-center",
        "gap-2",
        "p-3",
        "rounded-lg",
        "bg-card-theme",
        "border",
        "border-theme",
        "mb-3"
      );
    }

    // Load content after editor is initialized
    if (tweetContent) {
      quillInstance.root.innerHTML = tweetContent;
    }

    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, [tweetLoading, tweetContent]);

  // Update formData when tweet is loaded
  useEffect(() => {
    if (tweet) {
      setFormData({
        title: tweet.title || "",
        content: tweet.content || "",
        file: tweet.media || null,
        type: tweet.type || "",
        tags: tweet.tags || [],
      });
      
      // Set preview URL if media exists
      if (tweet.media) {
        setPreviewUrl(tweet.media);
      }
    }
  }, [tweet]);

  // Load theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    setDarkMode(savedTheme === "dark");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleThemeToggle = (isDark) => {
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const mediaType = file.type.startsWith("video/")
      ? "video"
      : file.type.startsWith("image/")
      ? "image"
      : "unknown";

    setFormData(prev => ({ ...prev, file, type: mediaType }));
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, file: null, type: "" }));
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => {
      const newTags = prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag];
      
      if (newTags.length > 5) return prev;
      return { ...prev, tags: newTags };
    });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!quillRef.current) {
      setError("Editor not initialized");
      return;
    }

    setError("");
    setLoading(true);

    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("content", formData.content);
    submitData.append("tags", JSON.stringify(formData.tags));

    if (formData.file && formData.file instanceof File) {
      submitData.append("file", formData.file);
      submitData.append("type", formData.type);
    }

    try {
      const response = await fetch(
        `https://fanhub-server.onrender.com/api/tweets/${id}/update`,
        {
          method: "POST",
          body: submitData,
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.status === 500) {
        navigate("/error", { state: { message: data.message || "Process failed" } });
        return;
      } else if (!response.ok) {
        setError(data.message);
        return;
      }

      showToast("Tweet updated!", "success");
      navigate(`/profile/${user.username}/${user.id}/about`);
    } catch (err) {
      navigate("/error", { state: { message: "Network error: Please check your internet connection." } });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-theme">
      <Header user={user} darkMode={darkMode} setDarkMode={handleThemeToggle} />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/tweets")}
              className="inline-flex items-center gap-2 text-secondary hover:text-theme transition-colors mb-4"
              aria-label="Back to community"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Back to Community
            </button>
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#2563eb]/10 rounded-lg">
                <MessageSquare className="w-8 h-8 text-[#2563eb]" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-theme">Update Tweet</h1>
                <p className="text-secondary mt-2">Edit your tweet and share the updated version</p>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {tweetLoading ? (
            <div className="card py-16 text-center" role="status" aria-live="polite">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-16 h-16 text-[#2563eb] animate-spin" aria-hidden="true" />
                <div>
                  <p className="text-theme text-lg font-medium mb-1">Loading tweet...</p>
                  <p className="text-secondary text-sm">Please wait while we fetch your content</p>
                </div>
              </div>
            </div>
          ) : tweet ? (
            <div className="space-y-6">
              {/* Error Message */}
              {error && (
                <div 
                  className="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                  role="alert"
                  aria-live="polite"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Title Input */}
              <div className="card">
                <label htmlFor="tweet-title" className="block">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-5 h-5 text-[#2563eb]" aria-hidden="true" />
                    <span className="text-theme font-semibold text-lg">
                      Tweet Title <span className="text-red-500">*</span>
                    </span>
                  </div>
                  <input
                    id="tweet-title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Update your tweet title..."
                    className="w-full px-4 py-3 rounded-lg text-lg focus:outline-none"
                    required
                    aria-required="true"
                  />
                </label>
              </div>

              {/* Quill Editor */}
              <div className="card">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-5 h-5 text-[#2563eb]" aria-hidden="true" />
                  <span className="text-theme font-semibold text-lg">
                    Tweet Content <span className="text-red-500">*</span>
                  </span>
                </div>
                <div className="quill-container">
                  <div 
                    ref={editorRef}
                    className="min-h-[350px] sm:min-h-[400px]"
                    aria-label="Tweet content editor"
                  />
                </div>
                <div className="mt-4 text-xs sm:text-sm text-secondary bg-secondary/10 p-3 rounded-lg flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Tip:</strong> Make your updates clear and engaging. Use formatting to emphasize key points!
                  </div>
                </div>
              </div>

              {/* Media Upload Section - Updated to match createTweet.jsx */}
              <div className="card">
                <label className="block">
                  <div className="flex items-center gap-2 mb-3">
                    <ImagePlus className="w-5 h-5 text-[#2563eb]" aria-hidden="true" />
                    <span className="text-theme font-semibold text-lg">
                      Media (Optional)
                    </span>
                  </div>
                  
                  {!formData.file || (typeof formData.file === 'string' && !previewUrl) ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Image Upload */}
                      <label className="image-upload-label cursor-pointer rounded-xl p-6 border-2 border-dashed transition-all duration-300 hover:scale-105">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center gap-3">
                          <div className="upload-icon-wrapper p-3 rounded-full">
                            <ImagePlus className="upload-icon w-8 h-8" />
                          </div>
                          <div className="text-center">
                            <p className="font-medium" style={{ color: "var(--foreground-color)" }}>
                              Upload Image
                            </p>
                            <p className="text-xs text-secondary">PNG, JPG, GIF</p>
                          </div>
                        </div>
                      </label>

                      {/* Video Upload */}
                      <label className="video-upload-label cursor-pointer rounded-xl p-6 border-2 border-dashed transition-all duration-300 hover:scale-105">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center gap-3">
                          <div className="video-icon-wrapper p-3 rounded-full">
                            <Video className="video-icon w-8 h-8" />
                          </div>
                          <div className="text-center">
                            <p className="font-medium" style={{ color: "var(--foreground-color)" }}>
                              Upload Video
                            </p>
                            <p className="text-xs text-secondary">MP4, WebM, MOV</p>
                          </div>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border-2 border-theme">
                      {formData.type === "image" || (typeof formData.file === 'string' && !formData.type) ? (
                        <img 
                          src={previewUrl || formData.file} 
                          alt="Preview" 
                          className="w-full h-64 object-cover" 
                        />
                      ) : formData.type === "video" ? (
                        <video 
                          src={previewUrl || formData.file} 
                          controls 
                          className="w-full h-64" 
                        />
                      ) : null}
                      <button
                        type="button"
                        onClick={removeFile}
                        className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-full transition-all duration-300 shadow-lg"
                        aria-label="Remove media"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  )}
                </label>
              </div>

              {/* Tags Section */}
              <div className="card">
                <label className="block">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-5 h-5 text-[#2563eb]" aria-hidden="true" />
                    <span className="text-theme font-semibold text-lg">
                      Tags (Select up to 5)
                    </span>
                  </div>
                  <div className="genre-select-wrapper rounded-xl p-4 border-2">
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagToggle(tag)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                            formData.tags.includes(tag)
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105"
                              : "border-2 hover:scale-105"
                          }`}
                          style={{
                            borderColor: formData.tags.includes(tag) ? "transparent" : "var(--border-color)",
                            backgroundColor: formData.tags.includes(tag) ? undefined : "var(--card-bg)",
                            color: formData.tags.includes(tag) ? undefined : "var(--foreground-color)"
                          }}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-secondary mt-3">
                      Selected: {formData.tags.length}/5
                    </p>
                  </div>
                </label>
              </div>

              {/* Submit Button */}
              <div className="card">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !formData.title.trim()}
                  className="w-full btn py-4 text-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" aria-hidden="true" />
                      Update Tweet
                    </>
                  )}
                </button>
                
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Your updated tweet will be visible to all community members immediately.
                  </p>
                </div>
              </div>

              {/* Tips Card */}
              <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-theme text-lg mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-[#2563eb]" aria-hidden="true" />
                  Tweet Tips
                </h3>
                <ul className="space-y-2 text-secondary text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-[#2563eb] font-bold">•</span>
                    <span>Keep your title catchy and engaging</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#2563eb] font-bold">•</span>
                    <span>Use formatting to emphasize key points</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#2563eb] font-bold">•</span>
                    <span>Add relevant tags to reach the right audience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#2563eb] font-bold">•</span>
                    <span>Media attachments make your tweets more engaging</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : null}

          {error && !tweet && (
            <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-500">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}