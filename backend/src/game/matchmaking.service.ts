import { Injectable } from "@nestjs/common";
import { logger } from "src/global-var/global-var.service";
import { SocketService } from "src/user/socket/socket.service";
import { MatchMakingEntity } from "src/db/entities/matchmaking.entity";

@Injectable()
export class MatchMakingService {
    constructor(
		private sock: SocketService,
	) {}

    async insert(socket: string, userID: number) {
        const matchmakingEntity : MatchMakingEntity = MatchMakingEntity.create();
        matchmakingEntity.iduser = userID;
        matchmakingEntity.socket = socket;

		await matchmakingEntity.save();
		return matchmakingEntity;
    }

    async deleteByUserID(idUser: number) {
        await MatchMakingEntity.delete({
            iduser: idUser,
        });
    }

    async delete(id: number) {
        await MatchMakingEntity.delete({
            id: id,
        });
    }

	async deleteBySocketID(socketID: string) {
        await MatchMakingEntity.delete({
            socket: socketID,
        });
    }

	async deleteAll() {
		var test = await this.getAll();
		for (var t of test) {
			await MatchMakingEntity.delete({
				id: t.id
			});
		}
	}


    async getByUserID(idUser: number) {
        return await MatchMakingEntity.findOne({where : {iduser: idUser}});
    }

	async getAll() {
		return await MatchMakingEntity.find();
	}
}