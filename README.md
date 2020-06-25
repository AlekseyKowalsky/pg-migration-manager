![GitHub Logo](https://hostingkartinok.com/show-image.php?id=8b7992739900aba032f02557a739d660)

>####The super simple migration manager for loved by everyone pg driver. (https://www.npmjs.com/package/pg)


##Installation
```shell
npm i pg-migration-manager
```


## Importing

```js
import MigrationManager from 'pg-migration-manager';
```

## Usage
```js
import * as http from 'http';
import { Pool } from 'pg';
import MigrationManager from 'pg-migration-manager';


class Server { 
    server;
    database;    

    initServer(){
        this.server = http.createServer((req, res)=>{/** request handling **/})
    } 

    async initDatabase(){
        this.database = new Pool(/** connection config **/);

        const manager = new MigrationManager(this.database, {
               pathToMigrations: 'src/migrations', // required
               migrationTableName: 'migration', // optional
           });
        
        await manager.runMigrations();
    }
    
    async start(){
        this.initServer();
        await this.initDatabase();
        this.server.listen(3000, 'hostname');
    }   
}

new Server().start().then(()=>'server has started')
```
The most reasonable way to implement migrations is to run sql scripts before server has started. 

First you create instance of MigrationManager class passing to it database client and configuration object.

The last one contains:
* pathToMigrations - a path to a folder where your sql scripts store.
* migrationTableName - a name of a table that will be created for writing fulfilled migrations. 

Then you execute runMigrations method that's returning promise.

During the runMigrations method runtime there will create migration table in database (if it does not exist yet), then your migrations will be worked out and written in this table.

Next time when you start server saved migrations will be ignored, only new ones will be run.
 
 **Note:**  thus don't change migration file names.
 
 **Another note:** the migration manager implements migrations one by one according to creation dates of  files.
 
 ## In conclusion
 
 I'll be happy to hear your ideas and suggestions to possible improving this tiny but helpful tool.