
FPS = 60;
WIDTH = 640
HEIGHT = 480

TARGET_SCORE = 5

GAME_STATE_MAIN_MENU = 0
GAME_STATE_PLAY = 1

PLAY_STATE_SERVE = 0
PLAY_STATE_BALL_OUT = 1
PLAY_STATE_BALL_PLAY = 2
PLAY_STATE_GAME_END = 3

SERVE_TIME = 3
END_TIME = 3

BALL_SPEED = 180
PADDLE_SPEED = 240 + 64
REACTION_TIME = 0.15
X = 0
Y = 1

LEFT = 0
RIGHT = 1
BOTTOM = 2
TOP = 3
FRONT = 4
BACK = 5

DEBUG_FORCE_DIRECTION = false
DEBUG_RIGHT_BOUNCE = false

BUTTON_DOWN = 0
BUTTON_RELEASED = 1
BUTTON_UP = 2
BUTTON_PRESSED = 3

PADDLE_AI_CHECK_DIRECTION_CHANGE = 0
PADDLE_AI_WAIT_FOR_DIRECTION_CHANGE = 1
const AudioContext = window.AudioContext || window.webkitAudioContext
var retroFont = new FontFace('Retro', 'url(8-bit.ttf)')

function Rect(x,y, width, height){
    this.x = x
    this.y = y
    this.width = width
    this.height = height

    this.containsPoint = function(point){
        return (point.x >= this.x) && 
            (point.x <= (this.x + this.width)) &&
            (point.y >= this.y) && 
            (point.y <= (this.y + this.height)
        )
    }
    this.intersectsRect = function(rect){
        rect0x = this.x + this.width * 0.5
        rect0y = this.y + this.height * 0.5
    
        rect1x = rect.x + rect.width * 0.5
        rect1y = rect.y + rect.height * 0.5
    
        dx = Math.max(rect0x, rect1x) - Math.min(rect0x, rect1x)
        dy = Math.max(rect0y, rect1y) - Math.min(rect0y, rect1y)
        
        totalWidth = this.width + rect.width
        totalHeight = this.height + rect.height
        return dx <= (totalWidth * 0.5) && 
            dy <= (totalHeight * 0.5)
    }

    this.copy = function(){
        return new Rect(this.x, this.y, this.width, this.height)
    }
}


function Ball(x, y, radius){
    this.x = x
    this.y = y
    this.radius = radius
    this.dirX = 1
    this.dirY = 1

    this.moveInDir = function(d){
        this.x += this.dirX * d
        this.y += this.dirY * d
    }

    this.setRandomPosition = function(){
        random = Math.random()
        side = Math.floor(random * 2) 
        cellX = Math.random();
        cellY = Math.random();
        switch(side){
            case 0:
                this.x = 160 + (128 * cellX)
                break
            case 1:
                this.x = 352 + (128 * cellX)
                break
        }
        this.y = 128 + (224 * cellY)
    }

    this.setRandomDirection = function(){
        launchChoice = Math.floor( Math.random() * 4)
        switch(launchChoice){
            case 0:
                this.dirX = -Math.SQRT2
                this.dirY = Math.SQRT2
                break
            case 1:
                this.dirX = Math.SQRT2
                this.dirY = Math.SQRT2
                break
            case 2:
                this.dirX = Math.SQRT2
                this.dirY = -Math.SQRT2
                break
            case 3:
                this.dirX = -Math.SQRT2
                this.dirY = -Math.SQRT2
                break
        }   
    }

    this.getRect = function(){
        return new Rect(
            this.x - this.radius, this.y - this.radius,
            2 * this.radius, 2 * this.radius
        )
    }
    this.bounceTop = function(sound){
        if(((this.y - this.radius) < 16) && (ball.dirY < 0)){
            y = this.y - this.radius
            d = (y - 16) / this.dirY
            this.moveInDir(d)
            this.dirY *= -1;
            sound.play()

        }

    }

    this.bounceBottom = function(sound){
        if(((this.y + this.radius) > 464) && (this.dirY > 0)){
            y = this.y + this.radius
            d = (y - 464) / this.dirY
            this.moveInDir(d)
            this.dirY *= -1;
            sound.play()

        }
    }

    this.draw = function(ctx){
        ctx.fillStyle = 'white'
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
        ctx.closePath()
        ctx.fill()
    }
}



MENU_BUTTON_NOT_ACTIVATED = 0
MENU_BUTTON_ACTIVATED = 1
MENU_BUTTON_ENDED = 2


function Paddle(x,y, width, height){
    this.x = x
    this.y = y 
    this.width = width 
    this.height = height
    this.ySpeed = 0

    this.getRect = function(){
        return new Rect(
            this.x, this.y, this.width, this.height
        )
    }
    this.setValues = function(x, y, width, height){
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }
}

function MenuButton(rect, text){
    this.rect = rect.copy()
    this.text = text
    this.intensity = 0.75
    this.r = 255
    this.g = 255 
    this.b = 255
    this.state = MENU_BUTTON_NOT_ACTIVATED

    this.update = function(buttonDown, cursor,deltaTime){
        
        if(!this.state == MENU_BUTTON_ACTIVATED){
            if(this.rect.containsPoint(cursor)){
                this.intensity = Math.min(1 , this.intensity + deltaTime * 2)
                if(buttonDown){
                    this.state = MENU_BUTTON_ACTIVATED
                }
            }else{
                this.intensity = Math.max(0.75, this.intensity - deltaTime * 2)
            }
            buttonIntensity = this.intensity
            this.r = buttonIntensity * 255
            this.g = buttonIntensity * 255
            this.b = buttonIntensity * 255
            
        }else{
            this.r = Math.max(0, this.r - 500 * deltaTime)
            this.g = Math.min(255, this.g + 500 * deltaTime)
            this.b = Math.max(0, this.b - 500 * deltaTime)

            if(this.r == 0 && this.g == 255 && this.b == 0){
               this.state = MENU_BUTTON_ENDED
            }         
        }      
    }

    this.reset = function(){
        this.intensity = 0.75
        this.r = 255
        this.g = 255 
        this.b = 255
        this.state = MENU_BUTTON_NOT_ACTIVATED
    }

    this.draw = function(ctx){
        ctx.strokeStyle = 'rgb(' + this.r+','+ 
            this.g + ',' +
            this.b + 
        ')'
        ctx.fillStyle = 'rgb(' + this.r+','+ 
            this.g + ',' +
            this.b + 
        ')'                  
        ctx.font = "32px Retro";
        ctx.strokeRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height)
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.rect.x + this.rect.width * 0.5, this.rect.y + this.rect.height * 0.5, rect.width - 8)
    }
}

function numberToRectList(n){
    numberChars = String(n)
    numberSymbol = []
    for(i = 0; i < numberChars.length; i++){
        numberIcon = []
        switch(numberChars[i]){
        case '0':
            numberIcon.push({x: 0, y: 0, width: 3, height: 1})
            numberIcon.push({x: 0, y: 1, width: 1, height: 3})
            numberIcon.push({x: 2, y: 1, width: 1, height: 3})
            numberIcon.push({x: 0, y: 4, width: 3, height: 1})
            break;

        case '1':
            numberIcon.push({x: 1, y: 0, width: 2, height: 1})
            numberIcon.push({x: 2, y: 1, width: 1, height: 4})
            break;

        case '2':
            numberIcon.push({x: 0, y: 0, width: 3, height: 1})
            numberIcon.push({x: 2, y: 1, width: 1, height: 2})
            numberIcon.push({x: 0, y: 2, width: 2, height: 1})
            numberIcon.push({x: 0, y: 3, width: 1, height: 2})
            numberIcon.push({x: 1, y: 4, width: 2, height: 1})
            break;

        case '3':
            numberIcon.push({x: 0, y: 0, width: 2, height: 1})
            numberIcon.push({x: 1, y: 2, width: 1, height: 1})
            numberIcon.push({x: 0, y: 4, width: 3, height: 1})
            numberIcon.push({x: 2, y: 0, width: 1, height: 5})
            break;

        case '4':
            numberIcon.push({x: 0, y: 0, width: 1, height: 2})
            numberIcon.push({x: 0, y: 2, width: 2, height: 1})
            numberIcon.push({x: 2, y: 0, width: 1, height: 5})
            break;

        case '5':
            numberIcon.push({x: 0, y: 0, width: 3, height: 1})
            numberIcon.push({x: 0, y: 1, width: 1, height: 1})
            numberIcon.push({x: 0, y: 2, width: 3, height: 1})
            numberIcon.push({x: 2, y: 3, width: 1, height: 1})
            numberIcon.push({x: 0, y: 4, width: 3, height: 1})
            break;

        case '6':
            numberIcon.push({x: 0, y: 0, width: 1, height: 5})
            numberIcon.push({x: 1, y: 0, width: 2, height: 1})
            numberIcon.push({x: 1, y: 2, width: 2, height: 1})
            numberIcon.push({x: 2, y: 3, width: 1, height: 1})
            numberIcon.push({x: 1, y: 4, width: 2, height: 1})
            break;

        case '7':
            numberIcon.push({x: 0, y: 0, width: 3, height: 1})
            numberIcon.push({x: 2, y: 1, width: 1, height: 4})
            break;

        case '8':
            numberIcon.push({x: 0, y: 0, width: 3, height: 1})
            numberIcon.push({x: 0, y: 1, width: 1, height: 1})
            numberIcon.push({x: 2, y: 1, width: 1, height: 1})
            numberIcon.push({x: 0, y: 2, width: 3, height: 1})
            numberIcon.push({x: 0, y: 3, width: 1, height: 1})
            numberIcon.push({x: 2, y: 3, width: 1, height: 1})
            numberIcon.push({x: 0, y: 4, width: 3, height: 1})        
            break;

        case '9':
            numberIcon.push({x: 0, y: 0, width: 1, height: 3})
            numberIcon.push({x: 1, y: 0, width: 1, height: 1})
            numberIcon.push({x: 1, y: 2, width: 1, height: 1})
            numberIcon.push({x: 2, y: 0, width: 1, height: 4})
            numberIcon.push({x: 0, y: 4, width: 3, height: 1})
            break;

        }
        for(j = 0; j < numberIcon.length; j++){
            numberIcon[j].x *= 16
            numberIcon[j].x += i * 64
            numberIcon[j].y *= 16
            numberIcon[j].width *= 16
            numberIcon[j].height *= 16
            numberSymbol.push(numberIcon[j])
        }
    }
    return numberSymbol
}

PONG_STATE_MAIN_MENU = 0
PONG_STATE_PLAY = 1

function MainMenu(){
    
    this.isTransitioning = false
    this.transitionTime = 0
    this.playButton = new MenuButton(new Rect(192 -16, 192, 256 + 32, 128), "Play Pong")
}

function Game(){
    this.isPaused = false
    this.state = PLAY_STATE_SERVE
    this.paddle0 = new Paddle(16, 64, 16, 64)
    this.paddle1 = new Paddle(608, 352, 16, 64)
    this.ball = new Ball(128, 64, 8)

    this.paddleAiData ={nextIsUp:false ,reactionTime: 0, targetY: 0, nextTargetFound: false, state: PADDLE_AI_CHECK_DIRECTION_CHANGE}
    this.score0 = {score: 9} 
    this.score1 = {score: 9}
    this.serveTimeRemaining = SERVE_TIME
    this.endTimeRemaining = END_TIME
    this.resetButton = new MenuButton(new Rect(256-16, 320-16, 128 +32, 64),"Reset")
    this.toMainMenuButton = new MenuButton(new Rect(256 -16, 384, 128 + 32, 64), "Main Menu")

    function reset(){
        this.ball.setRandomPosition()
        this.score0.score = 0
        this.score1.score = 0 
        this.state = PLAY_STATE_SERVE
        this.serveTimeRemaining = SERVE_TIME
    }

 
}

function Pong(){
    this.state = PONG_STATE_MAIN_MENU
    this.mainMenu = new MainMenu()
    this.game = new Game()
    this.onPlayPressed = function(){
        this.state = PONG_STATE_PLAY
        this.game.isPaused = false
        this.game.state = PLAY_STATE_SERVE
        this.game.score0 = {score: 0} 
        this.game.score1 = {score: 0}
     
        this.game.paddleAiData.nextTargetFound = false
        this.game.paddleAiData.state = PADDLE_AI_CHECK_DIRECTION_CHANGE
        this.game.paddle0.setValues(16, 64, 16, 64)
        this.game.paddle1.setValues(608, 352, 16, 64)
        this.game.serveTimeRemaining = SERVE_TIME
        this.game.ball.setRandomPosition()
    }
    
}

function init(){
    time = 0;
    deltaTime = 1 / 60
    upPressed = false
    downPressed = false
    mButtonDown = false    
    escButton = {isDown: false, state: BUTTON_UP}
    cursor = {x:0, y: 0}
    
    canvas = document.getElementById('canvas')
    ctx = canvas.getContext('2d')
    ballLoseSound = document.getElementById("ball-lose-sound")
    ballWinSound = document.getElementById("ball-win-sound")
    leftHitSound = document.getElementById("left-hit-sound")
    rightHitSound = document.getElementById("right-hit-sound")
    
   
    document.onkeydown = e =>{
        switch(e.key.toLowerCase()){
            case 'w':
                upPressed = true
                break
            case 's':
                downPressed = true;
                break
            case 'escape':
                escButton.isDown = true
                break
            
        }
    }

    document.onkeyup = e =>{
        switch(e.key.toLowerCase()){
            case 'w':
                upPressed = false
                break
            case 's':
                downPressed = false;
            case 'escape':
                escButton.isDown = false
                break
        }
    }

    document.onmousedown = e =>{
        if(e.button == 0){
            mButtonDown = true
        }
    }
    document.onmouseup = e =>{
        if(e.button == 0){
            mButtonDown = false
        }
    }

    document.onmousemove = e=>{
        rect = canvas.getBoundingClientRect()
        cursor.x = e.offsetX - rect.x
        cursor.y = e.offsetY - rect.y
    }

    pong = new Pong()

    

    function paddleVsWall(paddles){
        for(i = 0; i < paddles.length; i++){
            if(paddles[i].y < 16){
                paddles[i].y = 16;
            }
            if((paddles[i].y + paddles[i].height) > 464){
                paddles[i].y = 400
            }
        }
    }    

    
    function nextButtonState(button){
        switch(button.state){
            case BUTTON_DOWN:
                if(!button.isDown){
                    button.state = BUTTON_RELEASED
                }
                break
            case BUTTON_PRESSED:
                if(button.isDown){
                    button.state = BUTTON_DOWN
                }else{
                    button.state = BUTTON_RELEASED
                }
                break
            case BUTTON_RELEASED:
                if(button.isDown){
                    button.state = BUTTON_PRESSED
                }else{
                    button.state = BUTTON_RELEASED
                }
                break
            case BUTTON_UP:
                if(button.isDown){
                    button.state = BUTTON_PRESSED
                }
                break
        }
    }

    function paddleAi(paddle){ 
        game = pong.game
        ball = pong.game.ball
        ai = game.paddleAiData
        switch(game.state){
            case PLAY_STATE_SERVE:
                if(!ai.nextTargetFound){
                    x = paddle.x;
                    d = (x - ball.x) / Math.SQRT2
                    if(ball.y < 0.33 * HEIGHT ){
                        ai.targetY = Math.random() * HEIGHT * 0.33
                    }else if(ball.y > 0.66 * HEIGHT){
                        ai.targetY = (Math.random() * HEIGHT * 0.33) + HEIGHT * 0.66
                    }else{
                        ai.targetY = Math.random() * HEIGHT
                    }
                    ai.nextTargetFound = true
                }else{
                    if((paddle.y - ai.targetY) < 16){
                        paddle.ySpeed = 0   
                    }
                    else if(ai.targetY > (paddle.y +paddle.height)){
                        paddle.ySpeed = PADDLE_SPEED
                    }else{
                        paddle.ySpeed = -PADDLE_SPEED   
                    }
                }
                break
            case PLAY_STATE_BALL_PLAY:
                if(ball.dirX > 0){
                    switch(ai.state){   
                    case PADDLE_AI_CHECK_DIRECTION_CHANGE:
                        isUp = paddle.ySpeed < 0
                        
                        paddleAiData.nextIsUp = ball.y < (paddle.y + paddle.height * 0.5)
                        if(isUp != paddleAiData.nextIsUp){
                            paddleAiData.reactionTime = Math.random() * REACTION_TIME
                            paddleAiData.state = PADDLE_AI_WAIT_FOR_DIRECTION_CHANGE
                        }
                        break
                    case PADDLE_AI_WAIT_FOR_DIRECTION_CHANGE:
                        paddleAiData.reactionTime -= deltaTime
                        if(paddleAiData.reactionTime < 0){
                            paddle.ySpeed = (-PADDLE_SPEED * paddleAiData.nextIsUp) + (PADDLE_SPEED * !paddleAiData.nextIsUp)
                            paddleAiData.state = PADDLE_AI_CHECK_DIRECTION_CHANGE
                        }
                        break
                    }
                }
                break
        }
    }
    
    function ballvsPaddles(ball, paddles){
       
        ballRect =  ball.getRect()
        for(i = 0; i < paddles.length; i++){
            paddleRect = paddles[i].getRect()
            if(paddleRect.intersectsRect(ballRect)){
                if(i == 0){
                    leftHitSound.play()
                }
                if(i == 1){
                    rightHitSound.play()
                }
                sideX = 0
                sideY = 0
                oppDirX = -ball.dirX
                oppDirY = -ball.dirY
                targetX = 0
                targetY = 0
                ballX = ball.x + (ball.radius * (ball.dirX > 0)) + (-ball.radius * (ball.dirX < 0))
                ballY = ball.y + (ball.radius * (ball.dirY > 0)) + (-ball.radius * (ball.dirY < 0))

                if(ball.dirX < 0){
                    sideX = RIGHT
                    targetX = paddleRect.x + paddleRect.width
                }else if(ball.dirX > 0){
                    sideX = LEFT
                    targetX = paddleRect.x
                }

                if(ball.dirY < 0){
                    sideY = BOTTOM
                    targetY = paddleRect.y + paddleRect.height
                }else if(ball.dirY > 0){
                    sideY = TOP
                    targetY = paddleRect.y
                }
                dx = (targetX - ballX) / oppDirX;
                dy = (targetY - ballY) / oppDirY;
                if((Math.abs(dx) < Math.abs(dy)) && (dx > 0)){
                    ball.moveInDir(-dx-0.1)
                    if(sideX == LEFT  && ball.dirX > 0){
                        ball.dirX *= -1
                    }
                    if(sideX == RIGHT  && ball.dirX < 0){
                        ball.dirX *= -1
                    }
                    percent = (ball.y - paddleRect.y) / paddleRect.height
                    percent -= 0.5
                    percent *= 2
                    ball.dirY = percent * Math.SQRT2
                

                    
                }else if((Math.abs(dy) < Math.abs(dx)) && (dy > 0)){
                    ball.moveInDir(-dy -0.1)
                    if(sideY == TOP && ball.dirY > 0 ){
                        ball.dirY *= -1
                    }
                    if(sideY == BOTTOM  && ball.dirY < 0){
                        ball.dirY *= -1
                    }                    
                }    
            }
        }
    }
    function drawPaddles(paddles){
        ctx.fillStyle = 'white'
        for(i = 0; i < paddles.length; i++){
            ctx.fillRect(
                paddles[i].x, paddles[i].y, 
                paddles[i].width, paddles[i].height
            )   
        }
    }

    function drawDivider(){
        ctx.fillRect(312, 16, 16, 16)

        for( i = 0; i < 3; i++){
            ctx.fillRect(312, 48 + (i *64), 16, 32)

        }

        ctx.fillRect(312, 32 * 7 + 8, 16, 16)
        
        for( i = 0; i < 3; i++){
            ctx.fillRect(312, 272 + (i *64), 16, 32)
        }

        ctx.fillRect(312, 448, 16, 16)

    }

    function drawWalls(){
        ctx.fillStyle = 'gray'
        ctx.fillRect(0, 0, 640, 16)
        ctx.fillRect(0, 480 - 16, 640, 16)
    }

    function paddlesUpdate(player, ai){
        paddleAi(ai)
        if(upPressed){
            player.ySpeed = -PADDLE_SPEED
        }else if(downPressed){
            player.ySpeed = PADDLE_SPEED
        }else{
            player.ySpeed = 0.0
        }

        player.y += player.ySpeed * deltaTime
        ai.y += ai.ySpeed * deltaTime
    
    }




    function updatePlayState(){
        game = this.pong.game
        ball = game.ball
        resetButton = game.resetButton
        toMainMenuButton = game.toMainMenuButton
        paddle0 = game.paddle0
        paddle1 = game.paddle1
        score0 = game.score0
        score1 = game.score1
        paddleAiData = game.paddleAiData
        if(escButton.state === BUTTON_PRESSED){
            game.isPaused = !game.isPaused
        }

        if(!game.isPaused){                
            switch(game.state){
            case PLAY_STATE_SERVE:         
                game.serveTimeRemaining -= deltaTime
                paddlesUpdate(paddle0, paddle1)
                if(game.serveTimeRemaining < 0){
                    ball.setRandomDirection()
                    game.state = PLAY_STATE_BALL_PLAY
                    
                }
                paddleVsWall([paddle0, paddle1])

                break
            case PLAY_STATE_BALL_PLAY:
                paddlesUpdate(paddle0, paddle1)

                ball.x += ball.dirX * BALL_SPEED * deltaTime
                ball.y += ball.dirY * BALL_SPEED * deltaTime
                ball.bounceBottom(leftHitSound)
                ball.bounceTop(leftHitSound)
                
                ballvsPaddles(ball, [paddle0, paddle1])
                paddleVsWall([paddle0, paddle1])
                
                inBoundRect = new Rect(-32, 0, 704, 480)
                if(!inBoundRect.containsPoint({x: ball.x, y: ball.y})){
                    if(ball.x < inBoundRect.x + inBoundRect.width * 0.5){
                        score1.score += 1
                        ballLoseSound.play()
                    }else{
                        score0.score += 1
                        ballWinSound.play()
                    }
                    game.state = PLAY_STATE_BALL_OUT

                }        
                break
            case PLAY_STATE_BALL_OUT:
                if((score0.score === TARGET_SCORE) || (score1.score === TARGET_SCORE)){
                    game.state = PLAY_STATE_GAME_END
                    endTimeRemaining = END_TIME
                    game.resetButton.reset()
                    game.toMainMenuButton.reset()
                }else{ 
                    ball.setRandomPosition()
                    game.state = PLAY_STATE_SERVE
                    game.paddleAiData.nextTargetFound = false
                    game.serveTimeRemaining = SERVE_TIME

                }
                break     
            }
        }

        drawWalls()
        drawDivider()
        numberRects = numberToRectList(score0.score)   

        for(i = 0; i < numberRects.length; i++){
            numberRects[i].x += 240
            numberRects[i].y += 32
        }
        ctx.fillStyle = "white"
        for(i = 0; i < numberRects.length; i++){
            let rect = numberRects[i]
            let numberWidth = String(score0.score).length;
            ctx.fillRect(rect.x + ((numberWidth -1) * -64), rect.y, rect.width, rect.height)

        }
        numberRects = numberToRectList(score1.score)
        for(i = 0; i < numberRects.length; i++){
            numberRects[i].x += 352
            numberRects[i].y += 32
        }
        for(i = 0; i < numberRects.length; i++){
            let rect = numberRects[i]
            ctx.fillRect(rect.x, rect.y, rect.width, rect.height)

        }
        drawPaddles([paddle0,paddle1])
        ball.draw(ctx)

        if(game.isPaused){
            ctx.font = "32px Ariel";
            ctx.fillStyle = 'white'
            ctx.textAlign = 'center';
            ctx.fillText("Paused", 320, 240)

        }

        if(game.state === PLAY_STATE_GAME_END){
            ctx.font = "32px Retro";
            ctx.textAlign = "center";

            if(score0.score === TARGET_SCORE){
                ctx.fillStyle = "green";
                ctx.fillText("YOU WIN", 320, 240);
            }else{
                ctx.fillStyle = "red";
                ctx.fillText("YOU LOSE", 320, 240);
            }
            ctx.fillStyle = "white"

            resetButton.update(mButtonDown, cursor, deltaTime)
            toMainMenuButton.update(mButtonDown,cursor, deltaTime)
            resetButton.draw(ctx)
            toMainMenuButton.draw(ctx)
            
            
            if(resetButton.state != MENU_BUTTON_NOT_ACTIVATED){
                toMainMenuButton.state = MENU_BUTTON_NOT_ACTIVATED
            }

            if(toMainMenuButton.state != MENU_BUTTON_NOT_ACTIVATED){
                resetButton.state = MENU_BUTTON_NOT_ACTIVATED
            }

            if(resetButton.state == MENU_BUTTON_ENDED){
                game.state = PLAY_STATE_SERVE
                game.serveTimeRemaining = SERVE_TIME
                ball.setRandomPosition()
                score0.score = 0
                score1.score = 0
                game.isPaused = false            
                game.paddleAiData.state = PADDLE_AI_CHECK_DIRECTION_CHANGE
                game.endTimeRemaining = END_TIME
            }

            if(toMainMenuButton.state == MENU_BUTTON_ENDED){
                ball.setRandomPosition()                      
                pong.state = PONG_STATE_MAIN_MENU
                pong.mainMenu.playButton.reset()
            }
        }
    }
    
    update = function(newTime){
        ctx.clearRect(0, 0, WIDTH, HEIGHT)
        ctx.fillStyle = 'black'
        ctx.fillRect(0,0, WIDTH, HEIGHT)
        nextButtonState(escButton)

        switch(this.pong.state){
            case PONG_STATE_MAIN_MENU:
                playButton = pong.mainMenu.playButton
                playButton.update(mButtonDown,cursor, deltaTime)
                playButton.draw(ctx)
            
                if(playButton.state == MENU_BUTTON_ENDED){
                    if(!pong.mainMenu.isTransitioning){
                        pong.mainMenu.isTransitioning = true
                        pong.mainMenu.transitionTime = 0.2
                    }
                    pong.mainMenu.transitionTime -= deltaTime
                    if(pong.mainMenu.transitionTime  < 0){

                        pong.onPlayPressed()
                    }
                }
                
                break
            case PONG_STATE_PLAY:
                updatePlayState()
                break
        }

        deltaTime = (newTime - time) * 0.001
        time = newTime
        window.requestAnimationFrame(update)
    }
    window.requestAnimationFrame(update)
}


window.onload =() =>{
    retroFont.load().then(
        function(font){
            document.fonts.add(font)
            init()
        }
    )
}
