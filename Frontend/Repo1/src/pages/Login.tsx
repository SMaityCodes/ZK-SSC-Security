import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Store token in cookie (7 day expiry)
      Cookies.set("token", data.token, { expires: 7 });
      console.log("Token:", data.token);

      // Optionally store user info in cookie or state
      Cookies.set("user", JSON.stringify(data.user), { expires: 7 });

      navigate("/dashboard");
    } catch (err) {
      setError("Something went wrong. Please try again." + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 space-y-6">
        <h2 className="text-4xl font-extrabold text-blue-700 text-center">
          team<span className="text-blue-500">.</span>
        </h2>
        <p className="text-lg text-gray-700 text-center">Welcome back</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg shadow transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-200" />
          <span className="mx-2 text-gray-400 text-sm">or</span>
          <hr className="flex-grow border-gray-200" />
        </div>

        <button className="w-full flex items-center justify-center border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-2" />
          Log in with Google
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          By logging in, you agree to our <a href="#" className="text-blue-500 underline">Terms of Service</a> and <a href="#" className="text-blue-500 underline">Privacy Policy</a>.
        </p>

        <p className="text-sm text-gray-600 text-center">
          Don’t have an account? <Link to="/signup" className="text-blue-500 underline">Sign up here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
