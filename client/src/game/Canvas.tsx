'use client'

import { useEffect, useRef, useState } from "react";
import Player from "./Player.class";
import {Ball} from "./Ball.class";
import { Socket } from "socket.io-client";

export default function Canvas(props: {socket: Socket, themeN: number, ball: boolean, colors: any}) {
	const [a, Game] = useState(0);
	const n = props.themeN;
    let bgColor = "#353D49";
	let color = "#50CFED";
    const ball = new Ball();
	let player = new Player(0, 0, "#2978F2");
	let com = new Player(0, 0, "#fff");
	const phoneSize = useRef(false);
	
	const net = {
		x : 0,
		y : 0,
		height : 10,
		width : 2,
		color : "WHITE"
	}
	
	if (n === 4)
	{
		bgColor = props.colors.bg;
		com.color = props.colors.p2;
		player.color = props.colors.p1;
	}
	if (n === 2)//theme 1988 switch colors
	{
		bgColor = "#000c";
		com.color = "#FFF";
		player.color = "#FFF";
	}
	if (n === 3)
	{
		bgColor = "#FFF";
		player.color = com.color = "#000";
	}
    function StartGame(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D)
	{
		//line in the middle of canvas
		net.x = (canvas.width - 2)/2;
		
		// draw circle, will be used to draw the ball
		function drawArc(x: number, y: number, r: number, color: string){
			ctx.fillStyle = color;
			ctx.beginPath();
			if (n === 2)
			drawRect(x, y, ball.radius!*1.5, ball.radius!*1.5, color);
			else
				ctx.arc(x,y,r,0,Math.PI*2,true);
			ctx.closePath();
			ctx.fill();
		}

		function drawScore(text: number, x: number, y: number, player: boolean){
			let scoreText = '';
			if (player) {
			  scoreText = `you ${text}`;
			} else {
			  scoreText = `${text} opps`;
			}

			(n === 3 ? ctx.fillStyle = "#000" : ctx.fillStyle = "#FFF")
			ctx.font = "2rem 'Press Start 2P', system-ui";
			phoneSize.current && (x = canvas.height / 2);
			phoneSize.current && player && (y = - canvas.width / 2 + 90);
			phoneSize.current && !player && (y = - canvas.width / 2 - 50);
			if (phoneSize.current) {
				ctx.save();
				ctx.textAlign = 'center';
				ctx.rotate(Math.PI / 2);
				ctx.fillText(scoreText + '', x, y);
				ctx.restore();
			}
			else
				ctx.fillText(scoreText + '', x, y);
		}

		function drawRect(x:number, y:number, w:number, h:number, color: string){
			ctx.fillStyle = color;
			ctx.fillRect(x, y, w, h);
		}

		function drawNet(){
			if (n === 3)
				net.color = "#000";
			for(let i = 0; i <= canvas.height; i+=15){
				drawRect(net.x, net.y + i, net.width, net.height, net.color);
			}
		}
		function collision() {
			player.top = player.y;
			player.bottom = player.y! + player.height!;
			player.left = player.x;
			player.right = player.x! + player.width!;
			
			ball.top = ball.y! - ball.radius!;
			ball.bottom = ball.y! + ball.radius!;
			ball.left = ball.x! - ball.radius!;
			ball.right = ball.x! + ball.radius!;

			if (ball.y! + ball.radius! >= canvas.height){
				ball.velocityY = -ball.velocityY!;
			}
			
			return player.left! < ball.right && player.top! < ball.bottom && player.right > ball.left && player.bottom > ball.top;
		}
		//clear canvas
		drawRect(0, 0, canvas.offsetWidth, canvas.offsetHeight, bgColor);
		// draw the user score to the left
		drawScore(player.score!, canvas.width / 4, canvas.height / 5, true);
		drawNet();
		// draw the COM score to the right
		drawScore(com.score!, 3 * canvas.width / 4, canvas.height / 5, false);
		//draw player Paddle

		drawRect(player.x!, player.y!, player.width!, player.height!, player.color!);
		//draw the oposite Paddle
		drawRect(com.x!, com.y!, com.width!, com.height!, com.color!);

		//draw the ball
		if (props.ball === true)
        {
            color = "#" +  (Math.ceil(ball.x!) < 0 ? Math.ceil(ball.x!) * -1 : Math.ceil(ball.x!))
                + "" + (Math.ceil(ball.y!) < 0 ? Math.ceil(ball.y!) * -1 : Math.ceil(ball.x!));
            if (color.length !== 7)
                // color + "" + Math.floor(Math.random() * 10);
			ball.color = color;
        }
		else if (n === 4)
			ball.color = props.colors.bc;
		else if (n === 3)
			ball.color = "#000";
		else
			ball.color = "white";
        props.ball === true && drawArc(ball.x!, ball.y!, ball.radius! + 2, "white");
        drawArc(ball.x!, ball.y!, ball.radius!, ball.color!);
		
		let collAngle = 0;
		const coll = collision();
		if (coll)
		{
			let collidePoint = (ball.y! - (player.y! + player.height!/2));
			collidePoint = collidePoint / (player.height!/2);
			collAngle = (Math.PI/4) * collidePoint;
		}

		props.socket.emit("player", {
			x: player.x,
			y: player.y,
			collision: coll,
			collAngle,
			h: player.height,
			canvasH: canvas.height
		});
	}

    useEffect(() => {
		const canvas = document.getElementById('pongy') as HTMLCanvasElement;
		const ctx = canvas.getContext('2d');

		ctx!.font="2rem 'Press Start 2P', system-ui";
		canvas.width = canvas.offsetWidth;
		canvas.height = canvas.offsetHeight;
		player.setDims(canvas.height / 4, canvas.width * 10 / 800);
		player.setPos(0, canvas.height / 2 - player.height! / 2);
		com.setDims(canvas.height / 4, canvas.width * 10 / 800);
		com.setPos(canvas.width - com.width!, player.y!);
		ball.setRadius(canvas.width * 10 / 800);
		if (canvas.height === 337)
			phoneSize.current = true
		canvas.addEventListener("mousemove", getMousePos);

		props.socket.on('gameQueue', () => {
			function drawText(text: string, x: number, y: number){
                if (ctx) {
                    ctx.fillStyle = (n === 3 ? "#000" : "#FFF");
                    ctx.font = "1rem 'Press Start 2P', system-ui";
                    phoneSize.current && (x = canvas.height / 2);
                    phoneSize.current && (y = -canvas.width / 2);
                    ctx.textAlign = 'center';
                    if (canvas.height === 337) {
                        ctx.font = "2rem 'Press Start 2P', system-ui";
                        ctx.save();
                        ctx.rotate(Math.PI / 2);
                        ctx.fillText(text + '', x, y);
                        ctx.restore();
                    }
                    else
                        ctx.fillText(text + '', x, y);
                }
            }
            if (ctx) {
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                drawText("Looking for opponent...", canvas.width / 2, canvas.height / 2);
            }
		});

		props.socket.on('gameQueuePlaned', () => {
			function drawText(text: string, x: number, y: number){
                if (ctx) {
                    ctx.fillStyle = (n === 3 ? "#000" : "#FFF");
                    ctx.font = "1rem 'Press Start 2P', system-ui";
                    phoneSize.current && (x = canvas.height / 2);
                    phoneSize.current && (y = -canvas.width / 2);
                    ctx.textAlign = 'center';
                    if (canvas.height === 337) {
                        ctx.font = "2rem 'Press Start 2P', system-ui";
                        ctx.save();
                        ctx.rotate(Math.PI / 2);
                        ctx.fillText(text + '', x, y);
                        ctx.restore();
                    }
                    else
                        ctx.fillText(text + '', x, y);
                }
            }
            if (ctx) {
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                drawText("Waiting for opponent to accept...", canvas.width / 2, canvas.height / 2);
            }
		});
		// listening to the window resize event
		window.addEventListener("resize", () => {
			Game(canvas.width);
			canvas.width = canvas.offsetWidth;
			canvas.height = canvas.offsetHeight;
			player.setDims(canvas.height / 4, canvas.width * 10 / 800);
			com.setDims(canvas.height / 4, canvas.width * 10 / 800);
			com.x = canvas.width - com.width!;
			ball.setRadius(canvas.width * 10 / 800);
			// special.radius = canvas.width * 20 / 800;
			if (canvas.height === 337)
				phoneSize.current = true;
			else
				phoneSize.current = false;
		});
		//change player Paddle According to Mouse Position
		function getMousePos(evt: { clientY: number, clientX: number }){
			let rect = canvas.getBoundingClientRect();
			if (canvas.width === 600 && canvas.height === 337 && player.y !== -1) {
				const posY = evt.clientX - rect.left + 2; 
				if (posY < canvas.height - player.height!)
					player.y = posY
			}
			else if (evt.clientY < rect.bottom - player.height! && player.y !== -1)
				player.y = evt.clientY - rect.top + 2; 
			else
				return ;
		}
		//   props.socket.on('send_canva_W_H', () => {
		// 	  props.opData((oldata: any) => {
		// 		  const update = {...oldata};
		// 		  update.loading = false;
		// 		  return (update);
		// 		});
		// 		props.socket.emit("startGame", {w:canvas.width, h:canvas.height});
		// });

        props.socket.on('game_Data', data => {
            ball.x = canvas.height * data.x / 562;
			ball.y = canvas.width * data.y / 800;
			player.height = data.ph * canvas.height / 562;
			com.height = data.ch * canvas.height / 562;
            StartGame(canvas, ctx!);
        });
		props.socket.on("playerMov", data => {
			com.y = data.y * canvas.height / 562;
		});

		props.socket.on("score", data => {
			if (props.socket.id === data.soc)
			{
				player.score = data.p1;
				com.score = data.p2;
			}
			else
			{
				com.score = data.p1;
				player.score = data.p2;
			}
			com.x = canvas.width - com.width!;
			player.x = 0;
			player.y = 0;
		});
		return (() => {
			player.destructor();
			com.destructor();
			ball.destructor();
		});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])



    return (
		<div style= {{
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			backgroundColor: 'transparent',
			margin: 'auto',

		}}>
        <canvas id="pongy" style={{
			backgroundColor: 'rgba(0, 0, 0, 0.5)',  
			borderRadius: '40px',
			aspectRatio: '16 / 10',
			maxWidth: '800px',
			maxHeight: '4950px',
			width: '800px',
			height: '562px'
		}}/>
		</div>
    );
}
