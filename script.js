let VIDEO= null;
let CANVAS= null;
let CONTEXT= null;
let SCALER= 0.9;
let SIZE= {
    x:0, y:0, width:0,height:0,
    rows:3, columns:3
}
let PIECES=[];
let SELECTED_PIECE=null;
let START_TIME=null;
let END_TIME= null;


function main(){

    CANVAS= document.getElementById("myCanvas");
    CONTEXT= CANVAS.getContext("2d");

    CANVAS.width= window.innerWidth;
    CANVAS.height= window.innerHeight;

    addEventListeners();

    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices){
  let promise= navigator.mediaDevices.getUserMedia({video: true});
  promise.then(function(signal){
      VIDEO= document.createElement("video");
      VIDEO.srcObject= signal;
      VIDEO.play();

      VIDEO.onloadeddata= function(){ 
        let resizer= SCALER*Math.min(window.innerWidth/VIDEO.videoWidth, window.innerHeight/VIDEO.videoHeight)
        SIZE.width=resizer*VIDEO.videoWidth;
        SIZE.height= resizer*VIDEO.videoHeight;
        SIZE.x= window.innerWidth/2 - SIZE.width/2;
        SIZE.y= window.innerHeight/2- SIZE.height/2;
        
        initializePieces(SIZE.rows, SIZE.columns);
        updateGame();
      }
  }).catch((err)=>{
    alert("camera error"+err);
  })
}

}

function setDifficulty(){
  let diff= document.getElementById("difficulty").value;
  
  switch(diff){
      case "easy":
        initializePieces(3,3);
        break;
      case"medium":
        initializePieces(5,5);
        break;
      case "hard":
        initializePieces(10,10);
        break;
      case "insane":
        initializePieces(40,25);
        break;
  }
}

function restart(){
  START_TIME= new Date().getTime();
  END_TIME= null;
  randomizePieces();
}

function updateTime(){
  let now= new Date().getTime();
  if(START_TIME!=null){
    document.getElementById("time").innerText=Math.floor((now-START_TIME)/1000)
  }
}

function formatTime(){
  //something
}

function addEventListeners(){
  //for desktop devices

  CANVAS.addEventListener
  ("mousedown", onMouseDown);
  CANVAS.addEventListener("mousemove", onMouseMove);
  CANVAS.addEventListener("mouseup", onMouseUp);

  //for mobile devices

  CANVAS.addEventListener("touchstart", onTouchStart);
  CANVAS.addEventListener("touchmove", onTouchMove);
  CANVAS.addEventListener("touchend", onTouchEnd);

}

function onTouchStart(evt){
  let loc= {
    x: evt.touches[0].clientX,
    y: evt.touches[0].clientY
  }
  onMouseDown(loc);
}

function onTouchEnd(evt){

  onMouseUp();
}

function onTouchMove(evt){
  let loc= {
    x: evt.touches[0].clientX,
    y: evt.touches[0].clientY
  }
  onMouseMove(loc);
}

function onMouseDown(evt){
  // console.log(evt.x, evt.y);
   SELECTED_PIECE=getPressedPiece(evt);

   if(SELECTED_PIECE!=null){
    const index= PIECES.indexOf(SELECTED_PIECE);
    if(index>-1){
      PIECES.splice(index,1);
      PIECES.push(SELECTED_PIECE);
    }
   }
   if(SELECTED_PIECE!=null){
      SELECTED_PIECE.offset={
        x: evt.x- SELECTED_PIECE.x,
        y: evt.y- SELECTED_PIECE.y
      }
   }
}


function onMouseMove(evt){
  if(SELECTED_PIECE!=null){
    SELECTED_PIECE.x= evt.x-SELECTED_PIECE.offset.x;
    SELECTED_PIECE.y= evt.y-SELECTED_PIECE.offset.y
  }
}

function onMouseUp(){
  if(SELECTED_PIECE.isClose()){
    SELECTED_PIECE.snap();
  }
  SELECTED_PIECE=null;
}

function getPressedPiece(loc){

   for(let i=PIECES.length-1; i>=0; i--)
   {
    if(loc.x>PIECES[i].x && loc.x<PIECES[i].x+PIECES[i].width && loc.y>PIECES[i].y && loc.y<PIECES[i].y+PIECES[i].height){
      return PIECES[i];
    }

   }
}

// randomizePieces();

function updateGame(){
//   console.log("hello");
  CONTEXT.clearRect(0,0,CANVAS.width, CANVAS.height)
  CONTEXT.globalAlpha=0.3;
  CONTEXT.drawImage(VIDEO,SIZE.x, SIZE.y, SIZE.width, SIZE.height);

  CONTEXT.globalAlpha=1;
  for(let i=0; i<PIECES.length; i++){
    PIECES[i].draw(CONTEXT);
  }

  updateTime();
  window.requestAnimationFrame(updateGame);

}

function initializePieces(rows,cols){
    SIZE.rows= rows;
    SIZE.columns=cols;

    PIECES=[];
    for(let i=0; i<SIZE.rows; i++){
        for(let j=0; j<SIZE.columns
            ; j++){
                PIECES.push(new Piece(i,j));
            }
    }
}

function randomizePieces(){
    for(let i=0; i<PIECES.length; i++){
          let loc={
                x: Math.random()*(CANVAS.width - PIECES[i].width),
                y: Math.random()*(CANVAS.height-PIECES[i].height)
            }

        PIECES[i].x=loc.x;
        PIECES[i].y= loc.y;
    }
}

class Piece{
    constructor(rowIndex, colIndex){
        this.rowIndex=rowIndex;
        this.colIndex=colIndex;
        this.x= SIZE.x + SIZE.width*this.colIndex/SIZE.columns;
        this.y= SIZE.y+ SIZE.height*this.rowIndex/SIZE.rows;
        this.width= SIZE.width/SIZE.columns;
        this.height= SIZE.height/SIZE.rows;
         this.xCorrect=this.x;
      this.yCorrect=this.y;
    }

    draw(context){

        context.beginPath();

        context.drawImage(VIDEO,
            this.colIndex*VIDEO.videoWidth/SIZE.columns,
            this.rowIndex*VIDEO.videoHeight/SIZE.rows,
            VIDEO.videoWidth/SIZE.columns,
            VIDEO.videoHeight/SIZE.rows,
            this.x,
            this.y,
           
            this.width,
            this.height
        )
        context.rect(this.x, this.y, this.width, this.height)
        context.stroke();
    }

   isClose(){
    if(distance({x:this.x, y:this.y}, {x:this.xCorrect, y:this.yCorrect}) < this.width/3) {
      return true;}
    else return false;
   }

   snap(){
    this.x= this.xCorrect;
    this.y=this.yCorrect;
   }
}

function distance(a,b){

  return Math.sqrt((a.x-b.x)*(a.x-b.x) + (a.y-b.y)*(a.y-b.y));
}