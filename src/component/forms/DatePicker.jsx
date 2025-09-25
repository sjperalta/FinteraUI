import { useState, useRef, useEffect } from 'react';
import Datepicker from 'tailwind-datepicker-react';

const DatePicker = ({ 
  value, 
  onChange, 
  placeholder = "Seleccionar fecha", 
  label,
  required = false,
  disabled = false,
  className = "",
  error = null
}) => {
  const [show, setShow] = useState(false);
  const datePickerRef = useRef(null);

  // Convert string date to Date object for the datepicker
  const selectedDate = value ? new Date(value) : null;

  const options = {
    title: label || "Seleccionar Fecha",
    autoHide: true,
    todayBtn: true,
    clearBtn: true,
    clearBtnText: "Limpiar",
    maxDate: new Date("2030-01-01"),
    minDate: new Date("2020-01-01"),
    theme: {
      background: "bg-white dark:bg-darkblack-600 border border-gray-200 dark:border-darkblack-500 rounded-lg shadow-2xl",
      todayBtn: "bg-blue-500 hover:bg-blue-600 text-white font-medium",
      clearBtn: "bg-gray-100 hover:bg-gray-200 dark:bg-darkblack-500 dark:hover:bg-darkblack-400 text-bgray-900 dark:text-white font-medium",
      icons: "text-bgray-900 dark:text-white",
      text: "text-bgray-900 dark:text-white",
      disabledText: "text-bgray-400 dark:text-bgray-600",
      input: "w-full px-4 py-3 pr-12 border border-gray-200 dark:border-darkblack-500 rounded-lg bg-white dark:bg-darkblack-600 text-bgray-900 dark:text-white placeholder-bgray-500 dark:placeholder-bgray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200",
      inputIcon: "hidden",
      selected: "bg-blue-500 text-white hover:bg-blue-600"
    },
    icons: {
      prev: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      ),
      next: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )
    },
    datepickerClassNames: "absolute z-[1000] mt-1 shadow-xl left-0 top-full",
    defaultDate: selectedDate,
    language: "es",
    disabledDates: [],
    weekDays: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
    inputNameProp: "date",
    inputIdProp: "date",
    inputPlaceholderProp: placeholder,
    inputDateFormatProp: {
      day: "numeric",
      month: "long", 
      year: "numeric"
    }
  };

  const handleChange = (selectedDate) => {
    if (selectedDate) {
      // Format date as YYYY-MM-DD for consistency with the existing HTML date inputs
      const formattedDate = selectedDate.toISOString().split('T')[0];
      onChange(formattedDate);
    } else {
      onChange('');
    }
  };

  const handleClose = (state) => {
    setShow(state);
  };

  // Handle clicking outside to close the datepicker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShow(false);
      }
    };

    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [show]);

  return (
    <div className={`space-y-2 ${className}`} ref={datePickerRef}>
      {label && (
        <label className="block text-sm font-medium text-bgray-900 dark:text-white">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative overflow-visible">
        <Datepicker 
          options={options} 
          onChange={handleChange}
          show={show}
          setShow={handleClose}
          classNames={disabled ? "opacity-50 cursor-not-allowed" : ""}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-5 h-5 text-bgray-500 dark:text-bgray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      {value && (
        <p className="text-xs text-bgray-500 dark:text-bgray-400">
          Fecha seleccionada: {new Date(value).toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      )}
    </div>
  );
};

export default DatePicker;