import GameObject from "./game-object.js";

export default class GameObjectContainer {
    constructor(...gameObjects) {
        this.gameObjects = gameObjects || [];
    }

    flipX(onlyRenderObj) {
        for (let gO of this.gameObjects) {
            gO.flipX(onlyRenderObj);
        }
    }

    flipY() {
        for (let gO of this.gameObjects) {
            gO.flipY(onlyRenderObj);
        }
    }

    position() {}
    velocity() {}

    applyForce(gameObject, force, from) {
        gameObject.applyForce(force, from);
    }

    applyTorque(gameObject, torque) {
        gameObject.applyTorque(force, from);
    }

    setAngularVelocity(gameObject, vel) {
        gameObject.setAngularVelocity(vel);
    }

    setVisible(flag) {
        if (this.renderObj)
            this.renderObj.visible = flag;
    }

    createDebugObject() {
        return createDebug(this.physicsObj);
    }

    scale(sc) {
        for (let gO of this.gameObjects) {
            gO.scale(sc);
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
        for (let gO of this.gameObjects) {
            gO.update();
        }
    }
}
