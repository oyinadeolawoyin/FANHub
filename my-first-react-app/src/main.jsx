import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import Dashboard from './Componets/dashboard/dashboard.jsx';
import Signup from './Componets/auth/signup.jsx';
import Login from './Componets/auth/login.jsx';
import Logout from './Componets/auth/logout.jsx';
import  Createstory from './Componets/story/createStory.jsx';
import Stories from './Componets/story/stories.jsx';
import StoryPage from './Componets/story/storyPage.jsx';
import Updatestory from './Componets/story/updateStory.jsx';
import CreateChapter from './Componets/story/createChapter.jsx';
import UpdateChapter from './Componets/story/chapterPage.jsx';
import UploadImage from './Componets/gallery/createImage.jsx';
import Images from './Componets/gallery/images.jsx';
import UploadVideo from './Componets/gallery/createVideo.jsx';
import Videos from './Componets/gallery/videos.jsx';

import { AuthProvider } from './Componets/auth/authContext.jsx';
import { UsersProvider } from './Componets/users/usersContext.jsx';
import { StoriesProvider } from './Componets/story/storiesContext.jsx';
import { ImagesProvider } from './Componets/gallery/imagesContext.jsx';
import { VideosProvider } from './Componets/gallery/videosContext.jsx';


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
        path: "upload image",
        element: <UploadImage />,
      },
      {
        path: "upload video",
        element: <UploadVideo />
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
    path: "images",
    element: <Images />
  },
  {
    path: "videos",
    element: <Videos />
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      {/* <UsersProvider> */}
        <StoriesProvider>
          {/* <ImagesProvider> */}
            {/* <VideosProvider> */}
              <RouterProvider router={router} />
            {/* </VideosProvider> */}
          {/* </ImagesProvider> */}
        </StoriesProvider>
      {/* </UsersProvider> */}
    </AuthProvider>
  </StrictMode>,
)