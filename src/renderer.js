export default class Renderer {
    constructor() {
        this.stage = new createjs.StageGL("game",  {"antialias": true});
        this.stage.setClearColor("#FFFFFF");
        this.stage.snapToPixelEnabled = true;
        this.renderObjs = [];
        this.width = $("#game").width();
        this.height = $("#game").height();
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

    update() {
    }

    render() {
        this.stage.update();
    }
}
