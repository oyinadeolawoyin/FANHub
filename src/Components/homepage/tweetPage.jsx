import React from "react";
import TweetFeed from "../tweets/tweetsFeed";

function TweetPage() {
  return (
    <div>
      <h2>Tweet</h2>
      <TweetFeed
        url="https://fanhub-server.onrender.com/api/tweets"
        single={true}
      />
    </div>
  );
}

export default TweetPage;