import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { randomUUID } from "crypto";
import { Server, Socket } from 'socket.io';
import { Player, userNode, roomT, Ball, msgFromPlayer, planedGame } from "./game.player";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { getUserFromDatabase } from "src/utils/utils";
import * as cookie from 'cookie';
import { AchievementsService } from "src/achievements/achievements.service";

@WebSocketGateway(3003, {cors: {origin: 'http://localhost:3000' , credentials: true}})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect{
  
  @WebSocketServer()
  server: Server;

  private connectedUsers : {socket: Socket, id: string}[] = [];
  private gameQueue : userNode[] = [];
  private planedGames : planedGame[] = [];
  private rooms : roomT[] = [];

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
	private readonly achievementService: AchievementsService,
  ) {}

  OnWebSocektError(socket:Socket)
  {
      socket.emit("error", new UnauthorizedException());
      socket.disconnect();
  }

async update(room: roomT) {
	if (!room.player1.gameGoing && !room.player2.gameGoing){
		return;
  }
  	const ballOutOfBoundsLeft = room.player1.ball.x - room.ballDynamics.radius < -25;
  	const ballOutOfBoundsRight = room.player1.ball.x + room.ballDynamics.radius > room.canvas.width + 25;

		if (ballOutOfBoundsLeft && room.player2.score < 7 )//
		{
			room.player2.score += 1;
			room.player2.height = room.canvas.height / 4;
			room.player1.height = room.canvas.height / 4;
			this.server.to(room.roomId).emit("score", {soc:room.player2.socket.id, p1:room.player2.score, p2:room.player1.score});
		}
		
		else if (ballOutOfBoundsRight && room.player1.score < 7)//
		{
			room.player1.score += 1;
			room.player2.height = room.canvas.height / 4;
			room.player1.height = room.canvas.height / 4;
			this.server.to(room.roomId).emit("score", {
				soc: room.player1.socket.id,
				p1: room.player1.score,
				p2: room.player2.score
			})
		}
		if (room.player1.score === 7 || room.player2.score === 7)//
		{
			room.player1.gameGoing = room.player2.gameGoing = false;
			await this.userService.createMatch(room.player1.id, room.player2.id, room.player1.score, room.player2.score);
			clearInterval(room.loop as any);
			this.server.to(room.roomId).emit("gameOver", {
				winnerId: room[room.player1.score === 7 ? 'player1' : 'player2'].socket.id,
				winnerUsername: room[room.player1.score === 7 ? 'player1' : 'player2'].nickname,
				looserUsername: room[room.player1.score !== 7 ? 'player1' : 'player2'].nickname,
			});
			const winnerUsername = room[room.player1.score === 7 ? 'player1' : 'player2'].nickname;
			const loserUsername = room[room.player1.score !== 7 ? 'player1' : 'player2'].nickname;
			const winner = await this.userService.findUser(winnerUsername);
			const loser = await this.userService.findUser(loserUsername);
			winner.winStreak++;
			loser.winStreak = 0;
			await this.userService.updateUserWinStreak(winner);
			await this.userService.updateUserWinStreak(loser);
			const hasFirstWin = winner.achievements.find(a => a.title === 'FirstWin');

			if (!hasFirstWin){
				await this.achievementService.giveFirstWin(winnerUsername);
			}

			if (winner.winStreak === 3){
				await this.achievementService.giveWinStreak(winnerUsername);
			}

			return ;
		}
		
		if (ballOutOfBoundsLeft || ballOutOfBoundsRight) {
			room.ballDynamics.resetForNewGame();
			room.player1.resetBall(room.canvas.width / 2, room.canvas.height / 2);
			room.player2.resetBall(room.canvas.width / 2, room.canvas.height / 2);
		}
		room.player1.moveBall(room.ballDynamics.velocityX, room.ballDynamics.velocityY);
		room.player2.moveBall(-room.ballDynamics.velocityX, -room.ballDynamics.velocityY);
		if(room.player1.ball.y - room.ballDynamics.radius < 0 || room.player1.ball.y + room.ballDynamics.radius > room.canvas.height) {
			if (room.player1.ball.y - room.ballDynamics.radius < 0) {
				room.player1.correctHorizantalColl(room.ballDynamics.radius + 1);
				room.player2.correctHorizantalColl(room.canvas.height - room.ballDynamics.radius + 1);
			}
			else {
				room.player1.correctHorizantalColl(room.canvas.height - room.ballDynamics.radius + 1);
				room.player2.correctHorizantalColl(room.ballDynamics.radius + 1);
			}
			room.ballDynamics.velocityY = -room.ballDynamics.velocityY;
		}
		this.server.to(room.player1.socket.id).emit('game_Data', {
			x: room.player1.ball.x,
			y: room.player1.ball.y,
			ph: room.player1.height,
			ch: room.player2.height,
		})
		this.server.to(room.player2.socket.id).emit('game_Data', {
			x: room.player2.ball.x,
			y: room.player2.ball.y,
			ph: room.player2.height,
			ch: room.player1.height,
		})
	}

  async startGame(room: roomT){
    room.player1.score = 0;
    room.player2.score = 0;
    let framePerSecond = 60;
    room.loop = setInterval(() => {
      this.update(room);
    }, 1000/framePerSecond);
    return ;
  }

  async createGameRoom(){
    const roomId = randomUUID();
    const ballDynamics = new Ball();
    const player1 = this.gameQueue[0];
    const player2 = this.gameQueue[1];
    player1.socket.join(roomId);
    player2.socket.join(roomId);

    const newRoom : roomT = {
      player1: new Player(undefined, player1.user),
      player2: new Player(undefined, player2.user),
      roomId,
      ballDynamics,
      canvas: {height: 562, width: 800},
      loop: null,
    //   hell: false,
    //   specialsMode: false,
    //   specials: new Specials(),
    };
    this.server.to(newRoom.player1.socket.id).emit("playersInfo", {nickname: newRoom.player2.nickname, avatar: newRoom.player2.avatar});
    this.server.to(newRoom.player2.socket.id).emit("playersInfo", {nickname: newRoom.player1.nickname, avatar: newRoom.player1.avatar});
    newRoom.player1.gameGoing = newRoom.player2.gameGoing = true;
    this.rooms.push(newRoom);
    this.gameQueue.splice(0, 2);
    setTimeout(() => {
      this.server.to(roomId).emit("send_canva_W_H");
      this.startGame(newRoom);
    }, 3000);
  }

  async handleConnection(socket: Socket) {
		let decodeJWt: any;
		const cookies = cookie.parse(socket.handshake.headers.cookie);
		const token = cookies.access_token;

		try {
			decodeJWt = this.jwtService.verify(token, {
				secret: process.env.JWT_SECRET
			})
		} catch (err) {
      console.log('error catch', err);
			this.OnWebSocektError(socket);
		}
		if (!decodeJWt)
		{
      console.log('error decoding');
			this.OnWebSocektError(socket);
			return ;
		}
	const user = await this.userService.findUserByID(decodeJWt.userId);
    if (user){
      this.connectedUsers.push({socket, id: user.username});
    }
		if (!user) {
			this.OnWebSocektError(socket);
		}
	}

  async handleDisconnect(socket: Socket) {///delete room when someone disconnected
		try {console.log(this.connectedUsers.find(x => x.socket === socket ).id ,' : has disconnected from game socket')}
		catch(err){console.log("unknown disconnected !!");}
		try {
			const room = this.rooms.find(x => x.player1.socket === socket || x.player2.socket === socket);
			if (room.player1.gameGoing === true || room.player2.gameGoing === true)
			{
				room.player1.gameGoing = room.player2.gameGoing = false;
				if (room.player1.score !== room.player2.score)
				{
					await this.userService.createMatch(room.player1.id, room.player2.id, (room.player1.socket.connected ? 8 : 0), (room.player2.socket.connected ? 8 : 0));
					// await this.usersService.createMatch(room.player1.nickName, room.player2.nickName, room.player1.score, room.player2.score);
					this.server.to(room.roomId).emit("gameOver", {
						winnerId: room[room.player1.socket.connected ? 'player1' : 'player2'].socket.id,
						winnerUsername: room[room.player1.socket.connected ? 'player1' : 'player2'].nickname,
						looserUsername: room[room.player1.socket.connected ? 'player2' : 'player1'].nickname,
					});
				}
				else
					this.server.to(room.roomId).emit("gameOver", "draw");
            }
			clearInterval(this.rooms.find(x => 
				x.player1.socket === socket || x.player2.socket === socket
                ).loop as any);
            this.rooms.splice(this.rooms.indexOf(room), 1);
		}
		catch(e){}
		const disconnectedUser = this.connectedUsers.findIndex(x => x.socket.id === socket.id);
		if (disconnectedUser === -1)
			return ;
		this.connectedUsers.splice(disconnectedUser, 1);
		const QueuedUser = this.gameQueue.findIndex(x => x.socket.id === socket.id);
		if (QueuedUser === -1)
			return ;
		this.gameQueue.splice(QueuedUser, 1);
	}

  findOpponentBySocket(socket: Socket): Socket {
		let sock: Socket;
		this.rooms.map((room) => {
			if (room.player1.socket.id === socket.id)
				sock = room.player2.socket;
			if (room.player2.socket.id === socket.id)
				sock = room.player1.socket;
		});
		return sock;
	}

	findRoomBySocket(socket: Socket)
	{
		return this.rooms.find(room => {
			return room.player1.socket.id === socket.id || room.player2.socket.id === socket.id
		});
	}

	findPlayerInRoom(socket: Socket)
	{
		let room: roomT;
		room = this.findRoomBySocket(socket);
		return (socket === room.player1.socket ? room.player1.socket : room.player2.socket)
	}

	findPlayerByRoom_SockerId(room : roomT, id: string)
	{
		return (room.player1.socket.id === id ? room.player1 : room.player1.socket.id === id ? room.player2 : null)
	}

	checkPlayerOrder(socket: Socket, room: roomT) {
		if(socket.id === room.player1.socket.id)
			return (1);
		return (2);
	}

	async checkForRivals() {
		const newUser = this.planedGames[this.planedGames.length - 1];
		// console.log('me: ', newUser.user.nickname, 'against: ', newUser.against);
		return this.planedGames.find(p => {
			// console.log('me: ', p.user.nickname, 'still me:', newUser.against, 'him:' , p.against, 'still him:', newUser.user.nickname)
			if (p.user.nickname === newUser.against && p.against === newUser.user.nickname)
				return true;
		})
	}

	async createPlanedGameRoom(rivals: planedGame[]) {
		const roomId = randomUUID();
		const ballDynamics = new Ball();
		const player1 = rivals[0];
		const player2 = rivals[1]
		player1.socket.join(roomId);
		player2.socket.join(roomId);

		console.log('creating planned game');
		const newRoom:roomT = {
			player1: new Player(undefined, player1.user),
			player2: new Player(undefined, player2.user),
			roomId,
			ballDynamics,
			canvas: {height: 562, width: 800},
			loop: null,
		};
		this.server.to(newRoom.player1.socket.id).emit("playersInfo", {nickname:newRoom.player2.nickname,
								avatar:newRoom.player2.avatar});
		this.server.to(newRoom.player2.socket.id).emit("playersInfo", {nickname:newRoom.player1.nickname,
								avatar:newRoom.player1.avatar});
		
		newRoom.player1.gameGoing = newRoom.player2.gameGoing = true; //set the game as started
		this.rooms.push(newRoom);
		setTimeout(()=>{
			this.server.to(roomId).emit("send_canva_W_H");
			this.startGame(newRoom);
		}, 3000);
	}

  @SubscribeMessage('startGame')
	setStyles(socket: Socket, data: {w:number, h:number, hell: boolean, specials: boolean})
	{
		const room = this.findRoomBySocket(socket);
		if (room && this.checkPlayerOrder(socket, room) === 1) {
			room.player1.initBallPos(room.canvas.width / 2, room.canvas.height / 2, room.canvas.width * 10 / 800);
			room.player2.initBallPos(room.canvas.width / 2, room.canvas.height / 2, room.canvas.width * 10 / 800);
		}
	}

  @SubscribeMessage('GameMode')
	async setGameMode(socket: Socket, data: {against: string})
	{
    const connectedUser = this.connectedUsers.find(c => c.socket.id === socket.id);
	if (!connectedUser){
		return 'user not connected';
	}
    if (connectedUser){
      const {id: userId} = this.connectedUsers.find(c => c.socket.id === socket.id);
      const user = await getUserFromDatabase(userId);
	  console.log('user: ', user);
      if (user){
        const player = new Player(socket, undefined);
        player.setData(user.userId, user.userIconPath, user.username);
        if (!data.against || data.against === 'undefined') {
          this.gameQueue.push({socket, user: player});
		  socket.emit('gameQueue', {message: 'You have been added to the game queue'});
          if (this.gameQueue.length < 2 || this.connectedUsers.length < 2)
            return ;
          if (this.gameQueue[0].user.id === this.gameQueue[1].user.id){
            this.gameQueue.pop();
            return ;
          }
          this.createGameRoom();
		}
		else {
			const opp: planedGame = {socket, user: player, against: data.against};
				this.planedGames.push(opp);
				if (this.planedGames.length < 2 || this.connectedUsers.length < 2){
					socket.emit('gameQueuePlaned', {message: 'You have been added to the game queue'});	
					return ;
				}
				if (this.planedGames[0].user.id === this.planedGames[1].user.id)
				{
					this.planedGames.pop();
					return ;
				}
				const rival = await this.checkForRivals();
				if (rival) {
					this.planedGames.splice(this.planedGames.length - 1, 1);
					const rivalIndex = this.planedGames.findIndex(p => p.user.id === rival.user.id);
					if (rivalIndex >= 0)
						this.planedGames.splice(rivalIndex, 1);
					this.createPlanedGameRoom([rival, opp]);
				}
			}
		}
	}
}

	// uncomment this and comment above if you want to testUser 

    @SubscribeMessage('testUser')
  async testUser(socket: Socket, data: {against: string})
  {
      const user = await getUserFromDatabase('testUser');
      if (user){
        const player = new Player(socket, undefined);
        player.setData(user.userId, user.userIconPath, user.username);
        this.gameQueue.push({socket, user: player});
        if (data.against === 'unfedined') {
          const testUser = await getUserFromDatabase('testUser');
          if (testUser) {
            const testPlayer = new Player(socket, undefined);
            testPlayer.setData(testUser.userId, testUser.userIconPath, testUser.username);
            this.gameQueue.push({socket, user: testPlayer});
          }
        }
        if (this.gameQueue.length < 2 || this.connectedUsers.length < 2)
          return console.log('waiting for another player', user.displayName);
        if (this.gameQueue[0].user.id === this.gameQueue[1].user.id)
        {
          this.gameQueue.pop();
          return ;
        }
        console.log('match found', this.gameQueue[0].user.id, this.gameQueue[1].user.id);
        this.createGameRoom();
      }
  }

  @SubscribeMessage('action')
  handleAction(client: any, data:any): void {
    console.log('hello world');
  }

  @SubscribeMessage('player')
	handleEvent(socket: Socket, data: msgFromPlayer) {
		const room = this.findRoomBySocket(socket);
		let emiter: Player;
		let receiver: Player;
		if (!room)
			return ;
		if (this.checkPlayerOrder(socket, room) === 1) {
			emiter = room.player1;
			receiver = room.player2;
		} else {
			emiter = room.player2;
			receiver = room.player1;
		}
		if (data.collision)
		{
			if (socket.id === room.player2.socket.id)
			{
				const a = 1.5708 - data.collAngle; // the angle between collAngle and 90deg
				const mirrorAngle = data.collAngle + 2 * a;
				data.collAngle = -mirrorAngle;
			}
			room.ballDynamics.velocityX = room.ballDynamics.speed * Math.cos(data.collAngle);
			room.ballDynamics.velocityY = room.ballDynamics.speed * Math.sin(data.collAngle);
			room.ballDynamics.speed += 0.2;
		}
		const newY = data.canvasH - data.y - data.h;//hna
		// const newY = emiter.canvas.height - data.y - miter.height;//hna
		this.server.to(receiver.socket.id).emit("playerMov", {x: data.x, y: newY * room.canvas.height / data.canvasH});
	}
}
