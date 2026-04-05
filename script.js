// Replace these with your Cloudinary info
const CLOUD_NAME = "drsegptqy";          // from dashboard
const UPLOAD_PRESET = "FOFO AND KOKO";   // unsigned preset

// Open camera
const video = document.getElementById('video');
navigator.mediaDevices.getUserMedia({ video: true, audio: false })
  .then(stream => video.srcObject = stream)
  .catch(err => console.error("Camera error:", err));

// Capture photo from video
const captureBtn = document.getElementById('capture');
captureBtn.addEventListener('click', () => {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  canvas.toBlob(blob => {
    document.getElementById('fileInput').files = createFileList(blob, "photo.png");
  }, 'image/png');
});

// Helper to convert blob to FileList
function createFileList(blob, filename) {
  const file = new File([blob], filename, { type: blob.type });
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  return dataTransfer.files;
}

// Upload to Cloudinary
const uploadBtn = document.getElementById('upload');
uploadBtn.addEventListener('click', () => {
  const file = document.getElementById('fileInput').files[0];
  if(!file) { alert("Select or capture a file first"); return; }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    console.log("Uploaded URL:", data.secure_url);
    addToGallery(data.secure_url, file.type);
  })
  .catch(err => console.error(err));
});

// Add photo/video to gallery (responsive for mobile)
function addToGallery(url, type){
  const gallery = document.getElementById('gallery');
  if(type.startsWith('video')){
    const vid = document.createElement('video');
    vid.src = url;
    vid.controls = true;
    vid.style.width = "100%";
    vid.style.maxWidth = "250px";
    vid.style.borderRadius = "10px";
    gallery.appendChild(vid);
  } else {
    const img = document.createElement('img');
    img.src = url;
    img.style.width = "100%";
    img.style.maxWidth = "250px";
    img.style.borderRadius = "10px";
    gallery.appendChild(img);
  }
}
