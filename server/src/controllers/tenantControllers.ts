import { Request, Response} from "express";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

export const getTenant  = async(req: Request, res: Response): Promise<void>=>{
    try{
        console.log("ENTRANDO A GET TENANT")
        const {cognitoId} = req.params;
        console.log(`CognitoId: ${cognitoId}`)
        const tenant = await prisma.tenant.findUnique({
            where:{cognitoId},
            include:{
                favorites:true
            }
        });
        console.log(`Tenant: ${JSON.stringify(tenant)}`)

        if(tenant){
            res.json(tenant)
        }else{
            res.status(404).json({message:"Tenant no encontrado"})
        }

    }catch(error:any){
         console.error("Error en getTenant:", error);
        res.status(500).json({message:`Error obteniendo a tenant ${error.message}`})
    }
}

export const createTenant  = async(req: Request, res: Response): Promise<void>=>{

    try{
        
        const {cognitoId, name, email, phoneNumber} = req.body;

        const tenant = await prisma.tenant.create({
            data:{
                cognitoId,
                name,
                email,
                phoneNumber
            }
        });

        res.status(201).json(tenant)

    }catch(error:any){
        res.status(500).json({message:`Error creando a tenant ${error.message}`})
    }
}


export const updateTenant  = async(req: Request, res: Response): Promise<void>=>{

    try{
        const {cognitoId} = req.params;
        const {name, email, phoneNumber} = req.body;

        const tenant = await prisma.tenant.update({
            where: { cognitoId },
            data: {
                name,
                email,
                phoneNumber
            }
        });

        res.json(tenant)

    }catch(error:any){
        res.status(500).json({message:`Error actualizando a tenant ${error.message}`})
    }
}
