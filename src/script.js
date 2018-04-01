import Truck from "./truck.js";

var Example = Example || {};

Example.car = function() {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Composites = Matter.Composites,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        World = Matter.World,
        Body = Matter.Body,
        Bodies = Matter.Bodies,
        Constraint = Matter.Constraint,
        Composite = Matter.Composite;

    // create engine
    var engine = Engine.create(),
        world = engine.world;

    // create renderer
    /*var render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: 800,
            height: 600,
            showAngleIndicator: true,
            showCollisions: true
        }
    });

    Render.run(render);*/

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    // add bodies
    World.add(world, [
        // walls
        Bodies.rectangle(400, 0, 1200, 50, { isStatic: true, friction: 1 }),
        Bodies.rectangle(400, 600, 1200, 50, { isStatic: true, friction: 1 }),
        Bodies.rectangle(1000, 300, 50, 600, { isStatic: true, friction: 1 }),
        Bodies.rectangle(0, 300, 50, 600, { isStatic: true, friction: 1 })
    ]);

    World.add(world, [
        Bodies.rectangle(200, 350, 800, 20, { isStatic: true, angle: Math.PI * 0.1 , friction: 1}),
    ]);

    var stage = new createjs.Stage("game");

    var truck = new Truck(200, 100, 305, 40, 40, 1.0);
    truck.configureWheel(0, 0.2, 0.2, 0.9, 20);
    truck.configureWheel(1, 0.2, 0.2, 0.9, 20);
    truck.load(world, stage);

    var bodies = Composite.allBodies(engine.world);
    var objs = [];
    var debug = true;

    for (let b of bodies) {
        var s = new createjs.Shape();
        var g = s.graphics;
        g.beginStroke("green");
        g.setStrokeStyle(4);
        var verts = b.vertices;
        s.x = b.position.x;
        s.y = b.position.y;
        for (var i = 0; i < verts.length; i++) {
            g.moveTo(verts[i].x - s.x, verts[i].y - s.y);
            g.lineTo(verts[(i + 1) % verts.length].x - s.x, verts[(i + 1) % verts.length].y - s.y);
        }
        g.endStroke();
        //console.log(verts);

        objs.push(s);
        stage.addChild(s);

        //myGraphics.beginStroke("red").beginFill("blue").drawRect(20, 20, 100, 50);
    }

    Math.degrees = function(radians) {
        return radians * 180 / Math.PI;
    };

    function draw() {
        for (var i = 0; i < bodies.length; i++) {
            objs[i].visible = debug;
            if (debug)
                setPos(bodies[i], objs[i]);
        }

        truck.update(stage);
        stage.update();

        requestAnimationFrame(draw);
    }

    function setPos(body, renderObj) {
        renderObj.x = body.position.x;
        renderObj.y = body.position.y;

        if (!body.isStatic)
            renderObj.rotation = Math.degrees(body.angle);
    }

    draw();

    // add mouse control
    var mouse = Mouse.create(document.getElementById("game")),
        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

    World.add(world, mouseConstraint);
};

Example.car();
