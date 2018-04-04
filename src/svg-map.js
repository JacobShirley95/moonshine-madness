export default class SVGMapLoader {
    constructor(svgFile, callback) {
        this.svgFile = svgFile;

        $.get(svgFile, (result) => {
            this.svg = SVG(document.createElement("svg")).svg(result);
            callback(this);
        }, "text");
    }

    getCollisionShapes() {
        var shapeElements = this.svg.select("#collision rect, #collision path, #collision polyline");

        var collisionShapes = [];
        shapeElements.each((i, child) => {
            collisionShapes.push(this.getShape(child[i]));
        });

        return collisionShapes;
    }

    getShape(svgElement) {
        var width = svgElement.width();
        var height = svgElement.height();
        var rotation = svgElement.transform("rotation") / 180 * Math.PI;

        let cx = svgElement.cx();
        let cy = svgElement.cy();

        if (svgElement instanceof SVG.Rect) {
            let x = svgElement.x();
            let y = svgElement.y();

            return {cx, cy, x, y, width, height, rotation, type: "rect"};
        } else if (svgElement instanceof SVG.Circle) {
            let radius = svgElement.radius();

            return {cx, cy, radius, rotation, type: "circle"};
        } else if (svgElement instanceof SVG.Path) {
            let vertices = [];
            let length = svgElement.length();
            let steps = 0.5;

            let x = svgElement.x();
            let y = svgElement.y();

            for (let i = 0; i < length; i += steps) {
                let p = svgElement.pointAt(i);
                vertices.push(p);

                //console.log(p.x);
            }

            return {cx, cy, width, height, vertices, rotation, type: "path"};
        } else if (svgElement instanceof SVG.Polyline) {
            let vertices = [];
            let points = svgElement.array().value;
            let steps = 0.5;

            for (let i = 0; i < points.length; i++) {
                let p = {x: points[i][0], y: points[i][1]};

                vertices.push(p);
            }

            return {cx, cy, width, height, vertices, rotation, type: "polyline"};
        }
    }
}
