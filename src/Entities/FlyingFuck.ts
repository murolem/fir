import { Spark } from '$src/Entities/Spark';
import { Entity } from '$src/Entity';
import { dt, flyingFuckSpawnImmunityDuration, flyingFuckGravityWellIgnoreChance, flyingFuckRadiusFactor, flyingFuckSparksOnExplodeCountRange, flyingFuckSparksOnExplodeLifetimeSecondRange, flyingFuckSparksOnExplodeMaxDeviationAngle, flyingFucksVelocitySoftLimit, flyingFucksVelocitySoftLimitEnforcingFactor, fps, gravityWells, p5, sparks, flyingFuckSparksOnExplodeInitialRadiusRange, flyingFucksGradient, flyingFuckGravityWellDistanceAffectionPower, flyingFuckEvaporationFactor, flyingFuckGravityWellAffectionIntensity, flyingFuckSparksOnExplodeSpeedVariationLimit, flyingFuckSparksOnExplodeVelocityAffectionFactor } from '$src/vars';
import { circleAreaByRadius } from '$utils/circleAreaByRadius';
import { circleRadiusByArea } from '$utils/circleRadiusByArea';
import { diceRoll } from '$utils/diceRoll';
import { randomInRange } from '$utils/randomInRange';
import { randomIntInRange } from '$utils/randomIntInRange';
import { areTwoCirclesColliding, calculateGravity, sampleGradient } from '$utils/utils';
import p5Class from 'p5';

export class FlyingFuck implements Entity {
    pos: p5Class.Vector;
    strength: number;
    velocity: p5Class.Vector;
    color: p5Class.Color;

    #createdAtFrame: number;
    #spawnImmunityDurationFrames: number;
    #radius = 0;
    #isRadiusDirty = true;

    wasEaten = false;
    wasExploded = false;

    constructor({
        pos,
        radius,
        initialVelocity,
        color
    }: {
        pos: p5Class.Vector,
        radius: number,
        initialVelocity: p5Class.Vector,
        color?: p5Class.Color
    }) {
        this.pos = pos.copy();
        this.strength = radius;
        this.velocity = initialVelocity.copy();
        this.color = color || FlyingFuck.generateColor();

        this.#createdAtFrame = p5.frameCount;
        this.#spawnImmunityDurationFrames = flyingFuckSpawnImmunityDuration * fps;
    }

    get canBeDestroyed() {
        return p5.frameCount > (this.#createdAtFrame + this.#spawnImmunityDurationFrames);
    }

    get isDead() {
        return this.strength <= 0 || this.wasEaten || this.wasExploded;
    }

    get radius() {
        if (this.#isRadiusDirty) {
            this.radius = circleRadiusByArea(this.strength) * flyingFuckRadiusFactor;
        }

        return this.#radius;
    }
    set radius(value: number) {
        this.#radius = value;
    }

    get mass() {
        return this.strength;
    }

    update() {
        const oldStrength = this.strength;
        this.strength -= flyingFuckEvaporationFactor * dt;
        const strengthDeltaFraction = 1 - (this.strength / oldStrength);
        // slow down with evaporation
        this.velocity.mult(1 - strengthDeltaFraction);

        // calculate velocity

        // apply gravity
        for (const gravityWell of gravityWells) {
            if (diceRoll(flyingFuckGravityWellIgnoreChance)) {
                continue;
            }

            // position of this flying fuck but closer to the gravity well,
            // so that it experiences more gravity
            // const fakePos = p5Class.Vector.lerp(this.pos, gravityWell.pos, Math.sqrt(flyingFuckGravityWellLeanFactor));

            const gravity = calculateGravity(
                // add a small offset to position so that we don't get infinity as result
                this.pos, this.mass,
                gravityWell.pos, gravityWell.mass,
                flyingFuckGravityWellDistanceAffectionPower
            );
            const deltaAdditive = p5Class.Vector.sub(gravityWell.pos, this.pos)
                .setMag(gravity * flyingFuckGravityWellAffectionIntensity);
            // .setMag(gravity * flyingFuckGravityWellAffectionIntensity)

            this.velocity.add(deltaAdditive.mult(dt));
        }

        // apply high soft limit
        const velocityMag = this.velocity.mag();
        if (velocityMag > flyingFucksVelocitySoftLimit) {
            const extraMagntiude = velocityMag - flyingFucksVelocitySoftLimit;
            const magnitudeDecrease = Math.max(
                extraMagntiude * flyingFucksVelocitySoftLimitEnforcingFactor * dt,
                extraMagntiude
            )
            this.velocity.setMag(velocityMag - magnitudeDecrease);
        }

        // adjust position
        this.pos.add(this.velocity.copy().mult(dt));

        // check for collisions with gravity wells,
        // but only if can be eaten by one.
        if (this.canBeDestroyed) {
            for (const gravityWell of gravityWells) {
                if (areTwoCirclesColliding(this.pos, this.radius, gravityWell.pos, gravityWell.radius)
                    // feels a bit more "natural"
                    && diceRoll(.9)) {
                    this.wasEaten = true;
                    gravityWell.eat(this);
                    this.explode();
                }
            }
        }
    }

    draw() {
        p5.fill(this.color);

        p5.circle(this.pos.x, this.pos.y, this.radius * 2)
    }

    explode() {
        const sparksCount = randomIntInRange(flyingFuckSparksOnExplodeCountRange);
        for (let i = 0; i < sparksCount; i++) {
            const sparkVelocity = this.velocity.copy()
                .mult(flyingFuckSparksOnExplodeVelocityAffectionFactor);

            sparkVelocity
                .setMag(sparkVelocity.mag() + (diceRoll(.5) ? 1 : -1) * flyingFuckSparksOnExplodeSpeedVariationLimit)
                .rotate(Math.PI + randomInRange(flyingFuckSparksOnExplodeMaxDeviationAngle));

            const spark = new Spark({
                pos: this.pos,
                velocity: sparkVelocity,
                lifetimeSeconds: randomInRange(flyingFuckSparksOnExplodeLifetimeSecondRange),
                radius: randomInRange(flyingFuckSparksOnExplodeInitialRadiusRange),
                color: this.color
            });

            sparks.push(spark);
        }

        this.wasExploded = true;
    }

    static generateColor() {
        return sampleGradient(flyingFucksGradient);
    }

    static calculateStrengthBasedOnRadius(radius: number) {
        return circleAreaByRadius(radius) / flyingFuckRadiusFactor;
    }
}