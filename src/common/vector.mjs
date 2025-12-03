const pi = Math.PI
export function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max)
}
export class vec2 {
    constructor(a = 0, b = 0) {
        if (a.y != undefined) { this.x = a.x; this.y = a.y; }
        else { this.x = a; this.y = b; }
    }
    equals(v) {
        if (this.x != v.x) return false;
        if (this.y != v.y) return false;
        return true;
    }
    add(a = 0, b = 0) {
        let x = a, y = b;
        if (a.y != undefined) { x = a.x; y = a.y; }
        this.x += x; this.y += y;
    }
    sub(a = 0, b = 0) {
        let x = a, y = b;
        if (a.y != undefined) { x = a.x; y = a.y; }
        this.x -= x; this.y -= y;
    }
    mult(l) {
        this.x *= l; this.y *= l;
    }
    plus(a = 0, b = 0) {
        let x = a, y = b;
        if (a.y != undefined) { x = a.x; y = a.y; }
        return new vec2(this.x + x, this.y + y);
    }
    minus(a = 0, b = 0) {
        let x = a, y = b;
        if (a.y != undefined) { x = a.x; y = a.y; }
        return new vec2(this.x - x, this.y - y);
    }
    times(l) {
        return new vec2(this.x * l, this.y * l);
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    normalize() {
        let l = this.length(); if (l == 0) return;
        this.x /= l; this.y /= l;
    }
    normalized() {
        let l = this.length(); if (l == 0) return new vec2();
        return new vec2(this.x /= l, this.y /= l);
    }
    distance(v) {
        return Math.sqrt((this.x - v.x) * (this.x - v.x) + (this.y - v.y) * (this.y - v.y));
    }
    setMag(l) {
        this.normalize(); this.x *= l; this.y *= l;
    }
    scalar(w) {
        return this.x * w.x + this.y * w.y;
    }
    rotate(deg = pi * 0.5, radians = true) {
        if (radians == false) { deg *= pi / 180.0; }
        let cos = Math.cos(deg); let sin = Math.sin(deg);
        let _x = this.x * cos - this.y * sin;
        let _y = this.x * sin + this.y * cos;
        this.x = _x; this.y = _y;
    }
    rotated(deg = pi * 0.5, radians = true) {
        if (radians == false) { deg *= pi / 180.0; }
        let cos = Math.cos(deg); let sin = Math.sin(deg);
        let _x = this.x * cos - this.y * sin;
        let _y = this.x * sin + this.y * cos;
        return new vec2(_x, _y)
    }
    lerp(w, t) {//standard linear interpolation
        t = clamp(t, 0, 1);
        return new vec2(this.x * (1 - t) + w.x * t, this.y * (1 - t) + w.y * t);
    }
    aLerp(w, t) {//an armonic interpolation
        t = clamp(t, 0, 1);
        t = 1 - Math.cos(t * pi + 1) / 2;
        return new vec2(this.x * (1 - t) + w.x * t, this.y * (1 - t) + w.y * t);
    }
    angle() {
        return Math.atan2(this.y, this.x);
    }

}

export class vec3 {
    constructor(a = 0, b = 0, c = 0) {
        if (a.z != undefined) { this.x = a.x; this.y = a.y; this.z = a.z; }
        else if (a.y != undefined) { this.x = a.x; this.y = a.y; this.z = b; }
        else { this.x = a; this.y = b; this.z = c; }
    }
    equals(b) {
        if (this.x != b.x) return false;
        if (this.y != b.y) return false;
        if (this.z != b.z) return false;
        return true;
    }
    add(a = 0, b = 0, c = 0) {
        let x = a, y = b, z = c;
        if (a.y != undefined) { x = a.x; y = a.y; z = b; }
        if (a.z != undefined) { z = a.z; }
        this.x += x; this.y += y; this.z += z;
    }
    sub(a = 0, b = 0, c = 0) {
        let x = a, y = b, z = c;
        if (a.y != undefined) { x = a.x; y = a.y; z = b; }
        if (a.z != undefined) { z = a.z; }
        this.x -= x; this.y -= y; this.z -= z;
    }
    mult(l) {
        this.x *= l; this.y *= l; this.z *= l;
    }
    plus(a = 0, b = 0, c = 0) {
        let x = a, y = b, z = c;
        if (a.y != undefined) { x = a.x; y = a.y; z = b; }
        if (a.z != undefined) { z = a.z; }
        return new vec3(this.x + x, this.y + y, this.z + z);
    }
    minus(a = 0, b = 0, c = 0) {
        let x = a, y = b, z = c;
        if (a.y != undefined) { x = a.x; y = a.y; z = b; }
        if (a.z != undefined) { z = a.z; }
        return new vec3(this.x - x, this.y - y, this.z - z);
    }
    times(l) {
        return new vec3(this.x * l, this.y * l, this.z * l);
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    normalize() {
        let l = this.length(); if (l == 0) return;
        this.x /= l; this.y /= l; this.z /= l;
    }
    normalized() {
        let l = this.length(); if (l == 0) return new vec3();
        return new vec3(this.x /= l, this.y /= l, this.z /= l);
    }
    distance(b) {
        return Math.sqrt((this.x - b.x) * (this.x - b.x) + (this.y - b.y) * (this.y - b.y) + (this.z - b.z) * (this.z - b.z));
    }
    setMag(l) {
        this.normalize(); this.x *= l; this.y *= l; this.z *= l;
    }
    scalar(w) {
        return this.x * w.x + this.y * w.y + this.z * w.z;
    }
    rotate(deg = pi * 0.5, radians = true) {
        if (radians == false) { deg *= pi / 180.0; }
        let cos = Math.cos(deg); let sin = Math.sin(deg);
        let _x = this.x * cos - this.y * sin;
        let _y = this.x * sin + this.y * cos;
        this.x = _x; this.y = _y;
    }
    rotated(deg = pi * 0.5, radians = true) {
        if (radians == false) { deg *= pi / 180.0; }
        let cos = Math.cos(deg); let sin = Math.sin(deg);
        let _x = this.x * cos - this.y * sin;
        let _y = this.x * sin + this.y * cos;
        return new vec3(_x, _y, this.z);
    }
    lerp(w, t) {//standard linear interpolation
        t = clamp(t, 0, 1);
        return new vec3(this.x * (1 - t) + w.x * t, this.y * (1 - t) + w.y * t, this.z * (1 - t) + w.z * t);
    }
    aLerp(w, t) {//an armonic interpolation
        t = clamp(t, 0, 1);
        t = 1 - Math.cos(t * pi + 1) / 2;
        return new vec3(this.x * (1 - t) + w.x * t, this.y * (1 - t) + w.y * t, this.z * (1 - t) + w.z * t);
    }
}