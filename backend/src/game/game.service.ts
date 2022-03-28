import { Injectable } from "@nestjs/common";
import { GameEntity, gameMode, gameStatus, playersStatus } from "src/db/entities/game.entity";
import {
	CreateGameDto,
	GameDataDto,
	JoinGameDto,
	ServerJoinGameDto,
	SimpleGameDataDto,
	SimpleGameDataDtoTwoPlayer,
	UpdateGamePointDto } from "./dto/create_game.dto";
import { logger } from "src/global-var/global-var.service";
import { GameUserSocketEntity } from "src/db/entities/gameusersocker.entity";
import { GameUserEntity } from "src/db/entities/gameuser.entity";
import { GameServeurSocketEntity } from "src/db/entities/gameserversocker.entity";
import { createQueryBuilder, In } from "typeorm";
import { UserEntity } from "src/db/entities/user.entity";
import { StatService } from "src/user/stat/stat.service";
import { UserStatEntity } from "src/db/entities/userstat.entity";


/* Identification du statut des personnes lors d'une game */
export enum player_status {playerA, playerB, watcher, serverInstance};

@Injectable()
export class GameService {

	constructor(
		private statService: StatService
	) {}

	async createGame(data: CreateGameDto) {
		logger()

		const newGame: GameEntity = GameEntity.create();
		const user: GameUserEntity = GameUserEntity.create();
		const socketuser: GameUserSocketEntity = GameUserSocketEntity.create();


		newGame.gamemode = data.gameMode;
		newGame.options = 0; // OPTIONS
		await newGame.save();

		user.iduser = data.idUser;
		user.idgame = newGame.id;

		socketuser.iduser = data.idUser;
		socketuser.idgame = newGame.id;
		socketuser.socket = data.socketid;

		await user.save();
		await socketuser.save();
		return (newGame)

	}

	async userJoinGame(data: JoinGameDto): Promise<GameUserSocketEntity> {
		logger()
		const user: GameUserEntity = GameUserEntity.create();
		const socketuser: GameUserSocketEntity = GameUserSocketEntity.create();

		user.iduser = data.idUser;
		user.idgame = data.idGame;

		socketuser.iduser = data.idUser;
		socketuser.idgame = data.idGame;
		socketuser.socket = data.socketid;

		await user.save();
		await socketuser.save();

		return (socketuser);
	}

	async serverJoinGame(data: ServerJoinGameDto): Promise<GameServeurSocketEntity> {
		logger()
		const serverSocket: GameServeurSocketEntity = GameServeurSocketEntity.create();

		serverSocket.idgame = data.idGame;
		serverSocket.socket = data.socketid;

		await serverSocket.save();

		return (serverSocket);
	}

	/* MaJ du score des joueurs */
	async updatePointGame(data: UpdateGamePointDto): Promise<GameEntity> {
		const game: GameEntity = await GameEntity.findOne({
			where: {
				id: data.idGame,
			}
		});

		const userGame1: GameUserEntity = await GameUserEntity.findOne({
			where: {
				idgame: data.idGame,
				iduser: data.iduser1,
			}
		})
		if (userGame1) {
			userGame1.score = data.pointUser1;
			await userGame1.save();
		}
		const userGame2: GameUserEntity = await GameUserEntity.findOne({
			where: {
				idgame: data.idGame,
				iduser: data.iduser2,
			}
		})
		if (userGame2) {
			userGame2.score = data.pointUser2;
			await userGame2.save();
		}

		return (game);
	}

	async updateGame(data: UpdateGamePointDto) {
		return this.updatePointGame(data);
	}

	async endGame(data: UpdateGamePointDto) {
		data.pointUser1 = Number(data.pointUser1)
		data.pointUser2 = Number(data.pointUser2)
		logger(data);
		this.updateGameStats(data);

		const game: GameEntity = await this.updatePointGame(data);
		game.status = gameStatus.FINISH;
		await game.save();
		await GameUserSocketEntity.delete({
            idgame: data.idGame,
		});
		await GameServeurSocketEntity.delete({
			idgame: data.idGame,
        });
		return (game);
	}

	updateGameStats(subdata: UpdateGamePointDto) {
		if (subdata.pointUser1 > subdata.pointUser2) {
			let gap: number = Math.abs(subdata.pointUser1 - subdata.pointUser2);
			this.statService.updateStat({iduser: subdata.iduser1, iswin: true, gap: gap, xpgain: 20})
			this.statService.updateStat({iduser: subdata.iduser2, iswin: false, gap: gap, xpgain: 5})
		} else if (subdata.pointUser1 === subdata.pointUser2) {
			this.statService.updateStat({iduser: subdata.iduser1, iswin: true, gap: 0, xpgain: 20})
			this.statService.updateStat({iduser: subdata.iduser2, iswin: true, gap: 0, xpgain: 20})
		} else {
			let gap: number = Math.abs(subdata.pointUser2 - subdata.pointUser1);
			this.statService.updateStat({iduser: subdata.iduser2, iswin: true, gap: gap, xpgain: 20})
			this.statService.updateStat({iduser: subdata.iduser1, iswin: false, gap: gap, xpgain: 5})
		}
	}

    async deleteGame(id: number) {
		logger();
		await GameUserEntity.delete({
            idgame: id,
        });
		await GameUserSocketEntity.delete({
            idgame: id,
        });
		await GameServeurSocketEntity.delete({
            idgame: id,
        });
        await GameEntity.delete({
            id: id,
        })
	}

	async deleteSocket(idSocket: string) {
		logger()
		const servercheck: GameServeurSocketEntity = await GameServeurSocketEntity.findOne({
			where: {
				socket: idSocket,
			}
		});
		if (servercheck) {
			await GameServeurSocketEntity.delete({
				id: servercheck.id,
			})
			return ;
		}
		const usercheck: GameUserSocketEntity = await GameUserSocketEntity.findOne({
			where: {
				socket: idSocket,
			}
		});
		if (usercheck) {
			await GameUserSocketEntity.delete({
				id: usercheck.id,
			})
		}

	}

	async deleteAllGames() {
		logger('FLASH');
		var games = await this.getAllGame()
		for (var game of games) {
			if (game.status !== gameStatus.FINISH)
				await this.deleteGame(game.id);
		}
	}

    async getAllGame(): Promise<GameEntity[]> {
		return await GameEntity.find();
	}

	async getGameByID(ID: number) {
        return await GameEntity.findOne({where : {id: ID}});
    }

	async getWaitingGameForServer() {
		var data =  await GameEntity.find({
			where: {
				status: gameStatus.INWAITING,
			}
		});
		const data2 = await GameEntity.find({
			where: {
				status: gameStatus.MATCHMAKING,
			}
		});

		if (data2.length) {
			for (const data2Child of data2)
				data.push(data2Child);
		}
 		return data;
	}

	async getWaitingGame(): Promise<SimpleGameDataDtoTwoPlayer[]> {
		let result: SimpleGameDataDtoTwoPlayer[] = [];
		const data = await GameEntity.createQueryBuilder("g")
		.innerJoinAndSelect(GameUserEntity, "gu", "gu.idgame = g.id")
		.where({
			status: gameStatus.INWAITING,
		})
		.select([
			"g.id as id",
			"g.status as status",
			"g.gamemode as gamemode",
			"g.playersstatus as playsersstatus",
			"gu.iduser as iduser",
		])
		.getRawMany();

		let ids = {};
		let dups = [];
		data.forEach((val)=> {
			if (ids[val.id]) {
			  dups.push(val);
			} else {
			  ids[val.id] = true;
			}
		});

		data.forEach(raw => {
			if (dups.find((obj) => obj.id === raw.id))
				return ;
			result.push({
				id: raw.id,
				status: raw.status,
				gamemode: raw.gamemode,
				playersstatus: raw.playersstatus,
				iduser1: raw.iduser,
				iduser2: null,
			});
		});

		return (result);
	}


	async getProgressGame() {
		return await GameEntity.find({
			where: {
				status: gameStatus.INPROGRESS,
			}
		});
	}

	async getUserGame(userid: number) {
		return await GameUserEntity.find({
			where: [
				{
					iduser: userid
				}
			]
		});
	}

    async findGameCustom(id: number) {
        return await GameEntity.findOne({
			where: {
                id: id
            }
		});
    }

	async findOneGameWaiting() {
        return await GameEntity.findOne({
			where: {
                status: gameStatus.INWAITING
            }
		});
    }

	async getGamesLists() {
		return {
			waiting: await GameEntity.createQueryBuilder("g")
			.leftJoinAndSelect(GameUserEntity, "gu", "gu.idgame = g.id")
			.where("status = :status AND (SELECT count(*) FROM game_user_entity AS gue WHERE gue.idgame = g.id) = 1", {status: gameStatus.INWAITING})
			.select([
				"g.id as id",
				"gu.id as idorder",
				"g.status as status",
				"g.gamemode as gamemode",
				"g.options as option",
				"g.playersstatus as playsersstatus",
				"gu.iduser as iduser",
			])
			.addSelect((subquery) => {
				return subquery.select('u.name')
					.from(UserEntity, 'u')
					.where("gu.iduser = u.id")
			}, "name")
			.addSelect((subquery) => {
				return subquery.select('u.image_url')
					.from(UserEntity, 'u')
					.where("gu.iduser = u.id")
			}, "path")
			.orderBy("id")
			.addOrderBy("idorder")
			.getRawMany(),
			progress: await GameEntity.createQueryBuilder("g")
			.leftJoinAndSelect(GameUserEntity, "gu", "gu.idgame = g.id")
			.where({
				status: gameStatus.INPROGRESS
			})
			.select([
				"g.id as id",
				"gu.id as idorder",
				"g.status as status",
				"g.gamemode as gamemode",
				"g.options as option",
				"g.playersstatus as playsersstatus",
				"gu.iduser as iduser",
			])
			.addSelect((subquery) => {
				return subquery.select('u.name')
					.from(UserEntity, 'u')
					.where("gu.iduser = u.id")
			}, "name")
			.addSelect((subquery) => {
				return subquery.select('u.image_url')
					.from(UserEntity, 'u')
					.where("gu.iduser = u.id")
			}, "path")
			.orderBy("id")
			.addOrderBy("idorder")
			.getRawMany()
		}
	}

	async findGameByID(id: number) {
		return await GameEntity.findOne({
			where: {
                id: id
            }
		});
    }

	async getSocketPlayerFromUserID(userID: number) {
        return await GameUserSocketEntity.findOne({
            where: {
              iduser: userID
            }
          });
	
    }

    async getSocketsPlayersFromGameID(gameID: number) {
		return await GameUserSocketEntity.createQueryBuilder("gu")
		  .where({
			  idgame: gameID
		  })
		  .select([
			"id",
			"idgame",
			"iduser",
			"socket"
		  ])
		  .orderBy("id","ASC")
		  .getRawMany();
    }

    async getSocketPlayerFromGameIDandUserID(userID: number, gameID: number) {
        return await GameUserSocketEntity.findOne({
            where: {
                iduser: userID,
                idgame: gameID
            }
          });
    }

	async setGameStatus(gameID: number, status: gameStatus) {
		const game = await GameEntity.findOne({
            where: {
                id: gameID
            }
          });
		game.status = status;
		await game.save();
		return game;
	}

	async setGameOptions(gameID: number, options: number) {
		const game = await GameEntity.findOne({
            where: {
                id: gameID
            }
          });
		game.options = options;
		await game.save();
		return game;
	}

	async setPlayerStatus(gameID: number, status: playersStatus) {
		const game = await this.getGameByID(gameID);
		game.playersstatus = status;
		await game.save();
	}

	async getDataOfGame(id: number):Promise<GameDataDto[]> {
		const data = await GameEntity.createQueryBuilder("g")
		.leftJoinAndSelect(GameUserSocketEntity, "gus", "gus.idgame = g.id")
		.leftJoinAndSelect(GameServeurSocketEntity, "gss", "gss.idgame = g.id")
		.where({
			id: id,
		})
		.select([
			"g.id as idgame",
			"g.status as status",
			"g.gamemode as gamemode",
			"g.playersstatus as playsersstatus",
			"gus.iduser as iduser",
			"gus.socket as usersocket",
			"gss.socket as serversocket"
		])
		.getRawMany();


		return (data);
	}

	async getDataOfGameUsers(id: number):Promise<GameDataDto[]> {
		const data = await GameEntity.createQueryBuilder("g")
		.leftJoinAndSelect(GameUserSocketEntity, "gus", "gus.idgame = g.id")
		.where({
			id: id,
		})
		.select([
			"gus.id as idorder",
			"g.id as idgame",
			"g.status as status",
			"g.gamemode as gamemode",
			"g.playersstatus as playsersstatus",
			"gus.iduser as iduser",
			"gus.socket as usersocket",
		])
		.addSelect((subQuery) => {
			return subQuery.select('name')
			.from(UserEntity, 'u')
			.where('u.id = gus.iduser')
		},'name')
		.orderBy("idorder", "ASC")
		.getRawMany();

		return (data);
	}

	async getGameUserSocketBySockID(sockID: string) {
		return await GameUserSocketEntity.findOne({
			where: {
				socket: sockID
			}
		});
	}

	async findGameByServerSocket(socket: string) {
        const data: GameServeurSocketEntity = await GameServeurSocketEntity.findOne({
          where: {
            socket: socket
          }
        });
        const ret = await GameEntity.createQueryBuilder("g")
              .leftJoinAndSelect(GameUserSocketEntity, "gus", "gus.idgame = g.id")
              .leftJoinAndSelect(GameServeurSocketEntity, "gss", "gss.idgame = g.id")
              .where({
                  id: data.idgame,
              })
              .select([
                  "g.id as idgame",
                  "g.status as status",
                  "g.gamemode as gamemode",
                  "g.playersstatus as playsersstatus",
                  "gus.iduser as iduser",
                  "gus.socket as usersocket",
                  "gss.socket as serversocket"
              ])
              .getRawMany();
        return (ret);
      }

	  async findGameByUserSocket(socket: string) {
        const data: GameUserSocketEntity = await GameUserSocketEntity.findOne({
          where: {
            socket: socket
          }
		});
		let id :number = 0;
		if (data)
			id = data.idgame;
        const ret = await GameEntity.createQueryBuilder("g")
              .leftJoinAndSelect(GameUserSocketEntity, "gus", "gus.idgame = g.id")
              .leftJoinAndSelect(GameServeurSocketEntity, "gss", "gss.idgame = g.id")
              .where({
                  id: id
              })
              .select([
                  "g.id as idgame",
                  "g.status as status",
                  "g.gamemode as gamemode",
                  "g.playersstatus as playsersstatus",
                  "gus.iduser as iduser",
                  "gus.socket as usersocket",
                  "gss.socket as serversocket"
              ])
              .getRawMany();
        return (ret);
      }

	  async findGameByUserID(userID: number) {
        const data: GameUserEntity = await GameUserEntity.findOne({
          where: {
            iduser: userID
          }
		});

		let id: number = 0;
		if (data)
			id = data.idgame;
        const ret = await GameEntity.createQueryBuilder("g")
              .leftJoinAndSelect(GameUserSocketEntity, "gus", "gus.idgame = g.id")
              .leftJoinAndSelect(GameServeurSocketEntity, "gss", "gss.idgame = g.id")
              .where({
                  id: id
              })
              .select([
                  "g.id as idgame",
                  "g.status as status",
                  "g.gamemode as gamemode",
                  "g.playersstatus as playsersstatus",
                  "gus.iduser as iduser",
                  "gus.socket as usersocket",
                  "gss.socket as serversocket"
              ])
              .getRawMany();
        return (ret);
      }

	  async getExistingGameByUserID(userID: number) {
        const data: GameUserEntity = await GameUserEntity.findOne({
          where: {
            iduser: userID
          }
		});

		let id: number = 0;
		if (data)
			id = data.idgame;
        const ret = await GameEntity.createQueryBuilder("g")
              .leftJoinAndSelect(GameUserSocketEntity, "gus", "gus.idgame = g.id")
              .select([
                  "g.id as idgame",
                  "g.status as status",
                  "g.playersstatus as playsersstatus",
                  "gus.iduser as iduser",
              ])
              .getRawMany();
        return (ret);
      }

	async getServerInstance(gameID: number) {
		return await GameServeurSocketEntity.findOne({
			where: {
				idgame: gameID
			}
		});
	}

	async getGamesByStatus(gameStatus: gameStatus) {
		return await GameEntity.find({
			where: {
				status: gameStatus
			}
	  });
	}

	async getPlayerStatus(gameID: number) {
		const game = await this.getGameByID(gameID);
		if (game && game.playersstatus)
			return game.playersstatus;
		else
			return undefined;
	}

	async GetDataUserByGame(id: number): Promise<SimpleGameDataDto[]> {
		const data = await GameEntity.createQueryBuilder("g")
		.leftJoinAndSelect(GameUserEntity, "gu", "gu.idgame = g.id")
		.where({
			id: id
		})
		.select([
			"gu.id as idorder",
			"g.id as id",
			"g.status as status",
			"g.gamemode as gamemode",
			"g.playersstatus as playsersstatus",
			"gu.iduser as iduser",
			"gu.idgame as idgame"
		])
		.orderBy("idorder", "ASC")
		.getRawMany();

		return (data);
	}

	async getUsernameById(userID: number): Promise<string> {
        return (await UserEntity.findOne({where: {id: userID}})).name;
    }

	async joinUserDataOfGame(id: number) : Promise<SimpleGameDataDtoTwoPlayer>{
		const game: SimpleGameDataDto[] = await this.GetDataUserByGame(id);

		const result: SimpleGameDataDtoTwoPlayer = {
			id: 0,
			status: gameStatus.INWAITING,
			gamemode: gameMode.NORMAL,
			playersstatus: playersStatus.NONE,
			iduser1: 0,
			iduser2: 0
		};

		game.forEach((raw, index) => {
			if (index === 0) {
				result.id = raw.id;
				result.gamemode = raw.gamemode;
				result.playersstatus = raw.playersstatus;
				result.status = raw.status;
				result.iduser1 = raw.iduser;
			}
			else {
				result.iduser2 = raw.iduser;
			}
		} )

		return (result);
	}

	async isServerSocket(idSocket: string): Promise<number> {
		const servercheck: GameServeurSocketEntity = await GameServeurSocketEntity.findOne({
			where: {
				socket: idSocket,
			}
		});
		if (servercheck)
			return (1);
		const usercheck: GameUserSocketEntity = await GameUserSocketEntity.findOne({
			where: {
				socket: idSocket,
			}
		});
		if (usercheck)
			return (2);
		else
			return (0);

	}

	async removePlayerFromGame(playerID: number, gameID: number) {
		await GameUserEntity.delete({
            iduser: playerID,
			idgame: gameID
        });
	}


	async getUserHistory(iduser: number) {
		const data = await GameEntity.createQueryBuilder("g")
		.leftJoinAndSelect(GameUserEntity, "gu", "gu.idgame = g.id")
		.where(qb => {
			const subquery = qb.subQuery()
				.select("game.idgame")
				.from(GameUserEntity, "game")
				.where("game.iduser = :id", {id: iduser})
				.getQuery();
				return "g.id IN " + subquery;
		})
		.select([
			"g.id as id",
			"gu.id as idorder",
			"g.gamemode as gamemode",
			"g.options as option",
			"gu.iduser as iduser",
			"gu.score as score"
		])
		.addSelect((subquery) => {
			return subquery.select('u.name')
				.from(UserEntity, 'u')
				.where("gu.iduser = u.id")
		}, "user")
		.addSelect((subquery) => {
			return subquery.select('u.image_url')
				.from(UserEntity, 'u')
				.where("gu.iduser = u.id")
		}, "path")
		.addSelect((subquery) => {
			return subquery.select('s.lv')
				.from(UserStatEntity, 's')
				.where("gu.iduser = s.iduser")
		}, "lv")
		.orderBy("id")
		.addOrderBy("score", "DESC")
		.addOrderBy("idorder", "ASC")
		.getRawMany();
		return (data);
	}

	async getPlayingGames(): Promise<SimpleGameDataDtoTwoPlayer[]> {
		let result: SimpleGameDataDtoTwoPlayer[] = [];
		const data = await GameEntity.createQueryBuilder("g")
		.innerJoinAndSelect(GameUserEntity, "gu", "gu.idgame = g.id")
		.where({
			status: gameStatus.INPROGRESS || gameStatus.MATCHMAKING,
		})
		.select([
			"g.id as id",
			"g.status as status",
			"g.gamemode as gamemode",
			"g.playersstatus as playsersstatus",
			"gu.iduser as iduser",
		])
		.getRawMany();

		var filterArray = data.reduce((thing, current) => {
			const x = thing.find(item => item.id === current.id);
			if (!x) {
			  return thing.concat([current]);
			} else {
				if (!x.iduser2)
					x.iduser2 = current.iduser;
				return thing;
			}
		  }, []);

		filterArray.forEach(raw => {
			result.push({
				id: raw.id,
				status: raw.status,
				gamemode: raw.gamemode,
				playersstatus: raw.playersstatus,
				iduser1: raw.iduser,
				iduser2: raw.iduser2,
			});
		});

		return (result);
	}

	async deleteUserFromGame(idSocket: string) {
		logger()
		const user: GameUserSocketEntity = await GameUserSocketEntity.findOne({
			where: {
				socket: idSocket,
			}
		});
		if (user) {
			await GameUserSocketEntity.delete({
				id: user.id,
			});

			await GameUserEntity.delete({
				iduser: user.iduser,
				idgame: user.idgame,
			});
		}
	}
 }
