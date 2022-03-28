import { BaseEntity, Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { GameChatEntity } from "./gamechat.entity";
import { UserEntity } from "./user.entity";

@Entity()
export class GameChatMsgEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    idchatgame: number;

    @Column()
    iduser: number;

    @Column()
    message: string;

    @UpdateDateColumn({type: "timestamp"})
    updatedat: Date;

    @ManyToOne(() => UserEntity, user => user.gamemsg)
    @JoinColumn({name: "iduser"})
    user: UserEntity;

    @ManyToOne(() => GameChatEntity, chat => chat.msg)
    @JoinColumn({name: "idchatgame"})
    chatgame: GameChatEntity

}