import { GravityWell } from '$src/Entities/GravityWell';
import { Entity } from '$src/Entity';
import { autostart, gravityWells, width, height, fps, gravityWellGenerationChancePerSecond, dt, flyingFucks, sparks, p5, setP5, gravityWellFlyingFucksCountOnSpawnRange, textSize, letterWidthPx, textString, gravityWellStrenghRange, gravityWellInflationRadiusBound } from '$src/vars';
import { circleRadiusByArea } from '$utils/circleRadiusByArea';
import { diceRoll } from '$utils/diceRoll';
import { randomArrayItems } from '$utils/randomArrayItems';
import { randomInRange } from '$utils/randomInRange';
import { randomIntInRange } from '$utils/randomIntInRange';
import p5Class from 'p5'


// ===============


// ===============

const startButton = document.createElement('button');
startButton.classList.add('start-button');
startButton.innerText = 'WEH!'
startButton.addEventListener('click', () => {
    startButton.remove();

    startTheMayhem();
});

document.body.append(startButton);

if (autostart) {
    startButton.click();
}


function startTheMayhem() {
    new p5Class((p5Untyped) => {
        setP5(p5Untyped as InstanceType<typeof p5Class>);

        const gravityWellCandidatePoints: [number, number][] = [];
        function generateRandomGravityWell() {
            const [x, y] = randomArrayItems(gravityWellCandidatePoints, 1)[0];

            const gravityWell = new GravityWell({
                pos: p5.createVector(x, y),
                strength: randomInRange(gravityWellStrenghRange),
                strengthEvaporationBound: 0,
                strengthExplosionBound: gravityWellInflationRadiusBound,
                flyingFucksToProduceOnSpawnCount: randomIntInRange(gravityWellFlyingFucksCountOnSpawnRange)
            })
            gravityWells.push(gravityWell);
        }



        p5.setup = function () {
            p5.createCanvas(width, height);
            p5.pixelDensity(1)
            p5.frameRate(fps);
            p5.colorMode(p5.HSL);

            const cp = p5.createVector(width / 2, height / 2);
            p5.fill('red');
            // p5.circle(cp.x, cp.y, 15);


            p5.textSize(textSize);

            p5.textAlign('center', 'center')
            p5.textStyle('bold')

            let letters = textString.split('');
            const totalWidthPx = (letters.length - 1) * letterWidthPx;

            const startingPoint = cp.copy()
                .sub(totalWidthPx / 2, 0);

            for (const [i, letter] of letters.entries()) {
                const pos = startingPoint.copy()
                    .add(letterWidthPx * i);

                this.push();

                this.translate(pos.x, pos.y);

                p5.fill('white')
                p5.text(letter, 0, 0)

                // p5.fill('gold');
                // p5.circle(0, 0, 10)

                this.pop()
            }

            // find gravity well candidate points.
            // do this by randomly selecting a pixel from the canvas.
            // if it has a color, then we hit a previously rendered letter
            // and that's where the gravity well can be put.

            p5.loadPixels();

            for (let i = 0; i < width * height; i++) {
                // check just for red channel
                if (p5.pixels[i * 4] > 0) {
                    const x = i % width;
                    const y = Math.floor(i / width);

                    gravityWellCandidatePoints.push([x, y]);
                }
            }

            this.background(5);


            // for (let i = 0; i < pointsToGenerateTotal; i++) {
            // for ()
            // }
        }

        p5.draw = function () {
            p5.background(5);

            if (diceRoll(gravityWellGenerationChancePerSecond, { dt })) {
                generateRandomGravityWell();
            }

            function iterateUpdates(entities: Entity[]) {
                const entriesToRemove = [];

                for (const entry of entities) {
                    entry.update();
                    if (entry.isDead) {
                        entriesToRemove.push(entry);
                    }
                }

                for (const entry of entriesToRemove) {
                    entities.splice(entities.indexOf(entry), 1);
                }
            }

            function iterateDraws(entities: Entity[]) {
                p5.push();
                for (const entry of entities) {
                    entry.draw();
                }
                p5.pop();
            }

            function iterateUpdatesAndDraws(entities: Entity[]) {
                iterateUpdates(entities);
                iterateDraws(entities);
            }

            iterateUpdates(gravityWells);
            iterateUpdates(flyingFucks);
            iterateUpdates(sparks);

            iterateDraws(sparks);
            iterateDraws(flyingFucks);
            iterateDraws(gravityWells);
        }
    });
}










