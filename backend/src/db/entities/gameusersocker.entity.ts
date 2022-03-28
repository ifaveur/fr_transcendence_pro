import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GameEntity } from "./game.entity";
import { UserEntity } from "./user.entity";

@Entity()
export class GameUserSocketEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    idgame: number;

    @Column()
    iduser: number;

    @Column()
    socket: string;

    @ManyToOne(() => UserEntity, user => user.gameusersocket)
    @JoinColumn({name: "iduser"})
    user: UserEntity;
    
    @ManyToOne(() => GameEntity, game => game.usersocket)
    @JoinColumn({name: "idgame"})
    game: GameEntity;
}