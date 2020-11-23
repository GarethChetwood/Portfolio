import { CustomPIXIComponent } from 'react-pixi-fiber';
import * as PIXI from 'pixi.js';

const TYPE = 'RoundedRectangle';

export default CustomPIXIComponent(
  {
    customDisplayObject: () => new PIXI.Graphics(),
    customApplyProps(instance, oldProps, newProps) {
      const { fill, x = 0, y = 0, width, height, radius } = newProps;
      instance.clear();
      instance.lineStyle(0);
      instance.beginFill(fill);
      instance.drawRoundedRect(x, y, width, height, radius);
      instance.endFill();
    },
  },
  TYPE
);
