
import { compile } from './compile';
import { isString } from './is';
import { parse } from './parse';
import type { JSONQuery } from './types';
export { buildFunction } from './functions';

export function performJsonLookup(
  data: unknown,
  query: string | JSONQuery
): unknown {
  return compile(isString(query) ? parse(query) : query)(data);
}


export type {
  CustomOperator,
  Fun,
  FunctionBuilder,
  FunctionBuildersMap,
  JSONPath,
  JSONProperty,
  JSONQuery,
  JSONQueryFunction,
  JSONQueryObject,
  JSONQueryPrimitive,
  JSONQueryProperty,
  JSONQueryPipe,
} from './types';
