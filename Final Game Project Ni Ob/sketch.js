/*

- Copy your game project code into this file
- for the p5.Sound library look here https://p5js.org/reference/#/libraries/p5.sound
- for finding cool sounds perhaps look here
https://freesound.org/


*/

var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;

var trees_x;
var collectables;
var clouds;
var mountains;
var canyons_x;
var r_collectable;

var game_score;
var flagpole;
var lives;

var enemies;

var platforms;

var jumpSound;
var phendranaSound;

var snowflakes = [];

function preload()
{
    soundFormats('mp3','wav');
    
    //load your sounds here
    jumpSound = loadSound('assets/jump.wav');
    jumpSound.setVolume(0.1);
    phendranaSound = loadSound('assets/phendrana.mp3');
}


function setup()
{    
    createCanvas(1024, 576);

        
    phendranaSound.loop();
    phendranaSound.setVolume(0.07);
    
    for(var i = 0; i < 300; i++)
    {
        snowflakes.push(new Snow());
    }


    lives = 3;
    startGame();

}

function startGame()
{
	floorPos_y = height * 3/4;
    gameChar_x = width/2;
	gameChar_y = floorPos_y;
    

	scrollPos = 0;

    

	// Variable to store the real position of the gameChar in the game
	// world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;

        trees_x = [375, 700, 1000, 1700];
    
        collectables = [
        {x_pos: 700, y_pos: floorPos_y, size: 50},
        {x_pos: 1350, y_pos: floorPos_y - 170, size: 50},
        {x_pos: 1500, y_pos: floorPos_y, size: 50}
    ];
        clouds = [
        {x_pos: 1200, y_pos: 100}, 
        {x_pos: 1700, y_pos: 270}, 
        {x_pos: 750, y_pos: 160}
    ];
        mountains = [
        {x_pos: -310, floorPos_y},
        {x_pos: 500, floorPos_y},
        {x_pos: 1200, floorPos_y}
    ];
        canyons = [
        {x_pos: 100, width: 50},
        {x_pos: 440, width: 100},
        {x_pos: 810, width: 300}
    ];
    
    platforms = [];
    
    platforms.push(createPlatforms(810, floorPos_y - 50, 150));
    platforms.push(createPlatforms(1200, floorPos_y - 50, 100));
    platforms.push(createPlatforms(1250, floorPos_y - 100, 100));
    platforms.push(createPlatforms(1300, floorPos_y - 150, 100));


    
    game_score =  0;
    
    flagpole= {isReached : false, x_pos : 2000};
    
    enemies = [];
    enemies.push(new Enemy(100, floorPos_y - 10, 100));
    enemies.push(new Enemy(1000, floorPos_y - 10, 100));
    enemies.push(new Enemy(1500, floorPos_y - 10, 100));
    
}

function draw()
{
	background(153, 204, 255); // fill the sky blue


	noStroke();
	fill(204,255,255);
	rect(0, floorPos_y, width, height/4); // draw some green ground
    
    for(var i = 0; i < snowflakes.length; i++)
    {
        snowflakes[i].display();
        snowflakes[i].fall();
    }
    
    
    //score
    fill(0);
    noStroke();
    textSize(30);
    text("Score: " + game_score, 20, 30);
    
    //lives
    fill(0);
    noStroke();
    textSize(30);
    text("Lives: " + lives, 200, 30);
    
    
    
    push();
    translate(scrollPos, 0);

    drawClouds();
    drawMountains();
    drawTrees();
    
    for(var i = 0; i < platforms.length; i++)
        {
            platforms[i].draw();
        }

	// Draw canyons.
    for(var i = 0; i < canyons.length; i++)
        {
            drawCanyon(canyons[i]);
            checkCanyon(canyons[i]);
        }
	// Draw collectable items.
    for(var i = 0; i < collectables.length; i++)
        {
            if(collectables[i].isFound != true)
                {
                    drawCollectable(collectables[i]);
                    checkCollectable(collectables[i]);
                }
        }
    
    renderFlagpole();
    
    for(var i = 0; i < enemies.length; i++)
        {
            enemies[i].draw();
            
            var isContact = enemies[i].checkContact(gameChar_world_x, gameChar_y)
            
            if(isContact)
                {
                    if(lives > 0)
                    {
                        startGame();
                        break;
                    }
                }
        }
    
        pop();

	// Draw game character.
	
	drawGameChar();
    
    //victory message
    if(flagpole.isReached == true)
        {
            fill(0);
            noStroke();
            textSize(50);
            text("Level Complete. Press the h key to continue", 50, 200);
        }

    if(checkPlayerDie() == true)
        {
            lives -= 1;
                if(lives > 0)
                    {
                        startGame();
                    }
                else
                    {
                        fill(0);
                        noStroke();
                        textSize(50);
                        text("Game over. Press the g key to continue", 50, 200);
                        return;
                    }
    
        }
    if(gameChar_y > height)
        {
            if(lives > 0) startGame();
        }

	// Logic to make the game character move or the background scroll.
	if(isLeft)
	{
		if(gameChar_x > width * 0.2)
		{
			gameChar_x -= 5;
		}
		else
		{
			scrollPos += 5;
		}
	}

	if(isRight)
	{
		if(gameChar_x < width * 0.8)
		{
			gameChar_x  += 5;
		}
		else
		{
			scrollPos -= 5; // negative for moving against the background
		}
	}

	// Logic to make the game character rise and fall.
    if(gameChar_y < floorPos_y)
        {
            var isContact = false;
            for(var i = 0; i < platforms.length; i++)
                {
                    if(platforms[i].checkContact(gameChar_world_x, gameChar_y) == true)
                        {
                            isContact = true;
                            break;
                        }
                }
            if(isContact == false)
                {
                    gameChar_y += 5;
                    isFalling = true;
                }
        }
    else
        {
            isFalling = false;
        }
    if(isPlummeting)
        {
            gameChar_y += 5;
        }
        
    if(flagpole.isReached == false)
        {
            checkFlagpole();
        }
    


    

	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;
}


// ---------------------
// Key control functions
// ---------------------

function keyPressed()   
{    
    if(keyCode == 37 || key == "A")
        {
            console.log("left arrow");
            isLeft = true;
        }
    if(keyCode == 39 || key == "D")
        {
            console.log("right arrow")
            isRight = true;
        }
    if(keyCode == 32 && gameChar_y <= floorPos_y)
        {
            console.log("space-bar press");
            gameChar_y = floorPos_y - 150;
            jumpSound.play();
        }

    if(lives <= 0 && key == 'g')
        {
            startGame();
        }
    if(key == "h" && flagpole.isReached == true)
        {
            startGame();
        }
}

function keyReleased()
{   
    if(keyCode == 37 || key == "A")
        {
            console.log("left arrow");
            isLeft = false;
        }
    else if(keyCode == 39 || key == "D")
        {
            console.log("right arrow")
            isRight = false;
        }
    if(keyCode == 32 && gameChar_y >= floorPos_y)
        {
            console.log("space-bar release");
            isFalling = false;
        }
}



// ------------------------------
// Game character render function
// ------------------------------

// Function to draw the game character.

function drawGameChar()
{
	stroke(0);
	//the game character
	if(isLeft && isFalling)
	{
        fill(220,20,60);
        ellipse(gameChar_x, gameChar_y - 60, 25); 
        //visor
        fill(0,230,0)
        rect(gameChar_x - 7, gameChar_y - 67, 14, 7);
        rect(gameChar_x - 2.5, gameChar_y - 63, 5, 7);
        //body
        fill(255, 165, 0);
        rect(gameChar_x - 8, gameChar_y - 47, 15, 41);
        // leftshoe
        fill(255,200,0);
        triangle(gameChar_x - 15, gameChar_y + 3, gameChar_x - 4, gameChar_y - 7, gameChar_x - 4, gameChar_y + 3); 
        //right shoe
        fill(255,200,0);
        triangle(gameChar_x - 3, gameChar_y + 3, gameChar_x + 7, gameChar_y - 7, gameChar_x + 7, gameChar_y + 3); 
        //right arm
        fill(255, 165, 0);
        strokeWeight(1)
        stroke(10)
        rect(gameChar_x - 4, gameChar_y - 47, 5, 25);
        ellipse(gameChar_x, gameChar_y - 45, 13)
	}
	else if(isRight && isFalling)
	{
        fill(220,20,60);
        ellipse(gameChar_x, gameChar_y - 60, 25); 
        //visor
        fill(0,230,0)
        rect(gameChar_x - 7, gameChar_y - 67, 14, 7);
        rect(gameChar_x - 2.5, gameChar_y - 63, 5, 7);
        //body
        fill(255, 165, 0);
        rect(gameChar_x - 8, gameChar_y - 47, 15, 41);
        // leftshoe
        fill(255,200,0);
        triangle(gameChar_x - 8, gameChar_y + 3, gameChar_x - 8, gameChar_y - 7, gameChar_x + 2, gameChar_y + 3); 
        //right shoe
        fill(255,200,0);
        triangle(gameChar_x + 14, gameChar_y + 3, gameChar_x + 4, gameChar_y - 7, gameChar_x + 4, gameChar_y + 3); 
        //right arm
        fill(255, 165, 0);
        strokeWeight(1)
        stroke(10)
        rect(gameChar_x - 2, gameChar_y - 47, 5, 15);
        ellipse(gameChar_x, gameChar_y - 45, 13)
        //samus gun
        fill(0, 204, 0);
        rect(gameChar_x - 3, gameChar_y - 32, 7, 15)
	}
	else if(isLeft)
	{
        //face
        fill(220,20,60);
        ellipse(gameChar_x, gameChar_y - 60, 25); 
        //visor
        fill(0,230,0)
        rect(gameChar_x - 7, gameChar_y - 67, 14, 7);
        rect(gameChar_x - 2.5, gameChar_y - 63, 5, 7);
        //body
        fill(255, 165, 0);
        rect(gameChar_x - 8, gameChar_y - 47, 15, 41);
        // leftshoe
        fill(255,200,0);
        triangle(gameChar_x - 15, gameChar_y + 3, gameChar_x - 4, gameChar_y - 7, gameChar_x - 4, gameChar_y + 3); 
        //right shoe
        fill(255,200,0);
        triangle(gameChar_x - 3, gameChar_y + 3, gameChar_x + 7, gameChar_y - 7, gameChar_x + 7, gameChar_y + 3); 
        //right arm
        fill(255, 165, 0);
        strokeWeight(1)
        stroke(10)
        rect(gameChar_x - 4, gameChar_y - 47, 5, 25);
        ellipse(gameChar_x, gameChar_y - 45, 13)
	}
	else if(isRight)
	{
        fill(220,20,60);
        ellipse(gameChar_x, gameChar_y - 60, 25); 
        //visor
        fill(0,230,0)
        rect(gameChar_x - 7, gameChar_y - 67, 14, 7);
        rect(gameChar_x - 2.5, gameChar_y - 63, 5, 7);
        //body
        fill(255, 165, 0);
        rect(gameChar_x - 8, gameChar_y - 47, 15, 41);
        // leftshoe
        fill(255,200,0);
        triangle(gameChar_x - 8, gameChar_y + 3, gameChar_x - 8, gameChar_y - 7, gameChar_x + 2, gameChar_y + 3); 
        //right shoe
        fill(255,200,0);
        triangle(gameChar_x + 14, gameChar_y + 3, gameChar_x + 4, gameChar_y - 7, gameChar_x + 4, gameChar_y + 3); 
        //right arm
        fill(255, 165, 0);
        strokeWeight(1)
        stroke(10)
        rect(gameChar_x - 2, gameChar_y - 47, 5, 15);
        ellipse(gameChar_x, gameChar_y - 45, 13)
        //samus gun
        fill(0, 204, 0);
        rect(gameChar_x - 3, gameChar_y - 32, 7, 15)
	}
	else if(isFalling || isPlummeting)
	{
        //face
        fill(220,20,60);
        ellipse(gameChar_x, gameChar_y - 60, 25); 
        //visor
        fill(0,230,0)
        rect(gameChar_x - 7, gameChar_y - 67, 14, 7);
        rect(gameChar_x - 2.5, gameChar_y - 63, 5, 7);
        //body
        fill(255, 165, 0);
        rect(gameChar_x - 10.5, gameChar_y - 47, 20, 41);
        // leftshoe
        fill(255,200,0);
        rect(gameChar_x - 15, gameChar_y- 6, 10, 10);
        //right shoe
        fill(255,200,0);
        rect(gameChar_x + 5, gameChar_y- 6, 10, 10);
        //left arm
        fill(255, 165, 0);
        rect(gameChar_x - 16, gameChar_y - 47, 5, 15);
        ellipse(gameChar_x - 12, gameChar_y - 45, 13)
        //samus gun
        fill(0,204,0);
        rect(gameChar_x - 17, gameChar_y - 32, 7, 15);
        //right arm
        fill(255, 165, 0);
        rect(gameChar_x + 10, gameChar_y - 47, 5, 25);
        ellipse(gameChar_x + 12, gameChar_y - 45, 13)
	}
	else
	{
        //face
        fill(220,20,60);
        ellipse(gameChar_x, gameChar_y - 60, 25); 
        //visor
        fill(0,230,0)
        rect(gameChar_x - 7, gameChar_y - 67, 14, 7);
        rect(gameChar_x - 2.5, gameChar_y - 63, 5, 7);
        //body
        fill(255, 165, 0);
        rect(gameChar_x - 10.5, gameChar_y - 47, 20, 41);
        // leftshoe
        fill(255,200,0);
        rect(gameChar_x - 15, gameChar_y- 6, 10, 10);
        //right shoe
        fill(255,200,0);
        rect(gameChar_x + 5, gameChar_y- 6, 10, 10);
        //left arm
        fill(255, 165, 0);
        rect(gameChar_x - 16, gameChar_y - 47, 5, 15);
        ellipse(gameChar_x - 12, gameChar_y - 45, 13);
        //samus gun
        fill(0,204,0);
        rect(gameChar_x - 17, gameChar_y - 32, 7, 15);
        //right arm
        fill(255, 165, 0);
        rect(gameChar_x + 10, gameChar_y - 47, 5, 25);
        ellipse(gameChar_x + 12, gameChar_y - 45, 13);
	}
}

// ---------------------------
// Background render functions
// ---------------------------

// Function to draw cloud objects.
function drawClouds()
{
    for(var i = 0; i < clouds.length; i++)
        {
            fill(255)
            ellipse(clouds[i].x_pos, clouds[i].y_pos, 200, 100);
            ellipse(clouds[i].x_pos - 80, clouds[i].y_pos - 40, 100, 50);
            ellipse(clouds[i].x_pos + 100, clouds[i].y_pos + 20, 100, 50);
        }
}

// Function to draw mountains objects.
function drawMountains()
{
        for(var i = 0; i < mountains.length; i++)
    {
        fill(153, 102, 0)
        triangle(mountains[i].x_pos, mountains[i].floorPos_y, mountains[i].x_pos+ 50*2, mountains[i].floorPos_y, mountains[i].x_pos + 25*2, mountains[i].floorPos_y - 41*2)
        fill(140, 140, 140)
        triangle(mountains[i].x_pos + 90*2, mountains[i].floorPos_y, mountains[i].x_pos + 165*2, mountains[i].floorPos_y, mountains[i].x_pos + 127.5*2, mountains[i].floorPos_y - 76*2)
        fill(128, 128, 128)
        triangle(mountains[i].x_pos + 150*2, mountains[i].floorPos_y, mountains[i].x_pos + 165*2, mountains[i].floorPos_y, mountains[i].x_pos + 127.5*2, mountains[i].floorPos_y - 76*2)
        fill(160, 160, 160)
        triangle(mountains[i].x_pos + 15*2, mountains[i].floorPos_y, mountains[i].x_pos + 135*2, mountains[i].floorPos_y, mountains[i].x_pos + 75*2, mountains[i].floorPos_y - 106*2)
        fill(128, 128, 128)
        triangle(mountains[i].x_pos + 107.5*2, mountains[i].floorPos_y, mountains[i].x_pos + 135*2, mountains[i].floorPos_y, mountains[i].x_pos + 75*2, mountains[i].floorPos_y - 106*2)
    }
}

// Function to draw trees objects.
function drawTrees()
{
    for(var i = 0; i < trees_x.length; i++)
    {
        //tree trunk
        fill(102, 51, 0);
        rect(trees_x[i], floorPos_y - 144, 40, 150);
        triangle(trees_x[i] - 20, floorPos_y - 144 + 150, trees_x[i] +60, floorPos_y - 144 + 150, trees_x[i] + 20, floorPos_y - 144 + 118);
        //1st branches
        fill(0, 100, 0);
        triangle(trees_x[i] - 60, floorPos_y - 144 + 50, trees_x[i] + 20, floorPos_y - 144 - 50, trees_x[i] + 100, floorPos_y - 144 + 50);
        fill(0, 60, 0);
        triangle(trees_x[i] + 60, floorPos_y - 144 + 50, trees_x[i] + 20, floorPos_y - 144 - 50, trees_x[i] + 100, floorPos_y - 144 + 50);
        //2nd branch
        fill(0, 100, 0);
        triangle(trees_x[i] - 60, floorPos_y - 144 + 25, trees_x[i] + 20, floorPos_y - 144 - 75, trees_x[i] + 100, floorPos_y - 144 + 25);
        fill(0, 60, 0);
        triangle(trees_x[i] + 60, floorPos_y - 144 + 25, trees_x[i] + 20, floorPos_y - 144 - 75, trees_x[i] + 100, floorPos_y - 144 + 25);
        //3rd branch
        fill(0, 100, 0);
        triangle(trees_x[i] - 60, floorPos_y - 144, trees_x[i] + 20, floorPos_y - 144 - 100, trees_x[i] + 100, floorPos_y - 144);
        fill(0, 60, 0);
        triangle(trees_x[i] + 60, floorPos_y - 144, trees_x[i] + 20, floorPos_y - 144 - 100, trees_x[i] + 100, floorPos_y - 144);
    }
    
}


// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Function to draw canyon objects.

function drawCanyon(t_canyon)
{
    {
    fill(0, 0, 153);
    rect(t_canyon.x_pos + 2, floorPos_y, t_canyon.width/2, floorPos_y/3);    
    }
}

// Function to check character is over a canyon.

function checkCanyon(t_canyon)
{
    if((gameChar_world_x < t_canyon.x_pos + 40) && (gameChar_world_x > t_canyon.x_pos) && gameChar_y >= floorPos_y - 1)
        //the last && is in order for the character to land after the canyon
        {
            isPlummeting = true;
        }        
}

// Function to draw collectable objects.

function drawCollectable(t_collectable)
{
    stroke(0, 0, 255)
    fill(0,220,0);
    ellipse(t_collectable.x_pos, t_collectable.y_pos + 5, 60, 45);
    fill(206, 7, 7);
    ellipse(t_collectable.x_pos - 10, t_collectable.y_pos + 5, 15);
    ellipse(t_collectable.x_pos, t_collectable.y_pos, 15);
    ellipse(t_collectable.x_pos + 10, t_collectable.y_pos + 5, 15);
}

// Function to check character has collected an item.

function checkCollectable(t_collectable)
{
    
    if(dist(gameChar_world_x, gameChar_y, t_collectable.x_pos, t_collectable.y_pos) < t_collectable.size)
        {
            t_collectable.isFound = true;
            game_score += 1;
        }
}


function renderFlagpole()
{
    push();
    strokeWeight(5);
    stroke(0);
    line(flagpole.x_pos, floorPos_y, flagpole.x_pos, floorPos_y - 300);
    fill(255, 0, 0);
    noStroke();
    
    if(flagpole.isReached)
        {
            rect(flagpole.x_pos, floorPos_y - 300, 50, 50);
        }
    else
        {
            rect(flagpole.x_pos, floorPos_y - 50, 50, 50);
        }
    
    pop();
}

function checkFlagpole()
{
    var d = abs(gameChar_world_x - flagpole.x_pos);
    
    
    if(d < 15)
        {
            flagpole.isReached = true;
        }
    console.log(d);
}

function checkPlayerDie()
{
    if(gameChar_y > height)
        {
            return true;
        }

}

function Snow()
{
    this.x = random(width);
    this.y = random(-500, - 50);
    this.size = random(2, 9);
    this.speed = map(this.size, 1, 10, 1, 20);
    
    this.fall = function ()
    {
        this.y = this.y + this.speed;;
        var grav = map(this.size, 1, 10, 0, 0.02);
        this.speed = this.speed + grav;
        
        if(this.y > height)
        {
            this.y = random(-200, -100);
            this.speed = map(this.size, 1, 10, 3, 10);
        }
    }
    this.display = function()
    {
       fill(204,255,255);
        noStroke();
        triangle(this.x - this.size/2, this.y, this.x, this.y-(this.size*2), this.x + this.size/2, this.y);
        ellipse(this.x, this.y, this.size, this.size*1.5);
    }

}

function createPlatforms(x, y, length)
{
    var p = 
    {
        x: x,
        y: y,
        length: length,
        draw: function()
        {
            fill(204,255,255);
            rect(this.x, this.y, this.length, 20, 50);
        },
        checkContact: function(gc_x, gc_y)
        //gc_x and gc_y are the game character numbers lcoal to this var.
        {
            if(gc_x > this.x && gc_x < this.x + this.length)
            {
                var d = this.y - gc_y;
                if(d >= 0 && d < 5)
                    {
                        return true;
                    }
            }
            
            return false;
        }
    }
    
    return p;
}

function Enemy(x, y, range)
{
    this.x = x;
    this.y = y;
    this.range = range;
    
    this.currentX = x;
    this.inc = 1;
    //inc is short for increment
    
    this.update = function()
    {
        this.currentX += this.inc;
        
        if(this.currentX >= this.x + this.range)
            //if the enemy is outside the range, well make him go back
            {
                this.inc = -1;
            }
        else if(this.currentX < this.x)
            {
                this.inc = 1;
            }
    }
    
    this.draw = function()
    {
        this.update();
        stroke(0, 0, 255)
        fill(224, 255, 255);
        triangle(this.currentX, this.y, this.currentX - 20, this.y, this.currentX - 30, this.y - 20);
        triangle(this.currentX, this.y, this.currentX + 20, this.y, this.currentX + 30, this.y - 20);
        triangle(this.currentX - 10, this.y, this.currentX + 10, this.y, this.currentX, this.y - 30);
        fill(0, 255, 255);
        ellipse(this.currentX, this.y, 40, 30);
        fill(224, 255, 255);
        ellipse(this.currentX - 10, this.y - 5, 10, 10);
        ellipse(this.currentX + 10, this.y - 5, 10, 10);
    }
    
    this.checkContact = function(gc_x, gc_y)
    {
        var d = dist(gc_x, gc_y, this.currentX, this.y)
        if(d < 20)
            {
                return true;
            }
        return false;
    }
}