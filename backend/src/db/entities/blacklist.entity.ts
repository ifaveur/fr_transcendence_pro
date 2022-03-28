import {
	BaseEntity,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryColumn
} from "typeorm";
import { UserEntity } from "./user.entity";

@Entity()
export class BlackListEntity extends BaseEntity {
    @PrimaryColumn()
    iduser: number;

    @PrimaryColumn()
    iduserblocked: number;

    @ManyToOne(() => UserEntity, user => user.user1)
    @JoinColumn({name: "iduser"})
    user: UserEntity;

    @ManyToOne(() => UserEntity, user => user.user2)
    @JoinColumn({name: "iduserblocked"})
    userblocked: UserEntity;
}