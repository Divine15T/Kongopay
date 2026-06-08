# Kongopay Solution de Monnaie Électronique et d'Inclusion Financière Souveraine

## Description
KongoPay une application de mobile money insiprée d'Orange et MTN Mobile Money, mais version qouveraine congolaise. Elle permettra aux citoyens d'e,voyer de l'argent par QR Code et à la Banque Centrale de superviser toutes les transactions.

## Architecture

-**Backend**: Node.js +Express
-**Base de donées**: PostgreSQL (Ledger)
-**Frontend**: HTML/CSS/JS (mobile-first)

## Structure du projet

kongopay/
|----> frontend/#Interface mobile (Pas encore disponible)
|----> backend/
|   |-->migrations/#Scripts SQL
|   | |__> 001_init.sql
|   |___src/
|    |--->routes/ #API (transfert, qrcode, admin)
|    |--->db.js #Connexion PostgreSQL
|    |__>server.js #Serveur Express
|--->docs/
| |____> mcd.png#Modèle conceptuel des données
|____> README.md


## Modèle conceptuel de données 

4 tables: 
-`Utilisateur`: KYC des citoyens
-`Portefeuille`: solde et version (optimisme lockingp
-`Transaction`: ledger immuable (pas de DELETE/UPDATE)
-`Alerte_fraude`: détection des doubles dépenses

## API -Transfert d'argent
### Endpoint 
     `Post/transfert`
###Corps de la requete (JSON)
     ```json
{
 "from_portefeuille_id": "uuid_expediteur",
 "to_portefeuille_id": "uuid_destinataire",
 "amount":1000
 }
"message": "Transfert réussi",

## Anti-double-dépense
La transaction utilise ACID avec: 
- BEGIN/COMMIT/ROLLBACK
- SELECT .... FOR UPDATE
- Mise à jour des soldes

## Sécurité

-UUID à la place de l'ID 
-Transactions ACID 
-Row-level locking 
-Ledger immuable


