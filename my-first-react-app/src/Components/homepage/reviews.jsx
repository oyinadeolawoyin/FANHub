import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import Delete from "../delete/delete";

function Reviews() {
    const { user } = useAuth();
    const { id, name } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [likeLoadingId, setLikeLoadingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [deletmessage, setDeletemessage] = useState("");

    useEffect(() => {
        async function fetchReviews() {
            setLoading(true);
            setError("");
            try {
                const path = name === "stories"
                ? `https://fanhub-server.onrender.com/api/stories/${id}/reviews`
                : `https://fanhub-server.onrender.com/api/gallery/collections/${id}/reviews`;

                const response = await fetch(path, {
                    method: "GET",
                    credentials: "include",
                });
           
                const data = await response.json();
                console.log("data", data.reviews);
                if (response.status === 500) {
                    navigate("/error", { state: { message: data.message || "Process failed" } });
                    return;
                } else {
                    if (!response.ok && response.status !== 500) {
                        setError(data.message); 
                        return;
                    }
                } 

                setReviews(data.reviews || []);
            } catch (err) {
                navigate("/error", {
                    state: { message: "Network error: Please check your internet connection." },
                });
            } finally {
                setLoading(false);
            }
        }
        fetchReviews();
    }, [id, name]);

    async function likeReview(e, reviewId) {
        e.preventDefault();
        setError("");
        setLikeLoadingId(reviewId);

        try {
          
            const path = name === "stories"
                ? `https://fanhub-server.onrender.com/api/${name}/${id}/reviews/${reviewId}/like/love`
                : `https://fanhub-server.onrender.com/api/gallery/${name}/${id}/reviews/${reviewId}/like/love`;

            const response = await fetch(path, {
                method: "POST",
                credentials: "include",
            });

            const data = await response.json();
            if (response.status === 500) {
                navigate("/error", { state: { message: data.message || "Process failed" } });
                return;
            } else {
                if (!response.ok && response.status !== 500) {
                    setError(data.message); 
                    return;
                }
            } 

            // Update story state locally
            setReviews(prev => prev.map(review => {
                if (review.id === reviewId) {
                    const likesData = data.message === "Liked!" ? 1 : -1;
                    return {
                        ...review,
                        _count: {
                            ...review._count,
                            likes: review._count.likes + likesData,
                        },
                        likedByCurrentUser: data.message === "Liked!",
                    };
                }
                return review;
            }));
            
            // If user liked, update social points
            if (data.message === "Liked!") {
                const socialResponse = await fetch(`https://fanhub-server.onrender.com/api/users/${user.id}/social/likepoint`, {
                method: "POST",
                credentials: "include",
                });
        
                if (!socialResponse.ok) {
                const errData = await socialResponse.json();
                setError(errData.message || "Something went wrong with like points!");
                }
            }

            
        } catch (err) {
            navigate("/error", {
                state: { message: "Network error: Please check your internet connection." },
            });
        } finally {
            setLikeLoadingId(null)
        }
    }


    async function handleDelete(reviewId) {
        setDeletingId(reviewId);
        try{
            const message = name === "stories"
            ? await Delete(`https://fanhub-server.onrender.com/api/stories/${id}/reviews/${reviewId}`)
            : await Delete(`https://fanhub-server.onrender.com/api/gallery/collections/${id}/reviews/${reviewId}`);   
            
            setDeletemessage(message);
            
            setReviews(prev => prev.filter(r => Number(r.id) !== Number(reviewId)))
            
        } catch(err) {
            navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div>
            {loading ? (
                <p>Loading... please wait</p>
            ):(
                <div>
                    <header>
                        <b>Reviews</b>
                    </header>
                    {reviews.length > 0 ? (
                        reviews.map(review => (
                            <div key={review.id}>
                                <li>{review.title}</li>
                                <li>{review.content}</li>
                                <li>{review.uploadedAt}</li>
                                <li>Overall Rate: {review.overallrate}</li>
                                {name == "stories" && (
                                    <div>
                                        <li>Plot Rate: {review.plotrate}</li>
                                        <li>Writing Style Rate: {review.writingstylerate}</li>
                                        <li>Grammar Rate: {review.grammarrate}</li>
                                    </div>
                                )}
                                <li>
                                    <button  onClick={(e) => likeReview(e, review.id)} disabled={likeLoadingId}>
                                        {review.likedByCurrentUser ? "❤️ Liked" : "🤍 Like"} {review._count.likes}
                                    </button>
                                </li>
                                {(user.id === review.userId || review.userId === user.id) && (
                                    <button disabled={deletingId === review.id}
                                        onClick={() => {
                                            const confirmed = window.confirm("Are you sure you want to delete this chapter?");
                                            if (confirmed) {
                                            handleDelete(review.id);
                                            }
                                        }}
                                    >
                                         {deletingId === review.id ? "Deleting..." : "Delete"}
                                     </button>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No reviews yet!</p>
                    )}
                </div>
            )}
            {error && <p>{error}</p>}   
        </div>
    );
}

export default Reviews;