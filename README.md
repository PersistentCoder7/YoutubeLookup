# YoutubeLookup

Navigate online to search for [Quick Youtube Video Search](https://persistentcoder7.github.io/YoutubeLookup/SearchVideos.html "The best search engine for privacy")


# 
```bash
jq -r '.[]
  | select(.title | test("tips"; "i") and test("code"; "i"))
  | .title' *.json

# Extract the titles for more efficient search
q '.[].title' *.json
```
