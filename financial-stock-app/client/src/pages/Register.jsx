import { useState } from "react";
import { registerUser } from "../api/auth";
import {Link, useNavigate} from "react-router-dom"


const Register = () => {
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });
    const [message, setMessage] = useState("");
    const navigation = useNavigate();

    const handleChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log("Submitting form data:", formData);
        try {
            const res = await registerUser(formData);
            setMessage(res.data.message);
            setFormData({username: "", email:"", password:""});
           
            navigation("/login");

        } catch (error) {
            console.error('Registration error:', error);
            setMessage(error.response?.data?.error || "Registration failed");
        }
    };

    
    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <input 
                type="text" 
                name="username" 
                placeholder="Username" 
                onChange={handleChange} 
                required />
                <input 
                type="email"
                 name="email"
                placeholder="Email" 
                onChange={handleChange} 
                required />
                <input 
                type="password" 
                name="password" 
                placeholder="Password" 
                onChange={handleChange} 
                required />
                <button type="submit">Register</button>
            </form>
            {message && <p>{message}</p>}
            <p>Can try out the app<Link to={"/charts"}> here</Link></p>
            <p>Already registered,<Link to = {"/login"}> click here to login</Link></p>
        </div>
    );
};

export default Register;
