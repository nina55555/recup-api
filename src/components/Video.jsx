import React from 'react';
import ReactPlayer from 'react-player';
import videoShow from '../assets/cindyB.mp4'


function Video () {

  

    return (
        <div className='boxVideo'>
            <div className='videoShow'>
            <video src={videoShow} autoPlay muted loop/>
        </div>
        </div>
        
    );
};

export default Video;