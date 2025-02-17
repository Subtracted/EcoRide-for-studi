CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    passager_id INTEGER REFERENCES utilisateurs(id),
    trajet_id INTEGER REFERENCES trajets(id),
    date_reservation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(20) DEFAULT 'confirmé',
    UNIQUE(passager_id, trajet_id)
); 