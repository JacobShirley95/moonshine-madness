import GameObject from "./game-object.js";

export default class ObjectLoader extends GameObject {
    constructor(loader, options) {
        super();

        this.loader = loader;
        this.options = options;
        this.collisionShapes = [];
    }

    load(physics, callback) {
        var s = null;
        this.loader.load( (loader) => {
            this.collisionShapes = loader.getCollisionShapes();

            this.create(this.collisionShapes);
            callback(this);
        });
    }

    create(collisionShapes) {
        var bodies = [];
        for (let shape of collisionShapes) {
            var b = null;
            let options = Object.assign({angle: shape.rotation}, this.options);
            delete options.position;
            delete options.mass;
            delete options.collisionFilter;

            if (shape.type == "rect") {
                b = Matter.Bodies.rectangle(shape.cx, shape.cy, shape.width, shape.height, options);
            } else if (shape.type == "circle") {
                b = Matter.Bodies.circle(shape.cx, shape.cy, shape.radius, options);
            } else if (shape.type == "line") {
                b = Matter.Bodies.fromVertices(shape.cx, shape.cy, shape.vertices, options);
            } else if (shape.type == "ellipse" || shape.type == "polygon" || shape.type == "path") {
                b = Matter.Bodies.fromVertices(shape.cx, shape.cy, shape.vertices, options);

                let bounds = Matter.Bounds.create(shape.vertices);
                let diff = Matter.Vector.sub(bounds.min, b.bounds.min);
                Matter.Body.translate(b, diff);
            }

            if (b != null) {
                //Matter.Body.setMass(b, this.options.mass);
                bodies.push(b);

                this.gameObjects.push(new GameObject(b));
            }
        }

        let options = Object.assign({parts: bodies}, this.options);
        delete options.position;
        delete options.mass;

        this.physicsObj = Matter.Body.create(options);

        //if (this.options.position)
        //    Matter.Body.setPosition(this.physicsObj, this.options.position);

        if (typeof this.options.mass !== 'undefined')
            Matter.Body.setMass(this.physicsObj, this.options.mass);

        var bitmap = new createjs.Bitmap(this.loader.getTexture());
        var centre = this.position();

        bitmap.regX += centre.x;
        bitmap.regY += centre.y;

        this.renderObj = bitmap;
    }
}
