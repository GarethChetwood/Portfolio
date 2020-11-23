import { CustomPIXIComponent } from 'react-pixi-fiber';
import * as PIXI from 'pixi.js';

const TYPE = 'Rectangle';

export default CustomPIXIComponent(
  {
    customDisplayObject: () => new PIXI.Graphics(),
    customApplyProps(instance, oldProps, newProps) {
      const { fill, x = 0, y = 0, width, height } = newProps;
      instance.clear();
      instance.lineStyle(0);
      instance.beginFill(fill);
      instance.drawRect(x, y, width, height);
      instance.endFill();
    },
  },
  TYPE
);
