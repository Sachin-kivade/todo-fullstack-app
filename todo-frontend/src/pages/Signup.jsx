import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../api";


function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      const res = await fetch(`${API_BASE}/signup`, {
      method: "POST",
      headers: {
      "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, email, password })
    });

      const data = await res.json();

      alert(data.message);

      if (res.ok) {
        navigate("/");
      }

    } catch (error) {
      console.log(error);
      alert("Signup error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100">

      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-sm">

        <h2 className="text-2xl font-bold text-center mb-6">
          Create Account 🚀
        </h2>
        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Username */}
        <input
          type="text"
          placeholder="Username"
          className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Button */}
        <button
          onClick={handleSignup}
          className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
        >
          Signup
        </button>

        {/* Login Link */}
        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/")}
            className="text-green-500 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>

      </div>

    </div>
  );
}

export default Signup;