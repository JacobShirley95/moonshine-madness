import Truck from "./truck.js";
import GameObject from "./game-object.js";
import Renderer from "./renderer.js";
import World from "./world.js";
import SVGMapLoader from "./svg-map.js";
import ObjectLoader from "./object-loader.js";

var Example = Example || {};

Math.degrees = function(radians) {
    return radians * 180 / Math.PI;
};

const debug = true;

var offsetX = 0;

Example.car = function() {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Composites = Matter.Composites,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        Body = Matter.Body,
        Bodies = Matter.Bodies,
        Constraint = Matter.Constraint,
        Composite = Matter.Composite;

    // create engine
    var engine = Engine.create(),
        physics = engine.world;


    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    const f = 0.2;
    const ff = 0.9;

    /*var slope = Bodies.rectangle(0, 0, 10000, 60, { isStatic: true, frictionStatic: f, friction: ff, density: 1, angle: 0.2 * Math.PI });
    var ramp = Bodies.rectangle(1400, 900, 200, 30, {isStatic: true, density: 1, angle: 0});
    // add bodies
    Matter.World.add(physics, [
        // walls
        //Bodies.rectangle(400, 0, 1200, 50, { isStatic: true, frictionStatic: f, friction: ff, density: 1 }),
        //Bodies.rectangle(400, 600, 1200, 50, { isStatic: true, frictionStatic: f, friction: ff, density: 1 }),
        //Bodies.rectangle(1000, 300, 50, 600, { isStatic: true, frictionStatic: f, friction: ff, density: 1 }),
        //Bodies.rectangle(0, 300, 50, 600, { isStatic: true, frictionStatic: f, friction: ff, density: 1 }),
        slope,
        ramp
    ]);*/

    const BLOCKS = 5;

    var renderer = new Renderer(-200, 200, 100, 300);
    renderer.scale(0.2);

    var world = new World(physics, renderer);
    var truck = new Truck(500, 0, 305, 1.0);

    truck.addWheel(-150, 40, 40, 0.2, 0.1, 0.8);
    truck.addWheel(110, 40, 40, 0.2, 0.1, 0.8);
    truck.load(physics, world);
    truck.flipX();

    renderer.follow(truck.chassis.renderObj);

    var mapLoader = new SVGMapLoader("assets/maps/test.svg");

    var objLoader = new ObjectLoader(mapLoader, true);
    objLoader.load(physics, (object) => {
        world.addObject(object);
        world.debug(object);
    });

    world.addObject(truck);
    world.debug(truck);

    var left = false;
    var right = false;
    var stop = false;

    document.addEventListener("keydown", function(ev) {
        if (ev.key == "a") {
            left = true;
        } else if (ev.key == "d") {
            right = true;
        } else if (ev.key == "s") {
            stop = true;
        }
    });

    document.addEventListener("keyup", function(ev) {
        if (ev.key == "a") {
            left = false;
        } else if (ev.key == "d") {
            right = false;
        } else if (ev.key == "s") {
            stop = false;
        }
    });

    var debug = document.getElementById("debug");

    function draw() {
        debug.innerHTML = "RenderX: " + Math.round(renderer.renderX)+"px" + "<br />RenderY: " + Math.round(renderer.renderY)+"px";
        if (left) {
            truck.wheels[1].applyTorque(-30);
        }

        if (right) {
            truck.wheels[1].applyTorque(30);
        }

        if (stop) {
            Matter.Body.setAngularVelocity(truck.wheels[1].physicsObj, 0);
        }

        //truck.update();
        world.update();

        renderer.render();

        requestAnimationFrame(draw);
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

    Matter.World.add(physics, mouseConstraint);
};

Example.car();
