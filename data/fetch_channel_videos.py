import requests
import json
import time
import os
import argparse
import isodate  # For parsing ISO 8601 durations
from datetime import datetime, timezone
import sys

# Get YouTube API Key from environment variables
API_KEY = os.getenv("YOUTUBE_API_KEY")

if not API_KEY:
    print("Error: YOUTUBE_API_KEY environment variable is not set.")
    exit(1)

# Base URLs
SEARCH_CHANNEL_URL = "https://www.googleapis.com/youtube/v3/search"
CHANNEL_DETAILS_URL = "https://www.googleapis.com/youtube/v3/channels"
VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos"

# Default sample date for demonstration purposes
sample_date = "2025-01-01T00:00:00Z"

# Argument Parser to accept channel name and optional date from command line
script_name = os.path.basename(sys.argv[0])
parser = argparse.ArgumentParser(
    description="Fetch all videos of a YouTube channel.",
    epilog=f"Example usage: python {script_name} @chaiaurcode --publishedAfter {sample_date}"
)
parser.add_argument("channel_name", type=str, help="YouTube channel name (e.g., @chaiaurcode)")
parser.add_argument("--publishedAfter", type=str, default=None, help="Fetch videos uploaded after this date (format: YYYY-MM-DDTHH:MM:SSZ)")
args = parser.parse_args()

channel_name = args.channel_name.strip().lower()
channel_display_name = channel_name.replace("@", "")
published_after = args.publishedAfter
output_filename = f"{channel_display_name}_channel_videos.json"

# Load existing data if the file exists
existing_videos = {}
if os.path.exists(output_filename):
    with open(output_filename, "r", encoding="utf-8") as f:
        try:
            existing_videos = { (v["channelID"], v["videoID"]): v for v in json.load(f) }
        except json.JSONDecodeError:
            existing_videos = {}

# ✅ Step 1: Get Channel ID from Channel Name
print(f"Fetching Channel ID for {channel_name}...")
params = {
    "part": "id",
    "q": channel_name,
    "type": "channel",
    "key": API_KEY,
    "maxResults": 1
}
response = requests.get(SEARCH_CHANNEL_URL, params=params)
search_data = response.json()

try:
    CHANNEL_ID = search_data["items"][0]["id"]["channelId"]
    print(f"Found Channel ID: {CHANNEL_ID}")
except (KeyError, IndexError):
    print("Error: Could not find the channel. Please check the channel name.")
    exit(1)

# ✅ Step 2: Fetch Videos Using Search API with publishedAfter Filter
print("Fetching video IDs...")
video_ids = []
next_page_token = None

while True:
    params = {
        "part": "id",
        "channelId": CHANNEL_ID,
        "maxResults": 50,
        "order": "date",
        "type": "video",
        "key": API_KEY
    }
    if published_after:
        params["publishedAfter"] = published_after

    response = requests.get(SEARCH_CHANNEL_URL, params=params)
    data = response.json()

    for item in data.get("items", []):
        video_ids.append(item["id"]["videoId"])

    next_page_token = data.get("nextPageToken")
    if not next_page_token:
        break

    time.sleep(1)  # Prevent hitting API rate limits

print(f"Found {len(video_ids)} videos. Now fetching video details...")

# ✅ Step 3: Fetch Video Details
for i in range(0, len(video_ids), 50):  # API allows max 50 IDs per request
    batch_ids = video_ids[i:i + 50]
    params = {
        "part": "contentDetails,snippet,statistics",
        "id": ",".join(batch_ids),
        "key": API_KEY
    }
    response = requests.get(VIDEOS_URL, params=params)
    videos_data = response.json()

    for item in videos_data.get("items", []):
        video_id = item["id"]
        title = item["snippet"]["title"]
        upload_date = item["snippet"]["publishedAt"]  # Keep full ISO 8601 format
        duration = item["contentDetails"].get("duration", "")

        # ✅ Fix: Parse duration correctly in seconds
        try:
            if duration:  # Ensure duration exists
                duration_obj = isodate.parse_duration(duration)
                duration_seconds = int(duration_obj.total_seconds())  # Convert to seconds
            else:
                duration_seconds = 0
        except Exception as e:
            print(f"Error parsing duration for video {video_id}: {e}")
            duration_seconds = 0  # Default to zero if parsing fails

        # Fetch comment count, likes, and views safely
        comment_count = int(item["statistics"].get("commentCount", 0))
        likes = int(item["statistics"].get("likeCount", 0))
        views = int(item["statistics"].get("viewCount", 0))

        video_data = {
            "channelID": CHANNEL_ID,
            "videoID": video_id,
            "title": title,
            "duration_seconds": duration_seconds,
            "upload_date": upload_date,
            "comment_count": comment_count,
            "likes": likes,
            "views": views
        }

        # Update or add video data
        existing_videos[(CHANNEL_ID, video_id)] = video_data

    time.sleep(1)  # Prevent hitting API rate limits

# ✅ Step 4: Save Updated JSON Output File
updated_video_list = list(existing_videos.values())
with open(output_filename, "w", encoding="utf-8") as f:
    json.dump(updated_video_list, f, indent=4)

print(f"Updated {len(updated_video_list)} videos in {output_filename}")
print("Done!")
