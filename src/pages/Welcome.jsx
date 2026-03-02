import React from 'react';
import { Link } from 'react-router-dom';
import Collectiontype from '../components/Collectiontype'
import '../css/Welcome.css'


const Welcome = () => {
    return (
        <div className="containBox">

            <div className='mainBoxx-welcome'>
                        <div className='marbreG' >
                            {/*<img src='src/assets/Capture-marbre2.PNG'></img>*/}
                        </div>
                        
                        <div className='textbox'>
                            <div className='welcometextt'>
                                WELCOME
                                    <br/>
                                    <br/>

                                Si vous êtes arrivé jusqu'à cette page, c'est sans doute parce que nous avons reperé votre charisme et votre capacité à impacter le monde.
                                <br/>
                                Entrons ensemble dans cette belle experience stylistique pour une aventure hors du commun.
                                <br/>
                                <br/>
                                <p>IT V</p>
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