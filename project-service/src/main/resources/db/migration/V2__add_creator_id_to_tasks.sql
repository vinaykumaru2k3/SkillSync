-- Add creator_id column to tasks table
ALTER TABLE tasks ADD COLUMN creator_id UUID;

-- Set a default value for existing tasks (use the project owner as creator)
UPDATE tasks t
SET creator_id = p.owner_id
FROM board_columns bc
JOIN projects p ON bc.project_id = p.id
WHERE t.column_id = bc.id;

-- Make creator_id NOT NULL after setting default values
ALTER TABLE tasks ALTER COLUMN creator_id SET NOT NULL;
