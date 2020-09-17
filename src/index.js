var Phaser = require('phaser');
var Heap = require("collections/heap");

// Realtime Pathfinding experiment
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

const gridSize = 50;

class Node {
  constructor(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;

    this.color = new Phaser.Display.Color().random(100,100).color;
    this.obstacle = Math.random()>0.75;
  }

  setCost(cost){
    this.cost = cost
  }

  static distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;

    return Math.hypot(dx, dy);
  }

  static compare(a, b) {
    const aFCost = a.cost.g + a.cost.h;
    const bFCost = b.cost.g + b.cost.h;

    return aFCost > bFCost ? -1 :
           aFCost < bFCost ? 1 :
           a.cost.h > b.cost.h ? -1 :
           b.cost.h > a.cost.h ? 1 :
           0
  }

  static equal(a, b) {
    return a.id == b.id;
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
var source, target, shortestPath;

function preload() {
}

function create() {
    graphics = this.add.graphics();
    this.cameras.main.setBackgroundColor(0x0);

    var g1 = this.add.grid(screenWidth/2, screenHeight/2, screenWidth, screenHeight, gridSize, gridSize, 0x0, 0x0, 0xffffff, 0.2);
    for(var i=gridSize/2; i<screenWidth; i+=gridSize){
      var row = [];
      for(var j=gridSize/2; j < screenHeight; j+=gridSize){
        row.push(new Node(i+'-'+j,i, j));
      }
      nodeGrid.push(row)
    }

    source = nodeGrid[randomInt(nodeGrid.length)][randomInt(nodeGrid[0].length)];
    target = nodeGrid[randomInt(nodeGrid.length)][randomInt(nodeGrid[0].length)];

    source.obstacle=false; source.color = 0xffffff;
    target.obstacle=false; target.color = 0x0000ff;

    // Mouse and Keybindings
    this.input.on('pointerdown', function (pointer) {
        var coord = pointToCoord(pointer);
        nodeGrid[coord.x][coord.y].color = 0xffffff;
        nodeGrid[coord.x][coord.y].obstacle = false;
    });

    shortestPath = aStar(source, target, nodeGrid);
    shortestPath.forEach(node => {node.color = 0xffffff});
    source.color = 0x00ff00;
    target.color = 0x0000ff;
}

function update() {
    redraw();
}

function redraw() {
    graphics.clear();

    if(shortestPath.length > 0){
      const start = shortestPath[0];
      var path = new Phaser.Curves.Path(start.x, start.y);
      shortestPath.slice(1).forEach(node => {
        path.lineTo(node.x, node.y);
      });
      graphics.lineStyle(9, 0xffffff, 1);
      path.draw(graphics);
    }

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

    graphics.lineStyle(7, 0xffffff, 1);
    graphics.strokeCircle(source.x, source.y, gridSize/4);
    graphics.strokeCircle(target.x, target.y, gridSize/4);
}

function aStar(source, target, nodeGrid){
  var closedNodes = {};

  var minHeap = new Heap([source], Node.equal, Node.compare);

  source.setCost({
    g: 0,
    h: Node.distance(source, target)
  });

  var cur;
  while(minHeap.length > 0) {
    cur = minHeap.pop();
    closedNodes[cur.id] = true;

    if(cur.id == target.id){
      break;
    }
    cur.color = 0xee6464;

    const neighbors = getNeighbors(cur);
    neighbors.forEach(neighbor => {
      if(neighbor.obstacle || closedNodes[neighbor.id]){
        return;
      }

      const newDistToNeighbor = cur.cost.g + Node.distance(cur, neighbor);
      if(minHeap.indexOf(neighbor) < 0 || neighbor.cost.g > newDistToNeighbor){
        neighbor.setCost({
          g: newDistToNeighbor,
          h: Node.distance(neighbor, target)
        });
        neighbor.parent = cur;
        if(minHeap.indexOf(neighbor) < 0){
          minHeap.push(neighbor);
        }
      }
    });
  }

  if(cur.id !== target.id){return [];}
  var final_path = [];
  while(cur){
    final_path.push(cur);
    cur = cur.parent;
  }
  return final_path;
}

function getNeighbors(node){
  if(node.neighbors){
    return node.neighbors;
  }

  var neighbors = [];
  const pos = pointToCoord({x: node.x, y: node.y});
  const direcs = [-1, 0, 1];
  direcs.forEach(dx => {
    direcs.forEach(dy => {
      if(dx == 0 && dy == 0){return;}
      // if(Math.abs(dx) == Math.abs(dy)){return;}
      const testX = pos.x + dx;
      const testY = pos.y + dy;

      if(testX >= 0 &&
         testX < nodeGrid.length &&
         testY >= 0 &&
         testY < nodeGrid[0].length){
           neighbors.push(nodeGrid[testX][testY]);
         }
    });
  });

  node.neighbors = neighbors;
  return neighbors;
}

// Returns a random int
// exclusive of max
function randomInt(max){
  return Math.floor(Math.random()*max);
}

function pointToCoord(point){
  return {
    x: Math.floor(point.x/gridSize),
    y: Math.floor(point.y/gridSize)
  }
}
