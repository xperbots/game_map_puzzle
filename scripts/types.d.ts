declare module 'simplify-js' {
    function simplify(points: { x: number, y: number }[], tolerance?: number, highQuality?: boolean): { x: number, y: number }[];
    export = simplify;
}
