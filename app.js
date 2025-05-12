// API Configuration
const API_BASE_URL = 'http://localhost:8080/v1';

// State management
let currentUser = null;
let apiKey = localStorage.getItem('apiKey');
let feedFollows = [];
let feedsPanelExpanded = localStorage.getItem('feedsPanelExpanded') !== 'false'; // Default to expanded
let sidebarExpanded = window.innerWidth >= 768; // Default collapsed on mobile

// DOM Elements
const mainContent = document.getElementById('main-content');
const feedsPanelList = document.getElementById('feeds-panel-list');
const feedsPanel = document.getElementById('feeds-panel');
const toggleFeedsPanelBtn = document.getElementById('toggle-feeds-panel');
const sidebar = document.getElementById('sidebar');
const toggleSidebarBtn = document.getElementById('toggle-sidebar');
const contentArea = document.querySelector('.content-area');

// Panel toggle handlers
if (toggleFeedsPanelBtn) {
    toggleFeedsPanelBtn.addEventListener('click', () => {
        console.log('Toggle feeds panel clicked');
        toggleFeedsPanel();
    });
} else {
    console.log('Toggle feeds panel button not found');
}

if (toggleSidebarBtn) {
    toggleSidebarBtn.addEventListener('click', toggleSidebar);
} else {
    console.log('Toggle sidebar button not found');
}

function toggleFeedsPanel() {
    feedsPanelExpanded = !feedsPanelExpanded;
    console.log('Feeds panel expanded:', feedsPanelExpanded);
    updateFeedsPanelVisibility();
    
    // Force re-render the current page to adjust grid sizing
    if (activeNav === 'nav-your-feeds') {
        renderNewsfeedPage();
    } else if (selectedFeedId) {
        renderFeedPostsPage(selectedFeedId);
    }
}

function updateFeedsPanelVisibility() {
    console.log('Updating feeds panel visibility, expanded:', feedsPanelExpanded);
    
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
        const showButton = document.createElement('button');
        showButton.id = 'show-feeds-btn';
        showButton.className = 'fixed top-20 left-0 bg-green-500 hover:bg-green-600 text-white p-2 rounded-r-lg shadow-md z-40';
        showButton.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
        showButton.addEventListener('click', () => {
            console.log('Show feeds button clicked');
            toggleFeedsPanel();
        });
        document.body.appendChild(showButton);
    }
    
    localStorage.setItem('feedsPanelExpanded', feedsPanelExpanded);
    
    // Fix for void space - ensure content reflows
    if (contentArea) {
        contentArea.style.display = 'flex';
        contentArea.style.flex = '1';
    }
}

function toggleSidebar() {
    sidebarExpanded = !sidebarExpanded;
    updateSidebarVisibility();
}

function updateSidebarVisibility() {
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
            const menuBtn = document.createElement('button');
            menuBtn.id = 'mobile-menu-btn';
            menuBtn.className = 'fixed top-4 left-4 bg-green-600 text-white p-2 rounded-full shadow-lg z-10';
            menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
            menuBtn.addEventListener('click', toggleSidebar);
            document.body.appendChild(menuBtn);
        }
    }
}

// Initialize panels when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing panels');
    initializePanels();
});

// Make sure the panels are set up correctly after all scripts load
window.addEventListener('load', () => {
    console.log('Window loaded, checking panels state');
    // Short delay to ensure DOM is fully processed
    setTimeout(() => {
        if (feedsPanel) {
            updateFeedsPanelVisibility();
        } else {
            console.log('Feeds panel element not found');
        }
    }, 100);
});

// Debug API key on page load
console.log('API Key on load:', apiKey ? 'Found in localStorage' : 'Not found in localStorage');

// --- Sidebar Navigation ---
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
let activeNav = 'nav-your-feeds';
let selectedFeedId = null;

function renderSidebar() {
    const sidebar = document.querySelector('aside');
    if (!sidebar) return;
    sidebar.querySelectorAll('button').forEach(btn => btn.classList.remove('bg-white/20', 'bg-white/10', 'text-green-900'));
    navItems.forEach(item => {
        const btn = document.getElementById(item.id);
        if (btn) {
            if (activeNav === item.id) {
                btn.classList.add('bg-white/20', 'text-green-900');
            } else {
                btn.classList.remove('bg-white/20', 'text-green-900');
            }
        }
    });
}

Object.entries({
    'nav-your-feeds': () => { activeNav = 'nav-your-feeds'; selectedFeedId = null; renderSidebar(); renderNewsfeedPage(); },
    'nav-saved': () => { activeNav = 'nav-saved'; selectedFeedId = null; renderSidebar(); renderSavedPage(); },
    'nav-search': () => { activeNav = 'nav-search'; selectedFeedId = null; renderSidebar(); renderSearchPage(); },
    'nav-create-feed': () => { activeNav = 'nav-create-feed'; selectedFeedId = null; renderSidebar(); renderCreateFeedPage(); },
    'nav-notifications': () => { activeNav = 'nav-notifications'; selectedFeedId = null; renderSidebar(); renderNotificationsPage(); },
    'nav-support': () => { activeNav = 'nav-support'; selectedFeedId = null; renderSidebar(); renderSupportPage(); },
    'nav-settings': () => { activeNav = 'nav-settings'; selectedFeedId = null; renderSidebar(); renderSettingsPage(); },
    'nav-account': () => { activeNav = 'nav-account'; selectedFeedId = null; renderSidebar(); renderAccountPage(); },
}).forEach(([id, handler]) => {
    const btn = document.getElementById(id);
    if (btn) btn.onclick = handler;
});

// Login Modal
function showLoginModal() {
    if (document.getElementById('login-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'login-modal';
    modal.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-8 w-96">
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
}

function switchLoginTab(tab) {
    const tabContent = document.getElementById('login-tab-content');
    const tabNew = document.getElementById('tab-new-user');
    const tabApi = document.getElementById('tab-api-key');
    if (tab === 'new') {
        tabNew.classList.add('border-green-600', 'text-black');
        tabNew.classList.remove('text-gray-500');
        tabApi.classList.remove('border-green-600', 'text-black');
        tabApi.classList.add('text-gray-500');
        tabContent.innerHTML = `
            <form id="login-form">
                <label class="block mb-2 text-gray-700 font-medium">Username</label>
                <input id="login-username" class="w-full border px-3 py-2 rounded mb-4" type="text" required />
                <button class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 font-semibold" type="submit">Create New User</button>
            </form>
            <div class="text-xs text-gray-500 mt-2">This will create a new user and give you a new API key.</div>
        `;
        document.getElementById('login-form').onsubmit = handleCreateUser;
    } else {
        tabApi.classList.add('border-green-600', 'text-black');
        tabApi.classList.remove('text-gray-500');
        tabNew.classList.remove('border-green-600', 'text-black');
        tabNew.classList.add('text-gray-500');
        tabContent.innerHTML = `
            <form id="api-key-form">
                <label class="block mb-2 text-gray-700 font-medium">API Key</label>
                <input id="api-key-input" class="w-full border px-3 py-2 rounded mb-4" type="text" required />
                <button class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 font-semibold" type="submit">Login with API Key</button>
            </form>
            <div class="text-xs text-gray-500 mt-2">Paste your API key to log in as an existing user.</div>
        `;
        document.getElementById('api-key-form').onsubmit = handleApiKeyLogin;
    }
}

function hideLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) modal.remove();
}

// Show API Key Modal after signup
function showApiKeyModal(apiKey) {
    if (document.getElementById('api-key-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'api-key-modal';
    modal.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-8 w-96 text-center">
            <h2 class="text-2xl font-bold mb-4 text-green-700">Your API Key</h2>
            <div class="mb-4">
                <input id="api-key-display" class="w-full border px-3 py-2 rounded text-center font-mono text-green-700 bg-gray-100" value="${apiKey}" readonly />
            </div>
            <button id="copy-api-key" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold mb-2">Copy API Key</button>
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
    };
}

// SPA Page Renderers
function renderNewsfeedPage() {
    const columnsClass = getGridColumnsClass();
    mainContent.innerHTML = `
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-bold">Newsfeed</h1>
            <div class="text-sm text-gray-500 hidden md:block">
                ${feedsPanelExpanded ? 
                    '<span><i class="fa-solid fa-eye-slash mr-1"></i>Hide feeds panel to see more posts</span>' : 
                    '<span><i class="fa-solid fa-eye mr-1"></i>Show feeds panel</span>'}
            </div>
        </div>
        <div id="posts-grid" class="grid ${columnsClass} gap-6"></div>
    `;
    loadPosts();
}

function renderSavedPage() {
    mainContent.innerHTML = `
        <h1 class="text-3xl font-bold mb-8">Saved</h1>
        <div class="text-gray-500">Your saved posts will appear here.</div>
    `;
}

function renderSearchPage() {
    mainContent.innerHTML = `
        <h1 class="text-3xl font-bold mb-8">Search</h1>
        <div class="mb-4">
            <input id="search-input" type="text" placeholder="Search feeds or posts..." class="w-full px-4 py-2 border rounded focus:outline-none">
        </div>
        <div id="search-results" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"></div>
    `;
    // Search functionality can be implemented here
}

function renderCreateFeedPage() {
    mainContent.innerHTML = `
        <h1 class="text-3xl font-bold mb-8">Create Feed</h1>
        <form id="addFeedForm" class="max-w-lg space-y-4">
            <div>
                <label class="block text-gray-700 text-sm font-bold mb-2" for="feedName">Feed Name</label>
                <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="feedName" type="text" required>
            </div>
            <div>
                <label class="block text-gray-700 text-sm font-bold mb-2" for="feedUrl">Feed URL</label>
                <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="feedUrl" type="url" required>
            </div>
            <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">Add Feed</button>
        </form>
        <div id="create-feed-message" class="mt-4"></div>
    `;
    document.getElementById('addFeedForm').addEventListener('submit', handleAddFeed);
}

function renderNotificationsPage() {
    mainContent.innerHTML = `<h1 class="text-3xl font-bold mb-8">Notifications</h1><div class="text-gray-500">No notifications yet.</div>`;
}
function renderSupportPage() {
    mainContent.innerHTML = `<h1 class="text-3xl font-bold mb-8">Support</h1><div class="text-gray-500">Contact support@example.com for help.</div>`;
}
function renderSettingsPage() {
    mainContent.innerHTML = `<h1 class="text-3xl font-bold mb-8">Settings</h1><div class="text-gray-500">Settings page coming soon.</div>`;
}
function renderAccountPage() {
    mainContent.innerHTML = `<h1 class="text-3xl font-bold mb-8">Account</h1>
        <div class="text-gray-500 mb-4">Account details will appear here.</div>
        <button id="logout-btn" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</button>
    `;
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.onclick = handleLogout;
}

// --- Feeds Panel ---
async function renderFeedsPanel() {
    feedsPanelList.innerHTML = `
        <button class="w-full flex items-center gap-2 px-3 py-2 rounded-lg ${activeNav === 'nav-your-feeds' ? 'bg-green-100 font-semibold text-green-800' : 'bg-gray-100'} mb-2" id="feeds-newsfeed">
            <i class="fa-regular fa-rectangle-list"></i> All Feeds <span class="ml-auto bg-gray-200 text-xs px-2 py-0.5 rounded" id="feeds-count">0</span>
        </button>
        <div id="feeds-list" class="mt-2">
            <div class='text-gray-400'>Loading feeds...</div>
        </div>
    `;
    document.getElementById('feeds-newsfeed').onclick = () => {
        selectedFeedId = null;
        activeNav = 'nav-your-feeds';
        renderSidebar();
        renderNewsfeedPage();
        highlightSelectedFeed();
    };

    // Verify API key is available before making requests
    if (!apiKey) {
        document.getElementById('feeds-list').innerHTML = `
            <div class='text-red-500 mb-2'>No API key found! Please log in.</div>
            <button id="show-login-btn" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Log In
            </button>
        `;
        document.getElementById('show-login-btn').onclick = showLoginModal;
        return;
    }

    let feeds = [];
    try {
        console.log("Fetching feeds with API key:", apiKey);
        const feedsResponse = await fetch(`${API_BASE_URL}/feeds`, { 
            headers: { 'Authorization': `ApiKey ${apiKey}` }
        });
        
        if (!feedsResponse.ok) {
            const error = await feedsResponse.text();
            console.error("Feeds fetch error:", feedsResponse.status, error);
            document.getElementById('feeds-list').innerHTML = `
                <div class='text-red-500'>Error loading feeds: ${feedsResponse.status} ${error}</div>
            `;
            return;
        }
        
        feeds = await feedsResponse.json();
        console.log("Feeds fetched:", feeds);

        // Fetch feed follows
        const followsResponse = await fetch(`${API_BASE_URL}/feed_follows`, { 
            headers: { 'Authorization': `ApiKey ${apiKey}` }
        });
        
        if (!followsResponse.ok) {
            const error = await followsResponse.text();
            console.error("Feed follows fetch error:", followsResponse.status, error);
            document.getElementById('feeds-list').innerHTML = `
                <div class='text-red-500'>Error loading follows: ${followsResponse.status} ${error}</div>
            `;
            return;
        }
        
        feedFollows = await followsResponse.json();
        console.log("Feed follows fetched:", feedFollows);
        
        // Update the feeds count
        const feedsCountElement = document.getElementById('feeds-count');
        if (feedsCountElement) {
            feedsCountElement.textContent = feedFollows.length.toString();
        }
    } catch (error) {
        console.error("Network error:", error);
        document.getElementById('feeds-list').innerHTML = `
            <div class='text-red-500'>Network error: ${error.message}</div>
        `;
        return;
    }

    const feedsList = document.getElementById('feeds-list');
    
    // First show followed feeds in their own section
    const followedFeeds = feeds.filter(feed => 
        feedFollows.some(follow => follow.feed_id === feed.id)
    );
    
    const unfollowedFeeds = feeds.filter(feed => 
        !feedFollows.some(follow => follow.feed_id === feed.id)
    );
    
    let feedsHtml = '';
    
    // Followed feeds section
    if (followedFeeds.length > 0) {
        feedsHtml += `<div class="mb-2 px-2 text-xs text-gray-500 uppercase font-semibold">Followed Feeds</div>`;
        feedsHtml += followedFeeds.map(feed => {
            const followed = feedFollows.find(f => f.feed_id === feed.id);
            const isSelected = selectedFeedId === feed.id;
            return `
                <div class="flex items-center justify-between group px-2 py-1 rounded ${isSelected ? 'bg-green-100' : 'hover:bg-gray-100'}">
                    <button class="flex-1 flex items-center gap-2 text-left feed-select-btn ${isSelected ? 'font-bold text-green-700' : ''}" data-feed-id="${feed.id}">
                        <i class="fa-solid fa-angle-right"></i> ${feed.name}
                    </button>
                    <button class="ml-2 text-xs px-2 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 follow-btn" 
                        data-feed-id="${feed.id}" 
                        data-follow-id="${followed ? followed.id : ''}"
                        data-action="unfollow"
                    >
                        Unfollow
                    </button>
                </div>
            `;
        }).join('');
    }
    
    // Other available feeds section
    if (unfollowedFeeds.length > 0) {
        feedsHtml += `<div class="mt-4 mb-2 px-2 text-xs text-gray-500 uppercase font-semibold">Available Feeds</div>`;
        feedsHtml += unfollowedFeeds.map(feed => {
            const isSelected = selectedFeedId === feed.id;
            return `
                <div class="flex items-center justify-between group px-2 py-1 rounded ${isSelected ? 'bg-green-100' : 'hover:bg-gray-100'}">
                    <button class="flex-1 flex items-center gap-2 text-left feed-select-btn ${isSelected ? 'font-bold text-green-700' : ''}" data-feed-id="${feed.id}">
                        <i class="fa-solid fa-angle-right"></i> ${feed.name}
                    </button>
                    <button class="ml-2 text-xs px-2 py-1 rounded bg-green-100 text-green-600 hover:bg-green-200 follow-btn" 
                        data-feed-id="${feed.id}" 
                        data-follow-id=""
                        data-action="follow"
                    >
                        Follow
                    </button>
                </div>
            `;
        }).join('');
    }
    
    // If no feeds at all
    if (feeds.length === 0) {
        feedsHtml = `<div class='text-gray-400'>No feeds found.</div>`;
    }
    
    feedsList.innerHTML = feedsHtml;
    
    feedsList.querySelectorAll('.follow-btn').forEach(btn => {
        btn.onclick = async (e) => {
            e.preventDefault();
            e.stopPropagation();  // Prevent triggering the parent feed selection
            const feedId = btn.getAttribute('data-feed-id');
            const followId = btn.getAttribute('data-follow-id');
            const action = btn.getAttribute('data-action');
            
            // Disable button while in progress
            btn.disabled = true;
            btn.innerHTML = `<span class="inline-block animate-pulse">Processing...</span>`;
            
            let success = false;
            if (action === 'follow') {
                success = await followFeed(feedId);
            } else {
                success = await unfollowFeed(followId);
            }
            
            if (success) {
                // Re-render the feeds panel and content only on success
                await renderFeedsPanel();
                if (selectedFeedId) {
                    renderFeedPostsPage(selectedFeedId);
                } else {
                    renderNewsfeedPage();
                }
            } else {
                // Re-enable the button if failed
                btn.disabled = false;
                btn.textContent = (action === 'follow') ? 'Follow' : 'Unfollow';
            }
        };
    });
    
    feedsList.querySelectorAll('.feed-select-btn').forEach(btn => {
        btn.onclick = (e) => {
            selectedFeedId = btn.getAttribute('data-feed-id');
            activeNav = null;
            renderSidebar();
            renderFeedPostsPage(selectedFeedId);
            highlightSelectedFeed();
        };
    });
    
    highlightSelectedFeed();
}

function highlightSelectedFeed() {
    document.querySelectorAll('.feed-select-btn').forEach(btn => {
        if (btn.getAttribute('data-feed-id') === selectedFeedId) {
            btn.classList.add('font-bold', 'text-green-700');
            btn.parentElement.classList.add('bg-green-100');
        } else {
            btn.classList.remove('font-bold', 'text-green-700');
            btn.parentElement.classList.remove('bg-green-100');
        }
    });
}

// --- Main Content Area ---
function renderFeedPostsPage(feedId) {
    const columnsClass = getGridColumnsClass();
    mainContent.innerHTML = `
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-bold">Feed Posts</h1>
            <div class="text-sm text-gray-500 hidden md:block">
                ${feedsPanelExpanded ? 
                    '<span><i class="fa-solid fa-eye-slash mr-1"></i>Hide feeds panel to see more posts</span>' : 
                    '<span><i class="fa-solid fa-eye mr-1"></i>Show feeds panel</span>'}
            </div>
        </div>
        <div id="posts-grid" class="grid ${columnsClass} gap-6"></div>
    `;
    loadFeedPosts(feedId);
}

// Helper to get appropriate grid columns class based on screen size and panel state
function getGridColumnsClass() {
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
}

// --- Load Posts (Newsfeed or Feed-specific) ---
async function loadPosts() {
    const postsGrid = document.getElementById('posts-grid');
    if (!postsGrid) return;
    
    if (!apiKey) {
        postsGrid.innerHTML = `
            <div class="col-span-full text-center p-8">
                <div class="text-red-500 mb-4">Please log in to view posts</div>
                <button id="login-btn-posts" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Log In
                </button>
            </div>
        `;
        document.getElementById('login-btn-posts')?.addEventListener('click', showLoginModal);
        return;
    }
    
    postsGrid.innerHTML = '<div class="text-gray-400 col-span-full text-center">Loading posts...</div>';
    
    try {
        console.log("Fetching posts with API key:", apiKey);
        const response = await fetch(`${API_BASE_URL}/posts`, {
            headers: { 'Authorization': `ApiKey ${apiKey}` }
        });
        
        if (!response.ok) {
            const error = await response.text();
            console.error("Posts fetch error:", response.status, error);
            postsGrid.innerHTML = `
                <div class="text-red-500 col-span-full">Error loading posts: ${response.status} ${error}</div>
            `;
            return;
        }
        
        const posts = await response.json();
        console.log("Posts fetched:", posts);
        displayPosts(posts);
    } catch (error) {
        console.error("Network error:", error);
        postsGrid.innerHTML = `<div class="text-red-500 col-span-full">Network error: ${error.message}</div>`;
    }
}

async function loadFeedPosts(feedId) {
    const postsGrid = document.getElementById('posts-grid');
    if (!postsGrid) return;
    
    if (!apiKey) {
        postsGrid.innerHTML = `
            <div class="col-span-full text-center p-8">
                <div class="text-red-500 mb-4">Please log in to view posts</div>
                <button id="login-btn-posts" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Log In
                </button>
            </div>
        `;
        document.getElementById('login-btn-posts')?.addEventListener('click', showLoginModal);
        return;
    }
    
    // Find the feed name to display in the header
    let feedName = "Feed Posts";
    const feeds = document.querySelectorAll('.feed-select-btn');
    feeds.forEach(feed => {
        if (feed.getAttribute('data-feed-id') === feedId) {
            feedName = feed.textContent.trim();
        }
    });
    
    // Update the header
    const headerElement = document.querySelector('#main-content h1');
    if (headerElement) {
        headerElement.textContent = feedName;
    }
    
    postsGrid.innerHTML = '<div class="text-gray-400 col-span-full text-center">Loading posts for this feed...</div>';
    
    try {
        // First fetch all posts
        const response = await fetch(`${API_BASE_URL}/posts`, {
            headers: { 'Authorization': `ApiKey ${apiKey}` }
        });
        
        if (!response.ok) {
            const error = await response.text();
            console.error("Feed posts fetch error:", response.status, error);
            postsGrid.innerHTML = `
                <div class="text-red-500 col-span-full">Error loading feed posts: ${response.status} ${error}</div>
            `;
            return;
        }
        
        const allPosts = await response.json();
        console.log("All posts fetched:", allPosts.length);
        
        // Filter posts for this specific feed
        const feedPosts = allPosts.filter(post => post.feed_id === feedId);
        console.log(`Filtered to ${feedPosts.length} posts for feed ${feedId}`);
        
        displayPosts(feedPosts);
    } catch (error) {
        console.error("Network error:", error);
        postsGrid.innerHTML = `<div class="text-red-500 col-span-full">Network error: ${error.message}</div>`;
    }
}

function displayPosts(posts) {
    const postsGrid = document.getElementById('posts-grid');
    if (!postsGrid) return;
    
    if (!posts || posts.length === 0) {
        postsGrid.innerHTML = `
            <div class="col-span-full text-center p-8">
                <div class="text-gray-400 mb-4">No posts found.</div>
                <p class="text-gray-500">Try following some feeds to see posts!</p>
            </div>
        `;
        return;
    }

    console.log("Posts", posts)
    
    postsGrid.innerHTML = posts.map(post => {
        // Extract title - use title field or first line of description or fallback
        const title = post.title;
        console.log(title);
        
        // Create a shortened description (if exists)
        let description = post.description;
        // if (post.description) {
        //     // Remove the first line if it's being used as title
        //     const descLines = post.description.split('\n');
        //     const descContent = post.title ? descLines.join('\n') : descLines.slice(1).join('\n');
            
        //     // Truncate to ~150 characters
        //     description = descContent.length > 150 ? descContent.substring(0, 150) + '...' : descContent;
        // }
        
        // Format date for display
        const publishDate = new Date(post.published_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        return `
            <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100 flex flex-col h-full">
                <div class="p-6 flex-1 flex flex-col">
                    <div class="flex justify-between items-start mb-3">
                        <h3 class="font-bold text-lg text-gray-800 flex-1">${title}</h3>
                        <button class="text-gray-400 hover:text-green-600 save-post-btn ml-2 flex-shrink-0" data-post-id="${post.id}">
                            <i class="fa-regular fa-bookmark"></i>
                        </button>
                    </div>
                    
                    <div class="text-gray-600 mb-4 text-sm line-clamp-3">${description || 'No description available.'}</div>
                    
                    <div class="mt-auto pt-4 border-t border-gray-100">
                        <div class="flex justify-between items-center">
                            <a href="${post.url}" target="_blank" class="text-green-600 hover:text-green-700 font-medium flex items-center group">
                                Read More
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </a>
                            <span class="text-xs text-gray-500">${publishDate}</span>
                        </div>
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
            
            // TODO: Implement localStorage saving in next step
        });
    });
}

// API Functions
async function handleAddFeed(e) {
    e.preventDefault();
    const name = document.getElementById('feedName').value;
    const url = document.getElementById('feedUrl').value;
    try {
        const response = await fetch(`${API_BASE_URL}/feeds`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `ApiKey ${apiKey}`,
            },
            body: JSON.stringify({ name, url }),
        });
        if (!response.ok) throw new Error('Failed to add feed');
        document.getElementById('feedName').value = '';
        document.getElementById('feedUrl').value = '';
        document.getElementById('create-feed-message').textContent = 'Feed added successfully!';
        renderFeedsPanel();
    } catch (error) {
        document.getElementById('create-feed-message').textContent = 'Failed to add feed.';
    }
}

async function followFeed(feedId) {
    if (!apiKey) {
        alert('Please log in to follow feeds');
        showLoginModal();
        return false;
    }
    
    try {
        console.log("Following feed:", feedId, "with API key:", apiKey);
        const res = await fetch(`${API_BASE_URL}/feed_follows`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `ApiKey ${apiKey}`,
            },
            body: JSON.stringify({ feed_id: feedId }),
        });
        
        if (!res.ok) {
            let errorText = '';
            try {
                const errorData = await res.json();
                errorText = JSON.stringify(errorData);
            } catch {
                errorText = await res.text();
            }
            
            console.error("Follow feed error:", res.status, errorText);
            alert(`Failed to follow feed: ${res.status} ${errorText}`);
            return false;
        }
        
        const data = await res.json();
        console.log("Follow response:", data);
        return true;
    } catch (err) {
        console.error("Network error:", err);
        alert(`Network error: ${err.message}`);
        return false;
    }
}

async function unfollowFeed(followId) {
    if (!apiKey) {
        alert('Please log in to unfollow feeds');
        showLoginModal();
        return false;
    }
    
    try {
        console.log("Unfollowing feed:", followId, "with API key:", apiKey);
        const res = await fetch(`${API_BASE_URL}/feed_follows/${followId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `ApiKey ${apiKey}`,
            },
        });
        
        if (!res.ok) {
            let errorText = '';
            try {
                const errorData = await res.json();
                errorText = JSON.stringify(errorData);
            } catch {
                errorText = await res.text();
            }
            
            console.error("Unfollow feed error:", res.status, errorText);
            alert(`Failed to unfollow feed: ${res.status} ${errorText}`);
            return false;
        }
        
        console.log("Unfollow successful");
        return true;
    } catch (err) {
        console.error("Network error:", err);
        alert(`Network error: ${err.message}`);
        return false;
    }
}

// Login/Logout Logic
async function handleCreateUser(e) {
    e.preventDefault();
    const name = document.getElementById('login-username').value;
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });
        if (!response.ok) throw new Error('Login failed');
        const data = await response.json();
        apiKey = data.api_key;
        localStorage.setItem('apiKey', apiKey);
        hideLoginModal();
        showApiKeyModal(apiKey);
        renderFeedsPanel();
        renderNewsfeedPage();
    } catch {
        alert('Login failed. Try again.');
    }
}

function handleApiKeyLogin(e) {
    e.preventDefault();
    const key = document.getElementById('api-key-input').value.trim();
    if (key) {
        apiKey = key;
        localStorage.setItem('apiKey', apiKey);
        hideLoginModal();
        renderFeedsPanel();
        renderNewsfeedPage();
    } else {
        alert('Please enter a valid API key.');
    }
}

function handleLogout() {
    apiKey = null;
    localStorage.removeItem('apiKey');
    showLoginModal();
}

// Add back the initializePanels function that was removed
function initializePanels() {
    console.log('Initializing panels');
    
    // Set up feeds panel initial state
    updateFeedsPanelVisibility();
    
    // Handle sidebar responsiveness
    if (window.innerWidth < 768) {
        sidebarExpanded = false;
        updateSidebarVisibility();
    }
    
    // Add window resize handler
    window.addEventListener('resize', () => {
        if (window.innerWidth < 768) {
            if (sidebarExpanded) {
                // Keep overlay when resizing while sidebar is open
                if (!document.getElementById('sidebar-overlay')) {
                    updateSidebarVisibility();
                }
            } else {
                // Make sure mobile menu button is showing
                if (!document.getElementById('mobile-menu-btn')) {
                    const menuBtn = document.createElement('button');
                    menuBtn.id = 'mobile-menu-btn';
                    menuBtn.className = 'fixed top-4 left-4 bg-green-600 text-white p-2 rounded-full shadow-lg z-40';
                    menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
                    menuBtn.addEventListener('click', toggleSidebar);
                    document.body.appendChild(menuBtn);
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
    });
}

// Initial Render
initializePanels();
if (!apiKey) {
    showLoginModal();
} else {
    renderFeedsPanel();
    renderNewsfeedPage();
}

// Fix to ensure layout is correct on window resize
window.addEventListener('resize', () => {
    if (feedsPanel) {
        // Make sure panel has correct classes
        if (feedsPanelExpanded) {
            feedsPanel.classList.add('feeds-panel-expanded');
            feedsPanel.classList.remove('feeds-panel-collapsed');
        } else {
            feedsPanel.classList.remove('feeds-panel-expanded');
            feedsPanel.classList.add('feeds-panel-collapsed');
        }
    }
    
    // Adjust content grid columns
    if (activeNav === 'nav-your-feeds') {
        renderNewsfeedPage();
    } else if (selectedFeedId) {
        renderFeedPostsPage(selectedFeedId);
    }
}); 