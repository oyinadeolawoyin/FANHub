import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import Dashboard from './Componets/dashboard/dashboard.jsx';
import Profile from './Componets/profile/profile.jsx';
import Signup from './Componets/auth/signup.jsx';
import Login from './Componets/auth/login.jsx';
import Logout from './Componets/auth/logout.jsx';
import Notification from './Componets/notification/notification.jsx';
import Library from './Componets/library/library.jsx';
import Usersettings from './Componets/auth/userSetting.jsx';
import Forgetpassword from './Componets/auth/forgetpassword.jsx';
import Resetpassword from './Componets/auth/resetpassword.jsx';
import Errorpage from './Componets/error/error.jsx';

import Createstory from './Componets/story/createStory.jsx';
import Stories from './Componets/story/stories.jsx';
import StoryPage from './Componets/story/storyPage.jsx';
import Updatestory from './Componets/story/updateStory.jsx';
import CreateChapter from './Componets/story/createChapter.jsx';
import UpdateChapter from './Componets/story/updateChapter.jsx';

import CreateCollection from './Componets/gallery/createCollection.jsx';
import Collections from './Componets/gallery/collections.jsx';
import UpdateCollections from './Componets/gallery/updateCollection.jsx';
import CollectionPage from './Componets/gallery/collectionPage.jsx';
import UploadImage from './Componets/gallery/createImage.jsx';
import Images from './Componets/gallery/images.jsx';
import UploadVideo from './Componets/gallery/createVideo.jsx';
import Videos from './Componets/gallery/videos.jsx';

import About from './Componets/profile/about.jsx';
import ProfileStories from './Componets/profile/profileStories.jsx';
import ProfileCollections from './Componets/profile/profileCollections.jsx';
import Gallery from './Componets/profile/gallery.jsx';
import ProfilePosts from './Componets/profile/profilePosts.jsx';
import Follower from './Componets/profile/followers.jsx';
import Following from './Componets/profile/following.jsx';

import HomeStoryPage from './Componets/homepage/storypage.jsx';
import WriteReview from './Componets/homepage/writeReview.jsx';
import Reviews from './Componets/homepage/reviews.jsx';
import Chapter from './Componets/homepage/chapterPage.jsx';
import HomepageCollections from './Componets/homepage/collectionPage.jsx';

import { AuthProvider } from './Componets/auth/authContext.jsx';
import { UserProvider } from './Componets/profile/usersContext.jsx';
import { StoriesProvider } from './Componets/story/storiesContext.jsx';
import { CollectionProvider } from './Componets/gallery/collectionContext.jsx';
// import { ImagesProvider } from './Componets/gallery/imagesContext.jsx';
// import { VideosProvider } from './Componets/gallery/videosContext.jsx';
import { PostsProvider } from './Componets/post/postContext.jsx';


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
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
      <UserProvider>
        <StoriesProvider>
         <CollectionProvider>
          {/* <ImagesProvider> */}
            {/* <VideosProvider> */}
              <PostsProvider>
                <RouterProvider router={router} />
              </PostsProvider>
            {/* </VideosProvider> */}
          {/* </ImagesProvider> */}
         </CollectionProvider>
        </StoriesProvider>
      </UserProvider>
    </AuthProvider>
  </StrictMode>,
)