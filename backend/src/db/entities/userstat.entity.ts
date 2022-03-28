import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity()
export class UserStatEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    iduser: number;

    @Column({
        default: 0
    })
    lv: number;

    @Column({
        default: 0
    })
    xp: number;

    @Column({
        default: 0
    })
    nbgameplayed: number;

    @Column({
        default: 0
    })
    nbvictory: number;

    @Column({
        default: 0
    })
    nblose: number;

    @Column({
        default: 0
    })
    ratio: number;

    @Column({
        default: 0
    })
    maxwingap: number;

    @Column({
        default: 0
    })
    minwingap: number;

    @Column({
        default: 0
    })
    maxlosegap: number;

    @Column({
        default: 0
    })
    minlosegap: number;

    @OneToOne(() => UserEntity)
    @JoinColumn({name: "iduser"})
    user: UserEntity
}