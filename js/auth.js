/**
 * Authentication Module for RSS Feed Aggregator
 * Handles user authentication, registration, and session management
 */

import API from './api.js';
import UI from './ui.js';

const Auth = (() => {
  // DOM elements to be set once document is loaded
  let loginModal;
  let apiKeyModal;
  
  // Initialize auth module - call this when DOM is ready
  const init = () => {
    // Check if user is already logged in
    checkAuthStatus();
  };
  
  // Check if user is authenticated
  const checkAuthStatus = () => {
    if (API.isAuthenticated()) {
      return true;
    }
    return false;
  };
  
  // Show the login modal
  const showLoginModal = () => {
    if (document.getElementById('login-modal')) return;
    
    const modal = document.createElement('div');
    modal.id = 'login-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="flex mb-4 border-b">
          <button id="tab-new-user" class="flex-1 py-2 font-semibold border-b-2 border-green-600">New User</button>
          <button id="tab-api-key" class="flex-1 py-2 font-semibold text-gray-500">Login with API Key</button>
        </div>
        <div id="login-tab-content"></div>
      </div>
    `;
    
    document.body.appendChild(modal);
    document.getElementById('tab-new-user').onclick = () => switchLoginTab('new');
    document.getElementById('tab-api-key').onclick = () => switchLoginTab('api');
    
    switchLoginTab('new');
    
    loginModal = modal;
  };
  
  // Hide the login modal
  const hideLoginModal = () => {
    if (loginModal) {
      loginModal.remove();
      loginModal = null;
    }
  };
  
  // Switch between login tabs
  const switchLoginTab = (tab) => {
    const tabContent = document.getElementById('login-tab-content');
    const tabNew = document.getElementById('tab-new-user');
    const tabApi = document.getElementById('tab-api-key');
    
    if (tab === 'new') {
      tabNew.classList.add('border-green-600', 'text-black');
      tabNew.classList.remove('text-gray-500');
      tabApi.classList.remove('border-green-600', 'text-black');
      tabApi.classList.add('text-gray-500');
      
      tabContent.innerHTML = `
        <form id="login-form" class="mt-4">
          <div class="form-group">
            <label class="form-label" for="login-username">Username</label>
            <input id="login-username" class="form-input" type="text" required />
          </div>
          <button class="btn btn-primary w-full mt-4" type="submit">Create New User</button>
          <div class="text-xs text-gray-500 mt-2">This will create a new user and give you a new API key.</div>
        </form>
      `;
      
      document.getElementById('login-form').onsubmit = handleCreateUser;
    } else {
      tabApi.classList.add('border-green-600', 'text-black');
      tabApi.classList.remove('text-gray-500');
      tabNew.classList.remove('border-green-600', 'text-black');
      tabNew.classList.add('text-gray-500');
      
      tabContent.innerHTML = `
        <form id="api-key-form" class="mt-4">
          <div class="form-group">
            <label class="form-label" for="api-key-input">API Key</label>
            <input id="api-key-input" class="form-input" type="text" required />
          </div>
          <button class="btn btn-primary w-full mt-4" type="submit">Login with API Key</button>
          <div class="text-xs text-gray-500 mt-2">Paste your API key to log in as an existing user.</div>
        </form>
      `;
      
      document.getElementById('api-key-form').onsubmit = handleApiKeyLogin;
    }
  };
  
  // Show API Key Modal after signup
  const showApiKeyModal = (apiKey) => {
    if (document.getElementById('api-key-modal')) return;
    
    const modal = document.createElement('div');
    modal.id = 'api-key-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content text-center">
        <h2 class="text-2xl font-bold mb-4 text-green-700">Your API Key</h2>
        <div class="mb-4">
          <input id="api-key-display" class="form-input text-center font-mono text-green-700 bg-gray-100" value="${apiKey}" readonly />
        </div>
        <button id="copy-api-key" class="btn btn-primary mb-2">Copy API Key</button>
        <div class="text-xs text-gray-500 mb-4">Save this API key somewhere safe. You will need it to log in again!</div>
        <button id="close-api-key-modal" class="text-gray-500 hover:text-gray-700 text-sm">Close</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    document.getElementById('copy-api-key').onclick = () => {
      const input = document.getElementById('api-key-display');
      input.select();
      document.execCommand('copy');
      document.getElementById('copy-api-key').textContent = 'Copied!';
      setTimeout(() => { document.getElementById('copy-api-key').textContent = 'Copy API Key'; }, 1500);
    };
    
    document.getElementById('close-api-key-modal').onclick = () => {
      modal.remove();
      apiKeyModal = null;
    };
    
    apiKeyModal = modal;
  };
  
  // Handle user creation
  const handleCreateUser = async (e) => {
    e.preventDefault();
    const name = document.getElementById('login-username').value;
    
    try {
      const data = await API.createUser(name);
      API.setApiKey(data.api_key);
      
      hideLoginModal();
      showApiKeyModal(data.api_key);
      
      // Update UI after successful login
      UI.renderFeedsPanel();
      UI.renderNewsfeedPage();
      
      return true;
    } catch (error) {
      UI.showNotification('Error creating user. Please try again.', 'error');
      console.error('Error creating user:', error);
      return false;
    }
  };
  
  // Handle API key login
  const handleApiKeyLogin = (e) => {
    e.preventDefault();
    const key = document.getElementById('api-key-input').value.trim();
    
    if (key) {
      API.setApiKey(key);
      hideLoginModal();
      
      // Update UI after successful login
      UI.renderFeedsPanel();
      UI.renderNewsfeedPage();
      
      return true;
    } else {
      UI.showNotification('Please enter a valid API key.', 'error');
      return false;
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    API.clearApiKey();
    showLoginModal();
    return true;
  };
  
  // Public methods
  return {
    init,
    checkAuthStatus,
    showLoginModal,
    hideLoginModal,
    showApiKeyModal,
    handleLogout
  };
})();

export default Auth; 