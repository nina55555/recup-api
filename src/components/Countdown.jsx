

/*
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
*/





import React, { useEffect, useMemo, useRef, useState } from "react";
import "../css/Countdown.css";

function Countdown({ endAt, onComplete }) {
  const [timerDays, setTimerDays] = useState("00");
  const [timerHours, setTimerHours] = useState("00");
  const [timerMinutes, setTimerMinutes] = useState("00");
  const [timerSeconds, setTimerSeconds] = useState("00");

  const interval = useRef(null);
  const doneRef = useRef(false);

  const countdownConfig = useMemo(() => {
    const storageKey =
      import.meta.env.VITE_COUNTDOWN_STORAGE_KEY || "auction_countdown_target_v1";
    const mode = (import.meta.env.VITE_COUNTDOWN_MODE || "test").toLowerCase();
    const forceReset =
      (import.meta.env.VITE_COUNTDOWN_FORCE_RESET || "false").toLowerCase() === "true";
    const prodDurationMs = 30 * 24 * 60 * 60 * 1000;
    const testMinutes = Number(import.meta.env.VITE_COUNTDOWN_TEST_MINUTES || 15);
    const testDurationMs =
      Math.max(1, Number.isFinite(testMinutes) ? testMinutes : 15) * 60 * 1000;
    const durationMs = mode === "prod" ? prodDurationMs : testDurationMs;
    return { storageKey, mode, forceReset, durationMs };
  }, []);

  const getInitialTargetTs = () => {
    const directValue = endAt ? new Date(endAt).getTime() : NaN;
    if (!Number.isNaN(directValue)) return directValue;

    if (typeof window === "undefined") return Date.now() + countdownConfig.durationMs;

    if (countdownConfig.forceReset) {
      window.localStorage.removeItem(countdownConfig.storageKey);
    }

    const stored = window.localStorage.getItem(countdownConfig.storageKey);
    const storedTs = stored ? Number(stored) : NaN;
    if (!Number.isNaN(storedTs)) return storedTs;

    const targetTs = Date.now() + countdownConfig.durationMs;
    window.localStorage.setItem(countdownConfig.storageKey, String(targetTs));
    return targetTs;
  };

  const [countdownDate, setCountdownDate] = useState(getInitialTargetTs);

  useEffect(() => {
    setCountdownDate(getInitialTargetTs());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endAt]);

  useEffect(() => {
    doneRef.current = false;

    const tick = () => {
      const now = Date.now();
      const distance = countdownDate - now;

      if (distance <= 0) {
        const shouldAutoRestartTest =
          !endAt && countdownConfig.mode === "test";

        if (shouldAutoRestartTest) {
          const nextTarget = Date.now() + countdownConfig.durationMs;
          if (typeof window !== "undefined") {
            window.localStorage.setItem(countdownConfig.storageKey, String(nextTarget));
          }
          setCountdownDate(nextTarget);
          return true;
        }

        setTimerDays("00");
        setTimerHours("00");
        setTimerMinutes("00");
        setTimerSeconds("00");

        if (!doneRef.current && typeof onComplete === "function") {
          doneRef.current = true;
          onComplete();
        }
        return true;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimerDays(String(days).padStart(2, "0"));
      setTimerHours(String(hours).padStart(2, "0"));
      setTimerMinutes(String(minutes).padStart(2, "0"));
      setTimerSeconds(String(seconds).padStart(2, "0"));
      return false;
    };

    const isDone = tick();
    if (!isDone) {
      interval.current = setInterval(() => {
        const finished = tick();
        if (finished && interval.current) {
          clearInterval(interval.current);
        }
      }, 1000);
    }

    return () => {
      if (interval.current) {
        clearInterval(interval.current);
      }
    };
  }, [countdownDate, onComplete]);

  return (
    <div className="timer-container">
      <div className="timer">
        <div className="text">
          <p>Countdown to an exclusive experience ends in:</p>
        </div>

        <div className="line">
          <div className="box"><p>{timerDays}</p></div>
          <div className="type"><p>Days</p></div>

          <span>:</span>

          <div className="box"><p>{timerHours}</p></div>
          <div className="type"><p>Hours</p></div>

          <span>:</span>

          <div className="box"><p>{timerMinutes}</p></div>
          <div className="type"><p>Minutes</p></div>

          <span>:</span>

          <div className="box"><p>{timerSeconds}</p></div>
          <div className="type"><p>Seconds</p></div>
        </div>
      </div>
    </div>
  );
}

export default Countdown;
