


//page test
import React from 'react';
import { useParams } from 'react-router-dom';
import Collection from './Collection';




const SingleProduct = () => { 
    const {id} = useParams();
    console.log({id} )




    //
    
   const product = Collection.find((product) => product.id === id);
   console.log (product)
   //const {imageUrl, title} = product




   
    return (

        <div className='single-product'>
            {/*<img src={product.imageUrl.id} alt= "photo model"/> */}
            <h4>{id} </h4>
            <div>this is single product {id} </div>
        </div>
        
    );
};

export default SingleProduct;