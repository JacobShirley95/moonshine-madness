function addAngles(body) {
    if (body.parent != body) {
        return body.angle + addAngles(body.parent);
    }

    return body.angle;
}

function createDebug(b) {
    function drawBody(body) {
        var s = new createjs.Shape();
        var g = s.graphics;

        g.beginStroke(body.parts.length == 1 ? "green" : "blue");
        g.setStrokeStyle(4);

        var verts = body.vertices;
        s.x = body.position.x;
        s.y = body.position.y;

        for (var i = 0; i < verts.length; i++) {
            g.moveTo(verts[i].x - s.x, verts[i].y - s.y);
            g.lineTo(verts[(i + 1) % verts.length].x - s.x, verts[(i + 1) % verts.length].y - s.y);
        }

        g.endStroke();
        s._static = body.isStatic;

        return s;
    }

    var gameObject = new GameObject();
    gameObject.physicsObj = b;
    gameObject.renderObj = drawBody(b);

    /*if (b.parts.length > 1) {
        var container = new createjs.Container();

        for (let i = 1; i < b.parts.length; i++) {
            let s = drawBody(b.parts[i]);

            container.addChild(s);
        }

        let centre = Matter.Vertices.centre(b.vertices);

        container.regX += b.position.x;
        container.regY += b.position.y;

        gameObject.renderObj = container;
    } else {
        let s = drawBody(b);
        gameObject.renderObj = s;
    }*/



    return gameObject;
}

export default class GameObject {
    constructor(physicsObj, renderObj, ...gameObjects) {
        this.physicsObj = physicsObj;
        this.renderObj = renderObj;
        this.gameObjects = gameObjects || [];

        if (physicsObj && physicsObj.type == "body")
            this.debugShape = createDebug(physicsObj);
    }

    flipX(onlyRenderObj) {
        if (this.renderObj)
            this.renderObj.scaleX *= -1;

        if (!onlyRenderObj) {
            Matter.Body.scale(this.physicsObj, -1, 1);
        }


        for (let gO of this.gameObjects) {
            gO.flipX(true);
        }

        if (this.debugShape)
            this.debugShape.flipX(true);
    }

    flipY() {
        if (this.renderObj)
            this.renderObj.scaleY *= -1;

        if (!onlyRenderObj) {
            Matter.Body.scale(this.physicsObj, 1, -1);
        }

        for (let gO of this.gameObjects) {
            gO.flipX(onlyRenderObj);
        }
    }

    applyForce(force, from) {
        Matter.Body.applyForce(this.physicsObj, force, from);
    }

    applyTorque(torque) {
        this.physicsObj.torque = torque;
    }

    getDebug() {
        return this.debugShape;
    }

    setVisible(flag) {
        this.renderObj.visible = flag;
    }

    update() {
        /*if (this.debugShape) {
            this.debugShape.x = this.physicsObj.position.x;
            this.debugShape.y = this.physicsObj.position.y;

            if (!this.physicsObj.isStatic) {
                this.debugShape.rotation = Math.degrees(addAngles(this.physicsObj));
            }
        }*/

        if (this.renderObj == null)
            return;

        this.renderObj.x = this.physicsObj.position.x;
        this.renderObj.y = this.physicsObj.position.y;

        if (!this.physicsObj.isStatic) {
            this.renderObj.rotation = Math.degrees(addAngles(this.physicsObj));
        }
    }
}
