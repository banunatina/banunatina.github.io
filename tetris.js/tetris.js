// global game object
//Notes - Yet to be implemented:
//rotation states for each shape & handling input for rotation
//debug off-board detection - will glitch
//if long shapes are moved off the board

var Tetris = (function(global) {
    //create Cells class 
    function Cell(info) {
        //storing cell coordinates
        //column
        this.x = info.x;
        //row
        this.y = info.y;
        //determines if filled or not
        this.filled = false;
        //determines if part of stacked row - for collision
        this.isStacked = false;
        //html cell Id for later access - '\\3 ' to escape numbers
       //escaping double-digits to ensure selector validity
       if(this.y < 10){
            this.cellId = '.\\3' + this.y + '  #\\3' + this.x + ' ';
            }else{
            this.cellId = '.\\3' + this.y.toString().charAt(0) + ' \\3' + this.y.toString().charAt(1) + '  #\\3' + this.x + ' ';
            }
    }

    //Grid constructor 
    function Grid(rowSize, colSize){
        this.rowSize = rowSize;
        this.colSize = colSize;
        this.grid = [];
        //potentially unneeded, come back to this
        this.cells = [];
        //

        this.stacked = [];
        this.drawGrid();
         this.update();
    }

    //method to initialize grid
    Grid.prototype.drawGrid = function() {
            for (var row = 0; row < this.rowSize; row++) {
                //add new row to grid array in obj
                this.grid[row] = [];

                //creating row in DOM
                var newRow = document.createElement('tr');
                newRow.innerHTML = '    ';
                //assign className (y-axis)
                newRow.className = row;
                document.getElementById('board').appendChild(newRow);
                //populate rows with cells
                for (var col = 0; col < this.colSize; col++) {
                    //add cell object to grid row in obj
                    var newCell = new Cell({x: col, y: row});
                    this.grid[row].push(newCell);

                    //potentially unneeded, come back to this
                    this.cells.push(newCell);
                    //

                    //create cell in DOM
                    var cell = document.createElement('td');
                    cell.innerHTML = '';
                    //assign id (x-axis)
                    cell.id = col;
                    newRow.appendChild(cell);
                }
            }
        };

    //array holding Shapes subclasses for random generation 
    Grid.prototype.shapes = [lShape, oShape, iShape, zShape];

    //function to randomly generate a shape
    Grid.prototype.generateShape = function(){
        //selecting randomly from shapes array
        var rand = this.shapes[Math.floor(Math.random() * this.shapes.length)];
        return new rand;
    }

    //function to fill cells or unfill cells
    Grid.prototype.toggleFill = function(cell, action){
        var color;
        if(action === 'fill'){
            color = '#414934';
        }else if(action === 'empty'){
            color = '';
        }else {
            color = 'red';
            // console.log('invalid action');
        }
        //store to use in querySelector
        var grabbedCell = document.querySelector(cell.cellId);
        //if cell exists on grid

        if (grabbedCell != null){
            //coloring cells
            grabbedCell.setAttribute('bgcolor', color);
        }
    }  

    Grid.prototype.addToStack = function(shape){
        //storing references to instantiated grid, 
        //shape coordinates, and gridCell variable
        var self = this,
        shapeCells = shape.coords,
        gridCell;

        //toggling Cell.stacked to true and pushing to grid.stacked array
        shapeCells.forEach(function(cell){
            gridCell = self.grid[cell.y][cell.x];
            if(!gridCell.isStacked){
                gridCell.isStacked = true;
                console.log('adding ' + gridCell + ' to stack')
                self.stacked.push(gridCell);
            }else {
                console.log('cell is already stacked');
            }
        });

        this.stacked.forEach(function(cell){
            console.log(cell);
            gridCell = self.grid[cell.y][cell.x];
            if(!gridCell.filled){
                gridCell.filled = true;
            }
        })
    }

    //update gameGrid with filled/unfilledCells
    Grid.prototype.update = function(){

        var self = this,
        gridCell;
        for (var row in self['grid']){

            for(var cell in self['grid'][row]){
                gridCell = self['grid'][row][cell];

                if (gridCell.filled){
                    self.toggleFill(gridCell, 'fill');
                }else if(!gridCell.filled){
                    self.toggleFill(gridCell, 'empty');
                }
            }
        }
        //continuously updates??
        // setTimeout(this.update, 1000);
    };

    //reset function generates a new playerShape
    Grid.prototype.reset = function(){
        this.addToStack(playerShape);
        playerShape = tetris.generateShape();
        tetris.update();
    }
    //create Shapes superclass
    function Shape(){
        //initial spawn location is always the same
        this.center = {x: 5, y: 0};
        //default rotationState
        this.rotationState = 0;
        //initializing falling movement
        intervalID = setInterval(this.fall, 250);
    }

    //toggles .filled property of gridCells
    Shape.prototype.toggleCells = function(action){
        var shapeCells = this.coords,
        gridCell;

        shapeCells.forEach(function(cell){
            gridCell = tetris.grid[cell.y][cell.x];
            if(action === 'off'){
                gridCell.filled = false;
                // console.log('toggled ' + gridCell + ' to false');
            }else if(action === 'on'){
                gridCell.filled = true;
                // console.log('toggled ' + gridCell + ' to true');
            }
        });
    }

    //moves shapes on player input
    //BUG: collision detection depending on center 
    //means some arent working
    Shape.prototype.move = function(direction){
        var shapeCells = this.coords,
        gridCell
        offboard = false;
        //if left
        if(direction === 'left' && shapeCells[2].x > 0){
        //toggleCells off
            this.toggleCells('off');
            shapeCells.forEach(function(cell){
                // gridCell = tetris.grid[cell.y][cell.x];
                    cell.x--;

            });
            tetris.update();
            //shift direction right


        }if(direction === 'right' && shapeCells[1].x < tetris.colSize - 1){
        //toggleCells off
            this.toggleCells('off');
            shapeCells.forEach(function(cell){
                    cell.x++;
                });

            tetris.update();
            }
            //toggleBack
            this.toggleCells('on');
            tetris.update();
        }

    //implementing falling
    var intervalID;
    Shape.prototype.fall = function(){
        //erasing shape
        var shapeCells = playerShape.coords,
        gridCell,
        offboard = false,
        collision = false;

        //erase
        playerShape.toggleCells('off');
        //each cell in shape
        shapeCells.forEach(function(cell){
            if(cell != null){

                // console.log(gridCell);
                //move one box down
                cell.y++;
                if(cell.y >= tetris.rowSize){
                    //toggle off-board check
                    offboard = true;
                    console.log('Shape reached the bottom');
                    //stop falling
                    window.clearInterval(intervalID);
                }else if (tetris.grid[cell.y][cell.x].isStacked){
                        collision = true;
                        console.log('Shape touched another shape');
                    //stop falling
                    window.clearInterval(intervalID);
                    }
            }
        });

        //set piece back on board
            if (collision){
                shapeCells.forEach(function(cell){
                cell.y--;

            });            
            
                //begin reset
                tetris.reset();
            }

            if (offboard){
                shapeCells.forEach(function(cell){
                cell.y--;
            });
                //begin reset
                tetris.reset();
            }

        playerShape.toggleCells('on');
        tetris.update();
    }


    //Defining shape subclasses
    //O Shape
    function oShape() {
        //creates oShape as a new Shape obj
        Shape.call(this); 

        //holding on to this.center for inner obj reference
        var center = this.center;
        this.type = 'o';
        this.coords = [center, 
            {x: center.x, y: center.y + 1},
            {x: center.x - 1, y: center.y + 1},
            {x: center.x - 1, y: center.y}];
        this.toggleCells('on');
        tetris.update();
    };
    //setting prototypal delegation to Shape superclass
    oShape.prototype = Object.create(Shape.prototype);
    oShape.prototype.constructor = oShape;

    //I Shape
    function iShape() {
        //creates oShape as a new Shape obj
        Shape.call(this); 

        //holding on to this.center for inner obj reference
        var center = this.center;
        this.type = 'i';
        this.coords = [center, 
            {x: center.x + 1, y: center.y},
            {x: center.x - 2, y: center.y},
            {x: center.x - 1, y: center.y}];

        // this.fillCells(this.coords, '#414934');
    };    
    //setting prototypal delegation to Shape superclass
    iShape.prototype = Object.create(Shape.prototype);
    iShape.prototype.constructor = iShape;


    //L Shape
    function lShape() {
        //creates oShape as a new Shape obj
        Shape.call(this); 

        //holding on to this.center for inner obj reference
        var center = this.center;
        this.type = 'l';
        this.coords = [center, 
            {x: center.x + 1, y: center.y},
            {x: center.x - 1, y: center.y},
            {x: center.x - 1, y: center.y + 1}];

        // this.fillCells(this.coords, '#414934');
    };    
    //setting prototypal delegation to Shape superclass
    lShape.prototype = Object.create(Shape.prototype);
    lShape.prototype.constructor = lShape;


    //Z Shape
    function zShape() {
        //creates oShape as a new Shape obj
        Shape.call(this); 
        this.type = 'z';
        //holding on to this.center for inner obj reference
        var center = this.center;

        this.coords = [center, 
            {x: center.x + 1, y: center.y},
            {x: center.x - 1, y: center.y + 1},
            {x: center.x, y: center.y + 1}];

        // this.fillCells(this.coords, '#414934');
    };    
    //setting prototypal delegation to Shape superclass
    zShape.prototype = Object.create(Shape.prototype);
    zShape.prototype.constructor = zShape;

 //drawing actual board
    var tetris = new Grid(24, 10);
    // console.table(tetris.grid);
     var playerShape = tetris.generateShape();
    // console.table(tetris.cells);
    // playerShape.fallSpeed(200);

    document.addEventListener('keydown', function(e){
        if(e.keyCode === 39){
         playerShape.move('right');   
        }else if(e.keyCode === 37){
         playerShape.move('left');
        }
});

//set global parameter to global
})(this);
