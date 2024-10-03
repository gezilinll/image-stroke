import { Point, Rect } from '../common/defines';

export interface SolidOptions {
    lineWidth: number;
    expand: number;
}
export class Solid {
    private _options: SolidOptions = {
        lineWidth: 1,
        expand: 0,
    };

    setOptions(value: SolidOptions) {
        this._options = value;
    }

    getOutputExpand(): Rect {
        const value = this._options.lineWidth + this._options.expand;
        return { left: value, top: value, right: value, bottom: value };
    }

    drawSolid(output: HTMLCanvasElement, points: Point[]) {
        const ctx = output.getContext('2d')!;
        ctx.save();
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 1;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        // ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (const point of points) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();

        ctx.restore();
    }
}
