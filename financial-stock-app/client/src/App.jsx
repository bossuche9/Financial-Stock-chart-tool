import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Profile from "./components/Profile"; // Ensure Profile 
import StockSearch from "./components/Searchbar"
import Watchlist from "./components/Watchlist";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>Home Page</h1>} /> {/* Default route */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/search" element={<StockSearch/>} />
        <Route path="/watchlist" element={<Watchlist/>} />
      </Routes>
    </Router>
  );
}

export default App;
