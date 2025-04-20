import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const StockSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search for stocks as user types
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:3000/api/dropdown?keywords=${searchTerm}`);
        setSearchResults(response.data);
        setShowDropdown(true);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSearchResults, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Fetch stock details when a result is selected
  const handleSelectStock = async (symbol) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/search', { symbol });
      setSelectedStock(response.data);
      setShowDropdown(false);
      setSearchTerm(response.data.name);
    } catch (error) {
      console.error('Error fetching stock details:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="relative" ref={searchRef}>
        <div className="flex items-center border rounded-lg overflow-hidden shadow-sm">
          <input
            type="text"
            className="w-full px-4 py-2 outline-none"
            placeholder="Search for a stock..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
          />
          {loading && (
            <div className="px-3">
              <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((stock) => (
              <div
                key={stock.symbol}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelectStock(stock.symbol)}
              >
                <div className="font-medium">{stock.symbol}</div>
                <div className="text-sm text-gray-600">{stock.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Stock Details */}
      {selectedStock && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{selectedStock.name}</h2>
              <div className="text-lg text-gray-700">{selectedStock.symbol}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {selectedStock.currency} {selectedStock.lastClose.toFixed(2)}
              </div>
              <div className={`text-sm ${
                selectedStock.lastClose > selectedStock.prevClose ? 'text-green-600' : 'text-red-600'
              }`}>
                {((selectedStock.lastClose - selectedStock.prevClose) / selectedStock.prevClose * 100).toFixed(2)}%
              </div>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Previous Close</div>
              <div>{selectedStock.currency} {selectedStock.prevClose.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-500">Volume</div>
              <div>{selectedStock.volumeData.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-500">Market Cap</div>
              <div>{(selectedStock.marketCap / 1000000000).toFixed(2)}B {selectedStock.currency}</div>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="font-medium mb-2">About</h3>
            <p className="text-sm text-gray-700">
              {selectedStock.description.length > 300
                ? `${selectedStock.description.substring(0, 300)}...`
                : selectedStock.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockSearch;