import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      // Set the token in cookies upon successful signup
      Cookies.set("authToken", data.token, { expires: 7 }); 
      navigate("/login");   // redirect on success
    } else {
      setError(data.error);
    }
  };

  return (
    <div className="max-w-md h-screen mx-auto text-center mt-50 p-4">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        team<span className="text-blue-500">.</span>
      </h2>
      <p className="text-lg text-gray-700 mb-1">
        Get started with our modern project<br />management software
      </p>
      <p className="text-sm text-gray-500 mb-6">14 day free trial. No credit card required</p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 px-4 py-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 px-4 py-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 px-4 py-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded mb-4 transition"
        >
          Get started for free
        </button>
      </form>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <p className="text-xs text-gray-500 mt-6">
        By clicking the button, you agree to our{" "}
        <a href="#" className="text-blue-500 underline">
          Terms of Service
        </a>{" "}
        and <br />
        have read and agreed to our{" "}
        <a href="#" className="text-blue-500 underline">
          Privacy Policy
        </a>.
      </p>

      <p className="text-sm text-gray-600 mt-6">
        Already have an account?{" "}
        <a href="#" className="text-blue-500 underline">
          Sign in here
        </a>
      </p>
    </div>
  );
};

export default Signup;
