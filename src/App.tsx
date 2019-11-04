import React, { createContext, useContext } from "react";
import { ApolloProvider } from "@apollo/react-hooks";
import { ApolloClient } from "apollo-client";
import { createHttpLink } from "apollo-link-http";
import { setContext } from "apollo-link-context";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ThemeProvider } from "@chakra-ui/core";
import gql from "graphql-tag";
import logo from "./logo.svg";
import "./App.css";
import { LoginCheck } from "./LoginCheck";

const httpLink = createHttpLink({
  uri: "http://localhost:5000/graphql"
});

const authLink = setContext((_, { headers }) => {
  const token = sessionStorage.getItem("token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ""
    }
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

const queryMe = gql`
  query auth($ts: String!) {
    me(ts: $ts) {
      time
      name
      privileges
      token {
        seq
        token
      }
    }
    accountInfo {
      host
      time
      buildTime
      commits {
        abbrevHash
        subject
        authorName
        authorDate
      }
    }
  }
`;

interface Context {
  token: string | null;
}

export const AppContext = createContext<Context>({
  token: null
});

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ApolloProvider client={client}>
        <LoginCheck>
          <div className="App">
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <p>
                Edit <code>src/App.tsx</code> and save to reload.
              </p>
              <a
                className="App-link"
                href="https://reactjs.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn React
              </a>
            </header>
          </div>
        </LoginCheck>
      </ApolloProvider>
    </ThemeProvider>
  );
};

export default App;
