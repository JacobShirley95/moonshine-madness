import Truck from "./truck.js";
import GameObject from "./game-object.js";
import Renderer from "./renderer.js";
import World from "./world.js";
import SVGMapLoader from "./svg-map.js";
import ObjectLoader from "./object-loader.js";
import DynamicObjectLoader from "./dynamic-object-loader.js";
import Camera from "./camera.js";
import Scene from "./scene.js";

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
    const WORLD_SCALE = 0.7;

    var camera = new Camera(1000, 700, 200, 200, 500, 500);
    camera.zoom(0.2);

    var camera2 = new Camera(1000, 700, 200, 200, 500, 500);
    camera2.x = 0;
    camera2.y = 0;

    var scene = new Scene(camera);

    var renderer = new Renderer();
    renderer.scale(1);
    //console.log(renderer.width+", "+renderer.height);

    var shape = new createjs.Shape();
    let g = shape.graphics;
    g.beginFill("rgba(0, 0, 0, 0.1)").drawRect(0, 0, 1000, 100).endFill();
    renderer.addObject(shape, 2);

    var world = new World(physics, renderer, camera);
    var truck = new Truck(550, 50, 305);
    truck.addWheel(-290, 140, 82.5, 0.2, 0.1, 0.8);
    truck.addWheel(225, 140, 82.5, 0.2, 0.1, 0.8);
    truck.scale(-WORLD_SCALE, WORLD_SCALE);

    var mapLoader = new SVGMapLoader("assets/maps/test3.svg", {scale: WORLD_SCALE});
    var objLoader = new DynamicObjectLoader(mapLoader, {isStatic: true, outline: false, partWidth: 1000, partHeight: 700, unloadDistance: 4000});
    objLoader.follow(camera);

    world.addObject(objLoader, 5);
    world.addObject(truck, 1);

    camera.follow(truck);
    camera2.follow(truck);

    scene.addObject(truck);
    scene.addObject(objLoader);
    renderer.addObject(scene);

    setTimeout(() => {
        //scene.setCamera(camera2);
        //objLoader.follow(camera2);
    }, 3000);

    //world.debug(truck);
    //world.debug(objLoader);

    var left = false;
    var right = false;
    var stop = false;

    var allowForce = false;

    truck.load().then(() => {
        Matter.Events.on(engine, 'collisionStart', function(event) {
            var pairs = event.pairs;

            // change object colours to show those starting a collision
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i];
                if (pair.bodyA === truck.wheels[1].physicsObj || pair.bodyB === truck.wheels[1].physicsObj) {
                    allowForce = true;
                }
            }
        });

        Matter.Events.on(engine, 'collisionEnd', function(event) {
            var pairs = event.pairs;

            // change object colours to show those starting a collision
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i];
                if (pair.bodyA === truck.wheels[1].physicsObj || pair.bodyB === truck.wheels[1].physicsObj) {
                    allowForce = false;
                }
            }
        });
    });

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

    const WHEEL_TORQUE = 5;

    function draw() {
        let pos = camera.position();

        debug.innerHTML = "camera.x: " + Math.round(pos.x)+"px" + "<br />camera.y: " + Math.round(pos.y)+"px";
        debug.innerHTML += "<br />camera.xVel: " + Math.round(camera.xVel)+"px" + "<br />camera.yVel: " + Math.round(camera.yVel)+"px";

        if (allowForce) {
            if (left) {
                truck.body.applyForce({x: -5 * WORLD_SCALE * WORLD_SCALE, y: 0});
            }

            if (right) {
                let pos = truck.body.position();
                //pos.x += 1;
                truck.body.applyForce({x: 6 * WORLD_SCALE * WORLD_SCALE, y: 0.0}, pos);
                //truck.wheels[1].applyTorque(WHEEL_TORQUE);
            }
        }

        if (stop) {
            truck.wheels[1].setAngularVelocity(0);
        }

        //truck.update();
        world.update();

        scene.update();
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
