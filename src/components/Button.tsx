import { MouseEventHandler, ReactElement } from "react";

interface ButtonProps {
   title?: string;
   btnType?: "button" | "submit";
   additionalStyles?: string;
   textStyles?: string;
   btnIcon?: ReactElement
   isDisabled?: boolean;
   action?: MouseEventHandler<HTMLButtonElement>;
}

const Button = ({ title, btnType, additionalStyles, textStyles, btnIcon, isDisabled, action }: ButtonProps) => {
  return (
    <button 
      disabled={isDisabled || false}
      type={btnType || "button"}
      className={`custom-btn ${additionalStyles}`}
      onClick={action}
    >
      <span className={`flex-1 ${textStyles}`}>
         {title}
      </span>
      {btnIcon && (
         <div className="relative w-4 h-4 pl-1">
           {btnIcon}
         </div>
      )}
    </button>
  )
}

export default Button;