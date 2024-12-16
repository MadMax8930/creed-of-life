"use client";

import Image from "next/image";

interface ButtonProps {
   title: string;
   btnType?: "button" | "submit";
   additionalStyles?: string;
   textStyles?: string;
   rightIcon?: string;
   isDisabled?: boolean;
   action?: MouseEventHandler<HTMLButtonElement>;
}

const Button = ({ title, btnType, additionalStyles, textStyles, rightIcon, isDisabled, action }: ButtonProps) => {
  return (
    <button 
      disabled={false}
      type={btnType || "button"}
      className={`custom-btn ${additionalStyles}`}
      onClick={action}
    >
      <span className={`flex-1 ${textStyles}`}>
         {title}
      </span>
      {rightIcon && (
         <div className="relative w-6 h-6">
            <Image src={rightIcon} alt="right icon" fill className="object-contain" />
         </div>
      )}
    </button>
  )
}

export default Button;