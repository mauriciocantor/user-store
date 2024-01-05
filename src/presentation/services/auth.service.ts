import {CustomError, LoginDto, RegisterDto, UserEntity} from "../../domain";
import {UserModel} from "../../data";
import {bcryptAdapter, JwtAdapter} from "../../config";


export class AuthService {
    constructor() {}


    public async registerUser(registerUserDto: RegisterDto){
        const {name, password,email} = registerUserDto;
        const existEmail = await UserModel.findOne({email: email});
        if(existEmail) throw CustomError.badRequest('Email already exist');

        try{
            const user = new UserModel(registerUserDto);
            // Encriptar contraseña

            user.password = bcryptAdapter.hash(registerUserDto.password);


            await user.save();


            // JWT


            // Email de confirmación

            const {password, ...rest} = UserEntity.fromObject(user);

            return {user:rest, token: 'ABC'};
        }catch (e) {
            throw CustomError.internalServer(`${e}`);
        }
    }

    public async loginUser(loginUserDto: LoginDto){
        const {email} = loginUserDto;
        try {
            const existEmail = await UserModel.findOne({email: email});
            // Findone para verificar
            if (!existEmail) throw CustomError.badRequest('Information is not correct. (e)');

            // isMatch.... bcrypte
            if (!bcryptAdapter.compare(loginUserDto.password, existEmail.password))
                throw CustomError.badRequest('Information is not correct. (p)');

            const {password, ...rest} = UserEntity.fromObject(existEmail);
            const token = await JwtAdapter.generateToken({id: existEmail.id});
            if(!token) throw CustomError.internalServer('Error while creating JWT');

            return {
                user: rest,
                token: token
            }
        }catch (e) {
            throw CustomError.internalServer(`${e}`);
        }
    }
}