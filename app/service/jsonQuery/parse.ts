import { leftAssociativeOperators, operators, varargOperators } from './operators';
import {
  startsWithIntRegex,
  startsWithKeywordRegex,
  startsWithNumberRegex,
  startsWithStringRegex,
  startsWithUnquotedPropertyRegex,
  startsWithWhitespaceRegex
} from './regexps';
import type { JSONQuery, OperatorGroup } from './types';

export function parse(query: string): JSONQuery {
  const allOperatorsMap = Object.assign({}, ...operators);

  const parseOperator = (precedenceLevel = operators.length - 1) => {
    const currentOperators = operators[precedenceLevel];
    if (!currentOperators) {
      return parseParenthesis();
    }

    const leftParenthesis = query[i] === '(';
    let left = parseOperator(precedenceLevel - 1)

    while (true) {
      skipWhitespace();

      if (query[i] === '.' && 'pipe' in currentOperators) {
        // an implicitly piped property like "fn().prop"
        const right = parseProperty();
        left = left[0] === 'pipe' ? [...left, right] : ['pipe', left, right];
        continue;
      }

      const start = i;  
      const name = parseOperatorName(currentOperators);
      if (!name) {
        break;
      }

      const right = parseOperator(precedenceLevel - 1);

      const childName = left[0];
      const chained = name === childName && !leftParenthesis;
      if (chained && !leftAssociativeOperators.includes(allOperatorsMap[name])) {
        i = start;
        break; 
      }

      left =
        chained && varargOperators.includes(allOperatorsMap[name])
          ? [...left, right]
          : [name, left, right];
    }

    return left;
  }

  const parseOperatorName = (currentOperators: OperatorGroup): string | undefined => {
    // we sort the operators from longest to shortest, so we first handle "<=" and next "<"
    const sortedOperatorNames = Object.keys(currentOperators).sort((a, b) => b.length - a.length);

    for (const name of sortedOperatorNames) {
      const op = currentOperators[name];
      if (query.substring(i, i + op.length) === op) {
        i += op.length;

        skipWhitespace();

        return name;
      }
    }

    return undefined
  }

  const parseParenthesis = () => {
    skipWhitespace();

    if (query[i] === '(') {
      i++;
      const inner = parseOperator();
      eatChar(')');
      return inner;
    }

    return parseProperty(); 
  }

  const parseProperty = () => {
    if (query[i] === '.') {
      const props = [];

      while (query[i] === '.') {
        i++;

        props.push(
          parseString() ??
            parseUnquotedString() ??
            parseInteger() ??
            throwSyntaxError('Property expected')
        );

        skipWhitespace();
      }

      return ['get', ...props];
    }

    return parseFunction();
  }

  const parseFunction = () => {
    const start = i;
    const name = parseUnquotedString();
    skipWhitespace();
    if (!name || query[i] !== '(') {
      i = start;
      return parseObject();
    }
    i++;

    skipWhitespace();

    const args = query[i] !== ')' ? [parseOperator()] : [];
    while (i < query.length && query[i] !== ')') {
      skipWhitespace();
      eatChar(',');
      args.push(parseOperator());
    }

    eatChar(')');

    return [name, ...args];
  }

  const parseObject = () => {
    if (query[i] === '{') {
      i++;
      skipWhitespace();

      const object = {};
      let first = true;
      while (i < query.length && query[i] !== '}') {
        if (first) {
          first = false;
        } else {
          eatChar(',');
          skipWhitespace();
        }

        const key =
          parseString() ??
          parseUnquotedString() ??
          parseInteger() ??
          throwSyntaxError('Key expected');

        skipWhitespace();
        eatChar(':');

        object[key] = parseOperator();
      }

      eatChar('}');

      return ['object', object];
    }

    return parseArray();
  }

  const parseArray = () => {
    if (query[i] === '[') {
      i++;
      skipWhitespace();

      const array = [];

      let first = true;
      while (i < query.length && query[i] !== ']') {
        if (first) {
          first = false;
        } else {
          eatChar(','); 
          skipWhitespace();
        }

        array.push(parseOperator());
      }

      eatChar(']');

      return ['array', ...array];
    }

    return parseString() ?? parseNumber() ?? parseKeyword();
  }

  const parseString = () => parseRegex(startsWithStringRegex, JSON.parse);

  const parseUnquotedString = () => parseRegex(startsWithUnquotedPropertyRegex, (text) => text);

  const parseNumber = () => parseRegex(startsWithNumberRegex, JSON.parse);

  const parseInteger = () => parseRegex(startsWithIntRegex, JSON.parse);

  const parseKeyword = () => {
    const keyword = parseRegex(startsWithKeywordRegex, JSON.parse);
    if (keyword !== undefined) {
      return keyword;
    }

    // end of the parsing chain
    throwSyntaxError('Value expected');
  }

  const parseEnd = () => {
    skipWhitespace();

    if (i < query.length) {
      throwSyntaxError(`Unexpected part '${query.substring(i)}'`);
    }
  }

  const parseRegex = <T = string>(regex: RegExp, callback: (match: string) => T): T | undefined => {
    const match = query.substring(i).match(regex);
    if (match) {
      i += match[0].length;
      return callback(match[0]);
    }
  }

  const skipWhitespace = () => parseRegex(startsWithWhitespaceRegex, (text) => text);

  const eatChar = (char: string) => {
    if (query[i] !== char) {
      throwSyntaxError(`Character '${char}' expected`);
    }
    i++;
  }

  const throwSyntaxError = (message: string, pos = i) => {
    throw new SyntaxError(`${message} (pos: ${pos})`);
  }

  let i = 0;
  const output = parseOperator();
  parseEnd();

  return output;
}