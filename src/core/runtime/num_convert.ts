const numToBytes64 = (num: number, isSigned: boolean): number[] => {
  if (isSigned) {
    const typedArr = new BigInt64Array(1);
    typedArr[0] = BigInt(num);
    return Array.from(new Uint8Array(typedArr.buffer));
  } else {
    const typedArr = new BigUint64Array(1);
    typedArr[0] = BigInt(num);
    return Array.from(new Uint8Array(typedArr.buffer));
  }
};

const numToBytes = (
  num: number,
  bits: 8 | 16 | 32 | 64,
  signed: boolean
): number[] => {
  if (bits === 64) {
    return numToBytes64(num, signed);
  }

  let typedArr:
    | Int8Array
    | Int16Array
    | Int32Array
    | Uint8Array
    | Uint16Array
    | Uint32Array;
  if (signed) {
    switch (bits) {
      case 8:
        typedArr = new Int8Array(1);
        break;
      case 16:
        typedArr = new Int16Array(1);
        break;
      case 32:
        typedArr = new Int32Array(1);
        break;
    }
  } else {
    switch (bits) {
      case 8:
        typedArr = new Uint8Array(1);
        break;
      case 16:
        typedArr = new Uint16Array(1);
        break;
      case 32:
        typedArr = new Uint32Array(1);
        break;
    }
  }

  typedArr[0] = num;

  return Array.from(new Uint8Array(typedArr.buffer));
};

const numToBytesFloat = (num: number, double: boolean): number[] => {
  const typedArr = double ? new Float64Array(1) : new Float32Array(1);

  typedArr[0] = num;

  return Array.from(new Uint8Array(typedArr.buffer));
};

const bytesToNum64 = (bytes: number[], isSigned: boolean): number => {
  const typedArr = isSigned
    ? new BigInt64Array(new Uint8Array(bytes).buffer)
    : new BigUint64Array(new Uint8Array(bytes).buffer);
  if (isSigned) {
    return Number(typedArr[0]);
  } else {
    return Number(typedArr[0]);
  }
};

const bytesToNum = (
  bytes: number[],
  bits: 8 | 16 | 32 | 64,
  signed: boolean
): number => {
  if (bits === 64) {
    return bytesToNum64(bytes, signed);
  }

  let typedArr:
    | Int8Array
    | Int16Array
    | Int32Array
    | Uint8Array
    | Uint16Array
    | Uint32Array;
  if (signed) {
    switch (bits) {
      case 8:
        typedArr = new Int8Array(new Uint8Array(bytes).buffer);
        break;
      case 16:
        typedArr = new Int16Array(new Uint8Array(bytes).buffer);
        break;
      case 32:
        typedArr = new Int32Array(new Uint8Array(bytes).buffer);
        break;
    }
  } else {
    switch (bits) {
      case 8:
        typedArr = new Uint8Array(new Uint8Array(bytes).buffer);
        break;
      case 16:
        typedArr = new Uint16Array(new Uint8Array(bytes).buffer);
        break;
      case 32:
        typedArr = new Uint32Array(new Uint8Array(bytes).buffer);
        break;
    }
  }

  return typedArr[0];
};

const bytesToNumFloat = (bytes: number[], double: boolean): number => {
  const typedArr = double
    ? new Float64Array(new Uint8Array(bytes).buffer)
    : new Float32Array(new Uint8Array(bytes).buffer);

  return typedArr[0];
};

export { numToBytes, bytesToNum, numToBytesFloat, bytesToNumFloat };
