import {
	BaseEntity,
	Column,
	Entity, JoinColumn,
	ManyToMany,
	ManyToOne,
	PrimaryColumn,
	UpdateDateColumn,
} from "typeorm";
import { ChatEntity } from "./chat.entity";
import { UserEntity } from "./user.entity";

export enum chatUserStatus {
    MUTE = "mute",
    BAN = "ban",
    NONE = "none"
}

@Entity()
export class ChatUserEntity extends BaseEntity {
    @PrimaryColumn()
    userid: number;

    @PrimaryColumn()
    chatid: number;

    @Column({
        type: "enum",
        enum: chatUserStatus,
        default: chatUserStatus.NONE
    })
    status: chatUserStatus;

    @Column({
        default: 0,
    })
    time: number;

    @UpdateDateColumn({type: "timestamp"})
    updatedat: Date;

    @ManyToOne(() => UserEntity, user => user.chatuserinfo)
    @JoinColumn({name: "userid"})
    user: UserEntity;

    @ManyToOne(() => ChatEntity, chat => chat.chatuserinfo)
    @JoinColumn({name: "chatid"})
    chat: ChatEntity;

}