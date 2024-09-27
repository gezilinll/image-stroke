import { ImageElement } from '../common/defines';
const INF = 1e20;

export class SDF {
    private _imageCanvas: HTMLCanvasElement;

    constructor(image: ImageElement) {
        this._imageCanvas = document.createElement('canvas');
        this._imageCanvas.width = image.width;
        this._imageCanvas.height = image.height;
        const ctx = this._imageCanvas.getContext('2d')!;
        ctx.drawImage(image, 0, 0, image.width, image.height);
    }

    recognize() {
        const ctx = this._imageCanvas.getContext('2d')!;
        const width = this._imageCanvas.width;
        const height = this._imageCanvas.height;
        const imgData = ctx.getImageData(0, 0, width, height);
        const gridOuter = new Float64Array(width * height);
        const gridInner = new Float64Array(width * height);
        gridOuter.fill(INF, 0, width * height);
        gridInner.fill(0, 0, width * height);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const a = imgData.data[4 * (y * width + x) + 3] / 255; // alpha value
                if (a === 0) continue; // empty pixels

                const j = y * width + x;
                if (a > 0) {
                    // fully drawn pixels
                    gridOuter[j] = 0;
                    gridInner[j] = INF;
                }
                // else {
                //     // aliased pixels
                //     const d = 0.5 - a;
                //     gridOuter[j] = d > 0 ? d * d : 0;
                //     gridInner[j] = d < 0 ? d * d : 0;
                // }
            }
        }

        const f = new Float64Array(width * height);
        const z = new Float64Array(width * height);
        const v = new Uint16Array(width * height);
        this._edt(gridOuter, 0, 0, width, height, width, f, v, z);
        this._edt(gridInner, 0, 0, width, height, width, f, v, z);

        const data = new Uint8ClampedArray(width * height);
        for (let i = 0; i < width * height; i++) {
            const d = Math.sqrt(gridOuter[i]) - Math.sqrt(gridInner[i]);
            data[i] = d;
        }

        return data;
    }

    // 2D Euclidean squared distance transform by Felzenszwalb & Huttenlocher https://cs.brown.edu/~pff/papers/dt-final.pdf
    private _edt(
        data: Float64Array,
        x0: number,
        y0: number,
        width: number,
        height: number,
        gridSize: number,
        f: Float64Array,
        v: Uint16Array,
        z: Float64Array
    ) {
        for (let x = x0; x < x0 + width; x++) {
            this._edt1d(data, y0 * gridSize + x, gridSize, height, f, v, z);
        }
        for (let y = y0; y < y0 + height; y++) {
            this._edt1d(data, y * gridSize + x0, 1, width, f, v, z);
        }
    }

    // 1D squared distance transform
    private _edt1d(
        grid: Float64Array,
        offset: number,
        stride: number,
        length: number,
        f: Float64Array,
        v: Uint16Array,
        z: Float64Array
    ) {
        v[0] = 0;
        z[0] = -INF;
        z[1] = INF;
        f[0] = grid[offset];

        for (let q = 1, k = 0, s = 0; q < length; q++) {
            f[q] = grid[offset + q * stride];
            const q2 = q * q;
            do {
                const r = v[k];
                s = (f[q] - f[r] + q2 - r * r) / (q - r) / 2;
            } while (s <= z[k] && --k > -1);

            k++;
            v[k] = q;
            z[k] = s;
            z[k + 1] = INF;
        }

        for (let q = 0, k = 0; q < length; q++) {
            while (z[k + 1] < q) k++;
            const r = v[k];
            const qr = q - r;
            grid[offset + q * stride] = f[r] + qr * qr;
        }
    }
}
