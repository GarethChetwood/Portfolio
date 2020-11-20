import React from 'react';
import pick from 'lodash/pick';
import TimelineBox from './TimelineBox';
import DottedLine from '../DottedLine';

import CoffeeCup from './Images/CoffeeCup.png';
import HighStreet from './Images/HighStreet.png';
import LondonBridge from './Images/LondonBridge.png';
import Postbox from './Images/Postbox.png';
import SkyscraperFar from './Images/SkyscraperFar.png';
import Pavillion from './Images/Pavillion.png';
import SmartSave from './Images/SmartSave.png';
import Teacher from './Images/Teacher.png';
import LondonBus from './Images/LondonBus.png';
import ComputerFuture from './Images/ComputerFuture.png';
import LaptopDesk from './Images/LaptopDesk.png';
import Skyscrapers from './Images/Skyscrapers.png';

import { DEFAULT_RADII } from '../plotter';

const BOX_WIDTH = 362;
const TIMELINE_POINT_OFFSET = DEFAULT_RADII * 1.44;
const BOX_POINT_OFFSET_X_LEFT = DEFAULT_RADII * 1.2 + 60;
const BOX_POINT_OFFSET_X_RIGHT = BOX_POINT_OFFSET_X_LEFT + 30;
const BOX_POINT_OFFSET_Y = 38;

const IMAGE_WIDTH = 152; // All images have the same width but different heights
const BOX_JOIN_OFFSET = IMAGE_WIDTH * 0.35;

export const timelineInfo = [
  {
    imgSrc: CoffeeCup,
    imgHeight: 152,
    dateText: 'March 2016',
    timelineText: 'Chetwood was formed',
  },
  {
    imgSrc: HighStreet,
    imgHeight: 152,
    dateText: 'January 2017',
    timelineText: 'Wrexham office opened',
  },
  {
    imgSrc: LondonBridge,
    imgHeight: 168,
    dateText: 'September 2017',
    timelineText: 'Backed by Elliott Advisors UK with £150m investment',
  },
  {
    imgSrc: Postbox,
    imgHeight: 153,
    dateText: 'December 2017',
    timelineText: 'Restricted Bank Licence granted',
  },
  {
    imgSrc: SkyscraperFar,
    imgHeight: 178,
    dateText: 'February 2018',
    timelineText: 'LiveLend launched, under a Consumer Credit Licence',
  },
  {
    imgSrc: Pavillion,
    imgHeight: 168,
    dateText: 'December 2018',
    timelineText: 'Full UK Banking Licence approved by the PRA and FCA',
  },
  {
    imgSrc: SmartSave,
    imgHeight: 152,
    dateText: 'March 2019',
    timelineText: 'Launched our first deposit brand, SmartSave',
  },
  {
    imgSrc: Teacher,
    imgHeight: 152,
    dateText: 'October 2019',
    timelineText: 'Chetwood team grew to 50 people',
  },
  {
    imgSrc: LondonBus,
    imgHeight: 152,
    dateText: 'January 2020',
    timelineText: 'London office opened',
  },
  {
    imgSrc: ComputerFuture,
    imgHeight: 194,
    dateText: 'May 2020',
    timelineText: 'Launched Chetwood built bleeding-edge decisioning capability',
  },
  {
    imgSrc: LaptopDesk,
    imgHeight: 153,
    dateText: 'July 2020',
    timelineText: 'Chetwood team grew to 100 people',
  },
  {
    imgSrc: Skyscrapers,
    imgHeight: 153,
    dateText: 'September 2020',
    timelineText: 'BetterBorrow launched',
  },
];

// Make a point
const p = (x, y) => ({ x, y });

const TimelineBoxes = ({ viewPoints, timelinePointsInfo, startTimes, compactMode }) => (
  <>
    {/* {viewPoints.map((viewPoint, i) => (
      <DottedLine
        key={i}
        startPoint={{ x: -window.innerWidth, y: -viewPoint }}
        endPoint={{ x: window.innerWidth * 2, y: -viewPoint }}
        dash={6}
        color={0xffffff}
        zOrder={-3}
      />
    ))} */}
    {timelinePointsInfo.map((pointInfo, i) => {
      if (!timelineInfo[i]) return null;
      const info = { ...pointInfo, ...timelineInfo[i] };
      const boxHeight = info.imgHeight;
      const BOX_POINT_OFFSET_X = info.isLeft ? BOX_POINT_OFFSET_X_LEFT : BOX_POINT_OFFSET_X_RIGHT;

      // "BOTTOM POINT" - Where the line from the timeline point joins the box
      const bottomPointX = info.x + (info.isLeft ? -1 : 1) * (BOX_WIDTH + BOX_POINT_OFFSET_X - BOX_JOIN_OFFSET);
      const bottomPointY = info.y - BOX_POINT_OFFSET_Y;

      const boxPosX = bottomPointX + (info.isLeft ? -BOX_JOIN_OFFSET : -BOX_WIDTH + BOX_JOIN_OFFSET);
      const boxPosY = bottomPointY - boxHeight;

      const offsetTimelinePosition = p(info.x + TIMELINE_POINT_OFFSET * (info.isLeft ? -1 : 1), info.y);

      const compactPosition = p(info.x - BOX_WIDTH * 0.5, info.y);

      return (
        <TimelineBox
          key={info.dateText}
          startTime={startTimes[info.batchNum]}
          yBeyondBatch={info.yBeyondBatch}
          boxPosition={compactMode ? compactPosition : p(boxPosX, boxPosY)}
          joinPointPosition={p(bottomPointX, bottomPointY)}
          timelinePointPosition={offsetTimelinePosition}
          boxWidth={BOX_WIDTH}
          boxHeight={boxHeight}
          dateText={info.dateText}
          image={info.imgSrc}
          textWidth={BOX_WIDTH - IMAGE_WIDTH}
          imageWidth={IMAGE_WIDTH}
          text={info.timelineText}
          compactMode={compactMode}
        />
      );
    })}
  </>
);

export default TimelineBoxes;
