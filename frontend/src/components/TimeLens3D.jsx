import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import * as THREE from "three";

function TimeLens3D({
  size = "normal",
  className = "",
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const animationRef = useRef(null);

  const targetRotation = useRef({
    x: 0,
    y: 0,
  });

  const currentRotation = useRef({
    x: 0,
    y: 0,
  });

  const [hidden, setHidden] = useState(false);

  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/dashboard") {
      return undefined;
    }

    const mount = mountRef.current;

    if (!mount) {
      return undefined;
    }

    /* =====================================================
       SCENE
    ===================================================== */

    const scene = new THREE.Scene();

    sceneRef.current = scene;

    /* =====================================================
       CAMERA
    ===================================================== */

    const camera = new THREE.PerspectiveCamera(
      34,
      mount.clientWidth /
        mount.clientHeight,
      0.1,
      100
    );

    camera.position.set(
      0,
      0.15,
      7
    );

    /* =====================================================
       RENDERER
    ===================================================== */

    const renderer =
      new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference:
          "high-performance",
      });

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio || 1,
        2
      )
    );

    renderer.setSize(
      mount.clientWidth,
      mount.clientHeight
    );

    renderer.setClearColor(
      0x000000,
      0
    );

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type =
      THREE.PCFSoftShadowMap;

    mount.appendChild(renderer.domElement);

    /* =====================================================
       MAIN GROUP
    ===================================================== */

    const hourglass =
      new THREE.Group();

    scene.add(hourglass);

    hourglass.rotation.set(
      0,
      0,
      0
    );

    /* =====================================================
       LIGHTING
    ===================================================== */

    const ambientLight =
      new THREE.AmbientLight(
        0xffe5c0,
        2.2
      );

    scene.add(ambientLight);

    const warmLight =
      new THREE.DirectionalLight(
        0xffd39a,
        3
      );

    warmLight.position.set(
      4,
      5,
      6
    );

    warmLight.castShadow = true;

    scene.add(warmLight);

    const sideLight =
      new THREE.PointLight(
        0xffa94d,
        7,
        15
      );

    sideLight.position.set(
      2,
      1,
      3
    );

    scene.add(sideLight);

    const coolFill =
      new THREE.PointLight(
        0xffdfb5,
        4,
        12
      );

    coolFill.position.set(
      -3,
      -1,
      2
    );

    scene.add(coolFill);

    /* =====================================================
       MATERIALS
    ===================================================== */

    const woodMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x32170c,
        roughness: 0.42,
        metalness: 0.18,
      });

    const woodHighlight =
      new THREE.MeshStandardMaterial({
        color: 0x5c2d12,
        roughness: 0.35,
        metalness: 0.22,
      });

    const bronzeMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xb86b19,
        roughness: 0.25,
        metalness: 0.72,
      });

    const sandMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xf0a62d,
        roughness: 0.68,
        metalness: 0.02,
      });

    const glassMaterial =
      new THREE.MeshPhysicalMaterial({
        color: 0xffe4b5,
        transparent: true,
        opacity: 0.17,
        roughness: 0.08,
        metalness: 0,
        transmission: 0.5,
        thickness: 0.25,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

    /* =====================================================
       GLASS BODY
    ===================================================== */

    const glassProfile = [
      new THREE.Vector2(
        0.72,
        1.72
      ),

      new THREE.Vector2(
        0.58,
        1.42
      ),

      new THREE.Vector2(
        0.40,
        0.72
      ),

      new THREE.Vector2(
        0.18,
        0.08
      ),

      new THREE.Vector2(
        0.40,
        -0.72
      ),

      new THREE.Vector2(
        0.58,
        -1.42
      ),

      new THREE.Vector2(
        0.72,
        -1.72
      ),
    ];

    const glassGeometry =
      new THREE.LatheGeometry(
        glassProfile,
        64
      );

    const glass =
      new THREE.Mesh(
        glassGeometry,
        glassMaterial
      );

    glass.castShadow = false;
    glass.receiveShadow = true;

    hourglass.add(glass);

    /* =====================================================
       WOODEN FRAME
    ===================================================== */

    const postGeometry =
      new THREE.CylinderGeometry(
        0.085,
        0.105,
        3.85,
        20
      );

    const postPositions = [
      [-0.86, 0, 0],
      [0.86, 0, 0],
      [-0.86, 0, -0.22],
      [0.86, 0, -0.22],
    ];

    postPositions.forEach(
      ([x, y, z]) => {
        const post =
          new THREE.Mesh(
            postGeometry,
            woodMaterial
          );

        post.position.set(
          x,
          y,
          z
        );

        post.castShadow = true;

        hourglass.add(post);
      }
    );

    /* =====================================================
       TOP + BOTTOM FRAME
    ===================================================== */

    const topBaseGeometry =
      new THREE.BoxGeometry(
        2.05,
        0.18,
        0.52
      );

    const bottomBaseGeometry =
      new THREE.BoxGeometry(
        2.05,
        0.18,
        0.52
      );

    const topBase =
      new THREE.Mesh(
        topBaseGeometry,
        woodMaterial
      );

    topBase.position.y = 2.02;

    topBase.castShadow = true;

    hourglass.add(topBase);

    const bottomBase =
      new THREE.Mesh(
        bottomBaseGeometry,
        woodMaterial
      );

    bottomBase.position.y = -2.02;

    bottomBase.castShadow = true;

    hourglass.add(bottomBase);

    /* =====================================================
       TOP / BOTTOM DECORATIVE CAPS
    ===================================================== */

    const capGeometry =
      new THREE.CylinderGeometry(
        0.18,
        0.18,
        0.08,
        32
      );

    [
      1.92,
      -1.92,
    ].forEach((y) => {
      const cap =
        new THREE.Mesh(
          capGeometry,
          bronzeMaterial
        );

      cap.rotation.z =
        Math.PI / 2;

      cap.position.set(
        0,
        y,
        0
      );

      hourglass.add(cap);
    });

    /* =====================================================
       CENTER RING
    ===================================================== */

    const ringGeometry =
      new THREE.TorusGeometry(
        0.19,
        0.045,
        16,
        48
      );

    const centerRing =
      new THREE.Mesh(
        ringGeometry,
        bronzeMaterial
      );

    centerRing.rotation.x =
      Math.PI / 2;

    hourglass.add(centerRing);

    /* =====================================================
       SAND — TOP
    ===================================================== */

    const upperSandGeometry =
      new THREE.ConeGeometry(
        0.52,
        0.85,
        48
      );

    const upperSand =
      new THREE.Mesh(
        upperSandGeometry,
        sandMaterial
      );

    upperSand.position.y =
      1.15;

    hourglass.add(upperSand);

    /* =====================================================
       SAND — BOTTOM
    ===================================================== */

    const lowerSandGeometry =
      new THREE.ConeGeometry(
        0.52,
        0.65,
        48
      );

    const lowerSand =
      new THREE.Mesh(
        lowerSandGeometry,
        sandMaterial
      );

    lowerSand.rotation.z =
      Math.PI;

    lowerSand.position.y =
      -1.52;

    hourglass.add(lowerSand);

    /* =====================================================
       FALLING SAND
    ===================================================== */

    const streamGeometry =
      new THREE.CylinderGeometry(
        0.018,
        0.018,
        0.82,
        10
      );

    const stream =
      new THREE.Mesh(
        streamGeometry,
        sandMaterial
      );

    stream.position.y =
      0.45;

    hourglass.add(stream);

    /* =====================================================
       SAND PARTICLES
    ===================================================== */

    const grainGeometry =
      new THREE.SphereGeometry(
        0.035,
        10,
        10
      );

    const grains = [];

    for (
      let i = 0;
      i < 42;
      i++
    ) {
      const grain =
        new THREE.Mesh(
          grainGeometry,
          sandMaterial
        );

      grain.position.set(
        (Math.random() - 0.5) *
          0.18,

        0.78 -
          Math.random() *
            1.55,

        (Math.random() - 0.5) *
          0.18
      );

      grain.scale.setScalar(
        0.55 +
          Math.random() * 0.8
      );

      hourglass.add(grain);

      grains.push({
        mesh: grain,
        speed:
          0.35 +
          Math.random() * 0.7,
        offset:
          Math.random() * 10,
      });
    }

    /* =====================================================
       MOUSE MOVEMENT
    ===================================================== */

    const handlePointerMove =
      (event) => {
        const x =
          (event.clientX /
            window.innerWidth) *
            2 -
          1;

        const y =
          (event.clientY /
            window.innerHeight) *
            2 -
          1;

        /*
          Small rotation only.

          The object never turns upside down.
        */

        targetRotation.current.y =
          x * 0.28;

        targetRotation.current.x =
          -y * 0.16;
      };

    window.addEventListener(
      "pointermove",
      handlePointerMove,
      { passive: true }
    );

    /* =====================================================
       SCROLL
    ===================================================== */

    const handleScroll = () => {
      setHidden(
        window.scrollY > 100
      );
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    handleScroll();

    /* =====================================================
       RESIZE
    ===================================================== */

    const handleResize =
      () => {
        if (!mount) {
          return;
        }

        camera.aspect =
          mount.clientWidth /
          mount.clientHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
          mount.clientWidth,
          mount.clientHeight
        );
      };

    window.addEventListener(
      "resize",
      handleResize
    );

    /* =====================================================
       ANIMATION
    ===================================================== */

    const clock =
      new THREE.Clock();

    const animate = () => {
      animationRef.current =
        requestAnimationFrame(
          animate
        );

      const elapsed =
        clock.getElapsedTime();

      /* -----------------------------------------------
         SMOOTH MOUSE ROTATION
      ------------------------------------------------ */

      currentRotation.current.x +=
        (
          targetRotation.current.x -
          currentRotation.current.x
        ) * 0.055;

      currentRotation.current.y +=
        (
          targetRotation.current.y -
          currentRotation.current.y
        ) * 0.055;

      hourglass.rotation.x =
        currentRotation.current.x;

      hourglass.rotation.y =
        currentRotation.current.y;

      /* -----------------------------------------------
         VERY SMALL NATURAL MOVEMENT
      ------------------------------------------------ */

      hourglass.position.y =
        Math.sin(
          elapsed * 0.75
        ) * 0.035;

      hourglass.rotation.z =
        Math.sin(
          elapsed * 0.45
        ) * 0.012;

      /* -----------------------------------------------
         FALLING SAND
      ------------------------------------------------ */

      grains.forEach(
        (grain) => {
          const mesh =
            grain.mesh;

          mesh.position.y -=
            grain.speed * 0.009;

          mesh.position.x +=
            Math.sin(
              elapsed *
                2 +
                grain.offset
            ) *
            0.0015;

          if (
            mesh.position.y <
            -0.45
          ) {
            mesh.position.y =
              0.72 +
              Math.random() *
                0.25;

            mesh.position.x =
              (
                Math.random() -
                0.5
              ) * 0.15;

            mesh.position.z =
              (
                Math.random() -
                0.5
              ) * 0.15;
          }
        }
      );

      renderer.render(
        scene,
        camera
      );
    };

    animate();

    /* =====================================================
       CLEANUP
    ===================================================== */

    return () => {
      cancelAnimationFrame(
        animationRef.current
      );

      window.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      window.removeEventListener(
        "scroll",
        handleScroll
      );

      window.removeEventListener(
        "resize",
        handleResize
      );

      glassGeometry.dispose();
      glassMaterial.dispose();

      postGeometry.dispose();
      woodMaterial.dispose();

      woodHighlight.dispose();
      bronzeMaterial.dispose();

      sandMaterial.dispose();

      topBaseGeometry.dispose();
      bottomBaseGeometry.dispose();

      capGeometry.dispose();
      ringGeometry.dispose();

      upperSandGeometry.dispose();
      lowerSandGeometry.dispose();

      streamGeometry.dispose();
      grainGeometry.dispose();

      renderer.dispose();

      if (
        mount.contains(
          renderer.domElement
        )
      ) {
        mount.removeChild(
          renderer.domElement
        );
      }

      scene.clear();
    };
  }, [location.pathname]);

  if (
    location.pathname !==
    "/dashboard"
  ) {
    return null;
  }

  return (
    <div
      ref={mountRef}
      className={`hourglass-3d ${
        hidden
          ? "hourglass-hidden"
          : ""
      } ${className}`}
      data-size={size}
      aria-hidden="true"
    />
  );
}

export default TimeLens3D;