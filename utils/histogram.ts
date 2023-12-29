//@ts-nocheck
export default function histogram(data:Uint8ClampedArray){
    var counts=new Uint32Array(26);
    for (let i = 0; i < data.length; i+=4) {
        if(data[i]!=0){

        const value=Math.floor(data[i]/10);
        counts[value]+=1
        }
    }

      


    console.log(counts);
    const histogramCanvas=document.createElement("canvas");
    const height=histogramCanvas.height;
    const context=histogramCanvas.getContext("2d")!;
    const maxValue=Math.max(...counts);
    histogramCanvas.width=counts.length*26;
    for (let j=0;j<counts.length;j++){
        DrawRectangle(j,counts[j]/(maxValue/100),context)
    }
   return histogramCanvas;
}
function DrawRectangle(position,height,context:CanvasRenderingContext2D){

    context.fillRect(position*20,0,20,height*5)  
}