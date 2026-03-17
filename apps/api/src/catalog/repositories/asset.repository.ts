import { DataSource, In, Repository } from 'typeorm';

import { AssetEntity } from '../../database/entities/asset.entity';

export class AssetRepository {
  private readonly repository: Repository<AssetEntity>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(AssetEntity);
  }

  async findByIds(ids: readonly string[]): Promise<AssetEntity[]> {
    if (ids.length === 0) {
      return [];
    }

    return this.repository.findBy({
      id: In([...ids]),
    });
  }
}
