# RSS Feed Aggregator Frontend

A modern, responsive web application that aggregates and displays RSS feeds from various sources, providing users with a centralized platform to view and manage their content subscriptions.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Integration](#api-integration)
- [Contributing](#contributing)
- [License](#license)

## Overview

This RSS Feed Aggregator Frontend is designed to work with a backend API to fetch, display, and manage RSS feeds. The application allows users to add new RSS feeds, view aggregated content from multiple sources, and customize their reading experience.

## Features

- **User Authentication**: Secure login and registration system
- **Feed Management**: Add, remove, and categorize RSS feeds
- **Content Aggregation**: View combined content from all subscribed feeds
- **Responsive Design**: Optimized for desktop and mobile devices
- **Search Functionality**: Find specific articles across all feeds
- **Reading History**: Track read and unread articles
- **Dark/Light Mode**: Toggle between visual themes for comfortable reading
- **Bookmark System**: Save articles for later reading

## Tech Stack

- **HTML5/CSS3**: For structure and styling
- **JavaScript**: Core programming language
- **Frontend Framework**: Vanilla JS with modular architecture
- **HTTP Client**: Native Fetch API for API requests
- **CSS Framework**: Custom styling with responsive design principles
- **Local Storage**: For saving user preferences and session data

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/hash-walker/rss-feed-aggregator-frontend.git
   cd rss-feed-aggregator-frontend
   ```

2. Open the project:
   - You can simply open the index.html file in your browser for local development
   - Alternatively, use a local server:
     ```bash
     # Using Python's built-in server
     python -m http.server 8000
     
     # Or with Node.js's http-server (requires installation)
     npx http-server
     ```

## Usage

1. **Opening the Application**:
   - Navigate to `index.html` in your browser or access through your local server

2. **User Authentication**:
   - Register a new account or log in to an existing one
   - Authentication tokens are stored in localStorage for persistence

3. **Adding Feeds**:
   - Click on the "Add Feed" button
   - Enter the RSS feed URL and optional category
   - Submit to add to your feed collection

4. **Browsing Content**:
   - The main dashboard displays aggregated content from all feeds
   - Use the sidebar to filter by specific feeds or categories
   - Click on articles to expand and read full content

5. **Managing Feeds**:
   - Access the feed management section from the sidebar
   - Edit, delete, or categorize your subscribed feeds

## Project Structure

```
rss-feed-aggregator-frontend/
│
├── index.html          # Main entry point
├── app.js              # Core application logic
├── css/                # Stylesheet directory
│   └── styles.css      # Main stylesheet
├── js/                 # JavaScript modules
│   ├── api.js          # API communication functions
│   ├── auth.js         # Authentication handling
│   ├── feedManager.js  # Feed management functionality
│   ├── ui.js           # UI rendering and interactions
│   └── utils.js        # Utility functions
├── assets/             # Media and static assets
│   ├── icons/          # Application icons
│   └── images/         # Images used in the UI
└── README.md           # Project documentation
```

## API Integration

The frontend communicates with a backend RSS Feed Aggregator API for data persistence and feed processing. Key integration points include:

- **Authentication Endpoints**: Register, login, and token refresh
- **Feed Management Endpoints**: Add, edit, delete feeds
- **Content Endpoints**: Fetch aggregated feed content
- **User Preference Endpoints**: Save and retrieve user settings

All API requests include proper authentication headers and error handling.

## Contributing

Contributions are welcome! To contribute to the project:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style conventions and includes appropriate tests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Developed by [hash-walker](https://github.com/hash-walker)