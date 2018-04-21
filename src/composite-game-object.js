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

    scale(x = 1, y) {
        if (typeof y === 'undefined')
            y = x;

        super.scale(x, y, true);

        Matter.Composite.scale(this.composite, x, y, this.centre());
        for (let c of this.composite.constraints) {
            c.pointA.x *= x;
            c.pointB.x *= x;

            c.pointA.y *= y;
            c.pointB.y *= y;
        }
    }

    flipX() {
        this.scale(-1, 1);
        this.scale();
    }

    flipY() {
        this.scale(1, -1);
        this.scale();
    }

    createDebugObject() {
        var bounds = Matter.Composite.bounds(this.composite);
        var shape = new createjs.Shape();

        var centre = this.position();

        shape.graphics.beginStroke("red").drawRect(bounds.min.x - centre.x, bounds.min.y - centre.y, bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y).endStroke();

        return new CompositeGameObject(this.composite);
    }
}
