import React from 'react';
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../css/Signin.css'

const Signin = () => {
    return (
        <div className="bigBox">
            <div className='signin'>
            <form>
                <h3>sign in...
                    <br/> and let's run the world </h3> <br/> 
                <br/>
                <br/>
                <div>
                    <label htmlFor='email' >email</label>
                    <input type='email' placeholder='enter your email' className='form-control input-form'/>
                </div>

                <br/>

                <div>
                    <label htmlFor='password' >password</label>
                    <input type='password' placeholder='enter your password' className='form-control input-form'/>
                </div>
                <br/>
                
                <button className='btn'><a href='/home' >sign in</a></button>
           
            </form>
            </div>
        </div>
        
    );
};

export default Signin;