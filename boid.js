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
    update(auto, walls) {
        if (auto) {
            this.position.add(this.velocity);
            //this.velocity = p5.Vector.fromAngle(this.rotation);
            this.velocity.add(this.acceleration);
            this.velocity.limit(this.maxSpeed);
            this.acceleration.mult(0);
        } else {
            this.velocity = p5.Vector.fromAngle(this.rotation);
            //console.log(this.rotation, this.velocity.heading())
            this.velocity.mult(this.speed);
            this.velocity.limit(this.maxSpeed);
            this.position.add(this.velocity);
            this.ray.pos = this.position;
            this.ray.dir = p5.Vector.fromAngle(this.rotation);

            this.ray.show(walls);
            //console.log(this.ray.vertices)
            this.rayvertices = this.ray.vertices;
        }
        // Wrap around the canvas
        if (this.position.x > width) {
            this.position.x = 0;
        } else if (this.position.x < 0) {
            this.position.x = width;
        }
        if (this.position.y > height) {
            this.position.y = 0;
        } else if (this.position.y < 0) {
            this.position.y = height;
        }
        this.sprite.velocity = this.velocity;
        this.position = this.sprite.position;
        this.sprite.rotation = (this.velocity.heading() / PI) * 180;
    }

    applyForce(force) {
        this.acceleration.add(force);
    }

    show() {
        //stroke(255);
        strokeWeight(2);
        fill(255, 50);
        if (this.type == "pred") {
            fill(255, 0, 0);
        }
        ellipse(this.position.x, this.position.y, 8);
    }

    flee(preds) {
        let pr = 200;
        let steer = createVector();
        let total = 0;

        for (const other of preds) {
            let distance = dist(
                this.position.x,
                this.position.y,
                other.position.x,
                other.position.y
            );
            if (other !== this && distance < pr) {
                let difference = p5.Vector.sub(this.position, other.position);
                difference.div(distance / 8);
                steer.add(difference);
                total++;
            }
        }

        if (total > 0) {
            //steering.div(total);   //redundant, but still
            steer.setMag(this.maxSpeed); //desired velocity
            steer.sub(this.velocity); //calculate force
            steer.limit(this.maxForce);
        }

        return steer;
    }
    track(boidlist) {
        let pr = 400;
        let steer = createVector();
        let total = 0;
        let short = 10000;

        for (const other of boidlist) {
            let distance = dist(
                this.position.x,
                this.position.y,
                other.position.x,
                other.position.y
            );
            if (other !== this && distance < pr && distance < short) {
                short = distance;
                steer.x = other.position.x;
                steer.y = other.position.y;
                //console.log(steer)
                total++;

                //   let difference = p5.Vector.sub(this.position, other.position);
                // difference.div( - distance / 8);
                // steer.add(difference);
            }
        }

        if (total > 0) {
            //console.log(steer, total)
            //steering.div(total);   //redundant, but still
            steer.sub(this.position);
            steer.setMag(this.maxSpeed); //desired velocity
            steer.sub(this.velocity); //calculate force
            steer.limit(this.maxForce);
        }

        return steer;
    }
    follow(boidlist) {
        let pr = 400;
        let steer = createVector();
        let total = 0;
        let short = 10000;
        let newdist = createVector();
        let targetpos = createVector();
        for (const other of boidlist) {
            let distance = dist(
                this.position.x,
                this.position.y,
                other.position.x,
                other.position.y
            );

            if (other !== this && distance < pr && distance < short) {
                //newdist = p5.Vector.sub(other.position, this.position);
                //newdist.sub(other.velocity)
                //steer = p5.Vector.sub()
                //newdist.sub(other.velocity);
                let temp2 = createVector(other.velocity.x, other.velocity.y);
                temp2.mult(30);
                let temp = p5.Vector.sub(other.position, temp2);
                newdist = p5.Vector.sub(temp, this.position);
                //newdist.sub(temp);
                //console.log(other.velocity)
                push();
                fill("green");
                circle(temp.x, temp.y, 10);
                pop();
                short = distance;
                steer.x = other.position.x;
                steer.y = other.position.y;
                targetpos.x = other.position.x;
                targetpos.y = other.position.y;

                //console.log(steer)
                total++;

                //   let difference = p5.Vector.sub(this.position, other.position);
                // difference.div( - distance / 8);
                // steer.add(difference);
            }
        }

        if (total > 0) {
            //console.log(steer, total)
            //steering.div(total);   //redundant, but still
            steer.sub(this.position);
            steer.setMag(this.maxSpeed); //desired velocity
            steer.sub(this.velocity); //calculate force
            steer.limit(this.maxForce);

            newdist.setMag(this.maxSpeed); //desired velocity
            newdist.sub(this.velocity); //calculate force
            newdist.limit(this.maxForce);
        }

        //this.prevpos = createVector(this.position.x, this.position.y);
        return newdist;
    }

    separation(boids) {
        let perceptionRadius = 50;
        let steering = createVector();
        let total = 0;

        for (const other of boids) {
            let distance = dist(
                this.position.x,
                this.position.y,
                other.position.x,
                other.position.y
            );

            if (other !== this && distance < perceptionRadius) {
                let difference = p5.Vector.sub(this.position, other.position);
                difference.div(distance);
                steering.add(difference);
                total++;
            }
        }

        if (total > 0) {
            steering.div(total); //redundant, but still
            steering.setMag(this.maxSpeed); //desired velocity
            steering.sub(this.velocity); //calculate force
            steering.limit(this.maxForce);
        }

        return steering;
    }
    cohesion(boids) {
        let perceptionRadius = 100;
        let steering = createVector();
        let total = 0;

        for (const other of boids) {
            let distance = dist(
                this.position.x,
                this.position.y,
                other.position.x,
                other.position.y
            );

            if (other !== this && distance < perceptionRadius) {
                steering.add(other.position);
                total++;
            }
        }

        if (total > 0) {
            steering.div(total); //average
            steering.sub(this.position); //desired velocity
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity); //calculate force
            steering.limit(this.maxForce);
        }

        return steering;
    }
    alignment(boids) {
        let perceptionRadius = 50;
        let steering = createVector();
        let total = 0;

        for (const other of boids) {
            let distance = dist(
                this.position.x,
                this.position.y,
                other.position.x,
                other.position.y
            );

            if (other !== this && distance < perceptionRadius) {
                steering.add(other.velocity);
                total++;
            }
        }

        if (total > 0) {
            steering.div(total); //average
            steering.setMag(this.maxSpeed); //desired velocity
            steering.sub(this.velocity); //calculate force
            steering.limit(this.maxForce);
        }

        return steering;
    }
    show5() {
        strokeWeight(2);
        fill(255, 50);
        if (this.type == "pred") {
            fill(255, 0, 0);
        }
        ellipse(this.position.x, this.position.y, 15);
    }
    flock(boids, preds, walls, ctrl) {
        let sep = this.separation(boids);
        let coh = this.cohesion(boids);
        let ali = this.alignment(boids);

        if (this.type == "pred") {
            let tra = this.follow(boids);
            //console.log(tra)
            //this.seek(boids[0]);

            if (ctrl) {
                let arr = [];
                for (let boid of boids) {
                    if (this.inrange(boid)) {
                        arr.push(boid);
                        //console.log(13)
                    }
                }
                for (let boid of arr) {
                    boid.show();
                }
            } else {
                //predator
                if (this.isUnobstructed(boids[0].position, walls)) {
                    this.applyForce(tra);
                    this.applyForce(ali);
                    this.show5();
                }
            }
            for (let boid of boids) {
                if (this.sprite.colliding(boid.sprite)) {
                    //console.log(31313)
                    return true;
                }
            }
        } else {
            let ar = [];
            this.applyForce(sep);
            for (let pred of preds) {
                if (this.isUnobstructed(pred.position, walls)) {
                    //console.log(pred)
                    ar.push(pred);
                }
            }
            let pre = this.flee(ar);
            if (millis() - this.lastmillis > 5000) {
                //console.log(ar)
                this.lastmillis = millis();
            }

            for (let a of ar) {
                //ar.show();
            }
            for (let pred of preds) {
                if (this.sprite.colliding(pred.sprite)) {
                    return true;
                }
            }
            this.applyForce(pre);
            //console.log(3141)
        }

        //this.applyForce(coh);

        //this.prevpos = this.position
    }
}
