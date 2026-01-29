"use client";

import StoreProvider from "@/state/redux";
import { Authenticator } from "@aws-amplify/ui-react";
import Auth from "./(auth)/authProvider";
import { AuthUserProvider } from "@/context/AuthContext";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <Authenticator.Provider>
        <AuthUserProvider>
          <Auth>{children}</Auth>
        </AuthUserProvider>
      </Authenticator.Provider>
    </StoreProvider>
  );
};

export default Providers;
