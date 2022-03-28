import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GameEntity } from "./game.entity";
import { UserEntity } from "./user.entity";



@Entity()
export class GameUserEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    idgame: number;

    @Column()
    iduser: number;

    @Column({
        default: 0,
    })
    score: number;

    @ManyToOne(() => UserEntity, user => user.gameuser)
    @JoinColumn({name: "iduser"})
    user: UserEntity;

    @ManyToOne(() => GameEntity, game => game.user)
    @JoinColumn({name: "idgame"})
    game: UserEntity;
}