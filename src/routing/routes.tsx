import React from "react";
import Navbar from '../components/navbar';
import { BrowserRouter as Routers , Routes, Route } from "react-router-dom";
import { DashboardView } from "../Dashboard/dashboardView";
import LoginForm from "../login/login";
import SignUpForm from "../signup/signup";
import SearchView from "../search/searchView";


const Router: React.FC = () => {
  return (
    <Routers>
        <Navbar />
      <Routes>
         <Route path="/" element={<DashboardView />} />
         <Route path="/login" element={<LoginForm />} />
         <Route path="/signup" element={<SignUpForm />} />
         <Route path="/search" element={<SearchView />} />
      </Routes> 
    </Routers>
  );
};

export default Router;   