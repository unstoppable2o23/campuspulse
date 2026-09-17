🎓 CampusPulse

A student guidance platform with a Superadmin → Counsellors → Students hierarchy,live dashboard updates, and automatic counsellor assignment.
Features

    🔐 Three roles — Superadmin, Counsellors, Students, each with their own dashboard
    📝 3-step student registration — auto-assigns each student to the least-loaded counsellor
    📊 Live dashboards — registration momentum chart, counsellor performance, rising subjects (hand-rolled SVG, no chart libs)
    🔴 Real-time updates — zero-dependency WebSocket server; registrations & status changes push instantly
    📜 Status history — every student's status transitions are recorded with who changed them and when
    ✨ Magic-link login — students can sign in via emailed link (Supabase Auth)
    📥 CSV export — Superadmin exports all students, counsellors export their own
    🌱 Auto-seeding — seeds 50+ demo users on first boot against an empty database
