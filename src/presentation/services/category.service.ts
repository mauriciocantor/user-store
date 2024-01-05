import {CreateCategoryDto, CustomError, UserEntity, CategoryEntity, PaginationDto} from "../../domain";
import {CategoryModel} from "../../data";

export class CategoryService {
    constructor() {
    }

    createCategory = async(createCategoryDto: CreateCategoryDto, user: UserEntity)=>{
        const categoryExist = await CategoryModel.findOne({name: createCategoryDto.name});
        if (categoryExist) throw CustomError.badRequest('Category already exists');

        try {
            const category = new CategoryModel({
                ...createCategoryDto,
                user:user.id,
            });

            await category.save();

            return CategoryEntity.fromObject(category);

        }catch (e) {
            throw CustomError.internalServer('Internal server error');
        }
    }

    getCategories = async(paginationDto:PaginationDto)=>{
        const {page, limit}=paginationDto;
        try {
            // const total = await CategoryModel.countDocuments();
            // const categories = await CategoryModel
            //     .find()
            //     .skip((page-1)*limit)
            //     .limit(limit)
            // ;

            const [total, categories] = await Promise.all([
                CategoryModel.countDocuments(),
                CategoryModel
                     .find()
                     .skip((page-1)*limit)
                     .limit(limit)
            ])
            return {
                page:page,
                limit: limit,
                total:total,
                categories: categories.map(category => CategoryEntity.fromObject(category))
            }
        }catch (e) {
            throw CustomError.internalServer('Internal server error');
        }
    }
}