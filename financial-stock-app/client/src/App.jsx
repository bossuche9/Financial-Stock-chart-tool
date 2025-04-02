import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Profile from "./components/Profile"; // Ensure Profile 
import StockSearch from "./components/Searchbar";
import Watchlist from "./components/Watchlist";
import StockChart from "./components/StockChart";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/search" element={<StockSearch/>} />
        <Route path="/watchlist" element={<Watchlist/>} />
        <Route path="/charts" element={<StockChart/>} />
        <Route path="/charts/:symbol" element={<StockChart/>} />   
      </Routes>
    </Router>
  );
}

export default App;
