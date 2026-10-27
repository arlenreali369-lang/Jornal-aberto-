# Security Specification: Jornal Aberto

## 1. Data Invariants
- Posts can be read publicly by anyone (news articles are intended for open public dissemination).
- Creating a post requires an authenticated user (`request.auth != null`).
- The `authorId` on post creation must match `request.auth.uid`.
- Updating a post requires the caller to be the original author (`authorId == request.auth.uid`), except for interactions like `likes` and `views` which have strict limited field updates.
- Deleting a post is restricted to the original author.
- Comments can be read publicly and written by authenticated users where `authorId == request.auth.uid`.
- Likes are keyed by `userId` in subcollection `/posts/{postId}/likes/{userId}`, ensuring each user can only write their own like document.

## 2. Dirty Dozen Threat Payloads
1. Spoofed Author ID on post creation (`authorId: 'victim-uid'`).
2. Post payload with oversized `content` (> 50,000 chars) causing wallet denial.
3. Post payload with oversized `coverImage` (> 800,000 bytes) exhausting document limits.
4. Non-owner attempting to modify another journalist's news post content.
5. Non-author attempting to delete another author's post.
6. Comment creation spoofing `authorId`.
7. Unauthenticated write to `/posts`.
8. Path injection with invalid characters in document ID.
9. Array explosion attack on `tags`.
10. Modifying immutable field `createdAt` on update.
11. Attempting to like on behalf of a different user ID.
12. Commenting with content exceeding 2,000 chars.
