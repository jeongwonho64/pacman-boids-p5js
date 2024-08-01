class Maze {
    constructor(density) {
        this.rows = floor(height / density);
        this.cols = floor(width / density);
        this.density = density;
        this.walls = [];
        this.wallvertices = [];
        this.genwalls();
    }
    genwalls() {
        let grid = new Map();
        let stack = [];
        for (let j = 0; j < this.rows; j++) {
            for (let i = 0; i < this.cols; i++) {
                let cell = new Cell(i, j, this.density, this);
                grid.set(i + "_" + j, cell);
            }
        }
        this.grid = grid;
        let current = grid.get("0_0");

        current.visited = true;
        current.highlight();
        let next = current.checkNeighbors();
        if (next) {
            next.visited = true;
            stack.push(current);
            removeWalls(current, next);
            current = next;
        } else if (stack.length > 0) {
            current = stack.pop();
        }
        while (stack.length > 0) {
            current.visited = true;
            current.highlight();
            let next = current.checkNeighbors();
            if (next) {
                next.visited = true;
                stack.push(current);
                removeWalls(current, next);
                current = next;
            } else if (stack.length > 0) {
                current = stack.pop();
            }
        }
        for (let [id, cell] of grid) {
            cell.show();
        }
        this.wallvertices = grid; 
        for (let [id, cell] of grid) {
            this.walls.push(new Wall(cell.v1.x, cell.v1.y, cell.v2.x, cell.v2.y));
        }

        for (let wall of this.walls) {
            wall.sprite.visible = false;
        }
        for (let i = 0; i < random(2, 4); i++) {
            this.walls.splice(floor(random(0, this.walls.length - 1)), 1);
        }
    }
}

class Wall {
    constructor(x1, y1, x2, y2) {
      this.a = createVector(x1, y1); 
      this.b = createVector(x2, y2); 
      this.sprite = new Sprite((x1 + x2) / 2, (y1 + y2) / 2);
      if (x1 == x2) {
        //vertical
        this.sprite.w = 1;
        this.sprite.h = abs(y2 - y1);
      } else {
        this.sprite.w = abs(x2 - x1);
        this.sprite.h = 1;
      }
      this.sprite.collider = "static";
    }
  
    show() {
      line(this.a.x, this.a.y, this.b.x, this.b.y);
    }
  }
  
  class Cell {
    constructor(i, j, w, p) {
      this.i = i;
      this.j = j;
      this.walls = [true, true, true, true];
      this.visited = false;
      this.v1 = createVector(0, 0);
      this.v2 = createVector(0, 0);
      this.w = w;
      this.parent = p;
    }
  
    checkNeighbors() {
      let grid = this.parent.grid;
      let i = this.i;
      let j = this.j;
      let neighbors = [];
  
      let top = grid.get(i + "_" + (j - 1));
      let right = grid.get(i + 1 + "_" + j); 
      let bottom = grid.get(i + "_" + (j + 1));
      let left = grid.get(i - 1 + "_" + j);
  
      if (top && !top.visited) {
        neighbors.push(top);
      }
      if (right && !right.visited) {
        neighbors.push(right);
      }
      if (bottom && !bottom.visited) {
        neighbors.push(bottom);
      }
      if (left && !left.visited) {
        neighbors.push(left);
      }
  
      if (neighbors.length > 0) {
        let r = floor(random(0, neighbors.length));
        return neighbors[r];
      } else {
        return undefined;
      }
    }
  
    highlight() {
      let x = this.i * this.w;
      let y = this.j * this.w;
      noStroke();
      fill(0, 255, 0, 100);
      rect(x, y, this.w, this.w);
    }
  
    show() {
      let x = this.i * this.w;
      let y = this.j * this.w;
      let w = this.w;
      stroke(255);
      if (this.walls[0]) {
        line(x, y, x + this.w, y);
        this.v1.x = x;
        this.v1.y = y;
        this.v2.x = x + this.w;
        this.v2.y = y;
      }
      if (this.walls[1]) {
        line(x + w, y, x + w, y + w);
        this.v1.x = x + this.w;
        this.v1.y = y;
        this.v2.x = x + this.w;
        this.v2.y = y + this.w;
      }
      if (this.walls[2]) {
        let w = this.w;
        this.v1.x = x + w;
        this.v1.y = y + w;
        this.v2.x = x;
        this.v2.y = y + w;
        line(x + w, y + w, x, y + w);
      }
      if (this.walls[3]) {
        let w = this.w;
        this.v1.x = x;
        this.v1.y = y + w;
        this.v2.x = x;
        this.v2.y = y;
        line(x, y + w, x, y);
      }
  
      if (this.visited) {
        noStroke();
        fill(255, 0, 255, 100);
        rect(x, y, w, w);
      }
    }
  }