import {
	BaseEntity,
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn
} from "typeorm";
import { GameServeurSocketEntity } from "./gameserversocker.entity";
import { GameUserEntity } from "./gameuser.entity";
import { GameUserSocketEntity } from "./gameusersocker.entity";
import { SocketEntity } from "./socket.entity";
import { UserEntity } from "./user.entity";

export enum gameStatus {
    INWAITING = "waiting",
    INPROGRESS = "progress",
    MATCHMAKING = "matchmaking",
    FINISH = "finish"
}

export enum gameMode {
    NORMAL = "normal",
    ADVANCE = "advanced"
}

export enum playersStatus {
    NONE = "none",
    ONE = "one",
    BOTH = "both"
}

@Entity()
export class GameEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "enum",
        enum: gameStatus,
        default: gameStatus.INWAITING
    })
    status: gameStatus;

    @Column({
        type: "enum",
        enum: gameMode,
        default: gameMode.NORMAL
    })
    gamemode: gameMode;

    @Column()
    options: number;

    @Column({
        type: "enum",
        enum: playersStatus,
        default: playersStatus.NONE
    })
    playersstatus: playersStatus;

    @OneToMany(() => GameUserEntity, user => user.game)
    user: GameUserEntity;

    @OneToMany(() => GameUserSocketEntity, user => user.game)
    usersocket: GameUserSocketEntity;

}
