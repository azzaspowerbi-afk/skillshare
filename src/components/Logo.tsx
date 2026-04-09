import React from "react";
import logoImg from "../logo.png";

export const Logo: React.FC<{ size?: number; className?: string }> = ({ size = 40, className = "" }) => {
  return (
    <div 
      className={`flex items-center justify-center overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <img 
        src={logoImg} 
        alt="Logo" 
        className="w-full h-full object-contain"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
