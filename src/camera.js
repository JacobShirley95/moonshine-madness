export default class Camera {
    constructor(minX, minY, maxX, maxY, scaleX, scaleY) {
        this.x = 0;
        this.y = 0;

        this.minX = minX;
        this.minY = minY;

        this.maxX = maxX;
        this.maxY = maxY;

        this.scaleX = scaleX;
        this.scaleY = scaleY;

        this.target = null;
    }

    scale(x, y) {
        if (typeof y === 'undefined')
            y = x;

        console.log(x);

        this.scaleX = x;
        this.scaleY = y;
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

    update() {
        var minX = this.minX + 1;
        var maxX = this.maxX - 1;

        var minY = this.minY + 1;
        var maxY = this.maxY - 1;

        if (this.target != null) {
            let pos = this.target.position();
            let p2 = {x: pos.x - this.x, y: pos.y - this.y};

            minX = Math.min(minX, p2.x * this.scaleX);
            maxX = Math.max(maxX, p2.x * this.scaleX);

            minY = Math.min(minY, p2.y * this.scaleY);
            maxY = Math.max(maxY, p2.y * this.scaleY);
        }

        if (minX < this.minX) {
            this.x -= this.minX - minX;
        } else if (maxX > this.maxX) {
            this.x += maxX - this.maxX;
        }

        if (minY < this.minY) {
            this.y -= this.minY - minY;
        } else if (maxY > this.maxY) {
            this.y += maxY - this.maxY;
        }
    }
}
