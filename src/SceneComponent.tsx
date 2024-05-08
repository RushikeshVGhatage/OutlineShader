import { useEffect } from 'react';

import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders';
import * as GUI from '@babylonjs/gui';
import { Inspector } from '@babylonjs/inspector';

var canvas: HTMLCanvasElement;
var engine: BABYLON.Engine;
var scene: BABYLON.Scene;
var camera: BABYLON.ArcRotateCamera;

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

		engine = new BABYLON.Engine(
			canvas,
			true,
			{
				doNotHandleContextLost: true,
			},
			true,
		);
		console.log('Engine initialized succesfully');

		// let axis = new BABYLON.AxesViewer(scene, 100);
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
	scene = new BABYLON.Scene(engine);

	setupCamera();

	setupLight();

	// createGUI();

	// loadModel();

	loadPrimitive();
};

/****************************************
 * Sets up and configures the camera for the Babylon.js 3D scene.
 * @returns {void}
 ****************************************/
const setupCamera = () => {
	camera = new BABYLON.ArcRotateCamera(
		'Camera',
		0,
		Math.PI / 2.5,
		10,
		new BABYLON.Vector3(0, 0, 0),
		scene,
	);

	camera.attachControl(canvas, true);
};

/****************************************
 * Creates a GUI using BABYLON GUI
 * @returns {void}
 ****************************************/
const createGUI = () => {
	var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');

	var button = GUI.Button.CreateSimpleButton('btnClickHere', 'Click Here');
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
	var hemiLight = new BABYLON.HemisphericLight(
		'hemiLight',
		new BABYLON.Vector3(-1, 1, 0),
		scene,
	);

	hemiLight.intensity = 1.0;
};

/****************************************
 * Loads a 3D model into the Babylon.js 3D scene.
 * @returns {void}
 ****************************************/
const loadModel = () => {
	BABYLON.SceneLoader.ImportMesh(
		'',
		'/assets/',
		'RobotExpressive.glb',
		scene,
		(meshes, particleSystems, skeleton, animationGroups) => {
			let root = meshes[0];
			root.name = '__root__';

			animationGroups.forEach((value, index) => {
				animationGroups[index].stop();
			});

			animationGroups[12].play();

			root.rotate(new BABYLON.Vector3(0, 1, 0), Math.PI / 2);
			console.log('Model loaded successfully!');
		},
	);
};

/****************************************
 * Creates and loads primitive shapes into the Babylon.js 3D scene.
 * @returns {void}
 ****************************************/
const loadPrimitive = () => {
	var sphere = BABYLON.MeshBuilder.CreateSphere(
		'sphere',
		{
			diameter: 1,
			segments: 32,
		},
		scene,
	);

	sphere.position.y = 1;
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
