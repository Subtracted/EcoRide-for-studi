CREATE TABLE IF NOT EXISTS preferences_custom (
    id SERIAL PRIMARY KEY,
    utilisateur_id INTEGER REFERENCES utilisateurs(id),
    preference_name VARCHAR(100) NOT NULL,
    preference_value BOOLEAN DEFAULT true,
    UNIQUE(utilisateur_id, preference_name)
);

INSERT INTO preferences_custom (utilisateur_id, preference_name, preference_value)
VALUES 
    (1, 'fumeur', false),
    (1, 'animaux', true); 