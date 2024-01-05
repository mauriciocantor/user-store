import {Request, Response} from "express";
import {CustomError, LoginDto, RegisterDto} from "../../domain";
import {AuthService} from "../services";


export class AuthController {
    constructor(
        public readonly authService: AuthService,
    ) {
    }

    private handleError = (error: unknown, res: Response)=>{
        if(error instanceof CustomError){
            return res.status(error.statusCode).json({error: error.message});
        }
        console.log(error);
        return res.status(500).json({error:'Internal Error Server'});
    }

    register = (req:Request, res: Response)=>{
        const [error, registerDto] = RegisterDto.create(req.body);
        if(error) {
            const {statusCode, message} = CustomError.badRequest(error);
            return res.status(statusCode).json({error:message});
        }
        this.authService.registerUser(registerDto!)
            .then((user)=>res.json(user))
            .catch((error)=> this.handleError(error, res));

    }

    login = (req:Request, res: Response)=>{
        const [error, loginDto] = LoginDto.create(req.body);
        if(error) {
            const {statusCode, message} = CustomError.badRequest(error);
            return res.status(statusCode).json({error:message});
        }
        this.authService.loginUser(loginDto!)
            .then((user)=>res.json(user))
            .catch((error)=> this.handleError(error, res));
    }

    validate = (req:Request, res: Response)=>{
        const {token} = req.params;
        this.authService.validateEmail(token)
            .then(()=> res.json('Email was validated properly'))
            .catch(error => this.handleError(error, res));
    }
}