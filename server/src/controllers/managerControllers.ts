import { Request, Response} from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getManager  = async(req: Request, res: Response): Promise<void>=>{
    try{
        const { cognitoId } = req.params;
        const manager = await prisma.manager.findUnique({
        where: { cognitoId },
        });
        if(manager){
            res.json(manager)
        }else{
            res.status(404).json({message:"Manager no encontrado"})
        }

    }catch(error:any){
        console.error("Error en getManager:", error);
        res.status(500).json({message:`Error obteniendo a manager ${error.message}`})
    }
}

export const createManager  = async(req: Request, res: Response): Promise<void>=>{
    console.log("Creando manager con body:", req.body);
    //Validar que el body tenga los campos requeridos
    try{
        const {cognitoId, name, email, phoneNumber} = req.body;

        const manager = await prisma.manager.create({
            data:{
                cognitoId,
                name,
                email,
                phoneNumber
            }
        });

        res.status(201).json(manager)

    }catch(error:any){
        res.status(500).json({message:`Error creando a manager ${error.message}`})
    }
}

export const updateManager  = async(req: Request, res: Response): Promise<void>=>{

    try{
        const {cognitoId} = req.params;
        const {name, email, phoneNumber} = req.body;

        const manager = await prisma.manager.update({
            where: { cognitoId },
            data: {
                name,
                email,
                phoneNumber
            }
        });

        res.json(manager)

    }catch(error:any){
        res.status(500).json({message:`Error actualizando a manager ${error.message}`})
    }
}