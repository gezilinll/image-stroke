<template>
    <div>
        <input type="file" @change="onFileChange" accept=".png, .jpg, .jpeg" />
        <img ref="srcImage" src="" alt="图片预览" />
        <canvas ref="result"></canvas>
    </div>
</template>

<script setup lang="ts">
import { SDF } from 'image-stroke';
import { Ref, ref } from 'vue';

const srcImage: Ref<HTMLImageElement | null> = ref(null);
const result: Ref<HTMLCanvasElement | null> = ref(null);

function onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            srcImage.value!.src = reader.result as any;
            srcImage.value!.onload = () => {
                console.time('sdf');
                const sdf = new SDF(srcImage.value!);
                const data = sdf.recognize();
                console.timeEnd('sdf');
                const canvas = result.value!;
                canvas.width = srcImage.value!.width;
                canvas.height = srcImage.value!.height;
                const ctx = canvas.getContext('2d')!;
                const imageData = ctx.createImageData(canvas.width, canvas.height);
                for (let i = 0; i < data.length; i++) {
                    const value = data[i] === 0 ? 0 : 255;
                    imageData.data[4 * i + 0] = value;
                    imageData.data[4 * i + 1] = value;
                    imageData.data[4 * i + 2] = value;
                    imageData.data[4 * i + 3] = 255;
                }
                ctx.putImageData(imageData, 0, 0);
            };
        };
        reader.readAsDataURL(file);
    }
}
</script>

<style></style>
