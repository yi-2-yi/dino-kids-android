// Sculpted Pixar-storybook style 3D Dinosaur Builder for Kids (Three.js r147)
(function (global) {
  'use strict';

  const textureCache = {};

  function createSkinTexture(key, baseHex, patternHex, patternType) {
    if (textureCache[key]) return textureCache[key];
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, 512, 512);

    // Subtle organic scale grain
    for (let i = 0; i < 650; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = 3 + Math.random() * 7;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (patternType === 'stripes') {
      ctx.fillStyle = patternHex;
      ctx.globalAlpha = 0.72;
      for (let i = 0; i < 9; i++) {
        const x = i * 58 + 10;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.quadraticCurveTo(x + 26, 256, x - 8, 512);
        ctx.lineTo(x + 18, 512);
        ctx.quadraticCurveTo(x + 48, 256, x + 24, 0);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
    } else if (patternType === 'spots') {
      ctx.fillStyle = patternHex;
      ctx.globalAlpha = 0.78;
      for (let i = 0; i < 55; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const rx = 10 + Math.random() * 24;
        const ry = 8 + Math.random() * 18;
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
    } else if (patternType === 'sail') {
      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0.0, '#ff6b2b');
      grad.addColorStop(0.35, '#ffb830');
      grad.addColorStop(0.62, '#4cc9c8');
      grad.addColorStop(0.85, '#ff8e3c');
      grad.addColorStop(1.0, '#2b8f80');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = 'rgba(130, 45, 10, 0.35)';
      ctx.lineWidth = 8;
      for (let x = 20; x < 512; x += 36) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }
    } else if (patternType === 'frill') {
      const grad = ctx.createRadialGradient(256, 360, 40, 256, 256, 260);
      grad.addColorStop(0.0, '#e3833e');
      grad.addColorStop(0.5, '#f2b84b');
      grad.addColorStop(0.8, '#38b5c9');
      grad.addColorStop(1.0, '#d95b38');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);
      // Decorative kid-friendly eye spots on frill
      const spots = [
        [150, 170], [362, 170], [256, 120]
      ];
      spots.forEach(([sx, sy]) => {
        ctx.fillStyle = '#ffe066';
        ctx.beginPath();
        ctx.arc(sx, sy, 48, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e85d3f';
        ctx.beginPath();
        ctx.arc(sx, sy, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#26a6b5';
        ctx.beginPath();
        ctx.arc(sx, sy, 14, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (patternType === 'wing') {
      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, '#f4b350');
      grad.addColorStop(0.5, '#ef7358');
      grad.addColorStop(1, '#d9534f');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = 'rgba(255, 224, 120, 0.55)';
      for (let i = 0; i < 16; i++) {
        ctx.beginPath();
        ctx.ellipse(60 + i * 30, 180 + Math.sin(i) * 90, 24, 14, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.encoding = THREE.sRGBEncoding;
    textureCache[key] = tex;
    return tex;
  }

  function matSkin(key, baseHex, patternHex, patternType, roughness = 0.62) {
    return new THREE.MeshStandardMaterial({
      map: createSkinTexture(key, baseHex, patternHex, patternType),
      roughness,
      metalness: 0.04,
    });
  }

  function matSolid(color, roughness = 0.58, metalness = 0.05) {
    return new THREE.MeshStandardMaterial({ color, roughness, metalness });
  }

  // Smooth variable-radius organic tube along a CatmullRomCurve3
  function createOrganicTube(points, radiusFn, tubularSegs, radialSegs, material) {
    const curve = new THREE.CatmullRomCurve3(points);
    const frames = curve.computeFrenetFrames(tubularSegs, false);
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    for (let i = 0; i <= tubularSegs; i++) {
      const u = i / tubularSegs;
      const p = curve.getPointAt(u);
      const N = frames.normals[i];
      const B = frames.binormals[i];
      const rVal = radiusFn(u);
      const rx = typeof rVal === 'number' ? rVal : rVal[0];
      const ry = typeof rVal === 'number' ? rVal : rVal[1];

      for (let j = 0; j <= radialSegs; j++) {
        const v = (j / radialSegs) * Math.PI * 2;
        const sin = Math.sin(v);
        const cos = -Math.cos(v);

        const nx = cos * N.x + sin * B.x;
        const ny = cos * N.y + sin * B.y;
        const nz = cos * N.z + sin * B.z;

        const vx = p.x + rx * cos * N.x + ry * sin * B.x;
        const vy = p.y + rx * cos * N.y + ry * sin * B.y;
        const vz = p.z + rx * cos * N.z + ry * sin * B.z;

        positions.push(vx, vy, vz);
        const len = Math.hypot(nx, ny, nz) || 1;
        normals.push(nx / len, ny / len, nz / len);
        uvs.push(u * 2, j / radialSegs);
      }
    }

    const row = radialSegs + 1;
    for (let i = 0; i < tubularSegs; i++) {
      for (let j = 0; j < radialSegs; j++) {
        const a = i * row + j;
        const b = (i + 1) * row + j;
        const c = (i + 1) * row + (j + 1);
        const d = i * row + (j + 1);
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    const mesh = new THREE.Mesh(geom, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  function addCuteEyes(parent, xHalf, y, z, radius, irisColor = 0xb86b1b) {
    const scleraMat = matSolid(0xffffff, 0.25, 0.05);
    const irisMat = matSolid(irisColor, 0.2, 0.08);
    const pupilMat = matSolid(0x161210, 0.1, 0.2);
    const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    [-1, 1].forEach((side) => {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(side * xHalf, y, z);

      const sclera = new THREE.Mesh(new THREE.SphereGeometry(radius, 18, 16), scleraMat);
      eyeGroup.add(sclera);

      const iris = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.72, 16, 14), irisMat);
      iris.position.set(side * radius * 0.28, 0, radius * 0.34);
      eyeGroup.add(iris);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.45, 14, 12), pupilMat);
      pupil.position.set(side * radius * 0.42, 0, radius * 0.56);
      eyeGroup.add(pupil);

      const glint = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.18, 10, 10), glintMat);
      glint.position.set(side * radius * 0.52, radius * 0.26, radius * 0.72);
      eyeGroup.add(glint);

      parent.add(eyeGroup);
    });
  }

  function addNostrils(parent, xHalf, y, z, r = 0.035) {
    const mat = matSolid(0x2a241c, 0.8);
    [-1, 1].forEach((side) => {
      const n = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), mat);
      n.scale.set(0.8, 0.65, 1.2);
      n.position.set(side * xHalf, y, z);
      parent.add(n);
    });
  }

  function addTeethRow(parent, count, width, y, zStart, zEnd, size, upward = false) {
    const toothMat = matSolid(0xfffdf2, 0.25, 0.05);
    const geom = new THREE.ConeGeometry(size * 0.45, size, 8);
    [-1, 1].forEach((side) => {
      for (let i = 0; i < count; i++) {
        const t = i / Math.max(1, count - 1);
        const tooth = new THREE.Mesh(geom, toothMat);
        tooth.position.set(side * width * (1 - t * 0.22), y, zStart + (zEnd - zStart) * t);
        if (!upward) tooth.rotation.x = Math.PI;
        parent.add(tooth);
      }
    });
  }

  function addClawedFoot(parent, x, y, z, scale, bodyMat, clawMat, toeCount = 3) {
    const foot = new THREE.Group();
    foot.position.set(x, y, z);

    const pad = new THREE.Mesh(new THREE.SphereGeometry(0.2 * scale, 14, 12), bodyMat);
    pad.scale.set(1.05, 0.55, 1.15);
    pad.castShadow = true;
    foot.add(pad);

    for (let i = 0; i < toeCount; i++) {
      const spread = (i - (toeCount - 1) / 2) * 0.42;
      const toe = new THREE.Mesh(new THREE.SphereGeometry(0.08 * scale, 10, 8), bodyMat);
      toe.scale.set(0.85, 0.7, 1.5);
      toe.position.set(Math.sin(spread) * 0.2 * scale, -0.02 * scale, Math.cos(spread) * 0.18 * scale);
      toe.rotation.y = spread;
      foot.add(toe);

      const claw = new THREE.Mesh(new THREE.ConeGeometry(0.045 * scale, 0.16 * scale, 8), clawMat);
      claw.position.set(Math.sin(spread) * 0.29 * scale, -0.04 * scale, Math.cos(spread) * 0.29 * scale);
      claw.rotation.x = Math.PI * 0.48;
      claw.rotation.z = -spread;
      foot.add(claw);
    }
    parent.add(foot);
    return foot;
  }

  function addPillarLeg(parent, x, topY, z, height, radius, bodyMat, clawMat, toeCount = 3) {
    const leg = new THREE.Group();
    leg.position.set(x, topY, z);

    const upper = createOrganicTube(
      [
        new THREE.Vector3(0, 0.1, 0),
        new THREE.Vector3(0, -height * 0.45, 0.05),
        new THREE.Vector3(0, -height + 0.1, 0),
      ],
      (u) => radius * (1.15 - u * 0.28),
      14,
      14,
      bodyMat
    );
    leg.add(upper);

    const footPad = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.92, radius * 1.05, 0.18, 16), bodyMat);
    footPad.position.set(0, -height + 0.09, 0.04);
    footPad.castShadow = true;
    leg.add(footPad);

    for (let i = 0; i < toeCount; i++) {
      const ang = (i - (toeCount - 1) / 2) * 0.42;
      const nail = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.28, 10, 8), clawMat);
      nail.scale.set(0.9, 0.75, 1.15);
      nail.position.set(Math.sin(ang) * radius * 0.88, -height + 0.08, Math.cos(ang) * radius * 0.88 + 0.04);
      leg.add(nail);
    }

    parent.add(leg);
    return leg;
  }

  // ==================== 1. T-REX ====================
  function buildTRex() {
    const root = new THREE.Group();
    const skin = matSkin('trex', '#6d9b3b', '#d97a26', 'stripes');
    const belly = matSolid(0xe8d08e, 0.72);
    const clawMat = matSolid(0xeae0c8, 0.4);
    const mouthMat = matSolid(0xd9646b, 0.45);

    const bodyPivot = new THREE.Group();
    root.add(bodyPivot);

    // Muscular curved torso + tail
    const spine = createOrganicTube(
      [
        new THREE.Vector3(0, 1.15, -2.35),
        new THREE.Vector3(0, 1.25, -1.35),
        new THREE.Vector3(0, 1.38, -0.35),
        new THREE.Vector3(0, 1.55, 0.48),
        new THREE.Vector3(0, 1.95, 0.92),
      ],
      (u) => {
        if (u < 0.5) return [0.06 + u * 1.05, 0.06 + u * 1.15];
        if (u < 0.8) return [0.58 - (u - 0.5) * 0.25, 0.65 - (u - 0.5) * 0.3];
        return [0.48 - (u - 0.8) * 0.75, 0.52 - (u - 0.8) * 0.75];
      },
      36,
      20,
      skin
    );
    bodyPivot.add(spine);

    // Warm cream belly patch
    const bellyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.5, 18, 16), belly);
    bellyMesh.scale.set(0.88, 1.1, 1.25);
    bellyMesh.position.set(0, 1.34, 0.34);
    bodyPivot.add(bellyMesh);

    // Articulated Head Group
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 2.02, 1.0);
    bodyPivot.add(headGroup);

    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.46, 22, 18), skin);
    skull.scale.set(0.95, 0.9, 1.28);
    skull.position.set(0, 0.14, 0.22);
    skull.castShadow = true;
    headGroup.add(skull);

    const snout = new THREE.Mesh(new THREE.SphereGeometry(0.36, 20, 16), skin);
    snout.scale.set(0.92, 0.72, 1.35);
    snout.position.set(0, 0.1, 0.66);
    snout.castShadow = true;
    headGroup.add(snout);

    // Brow ridges
    [-1, 1].forEach((side) => {
      const brow = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), skin);
      brow.scale.set(0.9, 0.7, 1.4);
      brow.position.set(side * 0.26, 0.37, 0.32);
      headGroup.add(brow);
    });

    addCuteEyes(headGroup, 0.31, 0.22, 0.38, 0.125, 0xc76f1c);
    addNostrils(headGroup, 0.16, 0.2, 0.96, 0.04);
    addTeethRow(headGroup, 5, 0.23, -0.09, 0.42, 0.92, 0.095, false);

    // Articulated Lower Jaw
    const jawGroup = new THREE.Group();
    jawGroup.position.set(0, -0.06, 0.18);
    headGroup.add(jawGroup);

    const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.32, 18, 14), belly);
    jaw.scale.set(0.88, 0.45, 1.6);
    jaw.position.set(0, -0.07, 0.42);
    jaw.castShadow = true;
    jawGroup.add(jaw);

    const tongue = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), mouthMat);
    tongue.scale.set(0.85, 0.3, 1.4);
    tongue.position.set(0, 0.02, 0.38);
    jawGroup.add(tongue);
    addTeethRow(jawGroup, 4, 0.19, 0.05, 0.35, 0.72, 0.075, true);

    // Cute tiny T-Rex arms
    const arms = [];
    [-1, 1].forEach((side) => {
      const arm = new THREE.Group();
      arm.position.set(side * 0.42, 1.48, 0.78);
      const armTube = createOrganicTube(
        [
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(side * 0.08, -0.22, 0.14),
          new THREE.Vector3(side * 0.04, -0.28, 0.32),
        ],
        (u) => 0.085 - u * 0.03,
        10,
        10,
        skin
      );
      arm.add(armTube);
      [-0.03, 0.03].forEach((dx) => {
        const c = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.08, 6), clawMat);
        c.position.set(side * 0.04 + dx, -0.3, 0.37);
        c.rotation.x = Math.PI * 0.55;
        arm.add(c);
      });
      bodyPivot.add(arm);
      arms.push(arm);
    });

    // Powerful muscular hind legs
    const legs = [];
    [-1, 1].forEach((side) => {
      const leg = new THREE.Group();
      leg.position.set(side * 0.44, 1.25, -0.05);
      const legMesh = createOrganicTube(
        [
          new THREE.Vector3(0, 0.1, 0),
          new THREE.Vector3(side * 0.04, -0.42, 0.14),
          new THREE.Vector3(side * 0.02, -0.78, -0.08),
          new THREE.Vector3(0, -1.16, 0.08),
        ],
        (u) => (u < 0.4 ? 0.32 - u * 0.22 : 0.22 - (u - 0.4) * 0.14),
        18,
        14,
        skin
      );
      leg.add(legMesh);
      addClawedFoot(leg, 0, -1.18, 0.16, 1.25, skin, clawMat, 3);
      root.add(leg);
      legs.push(leg);
    });

    return {
      group: root,
      diorama: 'jungle',
      cameraPos: [3.8, 2.3, 4.2],
      target: [0, 1.35, 0.1],
      animate(t, action) {
        const roar = Math.sin(action * Math.PI);
        bodyPivot.position.y = Math.sin(t * 2.4) * 0.035 + roar * 0.08;
        bodyPivot.rotation.x = -roar * 0.14;
        bodyPivot.rotation.y = Math.sin(t * 1.1) * 0.05;
        headGroup.rotation.x = -0.06 + Math.sin(t * 2.0) * 0.04 - roar * 0.34;
        headGroup.rotation.y = Math.sin(t * 1.4) * 0.08 + Math.sin(action * Math.PI * 4) * 0.14 * roar;
        jawGroup.rotation.x = 0.08 + Math.sin(t * 2.4) * 0.04 + roar * 0.62;
        arms[0].rotation.x = Math.sin(t * 3.0) * 0.12 - roar * 0.35;
        arms[1].rotation.x = -Math.sin(t * 3.0) * 0.12 - roar * 0.35;
      },
    };
  }

  // ==================== 2. TRICERATOPS ====================
  function buildTriceratops() {
    const root = new THREE.Group();
    const skin = matSkin('tric', '#de7c3e', '#a84a20', 'spots');
    const frillMat = matSkin('tric_frill', '#e3833e', '#38b5c9', 'frill', 0.52);
    const belly = matSolid(0xf3d4a0, 0.72);
    const hornMat = matSolid(0xf7f1df, 0.32, 0.06);

    const bodyPivot = new THREE.Group();
    root.add(bodyPivot);

    // Barrel body + short sturdy tail
    const torso = createOrganicTube(
      [
        new THREE.Vector3(0, 0.78, -2.05),
        new THREE.Vector3(0, 0.96, -1.2),
        new THREE.Vector3(0, 1.16, -0.25),
        new THREE.Vector3(0, 1.12, 0.62),
        new THREE.Vector3(0, 1.05, 1.0),
      ],
      (u) => {
        if (u < 0.35) return 0.07 + u * 1.3;
        if (u < 0.78) return [0.64, 0.58];
        return 0.44;
      },
      32,
      20,
      skin
    );
    bodyPivot.add(torso);

    const bellyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.54, 18, 14), belly);
    bellyMesh.scale.set(0.95, 0.78, 1.35);
    bellyMesh.position.set(0, 0.92, 0.05);
    bodyPivot.add(bellyMesh);

    // Iconic Head with Frill & 3 Horns
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.08, 1.05);
    bodyPivot.add(headGroup);

    // Colorful scalloped frill shield
    const frill = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.66, 0.14, 24), frillMat);
    frill.rotation.x = Math.PI * 0.34;
    frill.position.set(0, 0.36, -0.08);
    frill.scale.set(1.08, 1.0, 0.95);
    frill.castShadow = true;
    headGroup.add(frill);

    // Decorative edge bumps around frill
    for (let i = 0; i < 9; i++) {
      const ang = -Math.PI * 0.72 + (i / 8) * Math.PI * 1.44;
      const bump = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.18, 8), hornMat);
      bump.position.set(Math.sin(ang) * 0.82, 0.36 + Math.cos(ang) * 0.65, -0.08 - Math.cos(ang) * 0.36);
      bump.rotation.z = -ang;
      bump.rotation.x = -0.45;
      headGroup.add(bump);
    }

    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 16), skin);
    skull.scale.set(0.95, 0.86, 1.3);
    skull.position.set(0, 0.04, 0.32);
    skull.castShadow = true;
    headGroup.add(skull);

    // Parrot beak
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.36, 12), hornMat);
    beak.rotation.x = Math.PI * 0.64;
    beak.position.set(0, -0.06, 0.84);
    headGroup.add(beak);

    // 2 Long Curved Brow Horns
    [-1, 1].forEach((side) => {
      const horn = createOrganicTube(
        [
          new THREE.Vector3(side * 0.24, 0.28, 0.28),
          new THREE.Vector3(side * 0.34, 0.44, 0.68),
          new THREE.Vector3(side * 0.32, 0.64, 1.08),
        ],
        (u) => 0.095 * (1 - u * 0.88),
        14,
        10,
        hornMat
      );
      headGroup.add(horn);
    });

    // 1 Nose Horn
    const noseHorn = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.34, 12), hornMat);
    noseHorn.position.set(0, 0.24, 0.74);
    noseHorn.rotation.x = 0.48;
    noseHorn.castShadow = true;
    headGroup.add(noseHorn);

    addCuteEyes(headGroup, 0.32, 0.14, 0.38, 0.115, 0x8f4812);
    addNostrils(headGroup, 0.16, 0.06, 0.74, 0.035);

    // 4 Sturdy Pillar Legs
    const fl = addPillarLeg(root, -0.46, 0.92, 0.56, 0.92, 0.2, skin, hornMat, 3);
    const fr = addPillarLeg(root, 0.46, 0.92, 0.56, 0.92, 0.2, skin, hornMat, 3);
    const bl = addPillarLeg(root, -0.48, 0.98, -0.58, 0.98, 0.23, skin, hornMat, 3);
    const br = addPillarLeg(root, 0.48, 0.98, -0.58, 0.98, 0.23, skin, hornMat, 3);

    return {
      group: root,
      diorama: 'jungle',
      cameraPos: [3.8, 2.0, 4.0],
      target: [0, 1.05, 0.2],
      animate(t, action) {
        const charge = Math.sin(action * Math.PI);
        bodyPivot.position.y = Math.sin(t * 2.2) * 0.025 + Math.abs(Math.sin(action * Math.PI * 3)) * 0.07 * charge;
        headGroup.rotation.x = Math.sin(t * 1.8) * 0.05 + charge * 0.32;
        headGroup.rotation.y = Math.sin(t * 1.1) * 0.09 + Math.sin(action * Math.PI * 4) * 0.12 * charge;
        fl.rotation.x = Math.sin(action * Math.PI * 6) * 0.3 * charge;
        fr.rotation.x = -Math.sin(action * Math.PI * 6) * 0.3 * charge;
        bl.rotation.x = -Math.sin(action * Math.PI * 6) * 0.22 * charge;
        br.rotation.x = Math.sin(action * Math.PI * 6) * 0.22 * charge;
      },
    };
  }

  // ==================== 3. BRACHIOSAURUS ====================
  function buildBrachiosaurus() {
    const root = new THREE.Group();
    const skin = matSkin('brach', '#3f99a3', '#b8e8dc', 'spots');
    const belly = matSolid(0xbde2de, 0.72);
    const nailMat = matSolid(0xe6dfc8, 0.45);

    const bodyPivot = new THREE.Group();
    root.add(bodyPivot);

    // Sloped giraffe-like torso + sweeping tail
    const body = createOrganicTube(
      [
        new THREE.Vector3(0, 0.85, -2.3),
        new THREE.Vector3(0, 0.98, -1.3),
        new THREE.Vector3(0, 1.25, -0.45),
        new THREE.Vector3(0, 1.55, 0.42),
        new THREE.Vector3(0, 1.72, 0.78),
      ],
      (u) => {
        if (u < 0.42) return 0.07 + u * 1.15;
        if (u < 0.82) return [0.58 + (u - 0.42) * 0.12, 0.62 + (u - 0.42) * 0.14];
        return 0.42;
      },
      34,
      20,
      skin
    );
    bodyPivot.add(body);

    const bellyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 14), belly);
    bellyMesh.scale.set(0.95, 0.82, 1.35);
    bellyMesh.position.set(0, 1.24, 0.02);
    bodyPivot.add(bellyMesh);

    // Towering Graceful S-Curved Neck + Domed Head
    const neckPivot = new THREE.Group();
    neckPivot.position.set(0, 1.65, 0.65);
    bodyPivot.add(neckPivot);

    const neck = createOrganicTube(
      [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0.68, 0.34),
        new THREE.Vector3(0, 1.48, 0.56),
        new THREE.Vector3(0, 2.25, 0.68),
      ],
      (u) => 0.34 * (1 - u * 0.52),
      28,
      16,
      skin
    );
    neckPivot.add(neck);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 2.26, 0.7);
    neckPivot.add(headGroup);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 14), skin);
    head.scale.set(0.95, 0.88, 1.32);
    head.position.set(0, 0.02, 0.18);
    head.castShadow = true;
    headGroup.add(head);

    // Characteristic Brachiosaurus domed crest!
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 14), skin);
    dome.scale.set(0.88, 1.1, 1.05);
    dome.position.set(0, 0.19, 0.12);
    headGroup.add(dome);

    addCuteEyes(headGroup, 0.19, 0.08, 0.22, 0.082, 0x3b4e78);
    addNostrils(headGroup, 0.08, 0.15, 0.34, 0.026);

    // Cute leaf twig in mouth!
    const leafMat = matSolid(0x52c445, 0.5);
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), leafMat);
    leaf.scale.set(1.4, 0.25, 0.9);
    leaf.position.set(0.1, -0.05, 0.48);
    leaf.rotation.z = 0.25;
    headGroup.add(leaf);

    // Front legs TALLER than back legs (real Brachiosaurus anatomy!)
    addPillarLeg(root, -0.44, 1.48, 0.44, 1.48, 0.21, skin, nailMat, 3);
    addPillarLeg(root, 0.44, 1.48, 0.44, 1.48, 0.21, skin, nailMat, 3);
    addPillarLeg(root, -0.44, 1.14, -0.62, 1.14, 0.21, skin, nailMat, 3);
    addPillarLeg(root, 0.44, 1.14, -0.62, 1.14, 0.21, skin, nailMat, 3);

    return {
      group: root,
      diorama: 'jungle',
      cameraPos: [4.8, 2.9, 5.2],
      target: [0, 2.0, 0.2],
      animate(t, action) {
        const stretch = Math.sin(action * Math.PI);
        bodyPivot.position.y = Math.sin(t * 1.6) * 0.025;
        neckPivot.rotation.x = Math.sin(t * 1.4) * 0.07 - stretch * 0.24;
        neckPivot.rotation.z = Math.sin(t * 0.9) * 0.05;
        headGroup.rotation.x = Math.sin(t * 2.2) * 0.06 + Math.sin(action * Math.PI * 6) * 0.16 * stretch;
        headGroup.rotation.y = Math.sin(t * 1.2) * 0.16;
      },
    };
  }

  // ==================== 4. STEGOSAURUS ====================
  function buildStegosaurus() {
    const root = new THREE.Group();
    const skin = matSkin('stego', '#4f9c46', '#2e6b30', 'spots');
    const plateMat = matSolid(0xf28238, 0.48, 0.05);
    const plateAccent = matSolid(0xffb538, 0.45, 0.05);
    const spikeMat = matSolid(0xf4ecd4, 0.35);

    const bodyPivot = new THREE.Group();
    root.add(bodyPivot);

    // Arched spine
    const spinePoints = [
      new THREE.Vector3(0, 0.95, -2.05),
      new THREE.Vector3(0, 1.02, -1.25),
      new THREE.Vector3(0, 1.38, -0.25),
      new THREE.Vector3(0, 1.22, 0.55),
      new THREE.Vector3(0, 0.96, 1.22),
    ];
    const spineCurve = new THREE.CatmullRomCurve3(spinePoints);
    const torso = createOrganicTube(
      spinePoints,
      (u) => {
        if (u < 0.3) return 0.08 + u * 1.15;
        if (u < 0.7) return [0.54, 0.62];
        return Math.max(0.18, 0.54 - (u - 0.7) * 1.15);
      },
      36,
      20,
      skin
    );
    bodyPivot.add(torso);

    // Double alternating diamond back plates!
    const plateCount = 10;
    for (let i = 0; i < plateCount; i++) {
      const u = 0.2 + (i / (plateCount - 1)) * 0.68;
      const pt = spineCurve.getPointAt(u);
      const sizeScale = Math.sin(((u - 0.15) / 0.78) * Math.PI);
      const h = 0.25 + sizeScale * 0.48;
      const plate = new THREE.Mesh(
        new THREE.OctahedronGeometry(h * 0.58, 0),
        i % 2 === 0 ? plateMat : plateAccent
      );
      plate.scale.set(0.24, 1.35, 0.9);
      plate.position.set((i % 2 === 0 ? -1 : 1) * 0.15, pt.y + 0.34 + sizeScale * 0.25, pt.z);
      plate.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.1;
      plate.castShadow = true;
      bodyPivot.add(plate);
    }

    // 4 Thagomizer Tail Spikes on animated tail tip
    const tailTip = new THREE.Group();
    tailTip.position.set(0, 0.96, -1.75);
    bodyPivot.add(tailTip);
    [-1, 1].forEach((side) => {
      [0, -0.24].forEach((dz, idx) => {
        const sp = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.44 - idx * 0.05, 10), spikeMat);
        sp.position.set(side * 0.16, 0.12, dz);
        sp.rotation.z = -side * 0.95;
        sp.rotation.x = -0.35;
        sp.castShadow = true;
        tailTip.add(sp);
      });
    });

    // Cute small Stegosaurus head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.96, 1.24);
    bodyPivot.add(headGroup);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.23, 16, 14), skin);
    head.scale.set(0.88, 0.85, 1.45);
    head.position.set(0, 0, 0.2);
    head.castShadow = true;
    headGroup.add(head);

    addCuteEyes(headGroup, 0.17, 0.06, 0.22, 0.08, 0xb86614);
    addNostrils(headGroup, 0.08, 0.04, 0.46, 0.025);

    // Legs (hind taller than front for arched back!)
    addPillarLeg(root, -0.4, 0.92, 0.54, 0.92, 0.17, skin, spikeMat, 3);
    addPillarLeg(root, 0.4, 0.92, 0.54, 0.92, 0.17, skin, spikeMat, 3);
    addPillarLeg(root, -0.42, 1.22, -0.45, 1.22, 0.21, skin, spikeMat, 3);
    addPillarLeg(root, 0.42, 1.22, -0.45, 1.22, 0.21, skin, spikeMat, 3);

    return {
      group: root,
      diorama: 'jungle',
      cameraPos: [4.0, 2.2, 4.1],
      target: [0, 1.15, -0.1],
      animate(t, action) {
        const swing = Math.sin(action * Math.PI);
        bodyPivot.position.y = Math.sin(t * 2.1) * 0.025;
        bodyPivot.rotation.y = Math.sin(action * Math.PI * 4) * 0.24 * swing;
        tailTip.rotation.y = Math.sin(t * 2.6) * 0.12 + Math.sin(action * Math.PI * 6) * 0.45 * swing;
        headGroup.rotation.y = Math.sin(t * 1.4) * 0.15;
        headGroup.rotation.x = Math.sin(t * 2.0) * 0.06;
      },
    };
  }

  // ==================== 5. ANKYLOSAURUS ====================
  function buildAnkylosaurus() {
    const root = new THREE.Group();
    const skin = matSkin('anky', '#c7853b', '#87501c', 'spots');
    const shellMat = matSkin('anky_shell', '#6d8a62', '#d4a14c', 'spots', 0.65);
    const spikeMat = matSolid(0xf2e3c2, 0.4);

    const bodyPivot = new THREE.Group();
    root.add(bodyPivot);

    // Wide armored dome shell
    const shell = new THREE.Mesh(new THREE.SphereGeometry(0.82, 24, 18), shellMat);
    shell.scale.set(1.08, 0.64, 1.38);
    shell.position.set(0, 0.8, 0.0);
    shell.castShadow = true;
    shell.receiveShadow = true;
    bodyPivot.add(shell);

    // Side & dorsal armor spikes
    for (let row = -1; row <= 1; row++) {
      for (let i = -2; i <= 2; i++) {
        const z = i * 0.34;
        const x = row * 0.42;
        const y = 0.8 + Math.sqrt(Math.max(0.02, 1 - (z / 1.15) ** 2 - (x / 0.92) ** 2)) * 0.52;
        const stud = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.24, 8), spikeMat);
        stud.position.set(x, y, z);
        stud.rotation.z = -row * 0.35;
        stud.castShadow = true;
        bodyPivot.add(stud);
      }
    }
    // Side fringe spikes
    [-1, 1].forEach((side) => {
      for (let i = -2; i <= 2; i++) {
        const sp = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.28, 8), spikeMat);
        sp.position.set(side * 0.84, 0.68, i * 0.33);
        sp.rotation.z = -side * 1.3;
        bodyPivot.add(sp);
      }
    });

    // Armored Tail + Heavy Club!
    const tailPivot = new THREE.Group();
    tailPivot.position.set(0, 0.68, -0.95);
    bodyPivot.add(tailPivot);

    const tail = createOrganicTube(
      [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, -0.04, -0.65),
        new THREE.Vector3(0, 0.02, -1.25),
      ],
      (u) => 0.22 * (1 - u * 0.48),
      16,
      12,
      shellMat
    );
    tailPivot.add(tail);

    // Iconic dual-lobed tail club
    [-1, 1].forEach((side) => {
      const lobe = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 12), spikeMat);
      lobe.scale.set(0.95, 0.72, 1.25);
      lobe.position.set(side * 0.14, 0.02, -1.32);
      lobe.castShadow = true;
      tailPivot.add(lobe);
    });

    // Armored Head with cheek horns
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.68, 1.05);
    bodyPivot.add(headGroup);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 18, 14), skin);
    head.scale.set(1.12, 0.78, 1.22);
    head.position.set(0, 0, 0.22);
    head.castShadow = true;
    headGroup.add(head);

    const browCap = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 12), shellMat);
    browCap.scale.set(1.06, 0.45, 1.08);
    browCap.position.set(0, 0.16, 0.16);
    headGroup.add(browCap);

    [-1, 1].forEach((side) => {
      const earHorn = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.24, 8), spikeMat);
      earHorn.position.set(side * 0.34, 0.18, 0.02);
      earHorn.rotation.z = -side * 0.85;
      earHorn.rotation.x = -0.35;
      headGroup.add(earHorn);
    });

    addCuteEyes(headGroup, 0.28, 0.04, 0.34, 0.105, 0x6b3d14);
    addNostrils(headGroup, 0.14, -0.02, 0.6, 0.03);

    // 4 Short Sturdy Tank Legs
    addPillarLeg(root, -0.58, 0.64, 0.56, 0.64, 0.2, skin, spikeMat, 3);
    addPillarLeg(root, 0.58, 0.64, 0.56, 0.64, 0.2, skin, spikeMat, 3);
    addPillarLeg(root, -0.58, 0.64, -0.56, 0.64, 0.21, skin, spikeMat, 3);
    addPillarLeg(root, 0.58, 0.64, -0.56, 0.64, 0.21, skin, spikeMat, 3);

    return {
      group: root,
      diorama: 'jungle',
      cameraPos: [3.8, 2.0, 3.8],
      target: [0, 0.75, 0.0],
      animate(t, action) {
        const whack = Math.sin(action * Math.PI);
        bodyPivot.position.y = Math.sin(t * 2.2) * 0.02;
        tailPivot.rotation.y = Math.sin(t * 2.0) * 0.14 + Math.sin(action * Math.PI * 5) * 0.72 * whack;
        headGroup.rotation.y = Math.sin(t * 1.3) * 0.12;
        headGroup.rotation.x = Math.sin(t * 2.2) * 0.05;
      },
    };
  }

  // ==================== 6. SPINOSAURUS ====================
  function buildSpinosaurus() {
    const root = new THREE.Group();
    const skin = matSkin('spino', '#2f9989', '#1b6359', 'spots');
    const sailMat = matSkin('spino_sail', '#ff8e3c', '#4cc9c8', 'sail', 0.45);
    const belly = matSolid(0xebd89b, 0.7);
    const clawMat = matSolid(0xede3cc, 0.4);

    const bodyPivot = new THREE.Group();
    root.add(bodyPivot);

    // Sleek elongated spine + swimming tail
    const torso = createOrganicTube(
      [
        new THREE.Vector3(0, 1.05, -2.55),
        new THREE.Vector3(0, 1.18, -1.45),
        new THREE.Vector3(0, 1.36, -0.35),
        new THREE.Vector3(0, 1.44, 0.55),
        new THREE.Vector3(0, 1.88, 1.08),
      ],
      (u) => {
        if (u < 0.45) return [0.06 + u * 0.9, 0.1 + u * 1.05];
        if (u < 0.78) return [0.48, 0.54];
        return 0.28;
      },
      36,
      18,
      skin
    );
    bodyPivot.add(torso);

    // Giant Iconic Half-Moon Colorful Back Sail!
    const sailShape = new THREE.Shape();
    sailShape.moveTo(-0.95, 0);
    sailShape.bezierCurveTo(-0.85, 1.18, 0.75, 1.24, 0.92, 0);
    sailShape.closePath();
    const sailGeom = new THREE.ExtrudeGeometry(sailShape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 3,
    });
    sailGeom.center();
    const sail = new THREE.Mesh(sailGeom, sailMat);
    sail.rotation.y = Math.PI / 2;
    sail.position.set(0, 2.02, -0.05);
    sail.castShadow = true;
    bodyPivot.add(sail);

    // Long Crocodile-like Snout Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.92, 1.12);
    bodyPivot.add(headGroup);

    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.32, 18, 14), skin);
    skull.scale.set(0.92, 0.85, 1.2);
    skull.position.set(0, 0.08, 0.15);
    skull.castShadow = true;
    headGroup.add(skull);

    const longSnout = createOrganicTube(
      [
        new THREE.Vector3(0, 0.06, 0.22),
        new THREE.Vector3(0, 0.04, 0.72),
        new THREE.Vector3(0, 0.02, 1.15),
      ],
      (u) => [0.22 * (1 - u * 0.42), 0.16 * (1 - u * 0.35)],
      16,
      14,
      skin
    );
    headGroup.add(longSnout);

    // Nose crest ridge
    const ridge = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 8), matSolid(0xff8e3c, 0.5));
    ridge.position.set(0, 0.22, 0.52);
    ridge.rotation.x = 0.5;
    headGroup.add(ridge);

    addCuteEyes(headGroup, 0.24, 0.16, 0.24, 0.1, 0xd47d1e);
    addTeethRow(headGroup, 6, 0.14, -0.08, 0.38, 1.05, 0.07, false);

    const jawGroup = new THREE.Group();
    jawGroup.position.set(0, -0.06, 0.2);
    headGroup.add(jawGroup);
    const jaw = createOrganicTube(
      [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -0.02, 0.86)],
      (u) => [0.18 * (1 - u * 0.4), 0.1 * (1 - u * 0.3)],
      12,
      12,
      belly
    );
    jawGroup.add(jaw);

    // Arms with 3 claws
    [-1, 1].forEach((side) => {
      const arm = createOrganicTube(
        [
          new THREE.Vector3(side * 0.36, 1.38, 0.76),
          new THREE.Vector3(side * 0.42, 1.04, 0.94),
          new THREE.Vector3(side * 0.36, 0.88, 1.12),
        ],
        (u) => 0.11 - u * 0.035,
        10,
        10,
        skin
      );
      bodyPivot.add(arm);
    });

    // Strong legs
    [-1, 1].forEach((side) => {
      const leg = new THREE.Group();
      leg.position.set(side * 0.4, 1.24, -0.15);
      const legMesh = createOrganicTube(
        [
          new THREE.Vector3(0, 0.08, 0),
          new THREE.Vector3(side * 0.04, -0.45, 0.12),
          new THREE.Vector3(0, -0.82, -0.06),
          new THREE.Vector3(0, -1.16, 0.08),
        ],
        (u) => 0.28 - u * 0.14,
        16,
        14,
        skin
      );
      leg.add(legMesh);
      addClawedFoot(leg, 0, -1.18, 0.16, 1.15, skin, clawMat, 3);
      root.add(leg);
    });

    return {
      group: root,
      diorama: 'river',
      cameraPos: [4.3, 2.4, 4.4],
      target: [0, 1.45, 0.1],
      animate(t, action) {
        const roar = Math.sin(action * Math.PI);
        bodyPivot.position.y = Math.sin(t * 2.1) * 0.035 + roar * 0.08;
        bodyPivot.rotation.z = Math.sin(t * 1.4) * 0.03;
        headGroup.rotation.x = Math.sin(t * 1.9) * 0.04 - roar * 0.28;
        headGroup.rotation.y = Math.sin(t * 1.2) * 0.1 + Math.sin(action * Math.PI * 4) * 0.18 * roar;
        jawGroup.rotation.x = 0.06 + roar * 0.52;
      },
    };
  }

  // ==================== 7. PARASAUROLOPHUS ====================
  function buildParasaurolophus() {
    const root = new THREE.Group();
    const skin = matSkin('para', '#3ca668', '#f0be3c', 'stripes');
    const crestMat = matSolid(0xee6c4d, 0.42, 0.05);
    const belly = matSolid(0xf2e3a7, 0.72);
    const clawMat = matSolid(0xe5dbc2, 0.4);

    const bodyPivot = new THREE.Group();
    root.add(bodyPivot);

    const torso = createOrganicTube(
      [
        new THREE.Vector3(0, 1.0, -2.25),
        new THREE.Vector3(0, 1.12, -1.25),
        new THREE.Vector3(0, 1.32, -0.25),
        new THREE.Vector3(0, 1.48, 0.52),
        new THREE.Vector3(0, 1.92, 0.85),
      ],
      (u) => {
        if (u < 0.45) return 0.07 + u * 1.05;
        if (u < 0.75) return [0.5, 0.56];
        return 0.25;
      },
      34,
      18,
      skin
    );
    bodyPivot.add(torso);

    const bellyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 14), belly);
    bellyMesh.scale.set(0.85, 0.95, 1.2);
    bellyMesh.position.set(0, 1.3, 0.25);
    bodyPivot.add(bellyMesh);

    // Iconic Head with Long Backward-Curving Musical Crest!
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.98, 0.88);
    bodyPivot.add(headGroup);

    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.28, 18, 14), skin);
    skull.scale.set(0.92, 0.92, 1.18);
    skull.position.set(0, 0.06, 0.14);
    skull.castShadow = true;
    headGroup.add(skull);

    // Duckbill snout
    const duckBill = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), crestMat);
    duckBill.scale.set(1.05, 0.56, 1.45);
    duckBill.position.set(0, -0.02, 0.46);
    headGroup.add(duckBill);

    // Long curved trombone head crest!
    const crest = createOrganicTube(
      [
        new THREE.Vector3(0, 0.1, 0.42),
        new THREE.Vector3(0, 0.34, 0.08),
        new THREE.Vector3(0, 0.48, -0.45),
        new THREE.Vector3(0, 0.36, -0.95),
      ],
      (u) => 0.115 * (1 - u * 0.28),
      22,
      12,
      crestMat
    );
    headGroup.add(crest);

    addCuteEyes(headGroup, 0.22, 0.12, 0.22, 0.095, 0xc26e17);
    addNostrils(headGroup, 0.1, 0.04, 0.62, 0.025);

    // Front arms
    [-1, 1].forEach((side) => {
      const arm = createOrganicTube(
        [
          new THREE.Vector3(side * 0.34, 1.36, 0.62),
          new THREE.Vector3(side * 0.36, 1.02, 0.78),
          new THREE.Vector3(side * 0.32, 0.84, 0.92),
        ],
        (u) => 0.095 - u * 0.03,
        10,
        10,
        skin
      );
      bodyPivot.add(arm);
    });

    // Hind legs
    [-1, 1].forEach((side) => {
      const leg = new THREE.Group();
      leg.position.set(side * 0.38, 1.24, -0.15);
      const legMesh = createOrganicTube(
        [
          new THREE.Vector3(0, 0.06, 0),
          new THREE.Vector3(0, -0.44, 0.12),
          new THREE.Vector3(0, -0.82, -0.08),
          new THREE.Vector3(0, -1.16, 0.06),
        ],
        (u) => 0.27 - u * 0.14,
        16,
        14,
        skin
      );
      leg.add(legMesh);
      addClawedFoot(leg, 0, -1.18, 0.14, 1.1, skin, clawMat, 3);
      root.add(leg);
    });

    return {
      group: root,
      diorama: 'jungle',
      cameraPos: [3.9, 2.2, 4.1],
      target: [0, 1.35, 0.05],
      animate(t, action) {
        const honk = Math.sin(action * Math.PI);
        bodyPivot.position.y = Math.sin(t * 2.4) * 0.035 + honk * 0.1;
        headGroup.rotation.x = Math.sin(t * 1.9) * 0.06 - honk * 0.42;
        headGroup.rotation.y = Math.sin(t * 1.3) * 0.12;
      },
    };
  }

  // ==================== 8. VELOCIRAPTOR ====================
  function buildVelociraptor() {
    const root = new THREE.Group();
    const skin = matSkin('raptor', '#c95232', '#f29f38', 'stripes');
    const featherTeal = matSolid(0x28a6a6, 0.55);
    const featherGold = matSolid(0xf59d31, 0.55);
    const belly = matSolid(0xf5d6a4, 0.72);
    const clawMat = matSolid(0x3a2f2a, 0.3);

    const bodyPivot = new THREE.Group();
    root.add(bodyPivot);

    // Agile sleek runner torso + long balancing tail
    const torso = createOrganicTube(
      [
        new THREE.Vector3(0, 1.18, -2.25),
        new THREE.Vector3(0, 1.12, -1.1),
        new THREE.Vector3(0, 1.12, -0.15),
        new THREE.Vector3(0, 1.24, 0.55),
        new THREE.Vector3(0, 1.62, 0.92),
      ],
      (u) => {
        if (u < 0.45) return 0.06 + u * 0.55;
        if (u < 0.76) return [0.34, 0.38];
        return 0.18;
      },
      34,
      16,
      skin
    );
    bodyPivot.add(torso);

    // Colorful Feathered Tail Fan!
    const tailFan = new THREE.Group();
    tailFan.position.set(0, 1.18, -1.95);
    bodyPivot.add(tailFan);
    for (let i = -3; i <= 3; i++) {
      const f = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 10, 8),
        Math.abs(i) % 2 === 0 ? featherTeal : featherGold
      );
      f.scale.set(0.45, 0.12, 2.2);
      f.position.set(i * 0.08, 0.04, -0.22 - (3 - Math.abs(i)) * 0.06);
      f.rotation.y = i * 0.22;
      tailFan.add(f);
    }

    // Feathered Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.66, 0.96);
    bodyPivot.add(headGroup);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 14), skin);
    head.scale.set(0.88, 0.85, 1.48);
    head.position.set(0, 0.04, 0.22);
    head.castShadow = true;
    headGroup.add(head);

    // Cute head feathers tuft
    for (let i = 0; i < 4; i++) {
      const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.26, 8), i % 2 === 0 ? featherGold : featherTeal);
      tuft.position.set((i - 1.5) * 0.04, 0.24, -0.02 - i * 0.03);
      tuft.rotation.x = -0.85;
      headGroup.add(tuft);
    }

    addCuteEyes(headGroup, 0.18, 0.09, 0.26, 0.088, 0xd47d17);
    addNostrils(headGroup, 0.08, 0.06, 0.52, 0.024);

    // Feathered Wing-Arms!
    const arms = [];
    [-1, 1].forEach((side) => {
      const arm = new THREE.Group();
      arm.position.set(side * 0.28, 1.2, 0.56);
      const armBone = createOrganicTube(
        [
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(side * 0.14, -0.2, 0.16),
          new THREE.Vector3(side * 0.2, -0.14, 0.38),
        ],
        (u) => 0.065 - u * 0.02,
        10,
        8,
        skin
      );
      arm.add(armBone);
      for (let i = 0; i < 4; i++) {
        const f = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), i % 2 === 0 ? featherTeal : featherGold);
        f.scale.set(0.28, 0.85, 1.9);
        f.position.set(side * (0.14 + i * 0.02), -0.26, 0.08 + i * 0.09);
        f.rotation.x = 0.35;
        arm.add(f);
      }
      bodyPivot.add(arm);
      arms.push(arm);
    });

    // Agile Runner Legs with iconic curved sickle claw!
    const legs = [];
    [-1, 1].forEach((side) => {
      const leg = new THREE.Group();
      leg.position.set(side * 0.28, 1.08, -0.05);
      const legMesh = createOrganicTube(
        [
          new THREE.Vector3(0, 0.04, 0),
          new THREE.Vector3(0, -0.38, 0.14),
          new THREE.Vector3(0, -0.72, -0.1),
          new THREE.Vector3(0, -1.02, 0.06),
        ],
        (u) => 0.18 - u * 0.1,
        14,
        12,
        skin
      );
      leg.add(legMesh);
      addClawedFoot(leg, 0, -1.03, 0.12, 0.88, belly, clawMat, 3);
      // Curved raised sickle claw!
      const sickle = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.022, 8, 12, Math.PI * 1.1), clawMat);
      sickle.position.set(-side * 0.08, -0.94, 0.24);
      sickle.rotation.y = Math.PI / 2;
      sickle.rotation.z = -0.3;
      leg.add(sickle);
      root.add(leg);
      legs.push(leg);
    });

    return {
      group: root,
      diorama: 'jungle',
      cameraPos: [3.6, 1.9, 3.8],
      target: [0, 1.1, 0.05],
      animate(t, action) {
        const hop = Math.sin(action * Math.PI);
        bodyPivot.position.y = Math.sin(t * 3.4) * 0.03 + hop * 0.38;
        headGroup.rotation.y = Math.sin(t * 2.3) * 0.22;
        headGroup.rotation.z = Math.sin(t * 1.6) * 0.1;
        arms[0].rotation.z = 0.2 + Math.sin(t * 3.4) * 0.1 + Math.sin(action * Math.PI * 6) * 0.5 * hop;
        arms[1].rotation.z = -0.2 - Math.sin(t * 3.4) * 0.1 - Math.sin(action * Math.PI * 6) * 0.5 * hop;
        legs[0].rotation.x = Math.sin(action * Math.PI * 4) * 0.35 * hop;
        legs[1].rotation.x = -Math.sin(action * Math.PI * 4) * 0.35 * hop;
      },
    };
  }

  // ==================== 9. PTERANODON ====================
  function buildPteranodon() {
    const root = new THREE.Group();
    const bodyMat = matSolid(0x6e8599, 0.55);
    const bellyMat = matSolid(0xf2e3c9, 0.65);
    const crestMat = matSolid(0xf06543, 0.42);
    const beakMat = matSolid(0xf5b342, 0.38);
    const wingMat = matSkin('ptera_wing', '#f4b350', '#ef7358', 'wing', 0.52);

    const flyer = new THREE.Group();
    flyer.position.set(0, 1.95, 0);
    root.add(flyer);

    // Streamlined torso
    const torso = new THREE.Mesh(new THREE.SphereGeometry(0.32, 18, 14), bodyMat);
    torso.scale.set(0.85, 0.78, 1.6);
    torso.castShadow = true;
    flyer.add(torso);

    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 12), bellyMat);
    chest.scale.set(0.82, 0.65, 1.35);
    chest.position.set(0, -0.1, 0.08);
    flyer.add(chest);

    // Neck & Iconic Pointed Head + Long Beak
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.12, 0.55);
    flyer.add(headGroup);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.21, 16, 14), bodyMat);
    head.scale.set(0.82, 0.86, 1.15);
    headGroup.add(head);

    // Long pointed rear crest
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.85, 12), crestMat);
    crest.rotation.x = -Math.PI * 0.35;
    crest.position.set(0, 0.24, -0.32);
    crest.scale.set(0.45, 1, 1);
    crest.castShadow = true;
    headGroup.add(crest);

    // Long sleek beak
    const upperBeak = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.92, 12), beakMat);
    upperBeak.rotation.x = Math.PI * 0.5;
    upperBeak.position.set(0, 0.02, 0.52);
    upperBeak.scale.set(0.65, 1, 0.58);
    upperBeak.castShadow = true;
    headGroup.add(upperBeak);

    const lowerBeak = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.78, 10), beakMat);
    lowerBeak.rotation.x = Math.PI * 0.56;
    lowerBeak.position.set(0, -0.07, 0.44);
    lowerBeak.scale.set(0.6, 1, 0.45);
    headGroup.add(lowerBeak);

    addCuteEyes(headGroup, 0.14, 0.05, 0.08, 0.085, 0xc76918);

    // Wide sweeping articulated wings!
    const wings = [];
    [-1, 1].forEach((side) => {
      const wingPivot = new THREE.Group();
      wingPivot.position.set(side * 0.2, 0.06, 0.15);
      flyer.add(wingPivot);

      const wingShape = new THREE.Shape();
      wingShape.moveTo(0, 0.22);
      wingShape.quadraticCurveTo(0.85, 0.52, 2.05, 0.08);
      wingShape.quadraticCurveTo(1.25, -0.35, 0.55, -0.45);
      wingShape.quadraticCurveTo(0.18, -0.48, 0, -0.38);
      wingShape.closePath();

      const wingGeom = new THREE.ExtrudeGeometry(wingShape, {
        depth: 0.035,
        bevelEnabled: true,
        bevelThickness: 0.015,
        bevelSize: 0.015,
        bevelSegments: 2,
      });
      const wingMesh = new THREE.Mesh(wingGeom, wingMat);
      wingMesh.rotation.x = -Math.PI / 2;
      if (side < 0) wingMesh.scale.x = -1;
      wingMesh.castShadow = true;
      wingPivot.add(wingMesh);

      // Leading edge bone arm
      const armBone = createOrganicTube(
        [
          new THREE.Vector3(0, 0, 0.16),
          new THREE.Vector3(side * 0.85, 0.04, 0.34),
          new THREE.Vector3(side * 2.0, 0, 0.06),
        ],
        (u) => 0.065 * (1 - u * 0.65),
        14,
        8,
        beakMat
      );
      wingPivot.add(armBone);
      wings.push(wingPivot);
    });

    // Little tucked feet
    [-1, 1].forEach((side) => {
      const foot = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.32, 8), bodyMat);
      foot.rotation.x = -Math.PI * 0.42;
      foot.position.set(side * 0.14, -0.1, -0.58);
      flyer.add(foot);
    });

    return {
      group: root,
      diorama: 'cliff',
      cameraPos: [4.2, 2.8, 4.4],
      target: [0, 1.75, 0],
      animate(t, action) {
        const swoop = Math.sin(action * Math.PI);
        const flapSpeed = 3.2 + swoop * 5.0;
        const flapAmp = 0.32 + swoop * 0.35;
        const flap = Math.sin(t * flapSpeed) * flapAmp;
        wings[0].rotation.z = -flap;
        wings[1].rotation.z = flap;
        flyer.position.y = 1.95 + Math.sin(t * 2.2) * 0.16 + swoop * 0.25;
        flyer.rotation.z = Math.sin(t * 1.1) * 0.12;
        flyer.rotation.x = -0.06 + Math.sin(t * 2.2) * 0.06 - swoop * 0.2;
        headGroup.rotation.y = Math.sin(t * 1.5) * 0.16;
      },
    };
  }

  // ==================== 10. PLESIOSAURUS ====================
  function buildPlesiosaurus() {
    const root = new THREE.Group();
    const skin = matSkin('plesio', '#4daee8', '#9875d9', 'spots', 0.34);
    const belly = matSolid(0xcff0ff, 0.38);

    const swimmer = new THREE.Group();
    swimmer.position.set(0, 1.05, 0);
    root.add(swimmer);

    // Smooth teardrop marine body + pointed tail
    const body = createOrganicTube(
      [
        new THREE.Vector3(0, -0.04, -1.75),
        new THREE.Vector3(0, 0.0, -0.85),
        new THREE.Vector3(0, 0.08, 0.0),
        new THREE.Vector3(0, 0.06, 0.72),
      ],
      (u) => {
        if (u < 0.45) return [0.06 + u * 1.1, 0.06 + u * 0.82];
        if (u < 0.8) return [0.56, 0.42];
        return 0.32;
      },
      30,
      20,
      skin
    );
    swimmer.add(body);

    const bellyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.46, 16, 12), belly);
    bellyMesh.scale.set(1.05, 0.52, 1.35);
    bellyMesh.position.set(0, -0.12, -0.02);
    swimmer.add(bellyMesh);

    // Long Graceful Swan-like Neck!
    const neckPivot = new THREE.Group();
    neckPivot.position.set(0, 0.06, 0.62);
    swimmer.add(neckPivot);

    const neck = createOrganicTube(
      [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0.28, 0.56),
        new THREE.Vector3(0, 0.92, 0.76),
        new THREE.Vector3(0, 1.48, 0.62),
        new THREE.Vector3(0, 1.66, 0.85),
      ],
      (u) => 0.24 * (1 - u * 0.48),
      28,
      16,
      skin
    );
    neckPivot.add(neck);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.66, 0.86);
    neckPivot.add(headGroup);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 14), skin);
    head.scale.set(0.92, 0.78, 1.42);
    head.position.set(0, 0.02, 0.16);
    head.castShadow = true;
    headGroup.add(head);

    addCuteEyes(headGroup, 0.15, 0.08, 0.18, 0.08, 0x2a57a3);
    addNostrils(headGroup, 0.07, 0.06, 0.4, 0.022);

    // 4 Broad Wing-like Flippers!
    const flippers = [];
    const flipperSpecs = [
      [-1, 0.38, 1.05],
      [1, 0.38, 1.05],
      [-1, -0.45, 0.9],
      [1, -0.45, 0.9],
    ];
    flipperSpecs.forEach(([side, zPos, scale]) => {
      const fp = new THREE.Group();
      fp.position.set(side * 0.44, -0.05, zPos);
      const shape = new THREE.Shape();
      shape.moveTo(0, 0.16);
      shape.quadraticCurveTo(0.48 * scale, 0.24 * scale, 1.02 * scale, -0.06 * scale);
      shape.quadraticCurveTo(0.52 * scale, -0.26 * scale, 0, -0.14);
      shape.closePath();
      const geom = new THREE.ExtrudeGeometry(shape, {
        depth: 0.05,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.02,
        bevelSegments: 2,
      });
      const mesh = new THREE.Mesh(geom, skin);
      mesh.rotation.x = -Math.PI / 2;
      if (side < 0) mesh.scale.x = -1;
      mesh.castShadow = true;
      fp.add(mesh);
      swimmer.add(fp);
      flippers.push({ group: fp, side, isFront: zPos > 0 });
    });

    return {
      group: root,
      diorama: 'ocean',
      cameraPos: [4.2, 2.5, 4.4],
      target: [0, 1.3, 0.15],
      animate(t, action) {
        const splash = Math.sin(action * Math.PI);
        const speed = 2.4 + splash * 3.5;
        swimmer.position.y = 1.05 + Math.sin(t * 2.0) * 0.1 + splash * 0.22;
        swimmer.rotation.x = Math.sin(t * 2.0) * 0.05 - splash * 0.14;
        neckPivot.rotation.x = Math.sin(t * 1.6) * 0.08 - splash * 0.18;
        neckPivot.rotation.y = Math.sin(t * 1.1) * 0.14;
        headGroup.rotation.y = Math.sin(t * 1.8) * 0.15;
        flippers.forEach((f) => {
          const phase = f.isFront ? 0 : Math.PI * 0.8;
          const stroke = Math.sin(t * speed + phase) * (0.34 + splash * 0.28);
          f.group.rotation.z = f.side * stroke;
          f.group.rotation.x = Math.cos(t * speed + phase) * 0.18;
        });
      },
    };
  }

  // ==================== DIORAMA PEDESTALS ====================
  function createDiorama(type) {
    const group = new THREE.Group();

    if (type === 'ocean') {
      // Crystal turquoise ocean pedestal with sandy bottom, corals & bubbles
      const sand = new THREE.Mesh(
        new THREE.CylinderGeometry(2.55, 2.3, 0.35, 40),
        matSolid(0xe8d09b, 0.85)
      );
      sand.position.y = -0.35;
      sand.receiveShadow = true;
      group.add(sand);

      const waterMat = new THREE.MeshPhysicalMaterial({
        color: 0x26c6da,
        roughness: 0.14,
        metalness: 0.05,
        transparent: true,
        opacity: 0.56,
      });
      const water = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.5, 0.72, 40), waterMat);
      water.position.y = 0.18;
      group.add(water);

      // Colorful coral tufts on seabed
      const coralColors = [0xff6f61, 0xffb74d, 0xba68c8, 0x4dd0e1];
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2 + 0.3;
        const dist = 1.6 + (i % 2) * 0.45;
        const cMat = matSolid(coralColors[i % coralColors.length], 0.6);
        const coral = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18 + (i % 3) * 0.05, 0), cMat);
        coral.position.set(Math.cos(ang) * dist, -0.08, Math.sin(ang) * dist);
        coral.scale.set(0.8, 1.5, 0.8);
        group.add(coral);
      }

      // Floating bubbles
      const bubbleMat = new THREE.MeshStandardMaterial({
        color: 0xe0f7fa,
        roughness: 0.1,
        transparent: true,
        opacity: 0.7,
      });
      const bubbles = [];
      for (let i = 0; i < 12; i++) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.05 + (i % 3) * 0.025, 10, 8), bubbleMat);
        b.position.set((Math.random() - 0.5) * 3.4, 0.1 + Math.random() * 1.4, (Math.random() - 0.5) * 3.4);
        b.userData = { baseY: b.position.y, speed: 0.4 + Math.random() * 0.5 };
        group.add(b);
        bubbles.push(b);
      }
      group.userData.update = (t) => {
        water.position.y = 0.18 + Math.sin(t * 2.0) * 0.025;
        bubbles.forEach((b) => {
          b.position.y = ((b.userData.baseY + t * b.userData.speed) % 1.8) + 0.05;
        });
      };
      return group;
    }

    // Standard grassy / river / cliff island pedestal
    const dirt = new THREE.Mesh(
      new THREE.CylinderGeometry(2.5, 2.15, 0.42, 40),
      matSolid(0x8c6239, 0.88)
    );
    dirt.position.y = -0.24;
    dirt.receiveShadow = true;
    group.add(dirt);

    const grassColor = type === 'cliff' ? 0x5ca84f : 0x67b54a;
    const grass = new THREE.Mesh(
      new THREE.CylinderGeometry(2.6, 2.52, 0.18, 40),
      matSolid(grassColor, 0.82)
    );
    grass.position.y = -0.04;
    grass.receiveShadow = true;
    group.add(grass);

    if (type === 'river' || type === 'cliff') {
      const pool = new THREE.Mesh(
        new THREE.CylinderGeometry(1.15, 1.15, 0.06, 28),
        new THREE.MeshStandardMaterial({
          color: 0x3ec5db,
          roughness: 0.18,
          transparent: true,
          opacity: 0.82,
        })
      );
      pool.position.set(1.1, 0.04, 0.8);
      group.add(pool);
    }

    // Mossy rocks
    const rockMat = matSolid(0x8b8e85, 0.85);
    [
      [-1.75, 0.12, -1.1, 0.34],
      [-1.4, 0.08, -1.45, 0.22],
      [1.65, 0.1, -1.2, 0.3],
      [-1.65, 0.09, 1.15, 0.24],
    ].forEach(([x, y, z, r]) => {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 1), rockMat);
      rock.scale.set(1.2, 0.72, 1.0);
      rock.position.set(x, y, z);
      rock.castShadow = true;
      rock.receiveShadow = true;
      group.add(rock);
    });

    // Cute miniature prehistoric fern clusters
    const fernMat = matSolid(0x3a8c3a, 0.65);
    const fernSpots = [
      [-1.85, 0.05, 0.45],
      [1.82, 0.05, -0.55],
      [-1.15, 0.05, -1.78],
      [1.25, 0.05, 1.52],
    ];
    fernSpots.forEach(([fx, fy, fz]) => {
      const tuft = new THREE.Group();
      tuft.position.set(fx, fy, fz);
      for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * Math.PI * 2;
        const frond = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), fernMat);
        frond.scale.set(0.5, 0.14, 2.2);
        frond.position.set(Math.sin(ang) * 0.2, 0.14, Math.cos(ang) * 0.2);
        frond.rotation.y = ang;
        frond.rotation.x = -0.35;
        tuft.add(frond);
      }
      group.add(tuft);
    });

    // Tiny cheerful wildflowers
    const flowerColors = [0xffd54f, 0xff8a65, 0xba68c8, 0x64b5f6];
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2 + 0.4;
      const dist = 1.9 + (i % 2) * 0.35;
      const fl = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 8, 6),
        matSolid(flowerColors[i % flowerColors.length], 0.5)
      );
      fl.position.set(Math.cos(ang) * dist, 0.09, Math.sin(ang) * dist);
      group.add(fl);
    }

    return group;
  }

  // ==================== PLAYFUL SYNTHESIZED SOUND ====================
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
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(75, now + 0.55);
        filter.frequency.setValueAtTime(600, now);
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
        // Gentle friendly herbivore rumble
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

  const builders = {
    trex: buildTRex,
    triceratops: buildTriceratops,
    brachiosaurus: buildBrachiosaurus,
    stegosaurus: buildStegosaurus,
    ankylosaurus: buildAnkylosaurus,
    spinosaurus: buildSpinosaurus,
    parasaurolophus: buildParasaurolophus,
    velociraptor: buildVelociraptor,
    pteranodon: buildPteranodon,
    plesiosaurus: buildPlesiosaurus,
  };

  global.Dino3D = {
    build(id) {
      const fn = builders[id] || builders.trex;
      return fn();
    },
    createDiorama,
    playDinoSound,
  };
})(window);
