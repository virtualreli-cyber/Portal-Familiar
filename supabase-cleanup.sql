-- ============================================================
-- Portal Familiar — Script de limpieza de datos de ejemplo
-- ============================================================
-- INSTRUCCIONES:
--   1. Ejecuta este script UNA SOLA VEZ en el SQL Editor de Supabase
--      ANTES de volver a usar la app con el nuevo código.
--   2. Solo borra los registros con IDs de ejemplo (INITIAL_DATA).
--   3. NO afecta a los datos reales que hayas añadido manualmente.
-- ============================================================

-- Eventos del calendario de ejemplo
DELETE FROM calendar_events
WHERE id IN ('e1', 'e2', 'e3', 'e4', 'e5');

-- Tareas de ejemplo
DELETE FROM tasks
WHERE id IN ('t1', 't2', 't3', 't4', 't5');

-- Lista de la compra de ejemplo
DELETE FROM shopping_items
WHERE id IN ('s1', 's2', 's3', 's4', 's5');

-- Notas adhesivas de ejemplo
DELETE FROM sticky_notes
WHERE id IN ('n1', 'n2', 'n3');

-- Gastos de ejemplo
DELETE FROM expenses
WHERE id IN ('ex1', 'ex2', 'ex3', 'ex4');

-- Contactos de emergencia de ejemplo
DELETE FROM emergency_contacts
WHERE id IN ('c1', 'c2', 'c3', 'c4');

-- Intenciones católicas de ejemplo
DELETE FROM catholic_intentions
WHERE id IN ('i1', 'i2', 'i3');

-- Cumpleaños de ejemplo
DELETE FROM birthdays
WHERE id IN ('b1', 'b2', 'b3');

-- Plan de comidas de ejemplo
DELETE FROM meal_plans
WHERE day_key IN ('lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo');

-- Tareas de boda de ejemplo
-- (Se limpian las del código fuente, por ID fijo "w1".."w9")
DELETE FROM wedding_tasks
WHERE id IN ('w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8', 'w9');

-- Notas de boda de ejemplo
DELETE FROM wedding_notes
WHERE id IN ('n1', 'n2');

-- Solicitudes de recompensa de ejemplo (si las hubiera)
DELETE FROM reward_requests
WHERE id LIKE 'rr_%' AND status = 'enjoyed';

-- Configuración de ejemplo (restaura a valores vacíos si quieres empezar desde cero)
-- DESCOMENTA si quieres borrar también el nombre de la familia y la configuración:
-- DELETE FROM app_config WHERE key IN ('fam_name', 'fam_dark_mode', 'fam_theme_color');

-- ============================================================
-- NOTA: Los miembros de la familia (family_members) NO se
-- borran con este script para no perder el acceso.
-- Si quieres reiniciar también los miembros, ejecuta:
--   DELETE FROM family_members;
-- y luego recarga la app (recreará los INITIAL_MEMBERS).
-- ============================================================
