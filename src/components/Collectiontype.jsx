import React from 'react';
import '../css/Collectiontype.css'

const Collectiontype = () => {
    return (
        <div className="bigBox">
            <div className='chooseco'>
                <a className='classic-btn' href="Home">Collection classic</a>
            </div>
            <div className="chooseco">
                <a className='super-btn' href="HomeSuper">Collection super</a>
            </div>
        </div>
        
    );
};

export default Collectiontype;