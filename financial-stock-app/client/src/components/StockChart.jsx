import React, { useState } from 'react';
import axios from 'axios';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Time range options
const TIME_RANGES = [
  { label: '1D', value: '1d' },
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
  // State definitions
  const [symbol, setSymbol] = useState('');
  const [historicalData, setHistoricalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1y');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchSuggestions = async (query) => {
    if (query.length < 1) {
      setSuggestions([]);
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
  };

  // Filter data based on time range
  const filterDataByTimeRange = (data, range) => {
    if (!data || data.length === 0) return [];

    let filteredData = [...data];
    const now = new Date();

    // Create a pure date at the start of the day to avoid time zone issues
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
        // No filtering
        break;
    }

    return filteredData;
  };

  // Fetch historical data
  const fetchHistoricalData = async (symbolToFetch = symbol) => {
    if (!symbolToFetch) return;
  
    setLoading(true);
    setError(null);
  
    try {
      // Use relative paths
      const postResponse = await axios.post('/api/stocks/historical', { symbol: symbolToFetch });

      if(postResponse.status === 200) {
        const response = await axios.get(`/api/historical/${symbolToFetch}`);
      
        const data = response.data.historicalData;
    
        setHistoricalData(data);
        const filtered = filterDataByTimeRange(data, selectedTimeRange);
        setFilteredData(filtered);
      }
 
    } catch (error) {
      console.error('Error fetching historical data:', error);
      setError('Failed to fetch stock data. Please check the symbol and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle time range selection
  const handleTimeRangeSelect = (range) => {
    setSelectedTimeRange(range);
    const filtered = filterDataByTimeRange(historicalData, range);
    setFilteredData(filtered);
  };

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
            onClick={() => fetchHistoricalData()} 
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
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
                  <span className="font-bold">{suggestion.symbol}</span>
                  <span className="text-gray-500 ml-2">{suggestion.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Time Range Buttons */}
        <div className="flex justify-center space-x-2 p-4 bg-gray-50 flex-wrap">
          {TIME_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => handleTimeRangeSelect(range.value)}
              className={`
                px-3 py-1 text-sm rounded-full transition-all duration-200
                ${selectedTimeRange === range.value 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
              `}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Chart Section */}
        <div className="p-4">
          {filteredData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(tick) => new Date(tick).toLocaleDateString()} 
                  className="text-sm"
                />
                <YAxis 
                  className="text-sm"
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                />
                <Tooltip 
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Close Price']}
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
      </div>
    </div>
  );
};

export default StockChart;