import React, { useState, useEffect } from "react";
import "./BFS.css"

let DUMMY_OBSTACLES = [
  {"q": -1, "r": 6, "s": -5},
  {"q": -6, "r": -9, "s": 15},
  {"q": -5, "r": -9, "s": 14},
  {"q": -2, "r": 7, "s": -5},
  {"q": 4, "r": -4, "s": 0},
  {"q": 3, "r": -4, "s": 1},
  {"q": 2, "r": -4, "s": 2},
  {"q": 15, "r": -8, "s": -7},
  {"q": 14, "r": -7, "s": -7},
  {"q": 14, "r": -6, "s": -8},
  {"q": 13, "r": -5, "s": -8},
  {"q": 13, "r": -4, "s": 4},
  {"q": 4, "r": 9, "s": -13},
  {"q": 3, "r": 9, "s": -12},
  {"q": 2, "r": 9, "s": -11},
  {"q": 1, "r": 9, "s": -10},
  {"q": 0, "r": 9, "s": -9},
  {"q": -5, "r": 3, "s": 2},
  {"q": -7, "r": 4, "s": 3},
  {"q": -6, "r": 4, "s": 2},
  {"q": -8, "r": 4, "s": 4},
  {"q": -9, "r": 4, "s": 5},
  {"q": -10, "r": 9, "s": 1},
  {"q": -9, "r": 9, "s": 0},
  {"q": -8, "r": 9, "s": -1},
  {"q": -7, "r": 9, "s": -2},
  {"q": -6, "r": 9, "s": -3},
  {"q": -11, "r": 2, "s": 11},
  {"q": 0, "r": -9, "s": 9},
  {"q": 1, "r": -9, "s": 8},
  {"q": 2, "r": -9, "s": 7},
  {"q": 3, "r": -9, "s": -7},
  {"q": 4, "r": 5, "s": -9},
  {"q": 4, "r": 6, "s": -10},
  {"q": 5, "r": 6, "s": -11},
  {"q": 5, "r": 7, "s": -12},
  {"q": -1, "r": -9, "s": 10},
]


function BFS() {
  const hexSize = 20;
  const hexOrigin = { x: 400, y: 300 };
  const canvasSize = { canvasWidth: 800, canvasHeight: 600 };
  const canvasHex = React.createRef();
  const canvasInteraction = React.createRef();
  const canvasView = React.createRef();
  const [hexParametres, setHexParametres] = useState({
    hexWidth: 0,
    hexHeight: 0,
    vertDist: 0,
    horizDist: 0,
  });
  const [canvasPosition, setCanvasPosition] = useState({ left: 0, right: 0, top: 0, bottom: 0 });
  const [currentHex, setCurrentHex] = useState({q: 0, r: 0, s: 0, x:0, y:0});
  const [currentDistanceLine, setCurrentDistanceLine] = useState(0); 
  const [obstacles, setObstacles] = useState(DUMMY_OBSTACLES);
  const [playerPosition, setPlayerPosition] = useState({q: 0, r: 0, s: 0});
  const [cameFrom, setCameFrom] = useState({});
  const [hexPath, setHexPath] = useState([]);
  const [path, setPath] = useState(); 
  const [hexPathMap, setHexPathMap] = useState([]);

  const handleMouseMove = (e) => {
    const {left, right, top, bottom} = canvasPosition;
    const { canvasWidth, canvasHeight } = canvasSize;
    const {hexWidth, hexHeight, vertDist, horizDist} = hexParametres;
    let offsetX = e.pageX - left;
    let offsetY= e.pageY - top;  

    const {q,r,s} = cubeRound(pixelToHex(Point(offsetX, offsetY)));
    const {x, y} = hexToPixel(Hex(q, r, s));
    getDistanceLine(Hex(0,0,0), Hex(q,r,s));
    //console.log(currentDistanceLine);
    if ((x>hexWidth/2 && x <canvasWidth -hexWidth/2)&&
            (y> hexHeight/2 && y< canvasHeight - hexHeight/2)){
        setCurrentHex({q, r, s, x, y});        
            }
  };

  const handleClick = () =>{
    
  }

  const getCanvasPosition=(canvasID)=>{
    let rect = canvasID.current.getBoundingClientRect();
    setCanvasPosition({left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom})

  }

  const getHexCornerCoord = (center, i) => {
    let angle_deg = 60 * i + 30;
    let angle_rad = (Math.PI / 180) * angle_deg;
    let x = center.x + hexSize * Math.cos(angle_rad);
    let y = center.y + hexSize * Math.sin(angle_rad);
    return Point(x, y);
  };

  const Point = (x, y) => {
    return { x: x, y: y };
  };

  const drawHex = (canvasId, center, lineWidth, lineColor, fillColor) => {
    const ctx = canvasId.current.getContext("2d");
    for (let i = 0; i <= 5; i++) {
      let start = getHexCornerCoord(center, i);
      let end = getHexCornerCoord(center, i + 1);
      fillHex(canvasId, center, fillColor); 
      drawLine(canvasId, start, end, lineWidth, lineColor);
    }
  };

  const drawLine = (canvasId, start, end, lineWidth, lineColor) => {
    const ctx = canvasId.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
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
    let hexPathMap = []
    let p =0; 
    for (let r = 0; r<=rBottomSide; r++){
        if (r%2 === 0 && r !==0) {p++};
    
    for (let q = -qLeftSide; q<= qRightSide; q++){
        const {x, y} = hexToPixel(Hex(q-p, r));
        if ((x>hexWidth/2 && x <canvasWidth -hexWidth/2)&&
            (y> hexHeight/2 && y< canvasHeight - hexHeight/2)){
                drawHex(canvasHex, Point(x, y),1,"black", "grey");
                //drawHexCoordinates(canvasHex, Point(x, y), Hex(q-p, r, -(q-p)-r));
                let bottomH = JSON.stringify(Hex(q-p, r, -(q-p)-r));
                if(!obstacles.includes(bottomH)){
                  hexPathMap.push(bottomH);
                }
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
                drawHex(canvasHex, Point(x, y),1,"black", "grey");
               //drawHexCoordinates(canvasHex, Point(x, y), Hex(q+n, r, -(q+n)-r));
               let topH = JSON.stringify(Hex(q+n, r, -(q+n)-r));
                if(!obstacles.includes(topH)){
                  hexPathMap.push(topH);
                }
            }
        }
    }
    setHexPathMap(hexPathMap);
    breafthFirstSearch(playerPosition);

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
        drawHex(canvasInteraction, Point(x,y),  2, "red");
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

  const fillHex = (canvasID, center, fillColor)=>{
    let c0 = getHexCornerCoord (center, 0); 
    let c1 = getHexCornerCoord (center, 1); 
    let c2= getHexCornerCoord (center, 2); 
    let c3 = getHexCornerCoord (center, 3); 
    let c4 = getHexCornerCoord (center, 4); 
    let c5 = getHexCornerCoord (center, 5); 
    const ctx = canvasID.current.getContext("2d");
    ctx.beginPath();
    ctx.fillStyle = fillColor;
    ctx.globalAlpha = 0.1;
    ctx.moveTo(c0.x, c0.y);
    ctx.lineTo(c1.x, c1.y);
    ctx.lineTo(c2.x, c2.y);
    ctx.lineTo(c3.x, c3.y);
    ctx.lineTo(c4.x, c4.y);
    ctx.lineTo(c5.x, c5.y);
    ctx.closePath();
    ctx.fill();
  };

  const drawObstacles=()=>{
    obstacles.map((l)=>{
      const {q,r,s} = l;
      const {x,y} = hexToPixel(Hex(q,r,s));
      drawHex(canvasHex, Point(x,y), 1, "black", "black")
    })
  }

  const getNeighbors= (h) =>{
    let arr = [];
    for (let i = 0; i<=5; i++){
      const {q,r,s} = getCubeNeighbor(Hex(h.q, h.r, h.s), i);
      arr.push(Hex(q,r,s))
    }
    return arr
  } 

  const breafthFirstSearch = (inputPlayerPosition) =>{
    let frontier = [inputPlayerPosition];
    let localCameFrom = {};
    localCameFrom[JSON.stringify(inputPlayerPosition)] = JSON.stringify(inputPlayerPosition);
    while (frontier.length !== 0){
      let current = frontier.shift();
      let arr = getNeighbors(current);
      arr.map(l=>{
        if(!localCameFrom.hasOwnProperty(JSON.stringify(l))&& hexPathMap.includes(JSON.stringify(l))){
          frontier.push(l);
          localCameFrom[JSON.stringify(l)] = JSON.stringify(current);
        }
      })
    
    }
   setCameFrom(localCameFrom);
}

  

  useEffect(() => {
    const { canvasWidth, canvasHeight } = canvasSize;
    const ctx = canvasInteraction.current.getContext("2d");
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    if (currentHex) {
      const { q, r, s, x, y } = currentHex;
      for(let i = 0; i<=currentDistanceLine.length -2; i++){
        if (i===0){
            drawHex(canvasInteraction, Point(currentDistanceLine[i].x, currentDistanceLine[i].y), 1, "black", "red");
        } 
        else {
            drawHex(canvasInteraction, Point(currentDistanceLine[i].x, currentDistanceLine[i].y), 1, "black", "grey");
        }
      } 
      obstacles.map(l=>{
        const { q, r, s, x, y } = l;
        drawHex(canvasInteraction, Point(x, y), 1, "black",  "black");
      })
      //drawNeighbors(Hex(q,r,s));
      drawHex(canvasInteraction, Point(x, y), 1, "black",  "grey");

      
    }
  }, [currentHex]);

  useEffect(() => {
    const { canvasWidth, canvasHeight } = canvasSize;
    const hexCanvas = canvasHex.current; // Access the actual HTMLCanvasElement
    hexCanvas.width = canvasWidth;
    hexCanvas.height = canvasHeight;

    const interactionCanvas = canvasInteraction.current;
    interactionCanvas.width = canvasWidth; 
    interactionCanvas.height = canvasHeight; 

    const viewCanvas = canvasView.current;
    viewCanvas.width = canvasWidth;
    viewCanvas.height = canvasHeight;

    getCanvasPosition(canvasInteraction);
    drawHex(canvasInteraction, Point(playerPosition.x, playerPosition.y), 1, "black", "grey", 0.2)
    drawHexes(); 
    drawObstacles();
  }, []);


  return (
    <div className="BFS">
      <canvas ref={canvasHex} ></canvas>
      {/*<canvas ref={canvasCoordinates} ></canvas>*/}
      <canvas ref={canvasView}></canvas>
      <canvas ref={canvasInteraction} onMouseMove={handleMouseMove} onClick={handleClick}></canvas>
    </div>
  );

}

export default BFS;
