# Theme match
- [x] Switch the default appearance to the requested light, milky glass theme, not dark.
- [x] Copy luoancientmovies.com colours, fonts, glass panels and pastel background.
- [x] Match sidebar, header card, phone bottom dock, player and slideshow styling.
- [x] Verify home and music pages on phone and desktop.

# Auto-update after publish
- [x] Check open tabs more often and reload them when a new version is live.
- [x] Apply the update at the end of the current song, and no later than two minutes after it appears.
- [x] Stop reloading twice in a row and ask the listener to reopen the page instead.

# Admin user activities
- [x] Implement non-sensitive visitor click recording in the existing app storage.
- [x] Add an admin-only activity view and confirmed clear-all action.
- [x] Pass click/privacy/clearing tests and verify signed-out admin access is blocked.
- [ ] Activate Firebase activity rules and verify real admin recording/readback/clearing (blocked: no Firebase deployment authorization or admin test session is available).

# Activity recording and mobile admin
- [x] Improve safe click descriptions and expose recording failures to admins.
- [x] Provide complete replacement Firestore rules allowing guest/member activity creation and admin-only reading/clearing.
- [x] Adapt admin navigation and activity records for narrow phones; 16 capture/service tests pass and phone/desktop presentation checked with isolated sample data (live admin verification remains blocked above).
