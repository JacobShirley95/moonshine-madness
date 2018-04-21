export default class Renderer {
    constructor(camera) {
        this.stage = new createjs.Stage("game");

        this.target = null;

        this.renderObjs = [];
        this.camera = camera;
    }

    scale(sc) {
        this.camera.scale(sc);
        this.stage.scaleX *= this.stage.scaleY = sc;
    }

    setVisible(obj, flag) {
        obj.visible = flag;
    }

    addObject(renderObj, layer = 0) {
        this.renderObjs.push(renderObj);

        this.stage.addChild(renderObj);
        this.stage.setChildIndex(renderObj, layer);
    }

    follow(object) {
        this.camera.follow(object);
    }

    setCamera(camera) {
        this.camera = camera;
    }

    update() {
        for (let renderObj of this.renderObjs) {
            renderObj.x -= this.camera.x;
            renderObj.y -= this.camera.y;

            if (!renderObj._static) {
            }
        }

        this.camera.update();
    }

    render() {
        this.stage.update();
    }
}
