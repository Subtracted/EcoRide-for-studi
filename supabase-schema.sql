-- Script SQL pour créer le schéma EcoRide dans Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- Table utilisateurs
CREATE TABLE public.utilisateurs (
    id SERIAL PRIMARY KEY,
    pseudo VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    telephone VARCHAR(20),
    photo_url VARCHAR(255),
    note NUMERIC(2,1) DEFAULT 5.0,
    date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nombre_avis INTEGER DEFAULT 0,
    type_utilisateur VARCHAR(20) DEFAULT 'passager',
    credits INTEGER DEFAULT 20,
    role VARCHAR(20) DEFAULT 'utilisateur',
    statut VARCHAR(20) DEFAULT 'actif',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_role CHECK (role IN ('utilisateur', 'employe', 'admin')),
    CONSTRAINT check_statut CHECK (statut IN ('actif', 'suspendu'))
);

-- Table vehicules
CREATE TABLE public.vehicules (
    id SERIAL PRIMARY KEY,
    conducteur_id INTEGER REFERENCES utilisateurs(id),
    marque VARCHAR(50) NOT NULL,
    modele VARCHAR(50) NOT NULL,
    annee INTEGER,
    couleur VARCHAR(30),
    places INTEGER NOT NULL,
    est_ecologique BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table preferences
CREATE TABLE public.preferences (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table trajets
CREATE TABLE public.trajets (
    id SERIAL PRIMARY KEY,
    conducteur_id INTEGER REFERENCES utilisateurs(id),
    vehicule_id INTEGER REFERENCES vehicules(id),
    depart VARCHAR(100) NOT NULL,
    arrivee VARCHAR(100) NOT NULL,
    date_depart TIMESTAMP NOT NULL,
    date_arrivee TIMESTAMP,
    prix NUMERIC(10,2) NOT NULL,
    places_totales INTEGER NOT NULL,
    places_restantes INTEGER NOT NULL,
    est_ecologique BOOLEAN DEFAULT false,
    commentaire TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table reservations
CREATE TABLE public.reservations (
    id SERIAL PRIMARY KEY,
    trajet_id INTEGER REFERENCES trajets(id),
    passager_id INTEGER REFERENCES utilisateurs(id),
    date_reservation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(20) DEFAULT 'en_attente',
    prix_total NUMERIC(10,2) NOT NULL,
    nombre_places INTEGER NOT NULL,
    CONSTRAINT check_statut_reservation CHECK (statut IN ('en_attente', 'confirmee', 'annulee'))
);

-- Table avis
CREATE TABLE public.avis (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER REFERENCES reservations(id),
    note INTEGER CHECK (note >= 1 AND note <= 5),
    commentaire TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(20) DEFAULT 'en_attente',
    CONSTRAINT check_statut_avis CHECK (statut IN ('en_attente', 'valide', 'refuse'))
);

-- Table preferences_custom
CREATE TABLE public.preferences_custom (
    id SERIAL PRIMARY KEY,
    conducteur_id INTEGER REFERENCES utilisateurs(id),
    description VARCHAR(255) NOT NULL
);

-- Table utilisateur_preferences
CREATE TABLE public.utilisateur_preferences (
    utilisateur_id INTEGER REFERENCES utilisateurs(id),
    preference_id INTEGER REFERENCES preferences(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (utilisateur_id, preference_id)
);

-- Table signalements
CREATE TABLE public.signalements (
    id SERIAL PRIMARY KEY,
    trajet_id INTEGER REFERENCES trajets(id),
    passager_id INTEGER REFERENCES utilisateurs(id),
    description TEXT NOT NULL,
    date_signalement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(20) DEFAULT 'en_cours',
    resolution_commentaire TEXT,
    CONSTRAINT check_statut_signalement CHECK (statut IN ('en_cours', 'traite', 'ignore'))
);

-- Table credits_plateforme
CREATE TABLE public.credits_plateforme (
    id SERIAL PRIMARY KEY,
    trajet_id INTEGER REFERENCES trajets(id),
    montant INTEGER NOT NULL,
    date_transaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion de quelques préférences par défaut
INSERT INTO public.preferences (nom) VALUES 
('Musique autorisée'),
('Animaux acceptés'),
('Bagages volumineux'),
('Conversation'),
('Non-fumeur'),
('Climatisation');

-- Création des index pour améliorer les performances
CREATE INDEX idx_trajets_depart ON public.trajets(depart);
CREATE INDEX idx_trajets_arrivee ON public.trajets(arrivee);
CREATE INDEX idx_trajets_date ON public.trajets(date_depart);
CREATE INDEX idx_reservations_statut ON public.reservations(statut);
CREATE INDEX idx_utilisateurs_email ON public.utilisateurs(email);
CREATE INDEX idx_utilisateurs_statut ON public.utilisateurs(statut);

-- Activer RLS (Row Level Security) pour Supabase
ALTER TABLE public.utilisateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trajets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicules ENABLE ROW LEVEL SECURITY;

-- Politique de sécurité basique (à adapter selon vos besoins)
CREATE POLICY "Public read access" ON public.trajets FOR SELECT USING (true);
CREATE POLICY "Users can insert their own trajets" ON public.trajets FOR INSERT WITH CHECK (auth.uid()::text = conducteur_id::text);
CREATE POLICY "Users can update their own trajets" ON public.trajets FOR UPDATE USING (auth.uid()::text = conducteur_id::text);

-- Créer un utilisateur administrateur par défaut
INSERT INTO public.utilisateurs (pseudo, email, mot_de_passe, nom, prenom, role, credits) VALUES 
('admin', 'admin@ecoride.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'EcoRide', 'admin', 100);

COMMIT; 