export interface IConfig {
    pathToMigrations: string;
    migrationTableName?: string;
}

export interface IMigration {
    filename: string;
    script: string;
    datetime: number;
}
