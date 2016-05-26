import * as fs from 'fs';

import * as db from '../db';

import logger from '../logger';

import {User} from "./user";

import * as _ from 'lodash';

import LoChain = _.LoDashExplicitArrayWrapper;

var inited = false;

let onError = x=> e=> logger.error(`users: ${x}, error: ${e}`);

let ok = x => y => logger.info(`init users: ${x}, ok:  ${y}`) ;

var script = fs.readFileSync(
    //TODO: db.path().value
    process.cwd() + '/src/user/user.sql', 'utf-8'
);

function init(): Promise<any> {

    if (inited) {
        return;
    }
    
    inited = true;

    return Promise.all(db.exec(script.split('<!--GO-->')))
        .then(ok)
        .catch(onError('init'));
}

export async function getAll():Promise<LoChain<User>> {

    await init();

    return db.getAsync<User>('select * from USER')
        .then( x =>
            _.chain(x));
}

export async function getWhere(w:string):Promise<LoChain<User>>{
    await init();
    return db.getAsync<User>(`select * from USER where ${w}`)
        .then( x=> _.chain(x));
}

export async function insert(u:User): Promise<boolean> {
    await init();
    return db.runAsync(
        `insert into USER (name,password,email,role)
         values ('${u.name}', '${u.password}', '${u.email}', '${u.role}')`);
}

export async function getById(id:number): Promise<User>{
    await init();
    return getWhere(`id = ${id}`)
        .then(x=> x.first().value() as User);
}

export async function update(u:User) : Promise<any>{
    await init();
    return db.runAsync(
        `update user set name = '${u.name}', password = '${u.password}', email = '${u.email}', role = '${u.role}' where id = ${u.id}`);
}
