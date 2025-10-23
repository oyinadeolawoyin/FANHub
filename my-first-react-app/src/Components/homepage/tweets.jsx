import React from "react";
import TweetFeed from "../tweets/tweetsFeed";

function TweetsPage() {
  return (
    <div>
      <h2>All Tweets</h2>
      <TweetFeed url="https://fanhub-server.onrender.com/api/tweets" />
    </div>
  );
}

export default TweetsPage;