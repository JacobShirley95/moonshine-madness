function setPos(body, renderObj) {
    renderObj.x = body.position.x;
    renderObj.y = body.position.y;
    renderObj.rotation = Math.degrees(body.angle);
}

export default class Truck {
    constructor(x, y, width, wheel1Radius, wheel2Radius, scale) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.wheel1Radius = wheel1Radius;
        this.wheel2Radius = wheel2Radius;
        this.scale = scale;

        this._carPhysics = Matter.Composites.car(x, y, width * this.scale, this.wheel1Radius * this.scale, this.wheel2Radius * this.scale);
        //this._carPhysics.bodies[0].setMass(880);
        //this._carPhysics.bodies[1].setMass(60);
        //this._carPhysics.bodies[2].setMass(60);
        Matter.Body.setMass(this._carPhysics.bodies[0], 880);
        Matter.Body.setMass(this._carPhysics.bodies[1], 60);
        Matter.Body.setMass(this._carPhysics.bodies[2], 60);
        console.log(this._carPhysics);
    }

    configureWheel(index, suspensionDamping, suspensionStiffness, friction, height) {
        this._carPhysics.constraints[index].damping = suspensionDamping;
        this._carPhysics.constraints[index].stiffness = suspensionStiffness;
        this._carPhysics.bodies[1 + index].friction = friction;
        //console.log(this._carPhysics.constraints[index]);

        var base = this._carPhysics.constraints[index].pointB;
        this._carPhysics.constraints[index].pointB = {x: base.x, y: base.y + height};
    }

    load(world, stage) {
        Matter.World.add(world, this._carPhysics);

        this.body = new createjs.Bitmap("assets/textures/car_body.png");
        this.body.scaleX = 0.5;
        this.body.scaleY = 0.5;
        this.body.regX = 400;
        this.body.regY = 290;
        stage.addChild(this.body);

        this.wheel1 = new createjs.Bitmap("assets/textures/wheel_01.png");

        //this.wheel1.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, this._carPhysics.bodies[1].circleRadius);
        stage.addChild(this.wheel1);

        this.wheel2 = new createjs.Bitmap("assets/textures/wheel_01.png");

        this.wheel1.scale = this.wheel2.scale = 0.5;
        this.wheel1.regX = this.wheel2.regX = 82.5;
        this.wheel1.regY = this.wheel2.regY = 82.5;

        //this.wheel2.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, this._carPhysics.bodies[2].circleRadius);
        stage.addChild(this.wheel2);
    }

    update() {
        var bodies = this._carPhysics.bodies;

        setPos(bodies[0], this.body);
        setPos(bodies[1], this.wheel1);
        setPos(bodies[2], this.wheel2);
    }
}
