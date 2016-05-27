import * as mapper from './db/mapper';

import {table, column, getMetaTable, MetaColumn, MetaTable} from "./db/metadata";

import {assert} from 'chai';


@table({name: 'xtype'})
class XType {

    @column({name: 'idx', attr: ['key']})
    id:number = 0;

    @column({name: 'xname', type: 'text'})
    xname:string = "!";
}

describe('sqlizer', ()=> {

    it('selects', ()=> {

        var xtype = new XType();

        var meta = getMetaTable(xtype);

        var select = mapper.getSelect(meta);

        assert.equal(select, "select idx,xname from xtype");
    });

    it('column canWrite', ()=> {
        var col = {name: 'x', attr: ['key']} as MetaColumn;
        assert.equal(mapper.isReadOnly('key'), true, 'should be readonly');
        assert.equal(mapper.canWrite(col), false);
    });

    it('allWritableColumns', ()=> {
        assert.equal(mapper.allWritableColumnNames({
            name: 'x', columns: [
                {
                    name: 'xCol',
                    attr: ['key']
                }
            ]
        } as MetaTable).join(','), '');

        assert.equal(mapper.allWritableColumnNames({
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
        } as MetaTable).join(','), 'xCol');
    });

    it('inserts', ()=> {

        var xtype = new XType();

        var meta = getMetaTable(xtype);

        var insert = mapper.getInsert(meta, xtype);

        assert.equal(insert, "INSERT INTO xtype (xname) VALUES ('!')");
    });

    it('updates', ()=>{

        var xtype = new XType();

        var meta = getMetaTable(xtype);

        var insert = mapper.getUpdate(meta, xtype);

        assert.equal(insert, "UPDATE xtype SET xname='!' WHERE idx=0");
    })
});