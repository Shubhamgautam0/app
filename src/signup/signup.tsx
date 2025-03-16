import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Link } from "react-router-dom";
import FormButton from "./button";
import InputField from "./inputField";
import { registerUser, retryRegisterUser } from "../api/apiClient";
import { toast } from "react-toastify";

export interface SignUpFormData {
    email: string;
}

export interface SignUpApiResponseData {
    message?: string;
}

export interface ApiError {
    response?: {
        status: number;
        data: any;
        headers: any;
    };
    message?: string;
}

export default function SignUpForm() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<SignUpFormData>();

   
    const handleUserSignUp: SubmitHandler<SignUpFormData> = async (data) => {
        const csrfToken = localStorage.getItem("csrfToken") || "";
        setIsLoading(true);

        try {
            const response = await registerUser(data.email, csrfToken);
            if (response.status === 201) {
                toast.info("An email is sent to your registered email ID");
                console.log("An email is sent to your registered email ID");
                reset();
            } else {
                toast.error(`Unexpected status code: ${response.status}`);
            }
        } catch (error) {
            const apiError = error as ApiError;
            const newCsrfToken = apiError.response?.headers?.["dspace-xsrf-token"];

            if (newCsrfToken) {
                localStorage.setItem("csrfToken", newCsrfToken);

                try {
                    const retryResponse = await retryRegisterUser(data.email, newCsrfToken);

                    if (retryResponse.status === 201) {
                        toast.info(
                            `We have sent an email to ${data.email}. Please check your inbox!`
                        );
                        reset();
                    } else {
                        toast.error(`Unexpected status code on retry: ${retryResponse.status}`);
                    }
                } catch (innerError) {
                    console.error("Error during retry:", innerError);
                    toast.error("An error occurred during retry. Please try again later.");
                }
            } else {
                console.error("Error during initial request:", apiError);
                toast.error(
                    "An error occurred during registration. Please check the details and try again."
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
            <form
                className="bg-white p-4 rounded shadow-sm "
                onSubmit={handleSubmit(handleUserSignUp)}
            >
                <h1 className="card-title text-center text-primary mb-4">Sign Up</h1>
                <InputField
                    register={register}
                    name={"email"}
                    placeholder={"Email"}
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
                <FormButton buttonText={"Sign Up"} loading={isLoading} />
                <Link
                    to={"/login"}
                    className="btn btn-link w-100 text-center mt-3"
                >
                    Have an Account?
                </Link>
            </form>
        </div>
    );
}