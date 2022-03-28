import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MpEntity } from "./mp.entity";
import { UserEntity } from "./user.entity";

@Entity()
export class MpUserEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    idmp: number;
    
    @Column()
    iduser: number;

    @ManyToOne(() => MpEntity, mp => mp.mpuser)
    @JoinColumn({name: "idmp"})
    mp: UserEntity;

    @ManyToOne(() => UserEntity, user => user.mpuser)
    @JoinColumn({name: "iduser"})
    user: UserEntity;
}