function ellipseVertices(x, y, rx, ry, step) {
    var vertices = [];

    for (let i = -Math.PI; i < Math.PI; i += step) {
        let _x = Math.sin(i) * rx;
        let _y = Math.cos(i) * ry;

        vertices.push({x: x + _x, y: y + _y});
    }

    return vertices;
}

export default class SVGMapLoader extends EventEmitter {
    constructor(svgFile, options, callback) {
        super();

        this.svgFile = svgFile;
        this.svgElement = document.createElement("svg");
        this.options = options || { scale: 1 };

        //document.body.appendChild(this.svgElement);

        if (callback)
            this.load(callback);
    }

    load(callback) {
        if (this.svg && this.texture) {
            callback(this);
            return;
        }

        this.once("load", callback);

        $.get(this.svgFile, (result) => {
            this.svg = SVG(this.svgElement).svg(result);
            this.svgFirst = this.svg.select("svg").first();

            var bounds = this.bounds(true);
            var w = bounds.width;
            var h = bounds.height;

            this.svg.transform({x: bounds.x, y: bounds.y});
            this.svg.size(w, h);
            this.img = new Image();
            this.img.src = "data:image/svg+xml;utf8," + this.svg.svg();

            this.emit("load", this);
        }, "text");
    }

    getTexture(x, y, width, height) {
        if (typeof x !== 'undefined') {
            let bnds = this.bounds(false);
            this.svg.transform({x, y});
            this.svg.size(width, height);
            this.svgFirst.viewbox(bnds.x + x, bnds.y + y, width, height);
            this.img.src = "data:image/svg+xml;utf8," + this.svg.svg();
        }
        return this.img;
        //}
    }

    bounds(scaled) {
        if (scaled) {
            let scale = this.options.scale;
            let bnds = this.svgFirst.viewbox();
            bnds.width *= scale;
            bnds.height *= scale;
            return bnds;
        } else
            return this.svgFirst.viewbox();
    }

    getCollisionShapes() {
        var shapeElements = this.svg.select("#collision rect, #collision path, #collision line, #collision polyline, #collision polygon, #collision circle, #collision ellipse");

        var collisionShapes = [];
        shapeElements.each((i, child) => {
            collisionShapes.push(this.getShape(child[i]));
        });

        return collisionShapes;
    }

    getShape(svgElement) {
        var scale = this.options.scale;
        var bounds = this.bounds();

        //svgElement.dx(-bounds.x);
        //svgElement.dy(-bounds.y);

        var width = svgElement.width() * scale;
        var height = svgElement.height() * scale;
        var rotation = svgElement.transform("rotation") / 180 * Math.PI;

        let cx = (svgElement.cx() * scale) - bounds.x;
        let cy = (svgElement.cy() * scale) - bounds.y;

        if (svgElement instanceof SVG.Rect) {
            let x = (svgElement.x() * scale) - bounds.x;
            let y = (svgElement.y() * scale) - bounds.y;

            return {cx, cy, x, y, width, height, rotation, type: "rect"};
        } else if (svgElement instanceof SVG.Circle) {
            let radius = svgElement.attr('r') * scale;

            return {cx, cy, radius, rotation, type: "circle"};
        } else if (svgElement instanceof SVG.Ellipse) {
            let rx = svgElement.attr('rx') * scale;
            let ry = svgElement.attr('ry') * scale;

            let vertices = ellipseVertices(cx, cy, rx, ry, 50 / Math.max(rx, ry));

            return {cx, cy, rx, ry, vertices, rotation, type: "ellipse"};
        } else if (svgElement instanceof SVG.Path) {
            let vertices = [];
            let length = svgElement.length();
            let steps = length / 100;

            for (let i = 0; i < length; i += steps) {
                let p = svgElement.pointAt(i);
                p.x *= scale;
                p.y *= scale;

                p.x -= bounds.x;
                p.y -= bounds.y;

                vertices.push(p);
            }

            return {cx, cy, width, height, vertices, rotation, type: "path"};
        } else if (svgElement instanceof SVG.Polyline || svgElement instanceof SVG.Polygon) {
            let vertices = [];
            let points = svgElement.array().value;

            for (let i = 0; i < points.length; i++) {
                let p = {x: points[i][0], y: points[i][1]};

                p.x *= scale;
                p.y *= scale;

                p.x -= bounds.x;
                p.y -= bounds.y;

                vertices.push(p);
            }

            return {cx, cy, width, height, vertices, rotation, type: "polygon"};
        } else if (svgElement instanceof SVG.Line) {
            let x = svgElement.x() * scale;
            let y = svgElement.y() * scale;

            let x2 = svgElement.attr('x2') * scale;
            let y2 = svgElement.attr('y2') * scale;

            let vertices = [];

            vertices.push({x: x, y: y});
            vertices.push({x: x2, y: y2});

            vertices.push({x: x + 1, y: y + 1});
            vertices.push({x: x2 + 1, y: y2 + 1});

            return {cx, cy, x, y, width, height, vertices, rotation, type: "line"};
        }
    }
}
