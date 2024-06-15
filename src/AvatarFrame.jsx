// AvatarFrame.js
import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import "./App.css";

const AvatarFrame = ({
  subdomain,
  setAvatarUrl,
  setShowIFrame,
  showIFrame,
  setPredicting,
}) => {
  const iFrameRef = useRef(null);

  useEffect(() => {
    let iFrame = iFrameRef.current;
    if (iFrame) {
      iFrame.src = `https://${subdomain}.readyplayer.me/avatar?frameApi`;
    }
  });

  useEffect(() => {
    window.addEventListener("message", subscribe);
    document.addEventListener("message", subscribe);

    return () => {
      window.removeEventListener("message", subscribe);
      document.removeEventListener("message", subscribe);
    };
  });

  function subscribe(event) {
    const json = parse(event);

    if (json?.source !== "readyplayerme") {
      return;
    }
    // Subscribe to all events sent from Ready Player Me
    // once frame is ready
    if (json.eventName === "v1.frame.ready") {
      let iFrame = iFrameRef.current;
      if (iFrame && iFrame.contentWindow) {
        iFrame.contentWindow.postMessage(
          JSON.stringify({
            target: "readyplayerme",
            type: "subscribe",
            eventName: "v1.**",
          }),
          "*"
        );
      }
    }
    // Get avatar GLB URL
    if (json.eventName === "v1.avatar.exported") {
      // console.log(`Avatar URL: ${json.data.url}`);
      setAvatarUrl(json.data.url);
      setShowIFrame(false);
      setPredicting(true);
    }
    // Get user id
    if (json.eventName === "v1.user.set") {
      console.log(`User with id ${json.data.id} set: ${JSON.stringify(json)}`);
    }
  }

  function parse(event) {
    try {
      return JSON.parse(event.data);
    } catch (error) {
      return null;
    }
  }

  return (
    <iframe
      allow="camera *; microphone *"
      className="iFrame"
      id="frame"
      ref={iFrameRef}
      style={{ display: `${showIFrame ? "block" : "none"}` }}
      title={"Ready Player Me"}
    />
  );
};

AvatarFrame.propTypes = {
  subdomain: PropTypes.string.isRequired,
  setAvatarUrl: PropTypes.func.isRequired,
  setShowIFrame: PropTypes.func.isRequired,
  showIFrame: PropTypes.bool.isRequired,
  setPredicting: PropTypes.func.isRequired,
};

export default AvatarFrame;
