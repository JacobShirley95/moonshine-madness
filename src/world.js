import GameObject from "./game-object.js";
import ObjectLoader from "./object-loader.js";
import CompoundGameObject from "./composite-game-object.js";
import GameObjectContainer from "./game-object-container.js";

export default class World {
    constructor(physics, renderer) {
        this.physics = physics;
        this.renderer = renderer;
        this.gameObjects = [];
    }

    getLoadableChildren(obj, results, depth = 0) {
        results = results || [];

        if (obj instanceof ObjectLoader || obj instanceof Truck) {
            results.push({depth, o: obj.load(this.physics)});
        }

        if (obj instanceof GameObjectContainer) {
            for (let o of obj.gameObjects) {
                this.getLoadableChildren(o, results, depth + 1);
            }
        }

        return results;
    }

    addObject(gameObject, depth = 0) {
        let add = (obj) => {
            if (obj.renderObj != null) {
                this.renderer.addObject(obj.renderObj, obj.layer());
            }

            if (obj instanceof GameObjectContainer)
                for (let gO of obj.gameObjects)
                    this.addObject(gO, depth + 1);

            if (depth == 0) {
                if (obj instanceof GameObjectContainer) {
                    Matter.World.add(this.physics, obj.composite);
                } else {
                    Matter.World.add(this.physics, obj.physicsObj);
                }
            }
        }

        if (gameObject.load) {
            gameObject.load(this.physics).then((obj) => {
                add(gameObject);
            });
        } else {
            add(gameObject);
        }

        //if (depth == 0)
        this.gameObjects.push(gameObject);
    }

    follow(gameObject) {
    }

    debug(gO) {
        if (gO.load) {
            gO.load().then((obj) => {
                this.addObject(gO.createDebugObject(), 1);
            });
        } else {
            this.addObject(gO.createDebugObject(), 1);
        }
    }

    update() {
        for (let gO of this.gameObjects) {
            gO.update();
        }

        this.renderer.update();
    }
}
