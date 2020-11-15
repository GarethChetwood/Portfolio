import { CustomPIXIComponent } from 'react-pixi-fiber';
import * as PIXI from 'pixi.js';

const TYPE = 'Circle';

export default CustomPIXIComponent(
  {
    customDisplayObject: () => new PIXI.Graphics(),
    customApplyProps(instance, oldProps, newProps) {
      const { fill, x, y, radius, opacity } = newProps;
      instance.clear();
      instance.lineStyle(0);
      instance.beginFill(fill);
      instance.drawCircle(x, y, radius);
      instance.endFill();
      // instance.filters = [new PIXI.filters.AlphaFilter(opacity)];
    },
  },
  TYPE
);
