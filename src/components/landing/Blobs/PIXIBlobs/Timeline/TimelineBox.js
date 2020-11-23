import React, { useState } from 'react';
import * as PIXI from 'pixi.js';
import { TextStyle } from 'pixi.js';
import { Container, withApp, Text, Sprite } from 'react-pixi-fiber';
import BezierEasing from 'bezier-easing';
import RoundedRectangle from '../Graphics/RoundedRectangle';
import DottedParticleLine from '../Graphics/DottedParticleLine';

import useEnterAnimation from '../../../../../hooks/useEnterAnimation';

// Date: #00d364
// Text: #f8f8f8

const padding = { x: 20, y: 22 };
const lineHeight = 10;

const dateStyle = new TextStyle({
  fontFamily: '"Lucida Sans Unicode", "Lucida Grande", sans-serif',
  fontSize: 14,
  fontWeight: 'bold',
  fill: '#00d364',
});
const textStyle = wordWrapWidth =>
  new TextStyle({
    fontFamily: '"Lucida Sans Unicode", "Lucida Grande", sans-serif',
    fontSize: 18,
    fill: '#f8f8f8',
    wordWrap: true,
    wordWrapWidth,
  });

// const ease = function easeOutElastic(x) {
//   const c4 = (2 * Math.PI) / 3;

//   // eslint-disable-next-line no-nested-ternary
//   return x === 0 ? 0 : x === 1 ? 1 : 2 ** (-10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
// };

const ease = BezierEasing(0.16, 1, 0.3, 1);

const TimelineBox = ({
  app,
  yBeyondBatch,
  startTime,
  boxPosition,
  joinPointPosition,
  timelinePointPosition: timelinePoint,
  boxWidth,
  boxHeight,
  dateText,
  textWidth,
  image,
  imageWidth,
  text,
  compactMode,
}) => {
  const [animationProgress] = useEnterAnimation({
    ticker: app.ticker,
    canEnter: !!startTime,
    enterTime: startTime,
    enterDelay: 2000 + yBeyondBatch,
    enterDuration: 1000,
  });

  const transformProgress = ease(animationProgress);

  const { x, y } = boxPosition;

  const ImageSprite = props => <Sprite texture={PIXI.Texture.from(image)} {...props} />;

  const cornerPoint = { ...joinPointPosition, y: timelinePoint.y };

  const TEXT_START_X = x + imageWidth + padding.x;
  const TEXT_START_Y = y + padding.y;

  // console.log('About to render dotted lines!', joinPointPosition, cornerPoint, timelinePointPosition);

  return (
    <>
      <Container
        position={{ x: 0, y: 0 + boxWidth * 0.35 * (1 - transformProgress) }}
        alpha={animationProgress}
        zOrder={-1}
      >
        <RoundedRectangle x={x} y={y} width={boxWidth} height={boxHeight} fill={0x141414} radius={10} />
        <ImageSprite x={x} y={y} height={boxHeight} />
        <Text x={TEXT_START_X} y={TEXT_START_Y} style={dateStyle} text={dateText} />
        <Text
          x={TEXT_START_X}
          y={TEXT_START_Y + lineHeight * 3}
          style={textStyle(textWidth - 2 * padding.x)}
          text={text}
        />
      </Container>
      {!compactMode && (
        <>
          <DottedParticleLine
            ticker={app.ticker}
            startTime={startTime + yBeyondBatch + 3000}
            enterDuration={500}
            startX={timelinePoint.x}
            startY={timelinePoint.y}
            endX={cornerPoint.x}
            endY={cornerPoint.y}
            dashLen={6}
            color={0x646464}
          />
          <DottedParticleLine
            ticker={app.ticker}
            startTime={startTime + yBeyondBatch + 3450}
            enterDuration={175}
            isVertical
            startX={cornerPoint.x}
            startY={cornerPoint.y}
            endX={joinPointPosition.x}
            endY={joinPointPosition.y}
            dashLen={6}
            color={0x646464}
          />
        </>
      )}
    </>
  );
};

export default withApp(TimelineBox);
