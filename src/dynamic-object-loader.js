import ObjectLoader from "./object-loader.js";

export default class DynamicObjectLoader extends ObjectLoader {
    constructor(loader, options) {
        super(loader, options);
        this.loadedParts = [];

        this.offsetX = 1500;
        this.offsetY = 1500;
    }

    setTexture(tex) {
        var container = new createjs.Container();
        var centre = this.position();

        container.regX += centre.x;
        container.regY += centre.y;

        this.renderObj = container;
    }

    loadTexturePart(x, y, width, height) {
        if (x < 0 || y < 0)
            return;

        this.loadedParts.push({x, y, width, height});

        var dB = new createjs.Shape();
        let g = dB.graphics;
        g.beginStroke("red").setStrokeStyle(8).drawRect(x, y, width, height).endStroke();
        //dB.cache(x- 2, y-5, width, height);

        this.renderObj.addChild(dB);

        let tex = this.loader.getTexture(x, y, width, height);
        tex.onload = () => {
            var bitmap = new createjs.Bitmap(tex);
            //bitmap.cache(x, y, 1000, 1000);
            this.renderObj.addChild(bitmap);
        }

        //bitmap.x = x;
        //bitmap.x = y;



    }

    follow(object) {
        this.following = object;
    }

    followPos() {
        var pos = this.following ? this.following.position() : {x: 0, y: 0};

        return {x: pos.x + this.offsetX, y: pos.y + this.offsetY};
    }

    directionMods() {
        if (!this.following)
            return {x: 0, y: 0};

        let vel = this.following.velocity();
        return {x: Math.sign(vel.x), y: Math.sign(vel.y)};
    }

    needsToLoad(pos) {
        for (let part of this.loadedParts) {
            if (pos.x >= part.x && pos.y >= part.y && pos.x <= part.x + part.width && pos.y <= part.y + part.height) {
                return false;
            }
        }

        return true;
    }

    getCentre(part) {
        return {x: part.x + (part.width / 2), y: part.y + (part.height / 2)};
    }

    getClosestPart(pos) {
        let minDist = -1;
        let closest = null;

        for (let part of this.loadedParts) {
            let c = this.getCentre(part);
            let dx = c.x - pos.x;
            let dy = c.y - pos.y;

            if (minDist == -1) {
                minDist = (dx*dx) + (dy*dy);
                closest = part;
            } else {
                let d = (dx*dx) + (dy*dy);
                if (d < minDist) {
                    minDist = d;
                    closest = part;
                }
            }
        }

        return closest;
    }

    update() {
        super.update();

        //var pos = this.following ? this.following.position() : {x: 0, y: 0};

        const LD_WIDTH = 3000;
        const LD_HEIGHT = 3000;

        let mods = this.directionMods();
        let p = this.followPos(this.offsetX * mods.x, this.offsetY * mods.y);

        if (this.needsToLoad(p)) {
            let closest = this.getClosestPart(p);
            if (!closest) {
                console.log("no closest");
                this.loadTexturePart(0, 0, LD_WIDTH, LD_HEIGHT);
                //this.loadTexturePart(LD_WIDTH, 0, LD_WIDTH, LD_HEIGHT);
                //this.loadTexturePart(LD_WIDTH, LD_HEIGHT, LD_WIDTH, LD_HEIGHT);
            } else {
                console.log("loading");
                let offX = mods.x * LD_WIDTH;
                let offY = mods.y * LD_HEIGHT;

                if (offX > 0)
                    this.loadTexturePart(closest.x + offX, closest.y, LD_WIDTH, LD_HEIGHT);

                if (offX > 0 && offY > 0)
                    this.loadTexturePart(closest.x + offX, closest.y + offY, LD_WIDTH, LD_HEIGHT);

                if (offY > 0)
                    this.loadTexturePart(closest.x, closest.y + offY, LD_WIDTH, LD_HEIGHT);
            }

            this.loaded = true;
        }
    }
}
