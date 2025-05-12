/**
 * Main Application Entry Point
 * RSS Feed Aggregator Frontend
 */

import API from './js/api.js';
import Auth from './js/auth.js';
import FeedManager from './js/feedManager.js';
import UI from './js/ui.js';
import Utils from './js/utils.js';

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize modules
  UI.initTheme();
  UI.init();
  Auth.init();
  FeedManager.init();
  
  // Check if user is authenticated
  if (!API.isAuthenticated()) {
    // Show login modal if not authenticated
    Auth.showLoginModal();
  } else {
    // Initialize feeds and render content if authenticated
    FeedManager.loadFeedsAndFollows().then(() => {
      UI.renderFeedsPanel();
      UI.renderNewsfeedPage();
    });
  }
  
  // Add window resize handler
  window.addEventListener('resize', Utils.debounce(() => {
    // Update UI based on screen size
    UI.renderNewsfeedPage();
  }, 250));
}); 