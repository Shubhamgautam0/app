import React from "react";
import { UseFormRegister, FieldError, RegisterOptions } from "react-hook-form";

interface InputFieldProps {
  register: UseFormRegister<any>; 
  name: string; 
  placeholder?: string; 
  type?: string; 
  error?: FieldError; 
  validation?: RegisterOptions; 
}

const InputField: React.FC<InputFieldProps> = ({
  register,
  name,
  placeholder = "",
  type = "text",
  error,
  validation = {},
}) => {
  return (
    <div className="mb-3">
      {/* Input Field */}
      <input
        type={type}
        className={`form-control ${error ? "is-invalid" : ""}`} 
        placeholder={placeholder}
        {...register(name, validation)} 
      />

      
      {error && (
        <div className="invalid-feedback">{error.message}</div> 
      )}
    </div>
  );
};

export default InputField;