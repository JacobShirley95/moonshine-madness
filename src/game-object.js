import Layer from "./layer.js";

function addAngles(body) {
    if (body.parent != null && body.parent != body) {
        return body.angle + addAngles(body.parent);
    }

    return body.angle;
}

export default class GameObject {
    constructor(physicsObj, renderObj, layerNum = 0) {
        this.physicsObj = physicsObj;
        this.renderObj = renderObj;
        this.layerNum = layerNum;
    }

    layer() {
        return this.layerNum;
    }

    flipX(onlyRenderObj) {
        this.scale(-1, 1, onlyRenderObj);

        if (this.debugShape)
            this.debugShape.flipX(true);
    }

    flipY(onlyRenderObj) {
        this.scale(1, -1, onlyRenderObj);

        if (this.debugShape)
            this.debugShape.flipY(true);
    }

    bounds() {
        return this.physicsObj.bounds;
    }

    position() {
        return this.physicsObj.position;
    }

    velocity() {
        return this.physicsObj.velocity;
    }

    dimensions() {
        let bounds = this.bounds();
        return {x: bounds.max.x - bounds.min.x, y: bounds.max.y - bounds.min.y};
    }

    applyForce(force, from) {
        Matter.Body.applyForce(this.physicsObj, force, from);
    }

    applyTorque(torque) {
        this.physicsObj.torque = torque;
    }

    setAngularVelocity(vel) {
        Matter.Body.setAngularVelocity(this.physicsObj, vel);
    }

    setVisible(flag) {
        if (this.renderObj)
            this.renderObj.visible = flag;
    }

    createDebugObject() {
        return new DebugObject(this.physicsObj);
    }

    scale(x = 1, y, onlyRenderObj) {
        if (typeof y === 'undefined')
            y = x;

        this.renderObj.scaleX *= x;
        this.renderObj.scaleY *= y;

        if (!onlyRenderObj)
            Matter.Body.scale(this.physicsObj, x, y);
    }

    translate(vec) {
        Matter.Body.translate(this.physicsObj, vec);
    }

    setPosition(pos) {
        Matter.Body.setPosition(this.physicsObj, pos);
    }

    update() {
        if (this.renderObj == null)
            return;

        let pos = this.position();

        this.renderObj.x = pos.x;
        this.renderObj.y = pos.y;

        if (!this.physicsObj.isStatic) {
            this.renderObj.rotation = Math.degrees(addAngles(this.physicsObj));
        }
    }
}

class DebugObject extends GameObject {
    constructor(body) {
        super(body, null, Layer.DEBUG);

        if (body.parts.length > 1) {
            this.renderObj = new createjs.Container();

            for (let i = 1; i < body.parts.length; i++) {
                let s = DebugObject.drawBody(body.parts[i]);

                this.renderObj.addChild(s);
            }

            let centre = Matter.Vertices.centre(body.vertices);

            this.renderObj.regX += body.position.x;
            this.renderObj.regY += body.position.y;
        } else {
            this.renderObj = DebugObject.drawBody(body);
        }
    }

    static drawBody(body) {
        let s = new createjs.Shape();
        let g = s.graphics;

        g.beginStroke(body.parts.length == 1 ? "green" : "blue");
        g.setStrokeStyle(4);

        let verts = body.vertices;
        let x = 0;
        let y = 0;

        s.x += body.position.x;
        s.y += body.position.y;

        for (let i = 0; i < verts.length; i++) {
            g.moveTo(verts[i].x - s.x, verts[i].y - s.y);
            g.lineTo(verts[(i + 1) % verts.length].x - s.x, verts[(i + 1) % verts.length].y - s.y);
        }

        g.endStroke();

        let r = 20;
        g.beginFill("red").drawEllipse(-r / 2, -r / 2, r, r).endFill();

        s._static = body.isStatic;

        return s;
    }
}
