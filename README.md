# 📺 YoutubeLookup

A privacy-focused YouTube video search and browsing tool that helps you discover and organize content from your favorite tech channels without direct YouTube tracking.

## 🌐 Live Demo

Navigate online to [Quick Youtube Video Search](https://persistentcoder7.github.io/YoutubeLookup/SearchVideos.html "The best search engine for privacy")

## 📖 What is YoutubeLookup?

YoutubeLookup is a web-based application that allows you to browse and search through YouTube videos from various channels, organized by video duration. Instead of making live API calls to YouTube, it works with pre-downloaded video metadata, providing a more privacy-conscious way to discover content.

## ✨ Key Features

- **📂 Duration-Based Organization**: Videos automatically categorized into 5 time ranges (0-15 min, 15-30 min, 30-60 min, 1-5 hours, >5 hours)
- **🔍 Real-Time Search**: Instantly filter videos by title as you type
- **🔄 Multiple Sort Options**: Sort by upload date, comment count, or view count
- **📊 Rich Metadata**: View video statistics including likes, comments, views, and upload dates
- **🖼️ Thumbnail Previews**: Hover over video numbers to see thumbnails
- **🎨 Dark Theme UI**: Easy on the eyes with a YouTube-inspired dark interface
- **🔒 Privacy-Focused**: Browse pre-downloaded data without direct YouTube tracking
- **📦 25+ Tech Channels**: Pre-loaded data from popular developer and technology channels

## 🚀 How to Use

1. Open [SearchVideos.html](https://persistentcoder7.github.io/YoutubeLookup/SearchVideos.html)
2. Enter a channel name in the input field and press Enter (e.g., `nickchapas`, `dotnet`, `github`)
3. Use the search box to filter videos by title
4. Sort videos using the dropdown menu
5. Click on any video title to watch it on YouTube

## 📚 Available Channels

The repository includes video data for 25+ channels, including:
- **Developer Channels**: Nick Chapsas, Tim Corey, James Montemagno, Chai aur Code
- **Microsoft**: .NET, Azure, Visual Studio, VS Code, Microsoft Developer
- **Tech Events**: NDC Conferences, Devoxx, API Days, GOTO
- **Organizations**: GitHub, Zero to Mastery
- And many more!

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Data Format**: JSON files with video metadata
- **Data Collection**: Python script using YouTube Data API v3
- **Hosting**: GitHub Pages

## 📥 Data Collection

The repository includes a Python script (`data/fetch_channel_videos.py`) to fetch and update video data:

```bash
# Set your YouTube API key
export YOUTUBE_API_KEY="your_api_key_here"

# Fetch all videos from a channel
python data/fetch_channel_videos.py @channelname

# Fetch videos published after a specific date
python data/fetch_channel_videos.py @channelname --publishedAfter 2025-01-01T00:00:00Z
```

## 🔧 Command-Line Search (Advanced)

Use `jq` for powerful command-line searches:

```bash
# Search for videos containing specific keywords
jq -r '.[]
  | select(.title | test("tips"; "i") and test("code"; "i"))
  | .title' *.json

# Extract all titles for efficient searching
q '.[].title' *.json
```

## 📁 Repository Structure

```
YoutubeLookup/
├── SearchVideos.html    # Main web interface
├── scripts.js           # Application logic and filtering
├── styles.css           # Dark theme styling
├── data/                # Video metadata JSON files
│   ├── *.json          # Channel video data
│   └── fetch_channel_videos.py  # Data collection script
└── README.md            # This file
```

## 🤝 Contributing

To add a new channel:
1. Set up your YouTube API key
2. Run the fetch script with the channel name
3. Commit the generated JSON file to the `data/` directory

## 📄 License

This project is for educational and personal use. Video metadata is fetched from YouTube's public API and belongs to the respective content creators.

## 🌟 Why YoutubeLookup?

- **Discover Content**: Find videos from your favorite channels organized by length
- **Time Management**: Quickly find videos that fit your available time
- **Offline Browsing**: Browse video catalogs without constant API calls
- **Batch Research**: Search across multiple channels simultaneously
- **Developer-Friendly**: Focus on tech and programming content
