import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MpEntity } from "./mp.entity";
import { UserEntity } from "./user.entity";

@Entity()
export class MpMsgEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    idmp: number;

    @Column()
    iduser: number;

    @Column()
    message: string;

    @UpdateDateColumn({type: "timestamp"})
    date: Date;

    @ManyToOne(() => UserEntity, user => user.mpmsguser)
    @JoinColumn({name: "iduser"})
    user: UserEntity;

    @ManyToOne(() => MpEntity, mp => mp.mpmsg)
    @JoinColumn({name: "idmp"})
    mp: MpEntity;

}