import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import "./style.css";
import Star from "./src/star";
import Orbit from "./src/orbit";
import Planet from "./src/planet";
import Particles from "./src/particles";
import GeneralData from "./src/GeneralData";

// Imposta la scena
const scene = new THREE.Scene();

// Imposta la camera prospettica
const camera = new THREE.PerspectiveCamera(
  75, // FOV (field of view)
  window.innerWidth / window.innerHeight, // Aspect ratio
  0.1, // Near clipping plane
  1000 // Far clipping plane
);
camera.position.set(0, 5, 10); // Posiziona la camera per una visione migliore

// Imposta il renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const DATI_ESSEZIALI = [
  { scene: scene },
  { render: renderer },
  { camera: camera },
];
const GeneralDate = new GeneralData();
for (let i = 0; i < DATI_ESSEZIALI.length; i++) {
  GeneralDate.setDate(DATI_ESSEZIALI[i]);
}

// Aggiungi Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Effetto di smorzamento per un movimento più fluido
controls.dampingFactor = 0.05;

//Aggiunta assi
const axisHelper = new THREE.AxesHelper(5);
scene.add(axisHelper);

/// Aggiungi una luce ambientale per un'illuminazione di base (opzionale)
const ambientLight = new THREE.AmbientLight(0x404040, 3); // Luce debole
scene.add(ambientLight);

// Crea una PointLight che emette luce dal Sole
const pointLight = new THREE.PointLight(0xffffff, 70, 1000); // Colore, intensità, distanza massima
pointLight.position.set(0, 0, 0); // Posizione della luce è la stessa del Sole
pointLight.scale.setScalar(10)
scene.add(pointLight);


const sun = new Star(1,camera);
scene.add(sun.mesh);

const planets = [];
const dateSpeed = [];

for (let i = 0; i < 4; i++) {
  const orbit = new Orbit(
    5 + 3 * i,
    Math.random() * 0.3 + 0.3,
    Math.PI * 0.15 * Math.random()
  );
  scene.add(orbit.ellipse);

  const planet = new Planet(i, orbit, 0.2 + Math.random() * 0.2);
  orbit.ellipse.add(planet.mesh);

  planets.push(planet);

  dateSpeed.push({ id: i, distance: orbit.getDistanceFocus() });
}

//PARTICELLE DI SFONDO
const particle = new Particles(5000);
scene.add(particle.getParticles());

// Funzione di rendering
const clock = new THREE.Clock();
function animate() {

  //tempo trascorso dall'inizio
  const time = clock.getElapsedTime();
  // Aggiorna gli Orbit Controls
  controls.update();

  sun.update();  // Aggiorna la posizione del bagliore in base alla telecamera

  particle.update(0.001);

  planets.forEach((planet) => {
    planet.update(time, dateSpeed);
  });



  // Renderizza la scena dal punto di vista della camera
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// Gestisci il resize della finestra
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Avvia l'animazione
animate();




