import ObjectLoader from "./object-loader.js";

export default class DynamicObjectLoader extends ObjectLoader {
    constructor(loader, options) {
        super(loader, options);
        this.loadedParts = new Map();

        this.offsetX = 1500;
        this.offsetY = 1500;

        this.loadedX = 0;
        this.loadedY = 0;

        this.loadedWidth = 0;
        this.loadedHeight = 0;
    }

    centre() {
        let bounds = this.dimensions();
        return {x: bounds.x / 2, y: bounds.y / 2};
    }

    position() {
        let bounds = this.bounds();
        return {x: (bounds.min.x + bounds.max.x) / 2, y: (bounds.min.y + bounds.max.y) / 2};
    }

    getLoadedBounds() {
        let minX = -1;
        let minY = -1;
        let maxX = -1;
        let maxY = -1;
        for (let part of this.loadedParts.values()) {
            if (minX == -1) {
                minX = part.x;
                minY = part.y;
                maxX = part.x + part.width;
                maxY = part.y + part.height;
            } else {
                //console.log(minX);
                minX = Math.min(minX, part.x);
                minY = Math.min(minY, part.y);
                maxX = Math.max(maxX, part.x + part.width);
                maxY = Math.max(maxY, part.y + part.height);
            }
        }

        return {min: {x: minX, y: minY}, max: {x: maxX, y: maxY}};
    }

    setTexture(tex) {
        var container = new createjs.Container();
        var centre = this.centre();

        container.regX += centre.x + this.bounds().min.x;
        container.regY += centre.y + this.bounds().min.y;

        var dB = new createjs.Shape();
        let g = dB.graphics;

        let dimensions = this.dimensions();
        g.beginStroke("red").setStrokeStyle(8).drawRect(0, 0, dimensions.x, dimensions.y).endStroke();
        //container.addChild(dB);

        this.renderObj = container;
    }

    texturePartID(x, y, width, height) {
        return (x << 16) | (y & 0xFFFF);
    }

    loadTexturePart(x, y, width, height) {
        let id = this.texturePartID(x, y);
        if (x < 0 || y < 0)
            return;

        let found = this.loadedParts.get(id);
        if (found) {
            if (found.width >= width && found.height >= height)
                return;
        }

        //width *= this.loader.scale();
        //height *= this.loader.scale();

        var dB = new createjs.Shape();
        let g = dB.graphics;

        var centre = this.physicsObj.position;
        let bounds = this.physicsObj.bounds;
        g.beginStroke("red").setStrokeStyle(8).drawRect(x, y, width, height).endStroke();

        this.renderObj.addChild(dB);

        let tex = this.loader.getTexture(x, y, width, height);
        var bitmap = new createjs.Bitmap(tex);

        bitmap.x = x;
        bitmap.y = y;
        this.renderObj.addChild(bitmap);

        let part = {x, y, width, height, obj: bitmap, debug: dB};
        this.loadedParts.set(id, part);

        this.loadedX += width;
        this.loadedY += height;

        tex.onload = () => {
            this.cache();
        }
    }

    cache() {
        let b = this.getLoadedBounds();
        let margin = 50;

        this.renderObj.cache(b.min.x - margin, b.min.y - margin, b.max.x - b.min.x + margin, b.max.y - b.min.y + margin);
    }

    unloadTexturePartsByDist(dist) {
        let mods = this.directionMods();
        let p = this.followPos(this.offsetX * mods.x, this.offsetY * mods.y);
        let d2 = dist*dist;

        for (let part of this.loadedParts.values()) {
            let c = this.getCentre(part);

            let dx = c.x - p.x;
            let dy = c.y - p.y;
            let d = (dx*dx) + (dy*dy);
            if (d > d2) {
                this.loadedParts.delete(this.texturePartID(part.x, part.y));
                this.renderObj.removeChild(part.obj);
                this.renderObj.removeChild(part.debug);
            }
        }
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
        for (let part of this.loadedParts.values()) {
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

        for (let part of this.loadedParts.values()) {
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

        if (!this.renderObj)
            return;

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
                //this.loadTexturePart(0, LD_WIDTH, LD_WIDTH, LD_HEIGHT);
                //this.loadTexturePart(LD_WIDTH, LD_HEIGHT * 1, LD_WIDTH, LD_HEIGHT);
                //this.loadTexturePart(LD_WIDTH * 2, LD_HEIGHT * 4, LD_WIDTH, LD_HEIGHT);
                //this.loadTexturePart(LD_WIDTH, 0, LD_WIDTH, LD_HEIGHT);
                //this.loadTexturePart(LD_WIDTH, LD_HEIGHT, LD_WIDTH, LD_HEIGHT);
            } else {
                //console.log("loading");
                let offX = mods.x * LD_WIDTH;
                let offY = mods.y * LD_HEIGHT;

                if (offX > 0)
                    this.loadTexturePart(closest.x + offX, closest.y, LD_WIDTH, LD_HEIGHT);

                if (offX > 0 && offY > 0)
                    this.loadTexturePart(closest.x + offX, closest.y + offY, LD_WIDTH, LD_HEIGHT);

                if (offY > 0)
                    this.loadTexturePart(closest.x, closest.y + offY, LD_WIDTH, LD_HEIGHT);//*/
            }

            this.loaded = true;
        }

        this.unloadTexturePartsByDist(5000);
    }
}
