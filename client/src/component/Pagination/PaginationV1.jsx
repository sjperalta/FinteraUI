import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

function PaginationV1({ perPageOptions, currentPerPage, onPerPageChange, className }) {
  const [active, setActive] = useState(false);
  const dropdownRef = useRef(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActive(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative items-center space-x-4 lg:flex ${className}`}>
      <span className="text-sm font-semibold text-bgray-600 dark:text-bgray-50">Show result:</span>
      <div className="relative" ref={dropdownRef}>
        <button
          aria-label="Toggle dropdown"
          onClick={() => setActive(!active)}
          type="button"
          className="flex items-center space-x-6 rounded-lg border border-bgray-300 px-2.5 py-[14px] dark:border-darkblack-400"
        >
          <span className="text-sm font-semibold text-bgray-900 dark:text-bgray-50">
            {currentPerPage}
          </span>
          <span>
            <svg
              width="17"
              height="17"
              viewBox="0 0 17 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.03516 6.03271L8.03516 10.0327L12.0352 6.03271"
                stroke="#A0AEC0"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>

        {/* Dropdown Menu */}
        {active && (
          <div
            id="result-filter"
            className="absolute right-0 top-full z-10 mt-2 w-full overflow-hidden rounded-lg bg-white shadow-lg"
          >
            <ul className="divide-y divide-bgray-200">
              {perPageOptions.map((option) => (
                <li
                  key={option}
                  onClick={() => {
                    setActive(false);
                    onPerPageChange(option);
                  }}
                  className="cursor-pointer px-5 py-2 text-sm font-medium hover:bg-bgray-100"
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

PaginationV1.propTypes = {
  perPageOptions: PropTypes.arrayOf(PropTypes.number),
  currentPerPage: PropTypes.number,
  onPerPageChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default PaginationV1;