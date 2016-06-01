import {assert} from 'chai';

import {ViewMapper, mapValues} from './db/mapper/ViewMapper';

describe('ViewMapper',()=>{
    
   describe("functions", ()=>{

       it("maps values", ()=>{

           var meta = {name: 'xTable', columns: [
               {
                   name: 'xCol',
                   prop: 'name',
                   // Fake String Type
                   type: {
                       name: 'string'
                   }
               }
           ]};

           var target = {
               name: 'xnamed'
           };

           var script  = "@name";

           var mapped = mapValues( meta, target, script );

           assert.equal(mapped, "'xnamed'");
       });

       it("reads script from custom location", async ()=>{

           var meta = {name: 'xTable',
               script: 'sql-scripts/hello.sql',
               columns: [
               {
                   name: 'xCol',
                   prop: 'name',
                   //setup Script
                   // Fake String Type
                   type: {
                       name: 'string'
                   }
               }
           ]};

           var vmapper = new ViewMapper();

           var insertStatement = await vmapper.getScript(meta, 'insert').value;

           assert.equal(insertStatement, "hello insert @name");

           var updateStatement = await vmapper.getScript(meta, 'update').value;

           assert.equal(updateStatement, 'update table set column = @name');
       });

       it('maps', async ()=>{

           var meta = {name: 'xTable',
               script: 'sql-scripts/hello.sql',
               columns: [
                   {
                       name: 'xCol',
                       prop: 'name',
                       //setup Script
                       // Fake String Type
                       type: {
                           name: 'string'
                       }
                   }
               ]};

           var vmapper = new ViewMapper();

           var insertStatement = await vmapper.getInsert(meta, {name: 'x'});

           assert.equal(insertStatement, "hello insert 'x'");

           var updateStatement = await vmapper.getUpdate(meta, {name: 'x'});

           assert.equal(updateStatement, "update table set column = 'x'");

           assert.equal(vmapper.getSelect(meta), "SELECT xCol FROM xTable");
       })
   })
});