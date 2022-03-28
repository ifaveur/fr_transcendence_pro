import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { GameEntity } from "./game.entity";
import { UserEntity } from "./user.entity";

@Entity()
export class GameServeurSocketEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    idgame: number;

    @Column()
    socket: string;
    
    @OneToOne(() => GameEntity)
    @JoinColumn({name: "idgame"})
    game: GameEntity;
}