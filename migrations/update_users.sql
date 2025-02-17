-- Vérifier si la colonne credits existe, sinon la créer
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='utilisateurs' AND column_name='credits'
    ) THEN
        ALTER TABLE utilisateurs ADD COLUMN credits INTEGER DEFAULT 20;
    END IF;
END $$;

-- Mettre à jour tous les utilisateurs pour avoir 20 crédits
UPDATE utilisateurs SET credits = 20; 