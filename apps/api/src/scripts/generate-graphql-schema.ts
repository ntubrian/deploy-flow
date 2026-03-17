import { printSchema } from 'graphql';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { getGraphqlSchema } from '../graphql/schema';

const outputPath = resolve(process.cwd(), '../../graphql/schema.graphql');
const currentSchema = existsSync(outputPath)
  ? readFileSync(outputPath, 'utf8')
  : '';
const nextSchema = `${printSchema(getGraphqlSchema())}\n`;

mkdirSync(dirname(outputPath), { recursive: true });

if (currentSchema !== nextSchema) {
  writeFileSync(outputPath, nextSchema, 'utf8');
}

console.log(`Generated GraphQL schema at ${outputPath}`);
