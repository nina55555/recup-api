
import React, {useState} from 'react';
import axios from 'axios';
import { useQuery} from 'react-query';
import '../css/Cards.css';
import { Link, useParams} from 'react-router-dom';
import Enchere from './Enchere';
import SingleProduct from './SingleProduct.jsx';
import Countdown from '../components/Countdown.jsx';
import '../css/Collection.css'




const Collection = () => {

    //
    const {id} = useParams();
    console.log({id} )


/*
   const handleClick = (e) =>{
    <SingleProduct/>
    }
*/
/*
   const {productId } = useParams();
        const product = model.find((product) => product.id === productId);
        console.log (product)
        //const {imageUrl, title} = product
*/

    const {data, isError, isLoading} = useQuery ('model', () => {
    //return axios.get ('http://localhost:3002/collection-test/');
    //return axios.get (' http://localhost:5979/runways/');
    return axios.get (' http://localhost:5978/defilons/');  


    })

        return (
            <> 
            <Countdown/>

            <div className="show">

                {data?.data.map((product) =>{
                return <div className= 'card' key={product.id} >
                    {/*item.imageUrl*/} 
                    {/*product.title*/}
                    {/*item.author*/} 
                    
                            {/*
                            <button ><a href='/Enchere' >Acheter ce model</a></button>
                            */}

                            {/*
                            <Link to={`/SingleProduct `} >more infos</Link>
                            */}

                            {/*
                            <button onClick={() => handleClick() } >click to open</button>
                            */}
                           
                            
                            {/*<Link to={`/SingleProduct/${id} `} >ouvre moi stp</Link> */}
                            
                
                            <button ><a href='/SingleProduct/:id' >Acheter ce model</a></button>

                            {/*
                            <Link to='/SingleProduct/:product.id' >prod</Link>
                            */}

                    <img src={product.imageUrl} alt= "photo model"/>
                    {/*   <img src={item.imgUrl} alt= "photo model"/>   */}

                    {/*  <video src ={item.videoUrl} ></video>   */}
                </div>
                })}
            </div>
            
            </>
        );
    };
export default Collection;













/*
import Navbar from "../components/Navbar"

export default function Collection() {
    return (
        <div> 
      <h1>Je m'appelle Collection page</h1>

        </div>
    )
  }
  */