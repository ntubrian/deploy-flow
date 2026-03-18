import { GraphQLError } from 'graphql';
import { Brackets, type ObjectLiteral, type SelectQueryBuilder } from 'typeorm';

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 50;

export interface CatalogPageArguments {
  after?: string | null;
  categoryId?: string | null;
  first?: number | null;
  keyword?: string | null;
}

export interface DecodedCursor {
  createdAt: string;
  id: string;
}

export interface CursorRecord<TNode> {
  cursor: DecodedCursor;
  node: TNode;
}

export interface ConnectionEdge<TNode> {
  cursor: string;
  node: TNode;
}

export interface ConnectionPageInfo {
  endCursor: string | null;
  hasNextPage: boolean;
}

export interface CursorConnection<TNode> {
  edges: ConnectionEdge<TNode>[];
  pageInfo: ConnectionPageInfo;
}

export function normalizeKeyword(rawKeyword?: string | null): string | undefined {
  const trimmedKeyword = rawKeyword?.trim();

  return trimmedKeyword ? trimmedKeyword : undefined;
}

export function normalizeCategoryId(rawCategoryId?: string | null): string | undefined {
  const trimmedCategoryId = rawCategoryId?.trim();

  return trimmedCategoryId ? trimmedCategoryId : undefined;
}

export function resolvePageSize(first?: number | null): number {
  if (first === null || first === undefined) {
    return DEFAULT_PAGE_SIZE;
  }

  if (!Number.isInteger(first) || first < 1) {
    throw new GraphQLError('`first` must be a positive integer.');
  }

  return Math.min(first, MAX_PAGE_SIZE);
}

export function encodeCursor(cursor: DecodedCursor): string {
  return Buffer.from(
    JSON.stringify({
      createdAt: cursor.createdAt,
      id: cursor.id,
    }),
    'utf8'
  ).toString('base64url');
}

export function decodeCursor(cursor?: string | null): DecodedCursor | null {
  if (!cursor) {
    return null;
  }

  try {
    const decodedCursor = JSON.parse(
      Buffer.from(cursor, 'base64url').toString('utf8')
    ) as Partial<DecodedCursor>;

    if (
      !decodedCursor.createdAt ||
      Number.isNaN(Date.parse(decodedCursor.createdAt)) ||
      !decodedCursor.id
    ) {
      throw new Error('Cursor payload is incomplete.');
    }

    return {
      createdAt: decodedCursor.createdAt,
      id: decodedCursor.id,
    };
  } catch (error) {
    throw new GraphQLError('Invalid cursor.', {
      originalError: error instanceof Error ? error : undefined,
    });
  }
}

export function applyCursorPagination<TNode extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<TNode>,
  alias: string,
  cursor: DecodedCursor | null
): void {
  if (!cursor) {
    return;
  }

  queryBuilder.andWhere(
    new Brackets((cursorQueryBuilder) => {
      cursorQueryBuilder
        .where(`${alias}.created_at < :cursorCreatedAt`, {
          cursorCreatedAt: cursor.createdAt,
        })
        .orWhere(
          `${alias}.created_at = :cursorCreatedAt AND ${alias}.id < :cursorId`,
          {
            cursorCreatedAt: cursor.createdAt,
            cursorId: cursor.id,
          }
        );
    })
  );
}

export function buildCursorConnection<TNode>(
  records: CursorRecord<TNode>[],
  pageSize: number
): CursorConnection<TNode> {
  const hasNextPage = records.length > pageSize;
  const pagedRecords = hasNextPage ? records.slice(0, pageSize) : records;
  const edges = pagedRecords.map((record) => ({
    cursor: encodeCursor(record.cursor),
    node: record.node,
  }));

  return {
    edges,
    pageInfo: {
      endCursor: edges.at(-1)?.cursor ?? null,
      hasNextPage,
    },
  };
}

export function buildPreciseCursorTimestampSelect(alias: string): string {
  return `TO_CHAR(${alias}.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`;
}
