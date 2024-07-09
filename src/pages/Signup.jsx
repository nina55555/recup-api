import React from 'react';
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../css/Signup.css'

const Signup = () => {
    return (
        <div className="bigBox">
           <div className='signup'>
            <form>
                <h3>sign up</h3>
                <br/> 
                <p>it's not a waist of time,
                    <br/> we gonna take care of you </p>
                <br/>
                <br/>
                <div>
                    <label htmlFor='name' >name</label>
                    <input type='text' placeholder='enter your name' className='form-control input-form'/>
                </div>

                <br/>
                <div>
                    <label htmlFor='lastname' >lastname</label>
                    <input type='text' placeholder='enter your lastname' className='form-control input-form'/>
                </div>
                <br/>
                <div>
                    <label htmlFor='email' >email</label>
                    <input type='email' placeholder='enter your email' className='form-control input-form'/>
                </div>
                <br/>
                <div>
                    <label htmlFor='passeword' >passeword</label>
                    <input type='passeword' placeholder='choose passeword' className='form-control input-form'/>
                </div>
                <br/>
                <div>
                    <label htmlFor='passeword' >passeword</label>
                    <input type='passeword' placeholder='confirm passeword' className='form-control input-form'/>
                </div>

                <button className='btn'><a href='/home' >sign up</a></button>
            </form>
            </div> 
        </div>
        
    );
};

export default Signup;