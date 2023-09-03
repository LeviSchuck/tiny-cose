import {
  assertEquals,
  assertNotEquals,
  assertRejects,
} from "https://deno.land/std@0.195.0/assert/mod.ts";
import { describe, it } from "https://deno.land/std@0.195.0/testing/bdd.ts";
import {
  exportPrivateKey,
  exportPublicKey,
  exportSymmetricKey,
  importSymmetricKey,
} from "./keys.ts";
import {
  EC2_CRV_P256,
  EC2_CRV_P384,
  ECDSA_SHA_256,
  ECDSA_SHA_384,
  HMAC_SHA_256,
  HMAC_SHA_384,
  HMAC_SHA_512,
  KEY_OP_MAC_CREATE,
  KEY_OP_MAC_VERIFY,
  KEY_OP_SIGN,
  KEY_OP_VERIFY,
  KTY_EC2,
  KTY_RSA,
  KTY_SYMMETRIC,
  RSASSA_PKCS1_v1_5_SHA_256,
  RSASSA_PKCS1_v1_5_SHA_384,
  RSASSA_PKCS1_v1_5_SHA_512,
  RSASSA_PSS_SHA_256,
  RSASSA_PSS_SHA_384,
  RSASSA_PSS_SHA_512,
} from "./constants.ts";
import { CBORType } from "./deps.ts";
import {
  decodeBase64,
  decodeBase64Url,
} from "https://deno.land/x/tiny_encodings@0.2.1/encoding.ts";
import { decodeCBOR } from "https://deno.land/x/tiny_cbor@0.2.1/cbor/cbor.ts";
import { assertThrows } from "https://deno.land/std@0.195.0/assert/assert_throws.ts";

const ENCODER = new TextEncoder();

describe("Generating keys", () => {
  it("Export a dynamically RS256 generated key", async () => {
    const key = await crypto.subtle.generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: { name: "SHA-256" },
      },
      true,
      ["sign", "verify"],
    );
    const exportedPrivate = await exportPrivateKey(
      key.privateKey,
      ENCODER.encode("test@example.com"),
    );
    assertEquals(exportedPrivate.kty, KTY_RSA);
    assertEquals(exportedPrivate.key_ops, [KEY_OP_SIGN]);
    assertEquals(exportedPrivate.alg, RSASSA_PKCS1_v1_5_SHA_256);
    const exportedPublic = await exportPublicKey(
      key.publicKey,
      ENCODER.encode("test@example.com"),
    );
    assertEquals(exportedPublic.kty, KTY_RSA);
    assertEquals(exportedPublic.key_ops, [KEY_OP_VERIFY]);
    assertEquals(exportedPublic.alg, RSASSA_PKCS1_v1_5_SHA_256);
  });
  it("Export a dynamically RS384 generated key", async () => {
    const key = await crypto.subtle.generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: { name: "SHA-384" },
      },
      true,
      ["sign", "verify"],
    );
    const exportedPrivate = await exportPrivateKey(
      key.privateKey,
      ENCODER.encode("test@example.com"),
    );
    assertEquals(exportedPrivate.kty, KTY_RSA);
    assertEquals(exportedPrivate.key_ops, [KEY_OP_SIGN]);
    assertEquals(exportedPrivate.alg, RSASSA_PKCS1_v1_5_SHA_384);
    const exportedPublic = await exportPublicKey(
      key.publicKey,
      ENCODER.encode("test@example.com"),
    );
    assertEquals(exportedPublic.kty, KTY_RSA);
    assertEquals(exportedPublic.key_ops, [KEY_OP_VERIFY]);
    assertEquals(exportedPublic.alg, RSASSA_PKCS1_v1_5_SHA_384);
  });
  it("Export a dynamically RS512 generated key", async () => {
    const key = await crypto.subtle.generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: { name: "SHA-512" },
      },
      true,
      ["sign", "verify"],
    );
    const exportedPrivate = await exportPrivateKey(
      key.privateKey,
      ENCODER.encode("test@example.com"),
    );
    assertEquals(exportedPrivate.kty, KTY_RSA);
    assertEquals(exportedPrivate.key_ops, [KEY_OP_SIGN]);
    assertEquals(exportedPrivate.alg, RSASSA_PKCS1_v1_5_SHA_512);
    const exportedPublic = await exportPublicKey(
      key.publicKey,
      ENCODER.encode("test@example.com"),
    );
    assertEquals(exportedPublic.kty, KTY_RSA);
    assertEquals(exportedPublic.key_ops, [KEY_OP_VERIFY]);
    assertEquals(exportedPublic.alg, RSASSA_PKCS1_v1_5_SHA_512);
  });

  it("Export a dynamically PS256 generated key", async () => {
    const key = await crypto.subtle.generateKey(
      {
        name: "RSA-PSS",
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: { name: "SHA-256" },
      },
      true,
      ["sign", "verify"],
    );
    const exportedPrivate = await exportPrivateKey(
      key.privateKey,
      ENCODER.encode("test@example.com"),
    );
    assertEquals(exportedPrivate.kty, KTY_RSA);
    assertEquals(exportedPrivate.key_ops, [KEY_OP_SIGN]);
    assertEquals(exportedPrivate.alg, RSASSA_PSS_SHA_256);
    const exportedPublic = await exportPublicKey(
      key.publicKey,
      ENCODER.encode("test@example.com"),
    );
    assertEquals(exportedPublic.kty, KTY_RSA);
    assertEquals(exportedPublic.key_ops, [KEY_OP_VERIFY]);
    assertEquals(exportedPublic.alg, RSASSA_PSS_SHA_256);
  });

  it("Export a dynamically PS384 generated key", async () => {
    const key = await crypto.subtle.generateKey(
      {
        name: "RSA-PSS",
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: { name: "SHA-384" },
      },
      true,
      ["sign", "verify"],
    );
    const exportedPrivate = await exportPrivateKey(
      key.privateKey,
      ENCODER.encode("test@example.com"),
    );
    assertEquals(exportedPrivate.kty, KTY_RSA);
    assertEquals(exportedPrivate.key_ops, [KEY_OP_SIGN]);
    assertEquals(exportedPrivate.alg, RSASSA_PSS_SHA_384);
    const exportedPublic = await exportPublicKey(
      key.publicKey,
      ENCODER.encode("test@example.com"),
    );
    assertEquals(exportedPublic.kty, KTY_RSA);
    assertEquals(exportedPublic.key_ops, [KEY_OP_VERIFY]);
    assertEquals(exportedPublic.alg, RSASSA_PSS_SHA_384);
  });
  it("Export a dynamically PS512 generated key", async () => {
    const key = await crypto.subtle.generateKey(
      {
        name: "RSA-PSS",
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: { name: "SHA-512" },
      },
      true,
      ["sign", "verify"],
    );
    const exportedPrivate = await exportPrivateKey(
      key.privateKey,
      ENCODER.encode("test@example.com"),
    );
    assertEquals(exportedPrivate.kty, KTY_RSA);
    assertEquals(exportedPrivate.key_ops, [KEY_OP_SIGN]);
    assertEquals(exportedPrivate.alg, RSASSA_PSS_SHA_512);
    const exportedPublic = await exportPublicKey(
      key.publicKey,
      ENCODER.encode("test@example.com"),
    );
    assertEquals(exportedPublic.kty, KTY_RSA);
    assertEquals(exportedPublic.key_ops, [KEY_OP_VERIFY]);
    assertEquals(exportedPublic.alg, RSASSA_PSS_SHA_512);
  });

  it("Export a dynamically ES256 generated key", async () => {
    const key = await crypto.subtle.generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-256",
      },
      true,
      ["sign", "verify"],
    );
    const exportedPrivate = await exportPrivateKey(
      key.privateKey,
      ENCODER.encode("test@example.com"),
    );
    assertEquals(exportedPrivate.kty, KTY_EC2);
    assertEquals(exportedPrivate.key_ops, [KEY_OP_SIGN]);
    assertEquals(exportedPrivate.alg, ECDSA_SHA_256);
    if (exportedPrivate.alg == ECDSA_SHA_256) {
      assertEquals(exportedPrivate.crv, EC2_CRV_P256);
    }

    const exportedPublic = await exportPublicKey(
      key.publicKey,
      ENCODER.encode("test@example.com"),
    );
    assertEquals(exportedPublic.kty, KTY_EC2);
    assertEquals(exportedPublic.key_ops, [KEY_OP_VERIFY]);
    assertEquals(exportedPublic.alg, ECDSA_SHA_256);
    if (exportedPublic.alg == ECDSA_SHA_256) {
      assertEquals(exportedPublic.crv, EC2_CRV_P256);
    }
  });
  it("Export a dynamically ES384 generated key", async () => {
    const key = await crypto.subtle.generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-384",
      },
      true,
      ["sign", "verify"],
    );
    const exportedPrivate = await exportPrivateKey(
      key.privateKey,
      ENCODER.encode("test@example.com"),
    );
    assertEquals(exportedPrivate.kty, KTY_EC2);
    assertEquals(exportedPrivate.key_ops, [KEY_OP_SIGN]);
    assertEquals(exportedPrivate.alg, ECDSA_SHA_384);
    if (exportedPrivate.alg == ECDSA_SHA_384) {
      assertEquals(exportedPrivate.crv, EC2_CRV_P384);
    }

    const exportedPublic = await exportPublicKey(
      key.publicKey,
      ENCODER.encode("test@example.com"),
    );
    assertEquals(exportedPublic.kty, KTY_EC2);
    assertEquals(exportedPublic.key_ops, [KEY_OP_VERIFY]);
    assertEquals(exportedPublic.alg, ECDSA_SHA_384);
    if (exportedPublic.alg == ECDSA_SHA_384) {
      assertEquals(exportedPublic.crv, EC2_CRV_P384);
    }
  });

  it("Does not yet support ES512", () => {
    // ES512 is not supported yet in Deno.
    // https://github.com/denoland/deno/issues/13449
  });

  it("Export a dynamically HS256 generated key", async () => {
    const key = await crypto.subtle.generateKey(
      {
        name: "HMAC",
        hash: { name: "SHA-256" },
      },
      true,
      ["sign", "verify"],
    );
    const exportedSymmetric = await exportSymmetricKey(
      key,
      ENCODER.encode("test@example.com"),
    );
    assertEquals(exportedSymmetric.kty, KTY_SYMMETRIC);
    assertEquals(exportedSymmetric.key_ops, [
      KEY_OP_MAC_CREATE,
      KEY_OP_MAC_VERIFY,
    ]);
    assertEquals(exportedSymmetric.alg, HMAC_SHA_256);
    if (exportedSymmetric.alg == HMAC_SHA_256) {
      assertNotEquals(exportedSymmetric.k, null);
    }
  });

  it("Export a dynamically HS384 generated key", async () => {
    const key = await crypto.subtle.generateKey(
      {
        name: "HMAC",
        hash: { name: "SHA-384" },
      },
      true,
      ["sign", "verify"],
    );
    const exportedSymmetric = await exportSymmetricKey(
      key,
      ENCODER.encode("test@example.com"),
    );
    assertEquals(exportedSymmetric.kty, KTY_SYMMETRIC);
    assertEquals(exportedSymmetric.key_ops, [
      KEY_OP_MAC_CREATE,
      KEY_OP_MAC_VERIFY,
    ]);
    assertEquals(exportedSymmetric.alg, HMAC_SHA_384);
    if (exportedSymmetric.alg == HMAC_SHA_384) {
      assertNotEquals(exportedSymmetric.k, null);
    }
  });

  it("Export a dynamically HS512 generated key", async () => {
    const key = await crypto.subtle.generateKey(
      {
        name: "HMAC",
        hash: { name: "SHA-512" },
      },
      true,
      ["sign", "verify"],
    );
    const exportedSymmetric = await exportSymmetricKey(
      key,
      ENCODER.encode("test@example.com"),
    );
    assertEquals(exportedSymmetric.kty, KTY_SYMMETRIC);
    assertEquals(exportedSymmetric.key_ops, [
      KEY_OP_MAC_CREATE,
      KEY_OP_MAC_VERIFY,
    ]);
    assertEquals(exportedSymmetric.alg, HMAC_SHA_512);
    if (exportedSymmetric.alg == HMAC_SHA_512) {
      assertNotEquals(exportedSymmetric.k, null);
    }
  });

  it("Refuses a non-extractable private key", async () => {
    const key = await crypto.subtle.generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-256",
      },
      false,
      ["sign", "verify"],
    );
    assertRejects(async () => {
      await exportPrivateKey(
        key.privateKey,
        ENCODER.encode("test@example.com"),
      );
    });
    // Public keys are still extractable
  });
  it("Refuses a non-extractable symmetric key", async () => {
    const key = await crypto.subtle.generateKey(
      {
        name: "HMAC",
        hash: { name: "SHA-256" },
      },
      false,
      ["sign", "verify"],
    );
    assertRejects(async () => {
      await exportSymmetricKey(
        key,
        ENCODER.encode("test@example.com"),
      );
    });
  });

  it("Refuses a dynamically generated AES-CBC key", async () => {
    // Unsupported
    const key = await crypto.subtle.generateKey(
      {
        name: "AES-CBC",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"],
    );

    // These aren't even private or public keys
    assertRejects(async () => {
      await exportPrivateKey(key, ENCODER.encode("test@example.com"));
    });
    assertRejects(async () => {
      await exportPublicKey(key, ENCODER.encode("test@example.com"));
    });
    assertRejects(async () => {
      await exportSymmetricKey(
        key,
        ENCODER.encode("test@example.com"),
      );
    });
  });
});

// Keys come from https://github.com/LeviSchuck/cose-examples/tree/main

function decode(b64url: string): CBORType {
  const bytes = decodeBase64Url(b64url);
  const cbor = decodeCBOR(bytes);
  return cbor;
}

describe("Importing keys", () => {
  // it("Imports a RS256 Public Key", async () => {
  //   const cbor = decode('pgEDAlFoZWxsb0BleGFtcGxlLmNvbQSBAgM5AQAhQwEAASBZAQC39rfzb7mCsntRDoHf687SeuTxrQxO7A-sPfbmwS_zwLAAW3OGfhZuya8qDxoUF5ybosh74yEWOPKXZmE-ac-N8UQazh1OItA5aJILDI_gWYtkqi4-B08v-IgF_s1Au-fLll6gsQtvTOSBs6-ZYSkdVKNsLDUrp_D98nrLzgV4vydSEvwqlbt_Ykxgw6x_5ZhJIzuCvf0nMBYDr7dxQcEvxYJSARZIFNuMqJnc5iDEzCnT4C8sJOGxJqTV62nOnnvZMVEIF_zzXVWZgTPqi7D3RmCpsmD0C2lee1dV1lNf8v7dRRExESk4Wrfpm_Bdp8vFrzevWmTJyW8ezGWlbGCF');
  //   const key =
  //   const imported = await importPublicKey()
  // })
  it("Imports an HS256 key", async () => {
    const cbor = decode(
      "pQEEIFgg58-Wmw5lAYoVsBWNZ-Od1UsodZ-PDMPr27l95UzW1OYCUWhlbGxvQGV4YW1wbGUuY29tBIIJCgMF",
    );
    const { key } = await importSymmetricKey(cbor, true);
    const signature = await crypto.subtle.sign(
      { name: "HMAC" },
      key,
      ENCODER.encode("Hello world"),
    );
    assertEquals(
      new Uint8Array(signature),
      decodeBase64("Jl7zJByUUrh1y5b94fES52I2SwgjCmSywcvuvjywS4Y="),
    );
    (cbor as Map<number, CBORType>).delete(4);
    const skey2 = await importSymmetricKey(cbor, false);
    const signature2 = await crypto.subtle.sign(
      { name: "HMAC" },
      skey2.key,
      ENCODER.encode("Hello world"),
    );
    assertEquals(
      new Uint8Array(signature2),
      decodeBase64("Jl7zJByUUrh1y5b94fES52I2SwgjCmSywcvuvjywS4Y="),
    );
  });
  it("Unsupported Symmetric algorithm", () => {
    const cbor = decode(
      "pQEEIFgg58-Wmw5lAYoVsBWNZ-Od1UsodZ-PDMPr27l95UzW1OYCUWhlbGxvQGV4YW1wbGUuY29tBIIJCgMF",
    );
    assertRejects(async () => {
      (cbor as Map<number, CBORType>).set(3, RSASSA_PKCS1_v1_5_SHA_256);
      await importSymmetricKey(cbor, true);
    });
  });
  it("Imports an HS384 key", async () => {
    const cbor = decode(
      "pQEEIFgwkmqjI1J0ZqSTLs27o7gkTDM4jp7z2abse2C3nXm1C0OzPrr9beK4H5tt5mvZFhkbAlFoZWxsb0BleGFtcGxlLmNvbQSCCQoDBg==",
    );
    const { key } = await importSymmetricKey(cbor, true);
    const signature = await crypto.subtle.sign(
      { name: "HMAC" },
      key,
      ENCODER.encode("Hello world"),
    );
    assertEquals(
      new Uint8Array(signature),
      decodeBase64(
        "QYQHWmLwz8tZaadmRuitBUmUjbX+TM+rvfAvlVutvDIoXyejSIylCm3Bwpzcftst",
      ),
    );
  });
  it("Imports an HS512 key", async () => {
    const cbor = decode(
      "pQEEIFhAIZEMIfF4qzuGFf_vWAXIq9VUUG7Gtva8ry3Ymci4U0yYVEMokdsp86eNUC5LjOgyiL-70t0OlohycL1YmC1qCAJRaGVsbG9AZXhhbXBsZS5jb20EggkKAwc=",
    );
    const { key } = await importSymmetricKey(cbor, true);
    const signature = await crypto.subtle.sign(
      { name: "HMAC" },
      key,
      ENCODER.encode("Hello world"),
    );
    assertEquals(
      new Uint8Array(signature),
      decodeBase64(
        "aqNllE9QEqrc5+rMPyWGsR+cRbC+A57DAKNw5phJS2RWYdfdWFAknHfNejTixoBgSs/gHlsfkioKjvrI8B67BQ==",
      ),
    );
  });
});
