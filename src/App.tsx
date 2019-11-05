import './App.css';

import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { setContext } from 'apollo-link-context';
import { createHttpLink } from 'apollo-link-http';
import React, { createContext, Dispatch, SetStateAction, useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import { ApolloProvider } from '@apollo/react-hooks';
import { AppBar, Button, Toolbar, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { ErrorDialog } from './ErrorDialog';
import { logout as doLogout } from './lib';
import { LoginCheck } from './LoginCheck';
import { Movie } from './Movie';
import { NavMenu } from './NavMenu';

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

const useStyles = makeStyles((theme: any) => ({
  title: {
    flexGrow: 1
  }
}));

const App: React.FC = () => {
  const [auth, handleAuth] = useState<any>(
    JSON.parse(sessionStorage.getItem("auth") || "null")
  );
  const [error, updateError] = useState<any>(null);
  const classes = useStyles();
  const updateAuth = async (value: any) => {
    if (value) {
      sessionStorage.setItem("auth", JSON.stringify(value));
    } else {
      sessionStorage.clear();
      await client.clearStore();
    }
    handleAuth(value);
  };
  const logout = async (e: any) => {
    e.stopPropagation();
    const res: boolean = await doLogout();
    if (!res) {
      console.log("LOGOUT FAILED", { res });
    }
    sessionStorage.clear();
    await client.clearStore();
    handleAuth(null);
  };
  return (
    <Router>
      <ApolloProvider client={client}>
        <AppContext.Provider value={{ auth, error, updateAuth, updateError }}>
          <ErrorDialog />
          <LoginCheck>
            <AppBar position="static">
              <Toolbar>
                <NavMenu />
                <Typography variant="h6" className={classes.title}>
                  MicroQL
                </Typography>
                <Button color="inherit" onClick={logout}>
                  Logout
                </Button>
              </Toolbar>
            </AppBar>
            <Switch>
              <Route path="/about">
                <About />
              </Route>
              <Route path="/movie">
                <Movie />
              </Route>
            </Switch>
          </LoginCheck>
        </AppContext.Provider>
      </ApolloProvider>
    </Router>
  );
};

const About: React.FC = () => {
  return <div>about</div>;
};

export default App;
