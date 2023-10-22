# FLAT - Fungible Leveraged Assets Token

Is an ensemble of new contracts and dapps that connect together to form DIY CPI inflation hedging 
products that are fungible, liquid, composable, and cross-chain.

 There are 3 main components. First is  a frontend for deploying tokens with Leveraged options-like payoffs tracking the future price of a CPI component such as food, cars, and houses, backed by the UMA Optimistic Oracle and dispute resolution system. For each item there are both Leveraged long and short tokens and they are bridged from Polygon using Axelar to chains like Mantle, Scroll, Linea, etc.

The 2nd component is the Basket Weaver. This is where anyone can define their own CPI baskets of goods with their own chosen weights. The baskets are deployed as contracts that are compatible with ERC-4626 but extend the standard by supporting vaults storing multiple tokens with relative weights per token. This is how you compose a DIY CPI. You can also trade baskets that are weighted to only CPI components you are sensitive to, such as rising energy and transportation costs.

The 3rd component is a new kind of non-custodial limit order book exchange settled on chain using offer intents that are matched p2p over XMTP.This solves the problem of price discovery for synthetic price tokens. Options are not suitable for AMM style dexes. This new exchange connects hedgers and speculators without impermanent loss and without any need for DAO token incentives.