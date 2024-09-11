import React from 'react';
import ReactPlayer from 'react-player';
/*import videoShow from '../assets/cindyB.mp4'*/
import videoShow from '../assets/vid-home2.mp4'



function Video () {

  

    return (
        <div className='boxVideo'>
            <p>Vous l'avez fait !</p>
            <div className='videoShow'>
            <video src={videoShow} autoPlay muted loop/>
        </div>
        </div>
        
    );
};

export default Video;