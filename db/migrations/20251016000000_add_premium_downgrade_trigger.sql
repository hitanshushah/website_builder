-- migrate:up

-- Function to handle premium plan downgrade
CREATE OR REPLACE FUNCTION handle_premium_downgrade()
RETURNS TRIGGER AS $$
DECLARE
    default_template_id INTEGER;
    default_color_id INTEGER;
    current_template_id INTEGER;
    current_color_id INTEGER;
BEGIN
    -- Only trigger if premium_plan_id changed to basic (1)
    IF NEW.premium_plan_id = 1 AND OLD.premium_plan_id > 1 THEN
        
        -- Get default template ID (template with is_default = true)
        SELECT id INTO default_template_id 
        FROM templates 
        WHERE is_default = true 
        AND deleted_at IS NULL 
        AND is_active = true 
        LIMIT 1;
        
        -- Get default color ID (color with is_default = true)
        SELECT id INTO default_color_id 
        FROM colors 
        WHERE is_default = true 
        AND deleted_at IS NULL 
        AND is_active = true 
        LIMIT 1;
        
        -- Get current user's template and color preferences
        SELECT template_id, color_id INTO current_template_id, current_color_id
        FROM user_templates 
        WHERE user_id = NEW.id 
        AND is_active = true 
        AND deleted_at IS NULL 
        LIMIT 1;
        
        -- Check if user has a premium template selected
        IF current_template_id IS NOT NULL THEN
            IF EXISTS (
                SELECT 1 FROM templates 
                WHERE id = current_template_id 
                AND is_premium = true 
                AND deleted_at IS NULL
            ) THEN
                -- Downgrade to default template
                UPDATE user_templates 
                SET template_id = default_template_id, updated_at = NOW()
                WHERE user_id = NEW.id 
                AND is_active = true 
                AND deleted_at IS NULL;
                
                -- Log the change (optional)
                RAISE NOTICE 'User % downgraded from premium template % to default template %', 
                    NEW.id, current_template_id, default_template_id;
            END IF;
        END IF;
        
        -- Check if user has custom colors and soft delete them
        IF current_color_id IS NOT NULL THEN
            -- Soft delete all custom colors created by this user
            UPDATE colors 
            SET disable_color_scheme = true, updated_at = NOW()
            WHERE user_id = NEW.id 
            AND deleted_at IS NULL;
            
            -- Update user's color preference to default color
            UPDATE user_templates 
            SET color_id = default_color_id, updated_at = NOW()
            WHERE user_id = NEW.id 
            AND is_active = true 
            AND deleted_at IS NULL;
            
            -- Update any other users who were using this user's custom colors
            UPDATE user_templates 
            SET color_id = default_color_id, updated_at = NOW()
            WHERE color_id IN (
                SELECT id FROM colors 
                WHERE user_id = NEW.id 
                AND deleted_at IS NOT NULL
            ) AND deleted_at IS NULL;
            
            -- Log the change (optional)
            RAISE NOTICE 'User % custom colors soft deleted, updated to default color %', 
                NEW.id, default_color_id;
        END IF;
    END IF;

    -- Disable personal website URL if user downgrades from Pro (3) to any lower plan (<3)
    IF NEW.premium_plan_id < 3 AND OLD.premium_plan_id = 3 THEN
        UPDATE profiles 
        SET share_personal_website = false, 
            updated_at = NOW(),
            share_website = true
        WHERE user_id = NEW.id;

        -- Log the change (optional)
        RAISE NOTICE 'User % personal website URL disabled due to plan downgrade', NEW.id;
        
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on users table
CREATE TRIGGER trigger_premium_downgrade
    AFTER UPDATE OF premium_plan_id ON users
    FOR EACH ROW
    EXECUTE FUNCTION handle_premium_downgrade();

-- migrate:down
DROP TRIGGER IF EXISTS trigger_premium_downgrade ON users;
DROP FUNCTION IF EXISTS handle_premium_downgrade();
