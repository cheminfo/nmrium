const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const base62 = Base(BASE62);

const LENGTH = 8;
const bytes = new Uint8Array(LENGTH);

export default function generateID() {
  for (let i = 0; i < LENGTH; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return base62.encode(bytes).substring(0, 8);
}

// base-x encoding / decoding
// https://github.com/cryptocoinjs/base-x/blob/master/src/index.js
// Copyright (c) 2018 base-x contributors
// Copyright (c) 2014-2018 The Bitcoin Core developers (base58.cpp)
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.
// @ts-ignore
function Base(ALPHABET) {
  if (ALPHABET.length >= 255) {
    throw new TypeError('Alphabet too long');
  }
  let BASE_MAP = new Uint8Array(256);
  for (let j = 0; j < BASE_MAP.length; j++) {
    BASE_MAP[j] = 255;
  }
  for (let i = 0; i < ALPHABET.length; i++) {
    let x = ALPHABET.charAt(i);
    let xc = x.charCodeAt(0);
    if (BASE_MAP[xc] !== 255) {
      throw new TypeError(`${x} is ambiguous`);
    }
    BASE_MAP[xc] = i;
  }
  let BASE = ALPHABET.length;
  let LEADER = ALPHABET.charAt(0);
  let FACTOR = Math.log(BASE) / Math.log(256); // log(BASE) / log(256), rounded up
  let iFACTOR = Math.log(256) / Math.log(BASE); // log(256) / log(BASE), rounded up

  function encode(source) {
    if (source.length === 0) {
      return '';
    }
    // Skip & count leading zeroes.
    let zeroes = 0;
    let length = 0;
    let pbegin = 0;
    let pend = source.length;
    while (pbegin !== pend && source[pbegin] === 0) {
      pbegin++;
      zeroes++;
    }
    // Allocate enough space in big-endian base58 representation.
    let size = ((pend - pbegin) * iFACTOR + 1) >>> 0;
    let b58 = new Uint8Array(size);
    // Process the bytes.
    while (pbegin !== pend) {
      let carry = source[pbegin];
      // Apply "b58 = b58 * 256 + ch".
      let i = 0;
      for (
        let it1 = size - 1;
        (carry !== 0 || i < length) && it1 !== -1;
        it1--, i++
      ) {
        carry += (256 * b58[it1]) >>> 0;
        b58[it1] = carry % BASE >>> 0;
        carry = (carry / BASE) >>> 0;
      }
      if (carry !== 0) {
        throw new Error('Non-zero carry');
      }
      length = i;
      pbegin++;
    }
    // Skip leading zeroes in base58 result.
    let it2 = size - length;
    while (it2 !== size && b58[it2] === 0) {
      it2++;
    }
    // Translate the result into a string.
    let str = LEADER.repeat(zeroes);
    for (; it2 < size; ++it2) {
      str += ALPHABET.charAt(b58[it2]);
    }
    return str;
  }
  return {
    encode,
  };
}
