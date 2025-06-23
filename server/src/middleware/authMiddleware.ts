import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface DecodeToken extends JwtPayload{
    sub:string; //cognitoId
    "custom:role"?:string;
}

declare global{
    namespace Express{
        interface Request{
        user?: {
            id: string;
            role:string;
            }
        }
    }
}

export const authMiddleware = (allowedRoles: string[])=>{
    return(req: Request, res: Response, next: NextFunction):void=>{

        const authHeader = req.headers.authorizacion;
        const token = typeof authHeader === "string" ? authHeader.split(" ")[1] : undefined;
        if(!token){
            res.status(401).json({message:"No hay autorización"})
            return;
        }

        try {
            const decode = jwt.decode(token) as DecodeToken
            const userRole =  decode["custom:role"] || "";
            req.user={
                id:decode.sub,
                role:userRole
            }

            const hasAccess = allowedRoles.includes(userRole.toLocaleLowerCase());
            if(!hasAccess){
                res.status(403).json({message:"Acceso denegado"})
                return
            }
        } catch (error) {
            console.error("Error en decodificacion de token",error);
            res.status(400).json({message:"Token invalido"})
            return;
        }
        next();
    };
}