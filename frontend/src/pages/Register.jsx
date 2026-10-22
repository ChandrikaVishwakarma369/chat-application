import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
const Register = () => {
  const [Fullname, setFullName] = useState("");
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          Fullname,
          Email,
          Password,
        },
      );

      console.log(response.data);
      alert("Registration successful!");
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Registration failed!");
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
            placeholder="Full Name"
            className="border border-lime-700"
            value={Fullname}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Email"
            className="border border-lime-700 "
            value={Email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="border border-lime-700 "
            value={Password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn btn-primary bg-lime-700 cursor-pointer">
            Register
          </button>
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};
export default Register;
