import { CustomPIXIComponent } from 'react-pixi-fiber';
import * as PIXI from 'pixi.js';

const TYPE = 'DashedLine';

// Dotted line courtesy of https://github.com/pixijs/pixi.js/issues/1333
export default CustomPIXIComponent(
  {
    customDisplayObject: () => new PIXI.Graphics(),
    customApplyProps(instance, oldProps, newProps) {
      const { startPoint, endPoint, dash = 16, gap = 8, thickness = 2.25, color = 0xffffff } = newProps;
      const xDir = startPoint.x <= endPoint.x;
      const yDir = startPoint.y <= endPoint.y;

      const xCondition = () => (xDir ? startPoint.x >= endPoint.x : startPoint.x <= endPoint.x);
      const yCondition = () => (yDir ? startPoint.y >= endPoint.y : startPoint.y <= endPoint.y);

      instance.clear();
      instance.lineStyle(thickness, color);
      const currentPosition = startPoint;

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

        // instance.lineTo(currentPosition.x, currentPosition.y);
        lines.push([{ ...lineStart }, { ...currentPosition }]);

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

        // instance.moveTo(currentPosition.x, currentPosition.y);
        lineStart = { ...currentPosition };
      }

      if (lines.length > 0) {
        const lineDrawInterval = setInterval(() => {
          const [start, end] = lines.shift();
          instance.moveTo(start.x, start.y);
          instance.lineTo(end.x, end.y);

          if (lines.length <= 0) {
            window.clearInterval(lineDrawInterval);
          }
        }, 100);
      }
    },
  },
  TYPE
);
