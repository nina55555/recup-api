

import React, { useState, useRef, useCallback } from "react";
import Navbar from "../components/Navbar"
import '../css/Book.css'


const pages = [
  { left: "IT V", right: "Style & Impact" },
  { left: "L'univers", right: "De la mode" },
  { left: "Création", right: "& Innovation" },
  { left: "L'élégance", right: "Intemporelle" },
  { left: "La passion", right: "Du detail" },
];

export default function Book() {
  const [currentPage, setCurrentPage] = useState(0);
  const [flippingDir, setFlippingDir] = useState(null);
  const flippingRef = useRef(null);
  const maxPage = pages.length - 1;

  const flipForward = useCallback(() => {
    if (currentPage >= maxPage || flippingRef.current) return;
    flippingRef.current = true;
    setFlippingDir("forward");
    setTimeout(() => {
      setCurrentPage((p) => p + 1);
      setFlippingDir(null);
      flippingRef.current = null;
    }, 1000);
  }, [currentPage, maxPage]);

  const flipBackward = useCallback(() => {
    if (currentPage <= 0 || flippingRef.current) return;
    flippingRef.current = true;
    setFlippingDir("backward");
    setTimeout(() => {
      setCurrentPage((p) => p - 1);
      setFlippingDir(null);
      flippingRef.current = null;
    }, 1000);
  }, [currentPage]);

  return (
      <> 
      <div className="container">
            {/*   <Navbar />     */} 
        <div className="book-fullscreen">
          <div className="book-3d">
            <div className="page-left page-surface" onClick={flipBackward}>
              <div className="page-inner">
                <div className="page-num">{currentPage + 1}</div>
                <div className="page-text">{pages[currentPage].left}</div>
              </div>
            </div>
            <div className="page-right page-surface" onClick={flipForward}>
              <div className="page-inner">
                <div className="page-num">{currentPage + 1}</div>
                <div className="page-text">{pages[currentPage].right}</div>
              </div>
            </div>
            <div className="book-spine-3d"></div>
            {flippingDir === "forward" && (
              <div className="flip-card flip-forward">
                <div className="flip-card-inner">
                  <div className="flip-card-front">
                    <div className="page-inner">
                      <div className="page-num">{currentPage + 1}</div>
                      <div className="page-text">{pages[currentPage].right}</div>
                    </div>
                  </div>
                  <div className="flip-card-back">
                    <div className="page-inner">
                      <div className="page-num">{currentPage + 2}</div>
                      <div className="page-text">{pages[currentPage + 1].left}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {flippingDir === "backward" && (
              <div className="flip-card flip-backward">
                <div className="flip-card-inner">
                  <div className="flip-card-front">
                    <div className="page-inner">
                      <div className="page-num">{currentPage}</div>
                      <div className="page-text">{pages[currentPage - 1].right}</div>
                    </div>
                  </div>
                  <div className="flip-card-back">
                    <div className="page-inner">
                      <div className="page-num">{currentPage + 1}</div>
                      <div className="page-text">{pages[currentPage].left}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <h2 className="book-title">Je m'appelle Book page</h2>
        <br/>
        <br/>
        <p className="book-subtitle">We are new born.. <br/> Content coming soon... Stay tuned ! </p>

        </div>
      </>
       
    )
    
  }
  