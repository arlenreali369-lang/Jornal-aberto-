import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType, testFirestoreConnection } from '../firebase/config.ts';
import { NewsPost, NewsComment, CreatePostPayload } from '../types/news.ts';
import { INITIAL_POSTS } from '../server/defaultData.ts';

export { testFirestoreConnection };

const POSTS_PATH = 'posts';

/**
 * Bootstrap initial public news if collection is empty (disabled to preserve only user-posted news)
 */
export async function seedInitialPostsIfEmpty(): Promise<void> {
  // Respect user preference: keep only genuinely posted articles
  return;
}

/**
 * Subscribe to real-time posts feed
 */
export function subscribeToPosts(
  callback: (posts: NewsPost[]) => void,
  onError?: (error: unknown) => void
) {
  try {
    const q = query(collection(db, POSTS_PATH), orderBy('createdAt', 'desc'), limit(50));
    return onSnapshot(
      q,
      (snapshot) => {
        const posts: NewsPost[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title || '',
            subtitle: data.subtitle || '',
            content: data.content || '',
            category: data.category || 'Geral',
            coverImage: data.coverImage || '',
            coverCaption: data.coverCaption || '',
            authorName: data.authorName || 'Redator Anônimo',
            authorHandle: data.authorHandle || '@redacao',
            authorAvatar: data.authorAvatar || '',
            tags: Array.isArray(data.tags) ? data.tags : [],
            likes: typeof data.likes === 'number' ? data.likes : 0,
            views: typeof data.views === 'number' ? data.views : 0,
            featured: Boolean(data.featured),
            breakingNews: Boolean(data.breakingNews),
            comments: Array.isArray(data.comments) ? data.comments : [],
            createdAt: data.createdAt || new Date().toISOString(),
            readTimeMinutes: typeof data.readTimeMinutes === 'number' ? data.readTimeMinutes : 3,
          } as NewsPost;
        });
        callback(posts);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, POSTS_PATH);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, POSTS_PATH);
  }
}

/**
 * Create a new public news article
 */
export async function createNewsPost(payload: CreatePostPayload): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Você precisa estar autenticado para publicar uma notícia.');
  }

  // Calculate estimated reading time
  const wordCount = payload.content.trim().split(/\s+/).length;
  const readTimeMinutes = Math.max(1, Math.round(wordCount / 200));

  // Generate clean alphanumeric ID
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const slug = payload.title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .substring(0, 30)
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const postId = `${slug || 'noticia'}-${Date.now().toString(36)}-${randomSuffix}`;

  const path = `${POSTS_PATH}/${postId}`;
  const now = new Date().toISOString();

  // Enforce boundary limits from blueprint
  const newPostData = {
    title: payload.title.slice(0, 300),
    subtitle: (payload.subtitle || '').slice(0, 500),
    content: payload.content.slice(0, 50000),
    category: payload.category.slice(0, 50),
    coverImage: payload.coverImage.slice(0, 800000),
    coverCaption: (payload.coverCaption || '').slice(0, 300),
    authorId: user.uid,
    authorName: (payload.authorName || user.displayName || 'Jornalista Independente').slice(0, 100),
    authorAvatar: (payload.authorAvatar || user.photoURL || '').slice(0, 500),
    tags: (payload.tags || []).slice(0, 15).map(t => t.trim().replace(/^#/, '')),
    likes: 0,
    views: 1,
    featured: Boolean(payload.featured),
    breakingNews: Boolean(payload.breakingNews),
    readTimeMinutes,
    createdAt: now,
  };

  try {
    await setDoc(doc(db, POSTS_PATH, postId), newPostData);
    return postId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Increment view count for a post
 */
export async function incrementPostViews(postId: string): Promise<void> {
  const path = `${POSTS_PATH}/${postId}`;
  try {
    await updateDoc(doc(db, POSTS_PATH, postId), {
      views: increment(1)
    });
  } catch (error) {
    // Non-blocking for reading experience
    console.warn('Could not increment view:', error);
  }
}

/**
 * Like a post (with user tracking)
 */
export async function toggleLikePost(postId: string): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Faça login para curtir esta notícia.');
  }

  const likeRef = doc(db, `${POSTS_PATH}/${postId}/likes`, user.uid);
  const postRef = doc(db, POSTS_PATH, postId);

  try {
    const likeDoc = await getDoc(likeRef);
    if (likeDoc.exists()) {
      // Unlike
      await deleteDoc(likeRef);
      await updateDoc(postRef, {
        likes: increment(-1)
      });
      return false;
    } else {
      // Like
      await setDoc(likeRef, {
        postId,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      await updateDoc(postRef, {
        likes: increment(1)
      });
      return true;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${POSTS_PATH}/${postId}`);
  }
}

/**
 * Check if current user liked a post
 */
export async function checkIfUserLiked(postId: string): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  try {
    const likeRef = doc(db, `${POSTS_PATH}/${postId}/likes`, user.uid);
    const snap = await getDoc(likeRef);
    return snap.exists();
  } catch {
    return false;
  }
}

/**
 * Add comment to post
 */
export async function addCommentToPost(postId: string, content: string): Promise<NewsComment> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Você precisa estar autenticado para comentar.');
  }

  const commentId = `c-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const commentPath = `${POSTS_PATH}/${postId}/comments/${commentId}`;
  const now = new Date().toISOString();

  const comment: NewsComment = {
    id: commentId,
    authorName: user.displayName || 'Leitor',
    authorAvatar: user.photoURL || undefined,
    content: content.trim().slice(0, 2000),
    createdAt: now,
  };

  try {
    await setDoc(doc(db, `${POSTS_PATH}/${postId}/comments`, commentId), {
      postId,
      authorId: user.uid,
      authorName: comment.authorName,
      authorAvatar: comment.authorAvatar || '',
      content: comment.content,
      createdAt: now,
    });
    return comment;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, commentPath);
  }
}

/**
 * Subscribe to comments for a specific post
 */
export function subscribeToComments(
  postId: string,
  callback: (comments: NewsComment[]) => void,
  onError?: (error: unknown) => void
) {
  const commentsCol = collection(db, `${POSTS_PATH}/${postId}/comments`);
  const q = query(commentsCol, orderBy('createdAt', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const comments: NewsComment[] = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          authorName: data.authorName || 'Leitor',
          authorAvatar: data.authorAvatar || undefined,
          content: data.content || '',
          createdAt: data.createdAt || new Date().toISOString()
        };
      });
      callback(comments);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, `${POSTS_PATH}/${postId}/comments`);
    }
  );
}

/**
 * Delete a post (only allowed for the author)
 */
export async function deleteNewsPost(postId: string): Promise<void> {
  const path = `${POSTS_PATH}/${postId}`;
  try {
    await deleteDoc(doc(db, POSTS_PATH, postId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Update an existing news post (category, coverImage, title, etc.)
 */
export async function updateNewsPost(
  postId: string, 
  updates: Partial<NewsPost>
): Promise<void> {
  const path = `${POSTS_PATH}/${postId}`;
  try {
    const postRef = doc(db, POSTS_PATH, postId);
    await updateDoc(postRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
