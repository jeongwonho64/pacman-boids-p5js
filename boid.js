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
}
