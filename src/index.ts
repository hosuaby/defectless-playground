import {ConfigSchema, ZConfigSchema} from './config-schema';
import { promises as fs } from 'fs';
import * as path from 'path';
import {failure, Outcome, success} from 'defectless';
import * as core from 'zod/v4/core';

class FsError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
  }
}

class JsonParsingError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
  }
}

class ValidationError extends Error {
  constructor(message: string, issues: core.$ZodIssue[]) {
    super(message, { cause: issues });
  }
}

async function loadConfigFile_promise(filename: string): Promise<ConfigSchema> {
  const content = await fs.readFile(filename, 'utf-8');
  const json = JSON.parse(content);
  return ZConfigSchema.parse(json);
}

function readTextFile(filename: string): Outcome<string, FsError> {
  return Outcome.fromSupplier(
    () => fs.readFile(filename, 'utf-8'),
    (err) => new FsError(`Failed to read file ${filename}`, err),
  );
}

const parseJson: (content: string) => Outcome<any, JsonParsingError> = Outcome.fromFunction(
  (c) => JSON.parse(c),
  (err) => new JsonParsingError('Failed to parse JSON content', err),
);

function validateConfig(json: any): Outcome<any, ValidationError> {
  const parseResult = ZConfigSchema.safeParse(json);

  if (parseResult.success) {
    return success(json);
  } else {
    return failure(new ValidationError('Config validation failed', parseResult.error.issues));
  }
}

function loadConfigFile_outcome(filename: string): Outcome<ConfigSchema, FsError | JsonParsingError | ValidationError> {
  return readTextFile(filename)
    .flatMap(parseJson)
    .through(validateConfig);
}

const scriptDir = path.dirname(process.argv[1]);
const configFile = path.join(scriptDir, 'default.config.json');

// const config = await loadConfigFile_promise(configFile);
// console.dir(config);

await loadConfigFile_outcome(configFile).match(
  config => console.dir(config),
  err => console.error(err),
  defect => console.error(defect),
);
