"use client"

import React, { useEffect } from 'react';
import { Amplify } from 'aws-amplify';

import {
    Authenticator,
    Heading,
    RadioGroupField,
    useAuthenticator,
    View,
    Radio
} from "@aws-amplify/ui-react";
import '@aws-amplify/ui-react/styles.css';
import { useRouter, usePathname } from 'next/navigation';

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID!,
            userPoolClientId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID!
        }
    }
});

const components = {
    Header() {
        return (
            <View className='mt-4 mb-7'>
                <Heading level={3} className="!text-2xl !font-bold">
                    RENT
                    <span className='text-secondary-500 font-light hover:!text-primary-300'>
                        IFUL
                    </span>
                </Heading>
                <p className='text-muted-foreground mt-2'>
                    <span className='font-bold'>Bienvenido/a!</span> Por favor, ingrese para continuar
                </p>

            </View>
        )
    },
    SignIn: {
        Footer() {
            const { toSignUp } = useAuthenticator();
            return (
                <View className='text-center mt-4'>
                    <p className='text-muted-foreground'>
                        No tienes cuenta?{" "}

                        <button
                            onClick={toSignUp}
                            className='text-primary hover:underline bg-transparent border-none p-0'
                        >
                            Registrate aqui
                        </button>
                    </p>

                </View>
            )
        }
    },
    SignUp: {
        FormFields() {
            const { validationErrors } = useAuthenticator();
            return (
                <>
                    <Authenticator.SignUp.FormFields />
                    <RadioGroupField
                        legend="Role"
                        name="custom:role"//Este nombre proviene del atributo personalizado que creamos en registro de nuestro cognito en aws
                        errorMessage={validationErrors?.["custome:role"]}
                        hasError={!!validationErrors?.["custome:role"]}
                        isRequired
                    >
                        <Radio value="tenant">Tenant</Radio>
                        <Radio value="manager">Administrador</Radio>
                    </RadioGroupField>
                </>
            )
        }
        ,
        Footer() {
            const { toSignIn } = useAuthenticator();
            return (
                <View className='text-center mt-4'>
                    <p className='text-muted-foreground'>
                        Ya tienes una cuenta?{" "}

                        <button
                            onClick={toSignIn}
                            className='text-primary hover:underline bg-transparent border-none p-0'
                        >
                            Inicia sesión
                        </button>
                    </p>

                </View>
            )
        }
    }
}

const formFields = {
    signIn: {
        username: {
            placeholder: "Ingresa tu correo",
            label: "Correo",
            isRequired: true
        },
        password: {
            placeholder: "Ingresa tu contrasena",
            label: "Contrasena",
            isRequired: true
        }
    },
    signUp: {
        username: {
            order: 1,
            placeholder: "Elige usuario",
            label: "Usuario",
            isRequired: true
        },
        email: {
            order: 2,
            placeholder: "Ingresa correo",
            label: "Email",
            isRequired: true
        },
        password: {
            order: 3,
            placeholder: "Ingresa tu contrasena",
            label: "Contrasena",
            isRequired: true
        },
        confirm_password: {
            order: 4,
            placeholder: "Confirma tu contrasena",
            label: "Confirma contrasena",
            isRequired: true
        }
    }
}

const Auth = ({ children }: { children: React.ReactNode }) => {

    const { user } = useAuthenticator((context) => [context.user])
    const router = useRouter();
    const pathname = usePathname();

    const isAuthPage = pathname.match(/^\/(signin|signup)$/);//regex
    const isDashboardPage = pathname.startsWith("/manager") || pathname.startsWith("/tenants")

    //Cuando los usuarios autenticados quieran  ir a la pagina de inicio de sesion o registro, seran dirigidos al url: /
    useEffect(() => {
        if (user && isAuthPage) {
            router.push("/")
        }
    }, [user, isAuthPage, router])

    //Permitir acceso a paginas publis sin autenticacion

    if (!isAuthPage && !isDashboardPage) {
        return <>{children}</>
    }

    return (
        <div className='h-full'>
            <Authenticator
                initialState={pathname.includes("signup") ? "signUp" : "signIn"}
                components={components}
                formFields={formFields}
            >
                {() => <>{children}</>}
            </Authenticator>
        </div>
    );
}
export default Auth;