const CHASSIS_WIDTH = 450;

import GameObject from "./game-object.js";
import SVGMapLoader from "./svg-map.js";
import ObjectLoader from "./object-loader.js";
import CompositeGameObject from "./composite-game-object.js";

export default class Truck extends CompositeGameObject {
    constructor(x, y, scale) {
        super();

        this.x = x;
        this.y = y;

        this.scale = scale;
        this.wheels = [];
        this._wheelProperties = [];

        this.colGroup = Matter.Body.nextGroup(true);
        this.carComposite = Matter.Composite.create({ label: 'Truck' });

        var svgLoader = new SVGMapLoader("assets/maps/truck-body.svg");
        this.body = new ObjectLoader(svgLoader, {mass: 1580, density: 0.02, collisionFilter: {group: this.colGroup}});
    }

    bounds() {
        return this.body.bounds;
    }

    width() {
        var bounds = this.body.bounds;
        return bounds.max.x - bounds.min.x;
    }

    height() {
        var bounds = this.body.bounds;
        return bounds.max.y - bounds.min.y;
    }

    position() {
        return this.body.physicsObj.position;
    }

    velocity() {
        return this.body.physicsObj.velocity;
    }

    centre() {
        return Matter.Vertices.centre(this.body.physicsObj.vertices);
    }

    chassisCentre() {
        return Matter.Vertices.centre(this.chassis.physicsObj.vertices);
    }

    addWheel(offsetX, offsetY, radius, suspensionDamping, suspensionStiffness, friction) {
        this._wheelProperties.push({offsetX, offsetY, radius, suspensionDamping, suspensionStiffness, friction});
    }

    load(physics, callback) {
        this.body.load(physics, (body) => {
            this.gameObjects.push(this.body);

            Matter.Body.setPosition(this.body.physicsObj, {x: this.x, y: this.y});
            Matter.Composite.addBody(this.carComposite, this.body.physicsObj);

            for (let props of this._wheelProperties) {
                let pos = this.position();

                let wheel = Matter.Bodies.circle(pos.x + props.offsetX, pos.y + props.offsetY, props.radius, {
                    collisionFilter: { group: this.colGroup },
                    friction: props.friction,
                    density: 0.02,
                    frictionStatic: 0.2
                });

                let axel = Matter.Constraint.create({
                    bodyB: this.body.physicsObj,
                    pointB: { x: props.offsetX, y: props.offsetY },
                    bodyA: wheel,
                    stiffness: props.suspensionStiffness,
                    damping: props.suspensionDamping,
                    length: 0
                });

                Matter.Composite.addBody(this.carComposite, wheel);
                Matter.Composite.addConstraint(this.carComposite, axel);

                Matter.Body.setMass(wheel, 60);

                let wheelBitmap = new createjs.Bitmap("assets/textures/wheel_01.png");
                wheelBitmap.scale = 1;
                wheelBitmap.regX = 82.5;
                wheelBitmap.regY = 82.5;

                let gO = new GameObject(wheel, wheelBitmap);
                this.gameObjects.push(gO);
                this.wheels.push(gO);
            }

            Matter.World.add(physics, this.carComposite);

            this.physicsObj = this.carComposite;

            this.com = new createjs.Shape();
            this.com.graphics.beginFill("green").drawRect(0, 0, 15, 15).endFill();

            callback(this);
        });

        //world.renderer.addObject(this.com);
    }

    update() {
    }
}
