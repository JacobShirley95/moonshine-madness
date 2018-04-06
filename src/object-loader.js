import GameObject from "./game-object.js";

function drawBody(vertices) {
    var s = new createjs.Shape();
    var g = s.graphics;

    g.beginStroke("red");
    g.setStrokeStyle(4);

    var verts = vertices;
    s.x = 0;
    s.y = 0;

    for (var i = 0; i < verts.length; i++) {
        g.moveTo(verts[i].x - s.x, verts[i].y - s.y);
        g.lineTo(verts[(i + 1) % verts.length].x - s.x, verts[(i + 1) % verts.length].y - s.y);
    }

    g.endStroke();

    var r = 20;
    var centre = Matter.Vertices.centre(verts);
    console.log(centre);
    g.beginFill("red").drawEllipse(centre.x - (r / 2), centre.y - (r / 2), r, r).endFill();

    return s;
}

function avg(body) {
    //for ()
}

export default class ObjectLoader extends GameObject {
    constructor(loader, isStatic) {
        super();

        this.loader = loader;
        this.isStatic = isStatic || false;
        this.collisionShapes = [];
    }

    load(physics, callback) {
        var s = null;
        this.loader.load( (loader) => {
            this.collisionShapes = loader.getCollisionShapes();

            var bodies = [];
            for (let shape of this.collisionShapes) {
                var b = null;

                if (shape.type == "rect") {
                    b = Matter.Bodies.rectangle(shape.cx, shape.cy, shape.width, shape.height, {angle: shape.rotation, isStatic: true});
                } else if (shape.type == "circle") {
                    b = Matter.Bodies.circle(shape.cx, shape.cy, shape.radius, {angle: shape.rotation, isStatic: true});
                } else if (shape.type == "line") {
                    b = Matter.Bodies.fromVertices(shape.cx, shape.cy, shape.vertices, {isStatic: true, angle: shape.rotation});
                } else if (shape.type == "ellipse" || shape.type == "polygon" || shape.type == "path") {
                    b = Matter.Bodies.fromVertices(shape.cx, shape.cy, shape.vertices, {isStatic: true, angle: shape.rotation});

                    var bounds = Matter.Bounds.create(shape.vertices);
                    let diff = Matter.Vector.sub(bounds.min, b.bounds.min);
                    Matter.Body.translate(b, diff);
                }

                if (b != null) {
                    Matter.World.addBody(physics, b);
                    bodies.push(b);

                    this.gameObjects.push(new GameObject(b));
                }
            }

            this.physicsObj = Matter.Body.create({isStatic: true});

            loader.getTexture((canvas) => {
                var bitmap = new createjs.Bitmap(canvas);
                var centre = this.position();

                bitmap.regX += centre.x;
                bitmap.regY += centre.y;

                this.renderObj = bitmap;

                callback(this);
            });
        });
    }
}
