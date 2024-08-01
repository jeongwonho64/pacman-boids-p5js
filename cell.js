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
