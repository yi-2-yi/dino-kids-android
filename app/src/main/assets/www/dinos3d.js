// Prehistoric Diorama Pedestals & Kid-Friendly Dinosaur Audio Synthesizer (Three.js r147)
(function (global) {
  'use strict';

  function createGroundTexture(baseHex, accentHex, speckleHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(256, 256, 30, 256, 256, 260);
    grad.addColorStop(0, accentHex);
    grad.addColorStop(0.75, baseHex);
    grad.addColorStop(1, speckleHex);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 1200; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = 1.5 + Math.random() * 5.5;
      ctx.fillStyle = i % 3 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(20,35,15,0.09)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function matEnv(color, roughness = 0.88, envIntensity = 0.25) {
    return new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness: 0.02,
      envMapIntensity: envIntensity,
    });
  }

  function createDiorama(type) {
    const group = new THREE.Group();

    if (type === 'ocean') {
      const seabedMat = new THREE.MeshStandardMaterial({
        map: createGroundTexture('#c2a56e', '#d6bc84', '#9e824d'),
        roughness: 0.92,
        envMapIntensity: 0.2,
      });
      const sand = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.25, 0.36, 48), seabedMat);
      sand.position.y = -0.34;
      sand.receiveShadow = true;
      group.add(sand);

      const waterMat = new THREE.MeshPhysicalMaterial({
        color: 0x1aa6c7,
        roughness: 0.18,
        metalness: 0.05,
        transparent: true,
        opacity: 0.48,
        envMapIntensity: 0.6,
      });
      const water = new THREE.Mesh(new THREE.CylinderGeometry(2.58, 2.48, 0.62, 48), waterMat);
      water.position.y = 0.14;
      group.add(water);

      const coralColors = [0xe85d50, 0xf29f38, 0xa855b8, 0x2cb5c0];
      for (let i = 0; i < 10; i++) {
        const ang = (i / 10) * Math.PI * 2 + 0.25;
        const dist = 1.68 + (i % 2) * 0.42;
        const cMat = matEnv(coralColors[i % coralColors.length], 0.72, 0.25);
        const coral = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16 + (i % 3) * 0.045, 1), cMat);
        coral.position.set(Math.cos(ang) * dist, -0.06, Math.sin(ang) * dist);
        coral.scale.set(0.75, 1.45, 0.75);
        group.add(coral);
      }

      const bubbleMat = new THREE.MeshStandardMaterial({
        color: 0xdff8ff,
        roughness: 0.1,
        transparent: true,
        opacity: 0.65,
      });
      const bubbles = [];
      for (let i = 0; i < 14; i++) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.04 + (i % 3) * 0.02, 10, 8), bubbleMat);
        b.position.set((Math.random() - 0.5) * 3.4, 0.1 + Math.random() * 1.4, (Math.random() - 0.5) * 3.4);
        b.userData = { baseY: b.position.y, speed: 0.35 + Math.random() * 0.45 };
        group.add(b);
        bubbles.push(b);
      }
      group.userData.update = (t) => {
        water.position.y = 0.14 + Math.sin(t * 2.0) * 0.02;
        bubbles.forEach((b) => {
          b.position.y = ((b.userData.baseY + t * b.userData.speed) % 1.8) + 0.06;
        });
      };
      return group;
    }

    // Rich earthy stone/soil base + lush mossy prehistoric grass top
    const soilMat = matEnv(0x6e4c2e, 0.94, 0.18);
    const dirt = new THREE.Mesh(new THREE.CylinderGeometry(2.52, 2.18, 0.44, 48), soilMat);
    dirt.position.y = -0.25;
    dirt.receiveShadow = true;
    group.add(dirt);

    const grassTex = type === 'cliff'
      ? createGroundTexture('#4e8244', '#639c52', '#3c6635')
      : createGroundTexture('#4f8f3d', '#6bab4c', '#3b702e');
    const grassMat = new THREE.MeshStandardMaterial({
      map: grassTex,
      roughness: 0.9,
      metalness: 0.01,
      envMapIntensity: 0.22,
    });
    const grass = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.53, 0.16, 48), grassMat);
    grass.position.y = -0.04;
    grass.receiveShadow = true;
    group.add(grass);

    if (type === 'river' || type === 'cliff') {
      const pool = new THREE.Mesh(
        new THREE.CylinderGeometry(1.18, 1.18, 0.04, 36),
        new THREE.MeshStandardMaterial({
          color: 0x25a9c4,
          roughness: 0.18,
          metalness: 0.08,
          transparent: true,
          opacity: 0.82,
          envMapIntensity: 0.55,
        })
      );
      pool.position.set(1.05, 0.045, 0.85);
      group.add(pool);
    }

    // Natural mossy slate boulders around the rim
    const rockMat = matEnv(0x6c736b, 0.9, 0.2);
    const rockDarkMat = matEnv(0x565c55, 0.92, 0.18);
    [
      [-1.82, 0.11, -1.05, 0.3, rockMat],
      [-1.46, 0.07, -1.42, 0.2, rockDarkMat],
      [1.72, 0.1, -1.18, 0.28, rockMat],
      [-1.72, 0.08, 1.18, 0.22, rockDarkMat],
    ].forEach(([x, y, z, r, m]) => {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 1), m);
      rock.scale.set(1.25, 0.68, 1.0);
      rock.position.set(x, y, z);
      rock.castShadow = true;
      rock.receiveShadow = true;
      group.add(rock);
    });

    // Lush prehistoric fern clusters around the outer edge
    const fernMat = matEnv(0x2d7a36, 0.78, 0.22);
    const fernLightMat = matEnv(0x439c44, 0.75, 0.22);
    const fernSpots = [
      [-1.92, 0.04, 0.42],
      [1.88, 0.04, -0.52],
      [-1.12, 0.04, -1.86],
      [1.22, 0.04, 1.62],
    ];
    fernSpots.forEach(([fx, fy, fz]) => {
      const tuft = new THREE.Group();
      tuft.position.set(fx, fy, fz);
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const frond = new THREE.Mesh(
          new THREE.SphereGeometry(0.13, 8, 6),
          i % 2 === 0 ? fernMat : fernLightMat
        );
        frond.scale.set(0.46, 0.12, 2.3);
        frond.position.set(Math.sin(ang) * 0.22, 0.14, Math.cos(ang) * 0.22);
        frond.rotation.y = ang;
        frond.rotation.x = -0.32;
        tuft.add(frond);
      }
      group.add(tuft);
    });

    // Subtle cheerful meadow wildflowers
    const flowerColors = [0xf2c94c, 0xf27d52, 0xb565d9, 0x56ccf2];
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2 + 0.35;
      const dist = 1.98 + (i % 2) * 0.32;
      const fl = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 8, 6),
        matEnv(flowerColors[i % flowerColors.length], 0.65, 0.2)
      );
      fl.position.set(Math.cos(ang) * dist, 0.075, Math.sin(ang) * dist);
      group.add(fl);
    }

    return group;
  }

  // Playful kid-friendly synthesized dinosaur sounds
  let audioCtx = null;
  function playDinoSound(id) {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtx) audioCtx = new Ctx();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';

      if (id === 'trex' || id === 'spinosaurus') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(155, now);
        osc.frequency.exponentialRampToValueAtTime(72, now + 0.55);
        filter.frequency.setValueAtTime(580, now);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      } else if (id === 'parasaurolophus') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(340, now + 0.2);
        osc.frequency.exponentialRampToValueAtTime(210, now + 0.65);
        filter.frequency.setValueAtTime(900, now);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.22, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      } else if (id === 'pteranodon' || id === 'velociraptor') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(680, now);
        osc.frequency.exponentialRampToValueAtTime(980, now + 0.12);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.35);
        filter.frequency.setValueAtTime(1800, now);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.16, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      } else if (id === 'plesiosaurus') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.22);
        osc.frequency.exponentialRampToValueAtTime(280, now + 0.5);
        filter.frequency.setValueAtTime(1200, now);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(185, now);
        osc.frequency.exponentialRampToValueAtTime(135, now + 0.45);
        filter.frequency.setValueAtTime(500, now);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      }

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.72);
    } catch (e) {
      // Ignore audio errors on restricted devices
    }
  }

  global.Dino3D = {
    createDiorama,
    playDinoSound,
  };
})(window);
