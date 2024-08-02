class Boid {
    constructor(type) {
        this.position = createVector(random(width), random(height));
        this.type = type;
        this.velocity = p5.Vector.random2D();
        this.acceleration = createVector();
        this.maxForce = 0.2;
        this.maxSpeed = 1;
        this.r = 5;
        this.speed = 0;
        this.prevpos = createVector(0, 0);
        this.rotation = this.velocity.heading();
        this.sprite = new Sprite(this.position.x, this.position.y, 15);
        this.sprite.visible = false;
        this.ray = new Ray(
            this.position.x,
            this.position.y,
            (this.rotation * 180) / PI
        );
        this.rayvertices = [];

        this.lastmillis = 0;
    }
    show22() {
        // Draw a triangle rotated in the direction of velocity
        let theta = this.rotation + PI / 2; // 4;
        //console.log(theta)
        fill(127);
        stroke(0);
        strokeWeight(2);
        push();
        translate(this.position.x, this.position.y);
        rotate((theta * 180) / PI);
        beginShape();
        vertex(0, -this.r * 2);
        vertex(-this.r, this.r * 2);
        vertex(this.r, this.r * 2);
        endShape(CLOSE);
        pop();
    }
    control(keymap) {
        let toggle = false;
        if (keymap["w"]) {
            this.speed += 0.02;
            toggle = true;
        }
        if (keymap["s"]) {
            this.speed -= 0.02;
            toggle = true;
        }
        if (keymap["a"]) {
            this.rotation -= 0.04;
            toggle = true;
        }
        if (keymap["d"]) {
            this.rotation += 0.04;
            toggle = true;
        }

        if (keyIsPressed && key == "w") {
            //console.log(3)
        }
        if (keyIsPressed && key == "s") {
            //this.speed -= 0.02;
        }
        if (keyIsPressed && key == "a") {
            //this.rotation -= 0.04;
            //console.log(33)
        }
        if (keyIsPressed && key == "d") {
            //this.rotation += 0.04;
        }
        if (keyIsPressed && key == "d") {
            //this.pos.x += 1;
        } else {
        }
        if (abs(this.speed) > 0.01 && toggle == false) {
            this.speed *= 0.965;
            // if (this.speed >0){
            //   this.speed -= 0.01;
            // } else {
            //   this.speed += 0.01;
            // }
        }
        if (abs(this.speed) > this.maxSpeed) {
            if (this.speed > 0) {
                this.speed = this.maxSpeed;
            } else {
                this.speed = -this.maxSpeed;
            }
        }
    }
    seek(boid, arrival = false) {
        //extrapolation?
        let target = boid.position;
        let vel = p5.Vector.sub(target, this.prevpos);
        vel = p5.Vector.sub(target, target.velocity);
        //console.log(vel.x, vel.y)
        let tempvel = createVector(boid.velocity.x, boid.velocity.y);
        tempvel.mult(5);
        let newtarget = p5.Vector.add(tempvel, target);
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
        //this.prevpos = createVector(this.position.x, this.position.y);
        return steer;
    }
    followpath(path) {
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
}
