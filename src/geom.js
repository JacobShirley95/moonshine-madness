export default class Geom {
    static ellipseVertices(x, y, rx, ry, step) {
        let vertices = [];

        for (let i = -Math.PI; i < Math.PI; i += step) {
            let _x = Math.sin(i) * rx;
            let _y = Math.cos(i) * ry;

            vertices.push({x: x + _x, y: y + _y});
        }

        return vertices;
    }

    static inBox(point, box) {
        return point.x >= box.x && point.y >= box.y && point.x <= box.x + box.width && point.y <= box.y + box.height;
    }
}
