import {failure, Outcome, Program, program, success, SyncOutcome, SyncProgram} from 'defectless';

class CacheError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
  }
}

class DbError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
  }
}

type Document = Record<string, any>;

function cacheContains(id: number): Outcome<boolean, CacheError> {
  return id === 42 ? success(true) : success(false);
}

function getFromCache(id: number): Outcome<Document, CacheError> {
  return id === 42
    ? success({ id: 42 })
    : failure(new CacheError(`Cache doesn't have document with id ${id}`));
}

function putIntoCache(id: number, doc: Document): Outcome<Document, CacheError> {
  return success(doc);
}

function getFromDb(id: number): Outcome<Document, DbError> {
  return success({ id });
}

function loadDocument(id: number): Outcome<Document, CacheError | DbError> {
  return program(
    function* (): Program<Document, CacheError | DbError> {
      const docIdCache: boolean = yield cacheContains(id);

      if (docIdCache) {
        return getFromCache(id);
      }

      const document: Document = yield getFromDb(id);
      return putIntoCache(id, document);
    }
  );
}

class MathError extends Error {
  constructor(message: string) {
    super(message);
  }
}

function safeDivision(dividend: number, divisor: number): SyncOutcome<number, MathError> {
  return program(
    function* (): SyncProgram<number, MathError> {
      if (divisor === 0) {
        yield failure(new MathError('Cannot divide by zero'));
      }

      const result: number = dividend / divisor;
      return success(result);
    }
  );
}

await loadDocument(42).match(
  doc => console.dir(doc),
  err => console.error(err),
  defect => console.error(defect),
);

safeDivision(10, 2).matchSync(
  res => console.log(res),
  err => console.error(err),
  defect => console.error(defect),
)
