//import {fileToCanvas} from "./FileToCanvas.ts";

import histogram from "../utils/histogram.ts";
import cloneCanvas from "../utils/cloneCanvas.ts";

const filesDiv: HTMLDivElement = document.getElementById('files') as HTMLDivElement;
const b3Input = document.querySelector('#b3') as HTMLInputElement;
const b5Input = document.querySelector('#b5') as HTMLInputElement;
const button = document.querySelector("#btn") as HTMLButtonElement;
const rangeInput = document.querySelector("#range") as HTMLInputElement;
const openingInput=document.querySelector("#opening") as HTMLInputElement;
openingInput.onchange=((e)=>{
    const openingNumber=parseInt(openingInput.value);  
    const waterCanvas=document.getElementById('water') as HTMLCanvasElement;
    const newWaterCanvas=cloneCanvas(

})

rangeInput.onchange = ((e) => {
    const threshold = parseInt(rangeInput.value);
    const waterCanvas = document.getElementById('water') as HTMLCanvasElement;
    const ndwiCanvas = document.getElementById('ndwi') as HTMLCanvasElement;
    const newWaterCanvas = water(ndwiCanvas, threshold*2.55);
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
    document.body.appendChild(waterCanvas);
    const histogramCanvas = histogram(data.data);
    //const copyhistogramCanvas = JSON.parse(JSON.stringify(histogramCanvas)) as HTMLCanvasElement;
    const copyhistogramCanvas =cloneCanvas(histogramCanvas)
    copyhistogramCanvas.id = "histogram";
    const histogramOnClick=(e:MouseEvent)=>{
        const newhistogramCanvas=cloneCanvas(histogramCanvas)
        const x=e.offsetX;
        const y=e.offsetY;
        const ctx=newhistogramCanvas.getContext('2d')!;
        ctx.beginPath();
        ctx.moveTo(x,0);    
        ctx.lineTo(x,150);
        ctx.strokeStyle="red";
        ctx.stroke();
        newhistogramCanvas.id="histogram";
        newhistogramCanvas.onclick=histogramOnClick;
        (e.target!as HTMLCanvasElement).replaceWith(newhistogramCanvas);  
        const threshold=x/20;
        const ndwiCanvas=document.getElementById('ndwi') as HTMLCanvasElement;
        const newWaterCanvas=water(ndwiCanvas,threshold*10);
        const waterCanvas=document.getElementById('water') as HTMLCanvasElement;
        waterCanvas.replaceWith(newWaterCanvas)
    }
    const openingOnChaneg=(e:Event)=>{
        
    }


    
    copyhistogramCanvas.onclick=histogramOnClick;
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


const generateHistogram = (canvas: HTMLCanvasElement) => {
    var image=canvas.getContext('2d')!.getImageData(0,0,canvas.width,canvas.height).data;
    var imageData = [];
    for(let i=0;i<image.length;i+=4){   
        imageData[i/4]=image[i];
    }
    imageData=imageData.filter

    // Set up the SVG container
    var svgWidth = 400;
    var svgHeight = 200;

    var svg = d3.select('body')
        .append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight);

    // Set up the scales
    var xScale = d3.scaleBand()
        .domain(d3.range(imageData.length))
        .range([0, svgWidth])
        .padding(0.1);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(imageData)])
        .range([svgHeight, 0]);

    // Create the bars
    svg.selectAll('rect')
        .data(imageData)
        .enter()
        .append('rect')
        .attr('x', function (d, i) {
            return xScale(i);
        })
        .attr('y', function (d) {
            return yScale(d);
        })
        .attr('width', xScale.bandwidth())
        .attr('height', function (d) {
            return svgHeight - yScale(d);
        })
        .attr('fill', 'steelblue');

    // Add axes
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    svg.append('g')
        .attr('transform', 'translate(0,' + svgHeight + ')')
        .call(xAxis);

    svg.append('g')
        .call(yAxis);
}





const fileToCanvas = (file: File): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const tiff = new Tiff({ buffer: reader.result });
            const canvas = tiff.toCanvas();
            resolve(canvas);
        }
        reader.readAsArrayBuffer(file);
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
    waterCanvas.id="water";
    waterCanvas.style.width="35%";
    return waterCanvas;
}
const waterRust = (ndwiCanvas: HTMLCanvasElement,threshold=0.2) => {
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
