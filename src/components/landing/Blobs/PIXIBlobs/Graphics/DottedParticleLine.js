import React, { useState, useEffect, useCallback, useMemo } from 'react';

import * as PIXI from 'pixi.js';
import { Stage, ParticleContainer, Container } from 'react-pixi-fiber';
import Particle from './Particle';

import SquareImg from './square8x8.png';

const square = PIXI.Texture.from(SquareImg);

const particleContainerProperties = {
  scale: false,
  position: false,
  rotation: false,
  uvs: false,
  tint: false,
};

// const getNumDashes = (startPoint, endPoint, dash, gap) =>
//   Math.ceil(Math.abs(endPoint.x - startPoint.x) + Math.abs(endPoint.y - startPoint.y) / (dash + gap));

const shiftPoint = (point, shift) => ({ x: point.x + shift.x, y: point.y + shift.y });

const makeDashes = (isVertical, startPoint, endPoint, dash, gap) => {
  const xDir = startPoint.x <= endPoint.x;
  const yDir = startPoint.y <= endPoint.y;

  const currentPosition = startPoint;

  const xCondition = () => (xDir ? currentPosition.x >= endPoint.x : currentPosition.x <= endPoint.x);
  const yCondition = () => (yDir ? currentPosition.y >= endPoint.y : currentPosition.y <= endPoint.y);

  let lineStart = { ...currentPosition };
  const lines = [];

  while (!xCondition() || !yCondition()) {
    // Check if x and y still need to continue, draw line if so
    if (!xCondition()) {
      const xDiff = Math.abs(endPoint.x - startPoint.x);
      const dashLen = Math.min(xDiff, dash);

      currentPosition.x += dashLen * (xDir ? 1 : -1);
    }

    if (!yCondition()) {
      const yDiff = Math.abs(endPoint.y - startPoint.y);
      const dashLen = Math.min(yDiff, dash);

      currentPosition.y += dashLen * (yDir ? 1 : -1);
    }

    lines.push({ ...lineStart });

    // Check if x and y need to continue, if so: move across gap , if not: set currentPosition to end
    if (!xCondition()) {
      currentPosition.x += gap * (xDir ? 1 : -1);
    } else {
      currentPosition.x = endPoint.x;
    }

    if (!yCondition()) {
      currentPosition.y += gap * (yDir ? 1 : -1);
    } else {
      currentPosition.y = endPoint.y;
    }

    lineStart = { ...currentPosition };
  }

  // Shift all the points forward along the line (because anchor is 0.5);
  return lines.map(point => {
    if (isVertical) {
      return shiftPoint(point, { x: 0, y: (yDir * dash) / 2 });
    }
    return shiftPoint(point, { x: (xDir * dash) / 2, y: 0 });
  });
  // return lines;
};

const DottedParticleLine = ({
  ticker,
  startTime,
  enterDuration,
  isVertical,
  startX,
  startY,
  endX,
  endY,
  dashLen = 16,
  gap = 8,
  thickness = 3,
  color = 0xffffff,
}) => {
  // const [dashes] = useState(makeDashes(isVertical, { x: startX, y: startY }, { x: endX, y: endY }, dashLen, gap));
  const [showDashes, setShowDashes] = useState(0);

  // const particleContainer = useRef(null);
  const dashes = useMemo(() => makeDashes(isVertical, { x: startX, y: startY }, { x: endX, y: endY }, dashLen, gap), [
    isVertical,
    startX,
    startY,
    endX,
    endY,
    dashLen,
    gap,
  ]);

  const scale = useMemo(
    () => (isVertical ? { x: thickness / 8, y: dashLen / 8 } : { x: dashLen / 8, y: thickness / 8 }),
    [isVertical, thickness, dashLen]
  ); // Square is 8px by 8px so must divide

  const drawDash = useCallback(() => {
    const currentTime = new Date().getTime();
    const elapsed = (currentTime - startTime) / enterDuration;
    setShowDashes(Math.max(Math.min(Math.floor(elapsed * dashes.length), dashes.length), 0));
  });

  useEffect(() => {
    ticker.add(drawDash);
    return () => ticker.remove(drawDash);
  });

  return (
    <ParticleContainer propteries={particleContainerProperties}>
      {dashes.slice(0, showDashes).map((dash, i) => (
        // console.log('drawing dash: ', dash);
        <Particle key={i} x={dash.x} y={dash.y} scale={scale} anchor={0.5} tint={color} texture={square} />
      ))}
    </ParticleContainer>
  );
};

export default React.memo(DottedParticleLine);
