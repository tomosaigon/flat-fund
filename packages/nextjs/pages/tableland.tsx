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

interface TableSchema {
    id: number;
    val: string;
}

const ExampleUI: NextPage = () => {
    const { data: walletClient, isError, isLoading, status } = useWalletClient({ chainId: 80001 });
    // const { data: walletClient, isError, isLoading, status } = useWalletClient({  });
    useEffect(() => {
        if (isLoading) return;
        console.log(status);
        console.log(walletClient);
        if (walletClient === undefined) return;
        (async () => {
            // const [signer] = await getSigners();
            // console.log(signer);
            debugger
            // const db = new Database({ signer });
            // const { data: walletClient } = useWalletClient({ chainId: 80001 });
            const signer = walletClientToSigner(walletClient as WalletClient)
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

        })();
    }, [walletClient]);

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
            {/* <div className="grid lg:grid-cols-2 flex-grow" data-theme="TablelandUi">
                <ContractInteraction />
                <ContractData />
            </div> */}
        </>
    );
};

export default ExampleUI;
