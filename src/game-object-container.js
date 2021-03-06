import GameObject from "./game-object.js";
import Layer from "./layer.js";

export default class GameObjectContainer {
    constructor(layer = 0, ...gameObjects) {
        this.gameObjects = gameObjects || [];
        this.layerNum = layer;
    }

    layer() {
        return this.layerNum;
    }

    flipX(onlyRenderObj) {
        for (let gO of this.gameObjects) {
            gO.flipX(onlyRenderObj);
        }
    }

    flipY(onlyRenderObj) {
        for (let gO of this.gameObjects) {
            gO.flipY(onlyRenderObj);
        }
    }

    position() {
        let pos = {x: 0, y: 0};

        for (let gO of this.gameObjects) {
            let p = gO.position();
            pos.x += p.x;
            pos.y += p.y;
        }

        let len = this.gameObjects.length;
        pos.x /= len;
        pos.y /= len;

        return pos
    }

    velocity() {
        let vel = {x: 0, y: 0};

        for (let gO of this.gameObjects) {
            let v = gO.velocity();
            vel.x += v.x;
            vel.y += v.y;
        }

        let len = this.gameObjects.length;
        vel.x /= len;
        vel.y /= len;

        return vel;
    }

    applyForce(gameObject, force, from) {
        gameObject.applyForce(force, from);
    }

    applyTorque(gameObject, torque) {
        gameObject.applyTorque(force, from);
    }

    setAngularVelocity(gameObject, vel) {
        gameObject.setAngularVelocity(vel);
    }

    createDebugObject() {
        let dbgs = [];
        for (let gO of this.gameObjects) {
            dbgs.push(gO.createDebugObject());
        }

        return new GameObjectContainer(Layer.DEBUG, ...dbgs);
    }

    scale(x, y, onlyRenderObj) {
        for (let gO of this.gameObjects) {
            gO.scale(x, y, onlyRenderObj);
        }
    }

    translate(vec) {
        for (let gO of this.gameObjects) {
            gO.translate(sc);
        }
    }

    setPosition(pos) {
        let old = this.position();
        let diff = Matter.Vector.sub(pos, old);

        this.translate(diff);
    }

    update() {
        /*for (let gO of this.gameObjects) {
        //    gO.update();
    }*/
    }
}
