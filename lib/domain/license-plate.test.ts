import assert from "node:assert/strict"
import test from "node:test"

import {
  formatLicensePlate,
  isValidLicensePlate,
  normalizeLicensePlate,
} from "./license-plate"

test("normalizeLicensePlate limpia espacios, guiones, puntos y pasa a mayúsculas", () => {
  assert.equal(normalizeLicensePlate(" ab 123-cd "), "AB123CD")
  assert.equal(normalizeLicensePlate("abc.123"), "ABC123")
})

test("isValidLicensePlate valida patentes alfanuméricas de 3 a 10 caracteres", () => {
  assert.equal(isValidLicensePlate("AB 123 CD"), true)
  assert.equal(isValidLicensePlate("ABC123"), true)
  assert.equal(isValidLicensePlate("AB"), false)
  assert.equal(isValidLicensePlate("AB-123!"), false)
})

test("formatLicensePlate formatea patentes argentinas clásicas y Mercosur", () => {
  assert.equal(formatLicensePlate("abc123"), "ABC 123")
  assert.equal(formatLicensePlate("ab123cd"), "AB 123 CD")
  assert.equal(formatLicensePlate("A123BCD"), "A123BCD")
})
