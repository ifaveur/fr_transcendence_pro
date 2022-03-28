import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";
import { GameEntity } from "src/db/entities/game.entity";

@Entity()
export class SocketEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    iduser: number;

    @Column()
    socketid: string;

	@Column({
		nullable: true,
		default: -1,
	})
    chatid: number;

	@Column({
		nullable: true,
		default: -1,
	})
    mpid: number;

	@Column({
		nullable: true,
		default: -1,
	})
    gamechatid: number;

    @Column({
		nullable: true,
        default: 1,
	})
    interface: number;

    @ManyToOne(() => UserEntity, user => user.socketuser)
    @JoinColumn({name: "iduser"})
    user: UserEntity;
}