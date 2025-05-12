/**
 * Feed Manager Module for RSS Feed Aggregator
 * Handles operations related to feeds and feed follows
 */

import API from './api.js';
import UI from './ui.js';

const FeedManager = (() => {
  // Cache for feeds and feed follows
  let feeds = [];
  let feedFollows = [];
  let selectedFeedId = null;
  
  // Initialize feed manager
  const init = async () => {
    if (API.isAuthenticated()) {
      await loadFeedsAndFollows();
    }
  };
  
  // Load feeds and follows from API
  const loadFeedsAndFollows = async () => {
    try {
      // Load feeds and feed follows in parallel
      const [feedsData, followsData] = await Promise.all([
        API.getFeeds(),
        API.getFeedFollows()
      ]);
      
      feeds = feedsData || [];
      feedFollows = followsData || [];
      
      return true;
    } catch (error) {
      console.error('Error loading feeds and follows:', error);
      return false;
    }
  };
  
  // Get feeds with follow status
  const getFeedsWithFollowStatus = () => {
    return feeds.map(feed => {
      const followData = feedFollows.find(follow => follow.feed_id === feed.id);
      return {
        ...feed,
        isFollowed: !!followData,
        followId: followData ? followData.id : null
      };
    });
  };
  
  // Get followed feeds
  const getFollowedFeeds = () => {
    return feeds.filter(feed => 
      feedFollows.some(follow => follow.feed_id === feed.id)
    );
  };
  
  // Get available feeds (not followed)
  const getAvailableFeeds = () => {
    return feeds.filter(feed => 
      !feedFollows.some(follow => follow.feed_id === feed.id)
    );
  };
  
  // Select a feed
  const selectFeed = (feedId) => {
    selectedFeedId = feedId;
    return selectedFeedId;
  };
  
  // Get selected feed ID
  const getSelectedFeedId = () => selectedFeedId;
  
  // Get feed by ID
  const getFeedById = (feedId) => {
    return feeds.find(feed => feed.id === feedId);
  };
  
  // Create a new feed
  const createFeed = async (name, url) => {
    try {
      const newFeed = await API.createFeed(name, url);
      
      // Reload feeds to get the latest data
      await loadFeedsAndFollows();
      
      return newFeed;
    } catch (error) {
      console.error('Error creating feed:', error);
      throw error;
    }
  };
  
  // Follow a feed
  const followFeed = async (feedId) => {
    try {
      const follow = await API.followFeed(feedId);
      
      // Update local cache
      feedFollows.push(follow);
      
      return follow;
    } catch (error) {
      console.error('Error following feed:', error);
      throw error;
    }
  };
  
  // Unfollow a feed
  const unfollowFeed = async (followId) => {
    try {
      await API.unfollowFeed(followId);
      
      // Update local cache
      feedFollows = feedFollows.filter(follow => follow.id !== followId);
      
      return true;
    } catch (error) {
      console.error('Error unfollowing feed:', error);
      throw error;
    }
  };
  
  // Public methods
  return {
    init,
    loadFeedsAndFollows,
    getFeedsWithFollowStatus,
    getFollowedFeeds,
    getAvailableFeeds,
    selectFeed,
    getSelectedFeedId,
    getFeedById,
    createFeed,
    followFeed,
    unfollowFeed
  };
})();

export default FeedManager; 