'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';

const ThreeBackground = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);
        containerRef.current.appendChild(renderer.domElement);
        // ذرات (ذرات طلایی و بنفش)
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 1500;
        const posArray = new Float32Array(particlesCount * 3);
        for (let i = 0; i < particlesCount * 3; i += 3) {
            posArray[i] = (Math.random() - 0.5) * 30;
            posArray[i + 1] = (Math.random() - 0.5) * 20;
            posArray[i + 2] = (Math.random() - 0.5) * 20;
        }
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.04,
            color: 0xd4af37, // طلایی
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending
        });
        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        // دومین مجموعه ذرات با رنگ بنفش
        const particlesMaterial2 = new THREE.PointsMaterial({
            size: 0.03,
            color: 0x8b5cf6,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending
        });
        const particlesMesh2 = new THREE.Points(particlesGeometry, particlesMaterial2);
        scene.add(particlesMesh2);

        camera.position.z = 5;

        let mouseX = 0, mouseY = 0;
        window.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = (event.clientY / window.innerHeight) * 2 - 1;
        });

        const animate = () => {
            requestAnimationFrame(animate);
            particlesMesh.rotation.y += 0.0005;
            particlesMesh.rotation.x += 0.0003;
            particlesMesh2.rotation.y -= 0.0004;
            particlesMesh2.rotation.z += 0.0002;
            // حرکت دوربین با ماوس
            camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.35;
            camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.15;
            camera.lookAt(0, 0, 0);
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            containerRef.current?.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

    return <motion.div
        ref={containerRef}
        className="fixed inset-0 -z-0 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        aria-hidden="true"
    />;
};

export default ThreeBackground;