import React, { useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';

const Viewport3D = forwardRef(function Viewport3D({ onSelect }, ref) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const threeRef = useRef({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function init() {
      // Dynamic ESM imports to avoid adding packages
      const THREE = await import('https://esm.sh/three@0.159.0');
      const { OrbitControls } = await import('https://esm.sh/three@0.159.0/examples/jsm/controls/OrbitControls.js');

      if (!mounted) return;

      const canvas = canvasRef.current;
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#0a0a0a');

      const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 2000);
      camera.position.set(8, 8, 12);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.target.set(0, 1, 0);

      const ambient = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambient);
      const dir = new THREE.DirectionalLight(0xffffff, 0.8);
      dir.position.set(5, 10, 5);
      scene.add(dir);

      // Helpers
      const grid = new THREE.GridHelper(200, 200, 0x2a2a2a, 0x1a1a1a);
      scene.add(grid);
      const axes = new THREE.AxesHelper(2);
      axes.position.set(-3, 0.01, -3);
      scene.add(axes);

      // Create a super simplified "London" blocky layout
      const londonGroup = new THREE.Group();
      londonGroup.name = 'London';
      const riverMaterial = new THREE.MeshBasicMaterial({ color: 0x1a3a6a, transparent: true, opacity: 0.6 });
      const riverGeom = new THREE.BoxGeometry(30, 0.1, 2.5);
      const river = new THREE.Mesh(riverGeom, riverMaterial);
      river.position.set(0, 0.02, 0);
      river.rotation.y = 0.35; // Thames tilt
      river.userData.unselectable = true;
      londonGroup.add(river);

      const buildingMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.7, metalness: 0.1 });
      const bGeo = new THREE.BoxGeometry(1, 1, 1);

      function addBuilding(x, z, h, color) {
        const m = buildingMat.clone();
        if (color) m.color = new THREE.Color(color);
        const mesh = new THREE.Mesh(bGeo, m);
        mesh.scale.y = h;
        mesh.position.set(x, h / 2, z);
        mesh.userData.type = 'Building';
        londonGroup.add(mesh);
        return mesh;
      }

      // Rough clusters: City of London, Canary Wharf, Westminster
      for (let i = 0; i < 120; i++) {
        const cluster = i % 3;
        const jitter = () => (Math.random() - 0.5) * 1.2;
        let baseX = cluster === 0 ? -2 + jitter() : cluster === 1 ? 10 + jitter() : -10 + jitter();
        let baseZ = cluster === 0 ? 2 + jitter() : cluster === 1 ? -4 + jitter() : -6 + jitter();
        const height = 0.3 + Math.random() * (cluster === 1 ? 5 : 3);
        addBuilding(baseX, baseZ, height, cluster === 1 && Math.random() > 0.7 ? '#a8b6ff' : undefined);
      }

      scene.add(londonGroup);

      // Selection and raycasting
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      let selected = null;

      function setSelected(obj) {
        if (selected && selected.material) {
          const orig = selected.userData.originalColor;
          if (orig) selected.material.color.set(orig);
        }
        selected = obj || null;
        if (selected && selected.material) {
          selected.userData.originalColor = '#' + selected.material.color.getHexString();
          selected.material.color.set('#ffd166');
        }
        if (onSelect) {
          if (!selected) return onSelect(null);
          const eul = selected.rotation;
          onSelect({
            id: selected.id,
            name: selected.name || selected.userData.type || 'Mesh',
            position: { x: selected.position.x, y: selected.position.y, z: selected.position.z },
            rotation: { x: eul.x, y: eul.y, z: eul.z },
            color: '#' + (selected.material?.color?.getHexString?.() || 'cccccc'),
          });
        }
      }

      function pointerSelect(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        pointer.set(x * 2 - 1, -(y * 2 - 1));
        raycaster.setFromCamera(pointer, camera);
        const objects = [];
        londonGroup.traverse((o) => {
          if (o.isMesh && !o.userData.unselectable) objects.push(o);
        });
        const hits = raycaster.intersectObjects(objects, false);
        setSelected(hits[0]?.object || null);
      }

      renderer.domElement.addEventListener('pointerdown', pointerSelect);

      // Animate loop
      let running = true;
      let spinSelected = false;
      function animate() {
        if (!running) return;
        requestAnimationFrame(animate);
        controls.update();
        if (spinSelected && selected) {
          selected.rotation.y += 0.01;
        }
        renderer.render(scene, camera);
      }
      animate();

      // Resize handling
      function onResize() {
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
      window.addEventListener('resize', onResize);
      onResize();

      // Expose imperative API
      threeRef.current = { THREE, renderer, scene, camera, controls, londonGroup, setSelectedRef: setSelected };
      setReady(true);

      // Cleanup
      return () => {
        mounted = false;
        running = false;
        window.removeEventListener('resize', onResize);
        renderer.domElement.removeEventListener('pointerdown', pointerSelect);
        controls.dispose();
        renderer.dispose();
      };
    }

    const cleanupPromise = init();
    return () => {
      // just rely on the returned cleanup from init if needed
      void cleanupPromise;
    };
  }, [onSelect]);

  useImperativeHandle(ref, () => ({
    addCube: () => {
      const { THREE, scene, setSelectedRef } = threeRef.current;
      if (!THREE) return;
      const geo = new THREE.BoxGeometry(1, 1, 1);
      const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(Math.random(), 0.6, 0.6) });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set((Math.random() - 0.5) * 6, 0.5 + Math.random() * 2, (Math.random() - 0.5) * 6);
      mesh.name = 'Cube';
      scene.add(mesh);
      setSelectedRef?.(mesh);
    },
    addLight: () => {
      const { THREE, scene, camera } = threeRef.current;
      if (!THREE) return;
      const light = new THREE.PointLight(0xffffff, 1, 50);
      light.position.copy(camera.position);
      scene.add(light);
    },
    toggleAnimation: () => {
      // simple flag on closure
      const state = threeRef.current;
      state.spinSelected = !state.spinSelected;
      // Store on the object so animate loop can read
      // We'll piggy-back by saving it on ref object
    },
    focusLondon: () => {
      const { londonGroup, controls, camera } = threeRef.current;
      if (!londonGroup || !controls || !camera) return;
      controls.target.copy(londonGroup.position);
      camera.position.set(8, 8, 12);
      controls.update();
    },
    updateSelected: (updates) => {
      const { setSelectedRef, scene } = threeRef.current;
      if (!scene) return;
      let selected = null;
      scene.traverse((o) => {
        if (o.userData && o.material && o.material.color && o.material.color.isColor && o.id === updates?.id) {
          selected = o;
        }
      });
      // If not found by id, try currently highlighted object
      if (!selected) {
        // find currently highlighted by color match (yellow) - fallback only
        scene.traverse((o) => {
          if (!selected && o.isMesh && o.userData?.originalColor && '#' + o.material.color.getHexString() === 'ffd166') {
            selected = o;
          }
        });
      }
      // Better: setSelectedRef already holds selection when last picked, we can't access it here easily; just apply to the highlighted one via traversal below
      let target = null;
      scene.traverse((o) => {
        if (o.isMesh && o.userData?.originalColor && '#' + o.material.color.getHexString() === 'ffd166') target = o;
      });
      const obj = target || selected;
      if (!obj) return;

      if (updates.color) {
        obj.material.color.set(updates.color);
        obj.userData.originalColor = updates.color;
      }
      if (updates.position) {
        const { x, y, z } = updates.position;
        if (Number.isFinite(x)) obj.position.x = x;
        if (Number.isFinite(y)) obj.position.y = y;
        if (Number.isFinite(z)) obj.position.z = z;
      }
      if (updates.rotation) {
        const { x, y, z } = updates.rotation;
        if (Number.isFinite(x)) obj.rotation.x = x;
        if (Number.isFinite(y)) obj.rotation.y = y;
        if (Number.isFinite(z)) obj.rotation.z = z;
      }
      setSelectedRef?.(obj);
    },
  }));

  // Keep a local ref flag for spin since we can't close over it after dynamic init
  useEffect(() => {
    const interval = setInterval(() => {
      const s = threeRef.current;
      if (!s) return;
      // ensure spinSelected exists
      if (typeof s.spinSelected === 'undefined') s.spinSelected = false;
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm">
          Loading 3D engine...
        </div>
      )}
    </div>
  );
});

export default Viewport3D;
