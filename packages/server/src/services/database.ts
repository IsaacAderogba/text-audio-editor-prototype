import { EntityAPI, EntityRecord } from "@taep/core";
import fsSync from "fs";
import fs from "fs/promises";
import { merge, omit } from "lodash-es";
import path from "path";

async function readJSONFile<T>(pathname: string) {
  try {
    return JSON.parse(await fs.readFile(pathname, "utf-8")) as T;
  } catch {
    return null;
  }
}

async function writeJSONFile<T>(pathname: string, data: T) {
  await fs.writeFile(pathname, JSON.stringify(data), "utf-8");
  return data;
}

export const createDatabaseAdapter = <T extends keyof EntityRecord>(
  type: T
): EntityAPI<EntityRecord[T]> => {
  const entityDir = path.join("..", __dirname, "database", type);
  fsSync.mkdirSync(entityDir, { recursive: true });

  return {
    read: async id => {
      return await readJSONFile<EntityRecord[T]>(path.join(entityDir, `${id}.json`));
    },
    list: async () => {
      try {
        const files = await fs.readdir(entityDir, { recursive: true });
        const entities: EntityRecord[T][] = [];

        for (const file of files) {
          if (path.extname(file) !== ".json") continue;
          const data = await readJSONFile<EntityRecord[T]>(path.join(entityDir, file));

          if (data) entities.push(data);
        }

        return entities;
      } catch (err) {
        console.log(`❌ error reading dir`, err);
        return [];
      }
    },
    create: async entity => {
      await writeJSONFile(path.join(entityDir, `${entity.id}.json`), entity);
      return entity;
    },
    update: async (id, input) => {
      const previousEntity = await readJSONFile<EntityRecord[T]>(
        path.join(entityDir, `${id}.json`)
      );
      if (!previousEntity) {
        throw new Error(`Failed to update '${type}' data.`);
      }

      const entity = merge(previousEntity, omit(input, "id", "type"));

      await writeJSONFile(path.join(entityDir, `${entity.id}.json`), entity);
      return entity;
    },
    delete: async id => {
      const entity = await readJSONFile<EntityRecord[T]>(path.join(entityDir, `${id}.json`));
      if (!entity) return;

      await fs.rm(path.join(entityDir, `${id}.json`), { force: true });
    }
  };
};
