import * as PIXI from 'pixi.js';

import pick from 'lodash/pick';

const CHETWOOD_MAIN = PIXI.utils.string2hex('#00d364');

const colours = [
  '#0b0d1f',
  '#0b0d1e',
  '#0d2332',
  '#0a0c1e',
  '#171c30',
  '#141e30',
  '#271220',
  '#252737',
  '#2b2d39',
  '#302b37',
  '#302b37',
  '#392b40',
  '#2d3038',
  '#392b40',
  '#563c34',
  '#4c363e',
  '#024a44',
  '#72433a',
  '#5b2927',
  '#344753',
  '#35414c',
  '#4e5758',
  '#846b2c',
  '#5d5130',
  '#004c44',
  '#008247',
  '#af563c',
  // '#ff90c3',
  // '#ff5e71',
].map(col => PIXI.utils.string2hex(col));

export const DEFAULT_RADII = 18;
const TIMELINE_RADIUS = DEFAULT_RADII * 1.05;

const getRandomColour = () => colours[Math.floor(Math.random() * colours.length)];

class CWCircle {
  constructor(x, y, radius, fill, batchNum, yBeyondBatch, batchLength) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.fill = fill;

    const initializeDelay = batchNum === 0 ? 1000 : 500;
    // this.enterDelay = initializeDelay + 125 + yBeyondBatch * 0.65 + 0.15 * yBeyondBatch * randnBm();
    this.enterDelay =
      initializeDelay + 125 + (yBeyondBatch ** 2 / batchLength) * (1.4 + 0.1 * randnBm()) * (0.75 + 0.1 * randnBm());
    this.enterDuration = 650 * (0.5 + randnBm()) + ((yBeyondBatch * 1.5) / batchLength) * (0.01 + 0.05 * randnBm()); // - Math.min(yBeyondBatch / 2, 500);

    this.batchNum = batchNum;
  }

  toJson() {
    return pick(this, ['x', 'y', 'radius', 'fill', 'enterDelay', 'enterDuration', 'batchNum']);
  }
}

// Box muller transform to get a normal distribution (https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve)
function randnBm() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) return randnBm(); // resample between 0 and 1
  return num;
}

const randnBmZero = () => randnBm() * 2 - 1;

// Create a grid of n x n points to fit a plane (2D array)
const makeGrid = (n, sideLength) => {
  const spacing = sideLength / n;

  // Shift the grid to the center with these coords
  const centerOffset = -spacing * (n - 1) * 0.5;

  const row = Array(n).fill({ x: 0, y: 0 }); // a row of nx columns
  const rows = Array(n).fill([...row]); // an array of ny rows
  return rows.map((currentRow, yIndex) =>
    currentRow.map((_, xIndex) => ({ x: centerOffset + xIndex * spacing, y: centerOffset + yIndex * spacing }))
  );
};

// Turn a 2D array into a 1D one
const dedimensionalise = grid2d => grid2d.reduce((grid1d, row) => [...grid1d, ...row], []);

// Rotate a point about a center - https://stackoverflow.com/questions/17410809/how-to-calculate-rotation-in-2d-in-javascript
const rotatePoint = (point, angle, center = { x: 0, y: 0 }) => {
  const { x: cx, y: cy } = center;
  const { x, y } = point;
  const radians = (Math.PI / 180) * angle;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const nx = cos * (x - cx) + sin * (y - cy) + cx;
  const ny = cos * (y - cy) - sin * (x - cx) + cy;
  return { x: nx, y: ny };
};

// Forms a stream of points along a curve
// - Builds a grid, n x n, equally spaced points;
// - Rotates it by `${angle}`
// - Builds a 'main stream' curve
// - Filters out points too far away from the 'main stream'
//    - Each point gets an 'outlierFactor' to indicate how far it is from the 'main stream'
const makeCWGrid = (n, gridLength, center, angle, streamWidth, streamRes, streamJuristiction, compactMode) => {
  // GENERATE and center lattice of points
  const gridList = dedimensionalise(makeGrid(n, gridLength));
  let blobs = gridList.map(point => ({ x: point.x + center.x, y: point.y + center.y }));

  // ROTATE by specified angle
  blobs = blobs.map(point => rotatePoint(point, angle, center));
  console.log('JURISTICTION: ', streamJuristiction);
  // Plot 'main stream' curve
  const xMax = compactMode ? streamWidth * 0.5 : streamWidth; // distance (x-axis) outside of which a circle is invariably discarded
  const streamCurve = new Array(streamRes).fill(1).map((_, i) => {
    const y = center.y - gridLength * 0.49 + (i * gridLength) / (streamRes - 1);
    const curveAngle = (y * 16) / (gridLength * 0.8); // this is the 'angle' used by the sin/cos functions, not visual angle
    const offsetFactor = -(-(Math.cos(curveAngle) ** 2) + Math.sin(curveAngle));
    const xOffset = -(compactMode ? streamWidth * 0.25 : xMax) * 0.3 * offsetFactor;
    return {
      x: center.x + xOffset,
      y,
    };
  });

  // ASSOCIATE each point to a 'juristicial' point from the 'mainstream' line
  // if a point is too far from its juristicial point, it has an increasing chance to get filtered
  blobs = blobs.map(point => {
    // Find closest juristicial point
    // (Use a quick 'distance' function);
    const distance = p => Math.sqrt((point.x - p.x) ** 2 + (point.y - p.y) ** 2);
    const juristicialPoint = streamCurve.reduce((a, b) => (distance(a) < distance(b) ? a : b));

    // Get x and y distances from juristicial point
    const xDistance = Math.abs(juristicialPoint.x - point.x);
    const yDistance = Math.abs(juristicialPoint.y - point.y);

    // Calc outlier factor
    const outlierFactor = yDistance < streamJuristiction ? Math.min(1, xDistance / xMax) : 1;

    // if (!juristicialPoint) console.log(`POINT ${point.x}, ${point.y} DOESN'T HAVE A JURISTICIAL POINT!!!`);
    return { ...point, outlierFactor, juristicialPoint };
  });

  // FILTER circles that are too far away from the main stream
  // - How far off from the 'mainstream' they are determines if they are shown
  blobs = blobs.filter(point => {
    const outlier = point.outlierFactor;
    const distFactor = Math.abs(randnBmZero()); // ratio - how far from normal distribution center 0..1

    return outlier ** 1.2 < 0.45 ? distFactor * 1.2 > outlier : false;
  });

  // return streamCurve.map(streamPoint => ({ ...streamPoint, juristicialPoint: { x: 0, y: 0 }, outlierFactor: 0 }));
  return blobs;
};

// Findds the nearest batch crossover point and returns the distance in pixels
const getBatchPointDist = (batchPoints, yPos) => {
  const batchPoint = batchPoints.reduce(
    (bpClosest, bpCurrent) => (Math.abs(bpCurrent - yPos) < Math.abs(bpClosest - yPos) ? bpCurrent : bpClosest),
    0
  );
  return Math.abs(batchPoint - yPos);
};

const getBatchNum = (batchPoints, yPos) => {
  const index = batchPoints.findIndex(batchPointPos => Math.abs(batchPointPos) > Math.abs(yPos));
  return Math.max(index === -1 ? batchPoints.length - 1 : index - 1, 0);
};

export default (
  spacing,
  width,
  height,
  streamWidth,
  center,
  angle,
  timelineItems,
  timelineItemSpan,
  batchPoints,
  batchLength,
  compactMode
) => {
  // The grid must be a square because when it rotates it needs to have enough points
  const gridLength = width >= height ? width : height;
  const n = Math.round(gridLength / spacing);

  const streamRes = Math.round((height * 10) / batchLength); // how many points make up 'main stream' line -- "resolution"
  const streamJuristiction = height / streamRes; // distance (y-axis) within which a grid point is classed as 'belonging to' a stream point

  let points = makeCWGrid(n, gridLength, center, angle, streamWidth, streamRes, streamJuristiction, compactMode);

  // Breakpoints are used for producing timeline points periodically
  let currentBreakPoint = -1;
  const breakPointDiff = timelineItemSpan; // allow for 2 extra points just in case
  const breakPoints = new Array(timelineItems + 2)
    .fill(1)
    .map((_, i) => ({ x: center.x, y: center.y - height * 0.5 + i * breakPointDiff - breakPointDiff * 0.8 })) // Start at center, move back up to top, add on current index's breakpoint amount, reduce half a break point to shift all timeline points
    .slice(1);
  // const batchPoints = new Array(Math.round(height / batchLength) + 1).fill(0).map((_, i) => i * batchLength);
  const timelinePoints = [];
  let isLeft = true; // start on the left side, alternate
  console.log('break points:', breakPoints);
  console.log('Diff:', breakPointDiff);

  // Prepare instances of the Circle class
  // First ones are rendered first (although there is some randomness) so have shortest delay
  // Randomize radius
  points = points.map(point => {
    let isTimelinePoint = false;
    const nextBreakPoint = currentBreakPoint >= breakPoints.length - 1 ? breakPoints.length - 1 : currentBreakPoint + 1;
    // console.log('Current break point:', nextBreakPoint);
    const nextBreakPos = breakPoints[nextBreakPoint].y;
    const yPos = point.y;

    const batchNum = getBatchNum(batchPoints, yPos);
    const nextPosBatchNum = getBatchNum(batchPoints, nextBreakPos);
    const yBeyondBatch = yPos % batchLength;
    const batchPointDist = getBatchPointDist(batchPoints, yPos);
    const farFromEdge = batchPointDist > batchLength * (compactMode ? 0.05 : 0.2);
    const prevPoint = timelinePoints.length > 0 ? timelinePoints.slice(-1)[0].y : 0;
    const farFromLastPoint = prevPoint === 0 || Math.abs(yPos - prevPoint) > Math.abs(breakPointDiff * 0.5);

    const nearestBatchPt = batchPoints.reduce(
      (bpClosest, bpCurrent) => (Math.abs(bpCurrent - yPos) < Math.abs(bpClosest - yPos) ? bpCurrent : bpClosest),
      0
    );
    // console.log(
    //   `${yPos > nextBreakPos}, ${farFromEdge} ${farFromLastPoint} ${timelinePoints.length - 1 < timelineItems}`
    // );
    // console.log(
    //   ` point: ${yPos}, nextBreak: ${nextBreakPos} prevTimeline: ${prevPoint}, progress: ${yPos -
    //     prevPoint} nearest: ${nearestBatchPt} diff: ${batchPointDist}, threshold: ${batchLength *
    //     0.15}, Batch: ${batchNum}, NextBatch: ${nextPosBatchNum}`
    // );

    /** **************************
     ** Do timeline points
     */
    if (timelinePoints.length < timelineItems && yPos > nextBreakPos && farFromEdge && farFromLastPoint) {
      const { juristicialPoint } = point;

      let goToNext = false;

      if (compactMode) {
        if (batchNum > nextPosBatchNum) {
          currentBreakPoint += 1;
        } else {
          goToNext = true;
        }
      } else if (!isLeft) {
        goToNext = compactMode || point.x > juristicialPoint.x + streamWidth * 0.05;
      } else {
        goToNext = point.x < juristicialPoint.x - streamWidth * 0.05;
      }

      if (goToNext) {
        currentBreakPoint += 1;
        // console.log(
        //   `!!!!!!!!!!!!!! Using ${yPos} as timeline point. (${isLeft ? 'left' : 'right'}) Breakpoint: ${nextBreakPos}`
        // );
        if (compactMode) {
          timelinePoints.push({
            x: center.x,
            y: nextBreakPos,
            isLeft: false,
            batchNum,
            yBeyondBatch,
          });
        } else {
          isTimelinePoint = true; // only make timeline points visible if not in compact mode!
          timelinePoints.push({ ...point, isLeft, batchNum, yBeyondBatch });

          isLeft = !isLeft;
        }
      }
    }

    /* **************************
     ** Do circle properties
     */
    const color = isTimelinePoint ? CHETWOOD_MAIN : getRandomColour();
    const radiusFactor = Math.min((randnBm() * 0.9 + 0.1) ** 1.56 * (1.85 - 1.45 * point.outlierFactor ** 1.5), 1);

    const radius = isTimelinePoint ? TIMELINE_RADIUS : DEFAULT_RADII * radiusFactor;
    const xOffset = isTimelinePoint ? 0 : ((randnBmZero() * (0.65 * width)) / n) * (1.2 - radiusFactor);
    const yOffset = isTimelinePoint ? 0 : ((randnBmZero() * (0.65 * height)) / n) * (1.2 - radiusFactor);

    return new CWCircle(
      point.x + xOffset,
      point.y + yOffset,
      radius,
      color,
      batchNum,
      yBeyondBatch,
      batchLength
    ).toJson();
  });

  return { circles: points, timelinePoints };
};
