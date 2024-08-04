class Path {
    constructor(x1, y1, x2, y2) {
        this.start = createVector(x1, y1);
        this.end = createVector(x2, y2);
        this.radius = 20;
    }

    show() {
        stroke(255);
        strokeWeight(2);
        line(this.start.x, this.start.y, this.end.x, this.end.y);

        stroke(255, 100);
        strokeWeight(this.radius * 2);
        line(this.start.x, this.start.y, this.end.x, this.end.y);
    }
}
function findProjection(pos, a, b) {
    let v1 = p5.Vector.sub(a, pos);
    let v2 = p5.Vector.sub(b, pos);
    v2.normalize();
    let sp = v1.dot(v2);
    v2.mult(sp);
    v2.add(pos);
    return v2;
}


class Vehicle {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);
        this.r = 6;
        this.maxspeed = 8;
        this.maxforce = 0.2;
        this.prevpos = this.position;
    }

    // Method to update location
    update() {
        // Update velocity
        this.velocity.add(this.acceleration);
        // Limit speed
        this.velocity.limit(this.maxspeed);
        this.position.add(this.velocity);
        // Reset acceleration to 0 each cycle
        this.acceleration.mult(0);
    }

    applyForce(force) {
        // We could add mass here if we want A = F / M
        this.acceleration.add(force);
    }

    // A method that calculates a steering force towards a target
    // STEER = DESIRED MINUS VELOCITY
    seek(target, arrival = false) {
        //extrapolation?
        let vel = p5.Vector.sub(target, this.prevpos);
        //console.log(vel.x, vel.y)
        let newtarget = target.add(vel);
        let desired = p5.Vector.sub(newtarget, this.position); // A vector pointing from the location to the target
        let desiredspeed = this.maxspeed;

        // Scale to maximum speed
        desired.setMag(desiredspeed);

        // Steering = Desired minus velocity
        let steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxforce); // Limit to maximum steering force
        if (arrival) {
            let slowRadius = 100;
            let distance = steer.mag();
            if (distance < slowRadius) {
                desiredspeed = map(distance, 0, slowRadius, 0, this.maxSpeed);
            }
        }
        this.applyForce(steer);
        this.prevpos = this.position;
        return steer;
    }
    follow(path) {
        // Path following algorithm here!!

        // Step 1 calculate future position
        let future = this.velocity.copy();
        future.mult(20);
        future.add(this.position);
        fill(255, 0, 0);
        noStroke();
        circle(future.x, future.y, 16);

        // Step 2 Is future on path?
        let target = findProjection(path.start, future, path.end);
        fill(0, 255, 0);
        noStroke();
        circle(target.x, target.y, 16);

        let d = p5.Vector.dist(future, target);
        if (d > path.radius) {
            return this.seek(target);
        } else {
            return createVector(0, 0);
        }
    }

    seek2(target, arrival = false) {
        let force = p5.Vector.sub(target, this.pos);
        let desiredSpeed = this.maxSpeed;
        if (arrival) {
            let slowRadius = 100;
            let distance = force.mag();
            if (distance < slowRadius) {
                desiredSpeed = map(distance, 0, slowRadius, 0, this.maxSpeed);
            }
        }
        force.setMag(desiredSpeed);
        force.sub(this.vel);
        force.limit(this.maxForce);
        return force;
    }
    arrive(target) {
        // A vector pointing from the location to the target
        let desired = p5.Vector.sub(target, this.position);
        let d = desired.mag();
        // Scale with arbitrary damping within 100 pixels
        if (d < 100) {
            var m = map(d, 0, 100, 0, this.maxspeed);
            desired.setMag(m);
        } else {
            desired.setMag(this.maxspeed);
        }

        // Steering = Desired minus Velocity
        let steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxforce); // Limit to maximum steering force
        this.applyForce(steer);
    }

    show() {
        // Draw a triangle rotated in the direction of velocity
        let theta = this.velocity.heading() + PI / 2;
        fill(127);
        stroke(0);
        strokeWeight(2);
        push();
        translate(this.position.x, this.position.y);
        rotate(theta);
        beginShape();
        vertex(0, -this.r * 2);
        vertex(-this.r, this.r * 2);
        vertex(this.r, this.r * 2);
        endShape(CLOSE);
        pop();
    }

    edges() {
        if (this.position.x > width + this.r) {
            this.position.x = -this.r;
        } else if (this.position.x < -this.r) {
            this.position.x = width + this.r;
        }
        if (this.position.y > height + this.r) {
            this.position.y = -this.r;
        } else if (this.position.y < -this.r) {
            this.position.y = height + this.r;
        }
    }
}

const flock = [];
const preds = [];
let control = [];
let keyMap = {};

function keyPressed() {
    if (key in keyMap) {
        // Check if the pressed key is one we care about
        keyMap[key] = true; // Update its state to true
    }
}

// Function to handle key release events
function keyReleased() {
    if (key in keyMap) {
        // Check if the released key is one we care about
        keyMap[key] = false; // Update its state to false
    }
}
let wall1;
let maze;
let points = 0;
function setup() {
    createCanvas(800, 600);
    keyMap["w"] = false;
    keyMap["a"] = false;
    keyMap["s"] = false;
    keyMap["d"] = false;

    //wall1 = new Wall(100,200,100,500);
    maze = new Maze(50);
    for (let i = 0; i < 30; i++) {
        flock.push(new Boid("boid"));
    }
    for (let i = 0; i < 3; i++) {
        preds.push(new Boid("pred"));
        preds[i].maxSpeed = 1.0;
    }
    control.push(new Boid("pred"));
    control[0].maxSpeed = 1.5;
}

function draw() {
    background(51);
    //console.log(maze.walls)
    //console.log(flock)
    for (let i = 0; i < flock.length; i++) {
        let boid = flock[i];
        let collide = boid.flock(flock, control, maze.walls);
        if (collide) {
            flock.splice(i, 1);
            points++;
            console.log(points);
        } else {
            boid.update(true);
            //boid.show();
        }
    }

    for (let i = 0; i < preds.length; i++) {
        let boid = preds[i];
        let collide = boid.flock(control, preds, maze.walls);

        boid.update(true);
        //boid.show();
        if (collide) {
            preds.splice(i, 1);
            points -= 3;
            console.log(points);
        }
    }
    if (preds.length < 3) {
        let chance = random(100);
        if (chance < 4) {
            preds.push(new Boid("pred"));
            preds[preds.length - 1].maxSpeed = 1.0;
        }
    }
    if (preds.length < 3) {
        let chance = random(100);
        if (chance < 15) {
            flock.push(new Boid("pred"));
            //flock[flock.length - 1].maxSpeed = 1.0;
        }
    }
    for (const boid of control) {
        boid.update(false, maze.walls);
        boid.show22();
        boid.flock(flock, control, maze.walls, true);
        boid.control(keyMap);
    }
    if (frameCount == 60 * 60) {
        createP(points);
        noLoop();
    }
    push();
    fill(255);
    textSize(32);
    text(60 - floor(frameCount / 60), 10, 40);
    pop();
}

