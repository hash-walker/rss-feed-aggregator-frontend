/**
 * API Module for RSS Feed Aggregator
 * Handles all API communication with the backend
 */

const API = (() => {
  // Configuration
  const API_BASE_URL = 'http://localhost:8080/v1';
  let apiKey = localStorage.getItem('apiKey');

  // Set API key
  const setApiKey = (key) => {
    apiKey = key;
    localStorage.setItem('apiKey', key);
  };

  // Clear API key
  const clearApiKey = () => {
    apiKey = null;
    localStorage.removeItem('apiKey');
  };

  // Get API key
  const getApiKey = () => apiKey;

  // Create auth header
  const getHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `ApiKey ${apiKey}`
    };
  };

  // Check if user is authenticated
  const isAuthenticated = () => !!apiKey;

  // User API calls
  const createUser = async (name) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  // Feeds API calls
  const getFeeds = async () => {
    try {
      if (!apiKey) throw new Error('No API key');
      
      const response = await fetch(`${API_BASE_URL}/feeds`, {
        headers: getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching feeds:', error);
      throw error;
    }
  };

  const createFeed = async (name, url) => {
    try {
      if (!apiKey) throw new Error('No API key');
      
      const response = await fetch(`${API_BASE_URL}/feeds`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, url }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating feed:', error);
      throw error;
    }
  };

  // Feed follows API calls
  const getFeedFollows = async () => {
    try {
      if (!apiKey) throw new Error('No API key');
      
      const response = await fetch(`${API_BASE_URL}/feed_follows`, {
        headers: getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching feed follows:', error);
      throw error;
    }
  };

  const followFeed = async (feedId) => {
    try {
      if (!apiKey) throw new Error('No API key');
      
      const response = await fetch(`${API_BASE_URL}/feed_follows`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ feed_id: feedId }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error following feed:', error);
      throw error;
    }
  };

  const unfollowFeed = async (followId) => {
    try {
      if (!apiKey) throw new Error('No API key');
      
      const response = await fetch(`${API_BASE_URL}/feed_follows/${followId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error unfollowing feed:', error);
      throw error;
    }
  };

  // Posts API calls
  const getPosts = async () => {
    try {
      if (!apiKey) throw new Error('No API key');
      
      const response = await fetch(`${API_BASE_URL}/posts`, {
        headers: getHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  };

  // Return public API
  return {
    setApiKey,
    clearApiKey,
    getApiKey,
    isAuthenticated,
    createUser,
    getFeeds,
    createFeed,
    getFeedFollows,
    followFeed,
    unfollowFeed,
    getPosts
  };
})();

// Export the API module
export default API; 