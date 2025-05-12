/**
 * Utilities Module for RSS Feed Aggregator
 * Provides common utility functions
 */

const Utils = (() => {
  /**
   * Debounce function to limit how often a function can be called
   * @param {Function} func - The function to debounce
   * @param {number} wait - The delay in milliseconds
   * @param {boolean} immediate - Whether to call the function immediately
   * @returns {Function} - The debounced function
   */
  const debounce = (func, wait = 300, immediate = false) => {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      
      if (callNow) func.apply(context, args);
    };
  };

  /**
   * Truncate text to a specified length and add ellipsis
   * @param {string} text - The text to truncate
   * @param {number} length - The maximum length
   * @returns {string} - Truncated text
   */
  const truncateText = (text, length = 150) => {
    if (!text) return '';
    if (text.length <= length) return text;
    
    return text.substring(0, length) + '...';
  };

  /**
   * Format a date in a readable format
   * @param {string|Date} date - The date to format
   * @param {object} options - Formatting options
   * @returns {string} - Formatted date string
   */
  const formatDate = (date, options = {}) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    return dateObj.toLocaleDateString('en-US', { ...defaultOptions, ...options });
  };

  /**
   * Create a unique ID
   * @returns {string} - Unique ID
   */
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  /**
   * Get a value from local storage with fallback
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if not found
   * @returns {*} - Stored value or default
   */
  const getFromStorage = (key, defaultValue = null) => {
    const value = localStorage.getItem(key);
    if (value === null) return defaultValue;
    
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  };

  /**
   * Store a value in local storage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   */
  const setInStorage = (key, value) => {
    if (typeof value === 'object') {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.setItem(key, value);
    }
  };

  /**
   * Sanitize HTML to prevent XSS attacks
   * @param {string} html - HTML string to sanitize
   * @returns {string} - Sanitized HTML
   */
  const sanitizeHtml = (html) => {
    if (!html) return '';
    
    // Create a temporary element
    const temp = document.createElement('div');
    temp.textContent = html;
    
    return temp.innerHTML;
  };

  // Public API
  return {
    debounce,
    truncateText,
    formatDate,
    generateId,
    getFromStorage,
    setInStorage,
    sanitizeHtml
  };
})();

export default Utils; 