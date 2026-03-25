import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import videoShow from "../assets/vid-home2.mp4";
import { X } from "lucide-react";
import Collectiontype from '../components/Collectiontype'
import '../css/Home.css'


const Welcome = () => {
    const [isTextboxOpen, setIsTextboxOpen] = useState(true);

    return (
        <div className="containBox">

            <div className='mainBoxx-welcome'>
                        <h2 className="welcome-video-title">Vous l'avez fait !</h2>
                        <div className={`welcome-video-bg ${isTextboxOpen ? "" : "video-full"}`}>
                            <video src={videoShow} autoPlay muted loop playsInline />
                        </div>
                        <div className='marbreG' >
                            {/*<img src='src/assets/Capture-marbre2.PNG'></img>*/}
                        </div>
                        
                        {isTextboxOpen && (
                        <div className='textbox'>
                            <button
                                type="button"
                                className="welcome-close"
                                aria-label="Fermer le popup"
                                onClick={() => setIsTextboxOpen(false)}
                            >
                                <X size={18} strokeWidth={1.75} />
                            </button>
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
                        )}

                        <div className="welcome-cta">
                            <button className="btn-decouvrezz btn-welcomezz welcome-discover-btn">
                                <Link to="/Collection">Découvrez la collection</Link>
                            </button>
                        </div>
                        <div className='marbreD'>
                            {/*<img src='src/assets/Capture marbre 2.PNG'></img>*/}
                        </div> 
            </div>

        </div>
      
    );
};

export default Welcome;
