import { useEffect } from 'react';

import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders';
import * as GUI from '@babylonjs/gui';
import { Inspector } from '@babylonjs/inspector';
import {
	AbstractMesh,
	ArcRotateCamera,
	AxesViewer,
	Camera,
	Color3,
	Effect,
	Engine,
	HemisphericLight,
	Matrix,
	MeshBuilder,
	Scene,
	SceneLoader,
	ShaderMaterial,
	StandardMaterial,
	Vector3,
} from '@babylonjs/core';

let canvas: HTMLCanvasElement;
let engine: Engine;
let scene: Scene;
let camera: ArcRotateCamera;

let scaleFactor: number = 0.0;
let outlineColor: Color3 = Color3.Red();

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

	createGUI();

	loadPrimitive();

	loadModel();

	checkForMesh(scene, camera);
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

	var picker = new GUI.ColorPicker();
	picker.top = '-275px';
	picker.left = '800px';
	picker.height = '225px';
	picker.width = '225px';
	picker.onValueChangedObservable.add((value) => {
		outlineColor = value;
	});

	advancedTexture.addControl(picker);

	var slider = new GUI.Slider();
	slider.minimum = 0.0;
	slider.maximum = 0.2;
	slider.top = '-100px';
	slider.left = '800px';
	slider.value = 0;
	slider.height = '25px';
	slider.width = '225px';
	slider.onValueChangedObservable.add((value) => {
		scaleFactor = value;
	});
	slider.color = 'red';
	advancedTexture.addControl(slider);
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
			console.log('Model loaded successfully!', root);
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

export function checkForMesh(scene: Scene, camera: Camera): void {
	let hoveredMesh: AbstractMesh | null = null;
	let scaledMesh: AbstractMesh | null = null;

	// engine.setDepthFunction(engine._gl.ALWAYS);

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
			// If there is a previously scaled mesh, dispose of it
			if (scaledMesh) {
				scaledMesh.dispose();
				scaledMesh = null;
			}

			hoveredMesh = newHoveredMesh;

			if (hoveredMesh) {
				// Create a clone of the hovered mesh
				scaledMesh = hoveredMesh.clone(
					`${hoveredMesh.name}_scaled`,
					null,
				);

				if (scaledMesh) {
					// Apply scaling shader to the cloned mesh with the user-defined color
					scaleMeshWithShader(scaledMesh, scaleFactor, outlineColor);

					// Ensure the position, rotation, and scaling of the scaled mesh match the original
					scaledMesh.position = hoveredMesh.position.clone();
					scaledMesh.rotation = hoveredMesh.rotation.clone();
					// scaledMesh.scaling = new Vector3(1, 1, 1); // Reset scaling to 1 to only rely on the shader for scaling

					if (scaledMesh.material) {
						// scaledMesh.material.wireframe = true;
						scaledMesh.renderingGroupId = 1;
					}
				}
			}
		}
	};
}

function scaleMeshWithShader(
	mesh: AbstractMesh,
	scaleFactor: number,
	color: Color3,
) {
	// Vertex shader
	const vertexShader = `
    precision highp float;

    // Attributes
    attribute vec3 position;
    attribute vec3 normal;

    // Uniforms
    uniform mat4 worldViewProjection;
    uniform mat4 world;
    uniform float scalingFactor;

    // Varyings
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main(void) {
        vec3 scaledPosition = position + normal * vec3(scalingFactor) ;
        gl_Position = worldViewProjection * vec4(scaledPosition, 1.0);
        vPosition = vec3(world * vec4(position, 1.0));
        vNormal = mat3(world) * normal; // Transform the normal to world space
    }`;

	const fragmentShader = `
    precision highp float;

    // Varyings
    varying vec3 vNormal;
    varying vec3 vPosition;
		
    // Uniforms
    uniform vec3 cameraPosition;
    uniform vec3 color;
    uniform float scalingFactor;

    void main(void) {
        vec3 viewDirection = normalize(cameraPosition - vPosition);
        float dotProduct = dot(normalize(vNormal), viewDirection);

        if (dotProduct > (0.4 + scalingFactor)) {
			discard;
        } else {
			gl_FragColor = vec4(color, 1.0);
        }
    }`;

	// Register the shader
	Effect.ShadersStore['customScaleVertexShader'] = vertexShader;
	Effect.ShadersStore['customScaleFragmentShader'] = fragmentShader;

	// Create shader material
	const shaderMaterial = new ShaderMaterial(
		'shader',
		scene,
		{
			vertex: 'customScale',
			fragment: 'customScale',
		},
		{
			attributes: ['position', 'normal'],
			uniforms: [
				'worldViewProjection',
				'world',
				'cameraPosition',
				'scalingFactor',
				'color',
			],
		},
	);

	// Set the scaling factor and color uniforms
	shaderMaterial.setFloat('scalingFactor', scaleFactor);
	shaderMaterial.setColor3('color', color);

	// Set the camera position uniform dynamically
	scene.registerBeforeRender(() => {
		shaderMaterial.setVector3('cameraPosition', camera.position);
	});

	// Apply the shader material to the mesh
	mesh.material = shaderMaterial;
}

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
