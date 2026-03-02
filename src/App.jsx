

import React, {useState} from "react";
import ReactDom from 'react-dom';
import { QueryClient,QueryClientProvider } from "react-query";
import { Route, Routes ,RouterProvider, Link} from "react-router-dom";
import './css/App.css'

import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";

import Welcome from "./pages/Welcome";
import  Navbar  from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Book from "./pages/Book";
import Collection from "./pages/Collection";
import CollectionAtest from "./pages/CollectionAtest";
import CollectionAtest2 from "./pages/CollectionAtest2";
import CollectionShow from "./pages/CollectionShow";




import Conc from "./pages/Conc";
import Contact from "./pages/Contact";
/*import Enchere from "./pages/Enchere";*/
import HomeSuper from "./pages/HomeSuper";
import ErrorPage from "./pages/ErrorPage";
import SingleProduct from "./pages/Product";
import Product from "./pages/Product";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import Icons from "./components/Icons";

/*import New from "./pages/New";*/
/*import CollectionShow from "./pages/CollectionShow"*/



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
    
    <Routes>
      <Route path="/" element={<Welcome/>} />
      <Route path="/signup" element={<Signup/>} />
      <Route path="/signin" element={<Signin/>} />
      <Route path="/home" element={<Home/>} />
      <Route path="/collection" element={<Collection/>} />
      <Route path="/collectionAtest" element={<CollectionAtest/>} />
      <Route path="/collectionAtest2" element={<CollectionAtest2/>} />
      <Route path="/collectionShow" element={<CollectionShow/>} />


      
      {/*<Route path="/new" element={<New/>} />*/}



      {/*<Route path="/collectionShow" element={<CollectionShow/>} />*/}
      {/*<Route path="/collectionShow/:id" element={<CollectionShow/>} />*/}


      <Route path="/book" element={<Book/>} />
      <Route path="/about" element={<About/>} />
      <Route path="/contact" element={<Contact/>} />
      <Route path= "/conc" element={<Conc/>} />

      {/*<Route path="/enchere" element={<Enchere/>} /> */}
      
      <Route path="/Product/:id" element={<Product/>} />



      
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