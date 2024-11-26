import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import "./style.css";

class Homepage3D {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.scale.setScalar(1)
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 2);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; // Effetto di smorzamento per un movimento più fluido
    this.controls.dampingFactor = 0.05;
    this.controls.enabled = false; // Disabilita completamente gli OrbitControls

    this.spotLight = new THREE.SpotLight(0xffffff, 200, 10, 3);
    this.spotLight.position.set(0, 5, 5);
    this.scene.add(this.spotLight);

    this.spotLight2 = new THREE.SpotLight(0xffffff, 7, 10, 3);
    this.spotLight2.position.set(0, -5, 0);
    this.scene.add(this.spotLight2);

    this.trottola = null;
    this.raycaster = new THREE.Raycaster(); // Raycaster per il calcolo della posizione del clic
    this.mouse = new THREE.Vector2(); // Variabile per memorizzare la posizione del mouse
    this.targetAngle = null; // Inizialmente l'angolo è nullo
    this.cameraTargetAngle = null;

    window.addEventListener("resize", () => {
      this.onWindowResize();
    });

    window.addEventListener("click", (event) => {
      this.onClick(event); // Gestisce il clic
    });

    this.animate();
  }

  load3DModel(path) {
    this.gltfLoader = new GLTFLoader();
    this.materialParams = {
      color: 0x595959,
      reflectivity: 2,
      roughness: 0.34,
      metalness: 0.98,
    };

    this.gltfLoader.load(
      path,
      (gltf) => {
        const model = gltf.scene;
        model.position.set(-4, -1, 0);

        model.traverse((node) => {
          this.trottolaContainer = model;

          model.traverse((node) => {
            if (node.isMesh && node.name === "Trottola") {
              this.trottola = node;
            }
          });

          if (node.isMesh) {
            const material = node.material;
            material.reflectivity = this.materialParams.reflectivity;
            material.roughness = this.materialParams.roughness;
            material.metalness = this.materialParams.metalness
            material.color = new THREE.Color(this.materialParams.color); // Verde per il test
          }
        });

        this.scene.add(model);
      },
      undefined,
      (error) => {
        console.error("Errore durante il caricamento del modello:", error);
      }
    );
  }

  centerGeometry(geometry) {
    geometry.computeBoundingBox();
    const boundingBox = geometry.boundingBox;
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);
    geometry.translate(-center.x, -center.y, -center.z);
    return geometry;
  }

  addText(text, position) {
    const fontLoader = new FontLoader();
    fontLoader.load("font/Nebula_Regular.json", (font) => {
      const textGeometry = new TextGeometry(text, {
        font: font,
        size: 0.6,
        height: 0.01,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.01,
        bevelOffset: 0,
        bevelSegments: 5,
      });

      this.centerGeometry(textGeometry);

      const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);

      textMesh.position.set(position.x, position.y, position.z);

      this.scene.add(textMesh);
    });
  }

  onClick(event) {
    console.log("cliccato");

    // Calcola la posizione del mouse nel sistema di coordinate normalizzate (-1 a 1)
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1; // mappa la posizione X del mouse tra -1 e 1
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1; // mappa la posizione Y del mouse tra -1 e 1

    // Mappa la posizione orizzontale del mouse (this.mouse.x) in un angolo tra -PI e PI
    const angle = (this.mouse.x * Math.PI) / 10; // moltiplica per Math.PI per ottenere un angolo in radianti
    /* const angleCamera = (this.mouse.x * Math.PI) / 40; ANGOLO MOVIMENTO CAMERA */

    // Memorizza l'angolo di destinazione per la rotazione della trottola
    this.targetAngle = -angle;

    /* Memorizza l'angolo di destinazione per la rotazione della camera
    this.cameraTargetAngle = angleCamera; // Questo angolo controlla la rotazione della camera*/
  }

  initGUI() {
    const gui = new dat.GUI();

    // Controlli per la trottola
    const materialFolder = gui.addFolder("Trottola Material");

    materialFolder.addColor(this.materialParams, "color").onChange((value) => {
      if (this.trottola) {
        this.trottola.material.color.set(value);
      }
    });

    materialFolder
      .add(this.materialParams, "reflectivity", 0, 10)
      .onChange((value) => {
        if (this.trottola) {
          this.trottola.material.reflectivity = value;
        }
      });

    materialFolder.add(this.materialParams, "roughness", 0, 1).onChange((value) => {
      if (this.trottola) {
        this.trottola.material.roughness = value;
      }
    });

    materialFolder.add(this.materialParams, "metalness", 0, 1).onChange((value) => {
      if (this.trottola) {
        this.trottola.material.metalness = value;
      }
    });

    materialFolder.open();
  }

  animate() {

    if (this.trottola) {
      // Puoi aggiungere altre rotazioni o animazioni alla trottola
      this.trottola.rotation.z += 0.03;
    }

    // Se la trottola è presente e l'angolo di destinazione è definito
    if (this.trottola && this.targetAngle !== null) {
      // Interpola la rotazione lentamente (usando un fattore di smorzamento)
      const smoothingFactor = 0.03; // Controlla la velocità dell'animazione
      this.trottola.rotation.y +=
        (this.targetAngle - this.trottola.rotation.y) * smoothingFactor;
    }

    /* 
    // Se la camera è presente e l'angolo di destinazione è definito
    if (this.cameraTargetAngle !== undefined) {
      // Interpola la rotazione della camera lungo l'asse Y lentamente
      const smoothingFactor = 0.05; // Controlla la velocità dell'animazione
      this.camera.rotation.y +=
        (this.cameraTargetAngle - this.camera.rotation.y) * smoothingFactor;

      
      // Se desideri far muovere la camera lungo un percorso circolare (esempio, una vista orbitale)
      const radius = 2; // Distanza tra la camera e l'oggetto centrale
      this.camera.position.x = radius * Math.sin(this.camera.rotation.y);
      this.camera.position.z = radius * Math.cos(this.camera.rotation.y);
    }
*/
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }

  onWindowResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }
}

const Homepage = new Homepage3D();
Homepage.load3DModel("./src/3dModel/Origin.glb");
Homepage.addText("EQUILIBRIUM", { x: 0, y: 0, z: -1 });
/*Homepage.initGUI() //ATTIVARE SOLO IN CAO SI VUOLE VEDERE LA GUI PER MODIFICARE I PARAMETRI DELLA TEXTURE*/