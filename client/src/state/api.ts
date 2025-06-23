import { createNewUserInDatabase } from "@/lib/utils";
import { Manager, Tenant } from "@/types/prismaTypes";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    //Con esto entrego siempre el token de autorizacion a todas las api del back
    prepareHeaders: async (headers) =>{
      const session = await fetchAuthSession();
      const  { idToken } = session.tokens??{};
      if(idToken){
        headers.set("Authorizacion",`Bearer ${idToken}`)
      }
    }
  }),
  reducerPath: "api",
  tagTypes: ["Managers","Tenants"],
  endpoints: (build) => ({
    getAuthUser:build.query<User,void>({
      queryFn:async(_, _queryApi, _extraoptions, fetchWithBQ)=>{
        console.log("obteniendo informacion del usuario desde el estado")
        try{
          const session = await fetchAuthSession();
          const  { idToken } = session.tokens??{};
          const user = await getCurrentUser();
          const userRole = idToken?.payload["custom:role"] as string;
          const endpoint = 
            userRole === "manager"?
            `/managers/${user.userId}`
            :`/tenants/${user.userId}`;
            let userDetailsResponse = await fetchWithBQ(endpoint);
            
            console.log("userDetailsResponse",userDetailsResponse)

            //si usuari no existe, creamos un nuevo usuario.
            if(userDetailsResponse.error && userDetailsResponse.error.status===404){
              userDetailsResponse = await createNewUserInDatabase(
                user,
                idToken,
                userRole,
                fetchWithBQ
              )
            }

            return{
              data:{
                cognitoInfo:{...user},
                userInfo: userDetailsResponse.data as Tenant | Manager,
                userRole
              }
            }

        }catch(error:any){
          return {error: error.message || "No se pudo obtener informacion del usuario"}

        }
      }
    }),
    updateTenantSettings: build.mutation<Tenant, {cognitoId:string} & Partial<Tenant>>({
      query:({cognitoId, ...updatedTenant})=>(
        {
        url:`tenants/${cognitoId}`,
        method:"PUT",
        body:updatedTenant
      }),
      invalidatesTags:(result)=>[{type:"Tenants",id:result?.id}],
    }),
    updateManagerSettings: build.mutation<Manager, {cognitoId:string} & Partial<Manager>>({
      query:({cognidoId, ...updatedManager})=>(
        {
        url:`managers/${cognidoId}`,
        mehotd:"PUT",
        body:updatedManager
      }),
      invalidatesTags:(result)=>[{type:"Managers",id:result?.id}],
    })
  }),
});

export const {
  useGetAuthUserQuery, //use --NameQuery--Query
  useUpdateTenantSettingsMutation,
  useUpdateManagerSettingsMutation
} = api;
