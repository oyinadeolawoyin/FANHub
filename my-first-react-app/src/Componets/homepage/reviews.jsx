import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import Delete from "../delete/delete";

function Reviews() {
    const { user } = useAuth();
    const { id, name } = useParams();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [reviews, setReviews] = useState([]);

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
                console.log("dat", data);
                if (!response.ok) {
                    setError(data.message || "Something is wrong. Try again!");
                    console.log(data.error);
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

    async function likeReview(e, reviewId) {
        e.preventDefault();
        setError("");
        try {
          
            const path = name === "stories"
                ? `https://fanhub-server.onrender.com/api/${name}/${id}/reviews/${reviewId}/like/love`
                : `https://fanhub-server.onrender.com/api/gallery/${name}/${id}/reviews/${reviewId}/like/love`;

            const response = await fetch(path, {
                method: "POST",
                credentials: "include",
            });

            const data = await response.json();
            if (!response.ok) {
                setError(data.message || "Something is wrong. Try again!");
                return;
            }

            console.log("data like", data);
            setReviews(prev =>
                prev.map(review => {
                    if (review.review.id !== reviewId) return review;
                    if (data.like) {
                        return {
                            ...review,
                            likes: review.likes.filter(like => like.userId !== data.userId || like.like !== data.like)
                        };
                    }
            
                    if (data.liked) {
                        return {
                            ...review,
                            likes: [...review.likes, data.liked]
                        };
                    }
            
                    return review;
                })
            );

            if (data.liked) {
                const socialResponse = await fetch(`https://fanhub-server.onrender.com/api/users/${user.id}/social/likepoint`, {
                    method: "POST",
                    credentials: "include",
                });
    
                const socialData = await socialResponse.json();
                if (!socialResponse.ok) {
                    setError(socialData.message || "Something is wrong. Try again!");
                    return;
                }     
            } 
            
        } catch (err) {
            console.log("error", err);
            alert("Something went wrong. Please try again.");
        }
    }


    async function handleDelete(reviewId) {
        try{
            const message = name === "stories"
            ? await Delete(`https://fanhub-server.onrender.com/api/stories/${id}/reviews/${reviewId}`)
            : await Delete(`https://fanhub-server.onrender.com/api/gallery/collections/${id}/reviews/${reviewId}`);   
            
            alert("delete message", message);
            console.log("mess", message);
            
            setReviews(prev => prev.filter(s => s.id !== Number(reviewId)))
            
        } catch(err) {
            console.log("Failed to delete:", err.message);
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
                        <li>Overall Rate: {review.review.overallrate}</li>
                        {name == "stories" && (
                            <div>
                                <li>Plot Rate: {review.review.plotrate}</li>
                                <li>Writing Style Rate: {review.review.writingstylerate}</li>
                                <li>Grammar Rate: {review.review.grammarrate}</li>
                            </div>
                        )}
                        <li>
                            <button onClick={(e) => likeReview(e, review.review.id)}>
                                ❤️ {review.likes.length} {review.likes.length === 1 ? "Like" : "Likes"}
                            </button>
                        </li>
                        <button
                            onClick={() => {
                                const confirmed = window.confirm("Are you sure you want to delete this chapter?");
                                if (confirmed) {
                                handleDelete(review.review.id);
                                }
                            }}
                        >
                            Delete
                        </button>
                    </div>
                ))
            ) : (
                <p>No reviews yet!</p>
            )}
        </div>
    );
}

export default Reviews;