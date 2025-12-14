import * as fs from 'fs';
import * as path from 'path';
import * as d3 from 'd3-geo';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const INPUT_FILE = path.resolve(__dirname, '../map_materials/中华人民共和国各省.geojson');
const OUTPUT_FILE = path.resolve(__dirname, '../src/assets/map_data.json');
const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 1200;
const PADDING = 50;

// Ensure output directory exists
const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

interface GameMapData {
    width: number;
    height: number;
    provinces: ProvinceData[];
}

interface ProvinceData {
    name: string;
    adcode: number;
    path: string; // SVG Path string
    points: { x: number, y: number }[]; // Projected polygon points
    center: { x: number, y: number };
    bounds: { minX: number, minY: number, maxX: number, maxY: number };
}

async function build() {
    console.log(`Loading GeoJSON from ${INPUT_FILE}...`);
    const rawData = fs.readFileSync(INPUT_FILE, 'utf-8');
    const geojson = JSON.parse(rawData);

    if (!geojson.features) {
        throw new Error('Invalid GeoJSON: No features found');
    }

    console.log(`Found ${geojson.features.length} features.`);

    // 1. Setup Projection
    // We fit the projection to our target canvas size
    const projection = d3.geoMercator()
        .fitExtent(
            [[PADDING, PADDING], [CANVAS_WIDTH - PADDING, CANVAS_HEIGHT - PADDING]],
            geojson
        );

    const pathGenerator = d3.geoPath().projection(projection);

    const provinces: ProvinceData[] = [];

    for (const feature of geojson.features) {
        const props = feature.properties || {};
        const name = props.name;
        const adcode = props.adcode;

        if (!name) {
            console.warn('Feature missing name, skipping...');
            continue;
        }

        // 2. Generate SVG Path
        // d3-geo generates the SVG path string automatically from the projected geometry
        let svgPath = pathGenerator(feature);

        if (!svgPath) {
            console.warn(`Could not generate path for ${name}`);
            continue;
        }

        // 3. Calculate Bounds and Center
        // We can use pathGenerator.bounds and centroid
        const [[x0, y0], [x1, y1]] = pathGenerator.bounds(feature);
        const [cx, cy] = pathGenerator.centroid(feature);

        // 4. Extract Projected Points (for Phaser Polygon)
        // Handle Polygon and MultiPolygon
        const geometry = feature.geometry;
        let points: { x: number, y: number }[] = [];

        // Helper to project a ring
        const projectRing = (ring: any[]) => {
            return ring.map(coord => {
                const [x, y] = projection(coord) || [0, 0];
                return { x, y };
            });
        };

        if (geometry.type === 'Polygon') {
            // First ring is exterior
            points = projectRing(geometry.coordinates[0]);
        } else if (geometry.type === 'MultiPolygon') {
            // Find the largest polygon by identifying the simple polygon with max points (heuristic)
            // Or better: flatten all, but for a puzzle piece we usually want the main island.
            // Let's just take the first ring of the largest polygon in the MultiPolygon?
            // Or simpler: Just take the first polygon's outer ring. 
            // Most provinces are Polygons. MultiPolygons are islands.
            // For the puzzle game, checking collision with the main body is usually enough.
            // Let's take the ring with the most points as the "main" body.
            let maxPoints = 0;
            let bestRing: any[] = [];

            geometry.coordinates.forEach((poly: any[]) => {
                const ring = poly[0]; // Outer ring
                if (ring.length > maxPoints) {
                    maxPoints = ring.length;
                    bestRing = ring;
                }
            });
            points = projectRing(bestRing);
        }

        // Simplify points to reduce vertex count for Phaser
        // We use the imported simplify-js (which I need to uncomment or use if I removed it)
        // Since I removed the import in previous step to fix build, I need to add valid simplification logic.
        // But for now, let's output raw projected points or implementation simple distance check?
        // Let's stick to raw projected first, optimization later if needed.
        // Actually, d3-geo already simplifies if we set valid context? No.
        // Let's re-add simplify-js properly if we want optimization.
        // For 34 provinces, 100-200 points each is fine.

        // 4. Simplification (Optional but critical for performance)
        // Note: d3-geoPath produces a string. To simplify, we might need to access the coordinates directly.
        // However, d3-geo has built-in resampling. But for "physics" polygons we need points.
        // For this step, we will stick to the SVG Path for visual rendering.
        // If we need physics polygons later, we can extract them from the SVG d string or use the geometry coordinates.
        // For Phaser, we can simply use the SVG path to create a Graphics object or Physics body.

        // Let's keep the full path for high-quality rendering, 
        // but if we were strictly following the architecture plan, we might want to simplify the coordinates first.
        // But d3-geo projects directly to string.

        // REVISION: The architecture called for simplification.
        // Parsing the SVG path string back to points is one way, or projecting the coordinates manually.
        // For now, let's output the SVG path string. It's standard and Phaser handles it well (Graphics.fillPath).
        // Physics bodies can be approximated from the bounds or circle for the "Slot" logic (Center Point Distance).
        // The game logic only requires "Center Point Distance" for snapping, so complex physics bodies are NOT required yet.
        // Simple bounding box is enough for input detection optimization.

        provinces.push({
            name,
            adcode,
            path: svgPath,
            points: points, // New physics/graphics data
            center: { x: cx, y: cy },
            bounds: { minX: x0, minY: y0, maxX: x1, maxY: y1 }
        });
    }

    const outputData: GameMapData = {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        provinces
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2));
    console.log(`Successfully wrote map data to ${OUTPUT_FILE}`);
    console.log(`Total Provinces: ${provinces.length}`);
}

build().catch(err => {
    console.error(err);
    process.exit(1);
});
