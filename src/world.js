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

        if (gameObject.debugShape != null)
            this.addObject(gameObject.debugShape);

        this.gameObjects.push(gameObject);
    }

    debug(flag) {
        this.debug = flag;

        for (let gO of this.gameObjects) {
            if (gO.debugShape)
                gO.debugShape.renderObj.visible = flag;
        }
    }

    update() {
        for (let gO of this.gameObjects) {
            gO.update();
        }

        this.renderer.update();
    }
}
