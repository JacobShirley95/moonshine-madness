import Geom from "./geom.js";
import Texture from "./texture.js";

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
        if (this.promise)
            return this.promise;

        this.promise = new Promise((resolve, reject) => {
            $.get(this.svgFile, (result) => {
                this.svgString = result;

                for (let el of $(result)) {
                    if (el.tagName == "svg") {
                        this.svgElement = el;
                        break;
                    }
                }
                //this.svgElement.innerHTML = result;

                this.svg = SVG(this.svgElement).svg(result);

                let bounds = this.bounds(true);
                let w = bounds.width;
                let h = bounds.height;

                this.svg.transform({x: bounds.x, y: bounds.y});
                this.svg.attr('preserveAspectRatio', 'none');

                resolve(this);
            }, "text");
        });

        this.promise.then(callback);
    }

    scale(sc = 1) {
        if (typeof this.options.scale !== 'undefined') {
            this.options.scale = sc;
        }
        return this.options.scale;
    }

    getTexture(x, y, width, height) {
        //await this.promise;


        if (typeof x !== 'undefined') {
            let scale = this.options.scale;
            let bnds = this.bounds(false);

            this.svg.transform({x: 0, y: 0});
            this.svg.size(width, height);

            let invScale = 1/scale;

            x *= invScale;
            y *= invScale;
            width *= invScale;
            height *= invScale;

            this.svg.viewbox(bnds.x + x, bnds.y + y, width, height);

            let img = new Image();
            img.src = "data:image/svg+xml;utf8," + this.svg.svg();
            img.onload = () => {
                console.log(img.width);
                console.log(img.height);
            }

            document.body.appendChild(img);

            this.svg.transform({x: 0, y: 0});
            this.svg.size(bnds.width, bnds.height);
            this.svg.viewbox(bnds.x, bnds.y, bnds.width, bnds.height);

            return new Texture(x, y, width, height, img);
        } else {
            if (!this.img) {
                let img = new Image();
                img.src = "data:image/svg+xml;utf8," + this.svg.svg();

                let w = this.svg.attr("width");
                let h = this.svg.attr("height");

                this.img = new Texture(0, 0, w, h, img);
            }
            return this.img;
        }
    }

    bounds(scaled) {
        if (scaled) {
            let scale = this.options.scale;
            let bnds = this.svg.viewbox();
            bnds.width *= scale;
            bnds.height *= scale;
            return bnds;
        } else
            return this.svg.viewbox();
    }

    getCollisionShapes(x, y, width, height) {
        let shapeElements = this.svg.select("#collision rect, #collision path, #collision line, #collision polyline, #collision polygon, #collision circle, #collision ellipse");
        let collisionShapes = [];
        let box = {x, y, width, height};

        if (typeof x === 'undefined') {
            shapeElements.each((i, child) => {
                collisionShapes.push(this.getShape(child[i]));
            });
        } else {
            shapeElements.each((i, child) => {
                let el = child[i];

                if (Geom.inBox({x: el.x(), y: el.y()}, box)) {
                    collisionShapes.push(this.getShape(el));
                }

            });
        }

        return collisionShapes;
    }

    getShape(svgElement) {
        let scale = this.options.scale;
        let bounds = this.bounds();

        let width = svgElement.width() * scale;
        let height = svgElement.height() * scale;
        let rotation = svgElement.transform("rotation") / 180 * Math.PI;

        let cx = (svgElement.cx() - bounds.x) * scale;
        let cy = (svgElement.cy() - bounds.y) * scale;

        if (svgElement instanceof SVG.Rect) {
            let x = (svgElement.x() - bounds.x) * scale;
            let y = (svgElement.y() - bounds.y) * scale;

            return {cx, cy, x, y, width, height, rotation, type: "rect"};
        } else if (svgElement instanceof SVG.Circle) {
            let radius = svgElement.attr('r') * scale;

            return {cx, cy, radius, rotation, type: "circle"};
        } else if (svgElement instanceof SVG.Ellipse) {
            let rx = svgElement.attr('rx') * scale;
            let ry = svgElement.attr('ry') * scale;

            let vertices = Geom.ellipseVertices(cx, cy, rx, ry, 50 / Math.max(rx, ry));

            return {cx, cy, rx, ry, vertices, rotation, type: "ellipse"};
        } else if (svgElement instanceof SVG.Path) {
            let vertices = [];
            let length = svgElement.length();
            let steps = 10;

            for (let i = 0; i < length; i += steps) {
                let p = svgElement.pointAt(i);

                p.x -= bounds.x;
                p.y -= bounds.y;

                p.x *= scale;
                p.y *= scale;

                vertices.push(p);
            }

            return {cx, cy, width, height, vertices, rotation, type: "path"};
        } else if (svgElement instanceof SVG.Polyline || svgElement instanceof SVG.Polygon) {
            let vertices = [];
            let points = svgElement.array().value;

            for (let i = 0; i < points.length; i++) {
                let p = {x: points[i][0], y: points[i][1]};

                p.x -= bounds.x;
                p.y -= bounds.y;

                p.x *= scale;
                p.y *= scale;

                vertices.push(p);
            }

            return {cx, cy, width, height, vertices, rotation, type: "polygon"};
        } else if (svgElement instanceof SVG.Line) {
            let x = (svgElement.x() - bounds.x) * scale;
            let y = (svgElement.y() - bounds.y) * scale;

            let x2 = (svgElement.attr('x2') - bounds.x) * scale;
            let y2 = (svgElement.attr('y2') - bounds.y) * scale;

            let vertices = [];

            vertices.push({x: x, y: y});
            vertices.push({x: x2, y: y2});

            vertices.push({x: x + 1, y: y + 1});
            vertices.push({x: x2 + 1, y: y2 + 1});

            return {cx, cy, x, y, width, height, vertices, rotation, type: "line"};
        }
    }
}
