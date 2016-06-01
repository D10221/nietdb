import 'reflect-metadata';
import * as path from 'path';
import * as chai from 'chai';
let assert = chai.assert;
import * as m from "./db/metadata";
import logger from './logger';
import {ScriptReader} from './db/scriptio';
import {createAdapter} from "./db/adapter/factory";
import {SqliteEngine} from "./db/engine/SqliteEngine";

function ThrowIt(e:Error){
    logger.error(e.message);
    throw e;
}
describe('adapter',()=>{

    it('read script from custom location',async ()=>{

        /***
         * Override Sql initializer script
         */
        @m.table({name: 'ntype', script:"sql-scripts/hello.sql"})
        class NType{
            
        }
        
        var ntype = new NType();

        var writer = {
            write: (script:string)=>
                new Promise((rs,rj)=> {
                    try{
                        //Instead of sending this to sql engine, capture it to see if it brings the right content
                        initScript = script;
                        rs(script)
                    }catch (e){
                        rj(e);
                    }
                })
        };

        var initScript = "";
        
        var reader =  {
            read: (x:string)=>
                new Promise<string>((rs,rj)=>{
                    try{
                        initScript = 'failed, this should be called because Model has Script meta indicating custom script path';
                        rs(x)
                    }catch(e){
                        console.log(`Error: ${e.message}`);
                        rj(e)
                    }
                })
        };

        var engine = new SqliteEngine(path.join(process.cwd(),"test.db"));

        var ntypes = await createAdapter(NType, engine,
            /*initializer:*/{reader:reader, writer:writer })
            .catch(ThrowIt);

        assert.isNotNull(ntypes.all);

        assert.equal(initScript, 'hello');
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

        var engine = new SqliteEngine(path.join(process.cwd(),"test.db"));

        var initializer = { reader: {
            // 
            read: (key:string)=> new Promise((rs,rj) => {
                rs("create table  if not exists XTYPE ( " +
                    "idx INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE, " +
                    "xname text not null" +
                    ")"+ "\n" +
                    "<!--GO-->\n"+
                    "insert or ignore into xtype (idx , xname) values (0,'x')"+
                    "<!--GO-->\n");
            })
        } /*writer: NULL */ };

        var xtypes = await createAdapter(XType,
            engine,
            initializer)
            .catch(ThrowIt);

        var result = await xtypes.all().catch(ThrowIt);

        var value = result.first().value();

        var j = JSON.stringify(value);

        assert.equal(j , xtype.toJson());

    })
});
