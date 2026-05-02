'use client';

import { useState, useEffect } from 'react';
import { signInWithPopup, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';
import { UserProfile } from '@/types';

export default function GoogleLogin() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user has a profile in localStorage
      const localProfileStr = localStorage.getItem('matdaan-profile');
      
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists() && localProfileStr) {
        // Sync local profile to Firestore
        const localProfile = JSON.parse(localProfileStr);
        await setDoc(userRef, {
          ...localProfile,
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          syncedToCloud: true,
        });
        
        // Update local storage to show synced status
        localStorage.setItem('matdaan-profile', JSON.stringify({
          ...localProfile,
          uid: user.uid,
          syncedToCloud: true
        }));
      } else if (docSnap.exists()) {
        // Pull down profile from Firestore to local
        localStorage.setItem('matdaan-profile', JSON.stringify(docSnap.data() as UserProfile));
      }

    } catch (error) {
      console.error('Error signing in with Google:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut(auth);
  };

  if (loading) {
    return <div style={{ fontSize: 12, color: 'var(--muted-fg)' }}>Loading...</div>;
  }

  if (user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{user.displayName}</span>
          <span style={{ fontSize: 12, color: 'var(--primary)' }}>Cloud Synced</span>
        </div>
        {user.photoURL && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img 
            src={user.photoURL} 
            alt="Profile" 
            style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid var(--primary)' }} 
          />
        )}
        <button 
          onClick={handleSignOut}
          style={{ fontSize: 12, color: 'var(--muted-fg)', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none' }}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={handleSignIn}
      className="btn-secondary"
      style={{ padding: '8px 16px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      Sign in with Google
    </button>
  );
}
