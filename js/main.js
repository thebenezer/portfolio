import * as THREE from './three/build/three.module.js';
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js';

import Stats from './three/examples/jsm/libs/stats.module.js';
import * as dat from './three/examples/jsm/libs/lil-gui.module.min.js';

import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js';


import vs from './shaders/vertex.js';
import fs from './shaders/frag.js';

/*
* Debug
*/
const gui=new dat.GUI();
const debugObject = {
    deepcolor: 0x142e39,
    surfacecolor: 0x98caf0,
    scenecolor: 0x000,
    ambientlight: 0x96cbfd
}

/*
* Canvas
*/
const canvas = document.querySelector('#canvas' );
let stats,info,plane;
let camera, scene, renderer,controls,material;

function hasWebGL() {
    const gl =canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl && gl instanceof WebGLRenderingContext) {
        init();
        requestAnimationFrame(render);
    } else {
        console.log("Your browser does not support webGL");
    }
}
hasWebGL();

function init() {

    info = document.querySelector('#info' );
    stats = new Stats();
    info.appendChild( stats.dom );

    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true
        });
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    const fov = 60;
    const aspect = window.innerWidth / window.innerHeight;  // the canvas default
    const near = 0.1;
    const far = 500;
    camera = new THREE.PerspectiveCamera( fov, aspect, near, far);
    camera.position.set(60,20,80);

    scene = new THREE.Scene();
    scene.background = new THREE.Color( debugObject.scenecolor );
    // scene.fog = new THREE.FogExp2( 0xf3f3f3,0.01);
    scene.add( new THREE.AmbientLight( debugObject.ambientlight, 0.2 ) );

    const light=new THREE.DirectionalLight(0xffffff,0.8);
    light.position.set(-50,50,50)
    light.castShadow=true
    const helper=new THREE.DirectionalLightHelper(light,5)
    scene.add(light)


    const sphereGeometry = new THREE.SphereGeometry( 5, 32, 32 );
    const sphereMaterial = new THREE.MeshStandardMaterial( { color: 0xff0000 } );
    const sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
    sphere.position.set(0,20,20)
    sphere.castShadow = true; //default is false
    sphere.receiveShadow = false; //default
    scene.add( sphere );

    const geometry = new THREE.PlaneBufferGeometry( 1024, 1024 );
    plane = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial({color: 0x0000FF}) );
    plane.rotation.x= -Math.PI *0.5;
    plane.receiveShadow = true;
    
    // plane.rotation.y= -Math.PI *0.5;
    scene.add( plane );

// console.log(scene.children[0].color)

    gui.addColor(debugObject,'scenecolor')
        .onChange(()=>{
            scene.background.set(debugObject.scenecolor)
        });
    gui.addColor(debugObject,'ambientlight')
        .onChange(()=>{
            scene.children[0].color.set(debugObject.ambientlight)
        });

    /**
     * Textures
     */
    // Texture loader
const textureLoader = new THREE.TextureLoader()

    const bakedTexture = textureLoader.load('../assets/VRWorld/Baked.jpg')
    bakedTexture.flipY = false
    bakedTexture.encoding = THREE.sRGBEncoding;

    /**
     * Materials
     */
    // Baked material
    const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })

    // Portal light material
    // const portalLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })

    // // Pole light material
    // const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 })

    /**
     * Model
     */
 
    const loader = new GLTFLoader();

    loader.load( '../assets/VRWorld/portfolio_v1(defaultmaterials).glb', function ( gltf ) {
        gltf.scene.traverse((child)=>
        {
            child.material = bakedMaterial;
        })
        gltf.scene.castShadow=true
        gltf.scene.receiveShadow=true
        scene.add( gltf.scene );
    
    }, undefined, function ( error ) {
    
        console.error( error );
    
    } );

     
    loader.load( './assets/Character/character.glb', function ( gltf ) {

        const character = gltf.scene;
        // character.scale.set(0.8,0.8,0.8)

        const mixer = new THREE.AnimationMixer( character );
        scene.add( character );

        // setupCharacterAnimations( character, gltf.animations );
    }, undefined, function ( e ) {

        console.error( e );

    });

    

    orbitalcontrols();
    onWindowResize();
    window.addEventListener( 'resize', onWindowResize,false );

}


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    renderer.setSize( window.innerWidth, window.innerHeight );

}


function render(time) {

    time *= 0.001;  // convert time to seconds
    // material.uniforms.uTime.value = time;
    renderer.render( scene, camera );
    controls.update();// only required if controls.enableDamping = true, or if controls.autoRotate = true
    stats.update();
    requestAnimationFrame( render );
}

function orbitalcontrols() {
    // Setup orbital controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.listenToKeyEvents( window ); // optional

    controls.enableKeys = false;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    // controls.enableRotate = true;
    // controls.autoRotate = true;
    // controls.autoRotateSpeed =0.1;
    controls.screenSpacePanning = true;
    // controls.minDistance = 200;
    // controls.maxDistance = 350;
    controls.maxPolarAngle = Math.PI;
    // controls.minPolarAngle = -Math.PI / 2;

}

