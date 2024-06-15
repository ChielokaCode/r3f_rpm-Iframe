// App.js
import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import AvatarView from "./AvatarView";
import Home from "./Home";
import AvatarFrame from "./AvatarFrame";

function App() {
  const subdomain = "react-three-21na6j"; // See section about becoming a partner
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showIFrame, setShowIFrame] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (avatarUrl) {
      navigate("/home");
    }
  }, [avatarUrl, navigate]);

  return (
    <div className="App">
      {/* <nav>
          <Link to="/">Home</Link>
          <Link to="/avatar-view">Avatar View</Link>
        </nav> */}
      {/* <div className="topBar">
          <input
            className="toggleButton"
            onClick={() => setShowIFrame(!showIFrame)}
            type="button"
            value={`${showIFrame ? "Close" : "Open"} creator`}
          />
          {avatarUrl && (
            <input
              className="toggleButton"
              onClick={() => setPredicting(!predicting)}
              type="button"
              value={`${predicting ? "Stop" : "Start"} predicting`}
            />
          )}
          <p id="avatarUrl">Avatar URL: {avatarUrl}</p>
        </div> */}
      <Routes>
        <Route exact path="/home" element={<Home />} />
        <Route
          path="/"
          element={
            <>
              <AvatarFrame
                subdomain={subdomain}
                setAvatarUrl={setAvatarUrl}
                avatarUrl={avatarUrl}
                setShowIFrame={setShowIFrame}
                showIFrame={showIFrame}
                setPredicting={setPredicting}
                predicting={predicting}
              />
              {avatarUrl && (
                <AvatarView
                  avatarUrl={avatarUrl}
                  predicting={predicting}
                  showIFrame={showIFrame}
                />
              )}
            </>
          }
        />
      </Routes>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
