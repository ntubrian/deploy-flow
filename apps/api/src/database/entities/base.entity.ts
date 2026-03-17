import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseUuidEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;
}

export abstract class CreatedAtEntity extends BaseUuidEntity {
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;
}

export abstract class TimestampedEntity extends CreatedAtEntity {
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;
}
