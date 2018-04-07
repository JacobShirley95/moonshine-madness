export default class Renderer {
    constructor(minX, maxX, minY, maxY) {
        this.stage = new createjs.Stage("game");

        this.scalee = 1;

        this.renderX = 0;
        this.renderY = 0;

        this.minX = minX;
        this.maxX = maxX;

        this.minY = minY;
        this.maxY = maxY;

        this.target = null;

        this.renderObjs = [];
    }

    scale(sc) {
        this.scalee = sc;
        this.stage.scaleX *= this.stage.scaleY = sc;
    }

    setVisible(obj, flag) {
        obj.visible = flag;
    }

    addObject(renderObj) {
        this.renderObjs.push(renderObj);

        this.stage.addChild(renderObj);
    }

    follow(object) {
        this.target = object;
    }

    update() {
        var minX = this.minX + 1;
        var maxX = this.maxX - 1;

        var minY = this.minY + 1;
        var maxY = this.maxY - 1;

        for (let renderObj of this.renderObjs) {
            renderObj.x -= this.renderX;
            renderObj.y -= this.renderY;

            if (!renderObj._static) {
            }
        }

        if (this.target != null) {
            minX = Math.min(minX, this.target.x * this.stage.scaleX);
            maxX = Math.max(maxX, this.target.x * this.stage.scaleX);

            minY = Math.min(minY, this.target.y * this.stage.scaleY);
            maxY = Math.max(maxY, this.target.y * this.stage.scaleY);
        }

        if (minX < this.minX) {
            this.renderX -= this.minX - minX;
        } else if (maxX > this.maxX) {
            this.renderX += maxX - this.maxX;
        }

        if (minY < this.minY) {
            this.renderY -= this.minY - minY;
        } else if (maxY > this.maxY) {
            this.renderY += maxY - this.maxY;
        }
    }

    render() {
        this.stage.update();
    }
}
