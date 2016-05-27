import * as fs from 'fs';

import * as db from "../db";

import {Lazy} from '../lazy';


let _scripts = new WeakMap<string,Lazy<Promise<any>>>();


function init(script):Promise<any> {

    return Promise.all(db.exec(...script.split('<!--GO-->')));

}

export function setup(key:string, initer?:(s)=> Promise<any>): Lazy<Promise<any>> {

    var filename = process.cwd() + `/sql-scripts/${key}/${key}.sql`;

    initer = initer || init(fs.readFileSync(filename, 'utf-8'));

    var script = _scripts.get(key);

    if (!script) {

        _scripts.set(key, new Lazy(()=> initer(filename))
        )
    }

    return script;
}