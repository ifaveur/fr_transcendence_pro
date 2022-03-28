import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	PrimaryGeneratedColumn
} from "typeorm";
import { ChatEntity } from "./chat.entity";
import { UserEntity } from "./user.entity";


@Entity()
export class ChatMsgEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    message: string;

    @CreateDateColumn({type: "timestamp"})
    createdat: Date;

    @ManyToOne(() => UserEntity, user => user.chatmsg)
    @JoinColumn({name: "userid"})
    user: UserEntity;

    @Column()
    public userid: number;

    @ManyToOne(() => ChatEntity, chat => chat.chatmsg)
    @JoinColumn({name: "chatid"})
    chat: ChatEntity;

    @Column()
    public chatid: number;
}