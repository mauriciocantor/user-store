import * as mongoose from "mongoose";


interface Options {
    mongoUrl: string;
    dbName: string;
}

export class MongoDatabase {
    static async connect(options: Options){
        const {mongoUrl, dbName}=options;

        try {
            await mongoose.connect(mongoUrl, {
                dbName,
            });

            return true;
        }catch (e) {
            console.log(`Error: ${e}`);
        }
    }

    static async disconnect(){
        return await mongoose.disconnect();
    }
}