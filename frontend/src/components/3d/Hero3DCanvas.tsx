"use client";

import React, { useEffect, useRef } from "react";

interface Node3D {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  size: number;
  color: string;
}

export default function Hero3DCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Retina display resolution
    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Generate 3D Spherical & Orbital Lattice
    const nodeCount = 55;
    const radius = 170;
    const nodes: Node3D[] = [];

    // Colors: Teal, Indigo, Cyan, Emerald
    const colorPalette = ["#0d9488", "#14b8a6", "#6366f1", "#06b6d4", "#3b82f6"];

    for (let i = 0; i < nodeCount; i++) {
      // Golden spiral distribution on a sphere
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      nodes.push({
        x,
        y,
        z,
        baseX: x,
        baseY: y,
        baseZ: z,
        size: Math.random() * 2.5 + 2.5,
        color: colorPalette[i % colorPalette.length],
      });
    }

    // Rotation angles and mouse interaction
    let rotX = 0;
    let rotY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let mouseActive = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left - rect.width / 2;
      const clientY = e.clientY - rect.top - rect.height / 2;

      // Sensitivity
      targetRotY = (clientX / (rect.width / 2)) * 0.9;
      targetRotX = -(clientY / (rect.height / 2)) * 0.9;
      mouseActive = true;
    };

    const handleMouseLeave = () => {
      mouseActive = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!canvas || e.touches.length === 0) return;
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const clientX = touch.clientX - rect.left - rect.width / 2;
      const clientY = touch.clientY - rect.top - rect.height / 2;

      targetRotY = (clientX / (rect.width / 2)) * 0.8;
      targetRotX = -(clientY / (rect.height / 2)) * 0.8;
      mouseActive = true;
    };

    const parent = canvas.parentElement || canvas;
    parent.addEventListener("mousemove", handleMouseMove);
    parent.addEventListener("mouseleave", handleMouseLeave);
    parent.addEventListener("touchmove", handleTouchMove, { passive: true });

    // Render loop
    let isVisible = true;
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const perspective = 380;
    let autoAngle = 0;

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Smooth auto-rotation when mouse is not active
      autoAngle += 0.005;
      if (!mouseActive) {
        targetRotY = Math.sin(autoAngle) * 0.4;
        targetRotX = Math.cos(autoAngle * 0.7) * 0.2;
      }

      // Smooth damping (lerp)
      rotX += (targetRotX - rotX) * 0.06;
      rotY += (targetRotY - rotY) * 0.06;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY + autoAngle * 0.2);
      const sinY = Math.sin(rotY + autoAngle * 0.2);

      const centerX = width / 2;
      const centerY = height / 2;

      // Projected points storage
      const projectedNodes: { px: number; py: number; pz: number; scale: number; node: Node3D }[] = [];

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // 3D rotation math (around Y axis then X axis)
        const x1 = n.baseX * cosY - n.baseZ * sinY;
        const z1 = n.baseZ * cosY + n.baseX * sinY;

        const y1 = n.baseY * cosX - z1 * sinX;
        const z2 = z1 * cosX + n.baseY * sinX;

        // Perspective projection
        const scale = perspective / (perspective + z2 + radius);
        const px = x1 * scale + centerX;
        const py = y1 * scale + centerY;

        projectedNodes.push({ px, py, pz: z2, scale, node: n });
      }

      // Sort by depth (painter's algorithm)
      projectedNodes.sort((a, b) => a.pz - b.pz);

      // Draw connecting lines in 3D space
      const maxDistance = 90;
      ctx.lineWidth = 1;

      for (let i = 0; i < projectedNodes.length; i++) {
        const p1 = projectedNodes[i];
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const p2 = projectedNodes[j];

          // Calculate 3D euclidean distance
          const dx = p1.node.x - p2.node.x;
          const dy = p1.node.y - p2.node.y;
          const dz = p1.pz - p2.pz;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.35 * Math.min(p1.scale, p2.scale);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(13, 148, 136, ${alpha})`;
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        }
      }

      // Draw glowing 3D nodes
      for (let i = 0; i < projectedNodes.length; i++) {
        const p = projectedNodes[i];
        const r = Math.max(1, p.node.size * p.scale);
        const alpha = Math.min(1, Math.max(0.3, (p.scale - 0.4) * 1.5));

        // Outer glow
        const gradient = ctx.createRadialGradient(p.px, p.py, 0, p.px, p.py, r * 2.8);
        gradient.addColorStop(0, p.node.color);
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(p.px, p.py, r * 2.8, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.fillStyle = p.node.color;
        ctx.globalAlpha = alpha;
        ctx.arc(p.px, p.py, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      parent.removeEventListener("mousemove", handleMouseMove);
      parent.removeEventListener("mouseleave", handleMouseLeave);
      parent.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full block select-none pointer-events-none ${className}`}
      style={{ touchAction: "none" }}
    />
  );
}
