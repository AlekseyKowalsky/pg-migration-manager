import { Client, Pool } from 'pg';
import { IConfig, IMigration } from './types';
import * as fs from 'fs';
import * as path from 'path';

export default class MigrationManager {
    migrations: IMigration[];
    tableName: string;
    pathToMigrations: string;

    constructor(public connection: Pool | Client, config: IConfig) {
        this.tableName = config.migrationTableName || 'migrations';
        this.pathToMigrations = config.pathToMigrations;
    }

    private async getMigrations() {
        try {
            const fileNames = await fs.promises.readdir(this.pathToMigrations);

            const migrationPromises = fileNames.map(async fileName => {
                const filePath = path.resolve(this.pathToMigrations, fileName);
                const { birthtimeMs } = await fs.promises.stat(filePath);
                const { name: filename } = path.parse(fileName);
                return {
                    filename,
                    datetime: +(birthtimeMs / 1000).toFixed(),
                    script: await fs.promises.readFile(filePath, { encoding: 'utf8' }),
                };
            });
            this.migrations = (await Promise.all(migrationPromises)).sort(
                (a, b) => (a.datetime < b.datetime && -1) || 1
            );
        } catch (e) {
            throw new Error(`The error of migration files reading ---> ${e}`);
        }
    }

    private async createTable() {
        await this.connection.query(
            `create table if not exists ${this.tableName} 
                (id serial primary key, 
                name text not null, 
                datetime integer not null, 
                created date not null default now())`
        );
    }

    private async checkMigrationNameForExisting(name: string) {
        const { rowCount } = await this.connection.query(
            `select name from ${this.tableName} where name = '${name}'`
        );
        return !!rowCount;
    }

    public async runMigrations() {
        await this.createTable();
        await this.getMigrations();
        for await (const migration of this.migrations) {
            if (await this.checkMigrationNameForExisting(migration.filename))
                return new Error(`Double naming of migrations`);
            await this.connection.query(`
                begin;
                ${migration.script};
                insert into ${this.tableName} (name, datetime) 
                values ('${migration.filename}', ${migration.datetime});
                commit;
            `);
        }
    }
}
