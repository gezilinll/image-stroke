<template>
    <div>
        <div class="container">
            <div style="display: flex">
                <div class="config-area">
                    <input
                        type="file"
                        id="selectedFile"
                        style="display: none"
                        @change="onFileChange"
                    />
                    <input
                        type="button"
                        value="Select Image"
                        @click="selectFile"
                        style="padding: 6px"
                    />
                    <div
                        style="width: 90%; height: 1px; background-color: black; margin-top: 10px"
                    ></div>
                    <div class="config-item">
                        <label>Width: </label>
                        <input v-model.number="lineWidth" type="range" min="0" max="100" />
                        <span style="margin-left: 5px">{{ lineWidth }}</span>
                    </div>

                    <div class="config-item">
                        <label>Style: </label>
                        <label>
                            <input type="radio" value="solid" v-model="styleType" /> Solid
                        </label>
                        <label>
                            <input type="radio" value="dashed" v-model="styleType" /> Dashed
                        </label>
                    </div>
                    <div class="config-item">
                        <label>Debug: </label>
                        <input
                            type="number"
                            v-model.number="debugDistance"
                            style="margin-left: 5px; width: 120px"
                        />
                    </div>
                </div>
                <canvas ref="result" class="canvas-area"></canvas>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { SDF } from 'image-stroke';
import { Ref, ref } from 'vue';

const result: Ref<HTMLCanvasElement | null> = ref(null);
const debugDistance = ref(-999);
const lineWidth = ref(0);
const styleType = ref('solid');

function selectFile() {
    document.getElementById('selectedFile')!.click();
}

function onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            const imageLoader = new Image();
            imageLoader.src = reader.result as any;
            imageLoader.onload = () => {
                console.time('sdf');
                const sdf = new SDF(imageLoader);
                const data = sdf.recognize();
                console.timeEnd('sdf');
                const canvas = result.value!;
                canvas.width = imageLoader.width;
                canvas.height = imageLoader.height;
                const ctx = canvas.getContext('2d')!;
                const imageData = ctx.createImageData(canvas.width, canvas.height);
                for (let i = 0; i < data.length; i++) {
                    const value = data[i];
                    // 将 SDF 数据映射到颜色值（例如灰度图像）
                    const intensity = Math.min(255, Math.max(0, 128 + value * 10));
                    imageData.data[i * 4] = intensity;
                    imageData.data[i * 4 + 1] = intensity;
                    imageData.data[i * 4 + 2] = intensity;
                    imageData.data[i * 4 + 3] = 255; // 不透明
                }
                // for (let i = 0; i < data.length; i++) {
                //     const value = data[i] === 50 ? 0 : 255;
                //     imageData.data[4 * i + 0] = value;
                //     imageData.data[4 * i + 1] = value;
                //     imageData.data[4 * i + 2] = value;
                //     imageData.data[4 * i + 3] = 255;
                // }
                ctx.putImageData(imageData, 0, 0);
                // const solid = new Solid();
                // const path = sdf.getStrokePath(10);
                // solid.drawSolid(canvas, path);
            };
        };
        reader.readAsDataURL(file);
    }
}
</script>

<style>
body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    height: 100vh;
    width: 100vw;
    position: absolute;
}
.container {
    position: absolute;
    background-color: rgb(233, 235, 237);
    width: 100%;
    height: 100%;
}
.config-area {
    margin: 16px;
    width: 200px;
    height: 200px;
    padding: 16px;
    box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.3);
    background-color: white;
}
.canvas-area {
    border: 1px solid #ccc;
    margin-top: 16px;
    box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.3);
}

.config-item {
    margin-top: 6px;
    display: flex;
    align-items: center;
    padding-top: 6px;
    padding-bottom: 6px;
}
</style>
