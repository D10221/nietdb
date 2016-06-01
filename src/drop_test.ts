import {assert} from 'chai';

import {SqliteEngine} from "./db/engine/SqliteEngine";

describe('can drop', ()=>{

    it('is realeased', async ()=>{
        
       var engine = await new SqliteEngine(process.cwd()+"/test.db").drop();
       
        await engine.exec(
           "create table if not exists xyz ( id int UNIQUE)",
           "insert or ignore into xyz (id) values (0)"
       );
       var result = await engine.getAsync<{ id: number }>("select * from xyz");

       assert.equal(result[0].id, 0);

   })
});