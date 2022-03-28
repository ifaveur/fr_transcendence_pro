import { Injectable } from "@nestjs/common";
import { BlackListEntity } from "src/db/entities/blacklist.entity";
import { MpEntity } from "src/db/entities/mp.entity";
import { MpMsgEntity } from "src/db/entities/mpmsg.entity";
import { MpUserEntity } from "src/db/entities/mpuser.entity";
import { UserEntity } from "src/db/entities/user.entity";
import { logger } from "src/global-var/global-var.service";
import { In, Not } from "typeorm";
import { CreateMpRoomDto, InsertMpDto, NewMpDto } from "./dto/createmp.dto";


@Injectable()
export class MpService {
	constructor(
		
	) {}

    async createMpRoom(data: CreateMpRoomDto) {
        const mp: MpEntity = MpEntity.create();
        await mp.save();

        const mpuser1: MpUserEntity = MpUserEntity.create();
        const mpuser2: MpUserEntity = MpUserEntity.create();

        mpuser1.idmp = mp.id;
        mpuser1.iduser = data.iduser1;
        
        mpuser2.idmp = mp.id;
        mpuser2.iduser = data.iduser2;

        await mpuser1.save();
        await mpuser2.save();
		return mp
    }

    async insert(data: InsertMpDto) {
       
        const mpmsg: MpMsgEntity = MpMsgEntity.create();

        mpmsg.idmp = data.idmp;
        mpmsg.iduser = data.iduser;
        mpmsg.message = data.message;

        await mpmsg.save();
		return await MpMsgEntity.findOne({
            relations: ["user"],
            where: {
                id: mpmsg.id
            }
        })
    }

    async delete(id: number) {
        await MpMsgEntity.delete({idmp: id});
        await MpUserEntity.delete({idmp: id});
        await MpEntity.delete({id: id});
    }

    async getMpList(idUser: number) {
        const mpList: MpUserEntity[] = await MpUserEntity.find({
            where: {
                iduser: idUser
            }
        });

		const test: BlackListEntity[] = await BlackListEntity.find({where: {
			    iduser: idUser,
			}
		});
		var idBlockedUser:number[] = [];
		test.forEach(e => {
			idBlockedUser.push(e.iduserblocked);
		});
		idBlockedUser.push(idUser)
        const idmp: number[] = [];
        mpList.forEach(mp => {
            idmp.push(mp.idmp);
        });
        const userMpWith = await MpUserEntity.find({
            select: ["idmp", "user"],
            relations: ["user"],
            where: {
                idmp: In(idmp),
                iduser: Not(In(idBlockedUser))
            }
        })
        return userMpWith;
    }

    async getMpMsg(idMp: number) {
        const mpMsg: MpMsgEntity[] = await MpMsgEntity.find({
            relations: ["user"],
            where: {
                idmp: idMp
            },
            order: {
                date: "ASC"
            }
        });
        return mpMsg;
    }

	async getMPbyID(mpID: number) {
		return await MpUserEntity.find({
			where: {
				idmp: mpID
			}
		})
	}

	async findSecondUserID(mpID: number, firstID: number) {
		const mp = await this.getMPbyID(mpID)
        if (!mp)
            return firstID;
		if (mp[0].iduser != firstID)
			return mp[0].iduser
		else
			return mp[1].iduser
	}


	async getAvailableContacts(userID: number) {
		const mpList: MpUserEntity[] = await MpUserEntity.find({
            where: {
                iduser: userID
            }
        });

		const test: BlackListEntity[] = await BlackListEntity.find({where: {
			iduser: userID,
			}
		});
		var idBlockedUser:number[] = [];
		test.forEach(e => {
			idBlockedUser.push(e.iduserblocked);
		});
		idBlockedUser.push(userID)

        const idmp: number[] = [];
        mpList.forEach(mp => {
            idmp.push(mp.idmp);
        });

        const userMpWith = await MpUserEntity.find({
            where: {
                idmp: In(idmp),
            }
        })
		userMpWith.forEach(e => {
			idBlockedUser.push(e.iduser);
		});

		return await UserEntity.find({
			where: {
				id: Not(In(idBlockedUser)),
			}
		})
	}


}