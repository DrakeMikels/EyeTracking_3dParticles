import * as THREE from 'three';

// Helper to get random point in sphere
export function getSpherePoints(count) {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const r = 2 * Math.cbrt(Math.random());
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
}

// Heart Shape
export function getHeartPoints(count) {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        // Parametric heart equation
        // x = 16sin^3(t)
        // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
        // z = random thickness

        const t = Math.random() * 2 * Math.PI;
        const scale = 0.15;

        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        const z = (Math.random() - 0.5) * 5; // Thickness

        // Add some random noise to fill the volume
        const r = Math.random();

        positions[i * 3] = x * scale * r;
        positions[i * 3 + 1] = y * scale * r;
        positions[i * 3 + 2] = z * scale * r;
    }
    return positions;
}

// Flower Shape (Rose curve)
export function getFlowerPoints(count) {
    const positions = new Float32Array(count * 3);
    const k = 4; // Number of petals
    for (let i = 0; i < count; i++) {
        const theta = Math.random() * 2 * Math.PI;
        const r_flower = Math.cos(k * theta);
        const r_random = Math.random(); // Fill

        const scale = 2.5;
        const x = r_flower * Math.cos(theta) * scale * r_random;
        const y = r_flower * Math.sin(theta) * scale * r_random;
        const z = (Math.random() - 0.5) * 0.5;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
    }
    return positions;
}

// Saturn (Planet + Ring)
export function getSaturnPoints(count) {
    const positions = new Float32Array(count * 3);
    const planetRatio = 0.4;
    const planetCount = Math.floor(count * planetRatio);
    const ringCount = count - planetCount;

    // Planet (Sphere)
    for (let i = 0; i < planetCount; i++) {
        const r = 1.2 * Math.cbrt(Math.random());
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
    }

    // Rings (Disc)
    for (let i = planetCount; i < count; i++) {
        const innerRadius = 1.8;
        const outerRadius = 3.5;
        const r = Math.sqrt(Math.random() * (outerRadius * outerRadius - innerRadius * innerRadius) + innerRadius * innerRadius);
        const theta = Math.random() * 2 * Math.PI;

        positions[i * 3] = r * Math.cos(theta);
        positions[i * 3 + 1] = (Math.random() - 0.5) * 0.1; // Thin
        positions[i * 3 + 2] = r * Math.sin(theta);

        // Tilt the ring
        const x = positions[i * 3];
        const y = positions[i * 3 + 1];
        const z = positions[i * 3 + 2];

        const tilt = Math.PI / 6;
        positions[i * 3] = x * Math.cos(tilt) - y * Math.sin(tilt);
        positions[i * 3 + 1] = x * Math.sin(tilt) + y * Math.cos(tilt);
    }

    return positions;
}

// Fireworks (Explosion)
export function getFireworksPoints(count) {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const r = 3 * Math.cbrt(Math.random()); // Larger spread
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);

        // Add trails? For now just a big sphere burst
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
}

// Buddha (Approximation using stacked spheres/cylinders or just a meditative pose shape)
// Since we don't have a model, let's try a procedural "Snowman" style or simple meditative silhouette
export function getBuddhaPoints(count) {
    const positions = new Float32Array(count * 3);
    // Head, Body, Base
    for (let i = 0; i < count; i++) {
        const section = Math.random();
        let cx = 0, cy = 0, cz = 0, r = 0;

        if (section < 0.2) {
            // Head
            cy = 1.5;
            r = 0.6;
        } else if (section < 0.6) {
            // Body
            cy = 0.2;
            r = 1.0;
        } else {
            // Base/Legs
            cy = -1.0;
            r = 1.4;
            // Flatten base
            const theta = Math.random() * 2 * Math.PI;
            const rad = Math.sqrt(Math.random()) * r;
            positions[i * 3] = rad * Math.cos(theta);
            positions[i * 3 + 1] = cy + (Math.random() - 0.5) * 0.5;
            positions[i * 3 + 2] = rad * Math.sin(theta);
            continue;
        }

        // Sphere filling for Head/Body
        const rad = Math.cbrt(Math.random()) * r;
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3] = cx + rad * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = cy + rad * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = cz + rad * Math.cos(phi);
    }
    return positions;
}
