import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import Dashboard from './Components/dashboard/dashboard.jsx';
import Profile from './Components/profile/profile.jsx';
import Signup from './Components/auth/signup.jsx';
import Login from './Components/auth/login.jsx';
import Logout from './Components/auth/logout.jsx';
import Notification from './Components/notification/notification.jsx';
import Library from './Components/library/library.jsx';
import Usersettings from './Components/auth/userSetting.jsx';
import CreateTweet from './Components/tweets/createTweet.jsx';
import UpdateTweet from './Components/tweets/updateTweet.jsx';
import TweetsPage from './Components/homepage/tweets.jsx';
import TweetPage from './Components/homepage/tweetPage.jsx';
import Forgetpassword from './Components/auth/forgetpassword.jsx';
import Resetpassword from './Components/auth/resetpassword.jsx';
import Errorpage from './Components/error/error.jsx';
import Homestories from './Components/homepage/stories.jsx';
import Homecollections from './Components/homepage/collections.jsx';

import Createstory from './Components/story/createStory.jsx';
import Stories from './Components/story/stories.jsx';
import StoryPage from './Components/story/storyPage.jsx';
import Updatestory from './Components/story/updateStory.jsx';
import CreateChapter from './Components/story/createChapter.jsx';
import UpdateChapter from './Components/story/updateChapter.jsx';

import CreateCollection from './Components/gallery/createCollection.jsx';
import Collections from './Components/gallery/collections.jsx';
import UpdateCollections from './Components/gallery/updateCollection.jsx';
import CollectionPage from './Components/gallery/collectionPage.jsx';
import UploadImage from './Components/gallery/createImage.jsx';
import Images from './Components/gallery/images.jsx';
import UploadVideo from './Components/gallery/createVideo.jsx';
import Videos from './Components/gallery/videos.jsx';

import About from './Components/profile/about.jsx';
import ProfileStories from './Components/profile/profileStories.jsx';
import ProfileCollections from './Components/profile/profileCollections.jsx';
import Gallery from './Components/profile/gallery.jsx';
import ProfilePosts from './Components/profile/profilePosts.jsx';
import Follower from './Components/profile/followers.jsx';
import Following from './Components/profile/following.jsx';
import UserTweets from './Components/profile/userTweets.jsx';

import HomeStoryPage from './Components/homepage/storypage.jsx';
import WriteReview from './Components/homepage/writeReview.jsx';
import Reviews from './Components/homepage/reviews.jsx';
import Chapter from './Components/homepage/chapterPage.jsx';
import HomepageCollections from './Components/homepage/collectionPage.jsx';

import { AuthProvider } from './Components/auth/authContext.jsx';

import { CollectionProvider } from './Components/gallery/collectionContext.jsx';


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "homestories",
        element: <Homestories />
      },
      {
        path: "homecollections",
        element: <Homecollections />
      },
    ]
  },
  {
    path: "signup",
    element: <Signup />
  },
  {
    path: "login",
    element: <Login />
  },
  {
    path: "logout",
    element: <Logout />
  },
  {
    path: "notification/:id",
    element: <Notification />
  },
  {
    path: "library/:id",
    element: <Library />
  },
  {
    path: "settings/:id",
    element: <Usersettings />
  },
  {
    path: "forget-password",
    element: <Forgetpassword />
  },
  {
    path: "reset-password",
    element: <Resetpassword />
  },
  {
    path: "create-tweet",
    element: <CreateTweet />
  },
  {
    path: "update-tweet/:id",
    element: <UpdateTweet />
  },
  {
    path: "tweets",
    element: <TweetsPage />
  },
  {
    path: "tweets/:id",
    element: <TweetPage />
  },
  {
    path: "error",
    element: <Errorpage />
  },
  {
    path: "/stories/:id",
    element: <HomeStoryPage />
  },
  {
    path: "/:name/:id/reviews",
    element: <Reviews />
  },
  {
    path: "/:name/:id/review",
    element: <WriteReview />
  },
  {
    path: "/stories/:storyId/chapters/:chapterId",
    element: <Chapter />
  },
  {
    path: "/gallery/:id",
    element: <HomepageCollections />
  },
  {
    path: "dashboard",
    element: <Dashboard />,
    children: [
      {
        path: "create story", 
        element: <Createstory />,
      },
      {
        path: "stories/:id",
        element: <Stories />,
      },
      {
        path: "create collection",
        element: <CreateCollection />
      },
      {
        path: "collections/:id",
        element: <Collections />
      },
      {
        path: "upload image",
        element: <UploadImage />,
      },
      {
        path: "upload video",
        element: <UploadVideo />
      },
      {
        path: "images",
        element: <Images />
      },
      {
        path: "videos",
        element: <Videos />
      },
      {
        path: "story/:id",
        element: <StoryPage />
      },
      {
        path: "update-story/:id",
        element: <Updatestory />
      },
      {
        path: "story/:id/create chapter",
        element: <CreateChapter />
      },    
      {
        path: "story/:id/update chapter/:chapterId",
        element: <UpdateChapter />
      },
      {
        path: "update collection/:id",
        element: <UpdateCollections />
      },
      {
        path: "collections/collection/:id",
        element: <CollectionPage />
      },
    ]
  },
  {
    path: "profile/:username/:id",
    element: <Profile />,
    children: [
      {
        path: "about",
        element: <About />
      },
      {
        path: "stories",
        element: <ProfileStories />
      },
      {
        path: "collections",
        element: <ProfileCollections />
      },
      {
        path: "gallery",
        element: <Gallery />
      },
      {
        path: "posts",
        element: <ProfilePosts />
      },
      {
        path: "tweets",
        element: <UserTweets />
      },
      {
        path: "following",
        element: <Following />
      },
      {
        path: "followers",
        element: <Follower />
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      {/* <UserProvider> */}
        {/* <StoriesProvider> */}
         <CollectionProvider>
          {/* <ImagesProvider> */}
            {/* <VideosProvider> */}
              {/* <PostsProvider> */}
                <RouterProvider router={router} />
              {/* </PostsProvider> */}
            {/* </VideosProvider> */}
          {/* </ImagesProvider> */}
         </CollectionProvider>
        {/* </StoriesProvider> */}
      {/* </UserProvider> */}
    </AuthProvider>
  </StrictMode>,
)