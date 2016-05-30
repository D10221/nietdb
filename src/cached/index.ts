var cache = new WeakMap<any,Map<string,any>>();

/***
 * forever
 */
export function cached(target: Object, key: string, descriptor: TypedPropertyDescriptor<any>) {

    let method = descriptor.value;

    descriptor.value = function(...args: any[]) {

        var map =  cache.get(target);

        if(!map) {
            map = new Map<string,any>();
        }

        if(!map.has(key)){
            map.set(key, method(args))
        }

        cache.set(target, map );

        return map.get(key);
    };

    return descriptor;
}