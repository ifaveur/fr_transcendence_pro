import { BaseEntity, Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { GameEntity } from "./game.entity";
import { GameChatMsgEntity } from "./gamechatmsg.entity";

@Entity()
export class GameChatEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    idgame: number;

    @OneToOne(() => GameEntity)
    @JoinColumn({name: "idgame"})
    game: GameEntity;

    @OneToMany(() => GameChatMsgEntity, gamemsg => gamemsg.chatgame)
    msg: GameChatMsgEntity;
}