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
}
