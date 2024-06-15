import React, { Component } from "react";
import PropTypes from "prop-types";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { AUPredictor } from "@quarkworks-inc/avatar-webkit";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

const navigationBarHeight = 100;
const backgroundUrl =
  "https://hallway-public.nyc3.digitaloceanspaces.com/backgrounds/aerodynamics_workshop_1k.hdr";
const SCALE = 1; // Assuming SCALE is defined somewhere in your code

// Define BlendShapeKeys if not part of the library
const BlendShapeKeys = {
  toARKitConvention: (key) => {
    // Implement your blend shape key conversion here
    // For example:
    const mapping = {
      mouthSmile_L: "mouthSmileLeft",
      mouthSmile_R: "mouthSmileRight",
      // Add more mappings as required
    };
    return mapping[key] || key;
  },
};

class AvatarView extends Component {
  mainViewRef = React.createRef();
  predictor = new AUPredictor({
    apiToken: "110546ae-627f-48d4-9cf8-fd8850e0ac7f",
    shouldMirrorOutput: true,
  });

  async componentDidMount() {
    const mainView = this.mainViewRef.current;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(
      window.innerWidth,
      window.innerHeight - navigationBarHeight
    );
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

    mainView.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / (window.innerHeight - navigationBarHeight),
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 3);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    const background = await this.loadBackground(backgroundUrl);
    this.scene = new THREE.Scene();
    this.scene.background = background;

    this.loadModel();

    this.renderer.setAnimationLoop(this.renderScene.bind(this));

    this.predictor.onPredict = this.onPredict.bind(this);
  }

  onPredict = (results) => {
    const head = this.avatar.children.find(
      (child) => child.name === "react-three"
    );

    Object.entries(results.blendShapes).forEach(function ([key, value]) {
      const arKitKey = BlendShapeKeys.toARKitConvention(key);

      const index = head.morphTargetDictionary[arKitKey];
      head.morphTargetInfluences[index] = value;
    });

    const { pitch, yaw, roll } = results.rotation;

    this.avatar?.rotation.set(-pitch, yaw, roll);

    const { x, y, z } = results.transform;

    this.avatar.position.set(x * SCALE, -4 + y * SCALE, z);
  };

  async componentDidUpdate(oldProps) {
    if (
      this.props?.avatarUrl &&
      this.props?.avatarUrl !== oldProps?.avatarUrl
    ) {
      this.loadModel();
    }

    if (this.props?.predicting !== oldProps?.predicting) {
      if (this.props?.predicting && this.predictor.state === "stopped") {
        let stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            width: { ideal: 640 },
            height: { ideal: 360 },
            facingMode: "user",
          },
        });

        await this.predictor.start({ stream });
      } else if (this.predictor.state !== "stopped") {
        await this.predictor.stop();
      }
    }

    this.renderer.domElement.style.cssText = `display: ${
      this.props.showIFrame ? "none" : "block"
    }`;
  }

  async loadModel() {
    const gltf = await this.loadGLTF(this.props.avatarUrl);
    this.avatar = gltf.scene.children[0];
    this.avatar.position.set(0, -4, 0);
    this.avatar.scale.setScalar(SCALE);

    this.scene.add(this.avatar);
  }

  // async loadModel() {
  //   const gltf = await this.loadGLTF(this.props.avatarUrl)
  //   this.avatar = gltf.scene.children[0]
  //   this.avatar.position.set(0, -2, 0)
  //   this.scene.add(this.avatar)
  // }

  renderScene() {
    this.renderer.render(this.scene, this.camera);
  }

  loadGLTF(url) {
    return new Promise((resolve) => {
      const loader = new GLTFLoader();
      loader.load(url, (gltf) => resolve(gltf));
    });
  }

  loadBackground(url) {
    return new Promise((resolve) => {
      const loader = new RGBELoader();
      const generator = new THREE.PMREMGenerator(this.renderer);
      loader.load(url, (texture) => {
        const envMap = generator.fromEquirectangular(texture).texture;
        generator.dispose();
        texture.dispose();
        resolve(envMap);
      });
    });
  }

  render = () => (
    <div
      ref={this.mainViewRef}
      className="avatarView"
      style={{
        display: `${!this.props.showIFrame ? "none" : "block"}`,
        height: "calc(100vh - 100px)",
      }}
    />
  );
}

AvatarView.propTypes = {
  showIFrame: PropTypes.bool.isRequired,
  avatarUrl: PropTypes.string,
  predicting: PropTypes.bool,
};

export default AvatarView;
