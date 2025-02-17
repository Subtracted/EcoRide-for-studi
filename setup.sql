CREATE DATABASE ecoride;

\c ecoride;

CREATE TABLE utilisateurs (
    id SERIAL PRIMARY KEY,
    pseudo VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(100) NOT NULL,
    credits INTEGER DEFAULT 20,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les véhicules (déplacée avant trajets)
CREATE TABLE vehicules (
    id SERIAL PRIMARY KEY,
    conducteur_id INTEGER REFERENCES utilisateurs(id),
    immatriculation VARCHAR(20) NOT NULL,
    date_immatriculation DATE NOT NULL,
    modele VARCHAR(100) NOT NULL,
    couleur VARCHAR(50) NOT NULL,
    marque VARCHAR(100) NOT NULL,
    places INTEGER NOT NULL,
    UNIQUE(immatriculation)
);

CREATE TABLE trajets (
    id SERIAL PRIMARY KEY,
    conducteur_id INTEGER REFERENCES utilisateurs(id),
    depart VARCHAR(100) NOT NULL,
    arrivee VARCHAR(100) NOT NULL,
    date_depart TIMESTAMP NOT NULL,
    places_totales INTEGER NOT NULL,
    prix DECIMAL(10,2) NOT NULL,
    est_ecologique BOOLEAN DEFAULT false,
    vehicule_id INTEGER REFERENCES vehicules(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    trajet_id INTEGER REFERENCES trajets(id),
    passager_id INTEGER REFERENCES utilisateurs(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE avis (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER REFERENCES reservations(id),
    note INTEGER CHECK (note >= 1 AND note <= 5),
    commentaire TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(reservation_id)
);

-- Table pour les préférences
CREATE TABLE preferences (
    id SERIAL PRIMARY KEY,
    conducteur_id INTEGER REFERENCES utilisateurs(id),
    fumeur BOOLEAN DEFAULT false,
    animaux BOOLEAN DEFAULT false
);

-- Table pour les préférences personnalisées
CREATE TABLE preferences_custom (
    id SERIAL PRIMARY KEY,
    conducteur_id INTEGER REFERENCES utilisateurs(id),
    description VARCHAR(255) NOT NULL
); 