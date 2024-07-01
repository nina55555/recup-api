
//
import React, {useState} from "react";
import { QueryClient,QueryClientProvider } from "react-query";


import { Route, Routes ,RouterProvider, Link} from "react-router-dom";
import './css/App.css'
import Welcome from "./pages/Welcome";
import  Navbar  from "./components/Navbar";
//import Home  from "./components/pages/Home";
import Home from "./pages/Home";
//import  About  from "./components/pages/About";
import About from "./pages/About";
//import  Services  from './components/pages/Services';
import Book from "./pages/Book";
import Collection from "./pages/Collection";
import Contact from "./pages/Contact";

import Enchere from "./pages/Enchere";
import HomeSuper from "./pages/HomeSuper";
import ErrorPage from "./pages/ErrorPage";
import SingleProduct from "./pages/SingleProduct";









//
const queryClient = new QueryClient()




function App() {

  const [page, setPage] = useState('');



  return ( 

    //
    <QueryClientProvider client= {queryClient}>


  
  <div className='App'>    
    {/* 
    <Navbar setPage= {setPage}/>
    {page === 'enchere' ? <Enchere /> : " "}
    */}
   
     
    <Navbar/>

{/*
  <Link to='/SingleProduct/1' >prod1</Link>
    <Link to='/SingleProduct/2' >prod2</Link>
*/}
    
    
    
    <Routes>
      <Route path="/" element={<Welcome/>} />

      <Route path="/home" element={<Home/>} />

      <Route path="/collection" element={<Collection/>} />
      <Route path="/book" element={<Book/>} />
      <Route path="/about" element={<About/>} />

      <Route path="/contact" element={<Contact/>} />
      {/*<Route path="/enchere" element={<Enchere/>} /> */}
      <Route path="/SingleProduct/" element={<SingleProduct/>} />

      <Route path="/SingleProduct/:id" element={<SingleProduct/>} />


      
    </Routes>

  </div>

  </QueryClientProvider>

  )
}

export default App















//premiere version

/*
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
        path: "/recup-api/",
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

*/