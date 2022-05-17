import * as THREE from '../three.js-master/examples/build/three.module.js';
import { OrbitControls } from '../three.js-master/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../three.js-master/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '../three.js-master/examples/jsm/loaders/DRACOLoader.js';
//import { MapControls } from '../three.js-master/examples/jsm/controls/OrbitControls.js';

// load 3d model (.glb) from blender
const monkeyUrl = new URL('../assets/small-convert-05-02.glb', import.meta.url);

// init renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor('white'); /* BACKGROUND COLOR */

document.body.appendChild(renderer.domElement);

// init scene
const scene = new THREE.Scene(); 
scene.fog = new THREE.Fog( 'white', 30, 125 ); /* FOG */
//scene.background = new THREE.Color( 0xffffff );

// init camera
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(60, 20, 2);
//camera.lookAt( 0, 0, 0 )

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

orbit.maxPolarAngle = Math.PI / 2;
orbit.minPolarAngle = 0;

/*
const controls = new MapControls( camera, renderer.domElement );
controls.target.set(-828, 120, 398)
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.1;
controls.maxZoom = 1;
controls.maxPolarAngle = Math.PI / 2;
controls.screenSpacePanning = false;
controls.minDistance = 200;
controls.maxDistance = 400;

//horizontal rotation
controls.minAzimuthAngle = - Infinity; // default
controls.maxAzimuthAngle = Infinity; // default

//vertical rotation
controls.maxPolarAngle = Math.PI / 2;
controls.minPolarAngle = 0;
*/

// load geometry
const assetLoader = new GLTFLoader();
let mixer;

assetLoader.load(monkeyUrl.href, function(gltf) {
    const model = gltf.scene;
    model.position.set( 1, 1, 0 );
    model.scale.set( 1, 1, 1 );
    scene.add(model);
    
    mixer = new THREE.AnimationMixer(model);
    const clips = gltf.animations;
    clips.forEach(function(clip) {
        const action = mixer.clipAction(clip);
        action.play();
    });
}, undefined, function(error) {
    console(error);
});

const clock = new THREE.Clock();

function animate() {
    if(mixer)
        mixer.update(clock.getDelta());
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);


window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});