//@ts-nocheck
//import {fileToCanvas} from "./FileToCanvas.ts";
import histogram from "../utils/histogram.ts";
import cloneCanvas from "../utils/cloneCanvas.ts";
import "tiff.js";

const filesDiv: HTMLDivElement = document.getElementById('files') as HTMLDivElement;
const b3Input = document.querySelector('#b3') as HTMLInputElement;
const b5Input = document.querySelector('#b5') as HTMLInputElement;
const button = document.querySelector("#btn") as HTMLButtonElement;
const rangeInput = document.querySelector("#range") as HTMLInputElement;
const openingInput = document.querySelector("#opening") as HTMLInputElement;

rangeInput.onchange = ((e) => {
    const threshold = parseInt(rangeInput.value);
    const waterCanvas = document.getElementById('water') as HTMLCanvasElement;
    const ndwiCanvas = document.getElementById('ndwi') as HTMLCanvasElement;
    const newWaterCanvas = water(ndwiCanvas, threshold * 2.55);
    newWaterCanvas.style.width = "35%";
    document.body.replaceChild(newWaterCanvas, waterCanvas);
    newWaterCanvas.id = "water";
})





button.onclick = async (e) => {
    const b3File = b3Input.files![0] as File;
    const b5File = b5Input.files![0] as File;
    const canvasb3 = await fileToCanvas(b3File);
    const canvasb5 = await fileToCanvas(b5File);
    console.log("clicked")
    //const ndwiImage=ndwi(canvasb3,canvasb5);   
    canvasb3.style.width = "20%";
    canvasb5.style.width = "20%";
    document.body.appendChild(canvasb3);
    document.body.appendChild(canvasb5);
    const data = canvasb3.getContext('2d')!.getImageData(0, 0, canvasb3.width, canvasb3.height);

    const ndwiCanvas = ndwi(canvasb3, canvasb5);
    ndwiCanvas.id = "ndwi";
    ndwiCanvas.style.width = "20%";
    document.body.appendChild(ndwiCanvas);
    const waterCanvas = water(ndwiCanvas);
    const originalWaterCanvas = cloneCanvas(waterCanvas);
    document.body.appendChild(waterCanvas);
    const histogramCanvas = histogram(data.data);
    //const copyhistogramCanvas = JSON.parse(JSON.stringify(histogramCanvas)) as HTMLCanvasElement;
    const copyhistogramCanvas = cloneCanvas(histogramCanvas)
    copyhistogramCanvas.id = "histogram";
    const histogramOnClick = (e: MouseEvent) => {
        const newhistogramCanvas = cloneCanvas(histogramCanvas)
        const x = e.offsetX;
        const y = e.offsetY;
        const ctx = newhistogramCanvas.getContext('2d')!;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 150);
        ctx.strokeStyle = "red";
        ctx.stroke();
        newhistogramCanvas.id = "histogram";
        newhistogramCanvas.onclick = histogramOnClick;
        (e.target! as HTMLCanvasElement).replaceWith(newhistogramCanvas);
        const threshold = x / 20;
        const ndwiCanvas = document.getElementById('ndwi') as HTMLCanvasElement;
        const newWaterCanvas = water(ndwiCanvas, threshold * 10);
        const waterCanvas = document.getElementById('water') as HTMLCanvasElement;
        waterCanvas.replaceWith(newWaterCanvas)
    }
    const openingOnChaneg = (e: Event) => {
        const newCanvas = openingCanvas(cloneCanvas(originalWaterCanvas), parseInt(openingInput.value));
        console.log(newCanvas.data)
        const waterCanvas = document.getElementById('water') as HTMLCanvasElement;
        newCanvas.id = "water";
        newCanvas.style.width = "35%";
        waterCanvas.replaceWith(newCanvas);
    }
    document.querySelector("#openingButton")!.onclick = openingOnChaneg;


    copyhistogramCanvas.onclick = histogramOnClick;
    document.body.append(copyhistogramCanvas);



    //generateHistogram(ndwiCanvas)



    /*
    Promise.all([b3Promise,b5Promise]).then((images)=>{
        const b3Image=images[0];
        const b5Image=images[1];
        const ndwiImage=ndwi(b3Image,b5Image);
        const ndwiCanvas=ndwiImage.toCanvas();
        document.body.appendChild(ndwiCanvas);
    })*/
}
Tiff.initialize({ TOTAL_MEMORY: 19777216 * 10 });




/*
const openingCanvas = (canvas: HTMLCanvasElement, openingNumber: number) => {
    const context = canvas.getContext('2d');
    if (!context) {
        console.error('Unable to get 2D context from canvas');
        return;
    }

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const width = canvas.width;
    const height = canvas.height;

    const getIndex = (x: number, y: number) => (y * width + x) * 4;

    const isPixelValid = (x: number, y: number) => {
        const index = getIndex(x, y);
        return data[index] !== 0; // Check if the pixel is not 0
    };

    const isSurroundingZero = (x: number, y: number) => {
        for (let i = -openingNumber; i <= openingNumber; i++) {
            for (let j = -openingNumber; j <= openingNumber; j++) {
                const nx = x + i;
                const ny = y + j;
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    if (data[getIndex(nx, ny)] !== 0) {
                        return false; // If any surrounding pixel is not 0, return false
                    }
                }
            }
        }
        return true; // All surrounding pixels are 0
    };

    // Apply opening operation
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (isPixelValid(x, y) && isSurroundingZero(x, y)) {
                // Set the pixel to 0
                const index = getIndex(x, y);
                data[index] = 0;
                data[index + 1] = 0;
                data[index + 2] = 0;
                data[index + 3] = 0; // Alpha channel
            }
        }
    }

    // Update the canvas with the modified data
    context.putImageData(imageData, 0, 0);
    return canvas;
};*/

const openingCanvas = (sourceCanvas: HTMLCanvasElement, openingNumber: number): HTMLCanvasElement => {
    const sourceContext = sourceCanvas.getContext('2d');
    if (!sourceContext) {
      console.error('Unable to get 2D context from source canvas');
      return sourceCanvas;
    }
  
    const sourceImageData = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    const sourceData = sourceImageData.data;
  
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;
  
    const getIndex = (x: number, y: number) => (y * width + x) * 4;
  
    const isPixelValid = (x: number, y: number) => {
      const index = getIndex(x, y);
      return sourceData[index] !== 0;
    };
  
    const isSurroundingZero = (x: number, y: number) => {
      for (let i = -openingNumber; i <= openingNumber; i++) {
        for (let j = -openingNumber; j <= openingNumber; j++) {
          const nx = x + i;
          const ny = y + j;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            if (sourceData[getIndex(nx, ny)] !== 0) {
              return false;
            }
          }
        }
      }
      return true;
    };
  
    // Create a new canvas
    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = width;
    resultCanvas.height = height;
    const resultContext = resultCanvas.getContext('2d');
    if (!resultContext) {
      console.error('Unable to get 2D context for result canvas');
      return sourceCanvas;
    }
  
    // Apply opening operation
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (isPixelValid(x, y) && isSurroundingZero(x, y)) {
          // Set the pixel to 0 in the result canvas
          const index = getIndex(x, y);
          sourceData[index] = 0;
          sourceData[index + 1] = 0;
          sourceData[index + 2] = 0;
          sourceData[index + 3] = 0;
        }
      }
    }
  
    // Draw the modified data onto the result canvas
    resultContext.putImageData(sourceImageData, 0, 0);
  
    // Return the new canvas
    return resultCanvas;
  };





const fileToCanvas = (file: File): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const tiff = new Tiff({ buffer: reader.result });
            const canvas = tiff.toCanvas();
            resolve(canvas);
        }
        reader.readAsArrayBuffer(file);
    }, (error) => {
        reject(error);
        alert("change other data");

    })
}



const water = (ndwiCanvas: HTMLCanvasElement, threshold = 20) => {
    const ndwiContext = ndwiCanvas.getContext('2d')!.getImageData(0, 0, ndwiCanvas.width, ndwiCanvas.height);
    const waterCanvas = document.createElement('canvas');
    waterCanvas.width = ndwiCanvas.width;
    waterCanvas.height = ndwiCanvas.height;
    const waterContext = waterCanvas.getContext('2d')!
    const waterData = waterContext.getImageData(0, 0, waterCanvas.width, waterCanvas.height);

    for (var i = 0; i < ndwiContext.data.length; i += 4) {
        const ndwiPixel = ndwiContext.data[i];
        if (ndwiPixel > threshold) {
            waterData.data[i] = 255;
            waterData.data[i + 1] = 255;
            waterData.data[i + 2] = 255;
            waterData.data[i + 3] = 255;
        }
        else {
            waterData.data[i] = 0;
            waterData.data[i + 1] = 0;
            waterData.data[i + 2] = 0;
            waterData.data[i + 3] = 255;
        }
    }
    waterContext.putImageData(waterData, 0, 0)
    waterCanvas.id = "water";
    waterCanvas.style.width = "35%";
    return waterCanvas;
}
const waterRust = (ndwiCanvas: HTMLCanvasElement, threshold = 0.2) => {
    //const 

}




const ndwi = (canvasB3: HTMLCanvasElement, canvasB5: HTMLCanvasElement) => {
    const b3 = canvasB3.getContext('2d')!.getImageData(0, 0, canvasB3.width, canvasB3.height);
    const b5 = canvasB5.getContext('2d')!.getImageData(0, 0, canvasB5.width, canvasB5.height);
    console.log(b3.data);
    console.log(b5.data);
    const ndwiCanvas = document.createElement('canvas');
    ndwiCanvas.width = canvasB3.width;
    ndwiCanvas.height = canvasB3.height;
    const ndwiContext = ndwiCanvas.getContext('2d')!;
    const ndwiData = ndwiContext.createImageData(canvasB3.width, canvasB3.height);
    const ndwiPixels = ndwiData.data;

    for (let i = 0; i < b3.data.length; i += 4) {
        const b3Pixel = b3.data[i];
        const b5Pixel = b5.data[i];
        const ndwiValue = (b3Pixel - b5Pixel) / (b3Pixel + b5Pixel)
        const ndwiPixel = ndwiValue * 255;
        if (111000000 < i && i < 111000100) {
            console.log(b3Pixel);
            console.log(b5Pixel);
            console.log(ndwiPixel)
        }

        ndwiPixels[i] = ndwiPixel;
        ndwiPixels[i + 1] = ndwiPixel;
        ndwiPixels[i + 2] = ndwiPixel;
        ndwiPixels[i + 3] = 255;
    }
    console.log(ndwiPixels);
    ndwiContext.putImageData(ndwiData, 0, 0);
    return ndwiCanvas;
}
