import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const Login = () => {
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          Email,
          Password,
        },
      );

      console.log(response.data);
      alert("Login successful!");
      localStorage.setItem("token", response.data.token);
      navigate("/");
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Login failed!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="text-2xl font-bold bg-lime-700">Real Time Chat Application</h2>
      <div className="flex flex-col items-center gap-4 border border-lime-700 p-8 rounded-lg">
        <form
          action=""
          className="flex flex-col items-center gap-4"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            placeholder="Email"
            className="border border-lime-700"
            value={Email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="border border-lime-700"
            value={Password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn btn-primary bg-lime-700 cursor-pointer">
            Login
          </button>

          <p>
            Already have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
