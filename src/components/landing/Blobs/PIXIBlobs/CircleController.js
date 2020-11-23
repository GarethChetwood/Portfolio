import React, { Component, useState, useEffect, useCallback, useRef } from 'react';
import { withApp, ParticleContainer } from 'react-pixi-fiber';
import * as PIXI from 'pixi.js';
import BezierEasing from 'bezier-easing';
import Particle from './Graphics/Particle';

import CircleImg from './Graphics/circle-32.png';

const ease = BezierEasing(0.25, 1.4, 0.4, 1.3);
// const ease = BezierEasing(0.07, 1.8, 0.79, 0.91);

const circle = PIXI.Texture.from(CircleImg);

const scaleParticle = function(particle, radius, currentTime, startTime, startDelay, duration) {
  // console.log('this??', this);
  // const currentTime = new Date().getTime();
  const enteredProgress = Math.min(Math.max(currentTime - startTime - startDelay, 0) / duration, 1);
  const scaleVal = (ease(enteredProgress) * radius) / 16;
  // console.log('updating scale!', scaleVal);
  particle.scale.x = scaleVal;
  particle.scale.y = scaleVal;
};

const CirclesController = ({ app, particleContainer, circles, startTimes }) => {
  const updateParticles = useCallback(() => {
    const currentTime = new Date().getTime();
    particleContainer.current.children.forEach(child => child.update(child, currentTime));
  }, [particleContainer]);

  useEffect(() => {
    app.ticker.add(updateParticles);
    return () => app.ticker.remove(updateParticles);
  });
  return (
    // const CircleSprite = props => <Sprite texture={PIXI.Texture.from(CircleImg)} {...props} anchor={0.5} />;

    <>
      {circles.map((blob, i) => {
        const startTime = startTimes[blob.batchNum];
        return (
          // <Circle key={i} app={app} startTime={startTimes[blob.batchNum]} CircleSprite={CircleSprite} {...blob} />
          startTime && (
            <Particle
              key={i}
              x={blob.x}
              y={blob.y}
              scale={0}
              anchor={0.5}
              tint={blob.fill}
              update={(particle, currentTime) =>
                scaleParticle(particle, blob.radius, currentTime, startTime, blob.enterDelay, blob.enterDuration)
              }
              texture={circle}
            />
          )
        );
      })}
    </>
  );
};

export default withApp(CirclesController);
