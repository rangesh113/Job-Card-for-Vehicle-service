import React, { useState } from "react";
import "./SearchBar.css";

const SearchBar = ({ onSearch, placeholder = "Search..." }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = (value) => {
        setSearchTerm(value);
        // Debounce search
        if (onSearch) {
            onSearch(value);
        }
    };

    const clearSearch = () => {
        setSearchTerm("");
        if (onSearch) {
            onSearch("");
        }
    };

    return (
        <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="search-input"
            />
            {searchTerm && (
                <button className="clear-search" onClick={clearSearch}>
                    ✕
                </button>
            )}
        </div>
    );
};

export default SearchBar;
