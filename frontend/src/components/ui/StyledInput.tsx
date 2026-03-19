import { ReactNode, InputHTMLAttributes, forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface StyledInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  label?: string;
  icon?: ReactNode;
  error?: string;
  containerClassName?: string;
}

const StyledInput = forwardRef<HTMLInputElement, StyledInputProps>(
  ({ label, icon, error, containerClassName = "", type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
      <div className={`space-y-2 ${containerClassName}`}>
        {label && (
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            className={`
              w-full bg-gray-900/80 border border-gray-700 rounded-xl px-4 py-3
              text-white placeholder-gray-500
              focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20
              transition-all duration-200
              ${icon ? "pl-10" : ""}
              ${isPassword ? "pr-10" : ""}
            `}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

StyledInput.displayName = "StyledInput";
export default StyledInput;
