let videoData = [];

function loadVideoData(fileName) {
  fetch(`./${fileName}`)
    .then((response) => {
      if (!response.ok) throw new Error("File not found");
      return response.json();
    })
    .then((data) => {
      videoData = data;
      document.getElementById("totalCount").textContent = videoData.length;
      applyFilters();
    })
    .catch((error) => {
      console.error("Error loading video data:", error);
      alert("File not found. Please enter a valid channel name.");
    });
}

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const minutes = seconds / 60;
  if (minutes < 60) return `${minutes.toFixed(1)}m`;
  const hours = minutes / 60;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  const days = hours / 24;
  return `${days.toFixed(1)}d`;
}

function formatLikes(likes) {
  if (likes >= 1_000_000) return `${(likes / 1_000_000).toFixed(1)}M`;
  if (likes >= 1_000) return `${(likes / 1_000).toFixed(1)}K`;
  return likes.toString();
}

function formatComments(comments) {
  if (comments >= 1_000_000) return `${(comments / 1_000_000).toFixed(1)}M`;
  if (comments >= 1_000) return `${(comments / 1_000).toFixed(1)}K`;
  return comments.toString();
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
}

function displayVideos(videos, containerId, startIndex) {
  const videoList = document.getElementById(containerId);
  videoList.innerHTML = "";
  let totalDuration = 0;

  const table = document.createElement("table");
  const tbody = document.createElement("tbody");

  videos.forEach((video, index) => {
    totalDuration += video.duration_seconds / 60;

    const durationText = formatDuration(video.duration_seconds);
    const likesText = formatLikes(video.likes);
    const commentsText = formatComments(video.comment_count);
    const uploadDate = formatDate(video.upload_date);
    const videoUrl = `https://www.youtube.com/watch?v=${video.videoID}`;

    const row = `
            <tr>
                <td>${startIndex + index + 1}</td>
                <td><a href="${videoUrl}" target="_blank">${
      video.title
    }</a></td>
                <td class="right-align">${uploadDate}</td>
                <td class="right-align"><img src="duration_icon.png" class="icon">${durationText}</td>
                <td class="right-align"><img src="views_icon.png" class="icon">${likesText}</td>
                <td class="right-align"><img src="comments_icon.png" class="icon">${commentsText}</td>
            </tr>
        `;

    tbody.innerHTML += row;
  });

  table.appendChild(tbody);
  videoList.appendChild(table);

  document.getElementById("filteredCount").textContent = videos.length;
  document.getElementById("totalDuration").textContent =
    Math.round(totalDuration);
}

function applyFilters() {
  let filteredVideos = [...videoData];

  const searchQuery = document
    .getElementById("searchInput")
    .value.toLowerCase();
  const sortOption = document.getElementById("sortOption").value;

  if (searchQuery.length >= 2) {
    filteredVideos = filteredVideos.filter((video) =>
      video.title.toLowerCase().includes(searchQuery)
    );
  }

  // Sort by duration first
  filteredVideos.sort((a, b) => a.duration_seconds - b.duration_seconds);

  // Then sort by the selected criteria within each duration category
  if (sortOption === "upload_date") {
    filteredVideos.sort(
      (a, b) => new Date(b.upload_date) - new Date(a.upload_date)
    );
  } else if (sortOption === "comments") {
    filteredVideos.sort((a, b) => b.comment_count - a.comment_count);
  }

  // Clear all categories
  document.getElementById("videoList_0_15").innerHTML = "";
  document.getElementById("videoList_15_30").innerHTML = "";
  document.getElementById("videoList_30_60").innerHTML = "";
  document.getElementById("videoList_60_300").innerHTML = "";
  document.getElementById("videoList_300_plus").innerHTML = "";

  // Categorize and display videos
  const categories = {
    videoList_0_15: filteredVideos.filter(
      (video) => video.duration_seconds <= 900
    ),
    videoList_15_30: filteredVideos.filter(
      (video) => video.duration_seconds > 900 && video.duration_seconds <= 1800
    ),
    videoList_30_60: filteredVideos.filter(
      (video) => video.duration_seconds > 1800 && video.duration_seconds <= 3600
    ),
    videoList_60_300: filteredVideos.filter(
      (video) =>
        video.duration_seconds > 3600 && video.duration_seconds <= 18000
    ),
    videoList_300_plus: filteredVideos.filter(
      (video) => video.duration_seconds > 18000
    ),
  };

  for (const [containerId, videos] of Object.entries(categories)) {
    let chunkedVideos = chunkArray(videos, 50);
    chunkedVideos.forEach((chunk, index) => {
      let newContainerId = `${containerId}_${index}`;
      let panel = document.createElement("div");
      panel.className = "panel";
      panel.id = newContainerId;
      document.getElementById(containerId).appendChild(panel);
      displayVideos(chunk, newContainerId, index * 50);
    });
  }
}

function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

document
  .getElementById("placeholderInput")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      let enteredValue = this.value.trim();
      if (enteredValue)
        loadVideoData(`./data/${enteredValue}_channel_videos.json`);
    }
  });

document
  .getElementById("searchInput")
  .addEventListener("input", debounce(applyFilters, 300));
document.getElementById("sortOption").addEventListener("change", applyFilters);
