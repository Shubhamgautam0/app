// authApi.ts
import axios, { AxiosResponse } from "axios";
import { SignUpApiResponseData } from "../signup/signup";

const URL = "http://localhost:8080/server";

interface LoginResponse {
    status: number;
  data: any; 
  headers: any; 
}

export const LoginApi = async ({
  email,
  password,
  csrfToken,
}: {
  email: string;
  password: string;
  csrfToken: string;
}): Promise<LoginResponse> => {
  const response = await axios.post(
    `${URL}/api/authn/login`,
    new URLSearchParams({
      user: email,
      password: password,
    }),
    {
      headers: {
        "X-XSRF-TOKEN": csrfToken,
      },
      withCredentials: true,
    }
  );

  return {
    status: response.status,
    data: response.data,
    headers: response.headers["authorization"], 
  };
};




const API_BASE_URL = `${URL}/api/eperson/registrations`;

export const registerUser = async (
  email: string,
  csrfToken: string
): Promise<AxiosResponse<SignUpApiResponseData>> => {
  return axios.post(
    `${API_BASE_URL}?accountRequestType=register`,
    {
      email,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": csrfToken || "",
      },
      withCredentials: true,
    }
  );
};

export const retryRegisterUser = async (
  email: string,
  newCsrfToken: string
): Promise<AxiosResponse<SignUpApiResponseData>> => {
  return axios.post(
    API_BASE_URL,
    {
      email,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": newCsrfToken,
      },
      withCredentials: true,
    }
  );
};