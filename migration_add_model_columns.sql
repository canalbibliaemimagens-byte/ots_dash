-- Execute esse comando no SQL Editor do Supabase Dashboard (https://supabase.com/dashboard/project/_/sql)

-- Adiciona as colunas necessárias para o funcionamento do Preditor
ALTER TABLE trading_models
ADD COLUMN IF NOT EXISTS model_path TEXT,
ADD COLUMN IF NOT EXISTS format_version TEXT DEFAULT '2.0';

-- Comentário opcional para documentação
COMMENT ON COLUMN trading_models.model_path IS 'Caminho local do arquivo modelo para o Preditor carregar';
COMMENT ON COLUMN trading_models.format_version IS 'Versão do formato do arquivo modelo (ex: 2.0)';
