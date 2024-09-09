import { FlyingFuck } from '$src/Entities/FlyingFuck';
import { Spark } from '$src/Entities/Spark';
import { Entity } from '$src/Entity';
import { flyingFucksRadiusRange, flyingFucksInitialSpeedRange, gravityWellRadiusFactor, gravityWellEvaporationFactor, dt, flyingFucks, p5, gravityWells, gravityWellInflationRadiusBound, gravityWellEvaporationFlyingFucksCountToSpawnPerStrength, gravityWellEvaporationFlyingFucksCountToSpawnLimit, sparks, gravityWellConsumptionSpeedFactor, gravityWellEvaporationFlyingFucksDischargeSpeedRange, gravityWellFlyingFucksGenerateOnSpawnChance } from '$src/vars';
import { circleRadiusByArea } from '$utils/circleRadiusByArea';
import { diceRoll } from '$utils/diceRoll';
import { randomInRange } from '$utils/randomInRange';
import { randomIntInRange } from '$utils/randomIntInRange';
import p5Class from 'p5';

export class GravityWell implements Entity {
    pos: p5Class.Vector;
    strength: number;
    strengthEvaporationBound: number;
    strengthExplosionBound: number;
    color: p5Class.Color;

    #radius = 0;
    #isRadiusDirty = true;
    #markedForDeletion = false;
    #pendingGrowthAmount = 0;

    get isDead() {
        return this.strength <= 0 || this.#markedForDeletion;
    }

    get mass() {
        return this.strength;
    }

    get radius() {
        if (this.#isRadiusDirty) {
            this.radius = circleRadiusByArea(this.strength) * gravityWellRadiusFactor;
        }

        return this.#radius;
    }

    set radius(value: number) {
        this.#radius = value;
    }

    get canEatMore() {
        return !this.isPastInflationRadius;
    }

    get isPastInflationRadius() {
        return this.radius >= gravityWellInflationRadiusBound;
    }

    constructor({
        pos,
        strength,
        strengthEvaporationBound,
        strengthExplosionBound,
        flyingFucksToProduceOnSpawnCount
    }: {
        pos: p5Class.Vector,
        strength: number,
        strengthEvaporationBound: number,
        strengthExplosionBound: number,
        flyingFucksToProduceOnSpawnCount: number
    }) {
        this.pos = pos.copy();
        this.strength = strength;
        this.strengthEvaporationBound = strengthEvaporationBound;
        this.strengthExplosionBound = strengthExplosionBound;

        this.color = p5.color(100);

        if (diceRoll(gravityWellFlyingFucksGenerateOnSpawnChance, { dt })) {
            for (let i = 0; i < flyingFucksToProduceOnSpawnCount; i++) {
                let flyingFuckRadius = randomInRange(flyingFucksRadiusRange);
                this.strength -= FlyingFuck.calculateStrengthBasedOnRadius(flyingFuckRadius);
                if (this.strength < 0) {
                    flyingFuckRadius += -this.strength;
                    this.#markedForDeletion = true;
                }

                const flyingFuck = new FlyingFuck({
                    pos,
                    radius: flyingFuckRadius,
                    initialVelocity: p5Class.Vector.random2D()
                        .mult(randomInRange(flyingFucksInitialSpeedRange))
                });

                flyingFucks.push(flyingFuck);

                if (this.#markedForDeletion) {
                    return;
                }
            }
        }
    }


    update() {
        // check periodically
        if (diceRoll(30, { dt })) {
            this.#checkForCollisionsWithOtherWells();
        }

        const strengthIncreaseFromPendingGrowth = (this.#pendingGrowthAmount * dt) * gravityWellConsumptionSpeedFactor;
        this.strength += strengthIncreaseFromPendingGrowth;
        this.#pendingGrowthAmount -= strengthIncreaseFromPendingGrowth;

        this.strength -= gravityWellEvaporationFactor * dt;

        if (this.isPastInflationRadius) {
            this.explode();
        }
    }

    #checkForCollisionsWithOtherWells() {
        for (const otherWell of gravityWells) {
            if (otherWell === this || otherWell.#markedForDeletion) {
                continue;
            }

            if (p5Class.Vector.dist(this.pos, otherWell.pos) < this.radius + otherWell.radius) {
                if (this.strength > otherWell.strength) {
                    this.eat(otherWell);
                } else {
                    otherWell.eat(this);
                }
            }
        }
    }

    #enqueueRemoval() {
        this.#markedForDeletion = true;
    }

    draw() {
        p5.fill('black');
        p5.stroke(this.color)
        p5.strokeWeight(1.5 + Math.min(this.radius / 4, 4))

        p5.circle(this.pos.x, this.pos.y, this.radius * 2);
    }

    eat(entity: FlyingFuck | GravityWell) {
        this.#pendingGrowthAmount += entity.strength;

        const oldStrength = this.strength;
        const newEventualStrength = this.strength + entity.strength;

        const consumedFraction = entity.strength / oldStrength;

        entity.strength = 0;

        if (entity instanceof FlyingFuck) {
            this.color = p5.lerpColor(this.color, entity.color, consumedFraction * 10);
        } else {

        }


        // if (this.canEatMore) {
        //     this.#checkForCollisionsWithOtherWells();
        // }
    }

    explode() {
        const flyingFucksToGenerateCount =
            Math.min(
                gravityWellEvaporationFlyingFucksCountToSpawnLimit,
                Math.floor(
                    this.strength * gravityWellEvaporationFlyingFucksCountToSpawnPerStrength
                )
            )

        let flyingFuckMaxFraction = 1 / flyingFucksToGenerateCount;
        // flyingFuckAverageFraction *= 1.5;

        for (let i = 0; i < flyingFucksToGenerateCount; i++) {
            const fraction = randomInRange(flyingFuckMaxFraction);

            const flyingFuckPos = this.pos.copy()
                .add(
                    p5Class.Vector.random2D()
                        .mult(randomInRange(this.radius / 2))
                );

            const flyingFuckRadius = this.radius * fraction;

            const flyingFuckVelocity = p5Class.Vector.random2D()
                .mult(randomInRange(gravityWellEvaporationFlyingFucksDischargeSpeedRange));

            const flyingFuck = new FlyingFuck({
                pos: flyingFuckPos,
                radius: flyingFuckRadius,
                initialVelocity: flyingFuckVelocity
            });

            flyingFucks.push(flyingFuck);
        }

        // for (let i = 0; i < randomIntInRange(gravityWellEvaporationSparksCountRange); i++) {
        //     const sparkPos = this.pos.copy()
        //         .add(
        //             p5Class.Vector.random2D()
        //                 .mult(randomInRange(this.radius))
        //         );

        //     const sparkVelocity = p5Class.Vector.random2D()
        //         .mult(randomInRange(gravityWellEvaporationSparksSpeedRange));

        //     const spark = new Spark({
        //         pos: sparkPos,
        //         velocity: sparkVelocity,
        //         lifetimeSeconds: randomInRange(.3, .6),
        //         radius: randomInRange(1, 4)
        //     });

        //     sparks.push(spark);
        // }

        this.#enqueueRemoval();
    }
}
