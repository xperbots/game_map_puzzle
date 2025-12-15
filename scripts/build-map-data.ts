import * as fs from 'fs';
import * as path from 'path';
import * as d3 from 'd3-geo';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const INPUT_FILE = path.resolve(__dirname, '../map_materials/中华人民共和国各省.json');
const OUTPUT_FILE = path.resolve(__dirname, '../src/assets/map_data.json');
const CANVAS_WIDTH = 8000;
const CANVAS_HEIGHT = 6000;
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

        // 3. Calculate Bounds and Center FROM the projected points (NOT from d3 pathGenerator)
        // d3 pathGenerator.bounds() includes the projection frame which is wrong

        // 4. Extract Projected Points (for Phaser Polygon)
        // Handle Polygon and MultiPolygon
        const geometry = feature.geometry;
        let points: { x: number, y: number }[] = [];

        // Helper to project a ring
        const projectRing = (ring: any[]) => {
            return ring.map(coord => {
                const projected = projection(coord);
                if (!projected) return { x: 0, y: 0 };
                return { x: projected[0], y: projected[1] };
            }).filter(p => p.x !== 0 || p.y !== 0); // Filter out null projections
        };

        if (geometry.type === 'Polygon') {
            // First ring is exterior
            points = projectRing(geometry.coordinates[0]);
        } else if (geometry.type === 'MultiPolygon') {
            // Find the largest polygon by point count
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

        // Skip if no valid points
        if (points.length === 0) {
            console.warn(`No valid points for ${name}, skipping...`);
            continue;
        }

        // Calculate bounds FROM the actual points (not from d3 which includes frame)
        const xs = points.map(p => p.x);
        const ys = points.map(p => p.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        // Calculate center as centroid of the points
        const cx = xs.reduce((a, b) => a + b, 0) / xs.length;
        const cy = ys.reduce((a, b) => a + b, 0) / ys.length;

        console.log(`${name}: bounds (${minX.toFixed(0)},${minY.toFixed(0)}) to (${maxX.toFixed(0)},${maxY.toFixed(0)}), center (${cx.toFixed(0)},${cy.toFixed(0)}), ${points.length} points`);

        provinces.push({
            name,
            adcode,
            path: svgPath,
            points: points,
            center: { x: cx, y: cy },
            bounds: { minX, minY, maxX, maxY }
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
