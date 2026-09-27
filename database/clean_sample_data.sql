-- =====================================================================
-- TIMELENS — CLEAN ALL SAMPLE / DEMO DATA SCRIPT
-- Removes all rows from notifications, goals, activities, tasks,
-- daily_entries, and users (resetting auto-increment IDs to 1) while
-- keeping all tables, columns, foreign keys, constraints, and indexes intact.
-- =====================================================================

BEGIN;

DELETE FROM notifications;
DELETE FROM goals;
DELETE FROM activities;
DELETE FROM tasks;
DELETE FROM daily_entries;
DELETE FROM users;

ALTER SEQUENCE IF EXISTS users_user_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS daily_entries_daily_entry_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS tasks_task_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS activities_activity_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS goals_goal_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS notifications_notification_id_seq RESTART WITH 1;

COMMIT;
