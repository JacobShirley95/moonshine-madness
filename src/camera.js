export default class Camera {
    constructor(minX, minY, maxX, maxY) {
        this.x = 0;
        this.y = 0;

        this.minX = minX;
        this.maxX = maxX;

        this.minY = minY;
        this.maxX = maxX;

        this.target = null;
    }

    follow(object) {
        this.target = object;
    }

    update() {
        if (minX < this.minX) {
            this.renderX += this.minX - minX;
        } else if (maxX > this.maxX) {
            this.renderX -= maxX - this.maxX;
        }

        if (minY < this.minY) {
            this.renderY += this.minY - minY;
        } else if (maxY > this.maxY) {
            this.renderY -= maxY - this.maxY;
        }
    }
}
