/* =========================================================
   LIGHTBOX & GALLERY HANDLERS
========================================================= */

let currentImageIndex = 0; 
const images = document.querySelectorAll('.thumbnail'); 
  
function openLightbox(imageSrc) { 
    const lightbox = document.getElementById('lightbox'); 
    const lightboxImage = document.getElementById('lightboxImage'); 
    
    if (lightbox && lightboxImage) {
        if (imageSrc) {
            lightboxImage.src = imageSrc;
        } else if (images.length > 0) {
            lightboxImage.src = images[currentImageIndex].src;
        }
        lightbox.style.display = 'block'; 
        
        const header = document.querySelector('header');
        const nav = document.querySelector('nav');
        if (header) header.style.display = 'none'; 
        if (nav) nav.style.display = 'none'; 
    }
} 
  
function closeLightbox() { 
    const lightbox = document.getElementById('lightbox'); 
    if (lightbox) {
        lightbox.style.display = 'none'; 
        
        const header = document.querySelector('header');
        const nav = document.querySelector('nav');
        if (header) header.style.display = 'flex'; 
        if (nav) nav.style.display = 'block'; 
    }
} 
  
function showImage(index) { 
    currentImageIndex = index; 
    const lightboxImg = document.getElementById('lightboxImage');
    if (lightboxImg && images[currentImageIndex]) {
        lightboxImg.src = images[currentImageIndex].src; 
    }
} 
  
function changeImage(direction) { 
    currentImageIndex += direction; 
     
    if (currentImageIndex < 0) { 
        currentImageIndex = images.length - 1; 
    } else if (currentImageIndex >= images.length) { 
        currentImageIndex = 0; 
    } 
     
    showImage(currentImageIndex); 
} 
  
images.forEach((img, index) => { 
    img.addEventListener('click', () => {
        showImage(index);
        openLightbox();
    }); 
}); 

/* =========================================================
   IMAGE SLIDER FUNCTIONALITY
========================================================= */

const slides = document.querySelector('.slides'); 
const slideElements = document.querySelectorAll('.slide');
const totalSlides = slideElements ? slideElements.length : 0;
let index = 0; 
let slideInterval = null;

if (slides && totalSlides > 0) {
    slideInterval = setInterval(showNextSlide, 3000);
}

function updateSlidePosition() {
    if (slides) {
        slides.style.transform = 'translateX(' + (-index * 100) + '%)'; 
    }
}

function showNextSlide() { 
    index = (index + 1) % totalSlides; 
    updateSlidePosition();
} 

function changeSlide(direction) {
    if (slideInterval) clearInterval(slideInterval);
    
    index += direction;
    if (index < 0) {
        index = totalSlides - 1;
    } else if (index >= totalSlides) {
        index = 0;
    }
    
    updateSlidePosition();
    if (totalSlides > 0) {
        slideInterval = setInterval(showNextSlide, 3000);
    }
}

/* =========================================================
   AUTHENTICATION & NAVIGATION UTILITIES
========================================================= */

function confirmLogout() { 
    const confirmLogout = confirm("Are you sure you want to log out?"); 
    if (confirmLogout) { 
        localStorage.removeItem('isLoggedIn'); 
        window.location.href = 'Login.html'; 
    } 
} 

/* =========================================================
   THREE.JS REAL-TIME DYNAMIC WAVY CANVAS BACKGROUND
========================================================= */

const canvas = document.getElementById('bg-canvas');
if (canvas && typeof THREE !== 'undefined') {
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform vec2 uResolution;
      varying vec2 vUv;

      vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
      float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ) );
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m; m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.x, uResolution.y);
        float t = uTime * 0.12;

        float n1 = snoise(uv * 2.2 + vec2(t * 0.2, t * 0.15));
        float n2 = snoise(uv * 4.5 - vec2(t * 0.3, n1 * 0.8));
        float wave = snoise(uv * 3.0 + vec2(n1, n2) * 1.2);

        float h = sin(wave * 6.28 + t);
        float shadow = smoothstep(-0.8, 0.8, h);
        
        vec3 baseColor = vec3(0.92, 0.93, 0.95);
        vec3 shadowColor = vec3(0.68, 0.70, 0.75);
        vec3 highlightColor = vec3(1.0, 1.0, 1.0);

        vec3 finalColor = mix(shadowColor, baseColor, shadow);
        finalColor = mix(finalColor, highlightColor, pow(max(0.0, h), 3.0) * 0.5);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    };

    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms });
    const geometry = new THREE.PlaneGeometry(2, 2);
    scene.add(new THREE.Mesh(geometry, material));

    window.addEventListener('resize', () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    });

    function animate(time) {
      uniforms.uTime.value = time * 0.001;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}

/* =========================================================
   THREE.JS 3D SLIDER CANVAS BACKGROUND ANIMATIONS
========================================================= */

if (typeof THREE !== 'undefined') {

    /* --- SLIDE 1: Floating 3D Cubes (Fixed Around Headline) --- */
    const initSlide1 = () => {
        const canvas = document.getElementById('slide-canvas-1');
        if (!canvas) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

        const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        camera.position.z = 16;

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const group = new THREE.Group();
        scene.add(group);

        const geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);
        const material = new THREE.MeshBasicMaterial({
            color: 0x04cddb,
            wireframe: true
        });

        const cubes = [];
        const boxCount = 17;

        for (let i = 0; i < boxCount; i++) {
            const cube = new THREE.Mesh(geometry, material);
            const scale = 0.6 + Math.random() * 0.8;
            cube.scale.set(scale, scale, scale);

            // Bounds for the headline card exclusion area
            const cardWidth = 14; 
            const cardHeight = 7; 

            let posX, posY;
            
            // Randomly position cubes around the periphery of the center card
            if (Math.random() > 0.5) {
                // Position to the left or right side
                posX = (Math.random() > 0.5 ? 1 : -1) * (cardWidth / 2 + Math.random() * 6);
                posY = (Math.random() - 0.5) * 14;
            } else {
                // Position above or below
                posX = (Math.random() - 0.5) * 26;
                posY = (Math.random() > 0.5 ? 1 : -1) * (cardHeight / 2 + Math.random() * 4);
            }

            cube.position.set(
                posX,
                posY,
                (Math.random() - 0.5) * 6
            );

            cube.userData = {
                rotSpeedX: (Math.random() - 0.5) * 0.015,
                rotSpeedY: (Math.random() - 0.5) * 0.015,
                rotSpeedZ: (Math.random() - 0.5) * 0.01
            };
            cubes.push(cube);
            group.add(cube);
        }

        function animate() {
            requestAnimationFrame(animate);
            if (index === 0) {
                cubes.forEach(c => {
                    c.rotation.x += c.userData.rotSpeedX;
                    c.rotation.y += c.userData.rotSpeedY;
                    c.rotation.z += c.userData.rotSpeedZ;
                });
                renderer.render(scene, camera);
            }
        }
        animate();
    };

    /* --- SLIDE 2: Dynamic Node Network (Increased Particle Count) --- */
    const initSlide2 = () => {
        const canvas = document.getElementById('slide-canvas-2');
        if (!canvas) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

        const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        camera.position.z = 20;

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const particleCount = 70; // Increased particle count
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 30;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
            velocities.push({
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const pMaterial = new THREE.PointsMaterial({ color: 0x04cddb, size: 0.4 });
        const particles = new THREE.Points(geometry, pMaterial);
        scene.add(particles);

        function animate() {
            requestAnimationFrame(animate);
            if (index === 1) {
                const pos = particles.geometry.attributes.position.array;

                for (let i = 0; i < particleCount; i++) {
                    pos[i * 3] += velocities[i].x;
                    pos[i * 3 + 1] += velocities[i].y;

                    if (pos[i * 3] < -15 || pos[i * 3] > 15) velocities[i].x *= -1;
                    if (pos[i * 3 + 1] < -9 || pos[i * 3 + 1] > 9) velocities[i].y *= -1;
                }
                particles.geometry.attributes.position.needsUpdate = true;
                renderer.render(scene, camera);
            }
        }
        animate();
    };

    /* --- SLIDE 3: Dynamic 3D Cyber Wave Particle Terrain --- */
    const initSlide3 = () => {
        const canvas = document.getElementById('slide-canvas-3');
        if (!canvas) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

        const camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        camera.position.set(0, 12, 22);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const amountX = 45;
        const amountY = 30;
        const separation = 1.2;
        const numParticles = amountX * amountY;

        const positions = new Float32Array(numParticles * 3);
        const scales = new Float32Array(numParticles);

        let i = 0, j = 0;
        for (let ix = 0; ix < amountX; ix++) {
            for (let iy = 0; iy < amountY; iy++) {
                positions[i] = (ix * separation) - ((amountX * separation) / 2);
                positions[i + 1] = 0;
                positions[i + 2] = (iy * separation) - ((amountY * separation) / 2);
                scales[j] = 1;
                i += 3;
                j++;
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

        const material = new THREE.PointsMaterial({
            color: 0x000080,
            size: 0.35,
            transparent: true,
            opacity: 0.85
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        let count = 0;

        function animate() {
            requestAnimationFrame(animate);
            if (index === 2) {
                const pos = particles.geometry.attributes.position.array;
                let particleIdx = 0;

                for (let ix = 0; ix < amountX; ix++) {
                    for (let iy = 0; iy < amountY; iy++) {
                        pos[particleIdx + 1] = (Math.sin((ix + count) * 0.3) * 1.8) + (Math.cos((iy + count) * 0.5) * 1.8);
                        particleIdx += 3;
                    }
                }

                particles.geometry.attributes.position.needsUpdate = true;
                count += 0.04;

                renderer.render(scene, camera);
            }
        }
        animate();
    };

    document.addEventListener('DOMContentLoaded', () => {
        initSlide1();
        initSlide2();
        initSlide3();
    });
}
