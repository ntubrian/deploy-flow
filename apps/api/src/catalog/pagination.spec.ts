import {
  buildCursorConnection,
  buildPreciseCursorTimestampSelect,
  decodeCursor,
  encodeCursor,
  resolvePageSize,
} from './pagination';

describe('catalog pagination helpers', () => {
  it('encodes and decodes cursors', () => {
    const cursor = encodeCursor({
      createdAt: '2026-03-17T12:00:00.123456Z',
      id: 'organization-1',
    });

    expect(decodeCursor(cursor)).toEqual({
      createdAt: '2026-03-17T12:00:00.123456Z',
      id: 'organization-1',
    });
  });

  it('builds a connection with hasNextPage when extra rows exist', () => {
    const connection = buildCursorConnection(
      [
        {
          cursor: {
            createdAt: '2026-03-17T12:00:00.123456Z',
            id: 'item-3',
          },
          node: {
            id: 'item-3',
          },
        },
        {
          cursor: {
            createdAt: '2026-03-17T11:00:00.123456Z',
            id: 'item-2',
          },
          node: {
            id: 'item-2',
          },
        },
        {
          cursor: {
            createdAt: '2026-03-17T10:00:00.123456Z',
            id: 'item-1',
          },
          node: {
            id: 'item-1',
          },
        },
      ],
      2
    );

    expect(connection.edges).toHaveLength(2);
    expect(connection.pageInfo.hasNextPage).toBe(true);
    expect(connection.pageInfo.endCursor).toBe(connection.edges[1]?.cursor ?? null);
  });

  it('caps page size at the supported maximum', () => {
    expect(resolvePageSize(999)).toBe(50);
  });

  it('builds a precise timestamp select for database cursors', () => {
    expect(buildPreciseCursorTimestampSelect('organization')).toBe(
      `TO_CHAR(organization.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`
    );
  });
});
