// src/pages/SignUp.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import SignUpForm from "../components/auth/SignUpForm"; // if your file name is SignUpForm.jsx
import Footer from "../components/landing/footer1"

export default function SignUpPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-forest-base px-4 sm:px-6 py-20 sm:py-27 pb-1">
      <SignUpForm
        onLogin={() => navigate("/login")}
        onSuccess={() => navigate("/")}
      />
      <div className="pt-15 ">
      <Footer/>

      </div>
    </div>
  );
}
