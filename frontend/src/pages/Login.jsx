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
        }
      );

      console.log(response.data);
      alert("Login successful!");
      localStorage.setItem("token", response.data.token);
      // Login ke baad Home page par jao
      navigate("/");
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Login failed!");
    }
  };

  return (
    <div className="">
      <form
        action=""
        className="flex flex-col items-center gap-4"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          placeholder="Email"
          className="border border-blue-500"
          value={Email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border border-blue-500"
          value={Password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn btn-primary bg-blue-500 cursor-pointer">
          Login
        </button>

        <p>
          Already have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;