import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useStories } from "../story/storiesContext";
import { useCollections } from "../gallery/collectionContext";

function Reviews() {
    const { id, name } = useParams();
    const { stories } = useStories();
    const { collections } = useCollections();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [likes, setLikes] = useState([]);

    const story = name === "stories" ? stories.find(s => s.id == id) : null;
    const collection = name !== "stories" ? collections.find(c => c.id == id) : null;

    useEffect(() => {
        const item = name === "stories" ? story : collection;
        if (item) {
            setLikes(item.likes || []);
        }
    }, [story, collection, name]);

    useEffect(() => {
        async function fetchReviews() {
            setLoading(true);
            setError("");
            try {
                let response;
                if (name === "stories") {
                    response = await fetch(`https://fanhub-server.onrender.com/api/stories/${id}/reviews`, {
                        method: "GET",
                        credentials: "include",
                    });
                } else {
                    response = await fetch(`https://fanhub-server.onrender.com/api/gallery/collections/${id}/reviews`, {
                        method: "GET",
                        credentials: "include",
                    });
                }

                const data = await response.json();
                if (!response.ok) {
                    setError(data.message || "Something is wrong. Try again!");
                    return;
                }

                setReviews(data.reviews || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchReviews();
    }, [id, name]);

    async function likeReview(e) {
        e.preventDefault();
        setError("");
        try {
            const path = name === "stories"
                ? `https://fanhub-server.onrender.com/api/${name}/${id}/like/love`
                : `https://fanhub-server.onrender.com/api/gallery/${name}/${id}/like/love`;

            const response = await fetch(path, {
                method: "POST",
                credentials: "include",
            });

            const data = await response.json();
            if (!response.ok) {
                setError(data.message || "Something is wrong. Try again!");
                return;
            }

            alert("Liked!");
            setLikes(prev => [...prev, data.liked]);
        } catch (err) {
            console.log("error", err);
            alert("Something went wrong. Please try again.");
        }
    }

    return (
        <div>
            {loading && <p>Loading... please wait</p>}
            {error && <p>{error}</p>}
            <header>
                <b>Reviews</b>
            </header>

            {reviews.length > 0 ? (
                reviews.map(review => (
                    <div key={review.review.id}>
                        <li>{review.review.title}</li>
                        <li>{review.review.content}</li>
                        <li>{review.review.uploadedAt}</li>
                        <li>
                            <button onClick={likeReview}>
                                ❤️ {likes.length} {likes.length === 1 ? "Like" : "Likes"}
                            </button>
                        </li>
                    </div>
                ))
            ) : (
                <p>No reviews yet!</p>
            )}
        </div>
    );
}

export default Reviews;