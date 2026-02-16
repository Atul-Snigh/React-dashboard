// Polyfill for DOMMatrix in Node.js environment
// This is required because pdf-parse (via pdfjs-dist) may try to use DOMMatrix which is not available in Node.js

if (typeof global.DOMMatrix === 'undefined') {
    // Minimal mock of DOMMatrix
    (global as any).DOMMatrix = class DOMMatrix {
        a: number = 1;
        b: number = 0;
        c: number = 0;
        d: number = 1;
        e: number = 0;
        f: number = 0;

        constructor(init?: string | number[]) {
            // minimal constructor
        }

        toString() {
            return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.e}, ${this.f})`;
        }
    };
}
