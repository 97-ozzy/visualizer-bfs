import React, { useState, useEffect } from "react";
import "./BFS.css"

function BFS() {
  const hexSize = 20;
  const hexOrigin = { x: 400, y: 300 };
  const canvasSize = { canvasWidth: 800, canvasHeight: 600 };
  const canvasHex = React.createRef();
  const canvasCoordinates = React.createRef();
  const [hexParametres, setHexParametres] = useState(null);
  const [canvasPosition, setCanvasPosition] = useState({ left: 0, right: 0, top: 0, bottom: 0 });
  const [currentHex, setCurrentHex] = useState({q: 0, r: 0, s: 0, x:0, y:0});
  const [currentDistanceLine, setCurrentDistanceLine] = useState(); 
  
  const handleMouseMove = (e) => {
    const {left, right, top, bottom} = canvasPosition;
    const { canvasWidth, canvasHeight } = canvasSize;
    const {hexWidth, hexHeight, vertDist, horizDist} = hexParametres;
    let offsetX = e.pageX - left;
    let offsetY= e.pageY - top;  

    const {q,r,s} = cubeRound(pixelToHex(Point(offsetX, offsetY)));
    const {x, y} = hexToPixel(Hex(q, r, s));
    getDistanceLine(Hex(0,0,0), Hex(q,r,s));
    console.log(currentDistanceLine);
    if ((x>hexWidth/2 && x <canvasWidth -hexWidth/2)&&
            (y> hexHeight/2 && y< canvasHeight - hexHeight/2)){
        setCurrentHex({q, r, s, x, y});        
            }

    
    
  };

  const getCanvasPosition=(canvasID)=>{
    let rect = canvasID.current.getBoundingClientRect();
    setCanvasPosition({left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom})

  }

  const getHexCornerCord = (center, i) => {
    let angle_deg = 60 * i + 30;
    let angle_rad = (Math.PI / 180) * angle_deg;
    let x = center.x + hexSize * Math.cos(angle_rad);
    let y = center.y + hexSize * Math.sin(angle_rad);
    return Point(x, y);
  };

  const Point = (x, y) => {
    return { x: x, y: y };
  };

  const drawHex = (canvasId, center, color, width) => {
    const ctx = canvasId.current.getContext("2d");
    for (let i = 0; i <= 5; i++) {
      let start = getHexCornerCord(center, i);
      let end = getHexCornerCord(center, i + 1);

      drawLine(canvasId, { x: start.x, y: start.y }, { x: end.x, y: end.y }, color, width);
    }
  };

  const drawLine = (canvasId, start, end, color, width) => {
    const ctx = canvasId.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.closePath();
  };

  const drawHexes = () => {
    const { canvasWidth, canvasHeight } = canvasSize;
    const { hexWidth, hexHeight } = getHexParametres();
    let qLeftSide = Math.round(hexOrigin.x / hexWidth) * 4;
    let qRightSide =
      Math.round(canvasWidth - hexOrigin.x) / hexWidth * 2;
    let rTopSide = Math.round(hexOrigin.y / (hexHeight / 2));
    let rBottomSide =
      Math.round((canvasHeight - hexOrigin.y) / (hexHeight / 2));
    
    let p =0; // var
    for (let r = 0; r<=rBottomSide; r++){
        if (r%2 === 0 && r !==0) {p++};
    
    for (let q = -qLeftSide; q<= qRightSide; q++){
        const {x, y} = hexToPixel(Hex(q-p, r));
        if ((x>hexWidth/2 && x <canvasWidth -hexWidth/2)&&
            (y> hexHeight/2 && y< canvasHeight - hexHeight/2)){
                drawHex(canvasHex, Point(x, y), "grey");
                drawHexCoordinates(canvasHex, Point(x, y), Hex(q-p, r, -(q-p)-r));
            }
    }
    }
    let n = 0; //var
    for (let r  = -1; r>=-rTopSide; r--){
        if (r%2 !== 0){n++;}
    
    for (let q = -qLeftSide; q<= qRightSide; q++){
        const {x, y} = hexToPixel(Hex(q+n, r));
        if ((x>hexWidth/2 && x <canvasWidth -hexWidth/2)&&
            (y> hexHeight/2 && y< canvasHeight - hexHeight/2)){
                drawHex(canvasHex, Point(x, y), "grey");
                drawHexCoordinates(canvasHex, Point(x, y), Hex(q+n, r, -(q+n)-r));
            }
    }
    }
  };

  const hexToPixel = (h) => {
    let x = hexSize * Math.sqrt(3) * (h.q + h.r / 2) + hexOrigin.x;
    let y = hexSize * (3 / 2) * h.r + hexOrigin.y;
    return Point(x, y);
  };
  const pixelToHex=(p)=>{
    let q = ((p.x - hexOrigin.x)*Math.sqrt(3)/3-(p.y - hexOrigin.y)/3)/hexSize
    let r = (p.y - hexOrigin.y)*2/3/hexSize
    return Hex(q, r, -q - r);
  };
  const Hex = (q, r, s) => {
    return { q: q, r: r, s: s};
  };

  const drawHexCoordinates = (canvasId, center, h) => {
    const ctx = canvasId.current.getContext("2d");
    ctx.fillText(h.q, center.x + 6, center.y);
    ctx.fillText(h.r, center.x -3, center.y+15);
    ctx.fillText(h.s, center.x -12, center.y)
  };

  const getHexParametres = () => {
    let hexHeight = hexSize * 2;
    let hexWidth = (Math.sqrt(3) / 2) * hexHeight;
    let vertDist = hexHeight *3/4;
    let horizDist = hexWidth;
    setHexParametres({ hexWidth, hexHeight, vertDist, horizDist });//experimental
    return { hexWidth, hexHeight, vertDist, horizDist };
  };

  const cubeRound= (cube)=>{
    let rx = Math.round(cube.q)
    let ry = Math.round(cube.r)
    let rz = Math.round(cube.s)

    let x_diff = Math.abs(rx - cube.q)
    let y_diff = Math.abs(ry - cube.r)
    let z_diff = Math.abs(rz - cube.s)

    if (x_diff > y_diff && x_diff > z_diff) rx = - ry - rz
    else if( y_diff > z_diff) ry = -rx -rz
    else rz = -rx - ry

    return Hex(rx, ry, rz)
  };

  const cubeDirections = (direction) => {
    const cubeDirection = [Hex(1, 0, -1), Hex(1,-1,0), Hex(0,-1,1), Hex(-1,0,1), Hex(-1,1,0), Hex(0,1,-1)];
    return cubeDirection[direction];
  };

  const cubeAdd = (a, b) => {
    return Hex(a.q + b.q, a.r + b.r, a.s + b.s)
  };

  const cubeSubstract = (a, b) =>{
    return Hex(a.q - b.q, a.r - b.r, a.s - b.s)
  };

  const getCubeNeighbor = (h, direction)=>{
    return cubeAdd(h, cubeDirections(direction));
  };

  const drawNeighbors= (h) =>{
    for (let i = 0; i<=5; i++){
        const {q, r,s} = getCubeNeighbor(Hex(h.q, h.r, h.s), i);
        const {x,y} = hexToPixel(Hex(q,r,s));
        drawHex(canvasCoordinates, Point(x,y), "red", 2);
    }
  };

  const cubeDistance = (a, b) =>{
    const {q, r, s} = cubeSubstract(a, b);
    return (Math.abs(q)+Math.abs(r)+Math.abs(s))/2;
  };

  const linearInt = (a, b,t) =>{
    return (a+(b-a)*t)
  }
  const cubeLinearInt = (a, b, t)=>{
    return Hex(linearInt(a.q, b.q, t),linearInt(a.r, b.r, t), linearInt(a.s, b.s, t) );
  };

  const getDistanceLine = (a, b)=> {
    let dist = cubeDistance(a,b);
    let arr = [];
    for(let i=0; i<=dist; i++){
        let center = hexToPixel(cubeRound(cubeLinearInt(a,b,1.0/dist*i)));
        arr = [].concat(arr, center);
    }
    setCurrentDistanceLine(arr);
  }

  

  

  useEffect(() => {
    

    const { canvasWidth, canvasHeight } = canvasSize;
    const ctx = canvasCoordinates.current.getContext("2d");
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    if (currentHex) {
      const { q, r, s, x, y } = currentHex;
      for(let i = 0; i<=currentDistanceLine.length -1; i++){
        drawHex(canvasCoordinates, Point(currentDistanceLine[i].x, currentDistanceLine[i].y), "lime", 2);
      }
      //drawNeighbors(Hex(q,r,s));
      drawHex(canvasCoordinates, Point(x, y), "lime", 2);
    }
  }, [currentHex]);

  useEffect(() => {
    const { canvasWidth, canvasHeight } = canvasSize;
    const hexCanvas = canvasHex.current; // Access the actual HTMLCanvasElement
  
    hexCanvas.width = canvasWidth;
    hexCanvas.height = canvasHeight;

    const coordinatesCanvas = canvasCoordinates.current;
    coordinatesCanvas.width = canvasWidth; 
    coordinatesCanvas.height = canvasHeight; 

    getCanvasPosition(canvasCoordinates);
    drawHexes(); 
  }, []);


  return (
    <div className="BFS">
      <canvas ref={canvasHex} ></canvas>
      <canvas ref={canvasCoordinates} onMouseMove={handleMouseMove}></canvas>
    </div>
  );
}

export default BFS;
