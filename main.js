import './style.css'
// import * as THREE from 'three'
import * as THREE from 'node_modules/three/'
import {InteractionManager} from "three.interactive";



/* ============================================================================================= */



const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const mouseP = document.getElementById("mouse");
const cameraP = document.getElementById("camera_position");
const cameraA = document.getElementById("camera_angle");
const earthP = document.getElementById("earth");
const moonP = document.getElementById("moon");
const scene_objids = document.getElementById("scene_objids");
const moon_objids = document.getElementById("moon_objids");

let obj_to_follow = null;



/* ============================================================================================= */



function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);





function onPointerMove(event) {
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

window.addEventListener('pointermove', onPointerMove);



/* ============================================================================================= */



const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    antialias: true,
    logarithmicDepthBuffer: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);



/* ============================================================================================= */



function makeSphere(ctx, size, color, wireframe) {
    const geometry = new THREE.SphereGeometry(size, size * 2, size * 2, 0, Math.PI * 2);
    const material = new THREE.MeshStandardMaterial({
        color: color,
        wireframe: wireframe
    });
    const mesh = new THREE.Mesh(geometry, material);
    ctx.add(mesh);
    return mesh;
}





function makeRing(ctx, size, color) {
    const geometry = new THREE.RingGeometry(size, size + 9, size * 2);
    const material = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geometry, material);
    ctx.add(mesh);
    return mesh;
}





function makeSpotLight(ctx, color, helper) {
    const pointLight = new THREE.PointLight(color);
    ctx.add(pointLight);
    if(helper) {
        const lightHelper = new THREE.PointLightHelper(pointLight);
        ctx.add(lightHelper);
    }
    return pointLight;
}





function makeEllipse(ctx, color, apogee, perigee, semi_minor_axys) {
    const curve = new THREE.EllipseCurve(
        perigee - apogee,  0,
        (apogee + perigee)/2, semi_minor_axys,
        0,  2 * Math.PI,
        false,
        0
    );
    const points = curve.getPoints(500);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: color });
    const ellipse = new THREE.Line(geometry, material);
    ctx.add(ellipse);
    return ellipse;
}





function orbitPosition(obj, a, b, apogee, perigee, iteration) {
    obj.position.set(a * Math.cos(iteration) + (perigee - apogee), b * Math.sin(iteration), 0);
}



/* ============================================================================================= */



function resetMaterial() {
    scene.traverse((object)=>{
        if (object.isMesh) object.material.color = new THREE.Color(0xFFFFFF);
    });
}




function objectHover() {
    raycaster.setFromCamera(mouse,camera);
    const intersects = raycaster.intersectObjects(scene.children);
    for(let i = 0; i < intersects.length; i++) {
        if(intersects[i].object.geometry.type === "SphereGeometry")
            intersects[i].object.material.color = new THREE.Color(0xFAD578);
    }
}





function cameraFollow(target) {
    if(target !== null && target.geometry.type === "SphereGeometry") {
        const target_world_position = new THREE.Vector3();
        target.getWorldPosition(target_world_position);
        const zoom = target.geometry.boundingSphere.radius * 2;
        camera.position.set(target_world_position.x, target_world_position.y, target_world_position.z + zoom);
    }
    else camera.position.set(0, 0, 6000);
}



/* ============================================================================================= */



const sun   = makeSpotLight(scene, 0xFFFFFF, false);

const earth = makeSphere(scene, 127, 0xFFFFFF, false);

const moon_reference = makeSphere(scene, 0, 0x000000, false);
const moon  = makeSphere(moon_reference, 34, 0xFFFFFF, false);
const moon_orbit = makeEllipse(moon_reference, 0x222222, 4054, 3632, 3842);

sun.position.set(-10000, 0, 0);
moon_reference.rotation.set(0, 5.14 * Math.PI / 180, 0);
orbitPosition(moon, 3847, 3842, 4054, 3632, 0);





scene_objids.innerHTML += "<span>Sun</span> : " + sun.uuid + "<br>"
scene_objids.innerHTML += "<span>Earth</span> : " + earth.uuid + "<br>"
scene_objids.innerHTML += "<span>moon_reference</span> : " + moon_reference.uuid + "<br>"

moon_objids.innerHTML += "<span>Moon</span> : " + moon.uuid + "<br>"
// moon_objids.innerHTML += "<span>moon_orbit</span> : " + moon_orbit.uuid + "<br>"




const interactionManager = new InteractionManager(renderer, camera, renderer.domElement);
interactionManager.add(earth);
interactionManager.add(moon);


earth.addEventListener("click", ()=>{obj_to_follow = earth});
moon.addEventListener("click", ()=>{obj_to_follow = moon});



/* ============================================================================================= */



let i = 0;
function animate() {
    requestAnimationFrame(animate);



    orbitPosition(moon, 3847, 3842, 4054, 3632, i);
    i += 0.001;



    resetMaterial();
    objectHover();



    cameraFollow(obj_to_follow);



    const moon_world_position = new THREE.Vector3();
    moon.getWorldPosition(moon_world_position);


    mouseP.innerHTML = mouse.x.toFixed(3) + " | " + mouse.y.toFixed(3);
    cameraP.innerHTML = camera.position.x.toFixed(1) + " | " + camera.position.y.toFixed(1) + " | " + camera.position.z.toFixed(1);
    cameraA.innerHTML = camera.rotation.x.toFixed(1) + " | " + camera.rotation.y.toFixed(1) + " | " + camera.rotation.z.toFixed(1);
    earthP.innerHTML = earth.position.x.toFixed(1) + " | " + earth.position.y.toFixed(1) + " | " + earth.position.z.toFixed(1);
    moonP.innerHTML = moon.position.x.toFixed(1) + " | " + moon.position.y.toFixed(1) + " | " + moon_world_position.z.toFixed(1);



    renderer.render(scene, camera);
}
animate();


/* ============================================================================================= */


window.addEventListener("keydown", (e)=>{
    if(e.code === "Escape") {
        camera.position.set(0,0,6000);
        camera.rotation.set(0,0,0);
        obj_to_follow = null;
    }
})
