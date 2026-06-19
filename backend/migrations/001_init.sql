    CREATE TABLE utilisateur (
        id UUID PRIMARY KEY,
        telephone VARCHAR(20) UNIQUE NOT NULL,
        nom VARCHAR(20) NOT NULL,
        identity VARCHAR(50) UNIQUE NOT NULL,
        statut VARCHAR(20) NOT NULL DEFAULT 'actif',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE portefeuille (
        id UUID PRIMARY KEY,
        utilisateur_id UUID UNIQUE NOT NULL,
        solde BIGINT DEFAULT 0 NOT NULL,
        version INTEGER DEFAULT 1 NOT NULL,  
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id)
    );
    CREATE TABLE transaction (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        amount BIGINT NOT NULL,
        type VARCHAR(20) DEFAULT 'transfert',
        reference VARCHAR(50) UNIQUE NOT NULL,
        portefeuille_expediteur_id UUID NOT NULL,
        portefeuille_destinataire_id UUID NOT NULL,
        status VARCHAR(20) DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (portefeuille_expediteur_id) REFERENCES portefeuille(id),
        FOREIGN KEY (portefeuille_destinataire_id) REFERENCES portefeuille(id)
   );
    CREATE TABLE alerte_fraude (
        id SERIAL PRIMARY KEY,
        transaction_id UUID REFERENCES transaction(id) NOT NULL,
        description TEXT NOT NULL,
        detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );


