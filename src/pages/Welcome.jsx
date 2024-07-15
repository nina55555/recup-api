import React from 'react';
import { Link } from 'react-router-dom';
import Collectiontype from '../components/Collectiontype'
import '../css/Welcome.css'


const Welcome = () => {
    return (
        <div className='mainBox'>
            <div className='marbreG' >
                <img src='src/assets/Capture marbre 2.PNG'></img>
            </div>
            
            {/*<div className='textbox'>
                <div className='welcometext'>
                */}
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Id, enim reprehenderit. Alias saepe voluptatem iusto quisquam ipsum dolorem laudantium odit!
                {/*</div >*/}
                <Collectiontype />
            {/*</div>*/}
            {/*<div className='marbreD'>
                <img src='src/assets/Capture marbre 2.PNG'></img>
            </div>
            */}
        </div>
    );
};

export default Welcome;