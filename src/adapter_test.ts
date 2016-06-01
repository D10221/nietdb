import 'reflect-metadata';
import * as path from 'path';
import * as chai from 'chai';
let assert = chai.assert;
import * as m from "./db/metadata";
import logger from './logger';

import {Factory} from "./db/adapter/factory";

import {SqliteEngine} from "./db/engine/SqliteEngine";

import {Engine} from "./db/engine/index";

function ThrowIt(e:Error){
    logger.error(e.message);
    throw e;
}

describe('adapter',()=>{

    it('read script from custom location',async ()=>{
        
        @m.table({name: 'ntype', script:"sql-scripts/hello.sql"})
        class NType{
            
        }
        var ntype = new NType();
        
        var engine = new SqliteEngine(":memory:");

        var fty = new Factory(engine);

        var ntypes = await fty.makeAdapter(NType)
            .catch(ThrowIt);

        assert.isNotNull(ntypes.all);

        var r = await engine.getAsync<{message:string}>("select * from greetings");
        assert.equal(r[0].message, 'hello');
    });

    it('convention based script path',async ()=>{
        
        @m.table({name: 'xtype'})
        class XType {

            @m.column({name: 'idx', attr:['key']})
            xtypeId:number = 0 ;

            @m.column({name: 'xname'})
            xtypeName: string  = "x";

            /***
             * returns whats expected to be coming from the db
             * @returns {string}
             */
            toJson(): string {
                return JSON.stringify({
                    idx: this.xtypeId,
                    xname: this.xtypeName
                });
            }
        }
        
        var xtype = new XType();

        var engine = await new SqliteEngine(path.join(process.cwd(),"test.db")).drop();

        var fty = new Factory(engine);

        var xtypes = await fty.makeAdapter(XType)
            .catch(ThrowIt);

        var result = await xtypes.all().catch(ThrowIt);

        var value = result.first().value();

        var j = JSON.stringify(value);

        assert.equal(j , xtype.toJson());

    })
});
