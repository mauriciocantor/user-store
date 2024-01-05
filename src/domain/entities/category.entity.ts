import {CustomError} from "../errors/custom.error";
import {UserEntity} from "./user.entity";


export class CategoryEntity {
    constructor(
        public readonly id:string,
        public readonly name:string,
        public readonly available:boolean,
        public readonly user:UserEntity,
    ) {}

    static fromObject(object: {[key:string]:any}){
        const {id, _id, name, available, user } = object;
        if(!_id && !id ) throw CustomError.badRequest('Missing Id');
        if(!name ) throw CustomError.badRequest('Missing Name');
        if(!available || typeof available !== 'boolean' ) throw CustomError.badRequest('Available not is boolean');
        if(!user) throw CustomError.badRequest('Missing user');


        return new CategoryEntity(_id||id, name, available, user);
    }
}