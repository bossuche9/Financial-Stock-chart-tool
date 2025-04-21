import React, { useEffect, useState , useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';



const TIME_RANGES = [
  { label: 'Realtime', value: '1d' },
  { label: '5D', value: '5d' },
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
  { label: '6M', value: '6m' },
  { label: 'YTD', value: 'ytd' },
  { label: '1Y', value: '1y' },
  { label: '5Y', value: '5y' },
  { label: 'ALL', value: 'all' }
];

const StockChart = () => {

  const {symbol: urlSymbol} = useParams();

  const [symbol, setSymbol] = useState(urlSymbol ||'');
  const [historicalData, setHistoricalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1y');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const[quote,setQuote] = useState(null);



  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (urlSymbol) {
      setSymbol(urlSymbol);
      fetchHistoricalData(urlSymbol);
      fetchQuote(urlSymbol);
    }
  }, [urlSymbol]);

  const fetchSuggestions = async (query) => {
    if (query.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await axios.get(`/api/stocks/suggestions?query=${query}`);
      console.log("Fetched Suggestions:", response.data);
      setSuggestions(response.data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    setSymbol(value);
    fetchSuggestions(value);
  };

  const handleSuggestionSelect = (selectedSymbol) => {
    setSymbol(selectedSymbol);
    setShowSuggestions(false);
    fetchHistoricalData(selectedSymbol);
    fetchQuote(selectedSymbol);
  };

  

  
  const filterDataByTimeRange = (data, range) => {
    if (!data || data.length === 0) return [];

    let filteredData = [...data];
    const now = new Date();

    
    const createDateAtStartOfDay = (date) => {
      const newDate = new Date(date);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    };

    switch (range) {
      case '1d':
        filteredData = data.slice(-1);
        break;
      case '5d':
        filteredData = data.slice(-5);
        break;
      case '1m':
        filteredData = data.filter(item => {
          const itemDate = createDateAtStartOfDay(new Date(item.date));
          const oneMonthAgo = createDateAtStartOfDay(new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()));
          return itemDate >= oneMonthAgo;
        });
        break;
      case '3m':
        filteredData = data.filter(item => {
          const itemDate = createDateAtStartOfDay(new Date(item.date));
          const threeMonthsAgo = createDateAtStartOfDay(new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()));
          return itemDate >= threeMonthsAgo;
        });
        break;
      case '6m':
        filteredData = data.filter(item => {
          const itemDate = createDateAtStartOfDay(new Date(item.date));
          const sixMonthsAgo = createDateAtStartOfDay(new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()));
          return itemDate >= sixMonthsAgo;
        });
        break;
      case 'ytd':
        filteredData = data.filter(item => {
          const itemDate = createDateAtStartOfDay(new Date(item.date));
          const yearStart = createDateAtStartOfDay(new Date(now.getFullYear(), 0, 1));
          return itemDate >= yearStart;
        });
        break;
      case '1y':
        filteredData = data.filter(item => {
          const itemDate = createDateAtStartOfDay(new Date(item.date));
          const oneYearAgo = createDateAtStartOfDay(new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()));
          return itemDate >= oneYearAgo;
        });
        break;
      case '5y':
        filteredData = data.filter(item => {
          const itemDate = createDateAtStartOfDay(new Date(item.date));
          const fiveYearsAgo = createDateAtStartOfDay(new Date(now.getFullYear() - 5, now.getMonth(), now.getDate()));
          return itemDate >= fiveYearsAgo;
        });
        break;
      case 'all':
      default:
        break;
    }

    return filteredData;
  };

  function formatMarketCap(num) {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9)  return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6)  return (num / 1e6).toFixed(2) + 'M';
    return num.toLocaleString();
  }
  
  
  const fetchHistoricalData = async (symbolToFetch = symbol) => {
    if (!symbolToFetch) return;
    setLoading(true);
    setError(null);
  
   try {
       
       await axios.post('/api/stocks/historical', { symbol: symbolToFetch });
       const { data } = await axios.get(`/api/historical/${symbolToFetch}`);
        console.log("Fetched Historical Data:", data);
       setHistoricalData(data.historicalData);
       setFilteredData(filterDataByTimeRange(data.historicalData, selectedTimeRange));

      
     } catch (error) {
       console.error('Error fetching historical data:', error);
       setError('Failed to fetch stock data. Please check the symbol and try again.');
     } finally {
       setLoading(false);
     }
   };

   const fetchQuote = async (symbolToFetch = symbol) => {
    if (!symbolToFetch) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`/api/stocks/quote/${symbolToFetch}`);
      console.log("Fetched Quote Data:", data);
      setQuote(data);
      console.log("Quote Data:", data);
    } catch (error) {
      console.error('Error fetching quote data:', error);
      setError('Failed to fetch stock quote. Please check the symbol and try again.');
    } finally {
      setLoading(false);
    }
   }

  // simulation logic
const generateSimulatedData = (basePrice, lastTimestamp, count = 50) => {
  const data = [];
  const interval = 5 * 60 * 1000; // 5 minutes in milliseconds
  const startTime = new Date(lastTimestamp).getTime() - (count - 1) * interval;
  
  for (let i = 0; i < count; i++) {
    const timestamp = new Date(startTime + i * interval);
    // More realistic price movement with some trend and volatility
    const volatility = basePrice * 0.005; // 0.5% volatility
    const variation = (Math.random() - 0.5) * 2 * volatility;
    const close = parseFloat((basePrice + variation).toFixed(2));
    data.push({ date: timestamp.toISOString(), close });
    basePrice = close; // Use last price as base for next point
  }
  return data;
};

const handleTimeRangeSelect = (range) => {
  setSelectedTimeRange(range);

  if (range === '1d' && historicalData.length > 0) {
    const lastData = historicalData[historicalData.length - 1];
    const lastClose = lastData.close;
    const lastDate = lastData.date;
    const simulatedData = generateSimulatedData(lastClose, lastDate);
    setFilteredData(simulatedData);
  } else {
    const filtered = filterDataByTimeRange(historicalData, range);
    setFilteredData(filtered);
  }
};

useEffect(() => {
  let intervalId;
  
  if (selectedTimeRange === '1d' && historicalData.length > 0) {
    intervalId = setInterval(() => {
      setFilteredData(prevData => {
        if (!prevData.length) return prevData;
        
        const last = prevData[prevData.length - 1];
        const volatility = last.close * 0.001; // 
        const variation = (Math.random() - 0.5) * 2 * volatility;
        const newClose = parseFloat((last.close + variation).toFixed(2));
        const newPoint = {
          date: new Date().toISOString(),
          close: newClose
        };

        return [...prevData.slice(1), newPoint]; // Remove oldest, add newest
      });
    }, 30000); // Update every 30 seconds 
  }
  
  return () => {
    if (intervalId) clearInterval(intervalId);
  };
}, [selectedTimeRange, historicalData.length]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Search and Input Section */}
        <div className="p-4 bg-gray-100 flex items-center space-x-4 relative">
          <input 
            type="text" 
            value={symbol} 
            onChange={handleInputChange}
            onFocus={() => fetchSuggestions(symbol)}
            placeholder="Enter Stock Symbol"
            className="flex-grow px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={() =>[fetchHistoricalData(), fetchQuote()]} 
            disabled={loading}
            className="bg-blue-500 text-black px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Getting data...' : 'Search Stock'}
          </button>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg top-full">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.symbol}
                  onClick={() => handleSuggestionSelect(suggestion.symbol)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <span className="font-bold">{suggestion.symbol} </span>
                  <span className="text-gray-500 ml-2">{suggestion.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

       
        <div className="flex justify-center space-x-2 p-4 bg-gray-50 flex-wrap">
          {TIME_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => handleTimeRangeSelect(range.value)}
              className={`
                px-3 py-1 text-sm rounded-full transition-all duration-200
                ${selectedTimeRange === range.value 
                  ? 'bg-blue-500 text-black' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
              `}
            >
              {range.label}
            </button>
          ))}
        </div>

     
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        
        <div className="p-4">
          {filteredData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(tick) => {
                     
                    if (selectedTimeRange === '1d') {
                     return new Date(tick).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
               }
                  
                     return new Date(tick).toLocaleDateString();
                }} 
                  className="text-sm"
                />
                <YAxis 
                  className="text-sm"
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                />
                <Tooltip 
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  formatter={(value) => selectedTimeRange === "1d" ? [`$${value.toFixed(2)}`, 'Current Price']: [`$${value.toFixed(2)}`, 'Closing Price']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    border: '1px solid #ddd',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="close" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 py-10">
              {loading 
                ? 'Loading...' 
                : 'Enter a stock symbol to view historical data'}
            </div>
          )}
        </div>


           {/* Sidebar details */}
        <div className="w-1/3 bg-gray-50 shadow rounded-lg p-4">
          {quote ? (
            <>
              <h2 className="text-xl font-semibold mb-3"> {quote.name || symbol.toUpperCase()} {symbol.toUpperCase()} Details</h2>
              <p><span className="font-medium">Price:</span> ${quote.price.toFixed(2)}</p>
              <p>
                <span className="font-medium">% Change:</span>
                <span className={quote.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {quote.changePercent.toFixed(2)}%
                </span>
              </p>
              <p><span className="font-medium">Prev. Close:</span> ${quote.previousClose.toFixed(2)}</p>
              <p><span className="font-medium">Market Cap:</span> ${formatMarketCap(quote.marketCap)}</p>
              <p><span className="font-medium">Volume:</span> {quote.volume.toLocaleString()}</p>
              <hr className="my-3" />
              <p><span className="font-medium">50‑Day MA:</span> ${quote.fiftyDayAvg.toFixed(2)}</p>
              <p><span className="font-medium">200‑Day MA:</span> ${quote.twoHundredDayAvg.toFixed(2)}</p>
            </>
          ) : (
            <p className="text-gray-500">No data to display.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockChart;