import { addDoc, collection } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { TalhaoCadastro } from "./talhaoCadastro";
import { criarPayloadTalhaoFirestore } from "./talhaoFirestorePayload";

export async function salvarTalhaoCadastro(
  talhao: TalhaoCadastro,
  producerId?: string,
) {
  const payload = criarPayloadTalhaoFirestore(talhao, producerId);
  const ref = await addDoc(collection(db, "talhoes"), payload);

  return {
    id: ref.id,
    ...payload,
  };
}