import React, { useEffect, useRef, useState} from 'react';
import '../css/Countdown.css'

function Countdown() {

  const [timerDays, setTimerDays]= useState ('00');
  const [timerHours, setTimerHours]= useState ('00');
  const [timerMinutes, setTimerMinutes]= useState ('00');
  const [timerSeconds, setTimerSeconds]= useState ('00');

  let interval = useRef();

  const startTimer = () =>{
    const countdownDate = new Date('July 27, 2024 10:43:00').getTime();
  
    interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = countdownDate - now ;

      const days = Math.floor(distance / (1000 * 60 *60 * 24));
      const hours = Math.floor((distance % (1000 * 60 *60 * 24)/(1000 * 60 * 60)));
      const minutes = Math.floor((distance % (1000 * 60 *60 ))/(1000 *60));
      const seconds = Math.floor((distance % (1000 * 60 ))/ 1000);

      if (distance < 0) {
        //stop timer
        clearInterval(interval.current);
        //alert('hey you ! you win ! le vainqueur est le dernier a avoir encheri')

      }else {
        //update timer
        setTimerDays(days);
        setTimerHours(hours);
        setTimerMinutes(minutes);
        setTimerSeconds(seconds);
      }

    } , 1000);
  };


  useEffect(() => {
    startTimer();
    return () => {
      clearInterval(interval.current);
    
    }
      
    
  });

  return (
     
     <div className="timer-container">

      <div className='timer'>

        <div className='text'>
          <p>countdown to a really special date, enter your bid and see</p> 
        </div>

        <div className='line'>

         
            <div className='box' ><p>{timerDays}</p></div>
            <div className='type'><p>Days</p></div>
         
          <span>:</span>
          
            <div className='box' ><p>{timerHours} </p></div>
            <div className='type'><p>Hours</p></div>
         
          <span>:</span>
         
            <div className='box' ><p>{timerMinutes} </p></div>
            <div className='type'><p>Minutes</p></div>
         
          <span>:</span>
          
            <div className='box' ><p>{timerSeconds} </p></div>
            <div className='type'><p>Seconds</p></div> 
        </div>

      </div>

     </div>
  );
}

export default Countdown;
