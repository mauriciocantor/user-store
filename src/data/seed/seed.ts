import {MongoDatabase} from "../mongo/mongoDatabase";
import {envs} from "../../config";
import {UserModel} from "../mongo/models/user.model";
import {CategoryModel} from "../mongo/models/category.model";
import {ProductModel} from "../mongo/models/product.model";
import {seedData} from "./data";


(async()=>{
    MongoDatabase.connect({
        mongoUrl: envs.MONGO_URL,
        dbName: envs.MONGO_DB_NAME
    });

    await main();

    await MongoDatabase.disconnect();

})();


const randomBetween0AndX = (x: number) =>{
    return Math.floor(Math.random() * x );
}
async function main(){
    // 0. Borrar registros!
    await Promise.all([
        CategoryModel.deleteMany(),
        ProductModel.deleteMany(),
        UserModel.deleteMany(),
    ]);
    // 1. Crear usuario

    const users = await UserModel.insertMany(seedData.users);
    // 2. crear categorias

    const categories = await CategoryModel.insertMany(
        seedData.categories.map(category=>{
            return {
                ...category,
                user: users[0]._id
            }
        })
    );

    // 3. Crear Productos

    const products = await ProductModel.insertMany(
        seedData.products.map(product=>{
            return {
                ...product,
                user: users[randomBetween0AndX(seedData.users.length-1)]._id,
                category: categories[randomBetween0AndX(categories.length-1)]._id
            }
        })
    )


    console.log('Seeded');
}