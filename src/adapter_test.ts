import 'reflect-metadata';

import * as chai from 'chai';

let assert = chai.assert;

import * as m from "./db/metadata";

import {ScriptReader} from './db/scriptio';
import {createAdapter} from "./db/adapter/factory";

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
        
        var ntypes = await createAdapter(NType, /*initializer:*/{reader:reader, writer:writer });

        assert.isNotNull(ntypes.all);

        assert.equal(initScript, 'hello');
    });

    it('convention based script path',async ()=>{

        var reader : ScriptReader = {
            read: (key)=> new Promise((rs,rj)=>{
                rs("create table  if not exists XTYPE ( " +
                    "idx INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE, " +
                    "xname text not null" +
                    ")"+ "\n" +
                    "<!--GO-->\n"+
                    "insert or ignore into xtype (idx , xname) values (0,'x')"+
                    "<!--GO-->\n");
            })
        };


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

        var xtypes = await createAdapter(XType,/*initializer:*/{ reader: reader /*writer: NULL */ });

        var result = await xtypes.all();

        var value = result.first().value();

        var j = JSON.stringify(value);

        assert.equal(j , xtype.toJson());

    })
});
