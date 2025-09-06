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

type Doc = Record<string, any>;

function cacheContains(id: number): Promise<boolean> {
  return id === 42 ? Promise.resolve(true) : Promise.resolve(false);
}

function getFromCache(id: number): Promise<Doc> {
  if (id === 42) {
    return Promise.resolve({ id: 42 });
  } else {
    throw new CacheError(`Cache doesn't have document with id ${id}`);
  }
}

function putIntoCache(id: number, doc: Doc): Promise<Doc> {
  return Promise.resolve(doc);
}

function getFromDb(id: number): Promise<Doc> {
  return Promise.resolve({ id });
}

async function loadDocument(id: number): Promise<Doc> {
  const docIdCache: boolean = await cacheContains(id);

  if (docIdCache) {
    return getFromCache(id);
  }

  const document: Doc = await getFromDb(id);
  return putIntoCache(id, document);
}

const doc = await loadDocument(42);
console.dir(doc);

export {};
