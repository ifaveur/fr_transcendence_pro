import {
	BaseEntity,
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from "typeorm";
import { MpMsgEntity } from "./mpmsg.entity";
import { MpUserEntity } from "./mpuser.entity";
import { UserEntity } from "./user.entity";

@Entity()
export class MpEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(() => MpUserEntity, mpuser => mpuser.mp)
    mpuser: MpUserEntity;

    @OneToMany(() => MpMsgEntity, msg => msg.mp)
    mpmsg: MpMsgEntity;
}