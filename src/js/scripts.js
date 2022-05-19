import * as THREE from '../three.js-master/examples/build/three.module.js';
import { OrbitControls } from '../three.js-master/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../three.js-master/examples/jsm/loaders/GLTFLoader.js';
import { MapControls } from '../three.js-master/examples/jsm/controls/OrbitControls.js';

// load 3d model (.glb) from blender
const monkeyUrl = new URL('../assets/small-convert-06.glb', import.meta.url);

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
    45, // Field of View
    window.innerWidth / window.innerHeight, // Aspect Ratio
    0.1, // Near View
    500 // Far View
);
camera.position.set(40, 20, 30);

/*
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

orbit.maxPolarAngle = Math.PI / 2;
orbit.minPolarAngle = 0;
*/

const controls = new MapControls( camera, renderer.domElement );
controls.target.set(0, 0, 0)
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.1;
controls.maxZoom = 1;
controls.screenSpacePanning = false;
controls.minDistance = 10;
controls.maxDistance = 40;

//horizontal rotation
controls.minAzimuthAngle = - Infinity; // default
controls.maxAzimuthAngle = Infinity; // default

//vertical rotation
controls.maxPolarAngle = Math.PI / 2;
controls.minPolarAngle = 0;

console.log(scene)

// raycaster variables
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

let videoCameras = [];
let objects = [];
let intersectedObj;

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

    scene.children.forEach(child => {
        child.children.forEach(grandchild => {            
            if (grandchild.name.match('^cam')) {
                videoCameras.push(grandchild);
            } else {
                objects.push(grandchild);
            }       
        })
        console.log(videoCameras)
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

window.addEventListener('click', (e) => {
    pointer.x = ( e.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const intersectedObjs = raycaster.intersectObjects(videoCameras);
    
    // if there are intersections
    if ( intersectedObjs.length > 0 ) {
        // if intersectedObj is new
        if ( intersectedObj != intersectedObjs[ 0 ].object ) {          
            intersectedObj = intersectedObjs[ 0 ].object; // set new intersectedObj
        }
    } else { //when there are no intersections
        intersectedObj = null;
    }
    console.log(intersectedObj)

    if (intersectedObj){
        const gifToShow = document.getElementById(intersectedObj.name);
        gifToShow.style.display = 'block';
    } else {
        Array.from(document.getElementsByClassName("gifs")).forEach(function (element) {
            element.style.display = 'none';
        })
    }
})

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});