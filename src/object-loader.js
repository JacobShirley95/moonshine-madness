import GameObject from "./game-object.js";
import DeferredPromise from "./deferred-promise.js";

export default class ObjectLoader extends GameObject {
    constructor(loader, options) {
        super();

        this.loader = loader;
        this.options = options;
        this.collisionShapes = [];

        this.promise = new DeferredPromise((resolve, reject) => {
            this.loader.load( (loader) => {
                this.collisionShapes = loader.getCollisionShapes();

                this.create(this.collisionShapes);
                this.setTexture(loader.getTexture());

                this.promise.resolve(this);
            });
        });
    }

    load() {
        return this.promise.start();
    }

    applyForce(force) {
        return this.promise.then(() => {
            return super.applyForce(force);
        });
    }

    position() {
        return this.physicsObj ? super.position() : (this.options.position || {x: 0, y: 0});
    }

    velocity() {
        return this.physicsObj ? super.velocity() : {x: 0, y: 0};
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

                //this.gameObjects.push(new GameObject(b));
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
    }

    setTexture(tex) {
        var bitmap = new createjs.Bitmap(tex);
        var centre = this.position();

        bitmap.regX += centre.x;
        bitmap.regY += centre.y;

        this.renderObj = bitmap;
    }
}
