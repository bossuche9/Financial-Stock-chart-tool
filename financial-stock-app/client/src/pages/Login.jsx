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

   

    return (
        <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <button type="submit" className="w-full py-2 bg-blue-500 text-black rounded hover:bg-blue-600 transition">Login</button>
            </form>
            <p className="mt-4 text-sm text-gray-600 text-center">Not registered,<Link to = {"/"} className="text-blue-600 hover:underline"> click here to Register</Link></p>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Login;
