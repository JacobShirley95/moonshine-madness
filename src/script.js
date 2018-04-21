import Truck from "./truck.js";
import GameObject from "./game-object.js";
import Renderer from "./renderer.js";
import World from "./world.js";
import SVGMapLoader from "./svg-map.js";
import ObjectLoader from "./object-loader.js";
import DynamicObjectLoader from "./dynamic-object-loader.js";
import SVGTexture from "./svg-texture.js";
import Camera from "./camera.js";

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

    const BLOCKS = 5;
    const WORLD_SCALE = 0.6;

    var camera = new Camera(200, 200, 200, 300, 1, 1);

    var renderer = new Renderer(camera);
    renderer.scale(0.2);

    var world = new World(physics, renderer);
    var truck = new Truck(500, 50, 305);
    truck.addWheel(-290, 140, 82.5, 0.2, 0.1, 0.8);
    truck.addWheel(225, 140, 82.5, 0.2, 0.1, 0.8);
    truck.flipX();
    truck.scale(WORLD_SCALE);

    var mapLoader = new SVGMapLoader("assets/maps/test.svg", {scale: WORLD_SCALE});
    var objLoader = new DynamicObjectLoader(mapLoader, {isStatic: true});
    objLoader.follow(truck);

    world.addObject(objLoader);
    world.addObject(truck);

    camera.follow(truck);

    world.debug(truck);
    world.debug(objLoader);

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
            truck.wheels[1].setAngularVelocity(0);
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
