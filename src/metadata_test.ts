import 'reflect-metadata';
import * as chai from 'chai';
import {columnMeta, tableMeta, MetaColumn, MetaTable, getMeta, getMetaColumn} from "./db/metadata";
import {Lazy} from "./lazy/index";
let assert = chai.assert;

interface IID {
    id?: any;
}

@tableMeta( {name: 'xKlass'})
class Klass implements IID {
    
    @columnMeta({name: 'xprop'})
    prop:string = "";
    
    @columnMeta({name:'xother'})
    other:number = 0 ;
}

describe('metadata',()=>{

    it('works',()=>{

        var klass = new Klass();
        var meta = getMeta(klass);
        assert.equal(meta.name, 'xKlass');
        assert.equal(2, meta.columns.length);
        for(var col of meta.columns){
            assert.equal('x'+col.prop, col.name)
        }
        assert.equal(getMetaColumn(klass, 'prop').type, 'string');

    });
    
    describe('columns',()=>{
        var klass = new Klass();
        var meta = getMeta(klass);


    });

});


describe('lazyPromise',()=>{
    
   it('works',async ()=>{
       var i = 0 ;
       var lp = new Lazy<Promise<any>>(()=> new Promise((rs,rj)=>{
           i++;
           rs();
       }));

       await lp.value;

       assert.equal(i,1);

       await lp.value;

       assert.equal(i,1);

   });
});






