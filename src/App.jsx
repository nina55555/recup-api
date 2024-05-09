import { useState } from 'react'
import './css/App.css'
import {
  createBrowserRouter,
  Route,
  Link,
  RouterProvider,
} from "react-router-dom";
import Navbar from './components/Navbar'
import Video from './components/Video'
import Home from './pages/Home'
import Collection from './pages/Collection'
import About from './pages/About'
import Contact from './pages/Contact'
import ErrorPage from './pages/ErrorPage'
import Book from './pages/Book'
import Welcome from './pages/Welcome';




const router = createBrowserRouter([
 
      {

      path: "/",
    element: <Welcome />,
      },
   
  {
    path: "/home",
    element: <Home />,
  },

  {
    path: "/collection",
    element: <Collection />,
  },

  {
    path: "/about",
    element: <About />,
  },

  {
    path: "/contact",
    element: <Contact />,
  },

  {
    path: "*",
    element: <ErrorPage />,
  },

  {
    path: "/book",
    element: <Book />,
  },

]);

function App() {
  return (
    <div className='App'>
      <RouterProvider router={router} />
     
    </div>
  )
}

export default App 

/*<h1 className='contour'>je suis le tout puissant App</h1>
<Video />
*/