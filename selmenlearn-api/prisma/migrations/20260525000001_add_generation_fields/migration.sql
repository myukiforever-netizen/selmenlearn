-- Migration: add_generation_fields
-- Ajoute les champs de suivi de génération sur le modèle Deck
-- et les options de génération

-- Champs de statut de génération
ALTER TABLE "Deck" ADD COLUMN "generationStatus"   TEXT NOT NULL DEFAULT 'idle';
ALTER TABLE "Deck" ADD COLUMN "generationProgress" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Deck" ADD COLUMN "generationError"    TEXT;

-- Options de génération (stockées en JSON)
ALTER TABLE "Deck" ADD COLUMN "generationOptions"  TEXT;

-- Index pour les requêtes de statut
CREATE INDEX "Deck_generationStatus_idx" ON "Deck"("generationStatus");
