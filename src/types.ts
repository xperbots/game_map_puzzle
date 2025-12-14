export interface ProvinceData {
    name: string;
    adcode: number;
    path: string;
    points: { x: number; y: number }[];
    center: { x: number; y: number };
    bounds: { minX: number; minY: number; maxX: number; maxY: number };
}

export interface GameMapData {
    width: number;
    height: number;
    provinces: ProvinceData[];
}
