import React, { useState, useCallback, useRef } from 'react';

import { Stage, ParticleContainer, Container } from 'react-pixi-fiber';
import range from 'lodash/range';
import CirclesController from './Circle';
import timelineBoxes, { timelineInfo } from './Timeline/timelineBoxes';
import CWStageController from './CWStageController';
import plotter from './plotter';

import { getBreakPoint, getResponsiveValue, BlobAlign } from './Constants';

const ScreenSizeMode = getBreakPoint(window.innerWidth);
const blobAlign = getResponsiveValue(window.innerWidth, ScreenSizeMode, 'blobAlign');

const compactMode = blobAlign === BlobAlign.COMPACT;
const leftMode = blobAlign === BlobAlign.LEFT;

const APP_WIDTH = compactMode ? window.innerWidth : Math.min(window.innerWidth * 0.8, 2560);

const GlobalScale = compactMode
  ? Math.min((window.innerWidth / 400) * 0.75, 1)
  : 0.25 + 0.75 * Math.min(APP_WIDTH / 2560, 1); // getResponsiveValue(window.innerWidth, ScreenSizeMode, 'globalScale');

// Work out what kind of space we are working with
const VIEW_APP_PORTION = compactMode ? 1 : 0.8; // Height of app view vs total browser viewport
const VIEW_LENGTH = VIEW_APP_PORTION * window.innerHeight;
const BATCH_VIEW_PORTION = 0.75; // height of a batch of blobs vs total view height;

const BATCH_LENGTH = (VIEW_LENGTH * BATCH_VIEW_PORTION) / GlobalScale; // Can be slightly larger through diving by GlobalScale because things get scaled down (independently of viewport

/** **********************
 * Timeline Items
 */
const TIMELINE_ITEMS = timelineInfo.length;
const TIMELINE_ITEM_SIZE = timelineInfo.reduce((lg, curr) => (curr.imgHeight > lg ? curr.imgHeight : lg), 0);
const SMALL_MODE_FACTOR = leftMode ? 0.5 : 0.25;
const TIMELINE_ITEM_GAP = compactMode ? 50 : (TIMELINE_ITEM_SIZE * SMALL_MODE_FACTOR) / GlobalScale;

const TIMELINE_ITEM_SPAN_MIN = TIMELINE_ITEM_SIZE + TIMELINE_ITEM_GAP; // distance in pixels between each timeline point
const ITEMS_PER_VIEW = Math.floor(BATCH_LENGTH / TIMELINE_ITEM_SPAN_MIN);
const TIMELINE_LENGTH = (BATCH_LENGTH / ITEMS_PER_VIEW) * TIMELINE_ITEMS;
const BATCH_COUNT = TIMELINE_LENGTH / BATCH_LENGTH;

const BATCH_POINTS = range(0, BATCH_COUNT).map((_, i) => i * BATCH_LENGTH);

// Plot out timeline points
const TIMELINE_POINTS = BATCH_POINTS.reduce((points, batchPoint, i) => {
  const space = BATCH_LENGTH;
  const itemSpan = TIMELINE_ITEM_SPAN_MIN;
  const batchItems = ITEMS_PER_VIEW;

  const remainingSpace = space - itemSpan * batchItems; // use this to center items
  const newPoints = range(0, batchItems).map(i => i * itemSpan + batchPoint + remainingSpace);
  console.log('Remaining space in batch', i, remainingSpace);
  return [...points, ...newPoints];
}, []);

// At this point we can calulate the dimensions of the app and viewport
const APP_DIMENSIONS = {
  width: APP_WIDTH,
  height: TIMELINE_LENGTH,
};

const STAGE_DIMENSIONS = {
  width: APP_DIMENSIONS.width,
  height: VIEW_LENGTH,
};

const APP_CENTER = {
  x: APP_DIMENSIONS.width * 0.5,
  y: APP_DIMENSIONS.height * 0.5,
};

const APP_LEFT_ALIGN = {
  x: -APP_DIMENSIONS.width * 0.05 * GlobalScale,
  y: APP_DIMENSIONS.height * 0.5,
};

const STAGE_OPTIONS = {
  backgroundColor: 0x202020,
  width: STAGE_DIMENSIONS.width,
  height: STAGE_DIMENSIONS.height,
  antialias: true,
  forceCanvas: true,
  // forceFXAA: true,
  // resolution: 2,
};

// Now we can finalise blob batches

// const BLOB_BATCHES = Math.round(TIMELINE_LENGTH / BLOB_BATCH_LENGTH);

// const BATCH_POINTS = new Array(BLOB_BATCHES).fill(0).map((_, i) => i * BLOB_BATCH_LENGTH);

const BATCH_VIEWPOINTS_RAW = BATCH_POINTS.map(batchpoint => -batchpoint);

const BATCH_VIEWPOINTS = BATCH_VIEWPOINTS_RAW.map(viewpoint => viewpoint * GlobalScale);

console.log('BATCH_POINTS', BATCH_POINTS);
console.log(`${BATCH_COUNT} blob batches of length ${BATCH_LENGTH}! Viewpoints: ${BATCH_VIEWPOINTS}`);

const BLOBSTREAM_WIDTH = compactMode
  ? APP_DIMENSIONS.width * 1.25
  : Math.min(Math.max(APP_DIMENSIONS.width * 0.15, 300), 500);

// May need this because firefox doesn't antialias unless there's a rectangle behind
const BG_PROPS = {
  ...APP_DIMENSIONS,
  fill: 0x202020,
};

const CACHED = !true;
const BLOBS_LOCAL_STORAGE_KEY = 'cw-blobs-data';

const blobPointInfo = CACHED
  ? JSON.parse(window.localStorage.getItem(BLOBS_LOCAL_STORAGE_KEY))
  : plotter(
      50,
      APP_DIMENSIONS.width,
      APP_DIMENSIONS.height,
      BLOBSTREAM_WIDTH,
      leftMode ? APP_LEFT_ALIGN : APP_CENTER,
      45,
      TIMELINE_POINTS,
      BATCH_POINTS,
      BATCH_LENGTH,
      compactMode,
      leftMode
    );

if (!CACHED) {
  window.localStorage.setItem(BLOBS_LOCAL_STORAGE_KEY, JSON.stringify(blobPointInfo));
}

const particleContainerProperties = {
  scale: true,
  position: false,
  rotation: false,
  uvs: false,
  tint: false,
};

const scaledContainerProperties = {
  scale: GlobalScale,
  pivot: { x: APP_DIMENSIONS.width / 2, y: APP_DIMENSIONS.height / 2 },
  position: {
    x: APP_DIMENSIONS.width * 0.5, // * GlobalScale,
    y: GlobalScale * (APP_DIMENSIONS.height * 0.5) + (VIEW_LENGTH * (1 - BATCH_VIEW_PORTION) * 0.19) / GlobalScale,
  },
};

const Blobs = () => {
  const particleContainer = useRef(null);
  const [startTimes, setStartTimes] = useState([new Date().getTime()]);
  const [viewingBatch, setViewing] = useState(0);

  const nextBatch = useCallback(
    downUp => {
      if (downUp) {
        if (viewingBatch < BATCH_COUNT - 1) {
          setViewing(viewing => viewing + 1);
          const stageDiv = document.getElementById('stageDiv');
          stageDiv.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center',
          });
          if (viewingBatch === startTimes.length - 1) {
            setStartTimes(st => [...st, new Date().getTime()]);
          }
        }
      } else if (viewingBatch > 0) {
        setViewing(viewing => viewing - 1);
      }
    },
    [startTimes, viewingBatch]
  );

  return (
    // <Stage app={app}>
    <Stage options={STAGE_OPTIONS} id="stageDiv">
      <ParticleContainer
        {...scaledContainerProperties}
        ref={particleContainer}
        maxSize={20000}
        properties={particleContainerProperties}
      >
        {/* <Rectangle {...BG_PROPS} /> */}
        <CirclesController
          circles={blobPointInfo.circles}
          startTimes={startTimes}
          particleContainer={particleContainer}
        />
      </ParticleContainer>
      <Container {...scaledContainerProperties}>
        {timelineBoxes({
          viewPoints: BATCH_VIEWPOINTS_RAW,
          stageWidth: STAGE_DIMENSIONS.width,
          stageHeight: STAGE_DIMENSIONS.height,
          timelinePointsInfo: blobPointInfo.timelinePoints,
          startTimes,
          compactMode,
        })}
      </Container>
      <CWStageController
        globalScale={GlobalScale}
        stageWidth={STAGE_DIMENSIONS.width}
        stageHeight={STAGE_DIMENSIONS.height}
        viewpoints={BATCH_VIEWPOINTS}
        viewingBatch={viewingBatch}
        onFirstBatch={viewingBatch <= 0}
        onLastBatch={viewingBatch >= BATCH_COUNT - 1}
        selectBatchCallback={nextBatch}
      />
    </Stage>
  );
};

export default Blobs;
