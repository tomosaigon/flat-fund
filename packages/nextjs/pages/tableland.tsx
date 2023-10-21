import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
// import { ContractData } from "~~/components/example-ui/ContractData";
// import { ContractInteraction } from "~~/components/example-ui/ContractInteraction";

import { type WalletClient, useWalletClient } from 'wagmi'
import { providers, getDefaultProvider, Signer } from 'ethers'

import { Database } from "@tableland/sdk";
import { useEffect } from "react";
// const db = new Database({ signer });

function walletClientToSigner(walletClient: WalletClient) {
    const { account, chain, transport } = walletClient
    const network = {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
    }
    const provider = new providers.Web3Provider(transport, network)
    const signer = provider.getSigner(account.address)
    return signer
}

const matcherBobbyTables = async (walletClient: WalletClient) => {
    // const [signer] = await getSigners();
    // console.log(signer);
    debugger
    // const db = new Database({ signer });
    // const { data: walletClient } = useWalletClient({ chainId: 80001 });
    const signer = walletClientToSigner(walletClient)
    const db = new Database({ signer });

    const prefix = "my_table";
    // const { meta: create } = await db
    //   .prepare(`CREATE TABLE ${prefix} (id integer primary key, val text);`)
    //   .run();

    // // The table's `name` is in the format `{prefix}_{chainId}_{tableId}`
    // const tableName = create.txn?.name ?? ""; // e.g., my_table_31337_2
    // await create.txn?.wait();

    const tableName = 'matcher_80001_7922';
    // const { meta: insert } = await db
    //   .prepare(`INSERT INTO ${tableName} (id, val) VALUES (?, ?);`)
    //   .bind(0, "Bobby Tables")
    //   .run();
    const { meta: insert } = await db
        .prepare(`INSERT INTO ${tableName} (token, xmtp) VALUES (?, ?);`)
        .bind("Bobby", "Tables")
        .run();

    console.log(insert);
    // Wait for transaction finality
    await insert.txn?.wait();
    console.log(insert);

    const { results } = await db.prepare(`SELECT * FROM ${tableName};`).all();
    console.log(results);

}
const pipsAdd = async (walletClient: WalletClient) => {
    // const { data: walletClient } = useWalletClient({ chainId: 80001 });
    const signer = walletClientToSigner(walletClient)
    const db = new Database({ signer });

    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const prefix = "pips";
    const tableName = 'pips_80001_8036';
    const { meta: insert } = await db
        // .prepare(`INSERT INTO ${tableName} (id, addr) VALUES (?, ?);`)
        .prepare(`INSERT INTO ${tableName} (addr) VALUES (?);`)
        .bind("0x9820E0447e7633d765c4AcD583ef94D0eB" + hh + mm + ss)
        .run();

    console.log(insert);
    // Wait for transaction finality
    await insert.txn?.wait();
    console.log(insert);

    const { results } = await db.prepare(`SELECT * FROM ${tableName};`).all();
    console.log(results);

}

const TableUI: NextPage = () => {
    // const { data: walletClient, isError, isLoading, status } = useWalletClient({ chainId: 80001 });
    const { data: walletClient, isError, isLoading, status } = useWalletClient({  });
    return (
        <>
            <MetaHeader
                title="Tableland UI | Scaffold-ETH 2"
                description="Tableland UI created with 🏗 Scaffold-ETH 2, showcasing some of its features."
            >
                {/* We are importing the font this way to lighten the size of SE2. */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />
            </MetaHeader>

            <div className="grid lg:grid-cols-2 flex-grow" data-theme="TablelandUi">
                <button
                    disabled={isLoading || isError}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    // onClick={() => matcherBobbyTables(walletClient as WalletClient)}
                    onClick={() => pipsAdd(walletClient as WalletClient)}
                >
                    Click Me
                </button>
            </div>
        </>
    );
};

export default TableUI;
