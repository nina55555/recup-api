import React from 'react';
import { Link } from 'react-router-dom';
import Collectiontype from '../components/Collectiontype'
import '../css/Welcome.css'


const Welcome = () => {
    return (
        <div className="containBox">

            <div className='mainBox-welcome'>
                        <div className='marbreG' >
                            {/*<img src='src/assets/Capture-marbre2.PNG'></img>*/}
                        </div>
                        
                        <div className='textbox'>
                            <div className='welcometext'>
                            
                                Si vous êtes arrivé jusqu'à cette page, c'est sans doute parce que nous avons reperé votre charisme, entrons ensemble dans cette aventure
                            </div >
                            <Collectiontype />
                        </div>
                        <div className='marbreD'>
                            {/*<img src='src/assets/Capture marbre 2.PNG'></img>*/}
                        </div> 
            </div>

        </div>
      
    );
};

export default Welcome;