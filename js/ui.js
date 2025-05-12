/**
 * UI Module for RSS Feed Aggregator
 * Handles rendering the user interface and UI interactions
 */

import API from './api.js';
import FeedManager from './feedManager.js';
import Utils from './utils.js';

const UI = (() => {
  // State management
  let activeNav = 'nav-your-feeds';
  let feedsPanelExpanded = localStorage.getItem('feedsPanelExpanded') !== 'false'; // Default to expanded
  let sidebarExpanded = window.innerWidth >= 768; // Default collapsed on mobile
  
  // DOM elements - will be set in init
  let mainContent;
  let feedsPanel;
  let feedsPanelList;
  let toggleFeedsPanelBtn;
  let sidebar;
  let toggleSidebarBtn;
  let contentArea;
  
  // Navigation items configuration
  const navItems = [
    { id: 'nav-your-feeds', label: 'Your Feeds', icon: 'fa-regular fa-rectangle-list' },
    { id: 'nav-saved', label: 'Saved', icon: 'fa-regular fa-bookmark' },
    { id: 'nav-search', label: 'Search', icon: 'fa-solid fa-magnifying-glass' },
    { id: 'nav-create-feed', label: 'Create Feed', icon: 'fa-regular fa-square-plus' },
    { id: 'nav-notifications', label: 'Notifications', icon: 'fa-regular fa-bell' },
    { id: 'nav-support', label: 'Support', icon: 'fa-regular fa-circle-question' },
    { id: 'nav-settings', label: 'Settings', icon: 'fa-solid fa-gear' },
    { id: 'nav-account', label: 'Account', icon: 'fa-regular fa-user' },
  ];

  // Initialize UI module - call this when DOM is ready
  const init = () => {
    // Set DOM elements
    mainContent = document.getElementById('main-content');
    feedsPanelList = document.getElementById('feeds-panel-list');
    feedsPanel = document.getElementById('feeds-panel');
    toggleFeedsPanelBtn = document.getElementById('toggle-feeds-panel');
    sidebar = document.getElementById('sidebar');
    toggleSidebarBtn = document.getElementById('toggle-sidebar');
    contentArea = document.querySelector('.content-area');
    
    // Add event listeners
    initEventListeners();
    
    // Initialize panels
    initializePanels();
    
    // Initialize navigation
    initializeNavigation();
    
    // Render initial state
    renderFeedsPanel();
    renderNewsfeedPage();
  };
  
  // Add event listeners
  const initEventListeners = () => {
    // Toggle feeds panel
    if (toggleFeedsPanelBtn) {
      toggleFeedsPanelBtn.addEventListener('click', toggleFeedsPanel);
    }
    
    // Toggle sidebar
    if (toggleSidebarBtn) {
      toggleSidebarBtn.addEventListener('click', toggleSidebar);
    }
    
    // Handle window resize
    window.addEventListener('resize', handleWindowResize);
  };
  
  // Initialize navigation
  const initializeNavigation = () => {
    navItems.forEach(item => {
      const navElement = document.getElementById(item.id);
      if (navElement) {
        navElement.addEventListener('click', () => {
          setActiveNav(item.id);
        });
      }
    });
  };
  
  // Set active navigation item
  const setActiveNav = (navId) => {
    activeNav = navId;
    FeedManager.selectFeed(null); // Clear selected feed
    renderSidebar();
    
    // Render appropriate page
    switch (navId) {
      case 'nav-your-feeds':
        renderNewsfeedPage();
        break;
      case 'nav-saved':
        renderSavedPage();
        break;
      case 'nav-search':
        renderSearchPage();
        break;
      case 'nav-create-feed':
        renderCreateFeedPage();
        break;
      case 'nav-notifications':
        renderNotificationsPage();
        break;
      case 'nav-support':
        renderSupportPage();
        break;
      case 'nav-settings':
        renderSettingsPage();
        break;
      case 'nav-account':
        renderAccountPage();
        break;
    }
  };
  
  // Show notification
  const showNotification = (message, type = 'info') => {
    // Remove any existing notification
    const existingNotification = document.getElementById('notification');
    if (existingNotification) {
      existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = `fixed top-4 right-4 p-4 rounded shadow-lg z-50 transition-opacity duration-300 flex items-center ${
      type === 'error' ? 'bg-red-500 text-white' : 
      type === 'success' ? 'bg-green-500 text-white' : 
      'bg-blue-500 text-white'
    }`;
    
    notification.innerHTML = `
      <span>${message}</span>
      <button class="ml-4 text-white hover:text-gray-200">
        <i class="fa-solid fa-times"></i>
      </button>
    `;
    
    // Add close button functionality
    notification.querySelector('button').addEventListener('click', () => {
      notification.classList.add('opacity-0');
      setTimeout(() => notification.remove(), 300);
    });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      notification.classList.add('opacity-0');
      setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Add to DOM
    document.body.appendChild(notification);
  };
  
  // Initialize panels
  const initializePanels = () => {
    updateFeedsPanelVisibility();
    
    // Handle sidebar responsiveness
    if (window.innerWidth < 768) {
      sidebarExpanded = false;
      updateSidebarVisibility();
    }
  };
  
  // Handle window resize
  const handleWindowResize = () => {
    // Update layout based on screen size
    if (window.innerWidth < 768) {
      if (sidebarExpanded) {
        // Keep overlay when resizing while sidebar is open
        if (!document.getElementById('sidebar-overlay')) {
          updateSidebarVisibility();
        }
      } else {
        // Make sure mobile menu button is showing
        if (!document.getElementById('mobile-menu-btn')) {
          createMobileMenuButton();
        }
      }
    } else {
      // On desktop/larger screens
      const overlay = document.getElementById('sidebar-overlay');
      if (overlay) overlay.remove();
      
      const mobileMenuBtn = document.getElementById('mobile-menu-btn');
      if (mobileMenuBtn) mobileMenuBtn.remove();
      
      // Show sidebar on larger screens
      sidebar.classList.remove('sidebar-mobile-collapsed');
      sidebar.classList.add('sidebar-mobile-expanded');
      sidebarExpanded = true;
    }
    
    // Update content grid columns
    if (activeNav === 'nav-your-feeds') {
      renderNewsfeedPage();
    } else if (FeedManager.getSelectedFeedId()) {
      renderFeedPostsPage(FeedManager.getSelectedFeedId());
    }
  };
  
  // Create mobile menu button
  const createMobileMenuButton = () => {
    const menuBtn = document.createElement('button');
    menuBtn.id = 'mobile-menu-btn';
    menuBtn.className = 'mobile-menu-btn';
    menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
    menuBtn.addEventListener('click', toggleSidebar);
    document.body.appendChild(menuBtn);
  };

  // Toggle feeds panel
  const toggleFeedsPanel = () => {
    feedsPanelExpanded = !feedsPanelExpanded;
    updateFeedsPanelVisibility();
    
    // Force re-render the current page to adjust grid sizing
    if (activeNav === 'nav-your-feeds') {
      renderNewsfeedPage();
    } else if (FeedManager.getSelectedFeedId()) {
      renderFeedPostsPage(FeedManager.getSelectedFeedId());
    }
  };
  
  // Update feeds panel visibility
  const updateFeedsPanelVisibility = () => {
    // Remove any existing show button first
    const existingShowBtn = document.getElementById('show-feeds-btn');
    if (existingShowBtn) existingShowBtn.remove();
    
    if (feedsPanelExpanded) {
      // Show panel
      feedsPanel.classList.add('feeds-panel-expanded');
      feedsPanel.classList.remove('feeds-panel-collapsed');
      
      if (toggleFeedsPanelBtn) {
        toggleFeedsPanelBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
      }
    } else {
      // Hide panel
      feedsPanel.classList.remove('feeds-panel-expanded');
      feedsPanel.classList.add('feeds-panel-collapsed');
      
      if (toggleFeedsPanelBtn) {
        toggleFeedsPanelBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
      }
      
      // Create a floating button to show the panel again
      createShowFeedsPanelButton();
    }
    
    localStorage.setItem('feedsPanelExpanded', feedsPanelExpanded);
    
    // Fix for void space - ensure content reflows
    if (contentArea) {
      contentArea.style.display = 'flex';
      contentArea.style.flex = '1';
    }
  };

  // Create show feeds panel button
  const createShowFeedsPanelButton = () => {
    const showButton = document.createElement('button');
    showButton.id = 'show-feeds-btn';
    showButton.className = 'float-btn';
    showButton.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    showButton.addEventListener('click', toggleFeedsPanel);
    document.body.appendChild(showButton);
  };
  
  // Toggle sidebar
  const toggleSidebar = () => {
    sidebarExpanded = !sidebarExpanded;
    updateSidebarVisibility();
  };
  
  // Update sidebar visibility
  const updateSidebarVisibility = () => {
    if (sidebarExpanded) {
      sidebar.classList.remove('sidebar-mobile-collapsed');
      sidebar.classList.add('sidebar-mobile-expanded');
      
      // Create an overlay to allow clicking outside to close
      if (!document.getElementById('sidebar-overlay') && window.innerWidth < 768) {
        const overlay = document.createElement('div');
        overlay.id = 'sidebar-overlay';
        overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-10';
        overlay.addEventListener('click', toggleSidebar);
        document.body.appendChild(overlay);
        sidebar.style.zIndex = '20';
      }
    } else {
      sidebar.classList.remove('sidebar-mobile-expanded');
      sidebar.classList.add('sidebar-mobile-collapsed');
      
      // Remove the overlay
      const overlay = document.getElementById('sidebar-overlay');
      if (overlay) overlay.remove();
      
      // Add a menu button if on mobile and not present
      if (window.innerWidth < 768 && !document.getElementById('mobile-menu-btn')) {
        createMobileMenuButton();
      }
    }
  };
  
  // Render sidebar with active nav item
  const renderSidebar = () => {
    const sidebar = document.querySelector('aside');
    if (!sidebar) return;
    
    // Remove active class from all navigation items
    sidebar.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Add active class to current nav item
    const activeNavItem = document.getElementById(activeNav);
    if (activeNavItem) {
      activeNavItem.classList.add('active');
    }
  };
  
  // Render feeds panel
  const renderFeedsPanel = async () => {
    if (!feedsPanelList) return;
    
    feedsPanelList.innerHTML = `<div class="flex justify-center p-4"><i class="fa-solid fa-spinner fa-spin"></i></div>`;
    
    // Check if user is authenticated
    if (!API.isAuthenticated()) {
      feedsPanelList.innerHTML = `
        <div class="p-4">
          <div class="text-red-500 mb-4">You need to log in to view feeds</div>
          <button id="feeds-login-btn" class="btn btn-primary w-full">Log In</button>
        </div>
      `;
      
      const loginBtn = document.getElementById('feeds-login-btn');
      if (loginBtn) {
        loginBtn.addEventListener('click', () => {
          // We need to use dynamic import because of circular dependency
          import('./auth.js').then(module => {
            const Auth = module.default;
            Auth.showLoginModal();
          });
        });
      }
      
      return;
    }
    
    // Refresh feeds data
    await FeedManager.loadFeedsAndFollows();
    
    // Get feed data
    const followedFeeds = FeedManager.getFollowedFeeds();
    const availableFeeds = FeedManager.getAvailableFeeds();
    const selectedFeedId = FeedManager.getSelectedFeedId();
    
    // Create "All Feeds" button
    let html = `
      <button class="w-full flex items-center gap-2 px-3 py-2 rounded-lg ${activeNav === 'nav-your-feeds' ? 'bg-green-100 font-semibold text-green-800' : 'bg-gray-100'} mb-4" id="feeds-newsfeed">
        <i class="fa-regular fa-rectangle-list"></i> All Feeds 
        <span class="ml-auto bg-gray-200 text-xs px-2 py-0.5 rounded" id="feeds-count">${followedFeeds.length}</span>
      </button>
    `;
    
    // Followed feeds section
    if (followedFeeds.length > 0) {
      html += '<div class="mb-2 px-2 text-xs text-gray-500 uppercase font-semibold">Followed Feeds</div>';
      html += followedFeeds.map(feed => {
        const isSelected = selectedFeedId === feed.id;
        return `
          <div class="feed-item ${isSelected ? 'active' : ''}">
            <button class="feed-item-name feed-select-btn" data-feed-id="${feed.id}">
              <i class="fa-solid fa-angle-right"></i> ${feed.name}
            </button>
            <button class="text-xs px-2 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 follow-btn" 
              data-feed-id="${feed.id}" 
              data-follow-id="${feed.followId || ''}"
              data-action="unfollow"
            >
              Unfollow
            </button>
          </div>
        `;
      }).join('');
    }
    
    // Available feeds section
    if (availableFeeds.length > 0) {
      html += '<div class="mt-4 mb-2 px-2 text-xs text-gray-500 uppercase font-semibold">Available Feeds</div>';
      html += availableFeeds.map(feed => {
        const isSelected = selectedFeedId === feed.id;
        return `
          <div class="feed-item ${isSelected ? 'active' : ''}">
            <button class="feed-item-name feed-select-btn" data-feed-id="${feed.id}">
              <i class="fa-solid fa-angle-right"></i> ${feed.name}
            </button>
            <button class="text-xs px-2 py-1 rounded bg-green-100 text-green-600 hover:bg-green-200 follow-btn" 
              data-feed-id="${feed.id}" 
              data-action="follow"
            >
              Follow
            </button>
          </div>
        `;
      }).join('');
    }
    
    // If no feeds at all
    if (followedFeeds.length === 0 && availableFeeds.length === 0) {
      html += '<div class="text-gray-400 p-4">No feeds found. Add a feed to get started!</div>';
    }
    
    feedsPanelList.innerHTML = html;
    
    // Add click handlers for "All Feeds" button
    const allFeedsBtn = document.getElementById('feeds-newsfeed');
    if (allFeedsBtn) {
      allFeedsBtn.addEventListener('click', () => {
        FeedManager.selectFeed(null);
        setActiveNav('nav-your-feeds');
      });
    }
    
    // Add click handlers for feed buttons
    feedsPanelList.querySelectorAll('.feed-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const feedId = btn.getAttribute('data-feed-id');
        FeedManager.selectFeed(feedId);
        setActiveNav(null); // Deselect nav items
        renderFeedPostsPage(feedId);
        highlightSelectedFeed();
      });
    });
    
    // Add click handlers for follow/unfollow buttons
    feedsPanelList.querySelectorAll('.follow-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();  // Prevent triggering the parent feed selection
        
        const feedId = btn.getAttribute('data-feed-id');
        const followId = btn.getAttribute('data-follow-id');
        const action = btn.getAttribute('data-action');
        
        // Disable button while in progress
        btn.disabled = true;
        btn.innerHTML = `<span class="inline-block animate-pulse">Processing...</span>`;
        
        try {
          if (action === 'follow') {
            await FeedManager.followFeed(feedId);
          } else {
            await FeedManager.unfollowFeed(followId);
          }
          
          // Re-render feeds panel and content
          await renderFeedsPanel();
          
          if (FeedManager.getSelectedFeedId()) {
            renderFeedPostsPage(FeedManager.getSelectedFeedId());
          } else {
            renderNewsfeedPage();
          }
          
          showNotification(
            action === 'follow' ? 'Feed followed successfully!' : 'Feed unfollowed successfully!', 
            'success'
          );
        } catch (error) {
          console.error(`Error ${action}ing feed:`, error);
          showNotification(`Failed to ${action} feed`, 'error');
          
          // Re-enable button
          btn.disabled = false;
          btn.textContent = action === 'follow' ? 'Follow' : 'Unfollow';
        }
      });
    });
    
    highlightSelectedFeed();
  };
  
  // Highlight the selected feed
  const highlightSelectedFeed = () => {
    const selectedFeedId = FeedManager.getSelectedFeedId();
    
    document.querySelectorAll('.feed-item').forEach(item => {
      const feedId = item.querySelector('.feed-select-btn').getAttribute('data-feed-id');
      if (feedId === selectedFeedId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  };
  
  // Get appropriate grid columns class based on screen size and panel state
  const getGridColumnsClass = () => {
    // On mobile, always use single column
    if (window.innerWidth < 640) {
      return 'grid-cols-1';
    }
    
    // On tablet, use 1-2 columns
    if (window.innerWidth < 1024) {
      return feedsPanelExpanded ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2';
    }
    
    // On desktop
    if (feedsPanelExpanded) {
      return 'grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3';
    } else {
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
  };

  // Render the newsfeed page
  const renderNewsfeedPage = () => {
    if (!mainContent) return;
    
    const columnsClass = getGridColumnsClass();
    
    mainContent.innerHTML = `
      <div class="content-header">
        <h1 class="content-title">Newsfeed</h1>
        <div class="text-sm text-gray-500 hidden md:block">
          ${feedsPanelExpanded ? 
            '<span><i class="fa-solid fa-eye-slash mr-1"></i>Hide feeds panel to see more posts</span>' : 
            '<span><i class="fa-solid fa-eye mr-1"></i>Show feeds panel</span>'}
        </div>
      </div>
      <div id="posts-grid" class="posts-grid ${columnsClass} ${!feedsPanelExpanded ? 'expanded' : ''}"></div>
    `;
    
    loadPosts();
  };
  
  // Render a specific feed's posts
  const renderFeedPostsPage = (feedId) => {
    if (!mainContent) return;
    
    const feed = FeedManager.getFeedById(feedId);
    const feedName = feed ? feed.name : 'Feed Posts';
    const columnsClass = getGridColumnsClass();
    
    mainContent.innerHTML = `
      <div class="content-header">
        <h1 class="content-title">${feedName}</h1>
        <div class="text-sm text-gray-500 hidden md:block">
          ${feedsPanelExpanded ? 
            '<span><i class="fa-solid fa-eye-slash mr-1"></i>Hide feeds panel to see more posts</span>' : 
            '<span><i class="fa-solid fa-eye mr-1"></i>Show feeds panel</span>'}
        </div>
      </div>
      <div id="posts-grid" class="posts-grid ${columnsClass} ${!feedsPanelExpanded ? 'expanded' : ''}"></div>
    `;
    
    loadFeedPosts(feedId);
  };
  
  // Load all posts
  const loadPosts = async () => {
    const postsGrid = document.getElementById('posts-grid');
    if (!postsGrid) return;
    
    if (!API.isAuthenticated()) {
      postsGrid.innerHTML = `
        <div class="col-span-full text-center p-8">
          <div class="text-red-500 mb-4">Please log in to view posts</div>
          <button id="login-btn-posts" class="btn btn-primary">Log In</button>
        </div>
      `;
      
      document.getElementById('login-btn-posts')?.addEventListener('click', () => {
        import('./auth.js').then(module => {
          const Auth = module.default;
          Auth.showLoginModal();
        });
      });
      
      return;
    }
    
    postsGrid.innerHTML = '<div class="text-gray-400 col-span-full text-center p-8"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Loading posts...</div>';
    
    try {
      const posts = await API.getPosts();
      displayPosts(posts);
    } catch (error) {
      console.error('Error loading posts:', error);
      postsGrid.innerHTML = `<div class="text-red-500 col-span-full p-4">Error loading posts: ${error.message}</div>`;
    }
  };
  
  // Load posts for a specific feed
  const loadFeedPosts = async (feedId) => {
    const postsGrid = document.getElementById('posts-grid');
    if (!postsGrid) return;
    
    if (!API.isAuthenticated()) {
      postsGrid.innerHTML = `
        <div class="col-span-full text-center p-8">
          <div class="text-red-500 mb-4">Please log in to view posts</div>
          <button id="login-btn-posts" class="btn btn-primary">Log In</button>
        </div>
      `;
      
      document.getElementById('login-btn-posts')?.addEventListener('click', () => {
        import('./auth.js').then(module => {
          const Auth = module.default;
          Auth.showLoginModal();
        });
      });
      
      return;
    }
    
    postsGrid.innerHTML = '<div class="text-gray-400 col-span-full text-center p-8"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Loading posts...</div>';
    
    try {
      // Get all posts and filter for this feed
      const allPosts = await API.getPosts();
      const feedPosts = allPosts.filter(post => post.feed_id === feedId);
      
      displayPosts(feedPosts);
    } catch (error) {
      console.error('Error loading feed posts:', error);
      postsGrid.innerHTML = `<div class="text-red-500 col-span-full p-4">Error loading posts: ${error.message}</div>`;
    }
  };
  
  // Display posts in the grid
  const displayPosts = (posts) => {
    const postsGrid = document.getElementById('posts-grid');
    if (!postsGrid) return;
    
    if (!posts || posts.length === 0) {
      postsGrid.innerHTML = `
        <div class="col-span-full text-center p-8">
          <div class="text-gray-400 mb-4">No posts found</div>
          <p class="text-gray-500">Try following some feeds to see posts!</p>
        </div>
      `;
      return;
    }
    
    // Sort posts by date (newest first)
    const sortedPosts = [...posts].sort((a, b) => {
      return new Date(b.published_at) - new Date(a.published_at);
    });
    
    postsGrid.innerHTML = sortedPosts.map(post => {
      // Format date for display
      const publishDate = new Date(post.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      return `
        <div class="post-card">
          <div class="post-card-content">
            <div class="post-card-header">
              <h3 class="post-card-title">${post.title || 'No Title'}</h3>
              <button class="text-gray-400 hover:text-green-600 save-post-btn ml-2" data-post-id="${post.id}">
                <i class="fa-regular fa-bookmark"></i>
              </button>
            </div>
            
            <div class="post-card-description">${post.description || 'No description available.'}</div>
            
            <div class="post-card-footer">
              <a href="${post.url}" target="_blank" class="post-card-link">
                Read More
                <span class="icon"><i class="fa-solid fa-arrow-right"></i></span>
              </a>
              <span class="post-card-date">${publishDate}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    // Add event listeners for save buttons
    postsGrid.querySelectorAll('.save-post-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const postId = this.getAttribute('data-post-id');
        // Toggle saved state visually
        this.classList.toggle('text-green-600');
        this.classList.toggle('text-gray-400');
        this.innerHTML = this.classList.contains('text-green-600') ? 
          '<i class="fa-solid fa-bookmark"></i>' : 
          '<i class="fa-regular fa-bookmark"></i>';
        
        // Store in localStorage
        const savedPosts = JSON.parse(localStorage.getItem('savedPosts') || '[]');
        const postIndex = savedPosts.indexOf(postId);
        
        if (postIndex === -1) {
          savedPosts.push(postId);
          showNotification('Post saved!', 'success');
        } else {
          savedPosts.splice(postIndex, 1);
          showNotification('Post unsaved', 'info');
        }
        
        localStorage.setItem('savedPosts', JSON.stringify(savedPosts));
      });
    });
  };
  
  // Render saved posts page
  const renderSavedPage = async () => {
    mainContent.innerHTML = `
      <div class="content-header">
        <h1 class="content-title">Saved</h1>
      </div>
      <div id="posts-grid" class="posts-grid ${getGridColumnsClass()} ${!feedsPanelExpanded ? 'expanded' : ''}"></div>
    `;
    
    const postsGrid = document.getElementById('posts-grid');
    
    // Get saved post IDs from local storage
    const savedPostIds = JSON.parse(localStorage.getItem('savedPosts') || '[]');
    
    if (savedPostIds.length === 0) {
      postsGrid.innerHTML = `
        <div class="col-span-full text-center p-8">
          <div class="text-gray-400 mb-4">No saved posts</div>
          <p class="text-gray-500">Bookmark posts to save them for later!</p>
        </div>
      `;
      return;
    }
    
    postsGrid.innerHTML = '<div class="text-gray-400 col-span-full text-center p-8"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Loading saved posts...</div>';
    
    try {
      if (!API.isAuthenticated()) {
        postsGrid.innerHTML = `
          <div class="col-span-full text-center p-8">
            <div class="text-red-500 mb-4">Please log in to view saved posts</div>
            <button id="login-btn-saved" class="btn btn-primary">Log In</button>
          </div>
        `;
        
        document.getElementById('login-btn-saved')?.addEventListener('click', () => {
          import('./auth.js').then(module => {
            const Auth = module.default;
            Auth.showLoginModal();
          });
        });
        
        return;
      }
      
      // Get all posts and filter by saved IDs
      const allPosts = await API.getPosts();
      const savedPosts = allPosts.filter(post => savedPostIds.includes(post.id));
      
      displayPosts(savedPosts);
    } catch (error) {
      console.error('Error loading saved posts:', error);
      postsGrid.innerHTML = `<div class="text-red-500 col-span-full p-4">Error loading saved posts: ${error.message}</div>`;
    }
  };
  
  // Render search page
  const renderSearchPage = () => {
    mainContent.innerHTML = `
      <div class="content-header">
        <h1 class="content-title">Search</h1>
      </div>
      <div class="mb-4">
        <input id="search-input" type="text" placeholder="Search feeds or posts..." class="form-input">
      </div>
      <div id="search-results" class="posts-grid ${getGridColumnsClass()} ${!feedsPanelExpanded ? 'expanded' : ''}"></div>
    `;
    
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    
    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce(async function() {
        const query = this.value.trim().toLowerCase();
        
        if (query.length < 2) {
          searchResults.innerHTML = '<div class="col-span-full text-center p-4 text-gray-400">Enter at least 2 characters to search</div>';
          return;
        }
        
        searchResults.innerHTML = '<div class="text-gray-400 col-span-full text-center p-4"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Searching...</div>';
        
        try {
          if (!API.isAuthenticated()) {
            searchResults.innerHTML = `
              <div class="col-span-full text-center p-8">
                <div class="text-red-500 mb-4">Please log in to search posts</div>
                <button id="login-btn-search" class="btn btn-primary">Log In</button>
              </div>
            `;
            
            document.getElementById('login-btn-search')?.addEventListener('click', () => {
              import('./auth.js').then(module => {
                const Auth = module.default;
                Auth.showLoginModal();
              });
            });
            
            return;
          }
          
          // Search in posts
          const allPosts = await API.getPosts();
          const matchedPosts = allPosts.filter(post => {
            return (
              (post.title && post.title.toLowerCase().includes(query)) || 
              (post.description && post.description.toLowerCase().includes(query))
            );
          });
          
          displayPosts(matchedPosts);
        } catch (error) {
          console.error('Error searching posts:', error);
          searchResults.innerHTML = `<div class="text-red-500 col-span-full p-4">Error searching: ${error.message}</div>`;
        }
      }, 500));
    }
  };
  
  // Render create feed page
  const renderCreateFeedPage = () => {
    mainContent.innerHTML = `
      <div class="content-header">
        <h1 class="content-title">Create Feed</h1>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-sm max-w-lg">
        <form id="add-feed-form" class="space-y-4">
          <div class="form-group">
            <label class="form-label" for="feed-name">Feed Name</label>
            <input class="form-input" id="feed-name" type="text" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="feed-url">Feed URL</label>
            <input class="form-input" id="feed-url" type="url" required>
          </div>
          <button class="btn btn-primary" type="submit">Add Feed</button>
        </form>
        <div id="create-feed-message" class="mt-4"></div>
      </div>
    `;
    
    const addFeedForm = document.getElementById('add-feed-form');
    if (addFeedForm) {
      addFeedForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('feed-name').value;
        const url = document.getElementById('feed-url').value;
        const messageElement = document.getElementById('create-feed-message');
        
        try {
          if (!API.isAuthenticated()) {
            messageElement.innerHTML = `
              <div class="text-red-500 mb-4">You need to log in to add feeds</div>
              <button id="login-btn-create" class="btn btn-primary">Log In</button>
            `;
            
            document.getElementById('login-btn-create')?.addEventListener('click', () => {
              import('./auth.js').then(module => {
                const Auth = module.default;
                Auth.showLoginModal();
              });
            });
            
            return;
          }
          
          messageElement.innerHTML = '<div class="text-gray-400"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Adding feed...</div>';
          
          await FeedManager.createFeed(name, url);
          
          // Clear form and show success message
          document.getElementById('feed-name').value = '';
          document.getElementById('feed-url').value = '';
          messageElement.innerHTML = '<div class="text-green-500">Feed added successfully!</div>';
          
          // Re-render feeds panel
          await renderFeedsPanel();
          
          showNotification('Feed added successfully!', 'success');
        } catch (error) {
          console.error('Error adding feed:', error);
          messageElement.innerHTML = `<div class="text-red-500">Failed to add feed: ${error.message}</div>`;
        }
      });
    }
  };
  
  // Simple page renderers for other sections
  const renderNotificationsPage = () => {
    mainContent.innerHTML = `
      <div class="content-header">
        <h1 class="content-title">Notifications</h1>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="text-gray-500">No notifications yet.</div>
      </div>
    `;
  };
  
  const renderSupportPage = () => {
    mainContent.innerHTML = `
      <div class="content-header">
        <h1 class="content-title">Support</h1>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="text-gray-500">Contact support@example.com for help.</div>
      </div>
    `;
  };
  
  const renderSettingsPage = () => {
    mainContent.innerHTML = `
      <div class="content-header">
        <h1 class="content-title">Settings</h1>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="form-group">
          <label class="form-label">Theme</label>
          <div class="flex gap-3">
            <button id="theme-light" class="btn ${!document.body.classList.contains('dark-mode') ? 'btn-primary' : 'btn-secondary'}">Light</button>
            <button id="theme-dark" class="btn ${document.body.classList.contains('dark-mode') ? 'btn-primary' : 'btn-secondary'}">Dark</button>
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('theme-light')?.addEventListener('click', () => {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
      renderSettingsPage(); // Re-render to update button states
    });
    
    document.getElementById('theme-dark')?.addEventListener('click', () => {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
      renderSettingsPage(); // Re-render to update button states
    });
  };
  
  const renderAccountPage = () => {
    mainContent.innerHTML = `
      <div class="content-header">
        <h1 class="content-title">Account</h1>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <div class="text-gray-500 mb-4">Manage your account settings.</div>
        <button id="logout-btn" class="btn btn-danger">Logout</button>
      </div>
    `;
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        import('./auth.js').then(module => {
          const Auth = module.default;
          Auth.handleLogout();
        });
      });
    }
  };
  
  // Initialize theme from localStorage
  const initTheme = () => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };
  
  // Public API
  return {
    init,
    setActiveNav,
    renderSidebar,
    renderFeedsPanel,
    renderNewsfeedPage,
    renderFeedPostsPage,
    renderSavedPage,
    renderSearchPage,
    renderCreateFeedPage,
    renderNotificationsPage,
    renderSupportPage,
    renderSettingsPage,
    renderAccountPage,
    showNotification,
    initTheme
  };
})();

export default UI; 