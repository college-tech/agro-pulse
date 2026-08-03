// src/pages/Login.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm"; 
import { toast } from "react-toastify";
import Footer from "../components/landing/footer1"


export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-forest-base px-6 py-12 sm:py-27 pb-1">
      <LoginForm
        onSignUp={() => navigate("/signup")}
        onSuccess={() => {toast.success("Logged in Suceessfully"); navigate("/")}}
      />
      <div className="pt-15 ">
      <Footer/>

      </div>
    </div>
    
  );
}
