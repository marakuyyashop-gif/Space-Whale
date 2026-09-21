(() => {
  const state = {
    stream: new MediaStream(),
    cameraTrack: null,
    micTrack: null
  };

  const video = document.getElementById("localVideo");
  const dock = document.getElementById("videoDock");
  const placeholder = document.getElementById("videoPlaceholder");
  const status = document.getElementById("mediaStatus");
  const cameraButton = document.getElementById("cameraToggle");
  const micButton = document.getElementById("micToggle");
  const leaveButton = document.getElementById("leaveClassroomButton");
  const accountLink = document.getElementById("classroomAccountLink");

  function syncVideoElement() {
    if (video && video.srcObject !== state.stream) video.srcObject = state.stream;
    if (placeholder) placeholder.hidden = Boolean(state.cameraTrack?.enabled);
    if (dock) dock.hidden = false;
  }

  function updateUi() {
    const cameraOn = Boolean(state.cameraTrack?.enabled);
    const micOn = Boolean(state.micTrack?.enabled);

    cameraButton?.classList.toggle("off", !cameraOn);
    cameraButton?.classList.toggle("on", cameraOn);
    cameraButton?.setAttribute("aria-pressed", String(cameraOn));

    micButton?.classList.toggle("off", !micOn);
    micButton?.classList.toggle("on", micOn);
    micButton?.setAttribute("aria-pressed", String(micOn));

    if (status) {
      if (cameraOn && micOn) status.textContent = "Camera and microphone are on";
      else if (cameraOn) status.textContent = "Camera on · microphone off";
      else if (micOn) status.textContent = "Microphone on · camera off";
      else status.textContent = "Camera and microphone are off";
    }

    syncVideoElement();
  }

  async function getTrack(kind) {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Camera and microphone are not supported in this browser.");
    }

    const constraints = kind === "video"
      ? { video: { facingMode: "user" }, audio: false }
      : { video: false, audio: true };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    const track = kind === "video" ? stream.getVideoTracks()[0] : stream.getAudioTracks()[0];
    if (!track) throw new Error(kind === "video" ? "Camera not found." : "Microphone not found.");
    state.stream.addTrack(track);
    return track;
  }

  async function toggleCamera() {
    try {
      if (!state.cameraTrack || state.cameraTrack.readyState === "ended") {
        state.cameraTrack = await getTrack("video");
        state.cameraTrack.enabled = true;
      } else {
        state.cameraTrack.enabled = !state.cameraTrack.enabled;
      }
      updateUi();
    } catch (error) {
      if (dock) dock.hidden = false;
      if (status) status.textContent = error.message;
      console.error("[Space Whale] Camera error", error);
    }
  }

  async function toggleMic() {
    try {
      if (!state.micTrack || state.micTrack.readyState === "ended") {
        state.micTrack = await getTrack("audio");
        state.micTrack.enabled = true;
      } else {
        state.micTrack.enabled = !state.micTrack.enabled;
      }
      updateUi();
    } catch (error) {
      if (dock) dock.hidden = false;
      if (status) status.textContent = error.message;
      console.error("[Space Whale] Microphone error", error);
    }
  }

  function stopMedia() {
    state.stream.getTracks().forEach((track) => track.stop());
    state.cameraTrack = null;
    state.micTrack = null;
  }

  cameraButton?.addEventListener("click", toggleCamera);
  micButton?.addEventListener("click", toggleMic);

  leaveButton?.addEventListener("click", async () => {
    const role = window.SpaceWhaleClassroom?.state?.role;
    stopMedia();
    try {
      await window.SpaceWhaleClassroom?.disconnect?.();
    } catch (_) {}

    location.href = role === "teacher" ? "dashboard.html" : "student-dashboard.html";
  });

  accountLink?.addEventListener("click", () => {
    const role = window.SpaceWhaleClassroom?.state?.role;
    accountLink.href = role === "teacher"
      ? "dashboard.html"
      : role === "student"
        ? "student-dashboard.html"
        : "app.html";
  });

  window.addEventListener("pagehide", stopMedia);
  window.SpaceWhaleMedia = { state, stopMedia, toggleCamera, toggleMic };
})();
