# Documentation: Blockchain Infrastructure (Ganache)

## Vue d'ensemble
Pour le prototypage rapide du **Sujet 1**, nous utilisons **Ganache CLI**.
C'est une blockchain Ethereum personnelle qui simule un réseau complet.

## Configuration Docker
- **Image :** `trufflesuite/ganache-cli`
- **Port RPC :** `8545` (Standard Ethereum)
- **Network ID :** `5777`
- **Mnemonic :** Une phrase secrète fixe est utilisée pour générer toujours les mêmes adresses de "wallet" au démarrage, ce qui facilite les tests.
  - Phrase : `"doctor hospital wallet secure block chain audit kit commun 2024"`

## Pourquoi Ganache ?
1. **Léger :** Démarre en 2 secondes, contrairement à Hyperledger Fabric.
2. **Standard :** Compatible avec tous les outils Ethereum (Metamask, Web3j, Truffle).
3. **Gratuit :** Pas de frais de "Gas" (coût de transaction) réel, idéal pour le développement.

## Tester la connexion
Une fois le conteneur lancé, l'URL de connexion pour nos microservices sera :
`http://hospital-blockchain:8545` (depuis l'intérieur du réseau Docker)
`http://localhost:8545` (depuis votre machine Windows)
