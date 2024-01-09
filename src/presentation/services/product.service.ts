import {CreateProductDto, CustomError, UserEntity, CategoryEntity, PaginationDto} from "../../domain";
import {ProductModel} from "../../data";

export class ProductService {
    constructor() {}

    createProduct = async(createProductDto: CreateProductDto)=>{
        const productExist = await ProductModel.findOne({name: createProductDto.name});
        if (productExist) throw CustomError.badRequest('Category already exists');

        try {
            const category = new ProductModel({
                ...createProductDto
            });

            await category.save();

            return category;

        }catch (e) {
            throw CustomError.internalServer(`${e}`);
        }
    }

    getProducts = async(paginationDto:PaginationDto)=>{
        const {page, limit}=paginationDto;
        try {

            const [total, products] = await Promise.all([
                ProductModel.countDocuments(),
                ProductModel
                     .find()
                     .skip((page-1)*limit)
                     .limit(limit)
                    .populate('user')
                    .populate('category')
            ])
            return {
                page:page,
                limit: limit,
                total:total,
                product: products,
            }
        }catch (e) {
            throw CustomError.internalServer('Internal server error');
        }
    }
}