


//page test
import React, {useState, useEffect} from 'react';

import { useParams } from 'react-router-dom';

import { useQuery } from 'react-query';

//import { useParams } from 'react-router-dom';
import Collection from './Collection';
import Countdown from '../components/Countdown';
import Enchere from '../components/Enchere.jsx';
import '../css/Product.css';








const Product = () => { 
    const {id} = useParams();


    
    const [product, setProduct] = useState ([]);
    const [loading, setLoading]= useState(false);

    useEffect (() => {
        const getProduct = async () => {
            setLoading (true);
            //find solution id undefined bad request
                    const response = await fetch ('http://localhost:5978/defilons/'+id);
            setProduct(await response.json());
        setLoading(false);        
    }
    getProduct()
    }, []);




    //avant
    /*
   const product = Collection.find((product) => product.id === id);
   console.log (product)
   //const {imageUrl, title} = product
*/
    

   
   const Loading = () => {
    return(
        <>
        Loading...
        </>
    )
   }

   const ShowProduct = () => {
    /*
    const product = Collection.find((product) => product.id === id);
    console.log (product)
    //const {imageUrl, title} = product
    */
    return(
        <div className="big--box">
            < Countdown/>
            <div className="images--box">
                    
                <img className='paint' src="/src/assets/wallpaint.jpg" alt="wallpaint" />
                
                <div className="show-product">
                <img src={product.imageUrl} alt= "photo model" />
                {/* <img src={product._id.imageUrl} alt= "photo model" /> */}
                </div>

            </div>
            
        </div>
    )    
   }


   
    return (
            <div className='main--box'>
                
                {/*<img src={product.imageUrl.id} alt= "photo model"/> */}
                {/*<h4>{id} </h4>*/}
                {/*<div>this is single product {id} </div> */}
                <div className="row">
                    {loading ? <Loading/> : <ShowProduct/> }
                    <Enchere/>
                </div>
            </div> 
    );
};

export default Product;

