import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import InputField from "./inputField"; 
import FormButton from "./button"; 
import { useAuth}  from "../contexts/authContext"; 


interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false); 
  const { login } = useAuth(); 
  const navigate = useNavigate(); 

  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  
  const handleUserLogin: SubmitHandler<LoginFormData> = async (data) => {
    setIsLoading(true); 
    const { email, password } = data; 

    try {
      await login({ email, password }); 
      console.log("Login Success");
      navigate("/"); 
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false); 
    }
  };
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <form
        className="bg-white p-4 rounded shadow-sm w-100"
        style={{ maxWidth: "400px" }}
        onSubmit={handleSubmit(handleUserLogin)}
      >
        <h1 className="text-primary text-center mb-4">Login</h1>

        <InputField
          register={register}
          name="email"
          placeholder="Email"
          type="email"
          error={errors.email}
          validation={{
            required: "Email is required",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Invalid Email",
            },
          }}
        />

        <InputField
          register={register}
          name="password"
          placeholder="Password"
          type="password"
          error={errors.password}
          validation={{
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          }}
        />

        
        <Link
          to="/forgot-password"
          className="d-block text-end text-decoration-none text-primary mb-3"
        >
          Forgot Password?
        </Link>

        <FormButton buttonText="Login"  loading={isLoading} />
        <p className="text-center mt-3">
          Don't have an Account?{" "}
          <Link to="/signup" className="text-decoration-none text-primary fw-bold">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;