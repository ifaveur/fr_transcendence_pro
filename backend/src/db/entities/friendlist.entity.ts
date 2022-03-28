import { BaseEntity, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity()
export class FriendListEntity extends BaseEntity {
    @PrimaryColumn()
    iduser: number;

    @PrimaryColumn()
    idfrienduser: number;

    @ManyToOne(() => UserEntity, user => user.frienduser1)
    @JoinColumn({name: "iduser"})
    user: UserEntity;

    @ManyToOne(() => UserEntity, user => user.frienduser2)
    @JoinColumn({name: "idfrienduser"})
    frienduser: UserEntity;
}