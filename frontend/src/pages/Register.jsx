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
        }
      );

      console.log(response.data);
      alert("Registration successful!");
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Registration failed!");
    }
  };
  return (
    <div>
      <form
        action=""
        className="flex flex-col items-center gap-4"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          placeholder="Full Name"
          className="border border-blue-500"  
          value={Fullname}
          onChange={(e) => setFullName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Email"
          className="border border-blue-500 "
        value={Email}
            onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="border border-blue-500 "
            value={Password}
            onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn btn-primary bg-blue-500 cursor-pointer">
          Register
        </button>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};
export default Register;
