import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import Dashboard from './Componets/dashboard/dashboard.jsx';
import Signup from './Componets/auth/signup.jsx';
import Login from './Componets/auth/login.jsx';
import Logout from './Componets/auth/logout.jsx';

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
import CreatePost from './Componets/post/createPost.jsx';
import Posts from './Componets/post/postPage.jsx';

import { AuthProvider } from './Componets/auth/authContext.jsx';
import { UsersProvider } from './Componets/users/usersContext.jsx';
import { StoriesProvider } from './Componets/story/storiesContext.jsx';
import { CollectionProvider } from './Componets/gallery/collectionContext.jsx';
import { ImagesProvider } from './Componets/gallery/imagesContext.jsx';
import { VideosProvider } from './Componets/gallery/videosContext.jsx';
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
    path: "dashboard",
    element: <Dashboard />,
    children: [
      {
        path: "create story", 
        element: <Createstory />,
      },
      {
        path: "stories",
        element: <Stories />,
      },
      {
        path: "create collection",
        element: <CreateCollection />
      },
      {
        path: "collections",
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
        path: "share post",
        element: <CreatePost />
      },
      {
        path: "posts",
        element: <Posts />
      }
    ]
  },
  {
    path: "/story/:id",
    element: <StoryPage />
  },
  {
    path: "/update-story/:id",
    element: <Updatestory />
  },
  {
    path: "/story/:id/create chapter",
    element: <CreateChapter />
  },
  {
    path: "/story/:id/update chapter/:chapterId",
    element: <UpdateChapter />
  },
  {
    path: "/update collection/:id",
    element: <UpdateCollections />
  },
  {
    path: "/collections/:id",
    element: <CollectionPage />
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      {/* <UsersProvider> */}
        <StoriesProvider>
         <CollectionProvider>
          <ImagesProvider>
            <VideosProvider>
              <PostsProvider>
                <RouterProvider router={router} />
              </PostsProvider>
            </VideosProvider>
          </ImagesProvider>
         </CollectionProvider>
        </StoriesProvider>
      {/* </UsersProvider> */}
    </AuthProvider>
  </StrictMode>,
)