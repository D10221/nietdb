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
        
        var xtype = new XType();

        xtype.xtypeName = "x";
        
        var xtypes = await adapter.createAdapter(XType, {
            reader: (k)=> createTable,
            writer: (k)=> Promise.all(db.exec(createTable, insertTestData))}
        );

        var result = await xtypes.all();

        var value = result.first().value();

        var j = JSON.stringify(value);

        assert.equal(j , xtype.toJson());

        done();
    })
});
