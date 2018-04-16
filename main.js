

let container,
    camera,
    scene,
    renderer,
    light,
    controls,
    water,
    island;

const width = window.innerWidth;
const height = window.innerHeight;

init();
animate();

function init() {
    container = document.getElementById('container');

    /** RENDERER */
    renderer = new THREE.WebGLRenderer({ antialias: true, shadows: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    /** SCENE */
    scene = new THREE.Scene();

    /** CAMERA */
    camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    camera.position.set(30, 30, 100);

    /** LIGHT */
    light = new THREE.DirectionalLight(0xffdddd, 0.8);

    /** WATER */
    const waterGeometry = new THREE.PlaneBufferGeometry(10000, 10000);
    const waterNormalMap = new THREE.TextureLoader().load(
        'assets/img/Water_Normals.png',
        function(texture) { 
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping; 
        }
    );
    const waterOptions = {
        textureWidth: 512,
        textureHeight: 512,
        // waterNormals: waterNormalMap,
        alpha: 0.7,
        sunDirection: light.position.clone().normalize(),
        sunColor: 0xffdddd,
        waterColor: 0x21BBE8,   // make this shit that DBZ blue
        distortionScale: 3.7,
        fog: scene.fog !== undefined
    };
    
    water = new THREE.Water(waterGeometry, waterOptions);
    water.rotation.x = - Math.PI / 2;

    /** SKYBOX */
    const sky = new THREE.Sky();
    sky.scale.setScalar(10000);

    const uniforms = sky.material.uniforms;
    uniforms.turbidity.value = 10;
    uniforms.rayleigh.value = 2;
    uniforms.luminance.value = 1;
    uniforms.mieCoefficient.value = 0.005;
    uniforms.mieDirectionalG.value = 0.8;

    const parameters = {
        distance: 400,
        inclination: 0.49,  // animate from 0.475 => 0.5
        azimuth: 0.205
    }

    const cubeCamera = new THREE.CubeCamera(1, 20000, 256);
    cubeCamera.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;

    function updateSun() {
        const theta = Math.PI * (parameters.inclination - 0.5);
        const phi = 2 * Math.PI * (parameters.azimuth - 0.5);

        light.position.x = parameters.distance * Math.cos(phi);
        light.position.y = parameters.distance * Math.sin(phi) * Math.sin(theta);
        light.position.z = parameters.distance * Math.sin(phi) * Math.cos(theta);

        sky.material.uniforms.sunPosition.value = light.position.copy(light.position);
        water.material.uniforms.sunDirection.value.copy(light.position).normalize();
        cubeCamera.update(renderer, scene);
    }

    updateSun();


    /** CONTROLS */

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set( 0, 25, 0 );
    controls.panningMode = THREE.HorizontalPanning;
    controls.minDistance = 40.0;
    controls.maxDistance = 200.0;
    camera.lookAt( controls.target );


    /** LOADERS */
    var loader = new THREE.ObjectLoader();

    /** Beach Sand */
    loader.load(
        "assets/objects/beachSand.json", 
        function ( obj ) { scene.add( obj ); },
        function ( xhr ) { console.log( (xhr.loaded / xhr.total * 100) + '% loaded' ); },
        function ( err ) { console.error( 'An error happened' ); }
    );

    /** Beach Grass */
    loader.load(
        "assets/objects/beachGrass.json", 
        function ( obj ) { scene.add( obj ); },
        function ( xhr ) { console.log( (xhr.loaded / xhr.total * 100) + '% loaded' ); },
        function ( err ) { console.error( 'An error happened' ); }
    );

    /** Kame House */
    loader.load(
        "assets/objects/kameHouse.json", 
        function ( obj ) { scene.add( obj ); },
        function ( xhr ) { console.log( (xhr.loaded / xhr.total * 100) + '% loaded' ); },
        function ( err ) { console.error( 'An error happened' ); }
    );

    /** Kame Roog */
    loader.load(
        "assets/objects/kameRoof.json", 
        function ( obj ) { scene.add( obj ); },
        function ( xhr ) { console.log( (xhr.loaded / xhr.total * 100) + '% loaded' ); },
        function ( err ) { console.error( 'An error happened' ); }
    );

    /** Kame Light */
    loader.load(
        "assets/objects/light2.json", 
        function ( obj ) { scene.add( obj ); },
        function ( xhr ) { console.log( (xhr.loaded / xhr.total * 100) + '% loaded' ); },
        function ( err ) { console.error( 'An error happened' ); }
    );
    
    
    
    /** ADD OBJECTS TO SCENE */
    scene.add(light);
    scene.add(water);
    scene.add(sky);

    /** EVENT LISTENER FOR RESIZE */
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {

    water.material.uniforms.time.value += 1.0 / 60.0;

    renderer.render(scene, camera);
}