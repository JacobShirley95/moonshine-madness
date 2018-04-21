import GameObjectContainer from "./game-object-container.js";

export default class CompositeGameObject extends GameObjectContainer {
    constructor(composite, ...gameObjects) {
        super(...gameObjects);
        this.composite = composite;
    }

    position() {
        var bounds = Matter.Composite.bounds(this.composite);

        return {x: (bounds.min.x + bounds.max.x) / 2, y: (bounds.min.y + bounds.max.y) / 2};
    }

    velocity() {}

    flipX(onlyRenderObj) {
        super.flipX(true);

        if (!onlyRenderObj) {
            Matter.Composite.scale(this.composite, -1, 1, this.centre());

            for (let c of this.composite.constraints) {
                c.pointA.x *= -1;
                c.pointB.x *= -1;
            }
        }
    }

    flipY(onlyRenderObj) {
        super.flipX(true);

        if (!onlyRenderObj) {
            Matter.Composite.scale(this.composite, 1, -1, this.centre());

            for (let c of this.composite.constraints) {
                c.pointA.y *= -1;
                c.pointB.y *= -1;
            }
        }
    }

    createDebugObject() {
        var bounds = Matter.Composite.bounds(this.composite);
        var shape = new createjs.Shape();

        var centre = this.position();

        shape.graphics.beginStroke("red").drawRect(bounds.min.x - centre.x, bounds.min.y - centre.y, bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y).endStroke();

        return new CompositeGameObject(this.composite);
    }
}
