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

function displayVideos(videos, containerId, startIndex) {
  const videoList = document.getElementById(containerId);
  videoList.innerHTML = "";
  let totalDuration = 0;

  const table = document.createElement("table");
  const tbody = document.createElement("tbody");

  videos.forEach((video, index) => {
    totalDuration += video.duration_minutes;

    let durationText =
      video.duration_minutes <= 1
        ? `${Math.round(video.duration_minutes * 60)}s`
        : `${Math.round(video.duration_minutes)} min`;

    const row = `
            <tr>
                <td>${startIndex + index + 1}</td>
                <td><a href="${video.video_url}" target="_blank">${
      video.title
    }</a></td>
                <td>${durationText} | ${video.upload_date} | ${
      video.comment_count
    }</td>
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
  filteredVideos.sort((a, b) => a.duration_minutes - b.duration_minutes);

  // Then sort by the selected criteria within each duration category
  if (sortOption === "upload_date" || sortOption === "default") {
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
      (video) => video.duration_minutes <= 15
    ),
    videoList_15_30: filteredVideos.filter(
      (video) => video.duration_minutes > 15 && video.duration_minutes <= 30
    ),
    videoList_30_60: filteredVideos.filter(
      (video) => video.duration_minutes > 30 && video.duration_minutes <= 60
    ),
    videoList_60_300: filteredVideos.filter(
      (video) => video.duration_minutes > 60 && video.duration_minutes <= 300
    ),
    videoList_300_plus: filteredVideos.filter(
      (video) => video.duration_minutes > 300
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
