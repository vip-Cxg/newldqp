(function(t, e) {
"function" == typeof define && define.amd ? define([ "exports" ], e) : "object" == typeof exports && "string" != typeof exports.nodeName ? e(module.exports) : e(t);
})(this, function(t) {
root.KJUR = KJUR;
var e;
function i(t, e, i) {
null != t && ("number" == typeof t ? this.fromNumber(t, e, i) : null == e && "string" != typeof t ? this.fromString(t, 256) : this.fromString(t, e));
}
function s() {
return new i(null);
}
if ("Microsoft Internet Explorer" == navigator.appName) {
i.prototype.am = function(t, e, i, s, r, n) {
for (var o = 32767 & e, h = e >> 15; --n >= 0; ) {
var a = 32767 & this[t], u = this[t++] >> 15, f = h * a + u * o;
r = ((a = o * a + ((32767 & f) << 15) + i[s] + (1073741823 & r)) >>> 30) + (f >>> 15) + h * u + (r >>> 30);
i[s++] = 1073741823 & a;
}
return r;
};
e = 30;
} else if ("Netscape" != navigator.appName) {
i.prototype.am = function(t, e, i, s, r, n) {
for (;--n >= 0; ) {
var o = e * this[t++] + i[s] + r;
r = Math.floor(o / 67108864);
i[s++] = 67108863 & o;
}
return r;
};
e = 26;
} else {
i.prototype.am = function(t, e, i, s, r, n) {
for (var o = 16383 & e, h = e >> 14; --n >= 0; ) {
var a = 16383 & this[t], u = this[t++] >> 14, f = h * a + u * o;
r = ((a = o * a + ((16383 & f) << 14) + i[s] + r) >> 28) + (f >> 14) + h * u;
i[s++] = 268435455 & a;
}
return r;
};
e = 28;
}
i.prototype.DB = e;
i.prototype.DM = (1 << e) - 1;
i.prototype.DV = 1 << e;
i.prototype.FV = Math.pow(2, 52);
i.prototype.F1 = 52 - e;
i.prototype.F2 = 2 * e - 52;
var r, n, o = "0123456789abcdefghijklmnopqrstuvwxyz", h = new Array();
r = "0".charCodeAt(0);
for (n = 0; n <= 9; ++n) h[r++] = n;
r = "a".charCodeAt(0);
for (n = 10; n < 36; ++n) h[r++] = n;
r = "A".charCodeAt(0);
for (n = 10; n < 36; ++n) h[r++] = n;
function a(t) {
return o.charAt(t);
}
function u(t, e) {
var i = h[t.charCodeAt(e)];
return null == i ? -1 : i;
}
function f(t) {
var e = s();
e.fromInt(t);
return e;
}
function c(t) {
var e, i = 1;
if (0 != (e = t >>> 16)) {
t = e;
i += 16;
}
if (0 != (e = t >> 8)) {
t = e;
i += 8;
}
if (0 != (e = t >> 4)) {
t = e;
i += 4;
}
if (0 != (e = t >> 2)) {
t = e;
i += 2;
}
if (0 != (e = t >> 1)) {
t = e;
i += 1;
}
return i;
}
function p(t) {
this.m = t;
}
p.prototype.convert = function(t) {
return t.s < 0 || t.compareTo(this.m) >= 0 ? t.mod(this.m) : t;
};
p.prototype.revert = function(t) {
return t;
};
p.prototype.reduce = function(t) {
t.divRemTo(this.m, null, t);
};
p.prototype.mulTo = function(t, e, i) {
t.multiplyTo(e, i);
this.reduce(i);
};
p.prototype.sqrTo = function(t, e) {
t.squareTo(e);
this.reduce(e);
};
function l(t) {
this.m = t;
this.mp = t.invDigit();
this.mpl = 32767 & this.mp;
this.mph = this.mp >> 15;
this.um = (1 << t.DB - 15) - 1;
this.mt2 = 2 * t.t;
}
l.prototype.convert = function(t) {
var e = s();
t.abs().dlShiftTo(this.m.t, e);
e.divRemTo(this.m, null, e);
t.s < 0 && e.compareTo(i.ZERO) > 0 && this.m.subTo(e, e);
return e;
};
l.prototype.revert = function(t) {
var e = s();
t.copyTo(e);
this.reduce(e);
return e;
};
l.prototype.reduce = function(t) {
for (;t.t <= this.mt2; ) t[t.t++] = 0;
for (var e = 0; e < this.m.t; ++e) {
var i = 32767 & t[e], s = i * this.mpl + ((i * this.mph + (t[e] >> 15) * this.mpl & this.um) << 15) & t.DM;
t[i = e + this.m.t] += this.m.am(0, s, t, e, 0, this.m.t);
for (;t[i] >= t.DV; ) {
t[i] -= t.DV;
t[++i]++;
}
}
t.clamp();
t.drShiftTo(this.m.t, t);
t.compareTo(this.m) >= 0 && t.subTo(this.m, t);
};
l.prototype.mulTo = function(t, e, i) {
t.multiplyTo(e, i);
this.reduce(i);
};
l.prototype.sqrTo = function(t, e) {
t.squareTo(e);
this.reduce(e);
};
i.prototype.copyTo = function(t) {
for (var e = this.t - 1; e >= 0; --e) t[e] = this[e];
t.t = this.t;
t.s = this.s;
};
i.prototype.fromInt = function(t) {
this.t = 1;
this.s = t < 0 ? -1 : 0;
t > 0 ? this[0] = t : t < -1 ? this[0] = t + this.DV : this.t = 0;
};
i.prototype.fromString = function(t, e) {
var s;
if (16 == e) s = 4; else if (8 == e) s = 3; else if (256 == e) s = 8; else if (2 == e) s = 1; else if (32 == e) s = 5; else {
if (4 != e) {
this.fromRadix(t, e);
return;
}
s = 2;
}
this.t = 0;
this.s = 0;
for (var r = t.length, n = !1, o = 0; --r >= 0; ) {
var h = 8 == s ? 255 & t[r] : u(t, r);
if (h < 0) "-" == t.charAt(r) && (n = !0); else {
n = !1;
if (0 == o) this[this.t++] = h; else if (o + s > this.DB) {
this[this.t - 1] |= (h & (1 << this.DB - o) - 1) << o;
this[this.t++] = h >> this.DB - o;
} else this[this.t - 1] |= h << o;
(o += s) >= this.DB && (o -= this.DB);
}
}
if (8 == s && 0 != (128 & t[0])) {
this.s = -1;
o > 0 && (this[this.t - 1] |= (1 << this.DB - o) - 1 << o);
}
this.clamp();
n && i.ZERO.subTo(this, this);
};
i.prototype.clamp = function() {
for (var t = this.s & this.DM; this.t > 0 && this[this.t - 1] == t; ) --this.t;
};
i.prototype.dlShiftTo = function(t, e) {
var i;
for (i = this.t - 1; i >= 0; --i) e[i + t] = this[i];
for (i = t - 1; i >= 0; --i) e[i] = 0;
e.t = this.t + t;
e.s = this.s;
};
i.prototype.drShiftTo = function(t, e) {
for (var i = t; i < this.t; ++i) e[i - t] = this[i];
e.t = Math.max(this.t - t, 0);
e.s = this.s;
};
i.prototype.lShiftTo = function(t, e) {
var i, s = t % this.DB, r = this.DB - s, n = (1 << r) - 1, o = Math.floor(t / this.DB), h = this.s << s & this.DM;
for (i = this.t - 1; i >= 0; --i) {
e[i + o + 1] = this[i] >> r | h;
h = (this[i] & n) << s;
}
for (i = o - 1; i >= 0; --i) e[i] = 0;
e[o] = h;
e.t = this.t + o + 1;
e.s = this.s;
e.clamp();
};
i.prototype.rShiftTo = function(t, e) {
e.s = this.s;
var i = Math.floor(t / this.DB);
if (i >= this.t) e.t = 0; else {
var s = t % this.DB, r = this.DB - s, n = (1 << s) - 1;
e[0] = this[i] >> s;
for (var o = i + 1; o < this.t; ++o) {
e[o - i - 1] |= (this[o] & n) << r;
e[o - i] = this[o] >> s;
}
s > 0 && (e[this.t - i - 1] |= (this.s & n) << r);
e.t = this.t - i;
e.clamp();
}
};
i.prototype.subTo = function(t, e) {
for (var i = 0, s = 0, r = Math.min(t.t, this.t); i < r; ) {
s += this[i] - t[i];
e[i++] = s & this.DM;
s >>= this.DB;
}
if (t.t < this.t) {
s -= t.s;
for (;i < this.t; ) {
s += this[i];
e[i++] = s & this.DM;
s >>= this.DB;
}
s += this.s;
} else {
s += this.s;
for (;i < t.t; ) {
s -= t[i];
e[i++] = s & this.DM;
s >>= this.DB;
}
s -= t.s;
}
e.s = s < 0 ? -1 : 0;
s < -1 ? e[i++] = this.DV + s : s > 0 && (e[i++] = s);
e.t = i;
e.clamp();
};
i.prototype.multiplyTo = function(t, e) {
var s = this.abs(), r = t.abs(), n = s.t;
e.t = n + r.t;
for (;--n >= 0; ) e[n] = 0;
for (n = 0; n < r.t; ++n) e[n + s.t] = s.am(0, r[n], e, n, 0, s.t);
e.s = 0;
e.clamp();
this.s != t.s && i.ZERO.subTo(e, e);
};
i.prototype.squareTo = function(t) {
for (var e = this.abs(), i = t.t = 2 * e.t; --i >= 0; ) t[i] = 0;
for (i = 0; i < e.t - 1; ++i) {
var s = e.am(i, e[i], t, 2 * i, 0, 1);
if ((t[i + e.t] += e.am(i + 1, 2 * e[i], t, 2 * i + 1, s, e.t - i - 1)) >= e.DV) {
t[i + e.t] -= e.DV;
t[i + e.t + 1] = 1;
}
}
t.t > 0 && (t[t.t - 1] += e.am(i, e[i], t, 2 * i, 0, 1));
t.s = 0;
t.clamp();
};
i.prototype.divRemTo = function(t, e, r) {
var n = t.abs();
if (!(n.t <= 0)) {
var o = this.abs();
if (o.t < n.t) {
null != e && e.fromInt(0);
null != r && this.copyTo(r);
} else {
null == r && (r = s());
var h = s(), a = this.s, u = t.s, f = this.DB - c(n[n.t - 1]);
if (f > 0) {
n.lShiftTo(f, h);
o.lShiftTo(f, r);
} else {
n.copyTo(h);
o.copyTo(r);
}
var p = h.t, l = h[p - 1];
if (0 != l) {
var d = l * (1 << this.F1) + (p > 1 ? h[p - 2] >> this.F2 : 0), g = this.FV / d, m = (1 << this.F1) / d, y = 1 << this.F2, v = r.t, b = v - p, T = null == e ? s() : e;
h.dlShiftTo(b, T);
if (r.compareTo(T) >= 0) {
r[r.t++] = 1;
r.subTo(T, r);
}
i.ONE.dlShiftTo(p, T);
T.subTo(h, h);
for (;h.t < p; ) h[h.t++] = 0;
for (;--b >= 0; ) {
var S = r[--v] == l ? this.DM : Math.floor(r[v] * g + (r[v - 1] + y) * m);
if ((r[v] += h.am(0, S, r, b, 0, p)) < S) {
h.dlShiftTo(b, T);
r.subTo(T, r);
for (;r[v] < --S; ) r.subTo(T, r);
}
}
if (null != e) {
r.drShiftTo(p, e);
a != u && i.ZERO.subTo(e, e);
}
r.t = p;
r.clamp();
f > 0 && r.rShiftTo(f, r);
a < 0 && i.ZERO.subTo(r, r);
}
}
}
};
i.prototype.invDigit = function() {
if (this.t < 1) return 0;
var t = this[0];
if (0 == (1 & t)) return 0;
var e = 3 & t;
return (e = (e = (e = (e = e * (2 - (15 & t) * e) & 15) * (2 - (255 & t) * e) & 255) * (2 - ((65535 & t) * e & 65535)) & 65535) * (2 - t * e % this.DV) % this.DV) > 0 ? this.DV - e : -e;
};
i.prototype.isEven = function() {
return 0 == (this.t > 0 ? 1 & this[0] : this.s);
};
i.prototype.exp = function(t, e) {
if (t > 4294967295 || t < 1) return i.ONE;
var r = s(), n = s(), o = e.convert(this), h = c(t) - 1;
o.copyTo(r);
for (;--h >= 0; ) {
e.sqrTo(r, n);
if ((t & 1 << h) > 0) e.mulTo(n, o, r); else {
var a = r;
r = n;
n = a;
}
}
return e.revert(r);
};
i.prototype.toString = function(t) {
if (this.s < 0) return "-" + this.negate().toString(t);
var e;
if (16 == t) e = 4; else if (8 == t) e = 3; else if (2 == t) e = 1; else if (32 == t) e = 5; else {
if (4 != t) return this.toRadix(t);
e = 2;
}
var i, s = (1 << e) - 1, r = !1, n = "", o = this.t, h = this.DB - o * this.DB % e;
if (o-- > 0) {
if (h < this.DB && (i = this[o] >> h) > 0) {
r = !0;
n = a(i);
}
for (;o >= 0; ) {
if (h < e) {
i = (this[o] & (1 << h) - 1) << e - h;
i |= this[--o] >> (h += this.DB - e);
} else {
i = this[o] >> (h -= e) & s;
if (h <= 0) {
h += this.DB;
--o;
}
}
i > 0 && (r = !0);
r && (n += a(i));
}
}
return r ? n : "0";
};
i.prototype.negate = function() {
var t = s();
i.ZERO.subTo(this, t);
return t;
};
i.prototype.abs = function() {
return this.s < 0 ? this.negate() : this;
};
i.prototype.compareTo = function(t) {
var e = this.s - t.s;
if (0 != e) return e;
var i = this.t;
if (0 != (e = i - t.t)) return this.s < 0 ? -e : e;
for (;--i >= 0; ) if (0 != (e = this[i] - t[i])) return e;
return 0;
};
i.prototype.bitLength = function() {
return this.t <= 0 ? 0 : this.DB * (this.t - 1) + c(this[this.t - 1] ^ this.s & this.DM);
};
i.prototype.mod = function(t) {
var e = s();
this.abs().divRemTo(t, null, e);
this.s < 0 && e.compareTo(i.ZERO) > 0 && t.subTo(e, e);
return e;
};
i.prototype.modPowInt = function(t, e) {
var i;
i = t < 256 || e.isEven() ? new p(e) : new l(e);
return this.exp(t, i);
};
i.ZERO = f(0);
i.ONE = f(1);
function d(t, e) {
return t & e;
}
function g(t, e) {
return t | e;
}
function m(t, e) {
return t ^ e;
}
function y(t, e) {
return t & ~e;
}
function b(t) {
if (0 == t) return -1;
var e = 0;
if (0 == (65535 & t)) {
t >>= 16;
e += 16;
}
if (0 == (255 & t)) {
t >>= 8;
e += 8;
}
if (0 == (15 & t)) {
t >>= 4;
e += 4;
}
if (0 == (3 & t)) {
t >>= 2;
e += 2;
}
0 == (1 & t) && ++e;
return e;
}
function T(t) {
for (var e = 0; 0 != t; ) {
t &= t - 1;
++e;
}
return e;
}
function S() {}
function R(t) {
return t;
}
S.prototype.convert = R;
S.prototype.revert = R;
S.prototype.mulTo = function(t, e, i) {
t.multiplyTo(e, i);
};
S.prototype.sqrTo = function(t, e) {
t.squareTo(e);
};
function E(t) {
this.r2 = s();
this.q3 = s();
i.ONE.dlShiftTo(2 * t.t, this.r2);
this.mu = this.r2.divide(t);
this.m = t;
}
E.prototype.convert = function(t) {
if (t.s < 0 || t.t > 2 * this.m.t) return t.mod(this.m);
if (t.compareTo(this.m) < 0) return t;
var e = s();
t.copyTo(e);
this.reduce(e);
return e;
};
E.prototype.revert = function(t) {
return t;
};
E.prototype.reduce = function(t) {
t.drShiftTo(this.m.t - 1, this.r2);
if (t.t > this.m.t + 1) {
t.t = this.m.t + 1;
t.clamp();
}
this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3);
this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2);
for (;t.compareTo(this.r2) < 0; ) t.dAddOffset(1, this.m.t + 1);
t.subTo(this.r2, t);
for (;t.compareTo(this.m) >= 0; ) t.subTo(this.m, t);
};
E.prototype.mulTo = function(t, e, i) {
t.multiplyTo(e, i);
this.reduce(i);
};
E.prototype.sqrTo = function(t, e) {
t.squareTo(e);
this.reduce(e);
};
var D = [ 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997 ], w = (1 << 26) / D[D.length - 1];
i.prototype.chunkSize = function(t) {
return Math.floor(Math.LN2 * this.DB / Math.log(t));
};
i.prototype.toRadix = function(t) {
null == t && (t = 10);
if (0 == this.signum() || t < 2 || t > 36) return "0";
var e = this.chunkSize(t), i = Math.pow(t, e), r = f(i), n = s(), o = s(), h = "";
this.divRemTo(r, n, o);
for (;n.signum() > 0; ) {
h = (i + o.intValue()).toString(t).substr(1) + h;
n.divRemTo(r, n, o);
}
return o.intValue().toString(t) + h;
};
i.prototype.fromRadix = function(t, e) {
this.fromInt(0);
null == e && (e = 10);
for (var s = this.chunkSize(e), r = Math.pow(e, s), n = !1, o = 0, h = 0, a = 0; a < t.length; ++a) {
var f = u(t, a);
if (f < 0) "-" == t.charAt(a) && 0 == this.signum() && (n = !0); else {
h = e * h + f;
if (++o >= s) {
this.dMultiply(r);
this.dAddOffset(h, 0);
o = 0;
h = 0;
}
}
}
if (o > 0) {
this.dMultiply(Math.pow(e, o));
this.dAddOffset(h, 0);
}
n && i.ZERO.subTo(this, this);
};
i.prototype.fromNumber = function(t, e, s) {
if ("number" == typeof e) if (t < 2) this.fromInt(1); else {
this.fromNumber(t, s);
this.testBit(t - 1) || this.bitwiseTo(i.ONE.shiftLeft(t - 1), g, this);
this.isEven() && this.dAddOffset(1, 0);
for (;!this.isProbablePrime(e); ) {
this.dAddOffset(2, 0);
this.bitLength() > t && this.subTo(i.ONE.shiftLeft(t - 1), this);
}
} else {
var r = new Array(), n = 7 & t;
r.length = 1 + (t >> 3);
e.nextBytes(r);
n > 0 ? r[0] &= (1 << n) - 1 : r[0] = 0;
this.fromString(r, 256);
}
};
i.prototype.bitwiseTo = function(t, e, i) {
var s, r, n = Math.min(t.t, this.t);
for (s = 0; s < n; ++s) i[s] = e(this[s], t[s]);
if (t.t < this.t) {
r = t.s & this.DM;
for (s = n; s < this.t; ++s) i[s] = e(this[s], r);
i.t = this.t;
} else {
r = this.s & this.DM;
for (s = n; s < t.t; ++s) i[s] = e(r, t[s]);
i.t = t.t;
}
i.s = e(this.s, t.s);
i.clamp();
};
i.prototype.changeBit = function(t, e) {
var s = i.ONE.shiftLeft(t);
this.bitwiseTo(s, e, s);
return s;
};
i.prototype.addTo = function(t, e) {
for (var i = 0, s = 0, r = Math.min(t.t, this.t); i < r; ) {
s += this[i] + t[i];
e[i++] = s & this.DM;
s >>= this.DB;
}
if (t.t < this.t) {
s += t.s;
for (;i < this.t; ) {
s += this[i];
e[i++] = s & this.DM;
s >>= this.DB;
}
s += this.s;
} else {
s += this.s;
for (;i < t.t; ) {
s += t[i];
e[i++] = s & this.DM;
s >>= this.DB;
}
s += t.s;
}
e.s = s < 0 ? -1 : 0;
s > 0 ? e[i++] = s : s < -1 && (e[i++] = this.DV + s);
e.t = i;
e.clamp();
};
i.prototype.dMultiply = function(t) {
this[this.t] = this.am(0, t - 1, this, 0, 0, this.t);
++this.t;
this.clamp();
};
i.prototype.dAddOffset = function(t, e) {
if (0 != t) {
for (;this.t <= e; ) this[this.t++] = 0;
this[e] += t;
for (;this[e] >= this.DV; ) {
this[e] -= this.DV;
++e >= this.t && (this[this.t++] = 0);
++this[e];
}
}
};
i.prototype.multiplyLowerTo = function(t, e, i) {
var s, r = Math.min(this.t + t.t, e);
i.s = 0;
i.t = r;
for (;r > 0; ) i[--r] = 0;
for (s = i.t - this.t; r < s; ++r) i[r + this.t] = this.am(0, t[r], i, r, 0, this.t);
for (s = Math.min(t.t, e); r < s; ++r) this.am(0, t[r], i, r, 0, e - r);
i.clamp();
};
i.prototype.multiplyUpperTo = function(t, e, i) {
--e;
var s = i.t = this.t + t.t - e;
i.s = 0;
for (;--s >= 0; ) i[s] = 0;
for (s = Math.max(e - this.t, 0); s < t.t; ++s) i[this.t + s - e] = this.am(e - s, t[s], i, 0, 0, this.t + s - e);
i.clamp();
i.drShiftTo(1, i);
};
i.prototype.modInt = function(t) {
if (t <= 0) return 0;
var e = this.DV % t, i = this.s < 0 ? t - 1 : 0;
if (this.t > 0) if (0 == e) i = this[0] % t; else for (var s = this.t - 1; s >= 0; --s) i = (e * i + this[s]) % t;
return i;
};
i.prototype.millerRabin = function(t) {
var e = this.subtract(i.ONE), r = e.getLowestSetBit();
if (r <= 0) return !1;
var n = e.shiftRight(r);
(t = t + 1 >> 1) > D.length && (t = D.length);
for (var o = s(), h = 0; h < t; ++h) {
o.fromInt(D[Math.floor(Math.random() * D.length)]);
var a = o.modPow(n, this);
if (0 != a.compareTo(i.ONE) && 0 != a.compareTo(e)) {
for (var u = 1; u++ < r && 0 != a.compareTo(e); ) if (0 == (a = a.modPowInt(2, this)).compareTo(i.ONE)) return !1;
if (0 != a.compareTo(e)) return !1;
}
}
return !0;
};
i.prototype.clone = function() {
var t = s();
this.copyTo(t);
return t;
};
i.prototype.intValue = function() {
if (this.s < 0) {
if (1 == this.t) return this[0] - this.DV;
if (0 == this.t) return -1;
} else {
if (1 == this.t) return this[0];
if (0 == this.t) return 0;
}
return (this[1] & (1 << 32 - this.DB) - 1) << this.DB | this[0];
};
i.prototype.byteValue = function() {
return 0 == this.t ? this.s : this[0] << 24 >> 24;
};
i.prototype.shortValue = function() {
return 0 == this.t ? this.s : this[0] << 16 >> 16;
};
i.prototype.signum = function() {
return this.s < 0 ? -1 : this.t <= 0 || 1 == this.t && this[0] <= 0 ? 0 : 1;
};
i.prototype.toByteArray = function() {
var t = this.t, e = new Array();
e[0] = this.s;
var i, s = this.DB - t * this.DB % 8, r = 0;
if (t-- > 0) {
s < this.DB && (i = this[t] >> s) != (this.s & this.DM) >> s && (e[r++] = i | this.s << this.DB - s);
for (;t >= 0; ) {
if (s < 8) {
i = (this[t] & (1 << s) - 1) << 8 - s;
i |= this[--t] >> (s += this.DB - 8);
} else {
i = this[t] >> (s -= 8) & 255;
if (s <= 0) {
s += this.DB;
--t;
}
}
0 != (128 & i) && (i |= -256);
0 == r && (128 & this.s) != (128 & i) && ++r;
(r > 0 || i != this.s) && (e[r++] = i);
}
}
return e;
};
i.prototype.equals = function(t) {
return 0 == this.compareTo(t);
};
i.prototype.min = function(t) {
return this.compareTo(t) < 0 ? this : t;
};
i.prototype.max = function(t) {
return this.compareTo(t) > 0 ? this : t;
};
i.prototype.and = function(t) {
var e = s();
this.bitwiseTo(t, d, e);
return e;
};
i.prototype.or = function(t) {
var e = s();
this.bitwiseTo(t, g, e);
return e;
};
i.prototype.xor = function(t) {
var e = s();
this.bitwiseTo(t, m, e);
return e;
};
i.prototype.andNot = function(t) {
var e = s();
this.bitwiseTo(t, y, e);
return e;
};
i.prototype.not = function() {
for (var t = s(), e = 0; e < this.t; ++e) t[e] = this.DM & ~this[e];
t.t = this.t;
t.s = ~this.s;
return t;
};
i.prototype.shiftLeft = function(t) {
var e = s();
t < 0 ? this.rShiftTo(-t, e) : this.lShiftTo(t, e);
return e;
};
i.prototype.shiftRight = function(t) {
var e = s();
t < 0 ? this.lShiftTo(-t, e) : this.rShiftTo(t, e);
return e;
};
i.prototype.getLowestSetBit = function() {
for (var t = 0; t < this.t; ++t) if (0 != this[t]) return t * this.DB + b(this[t]);
return this.s < 0 ? this.t * this.DB : -1;
};
i.prototype.bitCount = function() {
for (var t = 0, e = this.s & this.DM, i = 0; i < this.t; ++i) t += T(this[i] ^ e);
return t;
};
i.prototype.testBit = function(t) {
var e = Math.floor(t / this.DB);
return e >= this.t ? 0 != this.s : 0 != (this[e] & 1 << t % this.DB);
};
i.prototype.setBit = function(t) {
return this.changeBit(t, g);
};
i.prototype.clearBit = function(t) {
return this.changeBit(t, y);
};
i.prototype.flipBit = function(t) {
return this.changeBit(t, m);
};
i.prototype.add = function(t) {
var e = s();
this.addTo(t, e);
return e;
};
i.prototype.subtract = function(t) {
var e = s();
this.subTo(t, e);
return e;
};
i.prototype.multiply = function(t) {
var e = s();
this.multiplyTo(t, e);
return e;
};
i.prototype.divide = function(t) {
var e = s();
this.divRemTo(t, e, null);
return e;
};
i.prototype.remainder = function(t) {
var e = s();
this.divRemTo(t, null, e);
return e;
};
i.prototype.divideAndRemainder = function(t) {
var e = s(), i = s();
this.divRemTo(t, e, i);
return new Array(e, i);
};
i.prototype.modPow = function(t, e) {
var i, r, n = t.bitLength(), o = f(1);
if (n <= 0) return o;
i = n < 18 ? 1 : n < 48 ? 3 : n < 144 ? 4 : n < 768 ? 5 : 6;
r = n < 8 ? new p(e) : e.isEven() ? new E(e) : new l(e);
var h = new Array(), a = 3, u = i - 1, d = (1 << i) - 1;
h[1] = r.convert(this);
if (i > 1) {
var g = s();
r.sqrTo(h[1], g);
for (;a <= d; ) {
h[a] = s();
r.mulTo(g, h[a - 2], h[a]);
a += 2;
}
}
var m, y, v = t.t - 1, b = !0, T = s();
n = c(t[v]) - 1;
for (;v >= 0; ) {
if (n >= u) m = t[v] >> n - u & d; else {
m = (t[v] & (1 << n + 1) - 1) << u - n;
v > 0 && (m |= t[v - 1] >> this.DB + n - u);
}
a = i;
for (;0 == (1 & m); ) {
m >>= 1;
--a;
}
if ((n -= a) < 0) {
n += this.DB;
--v;
}
if (b) {
h[m].copyTo(o);
b = !1;
} else {
for (;a > 1; ) {
r.sqrTo(o, T);
r.sqrTo(T, o);
a -= 2;
}
if (a > 0) r.sqrTo(o, T); else {
y = o;
o = T;
T = y;
}
r.mulTo(T, h[m], o);
}
for (;v >= 0 && 0 == (t[v] & 1 << n); ) {
r.sqrTo(o, T);
y = o;
o = T;
T = y;
if (--n < 0) {
n = this.DB - 1;
--v;
}
}
}
return r.revert(o);
};
i.prototype.modInverse = function(t) {
var e = t.isEven();
if (this.isEven() && e || 0 == t.signum()) return i.ZERO;
for (var s = t.clone(), r = this.clone(), n = f(1), o = f(0), h = f(0), a = f(1); 0 != s.signum(); ) {
for (;s.isEven(); ) {
s.rShiftTo(1, s);
if (e) {
if (!n.isEven() || !o.isEven()) {
n.addTo(this, n);
o.subTo(t, o);
}
n.rShiftTo(1, n);
} else o.isEven() || o.subTo(t, o);
o.rShiftTo(1, o);
}
for (;r.isEven(); ) {
r.rShiftTo(1, r);
if (e) {
if (!h.isEven() || !a.isEven()) {
h.addTo(this, h);
a.subTo(t, a);
}
h.rShiftTo(1, h);
} else a.isEven() || a.subTo(t, a);
a.rShiftTo(1, a);
}
if (s.compareTo(r) >= 0) {
s.subTo(r, s);
e && n.subTo(h, n);
o.subTo(a, o);
} else {
r.subTo(s, r);
e && h.subTo(n, h);
a.subTo(o, a);
}
}
if (0 != r.compareTo(i.ONE)) return i.ZERO;
if (a.compareTo(t) >= 0) return a.subtract(t);
if (!(a.signum() < 0)) return a;
a.addTo(t, a);
return a.signum() < 0 ? a.add(t) : a;
};
i.prototype.pow = function(t) {
return this.exp(t, new S());
};
i.prototype.gcd = function(t) {
var e = this.s < 0 ? this.negate() : this.clone(), i = t.s < 0 ? t.negate() : t.clone();
if (e.compareTo(i) < 0) {
var s = e;
e = i;
i = s;
}
var r = e.getLowestSetBit(), n = i.getLowestSetBit();
if (n < 0) return e;
r < n && (n = r);
if (n > 0) {
e.rShiftTo(n, e);
i.rShiftTo(n, i);
}
for (;e.signum() > 0; ) {
(r = e.getLowestSetBit()) > 0 && e.rShiftTo(r, e);
(r = i.getLowestSetBit()) > 0 && i.rShiftTo(r, i);
if (e.compareTo(i) >= 0) {
e.subTo(i, e);
e.rShiftTo(1, e);
} else {
i.subTo(e, i);
i.rShiftTo(1, i);
}
}
n > 0 && i.lShiftTo(n, i);
return i;
};
i.prototype.isProbablePrime = function(t) {
var e, i = this.abs();
if (1 == i.t && i[0] <= D[D.length - 1]) {
for (e = 0; e < D.length; ++e) if (i[0] == D[e]) return !0;
return !1;
}
if (i.isEven()) return !1;
e = 1;
for (;e < D.length; ) {
for (var s = D[e], r = e + 1; r < D.length && s < w; ) s *= D[r++];
s = i.modInt(s);
for (;e < r; ) if (s % D[e++] == 0) return !1;
}
return i.millerRabin(t);
};
i.prototype.square = function() {
var t = s();
this.squareTo(t);
return t;
};
function x() {
this.i = 0;
this.j = 0;
this.S = new Array();
}
x.prototype.init = function(t) {
var e, i, s;
for (e = 0; e < 256; ++e) this.S[e] = e;
i = 0;
for (e = 0; e < 256; ++e) {
i = i + this.S[e] + t[e % t.length] & 255;
s = this.S[e];
this.S[e] = this.S[i];
this.S[i] = s;
}
this.i = 0;
this.j = 0;
};
x.prototype.next = function() {
var t;
this.i = this.i + 1 & 255;
this.j = this.j + this.S[this.i] & 255;
t = this.S[this.i];
this.S[this.i] = this.S[this.j];
this.S[this.j] = t;
return this.S[t + this.S[this.i] & 255];
};
var K, B, A, U = 256;
if (null == B) {
B = new Array();
A = 0;
var O;
if (window.crypto && window.crypto.getRandomValues) {
var V = new Uint32Array(256);
window.crypto.getRandomValues(V);
for (O = 0; O < V.length; ++O) B[A++] = 255 & V[O];
}
var J = function() {};
window.addEventListener ? window.addEventListener("mousemove", J, !1) : window.attachEvent && window.attachEvent("onmousemove", J);
}
function N() {
if (null == K) {
K = new x();
for (;A < U; ) {
var t = Math.floor(65536 * Math.random());
B[A++] = 255 & t;
}
K.init(B);
for (A = 0; A < B.length; ++A) B[A] = 0;
A = 0;
}
return K.next();
}
function I() {}
I.prototype.nextBytes = function(t) {
var e;
for (e = 0; e < t.length; ++e) t[e] = N();
};
function P(t, e) {
return new i(t, e);
}
function M(t, e) {
if (e < t.length + 11) {
console.error("Message too long for RSA");
return null;
}
for (var s = new Array(), r = t.length - 1; r >= 0 && e > 0; ) {
var n = t.charCodeAt(r--);
if (n < 128) s[--e] = n; else if (n > 127 && n < 2048) {
s[--e] = 63 & n | 128;
s[--e] = n >> 6 | 192;
} else {
s[--e] = 63 & n | 128;
s[--e] = n >> 6 & 63 | 128;
s[--e] = n >> 12 | 224;
}
}
s[--e] = 0;
for (var o = new I(), h = new Array(); e > 2; ) {
h[0] = 0;
for (;0 == h[0]; ) o.nextBytes(h);
s[--e] = h[0];
}
s[--e] = 2;
s[--e] = 0;
return new i(s);
}
function L() {
this.n = null;
this.e = 0;
this.d = null;
this.p = null;
this.q = null;
this.dmp1 = null;
this.dmq1 = null;
this.coeff = null;
}
L.prototype.doPublic = function(t) {
return t.modPowInt(this.e, this.n);
};
L.prototype.setPublic = function(t, e) {
if (null != t && null != e && t.length > 0 && e.length > 0) {
this.n = P(t, 16);
this.e = parseInt(e, 16);
} else console.error("Invalid RSA public key");
};
L.prototype.encrypt = function(t) {
var e = M(t, this.n.bitLength() + 7 >> 3);
if (null == e) return null;
var i = this.doPublic(e);
if (null == i) return null;
var s = i.toString(16);
return 0 == (1 & s.length) ? s : "0" + s;
};
function q(t, e) {
for (var i = t.toByteArray(), s = 0; s < i.length && 0 == i[s]; ) ++s;
if (i.length - s != e - 1 || 2 != i[s]) return null;
++s;
for (;0 != i[s]; ) if (++s >= i.length) return null;
for (var r = ""; ++s < i.length; ) {
var n = 255 & i[s];
if (n < 128) r += String.fromCharCode(n); else if (n > 191 && n < 224) {
r += String.fromCharCode((31 & n) << 6 | 63 & i[s + 1]);
++s;
} else {
r += String.fromCharCode((15 & n) << 12 | (63 & i[s + 1]) << 6 | 63 & i[s + 2]);
s += 2;
}
}
return r;
}
L.prototype.doPrivate = function(t) {
if (null == this.p || null == this.q) return t.modPow(this.d, this.n);
for (var e = t.mod(this.p).modPow(this.dmp1, this.p), i = t.mod(this.q).modPow(this.dmq1, this.q); e.compareTo(i) < 0; ) e = e.add(this.p);
return e.subtract(i).multiply(this.coeff).mod(this.p).multiply(this.q).add(i);
};
L.prototype.setPrivate = function(t, e, i) {
if (null != t && null != e && t.length > 0 && e.length > 0) {
this.n = P(t, 16);
this.e = parseInt(e, 16);
this.d = P(i, 16);
} else console.error("Invalid RSA private key");
};
L.prototype.setPrivateEx = function(t, e, i, s, r, n, o, h) {
if (null != t && null != e && t.length > 0 && e.length > 0) {
this.n = P(t, 16);
this.e = parseInt(e, 16);
this.d = P(i, 16);
this.p = P(s, 16);
this.q = P(r, 16);
this.dmp1 = P(n, 16);
this.dmq1 = P(o, 16);
this.coeff = P(h, 16);
} else console.error("Invalid RSA private key");
};
L.prototype.generate = function(t, e) {
var s = new I(), r = t >> 1;
this.e = parseInt(e, 16);
for (var n = new i(e, 16); ;) {
for (;;) {
this.p = new i(t - r, 1, s);
if (0 == this.p.subtract(i.ONE).gcd(n).compareTo(i.ONE) && this.p.isProbablePrime(10)) break;
}
for (;;) {
this.q = new i(r, 1, s);
if (0 == this.q.subtract(i.ONE).gcd(n).compareTo(i.ONE) && this.q.isProbablePrime(10)) break;
}
if (this.p.compareTo(this.q) <= 0) {
var o = this.p;
this.p = this.q;
this.q = o;
}
var h = this.p.subtract(i.ONE), a = this.q.subtract(i.ONE), u = h.multiply(a);
if (0 == u.gcd(n).compareTo(i.ONE)) {
this.n = this.p.multiply(this.q);
this.d = n.modInverse(u);
this.dmp1 = this.d.mod(h);
this.dmq1 = this.d.mod(a);
this.coeff = this.q.modInverse(this.p);
break;
}
}
};
L.prototype.decrypt = function(t) {
var e = P(t, 16), i = this.doPrivate(e);
return null == i ? null : q(i, this.n.bitLength() + 7 >> 3);
};
(function() {
L.prototype.generateAsync = function(t, e, r) {
var n = new I(), o = t >> 1;
this.e = parseInt(e, 16);
var h = new i(e, 16), a = this, u = function() {
var e = function() {
if (a.p.compareTo(a.q) <= 0) {
var t = a.p;
a.p = a.q;
a.q = t;
}
var e = a.p.subtract(i.ONE), s = a.q.subtract(i.ONE), n = e.multiply(s);
if (0 == n.gcd(h).compareTo(i.ONE)) {
a.n = a.p.multiply(a.q);
a.d = h.modInverse(n);
a.dmp1 = a.d.mod(e);
a.dmq1 = a.d.mod(s);
a.coeff = a.q.modInverse(a.p);
setTimeout(function() {
r();
}, 0);
} else setTimeout(u, 0);
}, f = function() {
a.q = s();
a.q.fromNumberAsync(o, 1, n, function() {
a.q.subtract(i.ONE).gcda(h, function(t) {
0 == t.compareTo(i.ONE) && a.q.isProbablePrime(10) ? setTimeout(e, 0) : setTimeout(f, 0);
});
});
}, c = function() {
a.p = s();
a.p.fromNumberAsync(t - o, 1, n, function() {
a.p.subtract(i.ONE).gcda(h, function(t) {
0 == t.compareTo(i.ONE) && a.p.isProbablePrime(10) ? setTimeout(f, 0) : setTimeout(c, 0);
});
});
};
setTimeout(c, 0);
};
setTimeout(u, 0);
};
i.prototype.gcda = function(t, e) {
var i = this.s < 0 ? this.negate() : this.clone(), s = t.s < 0 ? t.negate() : t.clone();
if (i.compareTo(s) < 0) {
var r = i;
i = s;
s = r;
}
var n = i.getLowestSetBit(), o = s.getLowestSetBit();
if (o < 0) e(i); else {
n < o && (o = n);
if (o > 0) {
i.rShiftTo(o, i);
s.rShiftTo(o, s);
}
var h = function() {
(n = i.getLowestSetBit()) > 0 && i.rShiftTo(n, i);
(n = s.getLowestSetBit()) > 0 && s.rShiftTo(n, s);
if (i.compareTo(s) >= 0) {
i.subTo(s, i);
i.rShiftTo(1, i);
} else {
s.subTo(i, s);
s.rShiftTo(1, s);
}
if (i.signum() > 0) setTimeout(h, 0); else {
o > 0 && s.lShiftTo(o, s);
setTimeout(function() {
e(s);
}, 0);
}
};
setTimeout(h, 10);
}
};
i.prototype.fromNumberAsync = function(t, e, s, r) {
if ("number" == typeof e) if (t < 2) this.fromInt(1); else {
this.fromNumber(t, s);
this.testBit(t - 1) || this.bitwiseTo(i.ONE.shiftLeft(t - 1), g, this);
this.isEven() && this.dAddOffset(1, 0);
var n = this, o = function() {
n.dAddOffset(2, 0);
n.bitLength() > t && n.subTo(i.ONE.shiftLeft(t - 1), n);
n.isProbablePrime(e) ? setTimeout(function() {
r();
}, 0) : setTimeout(o, 0);
};
setTimeout(o, 0);
} else {
var h = new Array(), a = 7 & t;
h.length = 1 + (t >> 3);
e.nextBytes(h);
a > 0 ? h[0] &= (1 << a) - 1 : h[0] = 0;
this.fromString(h, 256);
}
};
})();
var C = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", H = "=";
function j(t) {
var e, i, s = "";
for (e = 0; e + 3 <= t.length; e += 3) {
i = parseInt(t.substring(e, e + 3), 16);
s += C.charAt(i >> 6) + C.charAt(63 & i);
}
if (e + 1 == t.length) {
i = parseInt(t.substring(e, e + 1), 16);
s += C.charAt(i << 2);
} else if (e + 2 == t.length) {
i = parseInt(t.substring(e, e + 2), 16);
s += C.charAt(i >> 2) + C.charAt((3 & i) << 4);
}
for (;(3 & s.length) > 0; ) s += H;
return s;
}
function k(t) {
var e, i, s = "", r = 0;
for (e = 0; e < t.length && t.charAt(e) != H; ++e) {
v = C.indexOf(t.charAt(e));
if (!(v < 0)) if (0 == r) {
s += a(v >> 2);
i = 3 & v;
r = 1;
} else if (1 == r) {
s += a(i << 2 | v >> 4);
i = 15 & v;
r = 2;
} else if (2 == r) {
s += a(i);
s += a(v >> 2);
i = 3 & v;
r = 3;
} else {
s += a(i << 2 | v >> 4);
s += a(15 & v);
r = 0;
}
}
1 == r && (s += a(i << 2));
return s;
}
var F = F || {};
F.env = F.env || {};
var _ = F, z = Object.prototype, Z = [ "toString", "valueOf" ];
F.env.parseUA = function(t) {
var e, i = function(t) {
var e = 0;
return parseFloat(t.replace(/\./g, function() {
return 1 == e++ ? "" : ".";
}));
}, s = navigator, r = {
ie: 0,
opera: 0,
gecko: 0,
webkit: 0,
chrome: 0,
mobile: null,
air: 0,
ipad: 0,
iphone: 0,
ipod: 0,
ios: null,
android: 0,
webos: 0,
caja: s && s.cajaVersion,
secure: !1,
os: null
}, n = t || navigator && navigator.userAgent, o = window && window.location, h = o && o.href;
r.secure = h && 0 === h.toLowerCase().indexOf("https");
if (n) {
/windows|win32/i.test(n) ? r.os = "windows" : /macintosh/i.test(n) ? r.os = "macintosh" : /rhino/i.test(n) && (r.os = "rhino");
/KHTML/.test(n) && (r.webkit = 1);
if ((e = n.match(/AppleWebKit\/([^\s]*)/)) && e[1]) {
r.webkit = i(e[1]);
if (/ Mobile\//.test(n)) {
r.mobile = "Apple";
(e = n.match(/OS ([^\s]*)/)) && e[1] && (e = i(e[1].replace("_", ".")));
r.ios = e;
r.ipad = r.ipod = r.iphone = 0;
(e = n.match(/iPad|iPod|iPhone/)) && e[0] && (r[e[0].toLowerCase()] = r.ios);
} else {
(e = n.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/)) && (r.mobile = e[0]);
if (/webOS/.test(n)) {
r.mobile = "WebOS";
(e = n.match(/webOS\/([^\s]*);/)) && e[1] && (r.webos = i(e[1]));
}
if (/ Android/.test(n)) {
r.mobile = "Android";
(e = n.match(/Android ([^\s]*);/)) && e[1] && (r.android = i(e[1]));
}
}
(e = n.match(/Chrome\/([^\s]*)/)) && e[1] ? r.chrome = i(e[1]) : (e = n.match(/AdobeAIR\/([^\s]*)/)) && (r.air = e[0]);
}
if (!r.webkit) if ((e = n.match(/Opera[\s\/]([^\s]*)/)) && e[1]) {
r.opera = i(e[1]);
(e = n.match(/Version\/([^\s]*)/)) && e[1] && (r.opera = i(e[1]));
(e = n.match(/Opera Mini[^;]*/)) && (r.mobile = e[0]);
} else if ((e = n.match(/MSIE\s([^;]*)/)) && e[1]) r.ie = i(e[1]); else if (e = n.match(/Gecko\/([^\s]*)/)) {
r.gecko = 1;
(e = n.match(/rv:([^\s\)]*)/)) && e[1] && (r.gecko = i(e[1]));
}
}
return r;
};
F.env.ua = F.env.parseUA();
F.isFunction = function(t) {
return "function" == typeof t || "[object Function]" === z.toString.apply(t);
};
F._IEEnumFix = F.env.ua.ie ? function(t, e) {
var i, s, r;
for (i = 0; i < Z.length; i += 1) {
r = e[s = Z[i]];
_.isFunction(r) && r != z[s] && (t[s] = r);
}
} : function() {};
F.extend = function(t, e, i) {
if (!e || !t) throw new Error("extend failed, please check that all dependencies are included.");
var s, r = function() {};
r.prototype = e.prototype;
t.prototype = new r();
t.prototype.constructor = t;
t.superclass = e.prototype;
e.prototype.constructor == z.constructor && (e.prototype.constructor = e);
if (i) {
for (s in i) _.hasOwnProperty(i, s) && (t.prototype[s] = i[s]);
_._IEEnumFix(t.prototype, i);
}
};
"undefined" != typeof window.KJUR && window.KJUR || (window.KJUR = {});
KJUR = window.KJUR;
KJUR.asn1 = KJUR.asn1 || {};
window.KJUR = KJUR;
KJUR.asn1.ASN1Util = new function() {
this.integerToByteHex = function(t) {
var e = t.toString(16);
e.length % 2 == 1 && (e = "0" + e);
return e;
};
this.bigIntToMinTwosComplementsHex = function(t) {
var e = t.toString(16);
if ("-" != e.substr(0, 1)) e.length % 2 == 1 ? e = "0" + e : e.match(/^[0-7]/) || (e = "00" + e); else {
var s = e.substr(1).length;
s % 2 == 1 ? s += 1 : e.match(/^[0-7]/) || (s += 2);
for (var r = "", n = 0; n < s; n++) r += "f";
e = new i(r, 16).xor(t).add(i.ONE).toString(16).replace(/^-/, "");
}
return e;
};
this.getPEMStringFromHex = function(t, e) {
var i = CryptoJS.enc.Hex.parse(t), s = CryptoJS.enc.Base64.stringify(i).replace(/(.{64})/g, "$1\r\n");
return "-----BEGIN " + e + "-----\r\n" + (s = s.replace(/\r\n$/, "")) + "\r\n-----END " + e + "-----\r\n";
};
}();
window.KJUR = KJUR;
KJUR.asn1.ASN1Object = function() {
this.getLengthHexFromValue = function() {
if ("undefined" == typeof this.hV || null == this.hV) throw "this.hV is null or undefined.";
if (this.hV.length % 2 == 1) throw "value hex must be even length: n=" + "".length + ",v=" + this.hV;
var t = this.hV.length / 2, e = t.toString(16);
e.length % 2 == 1 && (e = "0" + e);
if (t < 128) return e;
var i = e.length / 2;
if (i > 15) throw "ASN.1 length too long to represent by 8x: n = " + t.toString(16);
return (128 + i).toString(16) + e;
};
this.getEncodedHex = function() {
if (null == this.hTLV || this.isModified) {
this.hV = this.getFreshValueHex();
this.hL = this.getLengthHexFromValue();
this.hTLV = this.hT + this.hL + this.hV;
this.isModified = !1;
}
return this.hTLV;
};
this.getValueHex = function() {
this.getEncodedHex();
return this.hV;
};
this.getFreshValueHex = function() {
return "";
};
};
KJUR.asn1.DERAbstractString = function(t) {
KJUR.asn1.DERAbstractString.superclass.constructor.call(this);
this.getString = function() {
return this.s;
};
this.setString = function(t) {
this.hTLV = null;
this.isModified = !0;
this.s = t;
this.hV = stohex(this.s);
};
this.setStringHex = function(t) {
this.hTLV = null;
this.isModified = !0;
this.s = null;
this.hV = t;
};
this.getFreshValueHex = function() {
return this.hV;
};
"undefined" != typeof t && ("undefined" != typeof t.str ? this.setString(t.str) : "undefined" != typeof t.hex && this.setStringHex(t.hex));
};
F.extend(KJUR.asn1.DERAbstractString, KJUR.asn1.ASN1Object);
KJUR.asn1.DERAbstractTime = function() {
KJUR.asn1.DERAbstractTime.superclass.constructor.call(this);
this.localDateToUTC = function(t) {
utc = t.getTime() + 6e4 * t.getTimezoneOffset();
return new Date(utc);
};
this.formatDate = function(t, e) {
var i = this.zeroPadding, s = this.localDateToUTC(t), r = String(s.getFullYear());
"utc" == e && (r = r.substr(2, 2));
return r + i(String(s.getMonth() + 1), 2) + i(String(s.getDate()), 2) + i(String(s.getHours()), 2) + i(String(s.getMinutes()), 2) + i(String(s.getSeconds()), 2) + "Z";
};
this.zeroPadding = function(t, e) {
return t.length >= e ? t : new Array(e - t.length + 1).join("0") + t;
};
this.getString = function() {
return this.s;
};
this.setString = function(t) {
this.hTLV = null;
this.isModified = !0;
this.s = t;
this.hV = stohex(this.s);
};
this.setByDateValue = function(t, e, i, s, r, n) {
var o = new Date(Date.UTC(t, e - 1, i, s, r, n, 0));
this.setByDate(o);
};
this.getFreshValueHex = function() {
return this.hV;
};
};
F.extend(KJUR.asn1.DERAbstractTime, KJUR.asn1.ASN1Object);
KJUR.asn1.DERAbstractStructured = function(t) {
KJUR.asn1.DERAbstractString.superclass.constructor.call(this);
this.setByASN1ObjectArray = function(t) {
this.hTLV = null;
this.isModified = !0;
this.asn1Array = t;
};
this.appendASN1Object = function(t) {
this.hTLV = null;
this.isModified = !0;
this.asn1Array.push(t);
};
this.asn1Array = new Array();
"undefined" != typeof t && "undefined" != typeof t.array && (this.asn1Array = t.array);
};
F.extend(KJUR.asn1.DERAbstractStructured, KJUR.asn1.ASN1Object);
KJUR.asn1.DERBoolean = function() {
KJUR.asn1.DERBoolean.superclass.constructor.call(this);
this.hT = "01";
this.hTLV = "0101ff";
};
F.extend(KJUR.asn1.DERBoolean, KJUR.asn1.ASN1Object);
KJUR.asn1.DERInteger = function(t) {
KJUR.asn1.DERInteger.superclass.constructor.call(this);
this.hT = "02";
this.setByBigInteger = function(t) {
this.hTLV = null;
this.isModified = !0;
this.hV = KJUR.asn1.ASN1Util.bigIntToMinTwosComplementsHex(t);
};
this.setByInteger = function(t) {
var e = new i(String(t), 10);
this.setByBigInteger(e);
};
this.setValueHex = function(t) {
this.hV = t;
};
this.getFreshValueHex = function() {
return this.hV;
};
"undefined" != typeof t && ("undefined" != typeof t.bigint ? this.setByBigInteger(t.bigint) : "undefined" != typeof t.int ? this.setByInteger(t.int) : "undefined" != typeof t.hex && this.setValueHex(t.hex));
};
F.extend(KJUR.asn1.DERInteger, KJUR.asn1.ASN1Object);
KJUR.asn1.DERBitString = function(t) {
KJUR.asn1.DERBitString.superclass.constructor.call(this);
this.hT = "03";
this.setHexValueIncludingUnusedBits = function(t) {
this.hTLV = null;
this.isModified = !0;
this.hV = t;
};
this.setUnusedBitsAndHexValue = function(t, e) {
if (t < 0 || 7 < t) throw "unused bits shall be from 0 to 7: u = " + t;
var i = "0" + t;
this.hTLV = null;
this.isModified = !0;
this.hV = i + e;
};
this.setByBinaryString = function(t) {
var e = 8 - (t = t.replace(/0+$/, "")).length % 8;
8 == e && (e = 0);
for (var i = 0; i <= e; i++) t += "0";
var s = "";
for (i = 0; i < t.length - 1; i += 8) {
var r = t.substr(i, 8), n = parseInt(r, 2).toString(16);
1 == n.length && (n = "0" + n);
s += n;
}
this.hTLV = null;
this.isModified = !0;
this.hV = "0" + e + s;
};
this.setByBooleanArray = function(t) {
for (var e = "", i = 0; i < t.length; i++) 1 == t[i] ? e += "1" : e += "0";
this.setByBinaryString(e);
};
this.newFalseArray = function(t) {
for (var e = new Array(t), i = 0; i < t; i++) e[i] = !1;
return e;
};
this.getFreshValueHex = function() {
return this.hV;
};
"undefined" != typeof t && ("undefined" != typeof t.hex ? this.setHexValueIncludingUnusedBits(t.hex) : "undefined" != typeof t.bin ? this.setByBinaryString(t.bin) : "undefined" != typeof t.array && this.setByBooleanArray(t.array));
};
F.extend(KJUR.asn1.DERBitString, KJUR.asn1.ASN1Object);
KJUR.asn1.DEROctetString = function(t) {
KJUR.asn1.DEROctetString.superclass.constructor.call(this, t);
this.hT = "04";
};
F.extend(KJUR.asn1.DEROctetString, KJUR.asn1.DERAbstractString);
KJUR.asn1.DERNull = function() {
KJUR.asn1.DERNull.superclass.constructor.call(this);
this.hT = "05";
this.hTLV = "0500";
};
F.extend(KJUR.asn1.DERNull, KJUR.asn1.ASN1Object);
KJUR.asn1.DERObjectIdentifier = function(t) {
var e = function(t) {
var e = t.toString(16);
1 == e.length && (e = "0" + e);
return e;
}, s = function(t) {
var s = "", r = new i(t, 10).toString(2), n = 7 - r.length % 7;
7 == n && (n = 0);
for (var o = "", h = 0; h < n; h++) o += "0";
r = o + r;
for (h = 0; h < r.length - 1; h += 7) {
var a = r.substr(h, 7);
h != r.length - 7 && (a = "1" + a);
s += e(parseInt(a, 2));
}
return s;
};
KJUR.asn1.DERObjectIdentifier.superclass.constructor.call(this);
this.hT = "06";
this.setValueHex = function(t) {
this.hTLV = null;
this.isModified = !0;
this.s = null;
this.hV = t;
};
this.setValueOidString = function(t) {
if (!t.match(/^[0-9.]+$/)) throw "malformed oid string: " + t;
var i = "", r = t.split("."), n = 40 * parseInt(r[0]) + parseInt(r[1]);
i += e(n);
r.splice(0, 2);
for (var o = 0; o < r.length; o++) i += s(r[o]);
this.hTLV = null;
this.isModified = !0;
this.s = null;
this.hV = i;
};
this.setValueName = function(t) {
if ("undefined" == typeof KJUR.asn1.x509.OID.name2oidList[t]) throw "DERObjectIdentifier oidName undefined: " + t;
var e = KJUR.asn1.x509.OID.name2oidList[t];
this.setValueOidString(e);
};
this.getFreshValueHex = function() {
return this.hV;
};
"undefined" != typeof t && ("undefined" != typeof t.oid ? this.setValueOidString(t.oid) : "undefined" != typeof t.hex ? this.setValueHex(t.hex) : "undefined" != typeof t.name && this.setValueName(t.name));
};
F.extend(KJUR.asn1.DERObjectIdentifier, KJUR.asn1.ASN1Object);
KJUR.asn1.DERUTF8String = function(t) {
KJUR.asn1.DERUTF8String.superclass.constructor.call(this, t);
this.hT = "0c";
};
F.extend(KJUR.asn1.DERUTF8String, KJUR.asn1.DERAbstractString);
KJUR.asn1.DERNumericString = function(t) {
KJUR.asn1.DERNumericString.superclass.constructor.call(this, t);
this.hT = "12";
};
F.extend(KJUR.asn1.DERNumericString, KJUR.asn1.DERAbstractString);
KJUR.asn1.DERPrintableString = function(t) {
KJUR.asn1.DERPrintableString.superclass.constructor.call(this, t);
this.hT = "13";
};
F.extend(KJUR.asn1.DERPrintableString, KJUR.asn1.DERAbstractString);
KJUR.asn1.DERTeletexString = function(t) {
KJUR.asn1.DERTeletexString.superclass.constructor.call(this, t);
this.hT = "14";
};
F.extend(KJUR.asn1.DERTeletexString, KJUR.asn1.DERAbstractString);
KJUR.asn1.DERIA5String = function(t) {
KJUR.asn1.DERIA5String.superclass.constructor.call(this, t);
this.hT = "16";
};
F.extend(KJUR.asn1.DERIA5String, KJUR.asn1.DERAbstractString);
KJUR.asn1.DERUTCTime = function(t) {
KJUR.asn1.DERUTCTime.superclass.constructor.call(this, t);
this.hT = "17";
this.setByDate = function(t) {
this.hTLV = null;
this.isModified = !0;
this.date = t;
this.s = this.formatDate(this.date, "utc");
this.hV = stohex(this.s);
};
"undefined" != typeof t && ("undefined" != typeof t.str ? this.setString(t.str) : "undefined" != typeof t.hex ? this.setStringHex(t.hex) : "undefined" != typeof t.date && this.setByDate(t.date));
};
F.extend(KJUR.asn1.DERUTCTime, KJUR.asn1.DERAbstractTime);
KJUR.asn1.DERGeneralizedTime = function(t) {
KJUR.asn1.DERGeneralizedTime.superclass.constructor.call(this, t);
this.hT = "18";
this.setByDate = function(t) {
this.hTLV = null;
this.isModified = !0;
this.date = t;
this.s = this.formatDate(this.date, "gen");
this.hV = stohex(this.s);
};
"undefined" != typeof t && ("undefined" != typeof t.str ? this.setString(t.str) : "undefined" != typeof t.hex ? this.setStringHex(t.hex) : "undefined" != typeof t.date && this.setByDate(t.date));
};
F.extend(KJUR.asn1.DERGeneralizedTime, KJUR.asn1.DERAbstractTime);
KJUR.asn1.DERSequence = function(t) {
KJUR.asn1.DERSequence.superclass.constructor.call(this, t);
this.hT = "30";
this.getFreshValueHex = function() {
for (var t = "", e = 0; e < this.asn1Array.length; e++) t += this.asn1Array[e].getEncodedHex();
this.hV = t;
return this.hV;
};
};
F.extend(KJUR.asn1.DERSequence, KJUR.asn1.DERAbstractStructured);
KJUR.asn1.DERSet = function(t) {
KJUR.asn1.DERSet.superclass.constructor.call(this, t);
this.hT = "31";
this.getFreshValueHex = function() {
for (var t = new Array(), e = 0; e < this.asn1Array.length; e++) {
var i = this.asn1Array[e];
t.push(i.getEncodedHex());
}
t.sort();
this.hV = t.join("");
return this.hV;
};
};
F.extend(KJUR.asn1.DERSet, KJUR.asn1.DERAbstractStructured);
KJUR.asn1.DERTaggedObject = function(t) {
KJUR.asn1.DERTaggedObject.superclass.constructor.call(this);
this.hT = "a0";
this.hV = "";
this.isExplicit = !0;
this.asn1Object = null;
this.setASN1Object = function(t, e, i) {
this.hT = e;
this.isExplicit = t;
this.asn1Object = i;
if (this.isExplicit) {
this.hV = this.asn1Object.getEncodedHex();
this.hTLV = null;
this.isModified = !0;
} else {
this.hV = null;
this.hTLV = i.getEncodedHex();
this.hTLV = this.hTLV.replace(/^../, e);
this.isModified = !1;
}
};
this.getFreshValueHex = function() {
return this.hV;
};
if ("undefined" != typeof t) {
"undefined" != typeof t.tag && (this.hT = t.tag);
"undefined" != typeof t.explicit && (this.isExplicit = t.explicit);
if ("undefined" != typeof t.obj) {
this.asn1Object = t.obj;
this.setASN1Object(this.isExplicit, this.hT, this.asn1Object);
}
}
};
F.extend(KJUR.asn1.DERTaggedObject, KJUR.asn1.ASN1Object);
(function() {
"use strict";
var t, e = {
decode: function(e) {
var i;
if (void 0 === t) {
var s = "0123456789ABCDEF", r = " \f\n\r\t \u2028\u2029";
t = [];
for (i = 0; i < 16; ++i) t[s.charAt(i)] = i;
s = s.toLowerCase();
for (i = 10; i < 16; ++i) t[s.charAt(i)] = i;
for (i = 0; i < r.length; ++i) t[r.charAt(i)] = -1;
}
var n = [], o = 0, h = 0;
for (i = 0; i < e.length; ++i) {
var a = e.charAt(i);
if ("=" == a) break;
if (-1 != (a = t[a])) {
if (void 0 === a) throw "Illegal character at offset " + i;
o |= a;
if (++h >= 2) {
n[n.length] = o;
o = 0;
h = 0;
} else o <<= 4;
}
}
if (h) throw "Hex encoding incomplete: 4 bits missing";
return n;
}
};
window.Hex = e;
})();
(function() {
"use strict";
var t, e = {
decode: function(e) {
var i;
if (void 0 === t) {
var s = "= \f\n\r\t \u2028\u2029";
t = [];
for (i = 0; i < 64; ++i) t["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(i)] = i;
for (i = 0; i < s.length; ++i) t[s.charAt(i)] = -1;
}
var r = [], n = 0, o = 0;
for (i = 0; i < e.length; ++i) {
var h = e.charAt(i);
if ("=" == h) break;
if (-1 != (h = t[h])) {
if (void 0 === h) throw "Illegal character at offset " + i;
n |= h;
if (++o >= 4) {
r[r.length] = n >> 16;
r[r.length] = n >> 8 & 255;
r[r.length] = 255 & n;
n = 0;
o = 0;
} else n <<= 6;
}
}
switch (o) {
case 1:
throw "Base64 encoding incomplete: at least 2 bits missing";

case 2:
r[r.length] = n >> 10;
break;

case 3:
r[r.length] = n >> 16;
r[r.length] = n >> 8 & 255;
}
return r;
},
re: /-----BEGIN [^-]+-----([A-Za-z0-9+\/=\s]+)-----END [^-]+-----|begin-base64[^\n]+\n([A-Za-z0-9+\/=\s]+)====/,
unarmor: function(t) {
var i = e.re.exec(t);
if (i) if (i[1]) t = i[1]; else {
if (!i[2]) throw "RegExp out of sync";
t = i[2];
}
return e.decode(t);
}
};
window.Base64 = e;
})();
(function() {
"use strict";
var t = function(t, e) {
var i = document.createElement(t);
i.className = e;
return i;
}, e = function(t) {
return document.createTextNode(t);
};
function i(t, e) {
if (t instanceof i) {
this.enc = t.enc;
this.pos = t.pos;
} else {
this.enc = t;
this.pos = e;
}
}
i.prototype.get = function(t) {
void 0 === t && (t = this.pos++);
if (t >= this.enc.length) throw "Requesting byte offset " + t + " on a stream of length " + this.enc.length;
return this.enc[t];
};
i.prototype.hexDigits = "0123456789ABCDEF";
i.prototype.hexByte = function(t) {
return this.hexDigits.charAt(t >> 4 & 15) + this.hexDigits.charAt(15 & t);
};
i.prototype.hexDump = function(t, e, i) {
for (var s = "", r = t; r < e; ++r) {
s += this.hexByte(this.get(r));
if (!0 !== i) switch (15 & r) {
case 7:
s += "  ";
break;

case 15:
s += "\n";
break;

default:
s += " ";
}
}
return s;
};
i.prototype.parseStringISO = function(t, e) {
for (var i = "", s = t; s < e; ++s) i += String.fromCharCode(this.get(s));
return i;
};
i.prototype.parseStringUTF = function(t, e) {
for (var i = "", s = t; s < e; ) {
var r = this.get(s++);
i += r < 128 ? String.fromCharCode(r) : r > 191 && r < 224 ? String.fromCharCode((31 & r) << 6 | 63 & this.get(s++)) : String.fromCharCode((15 & r) << 12 | (63 & this.get(s++)) << 6 | 63 & this.get(s++));
}
return i;
};
i.prototype.parseStringBMP = function(t, e) {
for (var i = "", s = t; s < e; s += 2) {
var r = this.get(s), n = this.get(s + 1);
i += String.fromCharCode((r << 8) + n);
}
return i;
};
i.prototype.reTime = /^((?:1[89]|2\d)?\d\d)(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])([01]\d|2[0-3])(?:([0-5]\d)(?:([0-5]\d)(?:[.,](\d{1,3}))?)?)?(Z|[-+](?:[0]\d|1[0-2])([0-5]\d)?)?$/;
i.prototype.parseTime = function(t, e) {
var i = this.parseStringISO(t, e), s = this.reTime.exec(i);
if (!s) return "Unrecognized time: " + i;
i = s[1] + "-" + s[2] + "-" + s[3] + " " + s[4];
if (s[5]) {
i += ":" + s[5];
if (s[6]) {
i += ":" + s[6];
s[7] && (i += "." + s[7]);
}
}
if (s[8]) {
i += " UTC";
if ("Z" != s[8]) {
i += s[8];
s[9] && (i += ":" + s[9]);
}
}
return i;
};
i.prototype.parseInteger = function(t, e) {
var i = e - t;
if (i > 4) {
i <<= 3;
var s = this.get(t);
if (0 === s) i -= 8; else for (;s < 128; ) {
s <<= 1;
--i;
}
return "(" + i + " bit)";
}
for (var r = 0, n = t; n < e; ++n) r = r << 8 | this.get(n);
return r;
};
i.prototype.parseBitString = function(t, e) {
var i = this.get(t), s = (e - t - 1 << 3) - i, r = "(" + s + " bit)";
if (s <= 20) {
var n = i;
r += " ";
for (var o = e - 1; o > t; --o) {
for (var h = this.get(o), a = n; a < 8; ++a) r += h >> a & 1 ? "1" : "0";
n = 0;
}
}
return r;
};
i.prototype.parseOctetString = function(t, e) {
var i = e - t, s = "(" + i + " byte) ";
i > 100 && (e = t + 100);
for (var r = t; r < e; ++r) s += this.hexByte(this.get(r));
i > 100 && (s += "…");
return s;
};
i.prototype.parseOID = function(t, e) {
for (var i = "", s = 0, r = 0, n = t; n < e; ++n) {
var o = this.get(n);
s = s << 7 | 127 & o;
r += 7;
if (!(128 & o)) {
if ("" === i) {
var h = s < 80 ? s < 40 ? 0 : 1 : 2;
i = h + "." + (s - 40 * h);
} else i += "." + (r >= 31 ? "bigint" : s);
s = r = 0;
}
}
return i;
};
function s(t, e, i, s, r) {
this.stream = t;
this.header = e;
this.length = i;
this.tag = s;
this.sub = r;
}
s.prototype.typeName = function() {
if (void 0 === this.tag) return "unknown";
var t = this.tag >> 6, e = (this.tag, 31 & this.tag);
switch (t) {
case 0:
switch (e) {
case 0:
return "EOC";

case 1:
return "BOOLEAN";

case 2:
return "INTEGER";

case 3:
return "BIT_STRING";

case 4:
return "OCTET_STRING";

case 5:
return "NULL";

case 6:
return "OBJECT_IDENTIFIER";

case 7:
return "ObjectDescriptor";

case 8:
return "EXTERNAL";

case 9:
return "REAL";

case 10:
return "ENUMERATED";

case 11:
return "EMBEDDED_PDV";

case 12:
return "UTF8String";

case 16:
return "SEQUENCE";

case 17:
return "SET";

case 18:
return "NumericString";

case 19:
return "PrintableString";

case 20:
return "TeletexString";

case 21:
return "VideotexString";

case 22:
return "IA5String";

case 23:
return "UTCTime";

case 24:
return "GeneralizedTime";

case 25:
return "GraphicString";

case 26:
return "VisibleString";

case 27:
return "GeneralString";

case 28:
return "UniversalString";

case 30:
return "BMPString";

default:
return "Universal_" + e.toString(16);
}

case 1:
return "Application_" + e.toString(16);

case 2:
return "[" + e + "]";

case 3:
return "Private_" + e.toString(16);
}
};
s.prototype.reSeemsASCII = /^[ -~]+$/;
s.prototype.content = function() {
if (void 0 === this.tag) return null;
var t = this.tag >> 6, e = 31 & this.tag, i = this.posContent(), s = Math.abs(this.length);
if (0 !== t) {
if (null !== this.sub) return "(" + this.sub.length + " elem)";
var r = this.stream.parseStringISO(i, i + Math.min(s, 100));
return this.reSeemsASCII.test(r) ? r.substring(0, 200) + (r.length > 200 ? "…" : "") : this.stream.parseOctetString(i, i + s);
}
switch (e) {
case 1:
return 0 === this.stream.get(i) ? "false" : "true";

case 2:
return this.stream.parseInteger(i, i + s);

case 3:
return this.sub ? "(" + this.sub.length + " elem)" : this.stream.parseBitString(i, i + s);

case 4:
return this.sub ? "(" + this.sub.length + " elem)" : this.stream.parseOctetString(i, i + s);

case 6:
return this.stream.parseOID(i, i + s);

case 16:
case 17:
return "(" + this.sub.length + " elem)";

case 12:
return this.stream.parseStringUTF(i, i + s);

case 18:
case 19:
case 20:
case 21:
case 22:
case 26:
return this.stream.parseStringISO(i, i + s);

case 30:
return this.stream.parseStringBMP(i, i + s);

case 23:
case 24:
return this.stream.parseTime(i, i + s);
}
return null;
};
s.prototype.toString = function() {
return this.typeName() + "@" + this.stream.pos + "[header:" + this.header + ",length:" + this.length + ",sub:" + (null === this.sub ? "null" : this.sub.length) + "]";
};
s.prototype.print = function(t) {
void 0 === t && (t = "");
document.writeln(t + this);
if (null !== this.sub) {
t += "  ";
for (var e = 0, i = this.sub.length; e < i; ++e) this.sub[e].print(t);
}
};
s.prototype.toPrettyString = function(t) {
void 0 === t && (t = "");
var e = t + this.typeName() + " @" + this.stream.pos;
this.length >= 0 && (e += "+");
e += this.length;
32 & this.tag ? e += " (constructed)" : 3 != this.tag && 4 != this.tag || null === this.sub || (e += " (encapsulates)");
e += "\n";
if (null !== this.sub) {
t += "  ";
for (var i = 0, s = this.sub.length; i < s; ++i) e += this.sub[i].toPrettyString(t);
}
return e;
};
s.prototype.toDOM = function() {
var i = t("div", "node");
i.asn1 = this;
var s = t("div", "head"), r = this.typeName().replace(/_/g, " ");
s.innerHTML = r;
var n = this.content();
if (null !== n) {
n = String(n).replace(/</g, "&lt;");
var o = t("span", "preview");
o.appendChild(e(n));
s.appendChild(o);
}
i.appendChild(s);
this.node = i;
this.head = s;
var h = t("div", "value");
r = "Offset: " + this.stream.pos + "<br/>";
r += "Length: " + this.header + "+";
this.length >= 0 ? r += this.length : r += -this.length + " (undefined)";
32 & this.tag ? r += "<br/>(constructed)" : 3 != this.tag && 4 != this.tag || null === this.sub || (r += "<br/>(encapsulates)");
if (null !== n) {
r += "<br/>Value:<br/><b>" + n + "</b>";
if ("object" == typeof oids && 6 == this.tag) {
var a = oids[n];
if (a) {
a.d && (r += "<br/>" + a.d);
a.c && (r += "<br/>" + a.c);
a.w && (r += "<br/>(warning!)");
}
}
}
h.innerHTML = r;
i.appendChild(h);
var u = t("div", "sub");
if (null !== this.sub) for (var f = 0, c = this.sub.length; f < c; ++f) u.appendChild(this.sub[f].toDOM());
i.appendChild(u);
s.onclick = function() {
i.className = "node collapsed" == i.className ? "node" : "node collapsed";
};
return i;
};
s.prototype.posStart = function() {
return this.stream.pos;
};
s.prototype.posContent = function() {
return this.stream.pos + this.header;
};
s.prototype.posEnd = function() {
return this.stream.pos + this.header + Math.abs(this.length);
};
s.prototype.fakeHover = function(t) {
this.node.className += " hover";
t && (this.head.className += " hover");
};
s.prototype.fakeOut = function(t) {
var e = / ?hover/;
this.node.className = this.node.className.replace(e, "");
t && (this.head.className = this.head.className.replace(e, ""));
};
s.prototype.toHexDOM_sub = function(i, s, r, n, o) {
if (!(n >= o)) {
var h = t("span", s);
h.appendChild(e(r.hexDump(n, o)));
i.appendChild(h);
}
};
s.prototype.toHexDOM = function(i) {
var s = t("span", "hex");
void 0 === i && (i = s);
this.head.hexNode = s;
this.head.onmouseover = function() {
this.hexNode.className = "hexCurrent";
};
this.head.onmouseout = function() {
this.hexNode.className = "hex";
};
s.asn1 = this;
s.onmouseover = function() {
var t = !i.selected;
if (t) {
i.selected = this.asn1;
this.className = "hexCurrent";
}
this.asn1.fakeHover(t);
};
s.onmouseout = function() {
var t = i.selected == this.asn1;
this.asn1.fakeOut(t);
if (t) {
i.selected = null;
this.className = "hex";
}
};
this.toHexDOM_sub(s, "tag", this.stream, this.posStart(), this.posStart() + 1);
this.toHexDOM_sub(s, this.length >= 0 ? "dlen" : "ulen", this.stream, this.posStart() + 1, this.posContent());
if (null === this.sub) s.appendChild(e(this.stream.hexDump(this.posContent(), this.posEnd()))); else if (this.sub.length > 0) {
var r = this.sub[0], n = this.sub[this.sub.length - 1];
this.toHexDOM_sub(s, "intro", this.stream, this.posContent(), r.posStart());
for (var o = 0, h = this.sub.length; o < h; ++o) s.appendChild(this.sub[o].toHexDOM(i));
this.toHexDOM_sub(s, "outro", this.stream, n.posEnd(), this.posEnd());
}
return s;
};
s.prototype.toHexString = function() {
return this.stream.hexDump(this.posStart(), this.posEnd(), !0);
};
s.decodeLength = function(t) {
var e = t.get(), i = 127 & e;
if (i == e) return i;
if (i > 3) throw "Length over 24 bits not supported at position " + (t.pos - 1);
if (0 === i) return -1;
e = 0;
for (var s = 0; s < i; ++s) e = e << 8 | t.get();
return e;
};
s.hasContent = function(t, e, r) {
if (32 & t) return !0;
if (t < 3 || t > 4) return !1;
var n = new i(r);
3 == t && n.get();
if (n.get() >> 6 & 1) return !1;
try {
var o = s.decodeLength(n);
return n.pos - r.pos + o == e;
} catch (t) {
return !1;
}
};
s.decode = function(t) {
t instanceof i || (t = new i(t, 0));
var e = new i(t), r = t.get(), n = s.decodeLength(t), o = t.pos - e.pos, h = null;
if (s.hasContent(r, n, t)) {
var a = t.pos;
3 == r && t.get();
h = [];
if (n >= 0) {
for (var u = a + n; t.pos < u; ) h[h.length] = s.decode(t);
if (t.pos != u) throw "Content size is not correct for container starting at offset " + a;
} else try {
for (;;) {
var f = s.decode(t);
if (0 === f.tag) break;
h[h.length] = f;
}
n = a - t.pos;
} catch (t) {
throw "Exception while decoding undefined length content: " + t;
}
} else t.pos += n;
return new s(e, o, n, r, h);
};
s.test = function() {
for (var t = [ {
value: [ 39 ],
expected: 39
}, {
value: [ 129, 201 ],
expected: 201
}, {
value: [ 131, 254, 220, 186 ],
expected: 16702650
} ], e = 0, r = t.length; e < r; ++e) {
var n = new i(t[e].value, 0), o = s.decodeLength(n);
o != t[e].expected && document.write("In test[" + e + "] expected " + t[e].expected + " got " + o + "\n");
}
};
window.ASN1 = s;
})();
ASN1.prototype.getHexStringValue = function() {
var t = this.toHexString(), e = 2 * this.header, i = 2 * this.length;
return t.substr(e, i);
};
L.prototype.parseKey = function(t) {
try {
var e = 0, i = 0, s = /^\s*(?:[0-9A-Fa-f][0-9A-Fa-f]\s*)+$/.test(t) ? Hex.decode(t) : Base64.unarmor(t), r = ASN1.decode(s);
3 === r.sub.length && (r = r.sub[2].sub[0]);
if (9 === r.sub.length) {
e = r.sub[1].getHexStringValue();
this.n = P(e, 16);
i = r.sub[2].getHexStringValue();
this.e = parseInt(i, 16);
var n = r.sub[3].getHexStringValue();
this.d = P(n, 16);
var o = r.sub[4].getHexStringValue();
this.p = P(o, 16);
var h = r.sub[5].getHexStringValue();
this.q = P(h, 16);
var a = r.sub[6].getHexStringValue();
this.dmp1 = P(a, 16);
var u = r.sub[7].getHexStringValue();
this.dmq1 = P(u, 16);
var f = r.sub[8].getHexStringValue();
this.coeff = P(f, 16);
} else {
if (2 !== r.sub.length) return !1;
var c = r.sub[1].sub[0];
e = c.sub[0].getHexStringValue();
this.n = P(e, 16);
i = c.sub[1].getHexStringValue();
this.e = parseInt(i, 16);
}
return !0;
} catch (t) {
return !1;
}
};
L.prototype.getPrivateBaseKey = function() {
var t = {
array: [ new KJUR.asn1.DERInteger({
int: 0
}), new KJUR.asn1.DERInteger({
bigint: this.n
}), new KJUR.asn1.DERInteger({
int: this.e
}), new KJUR.asn1.DERInteger({
bigint: this.d
}), new KJUR.asn1.DERInteger({
bigint: this.p
}), new KJUR.asn1.DERInteger({
bigint: this.q
}), new KJUR.asn1.DERInteger({
bigint: this.dmp1
}), new KJUR.asn1.DERInteger({
bigint: this.dmq1
}), new KJUR.asn1.DERInteger({
bigint: this.coeff
}) ]
};
return new KJUR.asn1.DERSequence(t).getEncodedHex();
};
L.prototype.getPrivateBaseKeyB64 = function() {
return j(this.getPrivateBaseKey());
};
L.prototype.getPublicBaseKey = function() {
var t = {
array: [ new KJUR.asn1.DERObjectIdentifier({
oid: "1.2.840.113549.1.1.1"
}), new KJUR.asn1.DERNull() ]
}, e = new KJUR.asn1.DERSequence(t);
t = {
array: [ new KJUR.asn1.DERInteger({
bigint: this.n
}), new KJUR.asn1.DERInteger({
int: this.e
}) ]
};
t = {
hex: "00" + new KJUR.asn1.DERSequence(t).getEncodedHex()
};
t = {
array: [ e, new KJUR.asn1.DERBitString(t) ]
};
return new KJUR.asn1.DERSequence(t).getEncodedHex();
};
L.prototype.getPublicBaseKeyB64 = function() {
return j(this.getPublicBaseKey());
};
L.prototype.wordwrap = function(t, e) {
if (!t) return t;
var i = "(.{1," + (e = e || 64) + "})( +|$\n?)|(.{1," + e + "})";
return t.match(RegExp(i, "g")).join("\n");
};
L.prototype.getPrivateKey = function() {
var t = "-----BEGIN RSA PRIVATE KEY-----\n";
return (t += this.wordwrap(this.getPrivateBaseKeyB64()) + "\n") + "-----END RSA PRIVATE KEY-----";
};
L.prototype.getPublicKey = function() {
var t = "-----BEGIN PUBLIC KEY-----\n";
return (t += this.wordwrap(this.getPublicBaseKeyB64()) + "\n") + "-----END PUBLIC KEY-----";
};
L.prototype.hasPublicKeyProperty = function(t) {
return (t = t || {}).hasOwnProperty("n") && t.hasOwnProperty("e");
};
L.prototype.hasPrivateKeyProperty = function(t) {
return (t = t || {}).hasOwnProperty("n") && t.hasOwnProperty("e") && t.hasOwnProperty("d") && t.hasOwnProperty("p") && t.hasOwnProperty("q") && t.hasOwnProperty("dmp1") && t.hasOwnProperty("dmq1") && t.hasOwnProperty("coeff");
};
L.prototype.parsePropertiesFrom = function(t) {
this.n = t.n;
this.e = t.e;
if (t.hasOwnProperty("d")) {
this.d = t.d;
this.p = t.p;
this.q = t.q;
this.dmp1 = t.dmp1;
this.dmq1 = t.dmq1;
this.coeff = t.coeff;
}
};
var G = function(t) {
L.call(this);
t && ("string" == typeof t ? this.parseKey(t) : (this.hasPrivateKeyProperty(t) || this.hasPublicKeyProperty(t)) && this.parsePropertiesFrom(t));
};
(G.prototype = new L()).constructor = G;
var $ = function(t) {
t = t || {};
this.default_key_size = parseInt(t.default_key_size) || 1024;
this.default_public_exponent = t.default_public_exponent || "010001";
this.log = t.log || !1;
this.key = null;
};
$.prototype.setKey = function(t) {
this.log && this.key && console.warn("A key was already set, overriding existing.");
this.key = new G(t);
};
$.prototype.setPrivateKey = function(t) {
this.setKey(t);
};
$.prototype.setPublicKey = function(t) {
this.setKey(t);
};
$.prototype.decrypt = function(t) {
try {
console.log("111111", this.getKey());
console.log("222222", this.getKey().decrypt);
console.log("333333", k(t));
console.log("444444", this.getKey().decrypt(k(t)));
return this.getKey().decrypt(k(t));
} catch (t) {
return !1;
}
};
$.prototype.encrypt = function(t) {
try {
return j(this.getKey().encrypt(t));
} catch (t) {
return !1;
}
};
$.prototype.getKey = function(t) {
if (!this.key) {
this.key = new G();
if (t && "[object Function]" === {}.toString.call(t)) {
this.key.generateAsync(this.default_key_size, this.default_public_exponent, t);
return;
}
this.key.generate(this.default_key_size, this.default_public_exponent);
}
return this.key;
};
$.prototype.getPrivateKey = function() {
return this.getKey().getPrivateKey();
};
$.prototype.getPrivateKeyB64 = function() {
return this.getKey().getPrivateBaseKeyB64();
};
$.prototype.getPublicKey = function() {
return this.getKey().getPublicKey();
};
$.prototype.getPublicKeyB64 = function() {
return this.getKey().getPublicBaseKeyB64();
};
$.version = "2.3.1";
t.JSEncrypt = $;
});