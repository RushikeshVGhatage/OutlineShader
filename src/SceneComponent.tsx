import { useEffect } from 'react';

import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders';
import * as GUI from '@babylonjs/gui';
import { Inspector } from '@babylonjs/inspector';
import {
	AbstractMesh,
	ArcRotateCamera,
	AxesViewer,
	Color3,
	Engine,
	HemisphericLight,
	Matrix,
	MeshBuilder,
	Nullable,
	Scene,
	SceneLoader,
	StandardMaterial,
	Vector3,
} from '@babylonjs/core';

let canvas: HTMLCanvasElement;
let engine: Engine;
let scene: Scene;
let camera: ArcRotateCamera;
let hoveredMesh: Nullable<AbstractMesh> = null;

//state
// interface IState {

// }

// props
// interface IProps {

// }

/****************************************
 * Functional React component representing a 3D scene using Babylon.js.
 ****************************************/
export default function SceneComponent() {
	const initialize = () => {
		// console.clear();

		canvas = document.getElementById('canvas') as HTMLCanvasElement;
		console.log('Canvas created successfully');

		engine = new Engine(
			canvas,
			true,
			{
				doNotHandleContextLost: true,
			},
			true,
		);
		console.log('Engine initialized succesfully');

		// let axis = new AxesViewer(scene, 100);
		// console.log(axis);

		document.addEventListener('keydown', (event) => {
			keyDown(event);
		});

		document.addEventListener('keyup', (event) => {
			keyUp(event);
		});

		window.addEventListener('resize', () => {
			engine.resize(true);
		});

		createScene();
		renderLoop();
	};

	useEffect(() => {
		initialize();
	}, []);

	return (
		<div className='App'>
			<canvas id='canvas' />
		</div>
	);
}

/****************************************
 * Handles the keydown event for a specific functionality.
 * @param {KeyboardEvent} event - The KeyboardEvent object representing the keydown event.
 * @returns {void}
 ****************************************/
const keyDown = (event: KeyboardEvent): void => {
	switch (event.key) {
		case 'E':
		case 'e':
			break;

		case 'G':
		case 'g':
			Inspector.Show(scene, { enablePopup: true });
			break;
	}
};

/****************************************
 * Handles the keyup event for a specific functionality.
 * @param {KeyboardEvent} event - The KeyboardEvent object representing the keyup event.
 * @returns {void}
 ****************************************/
const keyUp = (event: KeyboardEvent): void => {
	switch (event.key) {
		case 'E':
		case 'e':
			console.log('E key is Pressed!');
			break;
	}
};

/****************************************
 * Creates and initializes a 3D scene using the Babylon.js framework.
 * @returns {void}
 ****************************************/
const createScene = (): void => {
	scene = new Scene(engine);

	setupCamera();

	setupLight();

	// createGUI();

	loadModel();

	loadPrimitive();

	checkForMesh();
};

/****************************************
 * Sets up and configures the camera for the Babylon.js 3D scene.
 * @returns {void}
 ****************************************/
const setupCamera = () => {
	camera = new ArcRotateCamera(
		'Camera',
		0,
		Math.PI / 2.5,
		10,
		new Vector3(0, 0, 0),
		scene,
	);

	camera.attachControl(canvas, true);
};

/****************************************
 * Creates a GUI using BABYLON GUI
 * @returns {void}
 ****************************************/
const createGUI = () => {
	let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');

	let button = GUI.Button.CreateSimpleButton('btnClickHere', 'Click Here');
	button.width = 0.15;
	button.height = 0.075;
	button.top = '300px';
	button.color = 'white';
	button.background = 'green';
	button.cornerRadius = 10;
	button.fontSize = 40;
	// advancedTexture.addControl(button);

	button.onPointerDownObservable.add(() => {
		console.log('CLICKED');
	});
};

/****************************************
 * Sets up and configures lighting for the Babylon.js 3D scene.
 * @returns {void}
 ****************************************/
const setupLight = () => {
	let hemiLight = new HemisphericLight(
		'hemiLight',
		new Vector3(-1, 1, 0),
		scene,
	);

	hemiLight.intensity = 1.0;
};

/****************************************
 * Loads a 3D model into the Babylon.js 3D scene.
 * @returns {void}
 ****************************************/
const loadModel = () => {
	SceneLoader.ImportMesh(
		'',
		'/assets/',
		'StanfordBunny.obj',
		scene,
		(meshes) => {
			let root = meshes[0];

			root.position = new Vector3(0, -1, 0);
			console.log('Model loaded successfully!');
		},
	);
};

/****************************************
 * Creates and loads primitive shapes into the Babylon.js 3D scene.
 * @returns {void}
 ****************************************/
const loadPrimitive = () => {
	const numberOfSpheres = 5;
	const minPos = -1.0;
	const maxPos = 1.0;
	const minRadius = 0.75;
	const maxRadius = 1.0;

	for (let i = 0; i < numberOfSpheres; i++) {
		const x = getRandomInRange(minPos, maxPos);
		const y = getRandomInRange(minPos, maxPos);
		const z = getRandomInRange(minPos, maxPos);
		const diameter = getRandomInRange(minRadius, maxRadius) * 2;

		// Generate random color
		const color = new Color3(
			getRandomInRange(0, 1), // Red
			getRandomInRange(0, 1), // Green
			getRandomInRange(0, 1), // Blue
		);

		// Create sphere
		const sphere = MeshBuilder.CreateSphere(
			`sphere${i}`,
			{ diameter },
			scene,
		);

		sphere.position = new Vector3(x, y, z);

		// Apply color to material
		const material = new StandardMaterial(`material${i}`, scene);
		material.diffuseColor = color;
		sphere.material = material;
	}
};

const checkForMesh = () => {
	scene.onPointerMove = () => {
		let ray = scene.createPickingRay(
			scene.pointerX,
			scene.pointerY,
			Matrix.Identity(),
			camera,
			false,
		);

		let hit = scene.pickWithRay(ray);

		let newHoveredMesh = hit?.pickedMesh || null;

		if (newHoveredMesh !== hoveredMesh) {
			hoveredMesh = newHoveredMesh;
			// Apply outline effect here or trigger outline update
			applyOutlineEffect();
		}
	};
};

const applyOutlineEffect = () => {
	// Load outline shader
	BABYLON.Effect.ShadersStore['outlineShaderVertex'] = `
        precision highp float;
        attribute vec3 position;
        uniform mat4 worldViewProjection;
        void main(void) {
            gl_Position = worldViewProjection * vec4(position, 1.0);
        }
    `;

	BABYLON.Effect.ShadersStore['outlineShaderFragment'] = `
        precision highp float;
        void main(void) {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Red outline for now
        }
    `;

	// Create outline material
	var outlineMaterial = new BABYLON.ShaderMaterial('outlineShader', scene, {
		vertex: 'outlineShaderVertex',
		fragment: 'outlineShaderFragment',
	});

	// Apply outline material to the hovered mesh
	if (hoveredMesh) {
		hoveredMesh.material = outlineMaterial;
	}
};

/****************************************
 * Returns random number within given ranger
 * @returns {void}
 ****************************************/
const getRandomInRange = (min: number, max: number): number => {
	return Math.random() * (max - min) + min;
};

/****************************************
 * Initiates the rendering loop for continuous updates and rendering of the Babylon.js scene.
 * @returns {void}
 ****************************************/
const renderLoop = () => {
	engine.runRenderLoop(() => {
		scene.render();
	});
};
