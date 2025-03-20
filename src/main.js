import "./style.css";

import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { WiggleRigHelper } from "wiggle/helper";
// import { WiggleBone } from "wiggle";
import { WiggleBone } from "wiggle/spring";

let cameraPersp, currentCamera;
let scene, renderer, control, orbit;
let mouseX = 0, mouseY = 0;
let rootBone = null;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

const loader = new GLTFLoader();

const wiggleBones = [];

init();

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const aspect = window.innerWidth / window.innerHeight;

  cameraPersp = new THREE.PerspectiveCamera(50, aspect, 0.01, 30000);
  currentCamera = cameraPersp;

  currentCamera.position.set(5, 2.5, 5);

  scene = new THREE.Scene();
  scene.add(new THREE.GridHelper(5, 10, 0x888888, 0x444444));

  const ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(ambientLight);

  const light = new THREE.DirectionalLight(0xffffff, 4);
  light.position.set(1, 1, 1);
  scene.add(light);

  orbit = new OrbitControls(currentCamera, renderer.domElement);
  orbit.update();

  control = new TransformControls(currentCamera, renderer.domElement);

  control.addEventListener("dragging-changed", function (event) {
    orbit.enabled = !event.value;
  });

  loader.load("/demo.glb", (gltf) => {
    scene.add(gltf.scene);

    const helper = new WiggleRigHelper({
      skeleton: scene.getObjectByName("Stick").skeleton,
      dotSize: 0.2,
      lineWidth: 0.02,
    });
    scene.add(helper);

    rootBone = scene.getObjectByName("Root");
    const b1 = scene.getObjectByName("Bone1");
    const b2 = scene.getObjectByName("Bone2");
    const b3 = scene.getObjectByName("Bone3");

    // wiggleBones.push(new WiggleBone(b1, { velocity: 0.2 }));
    // wiggleBones.push(new WiggleBone(b2, { velocity: 0.2 }));
    // wiggleBones.push(new WiggleBone(b3, { velocity: 0.2 }));
    wiggleBones.push(new WiggleBone(b1, { stiffness: 700, damping: 28 }));
    wiggleBones.push(new WiggleBone(b2, { stiffness: 700, damping: 28 }));
    wiggleBones.push(new WiggleBone(b3, { stiffness: 700, damping: 28 }));

    control.attach(rootBone);
    control.showY = false;
  });
  scene.add(control.getHelper());

  // 监听
  document.addEventListener('mousemove', onDocumentMouseMove);
  
  window.addEventListener("resize", onWindowResize);
}

function onDocumentMouseMove(event) {
  // 正太化
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onWindowResize() {
  const aspect = window.innerWidth / window.innerHeight;
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  cameraPersp.aspect = aspect;
  cameraPersp.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();
}

function loop() {
  requestAnimationFrame(loop);
  
  // 鼠标位置更新
  if (rootBone) {
    const targetX = mouseX * 5;
    const targetY = mouseY * 2.5;
    
    rootBone.position.x += (targetX - rootBone.position.x) * 0.1; // 平滑系数
    rootBone.position.y += (targetY - rootBone.position.y) * 0.1;
  }
  
  wiggleBones.forEach((wb) => wb.update());
  render();
}

loop();

function render() {
  renderer.render(scene, currentCamera);
}
