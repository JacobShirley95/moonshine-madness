import GameObject from "./game-object.js";

export default class ObjectLoader extends GameObject {
    constructor(loader, isStatic) {
        super();

        this.loader = loader;
        this.isStatic = isStatic;
        this.collisionShapes = [];
    }

    load(physics, callback) {
        var s = null;
        this.loader.load( (loader) => {
            this.collisionShapes = loader.getCollisionShapes();

            this.create(physics, this.collisionShapes);
            callback(this);
        });
    }

    create(physics, collisionShapes) {
        var bodies = [];
        for (let shape of collisionShapes) {
            var b = null;

            if (shape.type == "rect") {
                b = Matter.Bodies.rectangle(shape.cx, shape.cy, shape.width, shape.height, {angle: shape.rotation, isStatic: this.isStatic});
            } else if (shape.type == "circle") {
                b = Matter.Bodies.circle(shape.cx, shape.cy, shape.radius, {angle: shape.rotation, isStatic: this.isStatic});
            } else if (shape.type == "line") {
                b = Matter.Bodies.fromVertices(shape.cx, shape.cy, shape.vertices, {isStatic: this.isStatic, angle: shape.rotation});
            } else if (shape.type == "ellipse" || shape.type == "polygon" || shape.type == "path") {
                b = Matter.Bodies.fromVertices(shape.cx, shape.cy, shape.vertices, {isStatic: this.isStatic, angle: shape.rotation});

                var bounds = Matter.Bounds.create(shape.vertices);
                let diff = Matter.Vector.sub(bounds.min, b.bounds.min);
                Matter.Body.translate(b, diff);
            }

            if (b != null) {
                bodies.push(b);

                this.gameObjects.push(new GameObject(b));
            }
        }

        this.physicsObj = Matter.Body.create({parts: bodies, isStatic: this.isStatic});
        Matter.World.addBody(physics, this.physicsObj);

        var bitmap = new createjs.Bitmap(this.loader.getTexture());
        var centre = this.position();

        bitmap.regX += centre.x;
        bitmap.regY += centre.y;

        this.renderObj = bitmap;
    }
}
