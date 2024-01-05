import {CustomError, LoginDto, RegisterDto, UserEntity} from "../../domain";
import {UserModel} from "../../data";
import {bcryptAdapter, envs, JwtAdapter} from "../../config";
import {EmailService} from "./email.service";


export class AuthService {
    constructor(
        private readonly emailService: EmailService,
    ) {}


    public async registerUser(registerUserDto: RegisterDto){
        const {name, password,email} = registerUserDto;
        const existEmail = await UserModel.findOne({email: email});
        if(existEmail) throw CustomError.badRequest('Email already exist');

        try{
            const user = new UserModel(registerUserDto);
            // Encriptar contraseña

            user.password = bcryptAdapter.hash(registerUserDto.password);


            await user.save();
            // Email de confirmación

            await this.sendEmailValidationLink(user.email);

            const {password, ...rest} = UserEntity.fromObject(user);
            // JWT
            const token = await JwtAdapter.generateToken({id: rest.id});
            if(!token) throw CustomError.internalServer('Error while creating JWT');

            return {user:rest, token: token};
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

    private sendEmailValidationLink = async ( email: string) =>{
        const token = await JwtAdapter.generateToken({email});
        if(!token) throw CustomError.internalServer('Error getting token');

        const link = `${envs.WEBSERVICE_URL}/auth/validate-email/${token}`;

        const html = `
            <h1>Validate your email</h1>
            <p>Click on the following link to validate your email </p>
            <a href="${link}">Validate you email: ${email}</a>
        `;

        const options = {
            to: email,
            subject:'Validate your email',
            htmlBody: html
        }

        const isSet = await this.emailService.sendEmail(options);

        if(!isSet) throw CustomError.internalServer('Error sending email');

        return true;
    }

    public validateEmail=async(token: string) => {
        const payload = await JwtAdapter.validateToken(token);
        if(!payload) throw CustomError.unauthorized('Token not valid');

        const {email} = payload as {email:string};
        if(!email) throw CustomError.internalServer('Email not in token');

        const user = await UserModel.findOne({email});
        if(!user) throw CustomError.internalServer('Email not found');

        user.emailValidated = true;

        await user.save();

        return true;

    }
}