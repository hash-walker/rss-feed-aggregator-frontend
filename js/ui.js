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
    notification.className = `notification ${type}`;
    
    // Set notification title based on type
    let title = 'Information';
    let icon = 'fa-solid fa-info-circle';
    
    if (type === 'error') {
      title = 'Error';
      icon = 'fa-solid fa-circle-exclamation';
    } else if (type === 'success') {
      title = 'Success';
      icon = 'fa-solid fa-circle-check';
    }
    
    notification.innerHTML = `
      <div class="notification-icon">
        <i class="${icon}"></i>
      </div>
      <div class="notification-content">
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
      </div>
      <button class="notification-close">
        <i class="fa-solid fa-times"></i>
      </button>
    `;
    
    // Add close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
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
    
    feedsPanelList.innerHTML = `<div class="flex justify-center p-4"><i class="spinner"></i></div>`;
    
    // Check if user is authenticated
    if (!API.isAuthenticated()) {
      feedsPanelList.innerHTML = `
        <div class="p-4">
          <div class="text-red-500 mb-4">Log in to view your feeds</div>
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
    
    // Create "All Feeds" button as its own category
    let html = `
      <div class="feeds-category">
        <button class="feed-item ${activeNav === 'nav-your-feeds' ? 'active' : ''}" id="feeds-newsfeed">
          <span class="feed-item-name">
            <i class="fa-solid fa-layer-group"></i> All Items
          </span>
          <span class="bg-gray-200 text-xs px-2 py-0.5 rounded-full text-gray-700" id="feeds-count">${followedFeeds.length}</span>
        </button>
      </div>
    `;
    
    // Followed feeds section
    if (followedFeeds.length > 0) {
      html += `<div class="feeds-category">
        <h3 class="feeds-category-title">My Feeds</h3>`;
      
      html += followedFeeds.map(feed => {
        const isSelected = selectedFeedId === feed.id;
        return `
          <div class="feed-item ${isSelected ? 'active' : ''}">
            <button class="feed-item-name feed-select-btn" data-feed-id="${feed.id}">
              <i class="fa-solid fa-rss"></i> ${feed.name}
            </button>
            <button class="feed-button unfollow-btn" 
              data-feed-id="${feed.id}" 
              data-follow-id="${feed.followId || ''}"
              data-action="unfollow"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        `;
      }).join('');
      
      html += `</div>`;
    }
    
    // Available feeds section
    if (availableFeeds.length > 0) {
      html += `<div class="feeds-category">
        <h3 class="feeds-category-title">Discover</h3>`;
      
      html += availableFeeds.map(feed => {
        const isSelected = selectedFeedId === feed.id;
        return `
          <div class="feed-item ${isSelected ? 'active' : ''}">
            <button class="feed-item-name feed-select-btn" data-feed-id="${feed.id}">
              <i class="fa-solid fa-rss"></i> ${feed.name}
            </button>
            <button class="feed-button follow-btn" 
              data-feed-id="${feed.id}" 
              data-action="follow"
            >
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
        `;
      }).join('');
      
      html += `</div>`;
    }
    
    // If no feeds at all
    if (followedFeeds.length === 0 && availableFeeds.length === 0) {
      html += `
        <div class="text-center p-4">
          <div class="text-gray-400 mb-4">No feeds available</div>
          <button id="feeds-add-btn" class="btn btn-primary">
            <i class="fa-solid fa-plus"></i> Add Content
          </button>
        </div>`;
    }
    
    feedsPanelList.innerHTML = html;
    
    // Add Add Content button handler
    const addFeedsBtn = document.getElementById('feeds-add-btn');
    if (addFeedsBtn) {
      addFeedsBtn.addEventListener('click', () => {
        setActiveNav('nav-create-feed');
      });
    }
    
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
    feedsPanelList.querySelectorAll('.follow-btn, .unfollow-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();  // Prevent triggering the parent feed selection
        
        const feedId = btn.getAttribute('data-feed-id');
        const followId = btn.getAttribute('data-follow-id');
        const action = btn.getAttribute('data-action');
        
        // Disable button while in progress
        btn.disabled = true;
        btn.innerHTML = `<i class="spinner"></i>`;
        
        try {
          if (action === 'follow') {
            await FeedManager.followFeed(feedId);
            showNotification('Feed followed successfully!', 'success');
          } else {
            await FeedManager.unfollowFeed(followId);
            showNotification('Feed unfollowed', 'info');
          }
          
          // Re-render feeds panel and content
          await renderFeedsPanel();
          
          if (FeedManager.getSelectedFeedId()) {
            renderFeedPostsPage(FeedManager.getSelectedFeedId());
          } else {
            renderNewsfeedPage();
          }
        } catch (error) {
          console.error(`Error ${action}ing feed:`, error);
          showNotification(`Failed to ${action} feed`, 'error');
          
          // Re-enable button
          btn.disabled = false;
          btn.innerHTML = action === 'follow' ? '<i class="fa-solid fa-plus"></i>' : '<i class="fa-solid fa-xmark"></i>';
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
        <h1 class="content-title">Today</h1>
        <div class="header-actions">
          <div class="reading-mode-toggle">
            <button class="reading-mode-btn active" id="view-mode-cards">
              <i class="fa-solid fa-grip"></i>
            </button>
            <button class="reading-mode-btn" id="view-mode-list">
              <i class="fa-solid fa-list"></i>
            </button>
          </div>
          <button class="toggle-btn" id="refresh-feed" title="Refresh feeds">
            <i class="fa-solid fa-rotate"></i>
          </button>
          ${feedsPanelExpanded ? 
            `<button class="toggle-btn" id="toggle-feeds" title="Hide feeds panel">
              <i class="fa-solid fa-angles-left"></i>
            </button>` : 
            `<button class="toggle-btn" id="toggle-feeds" title="Show feeds panel">
              <i class="fa-solid fa-angles-right"></i>
            </button>`
          }
        </div>
      </div>
      <div id="posts-grid" class="posts-grid ${columnsClass} ${!feedsPanelExpanded ? 'expanded' : ''}"></div>
    `;
    
    // Add event listeners for the action buttons
    document.getElementById('refresh-feed')?.addEventListener('click', () => {
      loadPosts(); // Reload posts
    });
    
    document.getElementById('toggle-feeds')?.addEventListener('click', toggleFeedsPanel);
    
    // Add view mode toggle functionality
    const viewCards = document.getElementById('view-mode-cards');
    const viewList = document.getElementById('view-mode-list');
    
    if (viewCards && viewList) {
      viewCards.addEventListener('click', () => {
        viewCards.classList.add('active');
        viewList.classList.remove('active');
        document.getElementById('posts-grid')?.classList.remove('list-view');
      });
      
      viewList.addEventListener('click', () => {
        viewList.classList.add('active');
        viewCards.classList.remove('active');
        document.getElementById('posts-grid')?.classList.add('list-view');
      });
    }
    
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
      // Use the empty state template
      const template = document.getElementById('empty-state-template');
      const clone = template.content.cloneNode(true);
      
      // Set up the "Add Content" button
      const addButton = clone.querySelector('.btn-primary');
      if (addButton) {
        addButton.addEventListener('click', () => {
          setActiveNav('nav-create-feed');
        });
      }
      
      postsGrid.innerHTML = '';
      postsGrid.appendChild(clone);
      return;
    }
    
    // Sort posts by date (newest first)
    const sortedPosts = [...posts].sort((a, b) => {
      return new Date(b.published_at) - new Date(a.published_at);
    });
    
    // Get saved posts from localStorage
    const savedPosts = JSON.parse(localStorage.getItem('savedPosts') || '[]');
    
    // Clear the grid
    postsGrid.innerHTML = '';
    
    // Use the template to create each post card
    sortedPosts.forEach(post => {
      // Get the template and clone it
      const template = document.getElementById('post-card-template');
      const postCard = template.content.cloneNode(true);
      
      // Find the feed name
      let feedName = "Unknown Source";
      const feed = FeedManager.getFeedById(post.feed_id);
      if (feed) {
        feedName = feed.name;
      }
      
      // Update template content
      postCard.querySelector('.post-source').textContent = feedName;
      postCard.querySelector('.post-card-title').textContent = post.title || 'No Title';
      postCard.querySelector('.post-card-description').innerHTML = post.description || 'No description available.';
      
      // Format date
      const publishDate = new Date(post.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      postCard.querySelector('.post-card-date').textContent = publishDate;
      
      // Set the read more link
      const linkElement = postCard.querySelector('.post-card-link');
      linkElement.href = post.url;
      
      // Set up the save button
      const saveBtn = postCard.querySelector('.save-post-btn');
      saveBtn.setAttribute('data-post-id', post.id);
      
      // Check if this post is saved
      if (savedPosts.includes(post.id)) {
        saveBtn.classList.add('saved');
        saveBtn.innerHTML = '<i class="fa-solid fa-bookmark"></i>';
      }
      
      // Add event listener to save button
      saveBtn.addEventListener('click', function() {
        const postId = this.getAttribute('data-post-id');
        const savedPosts = JSON.parse(localStorage.getItem('savedPosts') || '[]');
        const postIndex = savedPosts.indexOf(postId);
        
        if (postIndex === -1) {
          // Save the post
          savedPosts.push(postId);
          this.classList.add('saved');
          this.innerHTML = '<i class="fa-solid fa-bookmark"></i>';
          showNotification('Post saved to Read Later', 'success');
        } else {
          // Unsave the post
          savedPosts.splice(postIndex, 1);
          this.classList.remove('saved');
          this.innerHTML = '<i class="fa-regular fa-bookmark"></i>';
          showNotification('Post removed from Read Later', 'info');
        }
        
        localStorage.setItem('savedPosts', JSON.stringify(savedPosts));
      });
      
      // Add the card to the grid
      postsGrid.appendChild(postCard);
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
      <div class="form-container">
        <h2 class="text-xl font-semibold mb-4">Theme Preferences</h2>
        <div class="form-group">
          <label class="form-label mb-3">Color Theme</label>
          <div class="theme-toggle">
            <button id="theme-light" class="theme-btn ${!document.body.classList.contains('dark-mode') ? 'active' : ''}">
              <i class="fa-regular fa-sun mr-2"></i> Light
            </button>
            <button id="theme-dark" class="theme-btn ${document.body.classList.contains('dark-mode') ? 'active' : ''}">
              <i class="fa-regular fa-moon mr-2"></i> Dark
            </button>
          </div>
        </div>
        
        <h2 class="text-xl font-semibold mb-4 mt-8">Reading Preferences</h2>
        <div class="form-group">
          <label class="form-label mb-3">Default View</label>
          <div class="reading-mode-toggle">
            <button id="view-cards" class="reading-mode-btn active">
              <i class="fa-solid fa-grip"></i> Cards
            </button>
            <button id="view-list" class="reading-mode-btn">
              <i class="fa-solid fa-list"></i> List
            </button>
            <button id="view-magazine" class="reading-mode-btn">
              <i class="fa-regular fa-newspaper"></i> Magazine
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Theme toggling
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
    
    // Reading mode buttons (just UI for now, functionality can be added later)
    const viewButtons = document.querySelectorAll('.reading-mode-btn');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active class from all buttons
        viewButtons.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
      });
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