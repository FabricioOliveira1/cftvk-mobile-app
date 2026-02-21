import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function createBoxAndAdmin(
  uid: string,
  email: string,
  name: string
): Promise<string> {
  const boxRef = await addDoc(collection(db, 'boxes'), {
    name: 'Meu Box CrossFit',
    address: '',
    ownerId: uid,
  });

  await setDoc(doc(db, 'users', uid), {
    name: name || 'Admin',
    email,
    role: 'admin',
    boxId: boxRef.id,
    createdAt: serverTimestamp(),
  });

  return boxRef.id;
}
