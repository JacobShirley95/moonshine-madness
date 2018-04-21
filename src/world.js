import GameObject from "./game-object.js";
import ObjectLoader from "./object-loader.js";
import Truck from "./truck2.js";
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
        if (gameObject instanceof GameObjectContainer) {
            if (gameObject.load) {
                gameObject.load(this.physics).then((obj) => {
                    for (let sub of gameObject.gameObjects) {
                        this.addObject(sub, depth + 1);
                    }

                    if (gameObject instanceof GameObjectContainer) {

                        Matter.World.add(this.physics, gameObject.composite);
                    } else {
                        Matter.World.add(this.physics, gameObject.physicsObj);
                    }
                });
            }
        } else {
            if (gameObject.renderObj != null) {
                this.renderer.addObject(gameObject.renderObj);
            }

            if (depth == 0) {
                if (gameObject.load) {
                    gameObject.load(this.physics).then((obj) => {
                        if (gameObject.renderObj != null) {
                            this.renderer.addObject(gameObject.renderObj);
                        }
                        if (gameObject instanceof GameObjectContainer) {

                            Matter.World.add(this.physics, gameObject.composite);
                        } else {
                            Matter.World.add(this.physics, gameObject.physicsObj);
                        }
                    });
                } else {

                }
                console.log(gameObject);

            }
        }

        //if (depth == 0)
            this.gameObjects.push(gameObject);
    }

    debug(gO) {
        if (gO.load) {
            gO.load().then((obj) => {
                this.addObject(gO.createDebugObject(), 1);

                //for (let sub of gO.gameObjects) {
                    //this.addObject(sub.createDebugObject(), 1);
                //}
            });
        } else {
            this.addObject(gO.createDebugObject(), 1);

            //for (let sub of gO.gameObjects) {
                //this.addObject(sub.createDebugObject(), 1);
            //}
        }
    }

    update() {
        for (let gO of this.gameObjects) {
            gO.update();
        }

        this.renderer.update();
    }
}
