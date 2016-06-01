import 'reflect-metadata';


import * as m from "./db/metadata";

import {assert} from 'chai';

import {
    getInsert, getSelect, isReadOnly, canWrite, allWritableColumnNames,
    needsQuotes, getUpdate
} from "./db/mapper/ReflectMapper";


@m.table({name: 'xtype'})
class XType {

    @m.column({name: 'idx', attr: ['key']})
    id:number = 0;

    @m.column({name: 'xname', type: String})
    xname:string = "!";
}

describe('mapper', ()=> {

    it('selects', ()=> {

        var xtype = new XType();

        var meta = m.getTable(XType);

        var select = getSelect(meta);

        assert.equal(select, "SELECT idx,xname FROM xtype");
    });

    it('column canWrite', ()=> {
        var col = {name: 'x', attr: ['key']} as m.ColumnMeta;
        assert.equal(isReadOnly('key'), true, 'should be readonly');
        assert.equal(canWrite(col), false);
    });

    it('allWritableColumns', ()=> {
        assert.equal(allWritableColumnNames({
            name: 'x', columns: [
                {
                    name: 'xCol',
                    attr: ['key']
                }
            ]
        } as m.TableMeta).join(','), '');

        assert.equal(allWritableColumnNames({
            name: 'x', columns: [
                {
                    name: 'xCol',
                    attr: []
                },
                {
                    name: 'x',
                    attr: ['key']
                },
                {
                    name: 'y',
                    attr: ['readonly']
                },
                {
                    name: 'x',
                    attr: ['notMapped']
                }
            ]
        } as m.TableMeta).join(','), 'xCol');
    });

    it('quotes',()=>{

        assert.isTrue(needsQuotes(XType, m.getColumn(XType, 'xname')));

        var instance = new XType();
        assert.isTrue(needsQuotes(instance, m.getColumn(XType, 'xname')));
    });

    it('inserts', ()=> {

        var xtype = new XType();

        var meta = m.getTable(XType);

        var insert = getInsert(meta, xtype);

        assert.equal(insert, "INSERT INTO xtype (xname) VALUES ('!')");
    });

    it('updates', ()=>{

        var xtype = new XType();

        var meta = m.getTable(XType);

        var insert = getUpdate(meta, xtype);

        assert.equal(insert, "UPDATE xtype SET xname='!' WHERE idx=0");
    })
});