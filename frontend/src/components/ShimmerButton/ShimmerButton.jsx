// ShimmerButton.jsx
import React from "react";
import { AnimatePresence, motion } from "framer-motion";

export const ShimmerButton = ({
  buttonTextColor,
  isActive,
  initialText,
  changeText,
  onClick,
}) => {
  return (
    <AnimatePresence mode="wait">
      {isActive ? (
        <motion.button
          className="relative flex w-[200px] items-center justify-center overflow-hidden rounded-md p-[10px] bg-gradient-to-r from-[#4A90E2] to-[#50B3A2] outline outline-1 outline-black"
          onClick={onClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.span
            key="action"
            className="relative flex items-center gap-2 font-semibold"
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            style={{ color: buttonTextColor || "#ffffff" }}
          >
            <span className="text-white">✔</span> {/* Checkmark */}
            {changeText}
          </motion.span>
        </motion.button>
      ) : (
        <motion.button
          className="relative flex w-[200px] cursor-pointer items-center justify-center rounded-md border-none p-[10px]"
          style={{ backgroundColor: "#e5e7eb", color: buttonTextColor || "#1f2937" }}
          onClick={onClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.span
            key="reaction"
            className="relative block font-semibold"
            initial={{ x: 0 }}
            exit={{ x: 50, transition: { duration: 0.1 } }}
          >
            {initialText}
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};
