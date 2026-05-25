-- Migration: add_source_content
-- Stocke le texte extrait (PDF/URL/texte) pour permettre la régénération avec de nouvelles options

ALTER TABLE "Deck" ADD COLUMN "sourceContent" TEXT;
