import ObjectLoader from "./object-loader.js";

export default class DynamicObjectLoader extends ObjectLoader {
    constructor(loader, options) {
        super(loader, options);
        this.loadedParts = new Map();

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
        //g.beginStroke("red").setStrokeStyle(8).drawRect(0, 0, dimensions.x, dimensions.y).endStroke();
        //container.addChild(dB);

        this.renderObj = container;

        let wDims = this.camera.worldDimensions();
        this.loadTexturePart(0, 0, wDims.x, wDims.y);
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
            if (found.width >= width && found.height >= height) {
                return;
            }
        }

        var dB = new createjs.Shape();
        let g = dB.graphics;

        var centre = this.physicsObj.position;
        let bounds = this.physicsObj.bounds;

        let part = {x, y, width, height};

        if (this.options.outline) {
            /*let p = this.camera.screenToWorld(x, y);
            let p2 = this.camera.screenToWorld(x + width, y + height);

            let p = this.camera.scaleDimensions(width, height);
            //width = p.x;
            //height = p.y;

            //x = p.x;
            //y = p.y;
            width = p2.x - p.x;
            height = p2.y - p.y;*/

            g.beginStroke("red").setStrokeStyle(8).drawRect(x, y, width, height).endStroke();
        }

        this.renderObj.addChild(dB);

        let tex = this.loader.getTexture(x, y, width, height);
        var bitmap = new createjs.Bitmap(tex.getImage());

        bitmap.x = x;
        bitmap.y = y;

        this.renderObj.addChild(bitmap);

        part.obj = bitmap;
        part.debug = dB;
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
        let p = this.followPos(0, 0);
        let d2 = dist*dist;

        for (let part of this.loadedParts.values()) {
            let c = this.getCentre(part);

            let dx = c.x - p.x;
            let dy = c.y - p.y;
            let d = (dx*dx) + (dy*dy);
            if (d > d2) {
                console.log("unloading");
                this.loadedParts.delete(this.texturePartID(part.x, part.y));
                this.renderObj.removeChild(part.obj);
                this.renderObj.removeChild(part.debug);
            }
        }
    }

    follow(object) {
        this.camera = object;
    }

    followPos(offX, offY) {
        var pos = this.camera.screenToWorld(0, 0);

        pos.x += offX;
        pos.y += offY;

        if (pos.x < 0)
            pos.x = 0;

        if (pos.y < 0)
            pos.y = 0;

        //console.log(pos);

        return pos;
    }

    directionMods() {
        if (!this.camera)
            return {x: 0, y: 0};

        let vel = this.camera.velocity();
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

    getClosestPart(pos, partWidth, partHeight) {
        let minDist = -1;
        let closest = null;

        let x = (Math.round(pos.x / partWidth)) * partWidth;
        let y = (Math.round(pos.y / partHeight)) * partHeight;

        if (x < 0)
            x = 0;

        if (y < 0)
            y = 0;

        return {x, y, width: partWidth, height: partHeight};
    }

    update() {
        super.update();

        if (!this.renderObj)
            return;

        //var pos = this.camera ? this.camera.position() : {x: 0, y: 0};

        let mods = this.directionMods();
        let worldDim = this.camera.worldDimensions();

        let p = this.followPos(worldDim.x * mods.x, worldDim.y * mods.y);

        if (this.needsToLoad(p)) {
            p = this.followPos(0, 0);
            let closest = this.getClosestPart(p, worldDim.x, worldDim.y);
            let offX = mods.x * worldDim.x;
            let offY = mods.y * worldDim.y;

            //this.loadTexturePart(0, 0, worldDim.x, worldDim.y);
            this.loadTexturePart(closest.x, closest.y, worldDim.x, worldDim.y);

            if (offX != 0)
                this.loadTexturePart(closest.x + offX, closest.y, worldDim.x, worldDim.y);

            if (offX != 0 && offY != 0)
                this.loadTexturePart(closest.x + offX, closest.y + offY, worldDim.x, worldDim.y);

            if (offY != 0)
                this.loadTexturePart(closest.x, closest.y + offY, worldDim.x, worldDim.y);//*/

            this.loaded = true;
        }

        //this.unloadTexturePartsByDist(this.options.unloadDistance);
    }
}
