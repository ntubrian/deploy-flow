import {
  buildCursorConnection,
  decodeCursor,
  encodeCursor,
  resolvePageSize,
} from './pagination';

describe('catalog pagination helpers', () => {
  it('encodes and decodes cursors', () => {
    const createdAt = new Date('2026-03-17T12:00:00.000Z');
    const cursor = encodeCursor({
      createdAt,
      id: 'organization-1',
    });

    expect(decodeCursor(cursor)).toEqual({
      createdAt: createdAt.toISOString(),
      id: 'organization-1',
    });
  });

  it('builds a connection with hasNextPage when extra rows exist', () => {
    const connection = buildCursorConnection(
      [
        {
          createdAt: new Date('2026-03-17T12:00:00.000Z'),
          id: 'item-3',
        },
        {
          createdAt: new Date('2026-03-17T11:00:00.000Z'),
          id: 'item-2',
        },
        {
          createdAt: new Date('2026-03-17T10:00:00.000Z'),
          id: 'item-1',
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
});
