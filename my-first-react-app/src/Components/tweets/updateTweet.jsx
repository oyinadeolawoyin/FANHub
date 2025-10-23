import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import { tags } from "../genre/tags";
import Select from "react-select";

function UpdateTweet() {
  const [form, setForm] = useState({
    title: "",
    content: "",
    media: null,
    tags: [],
  });

  const { id } = useParams();
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tweet, setTweet] = useState(null);
  const [tweetLoading, setTweetLoading] = useState(false);

  useEffect(() => {
    if (tweet) {
      setForm({
        title: "",
        content: tweet.content || "",
        media: tweet.media || null,
        tags: tweet.tags || [],
      });
    }
  }, [tweet]);

  useEffect(() => {
    async function fetchTweet() {
      setError("");
      setTweetLoading(true);
      try {
        const response = await fetch(`https://fanhub-server.onrender.com/api/tweets/${id}/tweet`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (response.status === 500) {
          navigate("/error", { state: { message: data.message || "Process failed" } });
          return;
        } else if (!response.ok) {
          setError(data.message);
          return;
        }

        setTweet(data.tweet);
      } catch (err) {
        navigate("/error", { state: { message: "Network error: Please check your connection." } });
      } finally {
        setTweetLoading(false);
      }
    }

    fetchTweet();
  }, [id, navigate]);

  const handleChange = (e) => {
    if (!e || !e.target) return;

    const { name, value, type, files } = e.target;
    setForm((prev) => {
      if (type === "file") {
        return { ...prev, [name]: files[0] };
      }
      return { ...prev, [name]: value };
    });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("content", form.content);
    if (form.image) formData.append("file", form.media);
    formData.append("tags", JSON.stringify(form.tags));

    try {
      const response = await fetch(`https://fanhub-server.onrender.com/api/tweets/${id}/update`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (response.status === 500) {
        navigate("/error", { state: { message: data.message || "Process failed" } });
        return;
      } else if (!response.ok) {
        setError(data.message);
        return;
      }

      alert("Tweet updated!");
    //   navigate(`/profile/${user.id}`);
    } catch (err) {
      navigate("/error", { state: { message: "Network error: Please check your internet connection." } });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Update Tweet</h2>
      {tweetLoading && <p>Loading, please wait...</p>}

      {tweet && (
        <form onSubmit={handleSubmit}>
           <label>
            Title:{" "}
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Update your tweet title"
            />
          </label>

          <label>
            Content:{" "}
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              required
              placeholder="What's on your mind?"
            />
          </label>

          <label>
            Upload image (optional):{" "}
            <input
              type="file"
              name="media"
              onChange={handleChange}
            />
          </label>

          <label>
            Tags:
            <Select
              isMulti
              name="tags"
              options={tags.map((tag) => ({
                value: tag,
                label: tag,
              }))}
              value={form.tags.map((t) => ({ value: t, label: t }))}
              onChange={(selected) => {
                if (selected.length > 5) return; // limit to 4 tags
                setForm((prev) => ({
                  ...prev,
                  tags: selected.map((s) => s.value),
                }));
              }}
              placeholder="Select up to 5 tags"
              className="basic-multi-select"
              classNamePrefix="select"
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update"}
          </button>
        </form>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default UpdateTweet;