import * as crypto from 'crypto';
import gql from 'graphql-tag';
import * as jwt from 'jsonwebtoken';
import { client } from './App';

export const config = {
  curves: 'secp256k1',
  salt: 'd3nm4s3n0',
  aesKey: {
    iterations: 191,
    hashBytes: 32
  },
  aesSalt: {
    iterations: 297,
    hashBytes: 16
  },
  pbkdf2: {
    iterations: 573,
    hashBytes: 64
  }
};

export const ecdh = crypto.createECDH(config.curves);

export async function login({ }, login: string, password: string) {
  ecdh.generateKeys();
  console.log("get server key");
  const auth: any = {
    serverKey: Buffer.from(
      (await client.query({
        query: gql`
        query loginGetServerKey {
          auth(clientKey: "${ecdh.getPublicKey().toString('base64')}") {
            serverKey
          }
        }`,
        fetchPolicy: 'network-only'
      })).data.auth.serverKey,
      'base64'
    )
  };
  console.log("generate AES key");
  auth.secretkey = ecdh.computeSecret(auth.serverKey);
  auth.aesKey = crypto.pbkdf2Sync(
    auth.secretkey,
    config.salt,
    config.aesKey.iterations,
    config.aesKey.hashBytes,
    'sha512'
  );
  auth.aesSalt = crypto.pbkdf2Sync(
    ecdh.getPublicKey(),
    config.salt,
    config.aesSalt.iterations,
    config.aesSalt.hashBytes,
    'sha512'
  );
  console.log("encrypt loginName");
  let aes = crypto.createCipheriv('aes-256-ctr', auth.aesKey, auth.aesSalt);
  const xlogin = Buffer.concat([
    aes.update(Buffer.from(login, 'utf8')),
    aes.final()
  ]).toString('base64');
  console.log("get user salt");
  const xsalt = (await client.query({
    query: gql`
      query loginGetSalt {
        auth(clientKey: "${ecdh.getPublicKey().toString('base64')}") {
          salt(xlogin: "${xlogin}")
        }
      }`,
    fetchPolicy: 'network-only'
  })).data.auth.salt;
  console.log("encrypt password");
  const aesd = crypto.createDecipheriv('aes-256-ctr', auth.aesKey, auth.aesSalt);
  const salt = Buffer.from(
    Buffer.concat([
      aesd.update(Buffer.from(xsalt, 'base64')),
      aesd.final()
    ]).toString('utf8'),
    'base64'
  );

  const hpassword = crypto.pbkdf2Sync(
    password,
    salt,
    config.pbkdf2.iterations,
    config.pbkdf2.hashBytes,
    'sha512'
  );

  aes = crypto.createCipheriv('aes-256-ctr', auth.aesKey, auth.aesSalt);
  const xhpassword = Buffer.concat([
    aes.update(hpassword),
    aes.final()
  ]).toString('base64');

  console.log("login");
  const loginRes = (await client.query({
    query: gql`
    query login {
      auth(clientKey: "${ecdh.getPublicKey().toString('base64')}") {
        login(xlogin: "${xlogin}", xhpassword: "${xhpassword}") {
          seq token
        }
      }
    }`,
    fetchPolicy: 'network-only'
  })).data.auth.login;
  console.log("HERE", { loginRes });
  delete loginRes.__typename;
  const obj: any = jwt.decode(loginRes.token);
  return {
    ...auth,
    ...loginRes,
    clientKey: Buffer.from(obj.ck, 'base64'),
    name: obj.n,
    iat: new Date(obj.iat * 1000),
    exp: new Date(obj.exp * 1000),
    privileges: obj.p
  };
}

export async function logout({ }) {
  return (await client.query({
    query: gql`
    query logout {
      logout
    }`,
    fetchPolicy: 'network-only'
  })).data.logout;
}

export function getGraphqlError(err: any) {
  if (err.networkError) {
    const networkError = err.networkError;
    if (networkError.result && networkError.result.errors) {
      const nerr = networkError.result.errors[0];
      if (nerr.extensions) {
        return {
          ...nerr,
          code: nerr.extensions.code,
        };
      }
    }
  } else if (err.graphQLErrors && err.graphQLErrors.length > 0 && err.graphQLErrors[0].extensions && err.graphQLErrors[0].extensions.code) {
    return {
      ...err.graphQLErrors[0].extensions,
      errors: err.graphQLErrors
    }
  }
  return err;
}
