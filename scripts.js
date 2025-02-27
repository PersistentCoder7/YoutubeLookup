let videoData = [];

function loadVideoData(fileName) {
    fetch(`./${fileName}`)
        .then(response => {
            if (!response.ok) throw new Error("File not found");
            return response.json();
        })
        .then(data => {
            videoData = data;
            document.getElementById("totalCount").textContent = videoData.length;
            applyFilters();
        })
        .catch(error => {
            console.error("Error loading video data:", error);
            alert("File not found. Please enter a valid channel name.");
        });
}

function displayVideos(videos) {
    const videoList = document.getElementById("videoList");
    videoList.innerHTML = "";
    let totalDuration = 0;

    videos.forEach(video => {
        totalDuration += video.duration_minutes;

        let durationText = video.duration_minutes <= 1
            ? `${Math.round(video.duration_minutes * 60)}s`
            : `${Math.round(video.duration_minutes)} min`;

        const videoCard = `
            <div class="video-card">
                <a href="${video.video_url}" target="_blank">
                    <img class="thumbnail" src="${video.thumbnail_url}" alt="${video.title}">
                </a>
                <div class="title">${video.title}</div>
                <div class="details">
                    <span class="duration">⏳ ${durationText}</span> | ${video.upload_date} | ${video.comment_count}
                </div>
            </div>
        `;

        videoList.innerHTML += videoCard;
    });

    document.getElementById("filteredCount").textContent = videos.length;
    document.getElementById("totalDuration").textContent = Math.round(totalDuration);
}

function applyFilters() {
    let filteredVideos = [...videoData];

    const searchQuery = document.getElementById("searchInput").value.toLowerCase();
    const durationFilter = document.getElementById("durationFilter").value;
    const sortOption = document.getElementById("sortOption").value;

    filteredVideos = filteredVideos.filter(video => video.title.toLowerCase().includes(searchQuery));

    if (durationFilter !== "all") {
        let min, max;
        if (durationFilter.includes(">")) {
            min = parseInt(durationFilter.replace(">", ""));
            max = Infinity;
        } else if (durationFilter.includes("<")) {
            min = 0;
            max = parseInt(durationFilter.replace("<", ""));
        } else if (durationFilter.includes("<=")) {
            min = 0;
            max = 60;
        } else {
            [min, max] = durationFilter.split("-").map(Number);
        }
        filteredVideos = filteredVideos.filter(video => video.duration_minutes * 60 >= min && video.duration_minutes * 60 <= max);
    }

    if (sortOption === "upload_date" || sortOption === "default") {
        filteredVideos.sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date));
    } else if (sortOption === "duration") {
        filteredVideos.sort((a, b) => b.duration_minutes - a.duration_minutes);
    } else if (sortOption === "comments") {
        filteredVideos.sort((a, b) => b.comment_count - a.comment_count);
    }

    displayVideos(filteredVideos);
}

document.getElementById("placeholderInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        let enteredValue = this.value.trim();
        if (enteredValue) loadVideoData(`./data/${enteredValue}_channel_videos.json`);
    }
});

document.getElementById("searchInput").addEventListener("input", applyFilters);
document.getElementById("durationFilter").addEventListener("change", applyFilters);
document.getElementById("sortOption").addEventListener("change", applyFilters);
