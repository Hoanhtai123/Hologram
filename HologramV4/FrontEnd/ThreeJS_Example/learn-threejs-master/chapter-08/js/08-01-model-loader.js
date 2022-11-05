// import {
//     Scene,
//     PerspectiveCamera,
//     WebGLRenderer,
//     Color,
//     PointLight,
//     AmbientLight,
//     AnimationMixer,
//     Clock,
//     Box3,
//     Vector3,
//     GridHelper
// } from 'https://unpkg.com/three@0.132.0/build/three.module.js';
import * as THREE from "three";
import { GLTFLoader } from "https://unpkg.com/three@0.132.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://unpkg.com/three@0.132.0/examples/jsm/controls/OrbitControls.js";
import GUI from "https://cdn.jsdelivr.net/npm/lil-gui@0.16/+esm";
import Stats from "https://cdnjs.cloudflare.com/ajax/libs/stats.js/r17/Stats.min.js";
import * as SkeletonUtils from "https://unpkg.com/three@0.132.0/examples/jsm/utils/SkeletonUtils.js";

const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);

renderer.setClearColor(0xa3a3a3);

renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const keyboardInput = document.getElementById("keyboard-input");
// keydown, keypress, keyup
document.addEventListener("keydown", (event) => {
  console.log(event);
  if (event.key == "a") {
    keyboardInput.value += event.key;
  }
  if (event.key == "w") {
    keyboardInput.value += event.key;
  }
  if (event.key == "s") {
    keyboardInput.value += event.key;
  }
  if (event.key == "d") {
    keyboardInput.value += event.key;
  }
});

// CONTROLS
const orbit = new OrbitControls(camera, renderer.domElement);

camera.position.set(0, 10, 0);
orbit.update();

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff);
dirLight.position.set(-3, 10, -10);
dirLight.castShadow = true;
dirLight.shadow.camera.top = 2;
dirLight.shadow.camera.bottom = -2;
dirLight.shadow.camera.left = -2;
dirLight.shadow.camera.right = 2;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 40;
scene.add(dirLight);
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
scene.add(directionalLight);
directionalLight.position.set(3, 3, 3);

const assetLoader = new GLTFLoader();

// let mixer;
let stag;
let clips;
assetLoader.load(
  "https://threejs.org/examples/models/gltf/Soldier.glb",
  function (gltf) {
    const model = gltf.scene;
    model.scale.set(0.6, 0.6, 0.6);
    // scene.add(model);
    stag = model;
    clips = gltf.animations;
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

const planeMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    visible: false,
  })
);
planeMesh.rotateX(-Math.PI / 2);
scene.add(planeMesh);

// const grid = new THREE.GridHelper(20, 20);
// scene.add(grid);

const highlightMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    transparent: true,
  })
);
highlightMesh.rotateX(-Math.PI / 2);
highlightMesh.position.set(0.5, 0, 0.5);
scene.add(highlightMesh);

const mousePosition = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let intersects;

window.addEventListener("mousemove", function (e) {
  mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
  mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mousePosition, camera);
  intersects = raycaster.intersectObject(planeMesh);
  if (intersects.length > 0) {
    const highlightPos = new THREE.Vector3()
      .copy(intersects[0].point)
      .floor()
      .addScalar(0.5);
    highlightMesh.position.set(highlightPos.x, 0, highlightPos.z);

    const objectExist = objects.find(function (object) {
      return (
        object.position.x === highlightMesh.position.x &&
        object.position.z === highlightMesh.position.z
      );
    });

    if (!objectExist) highlightMesh.material.color.setHex(0xffffff);
    else highlightMesh.material.color.setHex(0xff0000);
  }
});

// const sphereMesh = new THREE.Mesh(
//     new THREE.SphereGeometry(0.4, 4, 2),
//     new THREE.MeshBasicMaterial({
//         wireframe: true,
//         color: 0xFFEA00
//     })
// );
let num = 0;
const objects = [];
const mixers = [];
window.addEventListener("mousedown", function () {
  console.log("Hotai addEventListener: ");
  const objectExist = objects.find(function (object) {
    return (
      object.position.x === highlightMesh.position.x &&
      object.position.z === highlightMesh.position.z
    );
  });

  if (!objectExist) {
    console.log("Hotai objectExist: ", !objectExist);
    if (intersects.length > 0) {
      const stagClone = SkeletonUtils.clone(stag);
      stagClone.position.copy(highlightMesh.position);
      stagClone.rotateZ(-Math.PI / 2);
      if (num < 4 && num > 0) {
        switch (num) {
          case 1:
            stagClone.rotateX(-Math.PI / 2);
            break;
          case 2:
            for (let i = 0; i < num; i++) {
              stagClone.rotateX(-Math.PI / 2);
            }
            break;
          case 3:
            for (let i = 0; i < num; i++) {
              stagClone.rotateX(-Math.PI / 2);
            }
            break;
        }
      }
      scene.add(stagClone);
      objects.push(stagClone);
      highlightMesh.material.color.setHex(0xff0000);

      const mixer = new THREE.AnimationMixer(stagClone);
      console.log("Hotai animations: ", clips[3]);
      const action = mixer.clipAction(clips[3]);
      action.play();
      mixers.push(mixer);
    }
  }
  console.log(scene.children.length);
  num++;
});

const clock = new THREE.Clock();
function animate(time) {
  highlightMesh.material.opacity = 1 + Math.sin(time / 120);
  // objects.forEach(function(object) {
  //     object.rotation.x = time / 1000;
  //     object.rotation.z = time / 1000;
  //     object.position.y = 0.5 + 0.5 * Math.abs(Math.sin(time / 1000));
  // });
  // if(mixer)
  //     mixer.update(clock.getDelta());
  const delta = clock.getDelta();
  mixers.forEach(function (mixer) {
    mixer.update(delta);
  });
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
