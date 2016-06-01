
export interface Engine {
    exec(...scripts:string[]):Promise<Engine>;
    runAsync<T>(sql:string, ...params:any[]): Promise<{result: any, changes: number }>;
    getAsync<T>(sql:string, ...params:any[]):Promise<T[]>;
    drop: ()=> Promise<Engine>;
}







