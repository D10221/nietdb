import 'reflect-metadata';
import * as chai from 'chai';
import * as meta from "./db/metadata";
import {Lazy} from "./lazy/index";
let assert = chai.assert;

interface IID {
    id?: any;
}

@meta.table( {name: 'xKlass'})
class Klass implements IID {
    
    @meta.column({name: 'xprop'})
    prop:string = "";
    
    @meta.column({name:'xother'})
    other:number = 0 ;
}

describe('metadata',()=>{

    it('works',()=>{
        
        var m = meta.getTable(Klass);
        
        assert.equal(m.name, 'xKlass');
        
        assert.equal(2, m.columns.length);
        
        for(var col of m.columns){
            assert.equal('x'+col.prop, col.name)
        }

        var k = new Klass();

        var type = meta.getType(k, 'prop');

        assert.isTrue(meta.isString(type), 'is string');

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






