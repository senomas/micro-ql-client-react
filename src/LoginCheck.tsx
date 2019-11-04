import React, { PropsWithChildren, useContext, useState } from "react";
// import PropTypes from "prop-types";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { Login } from "./Login";
import { getGraphqlError } from "./lib";
import { AppContext } from "./App";

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

export const LoginCheck: React.FC<PropsWithChildren<any>> = ({ children }) => {
  const appContext = useContext(AppContext);
  const [token, handleToken] = useState<string | null>(appContext.token);
  const { loading, error, data } = useQuery(queryMe, {
    variables: {
      ts: `${Math.floor(Date.now() / 5000)}`
    }
  });

  console.log("RENDER LOGIN-CHECK", { appContext, loading, error, data });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    const err = getGraphqlError(error);
    if (err.code === "SessionExpiredError") {
      sessionStorage.clear();
      appContext.token = null;
    }
    console.log({ err, error });
    return <div>Error.</div>;
  }

  if (!data.me.name) {
    const setToken = (newToken: string | null) => {
      console.log("set");
      if (appContext.token !== newToken) {
        console.log("setNewToken", { appContext, newToken });
        appContext.token = newToken;
        handleToken(newToken);
      } else {
        console.log("ignore setToken", { appContext });
      }
    };

    return <Login handleToken={setToken} />;
  }

  if (data.me.token.seq) {
    sessionStorage.setItem("seq", data.me.token.seq);
  }

  return children;
};
