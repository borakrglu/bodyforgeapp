-- BodyForge Premium Database Schema
-- Run this migration in your Neon PostgreSQL database

-- Add subscription fields to users table (if not exists)
ALTER TABLE users ADD COLUMN IF NOT EXISTS premium_active BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_provider VARCHAR(50); -- 'stripe', 'revenuecat', 'iyzico', 'paddle'
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50); -- 'monthly', 'yearly'
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;

-- Create usage tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  workout_generations INTEGER DEFAULT 0,
  meal_plan_generations INTEGER DEFAULT 0,
  supplement_plan_generations INTEGER DEFAULT 0,
  program_regenerations INTEGER DEFAULT 0,
  saved_programs INTEGER DEFAULT 0,
  progress_photos INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, period_start)
);

-- Create subscription history table
CREATE TABLE IF NOT EXISTS subscription_history (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  subscription_id VARCHAR(255),
  provider VARCHAR(50) NOT NULL,
  plan VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL, -- 'active', 'canceled', 'expired', 'trial'
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create PT coaching subscriptions table
CREATE TABLE IF NOT EXISTS pt_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  coach_id VARCHAR(255) NOT NULL,
  plan VARCHAR(50) NOT NULL, -- 'monthly', 'quarterly', 'yearly'
  provider VARCHAR(50) NOT NULL, -- 'iyzico', 'paddle'
  payment_id VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'TRY',
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'active', 'canceled', 'expired'
  started_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coaches table (if not exists)
CREATE TABLE IF NOT EXISTS coaches (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  tier VARCHAR(50) DEFAULT 'basic', -- 'basic', 'premium', 'elite'
  rating DECIMAL(2, 1) DEFAULT 5.0,
  specialization TEXT[], -- array of specializations
  languages TEXT[] DEFAULT ARRAY['en'],
  available BOOLEAN DEFAULT TRUE,
  max_clients INTEGER DEFAULT 20,
  current_clients INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_period ON usage_tracking(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id ON subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_pt_subscriptions_user_id ON pt_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_pt_subscriptions_coach_id ON pt_subscriptions(coach_id);
CREATE INDEX IF NOT EXISTS idx_coaches_tier ON coaches(tier);
CREATE INDEX IF NOT EXISTS idx_coaches_available ON coaches(available);

-- Insert sample coaches (optional)
INSERT INTO coaches (name, bio, tier, rating, specialization) VALUES
('Ahmet Yılmaz', 'IFBB Pro Bodybuilder, 10+ yıl deneyim', 'elite', 4.9, ARRAY['Bodybuilding', 'Contest Prep', 'Hypertrophy']),
('Elif Kaya', 'Certified Personal Trainer, Nutrition Specialist', 'premium', 4.8, ARRAY['Weight Loss', 'Nutrition', 'Women''s Fitness']),
('Murat Demir', 'Strength Coach, Powerlifting Champion', 'premium', 4.7, ARRAY['Powerlifting', 'Strength Training', 'CrossFit']),
('Zeynep Öz', 'Yoga Instructor, Wellness Coach', 'basic', 4.6, ARRAY['Yoga', 'Mobility', 'Stress Management'])
ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_usage_tracking_updated_at ON usage_tracking;
CREATE TRIGGER update_usage_tracking_updated_at
    BEFORE UPDATE ON usage_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pt_subscriptions_updated_at ON pt_subscriptions;
CREATE TRIGGER update_pt_subscriptions_updated_at
    BEFORE UPDATE ON pt_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_coaches_updated_at ON coaches;
CREATE TRIGGER update_coaches_updated_at
    BEFORE UPDATE ON coaches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
