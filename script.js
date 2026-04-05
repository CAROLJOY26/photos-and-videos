const CLOUD_NAME = "drsegptqy";          
const UPLOAD_PRESET = "FOFO AND KOKO";  

const video = document.getElementById("video");
const switchBtn = document.getElementById("switchCamera");
const captureBtn = document.getElementById("capturePhoto");
const recordBtn = document.getElementById("recordVideo");
const gallery = document.getElementById("gallery");
const cameraLabel = document.getElementById("cameraLabel");

let currentStream = null;
let mediaRecorder;
let recordedChunks = [];
let videoDevices = [];
let currentDeviceIndex = 0;

// Get all video devices (front/back cameras)
async function getVideoDevices() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  videoDevices = devices.filter(device => device.kind === "videoinput");
}

// Start camera using the selected device
async function startCamera() {
  if(currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }

  await getVideoDevices();

  if(videoDevices.length === 0){
    alert("No camera found!");
    return;
  }

  const deviceId = videoDevices[currentDeviceIndex].deviceId;

  try {
    currentStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: deviceId } },
      audio: true
    });
    video.srcObject = currentStream;
    cameraLabel.textContent = currentDeviceIndex === 0 ? "Front Camera" : "Back Camera";
  } catch (err) {
    console.error("Camera error:", err);
    alert("Camera access denied or not available.");
  }
}

// Switch camera
switchBtn.addEventListener("click", () => {
  if(videoDevices.length > 1){
    currentDeviceIndex = (currentDeviceIndex + 1) % videoDevices.length;
    startCamera();
  } else {
    alert("No second camera available.");
  }
});

// Capture photo and upload
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

// Upload to Cloudinary
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

// Start camera when page loads
startCamera();
