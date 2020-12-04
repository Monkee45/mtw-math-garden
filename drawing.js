const BACKGROUND_COLOUR = '#000000';
const LINE_COLOUR = '#FFFFFF';
const LINE_WIDTH = 10;

var currentX = 0;
var currentY= 0;
var previousX = 0;
var previousY = 0;
var drawStart = false;

var canvas;
var context;


function prepareCanvas() {
  canvas = document.getElementById('my-canvas');
  context = canvas.getContext('2d');

  context.fillStyle = BACKGROUND_COLOUR;
  context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

  context.strokeStyle = LINE_COLOUR;
  context.lineWidth = LINE_WIDTH;
  context.lineJoin = 'round'

  canvas.addEventListener('mousedown', function(event){
    drawStart = true;
    currentX = event.clientX - canvas.offsetLeft;
    currentY = event.clientY - canvas.offsetTop;
  });

  canvas.addEventListener('mouseup', function(event){
    drawStart = false;
  });

  canvas.addEventListener('mouseleave', function(event){
      drawStart = false;
  })

  canvas.addEventListener('mousemove', function(event){
    if (drawStart) {
      previousX = currentX;
      currentX = event.clientX - canvas.offsetLeft;
      previousY = currentY;
      currentY = event.clientY - canvas.offsetTop;

      context.strokeStyle = LINE_COLOUR;

      draw();
    }
  });
// Touch Events
  canvas.addEventListener('touchstart', function(event){
    drawStart = true;
    currentX = event.touches[0].clientX - canvas.offsetLeft;
    currentY = event.touches[0].clientY - canvas.offsetTop;
  });

  canvas.addEventListener('touchend', function(event){
    drawStart = false;
  });

  canvas.addEventListener('touchcancel', function(event){
    drawStart = false;
  });

  canvas.addEventListener('touchmove', function(event){
    if (drawStart) {
      previousX = currentX;
      currentX = event.touches[0].clientX - canvas.offsetLeft;
      previousY = currentY;
      currentY = event.touches[0].clientY - canvas.offsetTop;

      context.strokeStyle = LINE_COLOUR;

      draw();
    }
  });

}

function draw() {
  context.beginPath();
  context.moveTo(previousX, previousY);
  context.lineTo(currentX, currentY);
  context.closePath();
  context.stroke();
}

function clearCanvas() {
// Reset variables to zero
  currentX = 0;
  currentY= 0;
  previousX = 0;
  previousY = 0;
// Reset the canvas to black
  context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
}
