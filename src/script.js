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
        Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
        Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
        Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
        Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
    ]);

    var scale = 1;
    var car = Composites.car(260, 50, 310 * scale, 30 * scale, 30 * scale);
    World.add(world, car);

    console.log(car.constraints);

    car.constraints[0].stiffness = car.constraints[1].stiffness = 0.1;
    car.constraints[0].damping = car.constraints[1].damping = 0.1;

    var stage = new createjs.Stage("game");

    var body = new createjs.Bitmap("assets/textures/car_body.png");
    //body.graphics.beginFill("red").drawRect(-75, -15, 150, 30);

    body.scaleX=0.5;
    body.scaleY=0.5;
    body.regX = 400;
    body.regY = 290;
    stage.addChild(body);

    var wheel1 = new createjs.Shape();
    wheel1.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 30);
    stage.addChild(wheel1);

    var wheel2 = new createjs.Shape();
    wheel2.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 30);
    stage.addChild(wheel2);

    var bodies = Composite.allBodies(engine.world);

    console.log(bodies[4]);

    Math.degrees = function(radians) {
        return radians * 180 / Math.PI;
    };

    function draw() {
        setPos(bodies[4], body);
        setPos(bodies[5], wheel1);
        setPos(bodies[6], wheel2);

        console.log(bodies[4].angle);

        stage.update();

        requestAnimationFrame(draw);
    }

    function setPos(body, renderObj) {
        renderObj.x = body.position.x;
        renderObj.y = body.position.y;
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
