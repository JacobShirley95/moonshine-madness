import GameObject from "./game-object.js";

export default class CompositeGameObject extends GameObject {
    constructor(composite, renderObj, ...gameObjects) {
        super(composite, renderObj, ...gameObjects);
    }

    applyForce(body, force, from) {
        Matter.Body.applyForce(body, force, from);
    }

    applyTorce(body, torque) {
        body.torque = torque;
    }

    position() {
        var bounds = Matter.Composite.bounds(this.physicsObj);

        return {x: (bounds.min.x + bounds.max.x) / 2, y: (bounds.min.y + bounds.max.y) / 2};
    }

    flipX(onlyRenderObj) {
        super.flipX(true);

        if (!onlyRenderObj) {
            Matter.Composite.scale(this.physicsObj, -1, 1, this.centre());

            for (let c of this.physicsObj.constraints) {
                c.pointA.x *= -1;
                c.pointB.x *= -1;
            }
        }
    }

    flipY(onlyRenderObj) {
        super.flipX(true);

        if (!onlyRenderObj) {
            Matter.Composite.scale(this.physicsObj, 1, -1, this.centre());

            for (let c of this.physicsObj.constraints) {
                c.pointA.y *= -1;
                c.pointB.y *= -1;
            }
        }
    }

    createDebugObject() {
        var bounds = Matter.Composite.bounds(this.physicsObj);
        var shape = new createjs.Shape();

        var centre = this.position();

        shape.graphics.beginStroke("red").drawRect(bounds.min.x - centre.x, bounds.min.y - centre.y, bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y).endStroke();

        return new CompositeGameObject(this.physicsObj, null);
    }
}
