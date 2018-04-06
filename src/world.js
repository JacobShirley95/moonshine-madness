import GameObject from "./game-object.js";
import CompoundGameObject from "./composite-game-object.js";

export default class World {
    constructor(physics, renderer) {
        this.physics = physics;
        this.renderer = renderer;
        this.gameObjects = [];
    }

    addObject(gameObject) {
        for (let sub of gameObject.gameObjects) {
            this.addObject(sub);
        }

        if (gameObject.renderObj != null)
            this.renderer.addObject(gameObject.renderObj);

        this.gameObjects.push(gameObject);
    }

    debug(gO) {
        this.addObject(gO.createDebugObject());

        for (let sub of gO.gameObjects) {
            this.addObject(sub.createDebugObject());
        }
    }

    update() {
        for (let gO of this.gameObjects) {
            gO.update();
        }

        this.renderer.update();
    }
}
