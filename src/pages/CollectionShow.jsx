


//page test
import React, {useState, useEffect} from 'react';

import { useParams } from 'react-router-dom';

import { useQuery } from 'react-query';

//import { useParams } from 'react-router-dom';
import Collection from './Collection';








const CollectionShow = () => { 
    const {id} = useParams();


    
    const [product, setProduct] = useState ([]);
    const [loading, setLoading]= useState(false);

    useEffect (() => {
        const getProduct = async () => {
            setLoading (true);
            //find solution id undefined bad request
            const response = await fetch ('http://localhost:3002/defilons/'+id);

                    //const response = await fetch ('http://localhost:5978/defilons/'+id);
            setProduct(await response.json());
        setLoading(false);        
    }
    getProduct()
    }, []);






    /*********essai pour props au click******** */
    const handleClickLarge = (id) => {
        const newProduct =product.filter(product =>product._id ===id);
        setProduct(newProduct);

    }

    /***********************/

  


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

   const ShowProduct1 = () => {
    /*
    const product = Collection.find((product) => product.id === id);
    console.log (product)
    //const {imageUrl, title} = product
    */
    return(
                <div className="show-product">
                
                <img src={product.imageUrl} alt= "photo model" />

                {/* <img src={product._id.imageUrl} alt= "photo model" /> */}
                </div>

    )    
   }

    return (
            <div className='main--box'>
                
                {/*<img src={product.imageUrl.id} alt= "photo model"/> */}
                {/*<h4>{id} </h4>*/}
                {/*<div>this is single product {id} </div> */}
                <div className="row"  handleClickLarge= {handleClickLarge}>
                    {loading ? <Loading/> : <ShowProduct1/> }
                  
                </div>
            </div> 
    );
};

export default CollectionShow;

