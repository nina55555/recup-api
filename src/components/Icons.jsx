
import React from "react";
import "../css/Icons.css";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3" y="3" width="18" height="18" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M14.2 8.2h2.1V5.1c-.4-.1-1.3-.2-2.4-.2-2.4 0-4 1.5-4 4.2V11H7.2v3.5h2.7V21h3.4v-6.5h2.8l.4-3.5h-3.2V9.4c0-1 .3-1.7 1.5-1.7Z" fill="currentColor" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3" y="5" width="18" height="14" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 7.2 12 13l8-5.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function Icons() {
  return (
    <div className="icons">
      <div className="text-icon">
        <p>Follow us and be part of the experience </p>
      </div>
      <div className="icon-items">
        <ul>
          <li>
            <a href="#" aria-label="Instagram">
              <InstagramIcon />
            </a>
          </li>
          <li>
            <a href="#" aria-label="Facebook">
              <FacebookIcon />
            </a>
          </li>
          <li>
            <a href="#" aria-label="Email">
              <MailIcon />
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default React.memo(Icons);









