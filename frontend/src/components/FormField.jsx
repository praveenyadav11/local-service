import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function FormField({ label, icon: Icon, type = "text", hint, ...props }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <label className="block space-y-1.5">
      {label && (
        <span className="text-sm font-semibold text-[#172033]">{label}</span>
      )}
      <span className="relative block">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        )}
        <input
          {...props}
          type={isPassword && show ? "text" : type}
          className={`w-full rounded-xl border border-slate-300 bg-white py-3 text-sm text-[#172033] outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 ${
            Icon ? "pl-11" : "pl-3.5"
          } ${isPassword ? "pr-11" : "pr-3.5"}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-600"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </span>
      {hint}
    </label>
  );
}

export default FormField;
