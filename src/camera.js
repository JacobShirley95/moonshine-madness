export default class Camera {
    constructor(width, height, minX, minY, maxX, maxY, zoomX = 1, zoomY = 1) {
        this.x = 0;
        this.y = 0;

        this.width = width;
        this.height = height;

        this.xVel = 0;
        this.yVel = 0;

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

    position() {
        return {x: this.x, y: this.y};
    }

    velocity() {
        return {x: this.xVel, y: this.yVel};
    }

    worldDimensions() {
        return {x: this.width * (1/this.zoomX), y: this.height * (1/this.zoomY)};
    }

    worldToScreen(x, y) {
        let p = this.matrix.transformPoint(x, y);
        //p.y *= -1;
        return p;
    }

    screenToWorld(x, y) {
        let p = this.invMatrix.transformPoint(x, y);
        //p.y *= -1;
        return p;
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

    updateMatrix() {
        this.matrix = new createjs.Matrix2D();
        this.matrix.appendTransform(-this.x * this.zoomX, -this.y * this.zoomY, this.zoomX, this.zoomY, 0, 0, 0, 0, 0);

        this.invMatrix = this.matrix.clone().invert();
    }

    update() {
        var minX = this.minX + 1;
        var maxX = this.maxX - 1;

        var minY = this.minY + 1;
        var maxY = this.maxY - 1;

        if (this.target != null) {
            let pos = this.target.position();
            let p2 = this.worldToScreen(pos.x, pos.y);

            minX = Math.min(minX, p2.x);
            maxX = Math.max(maxX, p2.x);

            minY = Math.min(minY, p2.y);
            maxY = Math.max(maxY, p2.y);
        }

        if (minX < this.minX) {
            this.xVel = minX - this.minX;
        } else if (maxX > this.maxX) {
            this.xVel = maxX - this.maxX;
        } else {
            this.xVel = 0;
        }

        if (minY < this.minY) {
            this.yVel = minY - this.minY;
        } else if (maxY > this.maxY) {
            this.yVel = maxY - this.maxY;
        } else {
            this.yVel = 0;
        }

        this.x += this.xVel;
        this.y += this.yVel;

        this.updateMatrix();
    }
}
