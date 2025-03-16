import { useState } from "react";
import { getUserDetails } from "../api/auth";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");

    const fetchUserDetails = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("No token found, please login.");
            return;
        }

        try {
            const res = await getUserDetails(token);
            setUser(res.data);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to fetch user details");
        }
    };

    return (
        <div>
            <h2>Profile</h2>
            <button onClick={fetchUserDetails}>Get Profile</button>
            {user && (
                <div>
                    <p>Username: {user.username}</p>
                    <p>Email: {user.email}</p>
                </div>
            )}
            {error && <p>{error}</p>}
        </div>
    );
};

export default Profile;
