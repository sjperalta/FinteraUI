import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import debounce from "lodash.debounce";

/**
 * A reusable filter component:
 * - Provides a search input (debounced).
 * - Provides a dropdown of filter options.
 * - Calls parent callbacks on changes.
 *
 * Props:
 *  - searchTerm (string): initial value for search input.
 *  - filterValue (string): the currently selected filter option.
 *  - filterOptions (array): array of string options for the dropdown.
 *  - onSearchChange (func): called when search input changes (debounced).
 *  - onFilterChange (func): called when a filter option is selected.
 *  - searchPlaceholder (string): placeholder text for the search input.
 *  - filterPlaceholder (string): placeholder text for the dropdown input.
 *  - minSearchLength (number): minimum length to trigger onSearchChange (default 3).
 */
function GenericFilter({
  searchTerm,
  filterValue,
  filterOptions,
  onSearchChange,
  onFilterChange,
  searchPlaceholder,
  filterPlaceholder,
  minSearchLength = 3,
}) {
  const [term, setTerm] = useState(searchTerm);
  const [selectedFilter, setSelectedFilter] = useState(filterValue);
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilterLabel, setActiveFilterLabel] = useState("");
  
  // Debounced callback to notify parent about search changes
  const debouncedSearch = useCallback(
    debounce((value) => {
      if (value.length >= minSearchLength) {
        onSearchChange(value);
      } else {
        onSearchChange(""); 
      }
    }, 500),
    [onSearchChange, minSearchLength]
  );

  // Cleanup on unmount (cancels pending debounced calls)
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Handle local input changes (search)
  const handleTermChange = (e) => {
    const val = e.target.value;
    setTerm(val);
    debouncedSearch(val);
  };

  // Handle filter selection
  const handleFilterSelect = (option) => {
    setSelectedFilter(option);
    setActiveFilterLabel(option);
    setShowFilter(false);
    onFilterChange(option === "All" ? "" : option);
  };

  // If parent modifies props externally, sync them in
  useEffect(() => {
    setTerm(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    setSelectedFilter(filterValue);
    setActiveFilterLabel(filterValue || "");
  }, [filterValue]);

  return (
    <div className="bg-white dark:bg-darkblack-600 rounded-lg p-4 mb-8 flex items-center">
      {/* Search Section */}
      <div className="flex items-center flex-1 pl-4 xl:border-r border-bgray-400 dark:border-darkblack-400">
        <span className="mr-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
              stroke="#94A3B8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 21L17 17"
              stroke="#94A3B8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <input
          type="text"
          className="border-0 w-full dark:bg-darkblack-600 dark:text-white focus:outline-none"
          placeholder={searchPlaceholder}
          value={term}
          onChange={handleTermChange}
        />
      </div>

      {/* Filter Dropdown */}
      <div className="relative ml-4 xl:flex hidden items-center border-r border-bgray-400 dark:border-darkblack-400 cursor-pointer pr-2">
        <span
          onClick={() => setShowFilter(!showFilter)}
          className="inline-flex items-center"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19.9092 10.448C19.9092 16.4935 11.9092 21.6753 11.9092 21.6753C11.9092 21.6753 3.90918 16.4935 3.90918 10.448C3.90918 8.38656 4.75203 6.40954 6.25233 4.95187C7.75262 3.4942 9.78745 2.67529 11.9092 2.67529C14.0309 2.67529 16.0657 3.4942 17.566 4.95187C19.0663 6.40954 19.9092 8.38656 19.9092 10.448Z"
              stroke="#94A3B8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 12.6753C13.3807 12.6753 14.5 11.556 14.5 10.1753C14.5 8.79458 13.3807 7.67529 12 7.67529C10.6193 7.67529 9.5 8.79458 9.5 10.1753C9.5 11.556 10.6193 12.6753 12 12.6753Z"
              stroke="#94A3B8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            type="text"
            className="border-0 dark:bg-darkblack-600 focus:outline-none ml-2 w-24"
            placeholder={filterPlaceholder}
            value={activeFilterLabel || ""}
            readOnly
          />
          <span className="ml-2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="#94A3B8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </span>

        {/* Dropdown list */}
        {showFilter && (
          <div
            className="absolute top-full right-0 w-44 bg-white dark:bg-darkblack-500 rounded-lg shadow-lg z-10 mt-1"
          >
            <ul>
              {filterOptions.map((option) => (
                <li
                  key={option}
                  className="px-4 py-2 text-sm text-bgray-900 dark:text-bgray-50 hover:bg-bgray-100 dark:hover:bg-darkblack-600 font-semibold cursor-pointer"
                  onClick={() => {
                    handleFilterSelect(option);
                  }}
                >
                  {option}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

GenericFilter.propTypes = {
  searchTerm: PropTypes.string,
  filterValue: PropTypes.string,
  filterOptions: PropTypes.arrayOf(PropTypes.string),
  onSearchChange: PropTypes.func.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  searchPlaceholder: PropTypes.string,
  filterPlaceholder: PropTypes.string,
  minSearchLength: PropTypes.number,
};

GenericFilter.defaultProps = {
  searchTerm: "",
  filterValue: "",
  filterOptions: ["All", "Option1", "Option2"],
  searchPlaceholder: "Search...",
  filterPlaceholder: "Select Filter",
  minSearchLength: 3,
};

export default GenericFilter;