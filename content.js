function createDownloadButton(postElement) {
    const toolbar = postElement.querySelector("#toolbar");
    if (!toolbar || toolbar.querySelector(".yt-community-download")) return;

    const btn = document.createElement("button");
    btn.title = "Download Image";
    btn.className = "yt-community-download";
    btn.style.cssText = `
    border: none;
    background: none;
    padding: 6px 8px;
    margin-left: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background 0.2s ease;`;

    btn.onclick = () => downloadPostImages(postElement);

    btn.innerHTML = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" height="20px" width="20px" fill="#f1f3f5">
        <path d="M12,4V16.25L17.25,11L18,11.66L11.5,18.16L5,11.66L5.75,11L11,16.25V4H12M3,19H4V21H19V19H20V22H3V19Z"/>
    </svg>`;

    toolbar.appendChild(btn);
}

function extractPostId(postElement) {
    const imageRenderer = postElement.querySelector(
        "ytd-backstage-image-renderer a.yt-simple-endpoint"
    );
    const postLink = imageRenderer ? imageRenderer.href : null;

    if (!postLink) return null;

    const parsedUrl = new URL(postLink);
    const postId = parsedUrl.searchParams.get("lb");
    return postId;
}

function extractPostIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("lb");
}

function getChannelName(postElement) {
    const authorTextElement = postElement.querySelector("#author-text > span");
    return authorTextElement
        ? authorTextElement.textContent || authorTextElement.innerText
        : "UnknownChannel";
}

function downloadPostImages(postElement) {
    const contentAttachment = postElement.querySelector("#content-attachment");
    if (!contentAttachment) return;

    const images = contentAttachment.querySelectorAll("img");
    let postId = extractPostId(postElement);
    if (!postId) {
        postId = extractPostIdFromUrl();
        if (!postId) {
            console.warn(
                "Could not extract post ID from element or URL. Using default filename."
            );
        }
    }
    const channelName = getChannelName(postElement);

    if (!postId) {
        console.warn("Could not extract post ID. Using default filename.");
    }

    images.forEach((img, idx) => {
        let imageUrl = img.src.startsWith("//")
            ? "https:" + img.src
            : img.src;

        imageUrl = imageUrl.replace(/=s\d+-rw/, '=s1600-rw');

        fetch(imageUrl)
            .then((res) => res.blob())
            .then((blob) => {
                const blobUrl = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = blobUrl;
                a.download = `${channelName}_${postId || "default"}.jpg`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(blobUrl);
            })
            .catch((err) => console.error("Download failed:", err));
    });
}

function scanForPosts() {
    const posts = document?.querySelectorAll("ytd-backstage-post-renderer");
    posts.forEach(createDownloadButton);
}

const observer = new MutationObserver(scanForPosts);
observer.observe(document.body, { childList: true, subtree: true });

scanForPosts();
