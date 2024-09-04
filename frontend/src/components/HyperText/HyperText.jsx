"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion"; // Ensure framer-motion is installed
import PropTypes from "prop-types"; // Import PropTypes for type checking
import { cn } from "../../lib/utils"; // Adjust the import path to your utils

const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const getRandomInt = (max) => Math.floor(Math.random() * max);

export default function HyperText({
  text,
  duration = 800,
  framerProps = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 3 },
  },
  className,
  animateOnLoad = true,
}) {
  const [displayText, setDisplayText] = useState(text.split(""));
  const [trigger, setTrigger] = useState(false);
  const iterations = useRef(0);
  const isFirstRender = useRef(true);

  const triggerAnimation = () => {
    iterations.current = 0;
    setTrigger(true);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!animateOnLoad && isFirstRender.current) {
        clearInterval(interval);
        isFirstRender.current = false;
        return;
      }
      if (iterations.current < text.length) {
        setDisplayText((t) =>
          t.map((l, i) =>
            l === " "
              ? l
              : i <= iterations.current
              ? text[i]
              : alphabets[getRandomInt(26)]
          )
        );
        iterations.current = iterations.current + 0.1;
      } else {
        setTrigger(false);
        clearInterval(interval);
      }
    }, duration / (text.length * 10));
    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [text, duration, trigger, animateOnLoad]);

  return (
    <div
      className=" py-1 overflow-hidden flex justify-center items-center cursor-default scale-100" // Added justify-center and items-center
      onMouseEnter={triggerAnimation}
    >
      <AnimatePresence mode="wait">
        {displayText.map((letter, i) => (
          <motion.h1
            key={i}
            className={cn(
              "mx-[1px]", // Adjust margin as needed to reduce spacing
              letter === " " ? "w-2" : "", // Adjust width for spaces if needed
              className
            )}
            style={{ letterSpacing: "-0.05em", fontWeight: "normal", textAlign: "center" }} // Ensure text is centered within each element
            {...framerProps}
          >
            {letter} {/* Display the letter without forcing it to uppercase */}
          </motion.h1>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Define PropTypes for the component to ensure type safety
HyperText.propTypes = {
  text: PropTypes.string.isRequired,
  duration: PropTypes.number,
  framerProps: PropTypes.object,
  className: PropTypes.string,
  animateOnLoad: PropTypes.bool,
};
