// Realtime Pathfinding experiment
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

const gridSize = 30;

class Node {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.color = new Phaser.Display.Color().random(100,100).color;
    this.obstacle = Math.random()>0.75;
  }

  static distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;

    return Math.hypot(dx, dy);
  }
}

var config = {
    type: Phaser.AUTO,
    width: screenWidth,
    height: screenHeight,
    fps: {
        target: 30,
        forceSetTimeOut: true
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    }
};

var game = new Phaser.Game(config);
var graphics;

// Renderable Objects
var nodeGrid = [];
var source, target;

function preload() {
}

function create() {
    graphics = this.add.graphics();
    this.cameras.main.setBackgroundColor(0x0);

    var g1 = this.add.grid(screenWidth/2, screenHeight/2, screenWidth, screenHeight, gridSize, gridSize, 0x0, 0x0, 0xffffff, 0.2);
    for(var i=gridSize/2; i<screenWidth; i+=gridSize){
      var row = [];
      for(var j=gridSize/2; j < screenHeight; j+=gridSize){
        row.push(new Node(i, j));
      }
      nodeGrid.push(row)
    }

    source = nodeGrid[randomInt(nodeGrid.length)][randomInt(nodeGrid[0].length)];
    target = nodeGrid[randomInt(nodeGrid.length)][randomInt(nodeGrid[0].length)];

    source.color = 0xffffff;
    target.color = 0x0000ff;

    // Mouse and Keybindings
    this.input.on('pointerdown', function (pointer) {
        var coord = pointToCoord(pointer);
        nodeGrid[coord.x][coord.y].color = 0xffffff;
        nodeGrid[coord.x][coord.y].obstacle = false;
    });

    aStar();
}

function update() {
    redraw();
}

function redraw() {
    graphics.clear();

    nodeGrid.forEach(row => {
      row.forEach(node=>{
        if(node.obstacle){
          graphics.fillStyle(0x0);
        } else {
          graphics.fillStyle(node.color);
        }
        graphics.fillCircle(node.x, node.y, gridSize/4);
      })
    });
}

function aStar(source, target, nodeGrid){
  var openNodes = [source];
  var closedCoords = {};

  while(true) {
    return;
  }
}

// Returns a random int
// exclusive of max
function randomInt(max){
  return Math.round(Math.random()*Math.floor(max));
}

function pointToCoord(point){
  return {
    x: Math.floor(point.x/gridSize),
    y: Math.floor(point.y/gridSize)
  }
}
