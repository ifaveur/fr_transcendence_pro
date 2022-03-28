import {
	BaseEntity,
	Column,
	Entity,
	JoinColumn,
	ManyToMany,
	OneToMany,
	PrimaryGeneratedColumn
} from "typeorm";
import { ChatAdminEntity } from "./chatadmin.entity";
import { ChatMsgEntity } from "./chatmsg.entity";
import { ChatUserEntity } from "./chatuser.entity";

@Entity()
export class ChatEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    islocked: boolean;

    @Column({
        nullable: true,
    })
    password: string;

	@Column({
        default: false,
    })
    isprivate: boolean;

    @OneToMany(() => ChatMsgEntity, msg => msg.chat)
    chatmsg: ChatMsgEntity;

    @OneToMany(() => ChatAdminEntity, admin => admin.chat)
    admin: ChatAdminEntity;
    
    @OneToMany(() => ChatUserEntity, chatinfo => chatinfo.user)
    chatuserinfo: ChatUserEntity;

}