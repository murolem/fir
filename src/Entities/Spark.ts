import { Entity } from '$src/Entity';
import { dt, fireGradient, fps, p5, sparkMaxLeanAngle } from '$src/vars';
import { diceRoll } from '$utils/diceRoll';
import { randomInRange } from '$utils/randomInRange';
import { sampleGradient } from '$utils/utils';
import p5Class from 'p5';

export class Spark implements Entity {
    pos: p5Class.Vector;
    velocity: p5Class.Vector;
    lifetimeFrames: number;
    leanDirectionVec: p5Class.Vector;
    initialRadius: number;
    color: p5Class.Color | undefined;

    #createdAtFrame = p5.frameCount;

    constructor({
        pos,
        velocity,
        lifetimeSeconds,
        radius,
        color
    }: {
        pos: p5Class.Vector,
        velocity: p5Class.Vector,
        lifetimeSeconds: number,
        radius: number,
        color?: p5Class.Color
    }) {
        this.pos = pos.copy();
        this.velocity = velocity.copy();
        this.lifetimeFrames = Math.floor(lifetimeSeconds * fps);
        this.initialRadius = radius;
        this.color = color;

        this.leanDirectionVec = p5Class.Vector.fromAngle(
            velocity.heading() + (diceRoll(.5) ? 1 : -1) * randomInRange(0, sparkMaxLeanAngle)
        );
    }

    get lifetimeT() {
        return p5.constrain((p5.frameCount - this.#createdAtFrame) / this.lifetimeFrames, 0, 1);
    }

    get isDead() {
        return this.lifetimeT === 1;
    }

    update() {
        const angleToLean = p5Class.Vector.angleBetween(this.velocity, this.leanDirectionVec);

        this.velocity
            .rotate((angleToLean * 1) * this.lifetimeT);

        this.velocity
            .mult(1 - (randomInRange(0.01, .3) * this.lifetimeT));

        this.pos.add(this.velocity.copy().mult(dt));
    }

    draw() {
        const radius = this.initialRadius * (1 - this.lifetimeT);

        p5.fill(this.color ? this.color : sampleGradient(fireGradient, this.lifetimeT));
        p5.noStroke();
        p5.circle(this.pos.x, this.pos.y, radius * 2);
    }
}
