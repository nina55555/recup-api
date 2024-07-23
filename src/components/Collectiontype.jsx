import React from 'react';
import '../css/Collectiontype.css'

const Collectiontype = () => {
    return (
        <div className='big-box'>
           
            <div className='chooseco-g'>
                {/*<a className='classic-btn' href="Home">Collection classic</a>*/}
                <a className='classic-btn' href="Signup">Collection classic</a>

            </div>
            <div className="chooseco-d">
                <a className='super-btn' href="HomeSuper">Collection super</a>
            </div> 
           
            
        </div>
        
    );
};

export default Collectiontype;