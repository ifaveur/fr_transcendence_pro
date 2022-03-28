import {
	BaseEntity,
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryColumn
} from "typeorm";
import { ChatEntity } from "./chat.entity";
import { UserEntity } from "./user.entity";

@Entity()
export class ChatAdminEntity extends BaseEntity {
    @PrimaryColumn()
    userid: number;

    @PrimaryColumn()
    chatid: number;

    @Column('boolean', {
        default: true
    })
    istempo: boolean;

    @ManyToOne(() => UserEntity, user => user.admin)
    @JoinColumn({name: "userid"})
    user: UserEntity;

    @ManyToOne(() => ChatEntity, chat => chat.admin)
    @JoinColumn({name: "chatid"})
    chat: ChatEntity;
}