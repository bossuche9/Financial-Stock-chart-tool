import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile"; // Ensure Profile 
import StockSearch from "./pages/Searchbar";
import Watchlist from "./pages/Watchlist";
import StockChart from "./pages/StockChart";
import Navbar from "./pages/Navbar";

function App() {
  return (
    <Router>
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      <Navbar/>
      <main className="container mx-auto px-4 py-6"> 
        <Routes>
         <Route path="/" element={<Register />} />
         <Route path="/login" element={<Login />} />
         <Route path="/profile" element={<Profile />} />
         <Route path="/search" element={<StockSearch/>} />
          <Route path="/watchlist" element={<Watchlist/>} />
          <Route path="/charts" element={<StockChart/>} />
         <Route path="/charts/:symbol" element={<StockChart/>} />   
      </Routes>
      </main>
    </div>
    </Router>
  );
}

export default App;
