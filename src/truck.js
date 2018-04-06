function setPos(body, renderObj) {
    renderObj.x = body.position.x + offsetX;
    renderObj.y = body.position.y;
    renderObj.rotation = Math.degrees(addAngles(body));
}

function addAngles(body) {
    if (body.parent != body) {
        return body.angle + addAngles(body.parent);
    }
    return body.angle;
}

const CHASSIS_WIDTH = 450;

import GameObject from "./game-object.js";
import CompositeGameObject from "./composite-game-object.js";

export default class Truck extends CompositeGameObject {
    constructor(x, y, scale) {
        super();

        this.scale = scale;
        this.wheels = [];

        this.colGroup = Matter.Body.nextGroup(true);
        this.carComposite = Matter.Composite.create({ label: 'Car' });

        var chassis = Matter.Bodies.rectangle(x, y, CHASSIS_WIDTH, 50, {
            density: 0.02,
            friction: 0.7
        });
        Matter.Body.setMass(chassis, 380);

        var body2 = new createjs.Bitmap("assets/textures/car_body.png");
        body2.scaleX = 0.5;
        body2.scaleY = 0.5;
        body2.regX = 451.5;
        body2.regY = 155 + 95;

        this.chassis = new GameObject(chassis, body2);

        var cargo = Matter.Bodies.rectangle(x - 120, y - 50, 130, 40, {
            density: 0.02
        });
        Matter.Body.setMass(cargo, 200);

        this.cargo = new GameObject(cargo, null);

        var cargoDoor = Matter.Bodies.rectangle(x + (CHASSIS_WIDTH * 0.5), y - 70, 10, 100, {
            density: 0.02
        });
        Matter.Body.setMass(cargoDoor, 20);

        this.cargoDoor = new GameObject(cargoDoor, null);

        var cabin = Matter.Bodies.rectangle(x - 10, y - 70, 100, 100, {
            density: 0.02
        });
        Matter.Body.setMass(cabin, 300);

        this.cabin = new GameObject(cabin, null);

        var body = Matter.Body.create({
            parts: [chassis, cargo, cargoDoor, cabin],
            collisionFilter: { group: this.colGroup },
        });

        this.body = new GameObject(body, null, this.chassis, this.cargo, this.cargoDoor, this.cabin);
        this.gameObjects.push(this.body);
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

    centre() {
        return Matter.Vertices.centre(this.body.physicsObj.vertices);
    }

    chassisCentre() {
        return Matter.Vertices.centre(this.chassis.physicsObj.vertices);
    }

    addWheel(offsetX, offsetY, radius, suspensionDamping, suspensionStiffness, friction) {
        var pos = this.position();
        var chassisCen = this.chassisCentre();
        var diff = Matter.Vector.sub(chassisCen, pos);

        var wheel = Matter.Bodies.circle(pos.x + offsetX, pos.y + offsetY, radius, {
            collisionFilter: { group: this.colGroup },
            friction: friction,
            density: 0.02,
            frictionStatic: 0.7
        });

        var axel = Matter.Constraint.create({
            bodyB: this.body.physicsObj,
            pointB: { x: diff.x + offsetX, y: diff.y + offsetY },
            bodyA: wheel,
            stiffness: suspensionStiffness,
            damping: suspensionDamping,
            length: 0
        });

        Matter.Composite.addBody(this.carComposite, wheel);
        Matter.Composite.addConstraint(this.carComposite, axel);

        Matter.Body.setMass(wheel, 60);

        var wheelBitmap = new createjs.Bitmap("assets/textures/wheel_01.png");
        wheelBitmap.scale = 0.5;
        wheelBitmap.regX = 82.5;
        wheelBitmap.regY = 82.5;

        var gO = new GameObject(wheel, wheelBitmap);
        this.gameObjects.push(gO);
        this.wheels.push(gO);
    }

    load(physics) {
        Matter.Composite.addBody(this.carComposite, this.body.physicsObj);
        Matter.World.add(physics, this.carComposite);

        this.physicsObj = this.carComposite;

        this.com = new createjs.Shape();
        this.com.graphics.beginFill("green").drawRect(0, 0, 15, 15).endFill();
        //world.renderer.addObject(this.com);
    }

    update() {
    }
}
