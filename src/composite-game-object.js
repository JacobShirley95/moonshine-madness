import GameObjectContainer from "./game-object-container.js";

export default class CompositeGameObject extends GameObjectContainer {
    constructor(composite, layer = 0, ...gameObjects) {
        super(layer, ...gameObjects);
        this.composite = composite;
    }

    position() {
        let bounds = Matter.Composite.bounds(this.composite);

        return {x: (bounds.min.x + bounds.max.x) / 2, y: (bounds.min.y + bounds.max.y) / 2};
    }

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

        Matter.Composite.scale(this.composite, 1, 1, this.centre());
    }

    flipX() {
        this.scale(-1, 1);
    }

    flipY() {
        this.scale(1, -1);
    }

    translate(vec) {
        Matter.Composite.translate(this.composite, vec);
    }
}
