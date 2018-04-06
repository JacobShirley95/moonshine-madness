function ellipseVertices(x, y, rx, ry, step) {
    var rxSquared = rx * rx;
    var rySquared = ry * ry;
    var rSquared = (rx + ry) * (rx + ry);

    var vertices = [];

    for (let i = -Math.PI; i < Math.PI; i += step) {
        let _x = Math.sin(i) * rx;
        let _y = Math.cos(i) * ry;

        vertices.push({x: x + _x, y: y + _y});
    }

    return vertices;
}

export default class SVGMapLoader {
    constructor(svgFile, options, callback) {
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

        $.get(this.svgFile, (result) => {
            this.svg = SVG(this.svgElement).svg(result);
            var scale = this.options.scale;
            var bounds = this.bounds();

            var w = bounds.width * scale;
            var h = bounds.height * scale;

            this.svg.size(w, h);

            console.log(bounds.width);

            this.texture = document.createElement("canvas");
            this.texture.setAttribute("width", w);
            this.texture.setAttribute("height", h);

            var ctx = this.texture.getContext('2d');

            var img = new Image();
            img.src = this.svgFile;
            img.onload = () => {
                ctx.drawImage(img, 0, 0, w, h);

                callback(this);
            };
        }, "text");
    }

    getTexture() {
        return this.texture;
    }

    bounds() {
        return this.svg.select("svg").first().viewbox();
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

        var width = svgElement.width() * scale;
        var height = svgElement.height() * scale;
        var rotation = svgElement.transform("rotation") / 180 * Math.PI;

        let cx = svgElement.cx() * scale;
        let cy = svgElement.cy() * scale;

        if (svgElement instanceof SVG.Rect) {
            let x = svgElement.x() * scale;
            let y = svgElement.y() * scale;

            return {cx, cy, x, y, width, height, rotation, type: "rect"};
        } else if (svgElement instanceof SVG.Circle) {
            let radius = svgElement.attr('r') * scale;

            return {cx, cy, radius, rotation, type: "circle"};
        } else if (svgElement instanceof SVG.Ellipse) {
            let rx = svgElement.attr('rx') * scale;
            let ry = svgElement.attr('ry') * scale;

            let vertices = ellipseVertices(cx, cy, rx, ry, 0.1);

            return {cx, cy, rx, ry, vertices, rotation, type: "ellipse"};
        } else if (svgElement instanceof SVG.Path) {
            let vertices = [];
            let length = svgElement.length();
            let steps = 0.2;

            for (let i = 0; i < length; i += steps) {
                let p = svgElement.pointAt(i);
                p.x *= scale;
                p.y *= scale;
                vertices.push(p);
            }

            return {cx, cy, width, height, vertices, rotation, type: "path"};
        } else if (svgElement instanceof SVG.Polyline || svgElement instanceof SVG.Polygon) {
            let vertices = [];
            let points = svgElement.array().value;
            let steps = 0.5;

            for (let i = 0; i < points.length; i++) {
                let p = {x: points[i][0], y: points[i][1]};

                p.x *= scale;
                p.y *= scale;

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
