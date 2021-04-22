const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

const LENGTH = 8;

export default function generateID() {
  let id = '';
  for (let i = 0; i < LENGTH; i++) {
    id += BASE62.charAt(Math.floor(Math.random() * 62));
  }
  return id;
}
