import 'reflect-metadata';

import * as mapper from './db/mapper';

import * as m from "./db/metadata";

import {assert} from 'chai';


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

        var select = mapper.getSelect(meta);

        assert.equal(select, "select idx,xname from xtype");
    });

    it('column canWrite', ()=> {
        var col = {name: 'x', attr: ['key']} as m.ColumnMeta;
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
        } as m.TableMeta).join(','), '');

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
        } as m.TableMeta).join(','), 'xCol');
    });

    it('quotes',()=>{

        assert.isTrue(mapper.needsQuotes(XType, m.getColumn(XType, 'xname')));

        var instance = new XType();
        assert.isTrue(mapper.needsQuotes(instance, m.getColumn(XType, 'xname')));
    });

    it('inserts', ()=> {

        var xtype = new XType();

        var meta = m.getTable(XType);

        var insert = mapper.getInsert(meta, xtype);

        assert.equal(insert, "INSERT INTO xtype (xname) VALUES ('!')");
    });

    it('updates', ()=>{

        var xtype = new XType();

        var meta = m.getTable(XType);

        var insert = mapper.getUpdate(meta, xtype);

        assert.equal(insert, "UPDATE xtype SET xname='!' WHERE idx=0");
    })
});