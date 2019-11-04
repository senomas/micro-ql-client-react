import React, {
  createContext,
  useState,
  Dispatch,
  SetStateAction,
  useRef
} from "react";
import { ApolloProvider } from "@apollo/react-hooks";
import { ApolloClient } from "apollo-client";
import { createHttpLink } from "apollo-link-http";
import { setContext } from "apollo-link-context";
import { InMemoryCache } from "apollo-cache-inmemory";
import {
  ThemeProvider,
  Button,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter
} from "@chakra-ui/core";
import "./App.css";
import { logout as doLogout } from "./lib";
import { LoginCheck } from "./LoginCheck";

const httpLink = createHttpLink({
  uri: "http://localhost:5000/graphql"
});

const authLink = setContext((_, { headers }) => {
  const auth = JSON.parse(sessionStorage.getItem("auth") || "null");
  return {
    headers: {
      ...headers,
      authorization: auth && auth.token ? `Bearer ${auth.token}` : ""
    }
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

interface Context {
  auth: any;
  error: any;
  updateAuth: Dispatch<SetStateAction<any>>;
  updateError: Dispatch<SetStateAction<any>>;
}

export const AppContext = createContext<Context>({
  auth: null,
  error: null,
  updateAuth: () => {},
  updateError: () => {}
});

const App: React.FC = () => {
  const [auth, handleAuth] = useState<any>(
    JSON.parse(sessionStorage.getItem("auth") || "null")
  );
  const [error, updateError] = useState<any>(null);
  const updateAuth = (value: any) => {
    console.log("UPDATE", { value, str: JSON.stringify(value) });
    sessionStorage.setItem("auth", JSON.stringify(value));
    handleAuth(value);
  };
  const logout = async (e: any) => {
    e.stopPropagation();
    const res: boolean = await doLogout();
    if (!res) {
      console.log("LOGOUT FAILED", { res });
    }
    sessionStorage.clear();
    handleAuth(null);
  };
  const okRef = useRef(null);
  const closeErrorDialog = () => {
    updateError(null);
  };
  return (
    <ThemeProvider>
      <ApolloProvider client={client}>
        <AppContext.Provider value={{ auth, error, updateAuth, updateError }}>
          <AlertDialog
            isOpen={error}
            leastDestructiveRef={okRef}
            onClose={closeErrorDialog}
          >
            <AlertDialogOverlay />
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                {error ? error.code : "Error"}
              </AlertDialogHeader>
              <AlertDialogBody>
                {error ? error.message || error.code : "Error"}
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={okRef} onClick={closeErrorDialog}>
                  Ok
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <LoginCheck>
            <div className="App">
              <Button mt={4} variantColor="teal" onClick={logout}>
                Logout
              </Button>
            </div>
          </LoginCheck>
        </AppContext.Provider>
      </ApolloProvider>
    </ThemeProvider>
  );
};

export default App;
