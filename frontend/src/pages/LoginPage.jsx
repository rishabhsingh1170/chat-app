import React from 'react'
import { useAuthStore } from '../store/useAuthStore';
import { useState,useEffect } from 'react';
import { Eye, EyeOff, Loader2, Mail, MessageSquare,Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthImagePattern from '../components/AuthImagePattern';

function LoginPage() {
  const [showPassword , setShowPassword] = useState(false);
      const [formData , setFromData] = useState({
          email:"",
          password:"",
      });

  const {login , isLogginIn} = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/*left side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/*logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bolt mt-2">Welcome Back</h1>
              <p className="text-basse-content/60">
                Sign in to your account
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="from-control">
              
             

              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-base-content/40 z-10" />
                </div>
                <input
                  type="text"
                  className={"input input-bordered w-full pl-10"}
                  placeholder="Rishabh@gamil.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFromData({ ...formData, email: e.target.value });
                  }}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40 z-10" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className={"input input-bordered w-full pl-10"}
                  placeholder="********"
                  value={formData.password}
                  onChange={(e) =>
                    setFromData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content /40 z-10" />
                  ) : (
                    <Eye className="size-5 text-base-content/40 z-10" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLogginIn}
            >
              {isLogginIn ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account ?{" "}
              <Link to="/signup" className="link link-primary">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/*right side */}
      <AuthImagePattern
        titile={"Join Our Community"}
        subtitle={
          "connect with friends, share moments, and stay in touch with you"
        }
      />
    </div>
  );
}

export default LoginPage
