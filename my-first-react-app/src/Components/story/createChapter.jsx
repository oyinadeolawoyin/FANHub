import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import "../css/quill-theme.css";
import { BookOpen, Feather, Rocket, Save, Lightbulb, Sparkles, ArrowLeft } from "lucide-react";
import { Toast, useToast } from "../utils/toast-modal";

// Custom Scene Break Blot
const BlockEmbed = Quill.import('blots/block/embed');

class SceneBreakBlot extends BlockEmbed {
  static blotName = 'sceneBreak';
  static tagName = 'div';
  static className = 'scene-break';

  static create() {
    const node = super.create();
    node.setAttribute('contenteditable', 'false');
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

function CreateChapter() {
  const [title, setTitle] = useState("");
  const { user } = useAuth();
  const { id } = useParams();
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loadingStates, setLoadingStates] = useState({
    publish: false,
    draft: false,
  });

  const { toast, showToast, closeToast } = useToast();

  const editorRef = useRef(null);
  const quillRef = useRef(null);

  // Initialize Quill editor
  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      const toolbarOptions = [
        [{ header: [1, 2, 3, 4, false] }],
        ["bold", "italic", "underline", "strike"],
        ["blockquote", "code-block"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ align: [] }],
        [{ color: [] }, { background: [] }],
        ["link"],
        ["clean"],
      ];

      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder:
          "Start writing your chapter here... Let your imagination flow freely.",
        modules: {
          toolbar: {
            container: toolbarOptions,
          },
        },
      });

      // Add scene break button to toolbar
      const toolbar = editorRef.current.parentNode.querySelector(".ql-toolbar");
      if (toolbar) {
        // Create custom scene break button
        const sceneBreakBtn = document.createElement('button');
        sceneBreakBtn.className = 'ql-scene-break';
        sceneBreakBtn.innerHTML = '<span style="font-size: 16px;">✦</span>';
        sceneBreakBtn.title = 'Insert Scene Break';
        sceneBreakBtn.type = 'button';
        
        sceneBreakBtn.addEventListener('click', () => {
          const range = quillRef.current.getSelection();
          if (range) {
            quillRef.current.insertEmbed(range.index, 'sceneBreak', true);
            quillRef.current.setSelection(range.index + 1);
          }
        });

        // Add to toolbar
        toolbar.appendChild(sceneBreakBtn);
        
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
    }
  }, []);

  async function handleSubmit(e, status) {
    e.preventDefault();
    setError("");
    setLoadingStates((prev) => ({ ...prev, [status]: true }));

    try {
      const content = quillRef.current.root.innerHTML;

      const form = { title, content };

      const response = await fetch(
        `https://fanhub-server.onrender.com/api/stories/${id}/createChapter/${status}`,
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
      } else if (!response.ok) {
        setError(data.message);
        return;
      }

      // Update writing streak
      const streak = await fetch(
        `https://fanhub-server.onrender.com/api/users/${user.id}/writingStreak`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!streak.ok) {
        const errData = await streak.json();
        setError(errData.message || "Failed to update writing streak");
      }

      // Update social points
      const socialResponse = await fetch(
        `https://fanhub-server.onrender.com/api/users/${user.id}/social/writingpoint`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!socialResponse.ok) {
        const errData = await socialResponse.json();
        setError(errData.message || "Failed to update writing points");
      }

      showToast("Chapter created successfully!", "success");
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

  return (
    <div className="min-h-screen bg-theme px-4 sm:px-6 py-8">
      <Toast
        message={toast.message}
        type={toast.type}
        isOpen={toast.isOpen}
        onClose={closeToast}
      />
      
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <button
            onClick={() => navigate(`/dashboard/story/${id}`)}
            className="inline-flex items-center gap-2 text-secondary hover:text-theme transition-colors mb-4"
            aria-label="Back to story dashboard"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to Story
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text flex items-center justify-center gap-3">
            <Feather className="w-8 h-8 text-accent" />
            Create a New Chapter
          </h1>
          <p className="text-secondary text-sm sm:text-base mt-2 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            Let your creativity shine through every line you write.
          </p>
        </header>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {/* Title Input */}
          <div className="card p-5">
            <label className="block mb-2 font-semibold text-theme flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Chapter Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full mt-2 px-4 py-3 rounded-lg text-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter an engaging title..."
            />
          </div>

          {/* Quill Editor */}
          <div className="card p-5">
            <label className="block mb-3 font-semibold text-theme flex items-center gap-2">
              <Feather className="w-5 h-5 text-accent" />
              Chapter Content
            </label>
            <div
              ref={editorRef}
              className="quill-container min-h-[350px] sm:min-h-[500px] rounded-lg border border-border bg-card-theme"
            />
            <div className="mt-4 text-xs sm:text-sm text-secondary bg-secondary/10 p-3 rounded-lg flex items-start gap-2">
              <Lightbulb className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <strong>Tip:</strong> Use headers for scene breaks, blockquote
                for dialogue, and the <span className="font-bold text-accent">✦ button</span> to insert beautiful scene dividers.
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              disabled={loadingStates.publish}
              onClick={(e) => handleSubmit(e, "publish")}
              className="btn flex-1 py-3 text-lg font-semibold bg-primary text-white rounded-lg transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Rocket className="w-5 h-5" />
              {loadingStates.publish ? "Publishing..." : "Publish Chapter"}
            </button>

            <button
              type="button"
              disabled={loadingStates.draft}
              onClick={(e) => handleSubmit(e, "unpublish")}
              className="flex-1 py-3 text-lg font-semibold rounded-lg border-2 border-primary text-primary hover:bg-primary/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {loadingStates.draft ? "Saving..." : "Save as Draft"}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="card bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-3 rounded-lg animate-fadeIn flex items-center gap-2">
              <span className="text-xl">⚠️</span> {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default CreateChapter;