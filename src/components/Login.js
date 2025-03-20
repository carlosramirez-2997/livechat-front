import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from '../services/ApiService';

const Login = () => {
  const [email, setEmail] = useState("emma.jones@example.com");
  const [password, setPassword] = useState("Password123!");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const token = await ApiService.login(email, password);
    if (token) {
      localStorage.setItem("token", token);
      navigate("/chat");
    }
  };

  return (
      <div>
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
  );
};

export default Login;