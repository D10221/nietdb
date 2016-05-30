import 'reflect-metadata';

import * as adapter from './db/adapter';

import * as chai from 'chai';

let assert = chai.assert;

import * as m from "./db/metadata";

import * as readers from './db/readers';

@m.table({name: 'xtype'})
class XType {

    @m.column({name: 'idx', attr:['key']})
    xtypeId:number = 0 ;

    @m.column({name: 'xname', type: 'text'})
    xtypeName: string  = "";

    /***
     * returns whats expected to in the db 
     * @returns {string}
     */
    toJson(): string {
        return JSON.stringify({
            idx: this.xtypeId,
            xname: this.xtypeName
        });
    }
}

var reader : readers.FileSystemReader = {
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

describe('adapter',()=>{

    it('works',async (done)=>{
        
        var xtype = new XType();

        xtype.xtypeName = "x";
        
        var xtypes = await adapter.createAdapter(XType, {reader: reader });

        var result = await xtypes.all();

        var value = result.first().value();

        var j = JSON.stringify(value);

        assert.equal(j , xtype.toJson());

        done();
    })
});
