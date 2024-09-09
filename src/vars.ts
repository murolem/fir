import { FlyingFuck } from '$src/Entities/FlyingFuck';
import { GravityWell } from '$src/Entities/GravityWell';
import { Spark } from '$src/Entities/Spark';
import p5Class from 'p5';

export let p5: InstanceType<typeof p5Class>;
export function setP5(instance: InstanceType<typeof p5Class>) {
    p5 = instance;
}

export const width = window.innerWidth;
export const height = window.innerHeight;

export const fps = 144;
export const dt = 1 / fps;

export const autostart = false;

export const textString = 'FIR';
export const textSize = 550;
export const letterWidthPx = 500;

export const gravityWellStrenghRange: [number, number] = [100, 200];
export const gravityWellGenerationChancePerSecond: number = Math.min(300, fps);
export const gravityWellFlyingFucksGenerateOnSpawnChance = 50;
export const gravityWellFlyingFucksCountOnSpawnRange: [number, number] = [0, 3];
export const gravityWellEvaporationFactor: number = 1;
export const gravityWellRadiusFactor: number = 1;
export const gravityWellConsumptionSpeedFactor: number = 50;

export const gravityWellInflationRadiusBound: number = 30;
export const gravityWellEvaporationFlyingFucksCountToSpawnPerStrength: number = 0.03;
export const gravityWellEvaporationFlyingFucksCountToSpawnLimit: number = 20;
export const gravityWellEvaporationFlyingFucksDischargeSpeedRange: [number, number] = [50, 150];
// export const gravityWellEvaporationSparksCountRange: [number, number] = [30, 50];
// export const gravityWellEvaporationSparksSpeedRange: [number, number] = [10, 200];

export const flyingFuckSplitChancePerSecond = 0.1;
export const flyingFucksRadiusRange: [number, number] = [1, 2];
export const flyingFucksInitialSpeedRange: [number, number] = [100, 500];
// limit after which flying fucks will start slowing down back to this limit 
export const flyingFucksVelocitySoftLimit = 1000;
export const flyingFucksVelocitySoftLimitEnforcingFactor = 1;
export const flyingFuckRadiusFactor: number = 10;
export const flyingFuckSpawnImmunityDuration: number = .25;
export const flyingFuckEvaporationFactor: number = .1;

export const flyingFuckSparksOnExplodeCountRange: [number, number] = [3, 8];
export const flyingFuckSparksOnExplodeLifetimeSecondRange: [number, number] = [.3, .6];
export const flyingFuckSparksOnExplodeMaxDeviationAngle: number = Math.PI + Math.PI / 3;
export const flyingFuckSparksOnExplodeVelocityAffectionFactor: number = .3;
export const flyingFuckSparksOnExplodeSpeedVariationLimit: number = 10;
export const flyingFuckSparksOnExplodeInitialRadiusRange: [number, number] = [2, 5];

export const flyingFuckGravityWellIgnoreChance = 0;
export const flyingFuckGravityWellAffectionIntensity = 30;
// from 1
export const flyingFuckGravityWellDistanceAffectionPower = 1.1;

export const sparkMaxLeanAngle = Math.PI / 3;

export const fireGradient: string[] = [
    "#FF4500", // OrangeRed
    "#FF6347", // Tomato
    "#FF7F50", // Coral
    "#FF8C00", // DarkOrange
    "#FFA500", // Orange
    "#FFD700", // Gold
    "#FFFF00", // Yellow
    "#FFFFE0", // LightYellow
    "#FFFACD", // LemonChiffon
    "#FAFAD2"  // LightGoldenRodYellow
];

export const flyingFucksGradient: string[] = [
    '#FF5733', // Red
    '#33FF57', // Green
    '#3357FF', // Blue
    '#F1C40F', // Yellow
    '#9B59B6', // Purple
    '#E67E22', // Orange
    '#1ABC9C', // Teal
    '#34495E', // Dark Blue
    '#D35400', // Dark Orange
    '#C0392B'  // Dark Red
];

// ===============

export const gravityWells: GravityWell[] = [];
export const flyingFucks: FlyingFuck[] = [];
export const sparks: Spark[] = [];