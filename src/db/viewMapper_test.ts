import {assert} from 'chai';
import {ViewMapper, mapValues} from './ViewMapper';

describe('ConventionMapper',()=>{
    
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
               script: 'sql-scripts/hello.sl',
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

           var value = await vmapper.getScript(meta, 'insert').value;

           assert.equal(value, "hello insert @name");
       })
   })
});