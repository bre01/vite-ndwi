export function extractPoints(points:Uint8ClampedArray,groupNumber:number=4){
    const results:Uint8ClampedArray=new Uint8ClampedArray();
    var count=0;
    for(let i=0;i<points.length;i+=groupNumber){
        results[count]=points[i];
        count+=1;
    }
    

}

export function extractPointsWithoutOutside(points:Uint8ClampedArray,groupNumber:number=4){
    const results:Uint8ClampedArray=new Uint8ClampedArray();
    var count=0;
    for(let i=0;i<points.length;i+=groupNumber){
        if(points[i]===0)continue;
        results[count]=points[i];
        count+=1;
    }

}

