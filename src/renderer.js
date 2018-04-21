export default class Renderer {
    constructor(camera) {
        this.stage = new createjs.Stage("game");

        this.target = null;

        this.renderObjs = [];
        this.setCamera(camera);
    }

    scale(sc) {
        //this.camera.zoom(sc);
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
        this.stage.scaleX = this.camera.zoomX;
        this.stage.scaleY = this.camera.zoomY;
        this.camera.update();

        for (let renderObj of this.renderObjs) {
            renderObj.x -= this.camera.x;
            renderObj.y -= this.camera.y;

            if (!renderObj._static) {
            }
        }
    }

    render() {
        this.stage.update();
    }
}
