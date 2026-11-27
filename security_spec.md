# ProLnk Firestore Security Specification

## 1. Data Invariants
1. **Profile Identity Isolation**: A `/users/{userId}` document can only be read (`get`) or mutated by the authenticated user whose `request.auth.uid == userId`. User listing (`list`) is strictly forbidden to prevent PII enumeration (`email`).
2. **No Self-Assigned Privilege Escalation**: On `/users/{userId}` creation, `role` MUST equal `'student'`, and on update `role`, `id`, and `createdAt` are strictly immutable.
3. **Subcollection Master Gate**: Documents in `/users/{userId}/sessions/{sessionId}`, `/users/{userId}/tasks/{taskId}`, `/users/{userId}/sketches/{sketchId}`, and `/users/{userId}/ai_chats/{chatId}` require an existing parent `/users/{userId}` document, `userId == request.auth.uid`, and strict owner-only access (`list` explicitly validates `resource.data.userId == request.auth.uid`). Messages in `/users/{userId}/ai_chats/{chatId}/messages/{messageId}` require an existing parent `ai_chats/{chatId}` document.
4. **Terminal Session Locking**: Once a tutoring session reaches `'completed'` or `'cancelled'`, all subsequent client updates are rejected; while active, owners may update schedule metadata, status transitions, or linked Google Meet details (`meetUri`, `meetCode`).
5. **Forum Integrity, Comments & Bounded Upvotes**: Creating a `/forum_posts/{postId}` or `/forum_posts/{postId}/comments/{commentId}` requires authentication with `authorId == request.auth.uid` and initial `votes == 1` / `upvotes == 1`. Post updates are split into three disjoint action branches: author content edits, community upvotes (`+/- 1`), and reply counter increments (`+1`). Comments require an existing parent `/forum_posts/{postId}` document.
6. **Temporal Integrity & Size Bounds**: Every string field enforces `.size()` limits matching `firebase-blueprint.json`; `createdAt` and `updatedAt` are bound to `request.time`.
7. **Connection Check Isolation**: `/test/{docId}` permits only single-document `get` on `docId == 'connection'` and forbids all writes and collection listing.

## 2. The "Dirty Dozen" Adversarial Payloads (Expected: PERMISSION_DENIED)
1. **Cross-User Profile Read**: User B (`uid_b`) attempts `get(/users/uid_a)` -> DENIED (`isOwner` fails).
2. **User Directory Enumeration**: Authenticated user attempts `list(/users)` -> DENIED (`allow list: if false`).
3. **Self-Assigned Admin Escalation**: User A creates `/users/uid_a` with `role: "admin"` -> DENIED (`incoming().role == 'student'` fails).
4. **Shadow Field Injection on Profile**: User A updates `/users/uid_a` with extra key `isVerified: true` -> DENIED (`affectedKeys().hasOnly(...)` fails).
5. **Immutable Role Tampering**: User A updates `/users/uid_a` changing `role` from `"student"` to `"tutor"` -> DENIED (`incoming().role == existing().role` and `affectedKeys()` fail).
6. **Client Timestamp Forgery**: User A creates `/users/uid_a` with `createdAt: "2020-01-01T00:00:00Z"` -> DENIED (`incoming().createdAt == request.time` fails).
7. **ID Poisoning Attack**: User A attempts to create `/users/uid_a/sessions/<1500-char-invalid-id>` -> DENIED (`isValidId()` fails).
8. **Orphaned Subcollection Write**: User A creates `/users/uid_a/tasks/t1` or `/users/uid_a/ai_chats/c1/messages/m1` without an existing parent document -> DENIED (`exists(...)` fails).
9. **Terminal State Mutation**: User A updates `/users/uid_a/sessions/s1` when `existing().status == 'completed'` -> DENIED (terminal state lock).
10. **Forum Author Spoofing**: User A creates `/forum_posts/p1` or `/forum_posts/p1/comments/c1` with `authorId: "uid_b"` -> DENIED (`incoming().authorId == request.auth.uid` fails).
11. **Forum Vote Manipulation Jump**: User B updates `/forum_posts/p1` setting `votes: 9999` -> DENIED (`votes == existing().votes + 1 || votes == existing().votes - 1` fails).
12. **Connection Collection Write Tampering**: Any user writes to `/test/connection` -> DENIED (`allow write: if false`).
