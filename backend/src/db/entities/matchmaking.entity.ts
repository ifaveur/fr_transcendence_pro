import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity()
export class MatchMakingEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    iduser: number;

    @Column()
    socket: string;

    @ManyToOne(() => UserEntity, user => user.socketuser)
    @JoinColumn({name: "iduser"})
    user: UserEntity;
}