"use client";

import { useEffect, useState } from "react";
import { cn } from "../../lib/utils"; // Adjust the import path to your utils
import PropTypes from "prop-types"; // Import PropTypes for type checking

// Component Definition
export default function TypingAnimation({
    text,
    duration = 200,
    className,
  }) {
    const [displayedText, setDisplayedText] = useState("");
    const [i, setI] = useState(0);
  
    useEffect(() => {
      const typingEffect = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(text.substring(0, i + 1));
          setI(i + 1);
        } else {
          clearInterval(typingEffect);
        }
      }, duration);
  
      return () => {
        clearInterval(typingEffect);
      };
    }, [i, text, duration]); // Added i, text to the dependencies
  
    return (
      <h1
        className={cn(
          "font-display text-center font-bold leading-tight tracking-[-0.02em] drop-shadow-sm",
          className
        )}
      >
        {displayedText ? displayedText : text}
      </h1>
    );
  }
  
  // Define PropTypes for the component to ensure type safety
  TypingAnimation.propTypes = {
    text: PropTypes.string.isRequired,
    duration: PropTypes.number,
    className: PropTypes.string,
  };