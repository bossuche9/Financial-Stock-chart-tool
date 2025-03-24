import { useState } from "react";
import { loginUser } from "../api/auth";
import { useNavigate, Link } from "react-router-dom"

const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await loginUser(formData);
            localStorage.setItem("token", res.data.token);
            setMessage("Login successful");
            setFormData({email:"", password:""});
            navigate("/watchlist");
            
        } catch (error) {
            setMessage(error.response?.data?.error || "Login failed");
        }
    };

    function timeout(delay) {
        return new Promise(res => (res,delay))
    }

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input 
                type="email" 
                name="email" 
                placeholder="Email" 
                onChange={handleChange} s
                required />
                <input 
                type="password" 
                name="password" 
                placeholder="Password" 
                onChange={handleChange} 
                required />
                <button type="submit">Login</button>
            </form>
            <p>Not registered,<Link to = {"/"}> click here to Register</Link></p>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Login;
