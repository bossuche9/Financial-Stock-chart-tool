import { useState, useEffect } from "react";
import { getWatchlistDetails, addToWatchlist, removeFromWatchlist } from "../api/watchlist";

const Watchlist = () => {
    const [error, setError] = useState("");
    const [watchList, setWatchList] = useState([]);
    const [symbol, setSymbol] = useState("");
    const [message, setMessage] = useState("");

    const fetchWatchListDetails = async() => {
        const token = localStorage.getItem("token");
        if(!token){
            setError("No  token no: ${token} found, login first")
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

    const handleChange = (event) => {
        setSymbol(event.target.value);
        console.log(symbol);
    }

    const handleSubmitAdd = async (event) => {
        event.preventDefault();
        const token = localStorage.getItem("token");

        if(!token){
            setError("No  token no: ${token} found, login first")
            return;
        }

        if(watchList.some(stock => stock.symbol.toUpperCase() === symbol.trim().toUpperCase())){
            setMessage(`${symbol} is already in the watchlist`)
            return;
        }
        console.log(`Trying to adding ${symbol} to watchlist`);
        
        try{
            const response = await addToWatchlist(token,symbol.trim());
            fetchWatchListDetails();
            setMessage(`Added ${response.data.symbol} to watchlist`);
            setSymbol("");
        } catch(error) {
            console.error(`Adding ${symbol} error:`, error);
            setMessage(error.response?.data?.error || "Failed to add to wacth list");
        }
    }

    const handleRemoveStock = async (symbol)=> {
        const token = localStorage.getItem("token");

        if(!token){
            setError("No  token no: ${token} found, login first")
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

    useEffect(() => {
        fetchWatchListDetails();
    }, []);

     function DisplayWatchList() {
        const stockWatchList = watchList.map(stock =>
            <li key = {stock.id}>
                <p>Stocknname: { stock.name} Symbol: {stock.symbol} Price: ${stock.lastClose}
                    <button onClick={()=>handleRemoveStock(stock.symbol)}>Delete</button>
                </p>
            </li>

         ) ;
         return (
            <ul>{stockWatchList}</ul>
         )
    }

   
    
    return(
        <div>
            <h1>Watchlist</h1>
            <form onSubmit={handleSubmitAdd}>
                <input
                type ="text"
                name="symbol"
                placeholder="Enter Stock Symbol"
                onChange={handleChange}
                />
                <button type="submit"> Add Stock to Watchlist</button> 
                {message &&<p>{message}</p>}
            </form>
            <DisplayWatchList/>
            {error && <p>{error}</p>}
        </div> 
       
    );

}



export default Watchlist;