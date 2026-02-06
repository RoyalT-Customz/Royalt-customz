-- Migration 006: Update Ticket Indexes
-- Version: 2.3.0
-- Description: Add missing indexes for ticket system optimization

-- Add index for assigned_to in tickets table (for admin assignment filtering)
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);

-- Add index for updated_at in tickets table (for sorting by last update)
CREATE INDEX IF NOT EXISTS idx_tickets_updated_at ON tickets(updated_at);

-- Add index for is_admin in ticket_messages table (for filtering admin/user messages)
CREATE INDEX IF NOT EXISTS idx_ticket_messages_is_admin ON ticket_messages(is_admin);

-- Update database version
UPDATE site_settings SET value = '2.3.0' WHERE key = 'db_version';


