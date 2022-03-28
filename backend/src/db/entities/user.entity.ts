import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from "typeorm";
import { BlackListEntity } from "./blacklist.entity";
import { ChatAdminEntity } from "./chatadmin.entity";
import { ChatMsgEntity } from "./chatmsg.entity";
import { ChatUserEntity } from "./chatuser.entity";
import { FriendListEntity } from "./friendlist.entity";
import { GameEntity } from "./game.entity";
import { GameChatMsgEntity } from "./gamechatmsg.entity";
import { GameUserEntity } from "./gameuser.entity";
import { GameUserSocketEntity } from "./gameusersocker.entity";
import { MpEntity } from "./mp.entity";
import { MpMsgEntity } from "./mpmsg.entity";
import { SocketEntity } from "./socket.entity";

export enum userStatus {
    ONLINE = "online",
    OFFLINE = "offline",
    INGAME = "ingame",
	GAMESTARTPAGE = "gamestartpage",
	SPECTATOR = "spectator",
    MATCHMAKING = 'matchmaking'
}

@Entity()
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    login: string;

    @Column({
    unique: true})
    name: string;

    @Column({
        nullable: true,
    })
    image_url: string;

    @Column({
        type: "enum",
        enum: userStatus,
        default: userStatus.OFFLINE
    })
    status: userStatus;

    @Column({
        unique: true
    })
    email: string;

    @Column({
        type: "boolean",
        default: false
    })
    is2FA: boolean;
    /*
    Waiting Ilann
    */
   @Column({
       nullable: true,
   })
   code2fa: string;


    @CreateDateColumn({type: "timestamp"})
    createdat: Date;

    @UpdateDateColumn({type: "timestamp"})
    updatedat: Date;

    @OneToMany(() => ChatMsgEntity, chatmsg => chatmsg.user)
    chatmsg: ChatMsgEntity;

    @OneToMany(() => ChatAdminEntity, admin => admin.user)
    admin: ChatAdminEntity;

    @OneToMany(() => ChatUserEntity, chatinfo => chatinfo.user)
    chatuserinfo: ChatUserEntity;

    @OneToMany(() => BlackListEntity, blacklist => blacklist.user)
    user1: BlackListEntity;

    @OneToMany(() => BlackListEntity, blacklist => blacklist.userblocked)
    user2: BlackListEntity;

    @OneToMany(() => FriendListEntity, friendlist => friendlist.user)
    frienduser1: FriendListEntity;

    @OneToMany(() => FriendListEntity, friendlist => friendlist.frienduser)
    frienduser2: FriendListEntity;

    @OneToMany(() => GameUserEntity, game => game.user)
    gameuser: GameEntity;

    @OneToMany(() => GameUserSocketEntity, game => game.user)
    gameusersocket: GameEntity;

    @OneToMany(() => MpMsgEntity, mp => mp.user)
    mpuser: MpEntity;

    @OneToMany(() => MpMsgEntity, mp => mp.user)
    mpmsguser: MpEntity;

    @OneToMany(() => SocketEntity, socket => socket.user)
    socketuser: SocketEntity;

    @OneToMany(() => GameChatMsgEntity, gamemsg => gamemsg.user)
    gamemsg: GameChatMsgEntity;

}