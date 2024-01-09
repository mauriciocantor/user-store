import {Validators} from "../../../config/validators";

export class CreateProductDto {
    private constructor(
       public readonly name:string,
       public readonly available:boolean,
       public readonly price:number,
       public readonly description:string,
       public readonly user:string, //Id User
       public readonly category:string, // ID Category
    ) {}

    static create(props: {[key:string]:any}): [string?, CreateProductDto?]{
        const {
            name,
            available,
            price,
            description,
            user,
            category
        } = props;

        if(!name) return ['Missing name'];
        if(!user) return ['Missing name'];
        if(!Validators.isMongoId(user)) return ['Invalid User'];

        if(!category) return ['Missing name'];
        if(!Validators.isMongoId(category)) return ['Invalid Category'];

        return [undefined, new CreateProductDto(
            name,
            !!available,
            price,
            description,
            user,
            category
        )];

    }
}