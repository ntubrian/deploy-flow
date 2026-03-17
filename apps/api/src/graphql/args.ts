import { ArgsType, Field, ID, Int } from 'type-graphql';

@ArgsType()
export class CatalogConnectionArgs {
  @Field(() => String, {
    description: 'Return records after this cursor.',
    nullable: true,
  })
  after?: string | null;

  @Field(() => ID, {
    description: 'Category id filter. Omit or pass null to include all records.',
    nullable: true,
  })
  categoryId?: string | null;

  @Field(() => Int, {
    description: 'Maximum number of records to return. Defaults to 12 and caps at 50.',
    nullable: true,
  })
  first?: number | null;

  @Field(() => String, {
    description: 'Keyword filter applied to title and organization-related text.',
    nullable: true,
  })
  keyword?: string | null;
}
