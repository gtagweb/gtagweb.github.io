import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

let scene, camera, renderer, controller1, controller2;
let hands = [];
let velocity = new THREE.Vector3();
let isPushing = { left: false, right: false };

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.6, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(VRButton.createButton(renderer));

    let floor = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10),
        new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    controller1 = renderer.xr.getController(0);
    controller2 = renderer.xr.getController(1);
    scene.add(controller1);
    scene.add(controller2);

    createHand(controller1, 'left');
    createHand(controller2, 'right');
}

function createHand(controller, hand) {
    let handMesh = new THREE.Mesh(
        new THREE.CircleGeometry(0.1, 16),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    handMesh.position.z = -0.1;
    controller.add(handMesh);
    hands.push({ mesh: handMesh, controller, hand });

    controller.addEventListener('selectstart', () => (isPushing[hand] = true));
    controller.addEventListener('selectend', () => (isPushing[hand] = false));
}

function animate() {
    renderer.setAnimationLoop(() => {
        hands.forEach(({ controller, hand }) => {
            if (isPushing[hand]) {
                let pushDirection = new THREE.Vector3();
                controller.getWorldPosition(pushDirection);
                pushDirection.sub(camera.position).normalize();
                velocity.add(pushDirection.multiplyScalar(0.02));
            }
        });

        velocity.multiplyScalar(0.98);
        camera.position.add(velocity);

        renderer.render(scene, camera);
    });
}
