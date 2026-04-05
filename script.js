const CLOUD_NAME = "drsegptqy";          // Your Cloudinary cloud name
const UPLOAD_PRESET = "FOFO AND KOKO";   // Your unsigned upload preset

const video = document.getElementById("video");
const switchBtn = document.getElementById("switchCamera");
const captureBtn = document.getElementById("capturePhoto");
const recordBtn = document.getElementById("recordVideo");
const gallery = document.getElementById("gallery");

let currentStream = null;
let usingFrontCamera = true;
let mediaRecorder;
let recordedChunks = [];

// Start camera with permission request
async function startCamera() {
  if(currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }

  const constraints = {
    video: { facingMode: usingFrontCamera ? "user" : "environment" },
    audio: true
  };

  try {
    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = currentStream;
  } catch (err) {
    console.error("Camera error:", err);
    alert("Camera or microphone access denied. Please allow permissions to use this page.");
  }
}

// Switch camera
switchBtn.addEventListener("click", () => {
  usingFrontCamera = !usingFrontCamera;
  startCamera();
});

// Capture photo and upload immediately
captureBtn.addEventListener("click", () => {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);

  canvas.toBlob(blob => {
    uploadToCloudinary(blob, "photo.png", "image");
  }, "image/png");
});

// Record video
recordBtn.addEventListener("click", () => {
  if(recordBtn.textContent === "Start Recording") {
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(currentStream);
    mediaRecorder.ondataavailable = e => {
      if(e.data.size > 0) recordedChunks.push(e.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: "video/mp4" });
      uploadToCloudinary(blob, "video.mp4", "video");
    };
    mediaRecorder.start();
    recordBtn.textContent = "Stop Recording";
  } else {
    mediaRecorder.stop();
    recordBtn.textContent = "Start Recording";
  }
});

// Upload photo/video to Cloudinary
function uploadToCloudinary(fileBlob, filename, type) {
  const formData = new FormData();
  formData.append("file", fileBlob, filename);
  formData.append("upload_preset", UPLOAD_PRESET);

  fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    console.log("Uploaded URL:", data.secure_url);
    addToGallery(data.secure_url, type);
  })
  .catch(err => console.error(err));
}

// Add media to gallery
function addToGallery(url, type){
  if(type === "video"){
    const vid = document.createElement("video");
    vid.src = url;
    vid.controls = true;
    vid.style.width = "100%";
    vid.style.maxWidth = "250px";
    vid.style.borderRadius = "10px";
    gallery.appendChild(vid);
  } else {
    const img = document.createElement("img");
    img.src = url;
    img.style.width = "100%";
    img.style.maxWidth = "250px";
    img.style.borderRadius = "10px";
    gallery.appendChild(img);
  }
}

// Start camera on page load
startCamera();
