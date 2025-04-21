import { useState, useEffect } from "react";
import { getWatchlistDetails, addToWatchlist, removeFromWatchlist } from "../api/watchlist";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Watchlist = () => {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [watchList, setWatchList] = useState([]);
    const [symbol, setSymbol] = useState("");
    const [message, setMessage] = useState("");

    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const fetchSuggestions = async (query) => {
        if (query.length < 1) {
            setShowSuggestions(false);
            setSuggestions([]);
            return;
        }

        try{
            const response = await axios.get(`/api/stocks/suggestions?query=${query}`);
            console.log("Fetched Suggestions:", response.data);
            setSuggestions(response.data);
            setShowSuggestions(true)

        }catch(error){
            console.error('Error fetching suggestions:', error);        
        }
    };

    const fetchWatchListDetails = async() => {
        const token = localStorage.getItem("token");
        if(!token){
            setError("No token found, login first");
            return;
        }
        
        try{
            console.log("Watch list value before being fetched",watchList);
            const response = await getWatchlistDetails(token);
            console.log("Response watchlist:", response.data.watchlist);
            setWatchList(response.data.watchlist);
        } catch(err){
            setError(err.response?.data?.error || "Failed to get watchlist details");
        }
    };

    const handleInputChange = (event) => {
        const value = event.target.value.toUpperCase();
        setSymbol(value);
        console.log(symbol);
        fetchSuggestions(value);
    }

    const handleSuggestionSelect = async (selectedSymbol, selectedName) => {
        setSymbol(selectedSymbol);
        setShowSuggestions(false);

        const token = localStorage.getItem("token");
        if(!token){
            setError(`No token found, login first`)
            return;
        }

        if(watchList.some(stock => stock.symbol.toUpperCase() === selectedSymbol.trim().toUpperCase())){
            setMessage(`${selectedSymbol} is already in the watchlist`)
            return;
        }
        console.log(`Trying to adding ${selectedSymbol} to watchlist`);
        
        try{
            await addToWatchlist(token, selectedSymbol.trim());
            fetchWatchListDetails();
            setMessage(`Added ${selectedSymbol.toUpperCase()} to watchlist`);
            setSymbol("");
        } catch(error) {
            console.error(`Adding ${selectedSymbol} error:`, error);
            setMessage(error.response?.data?.error || "Failed to add to watch list");
        }
    }

    const handleSubmitAdd = async (event) => {
        event.preventDefault();
        const token = localStorage.getItem("token");

        if(!token){
            setError(`No token found, login first`)
            return;
        }

        if(watchList.some(stock => stock.symbol.toUpperCase() === symbol.trim().toUpperCase())){
            setMessage(`${symbol} is already in the watchlist`)
            return;
        }
        console.log(`Trying to adding ${symbol} to watchlist`);
        
        try{
            await addToWatchlist(token, symbol.trim());
            fetchWatchListDetails();
            setMessage(`Added ${symbol.toUpperCase()} to watchlist`);
            setSymbol("");
        } catch(error) {
            console.error(`Adding ${symbol} error:`, error);
            setMessage(error.response?.data?.error || "Failed to add to watch list");
        }
    }

    const handleRemoveStock = async (symbol) => {
        const token = localStorage.getItem("token");

        if(!token){
            setError("No token found, login first");
            return;
        }

        console.log(`Trying to delete ${symbol} from watchlist`);

        try{
            await removeFromWatchlist(token, symbol);
            fetchWatchListDetails();
            setMessage(`Deleted ${symbol} from Stock`)
        } catch(error) {
            setMessage(error.response?.data?.error || "Failed to Delete From Watchlist");
        }
    }

    const handleStockClick = (symbol) => {
        navigate(`/charts/${symbol}`);
    }

    
    const getPercentChangeColor = (percentChange) => {
        const numericChange = parseFloat(percentChange);
        if (isNaN(numericChange)) return "text-gray-700"; // Default color if not a number
        
        return numericChange >= 0 ? "text-green-600" : "text-red-600";
    }

    
    const formatPercentChange = (percentChange) => {
        const numericChange = parseFloat(percentChange);
        if (isNaN(numericChange)) return percentChange;
        
        return numericChange >= 0 ? `+${numericChange}%` : `${numericChange}%`;
    }

    useEffect(() => {
        fetchWatchListDetails();
    }, []);

    function DisplayWatchList() {
        const stockWatchList = watchList.map(stock => {
            const percentChangeClass = getPercentChangeColor(stock.percentchange);
            
            return (
                <li key={stock.id} className="watchlist-item flex items-center justify-between p-3 border-b border-gray-200 last:border-b-0">
                    <div className="flex-grow">
                        <span 
                            className="stock-name text-lg font-medium cursor-pointer text-blue-600 hover:text-blue-800 hover:underline"
                            onClick={() => handleStockClick(stock.symbol)}
                        >
                            {stock.name} ({stock.symbol})
                        </span>
                        <span 
                            className={`stock-percent ml-4 font-bold ${percentChangeClass}`}
                        >
                            {formatPercentChange(stock.percentchange.toFixed(2))}
                        </span>
                    </div>
                    <button 
                        onClick={() => handleRemoveStock(stock.symbol)}
                        className="delete-btn bg-red-500 text-black px-3 py-1 rounded hover:bg-red-600 transition-colors"
                    >
                        Delete
                    </button>
                </li>
            );
        });
        
        return watchList.length > 0 ? (
            <ul className="watchlist-container bg-white shadow-md rounded-lg overflow-hidden mt-4">
                {stockWatchList}
            </ul>
        ) : (
            <p className="text-center text-gray-500 mt-4">Your watchlist is empty. Add stocks to get started.</p>
        );
    }
 
    return(
        <div className="watchlist-page max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Watchlist</h1>
            <form onSubmit={handleSubmitAdd} className="add-stock-form bg-white p-4 shadow-md rounded-lg">
                <div className="search-container relative">
                    <input
                        type="text"
                        name="symbol"
                        value={symbol}
                        placeholder="Enter Stock Symbol"
                        onChange={handleInputChange}
                        onFocus={() => fetchSuggestions(symbol)}
                        className="stock-input w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    
                    <button 
                        type="submit" 
                        className="add-btn w-full mt-3 bg-blue-500 text-black py-2 rounded-md hover:bg-blue-600 transition-colors"
                    > 
                        Add Stock to Watchlist
                    </button>

                    {showSuggestions && suggestions.length > 0 && (
                        <div className="suggestions-container absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                            {suggestions.map((suggestion) => (
                                <div
                                    key={suggestion.symbol}
                                    onClick={() => handleSuggestionSelect(suggestion.symbol, suggestion.name)}
                                    className="suggestion-item p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                >
                                    <span className="symbol font-bold">{suggestion.symbol}</span>
                                    <span className="company-name text-gray-600 ml-2">{suggestion.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {message && <p className="message mt-2 text-blue-600">{message}</p>}
            </form>
            
            <DisplayWatchList />
            
            {error && <p className="error mt-2 text-red-600">{error}</p>}
        </div>
    );
}

export default Watchlist;