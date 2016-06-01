import {assert} from 'chai';
import * as fs from 'fs';
import *as  path from 'path'

import {SqliteEngine} from "./db/engine/SqliteEngine";
import {Engine} from "./db/engine/index";

describe('can drop', ()=>{

    it('is realeased', async ()=>{
        
       var engine = await new SqliteEngine(process.cwd()+"/test.db").drop();
       
        await engine.exec(
           "create table if not exists xyz ( id int UNIQUE)",
           "insert or ignore into xyz (id) values (0)"
       );

       var result = await engine.getAsync<{ id: number }>("select * from xyz");

       assert.equal(result[0].id, 0);
   });


    it('is dropped', async ()=>{

        var dbPath = path.join(process.cwd(),"test.db");

        var engine = await new SqliteEngine(dbPath).drop();

        var result = await engine.exec(
            "create table if not exists xyz ( id int UNIQUE)",
            "insert or ignore into xyz (id) values (0)"
        ).then(en=>
            en.getAsync<{ id: number }>("select * from xyz")
        );

        assert.equal(result[0].id, 0);

        await engine.drop().then();

        //without this does not awaits
        console.log(`exists: ${fs.existsSync(dbPath)}`);

        assert.equal(fs.existsSync(engine.connectionString), false, "its Dropped")
        

    })
});