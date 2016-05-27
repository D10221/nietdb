import 'reflect-metadata';

import * as adapter from './db/adapter';

import * as chai from 'chai';

let assert = chai.assert;

import * as db from './db'

import * as m from "./db/metadata";

@m.table({name: 'xtype'})
class XType {

    @m.column({name: 'idx', attr:['key']})
    xtypeId:number = 0 ;

    @m.column({name: 'xname', type: 'text'})
    xtypeName: string  = "";

    toJson(): string {
        return JSON.stringify({
            idx: this.xtypeId,
            xname: this.xtypeName
        });
    }
}

var createTable = "create table  if not exists XTYPE ( " +
    "idx INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE, " +
    "xname text not null" +
    ")";

var insertTestData = "insert or ignore into xtype (idx , xname) values (0,'x')";


describe('adapter',()=>{

    it('works',async (done)=>{
        
        await db.exec(createTable, insertTestData);

        var xtype = new XType();

        xtype.xtypeName = "x";

        //var type = new adapter.InstanceLoader<XType>(this).getInstance(null);
        //var meta = Reflect.getMetadata('meta:table', XType );

        //END: Can't get prop's metadata without instance , then makes no sense
        var a = await adapter.createAdapter<XType>(false);

        var result = await a.all();

        var value = result.first().value();

        var j = JSON.stringify(value);

        assert.equal(j , xtype.toJson());

        done();
    })
});
