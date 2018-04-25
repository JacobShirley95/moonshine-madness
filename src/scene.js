import GameObjectContainer from "./game-object-container.js";

export default class Scene extends createjs.Container {
    constructor(camera) {
        super();
        this.setCamera(camera);
    }

    addObject(gameObject, layer) {
        if (typeof layer === 'undefined')
            layer = gameObject.layer();

        let add = (obj) => {
            if (obj.renderObj != null) {
                this.addChild(obj.renderObj);
                this.setChildIndex(obj.renderObj, layer);
            }

            if (obj instanceof GameObjectContainer)
                for (let gO of obj.gameObjects)
                    this.addObject(gO, layer);
        }

        if (gameObject.load) {
            gameObject.load().then((obj) => {
                add(gameObject);
            });
        } else {
            add(gameObject);
        }
    }

    setCamera(camera) {
        this.camera = camera;
    }

    update() {
        this.camera.update();
        this.transformMatrix = this.camera.matrix;
    }
}
