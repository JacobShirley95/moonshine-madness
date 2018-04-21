const CHASSIS_WIDTH = 450;

import GameObject from "./game-object.js";
import SVGMapLoader from "./svg-map.js";
import ObjectLoader from "./object-loader.js";
import CompositeGameObject from "./composite-game-object.js";
import DeferredPromise from "./deferred-promise.js";

export default class Truck extends CompositeGameObject {
    constructor(x, y, scale) {
        super(Matter.Composite.create({ label: 'Truck' }));

        this.x = x;
        this.y = y;

        //this.scale = scale;
        this.wheels = [];

        this.colGroup = Matter.Body.nextGroup(true);

        var svgLoader = new SVGMapLoader("assets/maps/truck-body.svg", {scale: 1});
        this.body = new ObjectLoader(svgLoader, {mass: 1580, density: 0.02, collisionFilter: {group: this.colGroup}});
        this.gameObjects.push(this.body);

        this.promise = new DeferredPromise((resolve, err) => {
            this.body.load().then((body) => {
                Matter.Body.setPosition(this.body.physicsObj, {x: this.x, y: this.y});
                Matter.Composite.addBody(this.composite, this.body.physicsObj);

                this.com = new createjs.Shape();
                this.com.graphics.beginFill("green").drawRect(0, 0, 15, 15).endFill();

                resolve(this);
            });
        });
    }

    scale(x, y) {
        return this.promise.then((obj) => {
            return super.scale(x, y);
        });
    }

    bounds() {
        return this.body.bounds;
    }

    width() {
        var bounds = this.bounds();
        return bounds.max.x - bounds.min.x;
    }

    height() {
        var bounds = this.bounds();
        return bounds.max.y - bounds.min.y;
    }

    position() {
        return this.body.position();
    }

    velocity() {
        return this.body.velocity();
    }

    centre() {
        return this.body.centre();
    }

    addWheel(offsetX, offsetY, radius, suspensionDamping, suspensionStiffness, friction) {
        this.promise.then(() => {
            let pos = this.position();

            let wheel = Matter.Bodies.circle(pos.x + offsetX, pos.y + offsetY, radius, {
                collisionFilter: { group: this.colGroup },
                friction: friction,
                density: 0.02,
                frictionStatic: 0.2
            });

            let axel = Matter.Constraint.create({
                bodyB: this.body.physicsObj,
                pointB: { x: offsetX, y: offsetY },
                bodyA: wheel,
                stiffness: suspensionStiffness,
                damping: suspensionDamping,
                length: 0
            });

            Matter.Composite.addBody(this.composite, wheel);
            Matter.Composite.addConstraint(this.composite, axel);

            Matter.Body.setMass(wheel, 60);

            let wheelBitmap = new createjs.Bitmap("assets/textures/wheel_01.png");
            wheelBitmap.scale = 1;
            wheelBitmap.regX = 82.5;
            wheelBitmap.regY = 82.5;

            let gO = new GameObject(wheel, wheelBitmap);
            this.gameObjects.push(gO);
            this.wheels.push(gO);
        });
    }

    load(physics) {
        if (physics) {
            this.promise.start();
        }

        return this.promise;
    }
}
