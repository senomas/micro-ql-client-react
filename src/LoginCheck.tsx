import React, { PropsWithChildren, useContext } from "react";
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
  const { auth, updateAuth } = useContext(AppContext);
  const { loading, error, data } = useQuery(queryMe, {
    variables: {
      ts: `${Math.floor(Date.now() / 5000)}-${auth ? auth.token : ''}`
    }
  });

  console.log("RENDER LOGIN-CHECK", { loading, error, data });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    const err = getGraphqlError(error);
    if (err.code === "SessionExpiredError") {
      sessionStorage.clear();
      updateAuth(null);
    } else if ((err.code = "InvalidClientKeyError")) {
      sessionStorage.clear();
      updateAuth(null);
    }
    console.log({ err, error });
    return <div>Error.</div>;
  }

  if (!data.me.name) {
    return <Login />;
  }

  if (data.me.token && data.me.token.seq) {
    sessionStorage.setItem("seq", data.me.token.seq);
  }

  return children;
};
