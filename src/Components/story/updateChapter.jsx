import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import "../css/quill-theme.css";
import {
  BookOpen,
  Feather,
  Rocket,
  Save,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { Toast, useToast } from "../utils/toast-modal";

// === Custom Scene Break Blot ===
const BlockEmbed = Quill.import("blots/block/embed");

class SceneBreakBlot extends BlockEmbed {
  static blotName = "sceneBreak";
  static tagName = "div";
  static className = "scene-break";

  static create() {
    const node = super.create();
    node.setAttribute("contenteditable", "false");
    node.innerHTML = `
      <div style="text-align: center; margin: 0.5em 0; padding: 0; user-select: none; line-height: 1;">
        <div style="display: inline-flex; align-items: center; gap: 0.5rem; color: #2563eb;">
          <span style="flex: 1; height: 2px; max-width: 100px; background: linear-gradient(to right, transparent, #2563eb);"></span>
          <span style="font-size: 1.1rem; line-height: 1;">✦</span>
          <span style="flex: 1; height: 2px; max-width: 100px; background: linear-gradient(to left, transparent, #2563eb);"></span>
        </div>
      </div>
    `;
    return node;
  }
}

Quill.register(SceneBreakBlot);

function UpdateChapter() {
  const { id, chapterId } = useParams();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState({
    publish: false,
    draft: false,
  });
  const [title, setTitle] = useState("");
  const [chapterContent, setChapterContent] = useState("");

  const { toast, showToast, closeToast } = useToast();

  const editorRef = useRef(null);
  const quillRef = useRef(null);

  // === Fetch Chapter Data ===
  useEffect(() => {
    let mounted = true;

    const fetchChapter = async () => {
      try {
        const res = await fetch(
          `https://fanhub-server.onrender.com/api/stories/${id}/chapters/${chapterId}`,
          { method: "GET", credentials: "include" }
        );

        const data = await res.json();

        if (!mounted) return;

        if (res.status === 500) {
          navigate("/error", {
            state: { message: data.message || "Process failed" },
          });
          return;
        }

        if (!res.ok) {
          setError(data.message || "Failed to load chapter");
          setLoading(false);
          return;
        }

        // Set title
        setTitle(data.chapter.title || "");

        // Store content to be loaded after editor is ready
        setChapterContent(data.chapter.content || "");

        if (mounted) {
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          navigate("/error", {
            state: {
              message: "Network error: Please check your internet connection.",
            },
          });
        }
      }
    };

    fetchChapter();

    return () => {
      mounted = false;
    };
  }, [id, chapterId, navigate]);

  // === Initialize Quill Editor ===
  useEffect(() => {
    if (!editorRef.current || quillRef.current || loading) return;

    const toolbarOptions = [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      ["blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      [{ color: [] }, { background: [] }],
      ["link"],
      ["clean"],
    ];

    const quillInstance = new Quill(editorRef.current, {
      theme: "snow",
      placeholder: "Continue writing your chapter... Just type naturally!",
      modules: { toolbar: { container: toolbarOptions } },
    });

    quillRef.current = quillInstance;

    // Add custom scene break button
    const toolbar = editorRef.current.parentNode.querySelector(".ql-toolbar");
    if (toolbar) {
      const sceneBreakBtn = document.createElement("button");
      sceneBreakBtn.className = "ql-scene-break";
      sceneBreakBtn.innerHTML = '<span style="font-size: 16px;">✦</span>';
      sceneBreakBtn.title = "Insert Scene Break";
      sceneBreakBtn.type = "button";
      sceneBreakBtn.addEventListener("click", () => {
        const range = quillInstance.getSelection();
        if (range) {
          quillInstance.insertEmbed(range.index, "sceneBreak", true);
          quillInstance.setSelection(range.index + 1);
        }
      });
      toolbar.appendChild(sceneBreakBtn);
    }

    // Load content after editor is initialized
    if (chapterContent) {
      quillInstance.root.innerHTML = chapterContent;
    }

    return () => {
      // Cleanup editor on unmount
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, [loading, chapterContent]); // Initialize after loading state changes

  // === Handle Submit ===
  async function handleSubmit(e, status) {
    e.preventDefault();
    
    if (!quillRef.current) {
      setError("Editor not initialized");
      return;
    }

    setError("");
    setLoadingStates((prev) => ({ ...prev, [status]: true }));

    try {
      const content = quillRef.current.root.innerHTML;
      const form = { title, content };

      const res = await fetch(
        `https://fanhub-server.onrender.com/api/stories/${id}/chapters/${chapterId}/${status}/update`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
          credentials: "include",
        }
      );

      const data = await res.json();

      if (res.status === 500) {
        navigate("/error", {
          state: { message: data.message || "Process failed" },
        });
        return;
      }

      if (!res.ok && res.status !== 500) {
        setError(data.message);
        return;
      }

      showToast("Chapter updated successfully!", "success");
      setTimeout(() => {
        navigate(`/dashboard/story/${id}`);
      }, 1500);
    } catch (err) {
      navigate("/error", {
        state: {
          message: "Network error: Please check your internet connection.",
        },
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, [status]: false }));
    }
  }

  // === UI Rendering ===
  return (
    <div className="min-h-screen bg-theme py-8 px-4 sm:px-6 lg:px-8">
      <Toast
        message={toast.message}
        type={toast.type}
        isOpen={toast.isOpen}
        onClose={closeToast}
      />
      
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/dashboard/story/${id}`)}
            className="inline-flex items-center gap-2 text-secondary hover:text-theme transition-colors mb-4"
            aria-label="Back to story dashboard"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to Story
          </button>
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#2563eb]/10 rounded-lg">
              <Feather className="w-8 h-8 text-[#2563eb]" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-theme">Update Chapter</h1>
              <p className="text-secondary mt-2">Edit your chapter content and publish changes</p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="card py-16 text-center" role="status" aria-live="polite">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-16 h-16 text-[#2563eb] animate-spin" aria-hidden="true" />
              <div>
                <p className="text-theme text-lg font-medium mb-1">Loading chapter...</p>
                <p className="text-secondary text-sm">Please wait while we fetch your content</p>
              </div>
            </div>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
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
              <label htmlFor="chapter-title" className="block">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-[#2563eb]" aria-hidden="true" />
                  <span className="text-theme font-semibold text-lg">
                    Chapter Title <span className="text-red-500">*</span>
                  </span>
                </div>
                <input
                  id="chapter-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg text-lg focus:outline-none"
                  placeholder="Enter an engaging chapter title..."
                  aria-required="true"
                />
              </label>
            </div>

            {/* Quill Editor */}
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <Feather className="w-5 h-5 text-[#2563eb]" aria-hidden="true" />
                <span className="text-theme font-semibold text-lg">
                  Chapter Content <span className="text-red-500">*</span>
                </span>
              </div>
              <div className="quill-container">
                <div 
                  ref={editorRef} 
                  className="min-h-[500px]"
                  aria-label="Chapter content editor"
                />
              </div>
              <p className="text-secondary text-sm mt-3">
                💡 Tip: Use the ✦ button in the toolbar to add scene breaks
              </p>
            </div>

            {/* Action Buttons */}
            <div className="card">
              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  disabled={loadingStates.publish || !title.trim()}
                  onClick={(e) => handleSubmit(e, "publish")}
                  className="btn py-4 text-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingStates.publish ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-5 h-5" aria-hidden="true" />
                      Publish Changes
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={loadingStates.draft || !title.trim()}
                  onClick={(e) => handleSubmit(e, "unpublish")}
                  className="py-4 text-lg font-semibold rounded-lg border-2 border-gray-300 dark:border-gray-700 text-theme hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingStates.draft ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" aria-hidden="true" />
                      Save as Draft
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Publish</strong> will make your changes live immediately. 
                  <strong> Save as Draft</strong> will keep them private until you're ready.
                </p>
              </div>
            </div>

            {/* Tips Card */}
            <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-theme text-lg mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#2563eb]" aria-hidden="true" />
                Writing Tips
              </h3>
              <ul className="space-y-2 text-secondary text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-[#2563eb] font-bold">•</span>
                  <span>Use scene breaks (✦) to separate major scene transitions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2563eb] font-bold">•</span>
                  <span>Blockquotes are perfect for dialogue or emphasis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2563eb] font-bold">•</span>
                  <span>Save drafts frequently to avoid losing your work</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2563eb] font-bold">•</span>
                  <span>Headers help organize long chapters into sections</span>
                </li>
              </ul>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default UpdateChapter;