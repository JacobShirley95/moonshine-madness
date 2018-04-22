export default class Camera {
    constructor(minX, minY, maxX, maxY, zoomX, zoomY) {
        this.x = 0;
        this.y = 0;

        this.minX = minX;
        this.minY = minY;

        this.maxX = maxX;
        this.maxY = maxY;

        this.zoomX = zoomX;
        this.zoomY = zoomY;

        this.updateMatrix();

        this.lockspeed = 1.0;

        this.target = null;
    }

    zoom(x, y) {
        if (typeof y === 'undefined')
            y = x;

        this.zoomX = x;
        this.zoomY = y;

        this.updateMatrix();
    }

    follow(object) {
        if (object.load) {
            object.load().then(() => {
                this.target = object;
            });
        } else {
            this.target = object;
        }
    }

    applyTransform(gameObjects) {
        for (let gameObj of gameObjects) {
            let renderObj = gameObj.renderObj;
            if (renderObj) {
                let cM = new createjs.Matrix2D();
                cM.appendTransform(renderObj.x, renderObj.y, renderObj.scaleX, renderObj.scaleY, renderObj.rotation, renderObj.skewX, renderObj.skewY, renderObj.regX, renderObj.regY);
                cM.prependMatrix(this.matrix);
                renderObj.transformMatrix = cM;
            }
        }

        //this.zoomX = this.zoomY = 1;
    }

    updateMatrix() {
        this.matrix = new createjs.Matrix2D();
        this.matrix.appendTransform(-this.x * this.zoomX, -this.y * this.zoomY, this.zoomX, this.zoomY, 0, 0, 0, 0, 0);
    }

    update() {
        var minX = this.minX + 1;
        var maxX = this.maxX - 1;

        var minY = this.minY + 1;
        var maxY = this.maxY - 1;

        if (this.target != null) {
            let pos = this.target.position();
            let p2 = {x: pos.x - this.x, y: pos.y - this.y};

            minX = Math.min(minX, p2.x * this.zoomX);
            maxX = Math.max(maxX, p2.x * this.zoomX);

            minY = Math.min(minY, p2.y * this.zoomY);
            maxY = Math.max(maxY, p2.y * this.zoomY);
        }

        if (minX < this.minX) {
            this.x -= this.minX - minX;
            this.x *= this.lockspeed;
        } else if (maxX > this.maxX) {
            this.x += maxX - this.maxX;
            this.x *= this.lockspeed;
        }

        if (minY < this.minY) {
            this.y -= this.minY - minY;
            this.y *= this.lockspeed;
        } else if (maxY > this.maxY) {
            this.y += maxY - this.maxY;
            this.y *= this.lockspeed;
        }

        this.updateMatrix();
    }
}
