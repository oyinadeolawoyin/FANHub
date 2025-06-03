import { useEffect, useState } from "react";
import { useStories } from "./storiesContext";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function StoryPage() {
    const { id } = useParams();
    const { selectedChapters } = useStories();
    const navigate = useNavigate();
    
    const chapter = selectedChapters.find(chapter => chapter.id == id);
    
    console.log("chap", chapter);
    if (!chapter) {
        return <p>Chapter not found. Please return to the story page.</p>;
    }

    return (
        <div>
            {loading && <p>Loading...please wait</p>}
            {error && <p>{error}</p>}
            <main>
                <li>{chapter.title}</li>
                <li>{chapter.content}</li>
                <li>{chapter.likes.length}</li>
                
                {chapter.comments.length > 0 ? (
                    chapter.comments.map(comment => (
                        <div key={comment.id}>
                            <li>{comment.length}</li>
                        </div>
                ))
                ) : (
                <p>No chapters yet!</p>
                )}
            </main>
        </div>
    );
}

export default StoryPage;