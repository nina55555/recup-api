
import React from 'react';
import axios from 'axios';
import { useQuery} from 'react-query';
import '../css/Cards.css'


const Collection = () => {

    const {data, isError, isLoading} = useQuery ('model', () => {
    //return axios.get ('http://localhost:3002/collection-test/');
    return axios.get (' http://localhost:5979/runways/');
    //return axios.get (' http://localhost:5000/defilons/');   



    })

        return (
            <> 
            {data?.data.map((item) =>{
            return <div className= 'card' key={item.id} >
                {/*item.imageUrl*/} 
                {/*item.title*/}
                {/*item.author*/} 
               <img src={item.imageUrl} alt= "photo model"/>
              {/*   <img src={item.imgUrl} alt= "photo model"/>   */}

            {/*  <video src ={item.videoUrl} ></video>   */}
            </div>
            })}
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