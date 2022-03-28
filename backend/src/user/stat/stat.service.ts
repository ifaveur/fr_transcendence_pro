import { Injectable } from "@nestjs/common";
import { UserEntity } from "src/db/entities/user.entity";
import { UserStatEntity } from "src/db/entities/userstat.entity";
import { UpdateStatDto } from "./dto/updateState.dto";

@Injectable()
export class StatService {
    constructor(

    ) {}

    async init(iduser: number) {
        const newstat: UserStatEntity = UserStatEntity.create();

        newstat.iduser = iduser;

        await newstat.save();
        return newstat;
    }

    async getUserStat(iduser: number) {
        return await UserStatEntity.findOne({
            where: {
                iduser: iduser,
            }
        })
    }

    async getAllUserStat() {
        return await UserStatEntity.find({
            relations: ["user"],
        })
    }

    async getAllUserStatSorted() {
        return await UserStatEntity.createQueryBuilder("us")
        .leftJoinAndSelect(UserEntity, "use", "us.iduser = use.id")
        .select(["use.name as name"
        , "us.ratio as ratio"
        , "use.image_url as img"
        , "us.nbvictory as nbvictory"
        , "us.nblose as defeat"
        , "us.nbgameplayed as nbgameplayed"
        , "us.lv as lv"])
        .orderBy("ratio", "DESC")
        .getRawMany();
    }

    async updateStat(data: UpdateStatDto) {
        const stat: UserStatEntity = await UserStatEntity.findOne({
            where: {
                iduser: data.iduser,
            }
        });

        stat.nbgameplayed += 1;

        if (data.iswin) {
            if (stat.nbvictory === 0 || stat.maxwingap < data.gap) {
                stat.maxwingap = data.gap;
            }
            if (stat.nbvictory === 0 || stat.minwingap > data.gap) {
                stat.minwingap = data.gap;
            }
            stat.nbvictory += 1;
            stat.ratio += 10;

        }
        else {
            if (stat.nblose === 0 || stat.maxlosegap < data.gap) {
                stat.maxlosegap = data.gap;
            }
            if (stat.nblose === 0 || stat.minlosegap > data.gap) {
                stat.minlosegap = data.gap;
            }
            stat.nblose += 1;
            stat.ratio -= 10;
        }

        stat.xp += data.xpgain;
        if (stat.xp >= 100) {
            stat.xp -= 100;
            stat.lv += 1;
        }

        await stat.save();
        return stat;
    }


}