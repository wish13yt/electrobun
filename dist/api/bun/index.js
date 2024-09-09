// @bun
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};

// src/bun/node_modules/tar/lib/high-level-opt.js
var require_high_level_opt = __commonJS((exports, module) => {
  var argmap = new Map([
    ["C", "cwd"],
    ["f", "file"],
    ["z", "gzip"],
    ["P", "preservePaths"],
    ["U", "unlink"],
    ["strip-components", "strip"],
    ["stripComponents", "strip"],
    ["keep-newer", "newer"],
    ["keepNewer", "newer"],
    ["keep-newer-files", "newer"],
    ["keepNewerFiles", "newer"],
    ["k", "keep"],
    ["keep-existing", "keep"],
    ["keepExisting", "keep"],
    ["m", "noMtime"],
    ["no-mtime", "noMtime"],
    ["p", "preserveOwner"],
    ["L", "follow"],
    ["h", "follow"]
  ]);
  module.exports = (opt) => opt ? Object.keys(opt).map((k) => [
    argmap.has(k) ? argmap.get(k) : k,
    opt[k]
  ]).reduce((set, kv) => (set[kv[0]] = kv[1], set), Object.create(null)) : {};
});

// src/bun/node_modules/minipass/index.js
var require_minipass = __commonJS((exports) => {
  var proc = typeof process === "object" && process ? process : {
    stdout: null,
    stderr: null
  };
  var EE = import.meta.require("events");
  var Stream = import.meta.require("stream");
  var stringdecoder = import.meta.require("string_decoder");
  var SD = stringdecoder.StringDecoder;
  var EOF = Symbol("EOF");
  var MAYBE_EMIT_END = Symbol("maybeEmitEnd");
  var EMITTED_END = Symbol("emittedEnd");
  var EMITTING_END = Symbol("emittingEnd");
  var EMITTED_ERROR = Symbol("emittedError");
  var CLOSED = Symbol("closed");
  var READ = Symbol("read");
  var FLUSH = Symbol("flush");
  var FLUSHCHUNK = Symbol("flushChunk");
  var ENCODING = Symbol("encoding");
  var DECODER = Symbol("decoder");
  var FLOWING = Symbol("flowing");
  var PAUSED = Symbol("paused");
  var RESUME = Symbol("resume");
  var BUFFER = Symbol("buffer");
  var PIPES = Symbol("pipes");
  var BUFFERLENGTH = Symbol("bufferLength");
  var BUFFERPUSH = Symbol("bufferPush");
  var BUFFERSHIFT = Symbol("bufferShift");
  var OBJECTMODE = Symbol("objectMode");
  var DESTROYED = Symbol("destroyed");
  var ERROR = Symbol("error");
  var EMITDATA = Symbol("emitData");
  var EMITEND = Symbol("emitEnd");
  var EMITEND2 = Symbol("emitEnd2");
  var ASYNC = Symbol("async");
  var ABORT = Symbol("abort");
  var ABORTED = Symbol("aborted");
  var SIGNAL = Symbol("signal");
  var defer = (fn) => Promise.resolve().then(fn);
  var doIter = global._MP_NO_ITERATOR_SYMBOLS_ !== "1";
  var ASYNCITERATOR = doIter && Symbol.asyncIterator || Symbol("asyncIterator not implemented");
  var ITERATOR = doIter && Symbol.iterator || Symbol("iterator not implemented");
  var isEndish = (ev) => ev === "end" || ev === "finish" || ev === "prefinish";
  var isArrayBuffer = (b) => b instanceof ArrayBuffer || typeof b === "object" && b.constructor && b.constructor.name === "ArrayBuffer" && b.byteLength >= 0;
  var isArrayBufferView = (b) => !Buffer.isBuffer(b) && ArrayBuffer.isView(b);

  class Pipe {
    constructor(src, dest, opts) {
      this.src = src;
      this.dest = dest;
      this.opts = opts;
      this.ondrain = () => src[RESUME]();
      dest.on("drain", this.ondrain);
    }
    unpipe() {
      this.dest.removeListener("drain", this.ondrain);
    }
    proxyErrors() {
    }
    end() {
      this.unpipe();
      if (this.opts.end)
        this.dest.end();
    }
  }

  class PipeProxyErrors extends Pipe {
    unpipe() {
      this.src.removeListener("error", this.proxyErrors);
      super.unpipe();
    }
    constructor(src, dest, opts) {
      super(src, dest, opts);
      this.proxyErrors = (er) => dest.emit("error", er);
      src.on("error", this.proxyErrors);
    }
  }

  class Minipass extends Stream {
    constructor(options) {
      super();
      this[FLOWING] = false;
      this[PAUSED] = false;
      this[PIPES] = [];
      this[BUFFER] = [];
      this[OBJECTMODE] = options && options.objectMode || false;
      if (this[OBJECTMODE])
        this[ENCODING] = null;
      else
        this[ENCODING] = options && options.encoding || null;
      if (this[ENCODING] === "buffer")
        this[ENCODING] = null;
      this[ASYNC] = options && !!options.async || false;
      this[DECODER] = this[ENCODING] ? new SD(this[ENCODING]) : null;
      this[EOF] = false;
      this[EMITTED_END] = false;
      this[EMITTING_END] = false;
      this[CLOSED] = false;
      this[EMITTED_ERROR] = null;
      this.writable = true;
      this.readable = true;
      this[BUFFERLENGTH] = 0;
      this[DESTROYED] = false;
      if (options && options.debugExposeBuffer === true) {
        Object.defineProperty(this, "buffer", { get: () => this[BUFFER] });
      }
      if (options && options.debugExposePipes === true) {
        Object.defineProperty(this, "pipes", { get: () => this[PIPES] });
      }
      this[SIGNAL] = options && options.signal;
      this[ABORTED] = false;
      if (this[SIGNAL]) {
        this[SIGNAL].addEventListener("abort", () => this[ABORT]());
        if (this[SIGNAL].aborted) {
          this[ABORT]();
        }
      }
    }
    get bufferLength() {
      return this[BUFFERLENGTH];
    }
    get encoding() {
      return this[ENCODING];
    }
    set encoding(enc) {
      if (this[OBJECTMODE])
        throw new Error("cannot set encoding in objectMode");
      if (this[ENCODING] && enc !== this[ENCODING] && (this[DECODER] && this[DECODER].lastNeed || this[BUFFERLENGTH]))
        throw new Error("cannot change encoding");
      if (this[ENCODING] !== enc) {
        this[DECODER] = enc ? new SD(enc) : null;
        if (this[BUFFER].length)
          this[BUFFER] = this[BUFFER].map((chunk) => this[DECODER].write(chunk));
      }
      this[ENCODING] = enc;
    }
    setEncoding(enc) {
      this.encoding = enc;
    }
    get objectMode() {
      return this[OBJECTMODE];
    }
    set objectMode(om) {
      this[OBJECTMODE] = this[OBJECTMODE] || !!om;
    }
    get ["async"]() {
      return this[ASYNC];
    }
    set ["async"](a) {
      this[ASYNC] = this[ASYNC] || !!a;
    }
    [ABORT]() {
      this[ABORTED] = true;
      this.emit("abort", this[SIGNAL].reason);
      this.destroy(this[SIGNAL].reason);
    }
    get aborted() {
      return this[ABORTED];
    }
    set aborted(_) {
    }
    write(chunk, encoding, cb) {
      if (this[ABORTED])
        return false;
      if (this[EOF])
        throw new Error("write after end");
      if (this[DESTROYED]) {
        this.emit("error", Object.assign(new Error("Cannot call write after a stream was destroyed"), { code: "ERR_STREAM_DESTROYED" }));
        return true;
      }
      if (typeof encoding === "function")
        cb = encoding, encoding = "utf8";
      if (!encoding)
        encoding = "utf8";
      const fn = this[ASYNC] ? defer : (f) => f();
      if (!this[OBJECTMODE] && !Buffer.isBuffer(chunk)) {
        if (isArrayBufferView(chunk))
          chunk = Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
        else if (isArrayBuffer(chunk))
          chunk = Buffer.from(chunk);
        else if (typeof chunk !== "string")
          this.objectMode = true;
      }
      if (this[OBJECTMODE]) {
        if (this.flowing && this[BUFFERLENGTH] !== 0)
          this[FLUSH](true);
        if (this.flowing)
          this.emit("data", chunk);
        else
          this[BUFFERPUSH](chunk);
        if (this[BUFFERLENGTH] !== 0)
          this.emit("readable");
        if (cb)
          fn(cb);
        return this.flowing;
      }
      if (!chunk.length) {
        if (this[BUFFERLENGTH] !== 0)
          this.emit("readable");
        if (cb)
          fn(cb);
        return this.flowing;
      }
      if (typeof chunk === "string" && !(encoding === this[ENCODING] && !this[DECODER].lastNeed)) {
        chunk = Buffer.from(chunk, encoding);
      }
      if (Buffer.isBuffer(chunk) && this[ENCODING])
        chunk = this[DECODER].write(chunk);
      if (this.flowing && this[BUFFERLENGTH] !== 0)
        this[FLUSH](true);
      if (this.flowing)
        this.emit("data", chunk);
      else
        this[BUFFERPUSH](chunk);
      if (this[BUFFERLENGTH] !== 0)
        this.emit("readable");
      if (cb)
        fn(cb);
      return this.flowing;
    }
    read(n) {
      if (this[DESTROYED])
        return null;
      if (this[BUFFERLENGTH] === 0 || n === 0 || n > this[BUFFERLENGTH]) {
        this[MAYBE_EMIT_END]();
        return null;
      }
      if (this[OBJECTMODE])
        n = null;
      if (this[BUFFER].length > 1 && !this[OBJECTMODE]) {
        if (this.encoding)
          this[BUFFER] = [this[BUFFER].join("")];
        else
          this[BUFFER] = [Buffer.concat(this[BUFFER], this[BUFFERLENGTH])];
      }
      const ret = this[READ](n || null, this[BUFFER][0]);
      this[MAYBE_EMIT_END]();
      return ret;
    }
    [READ](n, chunk) {
      if (n === chunk.length || n === null)
        this[BUFFERSHIFT]();
      else {
        this[BUFFER][0] = chunk.slice(n);
        chunk = chunk.slice(0, n);
        this[BUFFERLENGTH] -= n;
      }
      this.emit("data", chunk);
      if (!this[BUFFER].length && !this[EOF])
        this.emit("drain");
      return chunk;
    }
    end(chunk, encoding, cb) {
      if (typeof chunk === "function")
        cb = chunk, chunk = null;
      if (typeof encoding === "function")
        cb = encoding, encoding = "utf8";
      if (chunk)
        this.write(chunk, encoding);
      if (cb)
        this.once("end", cb);
      this[EOF] = true;
      this.writable = false;
      if (this.flowing || !this[PAUSED])
        this[MAYBE_EMIT_END]();
      return this;
    }
    [RESUME]() {
      if (this[DESTROYED])
        return;
      this[PAUSED] = false;
      this[FLOWING] = true;
      this.emit("resume");
      if (this[BUFFER].length)
        this[FLUSH]();
      else if (this[EOF])
        this[MAYBE_EMIT_END]();
      else
        this.emit("drain");
    }
    resume() {
      return this[RESUME]();
    }
    pause() {
      this[FLOWING] = false;
      this[PAUSED] = true;
    }
    get destroyed() {
      return this[DESTROYED];
    }
    get flowing() {
      return this[FLOWING];
    }
    get paused() {
      return this[PAUSED];
    }
    [BUFFERPUSH](chunk) {
      if (this[OBJECTMODE])
        this[BUFFERLENGTH] += 1;
      else
        this[BUFFERLENGTH] += chunk.length;
      this[BUFFER].push(chunk);
    }
    [BUFFERSHIFT]() {
      if (this[OBJECTMODE])
        this[BUFFERLENGTH] -= 1;
      else
        this[BUFFERLENGTH] -= this[BUFFER][0].length;
      return this[BUFFER].shift();
    }
    [FLUSH](noDrain) {
      do {
      } while (this[FLUSHCHUNK](this[BUFFERSHIFT]()) && this[BUFFER].length);
      if (!noDrain && !this[BUFFER].length && !this[EOF])
        this.emit("drain");
    }
    [FLUSHCHUNK](chunk) {
      this.emit("data", chunk);
      return this.flowing;
    }
    pipe(dest, opts) {
      if (this[DESTROYED])
        return;
      const ended = this[EMITTED_END];
      opts = opts || {};
      if (dest === proc.stdout || dest === proc.stderr)
        opts.end = false;
      else
        opts.end = opts.end !== false;
      opts.proxyErrors = !!opts.proxyErrors;
      if (ended) {
        if (opts.end)
          dest.end();
      } else {
        this[PIPES].push(!opts.proxyErrors ? new Pipe(this, dest, opts) : new PipeProxyErrors(this, dest, opts));
        if (this[ASYNC])
          defer(() => this[RESUME]());
        else
          this[RESUME]();
      }
      return dest;
    }
    unpipe(dest) {
      const p = this[PIPES].find((p2) => p2.dest === dest);
      if (p) {
        this[PIPES].splice(this[PIPES].indexOf(p), 1);
        p.unpipe();
      }
    }
    addListener(ev, fn) {
      return this.on(ev, fn);
    }
    on(ev, fn) {
      const ret = super.on(ev, fn);
      if (ev === "data" && !this[PIPES].length && !this.flowing)
        this[RESUME]();
      else if (ev === "readable" && this[BUFFERLENGTH] !== 0)
        super.emit("readable");
      else if (isEndish(ev) && this[EMITTED_END]) {
        super.emit(ev);
        this.removeAllListeners(ev);
      } else if (ev === "error" && this[EMITTED_ERROR]) {
        if (this[ASYNC])
          defer(() => fn.call(this, this[EMITTED_ERROR]));
        else
          fn.call(this, this[EMITTED_ERROR]);
      }
      return ret;
    }
    get emittedEnd() {
      return this[EMITTED_END];
    }
    [MAYBE_EMIT_END]() {
      if (!this[EMITTING_END] && !this[EMITTED_END] && !this[DESTROYED] && this[BUFFER].length === 0 && this[EOF]) {
        this[EMITTING_END] = true;
        this.emit("end");
        this.emit("prefinish");
        this.emit("finish");
        if (this[CLOSED])
          this.emit("close");
        this[EMITTING_END] = false;
      }
    }
    emit(ev, data, ...extra) {
      if (ev !== "error" && ev !== "close" && ev !== DESTROYED && this[DESTROYED])
        return;
      else if (ev === "data") {
        return !this[OBJECTMODE] && !data ? false : this[ASYNC] ? defer(() => this[EMITDATA](data)) : this[EMITDATA](data);
      } else if (ev === "end") {
        return this[EMITEND]();
      } else if (ev === "close") {
        this[CLOSED] = true;
        if (!this[EMITTED_END] && !this[DESTROYED])
          return;
        const ret2 = super.emit("close");
        this.removeAllListeners("close");
        return ret2;
      } else if (ev === "error") {
        this[EMITTED_ERROR] = data;
        super.emit(ERROR, data);
        const ret2 = !this[SIGNAL] || this.listeners("error").length ? super.emit("error", data) : false;
        this[MAYBE_EMIT_END]();
        return ret2;
      } else if (ev === "resume") {
        const ret2 = super.emit("resume");
        this[MAYBE_EMIT_END]();
        return ret2;
      } else if (ev === "finish" || ev === "prefinish") {
        const ret2 = super.emit(ev);
        this.removeAllListeners(ev);
        return ret2;
      }
      const ret = super.emit(ev, data, ...extra);
      this[MAYBE_EMIT_END]();
      return ret;
    }
    [EMITDATA](data) {
      for (const p of this[PIPES]) {
        if (p.dest.write(data) === false)
          this.pause();
      }
      const ret = super.emit("data", data);
      this[MAYBE_EMIT_END]();
      return ret;
    }
    [EMITEND]() {
      if (this[EMITTED_END])
        return;
      this[EMITTED_END] = true;
      this.readable = false;
      if (this[ASYNC])
        defer(() => this[EMITEND2]());
      else
        this[EMITEND2]();
    }
    [EMITEND2]() {
      if (this[DECODER]) {
        const data = this[DECODER].end();
        if (data) {
          for (const p of this[PIPES]) {
            p.dest.write(data);
          }
          super.emit("data", data);
        }
      }
      for (const p of this[PIPES]) {
        p.end();
      }
      const ret = super.emit("end");
      this.removeAllListeners("end");
      return ret;
    }
    collect() {
      const buf = [];
      if (!this[OBJECTMODE])
        buf.dataLength = 0;
      const p = this.promise();
      this.on("data", (c) => {
        buf.push(c);
        if (!this[OBJECTMODE])
          buf.dataLength += c.length;
      });
      return p.then(() => buf);
    }
    concat() {
      return this[OBJECTMODE] ? Promise.reject(new Error("cannot concat in objectMode")) : this.collect().then((buf) => this[OBJECTMODE] ? Promise.reject(new Error("cannot concat in objectMode")) : this[ENCODING] ? buf.join("") : Buffer.concat(buf, buf.dataLength));
    }
    promise() {
      return new Promise((resolve, reject) => {
        this.on(DESTROYED, () => reject(new Error("stream destroyed")));
        this.on("error", (er) => reject(er));
        this.on("end", () => resolve());
      });
    }
    [ASYNCITERATOR]() {
      let stopped = false;
      const stop = () => {
        this.pause();
        stopped = true;
        return Promise.resolve({ done: true });
      };
      const next = () => {
        if (stopped)
          return stop();
        const res = this.read();
        if (res !== null)
          return Promise.resolve({ done: false, value: res });
        if (this[EOF])
          return stop();
        let resolve = null;
        let reject = null;
        const onerr = (er) => {
          this.removeListener("data", ondata);
          this.removeListener("end", onend);
          this.removeListener(DESTROYED, ondestroy);
          stop();
          reject(er);
        };
        const ondata = (value) => {
          this.removeListener("error", onerr);
          this.removeListener("end", onend);
          this.removeListener(DESTROYED, ondestroy);
          this.pause();
          resolve({ value, done: !!this[EOF] });
        };
        const onend = () => {
          this.removeListener("error", onerr);
          this.removeListener("data", ondata);
          this.removeListener(DESTROYED, ondestroy);
          stop();
          resolve({ done: true });
        };
        const ondestroy = () => onerr(new Error("stream destroyed"));
        return new Promise((res2, rej) => {
          reject = rej;
          resolve = res2;
          this.once(DESTROYED, ondestroy);
          this.once("error", onerr);
          this.once("end", onend);
          this.once("data", ondata);
        });
      };
      return {
        next,
        throw: stop,
        return: stop,
        [ASYNCITERATOR]() {
          return this;
        }
      };
    }
    [ITERATOR]() {
      let stopped = false;
      const stop = () => {
        this.pause();
        this.removeListener(ERROR, stop);
        this.removeListener(DESTROYED, stop);
        this.removeListener("end", stop);
        stopped = true;
        return { done: true };
      };
      const next = () => {
        if (stopped)
          return stop();
        const value = this.read();
        return value === null ? stop() : { value };
      };
      this.once("end", stop);
      this.once(ERROR, stop);
      this.once(DESTROYED, stop);
      return {
        next,
        throw: stop,
        return: stop,
        [ITERATOR]() {
          return this;
        }
      };
    }
    destroy(er) {
      if (this[DESTROYED]) {
        if (er)
          this.emit("error", er);
        else
          this.emit(DESTROYED);
        return this;
      }
      this[DESTROYED] = true;
      this[BUFFER].length = 0;
      this[BUFFERLENGTH] = 0;
      if (typeof this.close === "function" && !this[CLOSED])
        this.close();
      if (er)
        this.emit("error", er);
      else
        this.emit(DESTROYED);
      return this;
    }
    static isStream(s) {
      return !!s && (s instanceof Minipass || s instanceof Stream || s instanceof EE && (typeof s.pipe === "function" || typeof s.write === "function" && typeof s.end === "function"));
    }
  }
  exports.Minipass = Minipass;
});

// src/bun/node_modules/minizlib/constants.js
var require_constants = __commonJS((exports, module) => {
  var realZlibConstants = import.meta.require("zlib").constants || { ZLIB_VERNUM: 4736 };
  module.exports = Object.freeze(Object.assign(Object.create(null), {
    Z_NO_FLUSH: 0,
    Z_PARTIAL_FLUSH: 1,
    Z_SYNC_FLUSH: 2,
    Z_FULL_FLUSH: 3,
    Z_FINISH: 4,
    Z_BLOCK: 5,
    Z_OK: 0,
    Z_STREAM_END: 1,
    Z_NEED_DICT: 2,
    Z_ERRNO: -1,
    Z_STREAM_ERROR: -2,
    Z_DATA_ERROR: -3,
    Z_MEM_ERROR: -4,
    Z_BUF_ERROR: -5,
    Z_VERSION_ERROR: -6,
    Z_NO_COMPRESSION: 0,
    Z_BEST_SPEED: 1,
    Z_BEST_COMPRESSION: 9,
    Z_DEFAULT_COMPRESSION: -1,
    Z_FILTERED: 1,
    Z_HUFFMAN_ONLY: 2,
    Z_RLE: 3,
    Z_FIXED: 4,
    Z_DEFAULT_STRATEGY: 0,
    DEFLATE: 1,
    INFLATE: 2,
    GZIP: 3,
    GUNZIP: 4,
    DEFLATERAW: 5,
    INFLATERAW: 6,
    UNZIP: 7,
    BROTLI_DECODE: 8,
    BROTLI_ENCODE: 9,
    Z_MIN_WINDOWBITS: 8,
    Z_MAX_WINDOWBITS: 15,
    Z_DEFAULT_WINDOWBITS: 15,
    Z_MIN_CHUNK: 64,
    Z_MAX_CHUNK: Infinity,
    Z_DEFAULT_CHUNK: 16384,
    Z_MIN_MEMLEVEL: 1,
    Z_MAX_MEMLEVEL: 9,
    Z_DEFAULT_MEMLEVEL: 8,
    Z_MIN_LEVEL: -1,
    Z_MAX_LEVEL: 9,
    Z_DEFAULT_LEVEL: -1,
    BROTLI_OPERATION_PROCESS: 0,
    BROTLI_OPERATION_FLUSH: 1,
    BROTLI_OPERATION_FINISH: 2,
    BROTLI_OPERATION_EMIT_METADATA: 3,
    BROTLI_MODE_GENERIC: 0,
    BROTLI_MODE_TEXT: 1,
    BROTLI_MODE_FONT: 2,
    BROTLI_DEFAULT_MODE: 0,
    BROTLI_MIN_QUALITY: 0,
    BROTLI_MAX_QUALITY: 11,
    BROTLI_DEFAULT_QUALITY: 11,
    BROTLI_MIN_WINDOW_BITS: 10,
    BROTLI_MAX_WINDOW_BITS: 24,
    BROTLI_LARGE_MAX_WINDOW_BITS: 30,
    BROTLI_DEFAULT_WINDOW: 22,
    BROTLI_MIN_INPUT_BLOCK_BITS: 16,
    BROTLI_MAX_INPUT_BLOCK_BITS: 24,
    BROTLI_PARAM_MODE: 0,
    BROTLI_PARAM_QUALITY: 1,
    BROTLI_PARAM_LGWIN: 2,
    BROTLI_PARAM_LGBLOCK: 3,
    BROTLI_PARAM_DISABLE_LITERAL_CONTEXT_MODELING: 4,
    BROTLI_PARAM_SIZE_HINT: 5,
    BROTLI_PARAM_LARGE_WINDOW: 6,
    BROTLI_PARAM_NPOSTFIX: 7,
    BROTLI_PARAM_NDIRECT: 8,
    BROTLI_DECODER_RESULT_ERROR: 0,
    BROTLI_DECODER_RESULT_SUCCESS: 1,
    BROTLI_DECODER_RESULT_NEEDS_MORE_INPUT: 2,
    BROTLI_DECODER_RESULT_NEEDS_MORE_OUTPUT: 3,
    BROTLI_DECODER_PARAM_DISABLE_RING_BUFFER_REALLOCATION: 0,
    BROTLI_DECODER_PARAM_LARGE_WINDOW: 1,
    BROTLI_DECODER_NO_ERROR: 0,
    BROTLI_DECODER_SUCCESS: 1,
    BROTLI_DECODER_NEEDS_MORE_INPUT: 2,
    BROTLI_DECODER_NEEDS_MORE_OUTPUT: 3,
    BROTLI_DECODER_ERROR_FORMAT_EXUBERANT_NIBBLE: -1,
    BROTLI_DECODER_ERROR_FORMAT_RESERVED: -2,
    BROTLI_DECODER_ERROR_FORMAT_EXUBERANT_META_NIBBLE: -3,
    BROTLI_DECODER_ERROR_FORMAT_SIMPLE_HUFFMAN_ALPHABET: -4,
    BROTLI_DECODER_ERROR_FORMAT_SIMPLE_HUFFMAN_SAME: -5,
    BROTLI_DECODER_ERROR_FORMAT_CL_SPACE: -6,
    BROTLI_DECODER_ERROR_FORMAT_HUFFMAN_SPACE: -7,
    BROTLI_DECODER_ERROR_FORMAT_CONTEXT_MAP_REPEAT: -8,
    BROTLI_DECODER_ERROR_FORMAT_BLOCK_LENGTH_1: -9,
    BROTLI_DECODER_ERROR_FORMAT_BLOCK_LENGTH_2: -10,
    BROTLI_DECODER_ERROR_FORMAT_TRANSFORM: -11,
    BROTLI_DECODER_ERROR_FORMAT_DICTIONARY: -12,
    BROTLI_DECODER_ERROR_FORMAT_WINDOW_BITS: -13,
    BROTLI_DECODER_ERROR_FORMAT_PADDING_1: -14,
    BROTLI_DECODER_ERROR_FORMAT_PADDING_2: -15,
    BROTLI_DECODER_ERROR_FORMAT_DISTANCE: -16,
    BROTLI_DECODER_ERROR_DICTIONARY_NOT_SET: -19,
    BROTLI_DECODER_ERROR_INVALID_ARGUMENTS: -20,
    BROTLI_DECODER_ERROR_ALLOC_CONTEXT_MODES: -21,
    BROTLI_DECODER_ERROR_ALLOC_TREE_GROUPS: -22,
    BROTLI_DECODER_ERROR_ALLOC_CONTEXT_MAP: -25,
    BROTLI_DECODER_ERROR_ALLOC_RING_BUFFER_1: -26,
    BROTLI_DECODER_ERROR_ALLOC_RING_BUFFER_2: -27,
    BROTLI_DECODER_ERROR_ALLOC_BLOCK_TYPE_TREES: -30,
    BROTLI_DECODER_ERROR_UNREACHABLE: -31
  }, realZlibConstants));
});

// src/bun/node_modules/minizlib/node_modules/minipass/index.js
var require_minipass2 = __commonJS((exports, module) => {
  var proc = typeof process === "object" && process ? process : {
    stdout: null,
    stderr: null
  };
  var EE = import.meta.require("events");
  var Stream = import.meta.require("stream");
  var SD = import.meta.require("string_decoder").StringDecoder;
  var EOF = Symbol("EOF");
  var MAYBE_EMIT_END = Symbol("maybeEmitEnd");
  var EMITTED_END = Symbol("emittedEnd");
  var EMITTING_END = Symbol("emittingEnd");
  var EMITTED_ERROR = Symbol("emittedError");
  var CLOSED = Symbol("closed");
  var READ = Symbol("read");
  var FLUSH = Symbol("flush");
  var FLUSHCHUNK = Symbol("flushChunk");
  var ENCODING = Symbol("encoding");
  var DECODER = Symbol("decoder");
  var FLOWING = Symbol("flowing");
  var PAUSED = Symbol("paused");
  var RESUME = Symbol("resume");
  var BUFFERLENGTH = Symbol("bufferLength");
  var BUFFERPUSH = Symbol("bufferPush");
  var BUFFERSHIFT = Symbol("bufferShift");
  var OBJECTMODE = Symbol("objectMode");
  var DESTROYED = Symbol("destroyed");
  var EMITDATA = Symbol("emitData");
  var EMITEND = Symbol("emitEnd");
  var EMITEND2 = Symbol("emitEnd2");
  var ASYNC = Symbol("async");
  var defer = (fn) => Promise.resolve().then(fn);
  var doIter = global._MP_NO_ITERATOR_SYMBOLS_ !== "1";
  var ASYNCITERATOR = doIter && Symbol.asyncIterator || Symbol("asyncIterator not implemented");
  var ITERATOR = doIter && Symbol.iterator || Symbol("iterator not implemented");
  var isEndish = (ev) => ev === "end" || ev === "finish" || ev === "prefinish";
  var isArrayBuffer = (b) => b instanceof ArrayBuffer || typeof b === "object" && b.constructor && b.constructor.name === "ArrayBuffer" && b.byteLength >= 0;
  var isArrayBufferView = (b) => !Buffer.isBuffer(b) && ArrayBuffer.isView(b);

  class Pipe {
    constructor(src, dest, opts) {
      this.src = src;
      this.dest = dest;
      this.opts = opts;
      this.ondrain = () => src[RESUME]();
      dest.on("drain", this.ondrain);
    }
    unpipe() {
      this.dest.removeListener("drain", this.ondrain);
    }
    proxyErrors() {
    }
    end() {
      this.unpipe();
      if (this.opts.end)
        this.dest.end();
    }
  }

  class PipeProxyErrors extends Pipe {
    unpipe() {
      this.src.removeListener("error", this.proxyErrors);
      super.unpipe();
    }
    constructor(src, dest, opts) {
      super(src, dest, opts);
      this.proxyErrors = (er) => dest.emit("error", er);
      src.on("error", this.proxyErrors);
    }
  }
  module.exports = class Minipass extends Stream {
    constructor(options) {
      super();
      this[FLOWING] = false;
      this[PAUSED] = false;
      this.pipes = [];
      this.buffer = [];
      this[OBJECTMODE] = options && options.objectMode || false;
      if (this[OBJECTMODE])
        this[ENCODING] = null;
      else
        this[ENCODING] = options && options.encoding || null;
      if (this[ENCODING] === "buffer")
        this[ENCODING] = null;
      this[ASYNC] = options && !!options.async || false;
      this[DECODER] = this[ENCODING] ? new SD(this[ENCODING]) : null;
      this[EOF] = false;
      this[EMITTED_END] = false;
      this[EMITTING_END] = false;
      this[CLOSED] = false;
      this[EMITTED_ERROR] = null;
      this.writable = true;
      this.readable = true;
      this[BUFFERLENGTH] = 0;
      this[DESTROYED] = false;
    }
    get bufferLength() {
      return this[BUFFERLENGTH];
    }
    get encoding() {
      return this[ENCODING];
    }
    set encoding(enc) {
      if (this[OBJECTMODE])
        throw new Error("cannot set encoding in objectMode");
      if (this[ENCODING] && enc !== this[ENCODING] && (this[DECODER] && this[DECODER].lastNeed || this[BUFFERLENGTH]))
        throw new Error("cannot change encoding");
      if (this[ENCODING] !== enc) {
        this[DECODER] = enc ? new SD(enc) : null;
        if (this.buffer.length)
          this.buffer = this.buffer.map((chunk) => this[DECODER].write(chunk));
      }
      this[ENCODING] = enc;
    }
    setEncoding(enc) {
      this.encoding = enc;
    }
    get objectMode() {
      return this[OBJECTMODE];
    }
    set objectMode(om) {
      this[OBJECTMODE] = this[OBJECTMODE] || !!om;
    }
    get ["async"]() {
      return this[ASYNC];
    }
    set ["async"](a) {
      this[ASYNC] = this[ASYNC] || !!a;
    }
    write(chunk, encoding, cb) {
      if (this[EOF])
        throw new Error("write after end");
      if (this[DESTROYED]) {
        this.emit("error", Object.assign(new Error("Cannot call write after a stream was destroyed"), { code: "ERR_STREAM_DESTROYED" }));
        return true;
      }
      if (typeof encoding === "function")
        cb = encoding, encoding = "utf8";
      if (!encoding)
        encoding = "utf8";
      const fn = this[ASYNC] ? defer : (f) => f();
      if (!this[OBJECTMODE] && !Buffer.isBuffer(chunk)) {
        if (isArrayBufferView(chunk))
          chunk = Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
        else if (isArrayBuffer(chunk))
          chunk = Buffer.from(chunk);
        else if (typeof chunk !== "string")
          this.objectMode = true;
      }
      if (this[OBJECTMODE]) {
        if (this.flowing && this[BUFFERLENGTH] !== 0)
          this[FLUSH](true);
        if (this.flowing)
          this.emit("data", chunk);
        else
          this[BUFFERPUSH](chunk);
        if (this[BUFFERLENGTH] !== 0)
          this.emit("readable");
        if (cb)
          fn(cb);
        return this.flowing;
      }
      if (!chunk.length) {
        if (this[BUFFERLENGTH] !== 0)
          this.emit("readable");
        if (cb)
          fn(cb);
        return this.flowing;
      }
      if (typeof chunk === "string" && !(encoding === this[ENCODING] && !this[DECODER].lastNeed)) {
        chunk = Buffer.from(chunk, encoding);
      }
      if (Buffer.isBuffer(chunk) && this[ENCODING])
        chunk = this[DECODER].write(chunk);
      if (this.flowing && this[BUFFERLENGTH] !== 0)
        this[FLUSH](true);
      if (this.flowing)
        this.emit("data", chunk);
      else
        this[BUFFERPUSH](chunk);
      if (this[BUFFERLENGTH] !== 0)
        this.emit("readable");
      if (cb)
        fn(cb);
      return this.flowing;
    }
    read(n) {
      if (this[DESTROYED])
        return null;
      if (this[BUFFERLENGTH] === 0 || n === 0 || n > this[BUFFERLENGTH]) {
        this[MAYBE_EMIT_END]();
        return null;
      }
      if (this[OBJECTMODE])
        n = null;
      if (this.buffer.length > 1 && !this[OBJECTMODE]) {
        if (this.encoding)
          this.buffer = [this.buffer.join("")];
        else
          this.buffer = [Buffer.concat(this.buffer, this[BUFFERLENGTH])];
      }
      const ret = this[READ](n || null, this.buffer[0]);
      this[MAYBE_EMIT_END]();
      return ret;
    }
    [READ](n, chunk) {
      if (n === chunk.length || n === null)
        this[BUFFERSHIFT]();
      else {
        this.buffer[0] = chunk.slice(n);
        chunk = chunk.slice(0, n);
        this[BUFFERLENGTH] -= n;
      }
      this.emit("data", chunk);
      if (!this.buffer.length && !this[EOF])
        this.emit("drain");
      return chunk;
    }
    end(chunk, encoding, cb) {
      if (typeof chunk === "function")
        cb = chunk, chunk = null;
      if (typeof encoding === "function")
        cb = encoding, encoding = "utf8";
      if (chunk)
        this.write(chunk, encoding);
      if (cb)
        this.once("end", cb);
      this[EOF] = true;
      this.writable = false;
      if (this.flowing || !this[PAUSED])
        this[MAYBE_EMIT_END]();
      return this;
    }
    [RESUME]() {
      if (this[DESTROYED])
        return;
      this[PAUSED] = false;
      this[FLOWING] = true;
      this.emit("resume");
      if (this.buffer.length)
        this[FLUSH]();
      else if (this[EOF])
        this[MAYBE_EMIT_END]();
      else
        this.emit("drain");
    }
    resume() {
      return this[RESUME]();
    }
    pause() {
      this[FLOWING] = false;
      this[PAUSED] = true;
    }
    get destroyed() {
      return this[DESTROYED];
    }
    get flowing() {
      return this[FLOWING];
    }
    get paused() {
      return this[PAUSED];
    }
    [BUFFERPUSH](chunk) {
      if (this[OBJECTMODE])
        this[BUFFERLENGTH] += 1;
      else
        this[BUFFERLENGTH] += chunk.length;
      this.buffer.push(chunk);
    }
    [BUFFERSHIFT]() {
      if (this.buffer.length) {
        if (this[OBJECTMODE])
          this[BUFFERLENGTH] -= 1;
        else
          this[BUFFERLENGTH] -= this.buffer[0].length;
      }
      return this.buffer.shift();
    }
    [FLUSH](noDrain) {
      do {
      } while (this[FLUSHCHUNK](this[BUFFERSHIFT]()));
      if (!noDrain && !this.buffer.length && !this[EOF])
        this.emit("drain");
    }
    [FLUSHCHUNK](chunk) {
      return chunk ? (this.emit("data", chunk), this.flowing) : false;
    }
    pipe(dest, opts) {
      if (this[DESTROYED])
        return;
      const ended = this[EMITTED_END];
      opts = opts || {};
      if (dest === proc.stdout || dest === proc.stderr)
        opts.end = false;
      else
        opts.end = opts.end !== false;
      opts.proxyErrors = !!opts.proxyErrors;
      if (ended) {
        if (opts.end)
          dest.end();
      } else {
        this.pipes.push(!opts.proxyErrors ? new Pipe(this, dest, opts) : new PipeProxyErrors(this, dest, opts));
        if (this[ASYNC])
          defer(() => this[RESUME]());
        else
          this[RESUME]();
      }
      return dest;
    }
    unpipe(dest) {
      const p = this.pipes.find((p2) => p2.dest === dest);
      if (p) {
        this.pipes.splice(this.pipes.indexOf(p), 1);
        p.unpipe();
      }
    }
    addListener(ev, fn) {
      return this.on(ev, fn);
    }
    on(ev, fn) {
      const ret = super.on(ev, fn);
      if (ev === "data" && !this.pipes.length && !this.flowing)
        this[RESUME]();
      else if (ev === "readable" && this[BUFFERLENGTH] !== 0)
        super.emit("readable");
      else if (isEndish(ev) && this[EMITTED_END]) {
        super.emit(ev);
        this.removeAllListeners(ev);
      } else if (ev === "error" && this[EMITTED_ERROR]) {
        if (this[ASYNC])
          defer(() => fn.call(this, this[EMITTED_ERROR]));
        else
          fn.call(this, this[EMITTED_ERROR]);
      }
      return ret;
    }
    get emittedEnd() {
      return this[EMITTED_END];
    }
    [MAYBE_EMIT_END]() {
      if (!this[EMITTING_END] && !this[EMITTED_END] && !this[DESTROYED] && this.buffer.length === 0 && this[EOF]) {
        this[EMITTING_END] = true;
        this.emit("end");
        this.emit("prefinish");
        this.emit("finish");
        if (this[CLOSED])
          this.emit("close");
        this[EMITTING_END] = false;
      }
    }
    emit(ev, data, ...extra) {
      if (ev !== "error" && ev !== "close" && ev !== DESTROYED && this[DESTROYED])
        return;
      else if (ev === "data") {
        return !data ? false : this[ASYNC] ? defer(() => this[EMITDATA](data)) : this[EMITDATA](data);
      } else if (ev === "end") {
        return this[EMITEND]();
      } else if (ev === "close") {
        this[CLOSED] = true;
        if (!this[EMITTED_END] && !this[DESTROYED])
          return;
        const ret2 = super.emit("close");
        this.removeAllListeners("close");
        return ret2;
      } else if (ev === "error") {
        this[EMITTED_ERROR] = data;
        const ret2 = super.emit("error", data);
        this[MAYBE_EMIT_END]();
        return ret2;
      } else if (ev === "resume") {
        const ret2 = super.emit("resume");
        this[MAYBE_EMIT_END]();
        return ret2;
      } else if (ev === "finish" || ev === "prefinish") {
        const ret2 = super.emit(ev);
        this.removeAllListeners(ev);
        return ret2;
      }
      const ret = super.emit(ev, data, ...extra);
      this[MAYBE_EMIT_END]();
      return ret;
    }
    [EMITDATA](data) {
      for (const p of this.pipes) {
        if (p.dest.write(data) === false)
          this.pause();
      }
      const ret = super.emit("data", data);
      this[MAYBE_EMIT_END]();
      return ret;
    }
    [EMITEND]() {
      if (this[EMITTED_END])
        return;
      this[EMITTED_END] = true;
      this.readable = false;
      if (this[ASYNC])
        defer(() => this[EMITEND2]());
      else
        this[EMITEND2]();
    }
    [EMITEND2]() {
      if (this[DECODER]) {
        const data = this[DECODER].end();
        if (data) {
          for (const p of this.pipes) {
            p.dest.write(data);
          }
          super.emit("data", data);
        }
      }
      for (const p of this.pipes) {
        p.end();
      }
      const ret = super.emit("end");
      this.removeAllListeners("end");
      return ret;
    }
    collect() {
      const buf = [];
      if (!this[OBJECTMODE])
        buf.dataLength = 0;
      const p = this.promise();
      this.on("data", (c) => {
        buf.push(c);
        if (!this[OBJECTMODE])
          buf.dataLength += c.length;
      });
      return p.then(() => buf);
    }
    concat() {
      return this[OBJECTMODE] ? Promise.reject(new Error("cannot concat in objectMode")) : this.collect().then((buf) => this[OBJECTMODE] ? Promise.reject(new Error("cannot concat in objectMode")) : this[ENCODING] ? buf.join("") : Buffer.concat(buf, buf.dataLength));
    }
    promise() {
      return new Promise((resolve, reject) => {
        this.on(DESTROYED, () => reject(new Error("stream destroyed")));
        this.on("error", (er) => reject(er));
        this.on("end", () => resolve());
      });
    }
    [ASYNCITERATOR]() {
      const next = () => {
        const res = this.read();
        if (res !== null)
          return Promise.resolve({ done: false, value: res });
        if (this[EOF])
          return Promise.resolve({ done: true });
        let resolve = null;
        let reject = null;
        const onerr = (er) => {
          this.removeListener("data", ondata);
          this.removeListener("end", onend);
          reject(er);
        };
        const ondata = (value) => {
          this.removeListener("error", onerr);
          this.removeListener("end", onend);
          this.pause();
          resolve({ value, done: !!this[EOF] });
        };
        const onend = () => {
          this.removeListener("error", onerr);
          this.removeListener("data", ondata);
          resolve({ done: true });
        };
        const ondestroy = () => onerr(new Error("stream destroyed"));
        return new Promise((res2, rej) => {
          reject = rej;
          resolve = res2;
          this.once(DESTROYED, ondestroy);
          this.once("error", onerr);
          this.once("end", onend);
          this.once("data", ondata);
        });
      };
      return { next };
    }
    [ITERATOR]() {
      const next = () => {
        const value = this.read();
        const done = value === null;
        return { value, done };
      };
      return { next };
    }
    destroy(er) {
      if (this[DESTROYED]) {
        if (er)
          this.emit("error", er);
        else
          this.emit(DESTROYED);
        return this;
      }
      this[DESTROYED] = true;
      this.buffer.length = 0;
      this[BUFFERLENGTH] = 0;
      if (typeof this.close === "function" && !this[CLOSED])
        this.close();
      if (er)
        this.emit("error", er);
      else
        this.emit(DESTROYED);
      return this;
    }
    static isStream(s) {
      return !!s && (s instanceof Minipass || s instanceof Stream || s instanceof EE && (typeof s.pipe === "function" || typeof s.write === "function" && typeof s.end === "function"));
    }
  };
});

// src/bun/node_modules/minizlib/index.js
var require_minizlib = __commonJS((exports) => {
  var assert = import.meta.require("assert");
  var Buffer2 = import.meta.require("buffer").Buffer;
  var realZlib = import.meta.require("zlib");
  var constants = exports.constants = require_constants();
  var Minipass = require_minipass2();
  var OriginalBufferConcat = Buffer2.concat;
  var _superWrite = Symbol("_superWrite");

  class ZlibError extends Error {
    constructor(err) {
      super("zlib: " + err.message);
      this.code = err.code;
      this.errno = err.errno;
      if (!this.code)
        this.code = "ZLIB_ERROR";
      this.message = "zlib: " + err.message;
      Error.captureStackTrace(this, this.constructor);
    }
    get name() {
      return "ZlibError";
    }
  }
  var _opts = Symbol("opts");
  var _flushFlag = Symbol("flushFlag");
  var _finishFlushFlag = Symbol("finishFlushFlag");
  var _fullFlushFlag = Symbol("fullFlushFlag");
  var _handle = Symbol("handle");
  var _onError = Symbol("onError");
  var _sawError = Symbol("sawError");
  var _level = Symbol("level");
  var _strategy = Symbol("strategy");
  var _ended = Symbol("ended");
  var _defaultFullFlush = Symbol("_defaultFullFlush");

  class ZlibBase extends Minipass {
    constructor(opts, mode) {
      if (!opts || typeof opts !== "object")
        throw new TypeError("invalid options for ZlibBase constructor");
      super(opts);
      this[_sawError] = false;
      this[_ended] = false;
      this[_opts] = opts;
      this[_flushFlag] = opts.flush;
      this[_finishFlushFlag] = opts.finishFlush;
      try {
        this[_handle] = new realZlib[mode](opts);
      } catch (er) {
        throw new ZlibError(er);
      }
      this[_onError] = (err) => {
        if (this[_sawError])
          return;
        this[_sawError] = true;
        this.close();
        this.emit("error", err);
      };
      this[_handle].on("error", (er) => this[_onError](new ZlibError(er)));
      this.once("end", () => this.close);
    }
    close() {
      if (this[_handle]) {
        this[_handle].close();
        this[_handle] = null;
        this.emit("close");
      }
    }
    reset() {
      if (!this[_sawError]) {
        assert(this[_handle], "zlib binding closed");
        return this[_handle].reset();
      }
    }
    flush(flushFlag) {
      if (this.ended)
        return;
      if (typeof flushFlag !== "number")
        flushFlag = this[_fullFlushFlag];
      this.write(Object.assign(Buffer2.alloc(0), { [_flushFlag]: flushFlag }));
    }
    end(chunk, encoding, cb) {
      if (chunk)
        this.write(chunk, encoding);
      this.flush(this[_finishFlushFlag]);
      this[_ended] = true;
      return super.end(null, null, cb);
    }
    get ended() {
      return this[_ended];
    }
    write(chunk, encoding, cb) {
      if (typeof encoding === "function")
        cb = encoding, encoding = "utf8";
      if (typeof chunk === "string")
        chunk = Buffer2.from(chunk, encoding);
      if (this[_sawError])
        return;
      assert(this[_handle], "zlib binding closed");
      const nativeHandle = this[_handle]._handle;
      const originalNativeClose = nativeHandle.close;
      nativeHandle.close = () => {
      };
      const originalClose = this[_handle].close;
      this[_handle].close = () => {
      };
      Buffer2.concat = (args) => args;
      let result;
      try {
        const flushFlag = typeof chunk[_flushFlag] === "number" ? chunk[_flushFlag] : this[_flushFlag];
        result = this[_handle]._processChunk(chunk, flushFlag);
        Buffer2.concat = OriginalBufferConcat;
      } catch (err) {
        Buffer2.concat = OriginalBufferConcat;
        this[_onError](new ZlibError(err));
      } finally {
        if (this[_handle]) {
          this[_handle]._handle = nativeHandle;
          nativeHandle.close = originalNativeClose;
          this[_handle].close = originalClose;
          this[_handle].removeAllListeners("error");
        }
      }
      if (this[_handle])
        this[_handle].on("error", (er) => this[_onError](new ZlibError(er)));
      let writeReturn;
      if (result) {
        if (Array.isArray(result) && result.length > 0) {
          writeReturn = this[_superWrite](Buffer2.from(result[0]));
          for (let i = 1;i < result.length; i++) {
            writeReturn = this[_superWrite](result[i]);
          }
        } else {
          writeReturn = this[_superWrite](Buffer2.from(result));
        }
      }
      if (cb)
        cb();
      return writeReturn;
    }
    [_superWrite](data) {
      return super.write(data);
    }
  }

  class Zlib extends ZlibBase {
    constructor(opts, mode) {
      opts = opts || {};
      opts.flush = opts.flush || constants.Z_NO_FLUSH;
      opts.finishFlush = opts.finishFlush || constants.Z_FINISH;
      super(opts, mode);
      this[_fullFlushFlag] = constants.Z_FULL_FLUSH;
      this[_level] = opts.level;
      this[_strategy] = opts.strategy;
    }
    params(level, strategy) {
      if (this[_sawError])
        return;
      if (!this[_handle])
        throw new Error("cannot switch params when binding is closed");
      if (!this[_handle].params)
        throw new Error("not supported in this implementation");
      if (this[_level] !== level || this[_strategy] !== strategy) {
        this.flush(constants.Z_SYNC_FLUSH);
        assert(this[_handle], "zlib binding closed");
        const origFlush = this[_handle].flush;
        this[_handle].flush = (flushFlag, cb) => {
          this.flush(flushFlag);
          cb();
        };
        try {
          this[_handle].params(level, strategy);
        } finally {
          this[_handle].flush = origFlush;
        }
        if (this[_handle]) {
          this[_level] = level;
          this[_strategy] = strategy;
        }
      }
    }
  }

  class Deflate extends Zlib {
    constructor(opts) {
      super(opts, "Deflate");
    }
  }

  class Inflate extends Zlib {
    constructor(opts) {
      super(opts, "Inflate");
    }
  }
  var _portable = Symbol("_portable");

  class Gzip extends Zlib {
    constructor(opts) {
      super(opts, "Gzip");
      this[_portable] = opts && !!opts.portable;
    }
    [_superWrite](data) {
      if (!this[_portable])
        return super[_superWrite](data);
      this[_portable] = false;
      data[9] = 255;
      return super[_superWrite](data);
    }
  }

  class Gunzip extends Zlib {
    constructor(opts) {
      super(opts, "Gunzip");
    }
  }

  class DeflateRaw extends Zlib {
    constructor(opts) {
      super(opts, "DeflateRaw");
    }
  }

  class InflateRaw extends Zlib {
    constructor(opts) {
      super(opts, "InflateRaw");
    }
  }

  class Unzip extends Zlib {
    constructor(opts) {
      super(opts, "Unzip");
    }
  }

  class Brotli extends ZlibBase {
    constructor(opts, mode) {
      opts = opts || {};
      opts.flush = opts.flush || constants.BROTLI_OPERATION_PROCESS;
      opts.finishFlush = opts.finishFlush || constants.BROTLI_OPERATION_FINISH;
      super(opts, mode);
      this[_fullFlushFlag] = constants.BROTLI_OPERATION_FLUSH;
    }
  }

  class BrotliCompress extends Brotli {
    constructor(opts) {
      super(opts, "BrotliCompress");
    }
  }

  class BrotliDecompress extends Brotli {
    constructor(opts) {
      super(opts, "BrotliDecompress");
    }
  }
  exports.Deflate = Deflate;
  exports.Inflate = Inflate;
  exports.Gzip = Gzip;
  exports.Gunzip = Gunzip;
  exports.DeflateRaw = DeflateRaw;
  exports.InflateRaw = InflateRaw;
  exports.Unzip = Unzip;
  if (typeof realZlib.BrotliCompress === "function") {
    exports.BrotliCompress = BrotliCompress;
    exports.BrotliDecompress = BrotliDecompress;
  } else {
    exports.BrotliCompress = exports.BrotliDecompress = class {
      constructor() {
        throw new Error("Brotli is not supported in this version of Node.js");
      }
    };
  }
});

// src/bun/node_modules/tar/lib/normalize-windows-path.js
var require_normalize_windows_path = __commonJS((exports, module) => {
  var platform = process.env.TESTING_TAR_FAKE_PLATFORM || process.platform;
  module.exports = platform !== "win32" ? (p) => p : (p) => p && p.replace(/\\/g, "/");
});

// src/bun/node_modules/tar/lib/read-entry.js
var require_read_entry = __commonJS((exports, module) => {
  var { Minipass } = require_minipass();
  var normPath = require_normalize_windows_path();
  var SLURP = Symbol("slurp");
  module.exports = class ReadEntry extends Minipass {
    constructor(header, ex, gex) {
      super();
      this.pause();
      this.extended = ex;
      this.globalExtended = gex;
      this.header = header;
      this.startBlockSize = 512 * Math.ceil(header.size / 512);
      this.blockRemain = this.startBlockSize;
      this.remain = header.size;
      this.type = header.type;
      this.meta = false;
      this.ignore = false;
      switch (this.type) {
        case "File":
        case "OldFile":
        case "Link":
        case "SymbolicLink":
        case "CharacterDevice":
        case "BlockDevice":
        case "Directory":
        case "FIFO":
        case "ContiguousFile":
        case "GNUDumpDir":
          break;
        case "NextFileHasLongLinkpath":
        case "NextFileHasLongPath":
        case "OldGnuLongPath":
        case "GlobalExtendedHeader":
        case "ExtendedHeader":
        case "OldExtendedHeader":
          this.meta = true;
          break;
        default:
          this.ignore = true;
      }
      this.path = normPath(header.path);
      this.mode = header.mode;
      if (this.mode) {
        this.mode = this.mode & 4095;
      }
      this.uid = header.uid;
      this.gid = header.gid;
      this.uname = header.uname;
      this.gname = header.gname;
      this.size = header.size;
      this.mtime = header.mtime;
      this.atime = header.atime;
      this.ctime = header.ctime;
      this.linkpath = normPath(header.linkpath);
      this.uname = header.uname;
      this.gname = header.gname;
      if (ex) {
        this[SLURP](ex);
      }
      if (gex) {
        this[SLURP](gex, true);
      }
    }
    write(data) {
      const writeLen = data.length;
      if (writeLen > this.blockRemain) {
        throw new Error("writing more to entry than is appropriate");
      }
      const r = this.remain;
      const br = this.blockRemain;
      this.remain = Math.max(0, r - writeLen);
      this.blockRemain = Math.max(0, br - writeLen);
      if (this.ignore) {
        return true;
      }
      if (r >= writeLen) {
        return super.write(data);
      }
      return super.write(data.slice(0, r));
    }
    [SLURP](ex, global2) {
      for (const k in ex) {
        if (ex[k] !== null && ex[k] !== undefined && !(global2 && k === "path")) {
          this[k] = k === "path" || k === "linkpath" ? normPath(ex[k]) : ex[k];
        }
      }
    }
  };
});

// src/bun/node_modules/tar/lib/types.js
var require_types = __commonJS((exports) => {
  exports.name = new Map([
    ["0", "File"],
    ["", "OldFile"],
    ["1", "Link"],
    ["2", "SymbolicLink"],
    ["3", "CharacterDevice"],
    ["4", "BlockDevice"],
    ["5", "Directory"],
    ["6", "FIFO"],
    ["7", "ContiguousFile"],
    ["g", "GlobalExtendedHeader"],
    ["x", "ExtendedHeader"],
    ["A", "SolarisACL"],
    ["D", "GNUDumpDir"],
    ["I", "Inode"],
    ["K", "NextFileHasLongLinkpath"],
    ["L", "NextFileHasLongPath"],
    ["M", "ContinuationFile"],
    ["N", "OldGnuLongPath"],
    ["S", "SparseFile"],
    ["V", "TapeVolumeHeader"],
    ["X", "OldExtendedHeader"]
  ]);
  exports.code = new Map(Array.from(exports.name).map((kv) => [kv[1], kv[0]]));
});

// src/bun/node_modules/tar/lib/large-numbers.js
var require_large_numbers = __commonJS((exports, module) => {
  var encode = (num, buf) => {
    if (!Number.isSafeInteger(num)) {
      throw Error("cannot encode number outside of javascript safe integer range");
    } else if (num < 0) {
      encodeNegative(num, buf);
    } else {
      encodePositive(num, buf);
    }
    return buf;
  };
  var encodePositive = (num, buf) => {
    buf[0] = 128;
    for (var i = buf.length;i > 1; i--) {
      buf[i - 1] = num & 255;
      num = Math.floor(num / 256);
    }
  };
  var encodeNegative = (num, buf) => {
    buf[0] = 255;
    var flipped = false;
    num = num * -1;
    for (var i = buf.length;i > 1; i--) {
      var byte = num & 255;
      num = Math.floor(num / 256);
      if (flipped) {
        buf[i - 1] = onesComp(byte);
      } else if (byte === 0) {
        buf[i - 1] = 0;
      } else {
        flipped = true;
        buf[i - 1] = twosComp(byte);
      }
    }
  };
  var parse = (buf) => {
    const pre = buf[0];
    const value = pre === 128 ? pos(buf.slice(1, buf.length)) : pre === 255 ? twos(buf) : null;
    if (value === null) {
      throw Error("invalid base256 encoding");
    }
    if (!Number.isSafeInteger(value)) {
      throw Error("parsed number outside of javascript safe integer range");
    }
    return value;
  };
  var twos = (buf) => {
    var len = buf.length;
    var sum = 0;
    var flipped = false;
    for (var i = len - 1;i > -1; i--) {
      var byte = buf[i];
      var f;
      if (flipped) {
        f = onesComp(byte);
      } else if (byte === 0) {
        f = byte;
      } else {
        flipped = true;
        f = twosComp(byte);
      }
      if (f !== 0) {
        sum -= f * Math.pow(256, len - i - 1);
      }
    }
    return sum;
  };
  var pos = (buf) => {
    var len = buf.length;
    var sum = 0;
    for (var i = len - 1;i > -1; i--) {
      var byte = buf[i];
      if (byte !== 0) {
        sum += byte * Math.pow(256, len - i - 1);
      }
    }
    return sum;
  };
  var onesComp = (byte) => (255 ^ byte) & 255;
  var twosComp = (byte) => (255 ^ byte) + 1 & 255;
  module.exports = {
    encode,
    parse
  };
});

// src/bun/node_modules/tar/lib/header.js
var require_header = __commonJS((exports, module) => {
  var types2 = require_types();
  var pathModule = import.meta.require("path").posix;
  var large = require_large_numbers();
  var SLURP = Symbol("slurp");
  var TYPE = Symbol("type");

  class Header {
    constructor(data, off, ex, gex) {
      this.cksumValid = false;
      this.needPax = false;
      this.nullBlock = false;
      this.block = null;
      this.path = null;
      this.mode = null;
      this.uid = null;
      this.gid = null;
      this.size = null;
      this.mtime = null;
      this.cksum = null;
      this[TYPE] = "0";
      this.linkpath = null;
      this.uname = null;
      this.gname = null;
      this.devmaj = 0;
      this.devmin = 0;
      this.atime = null;
      this.ctime = null;
      if (Buffer.isBuffer(data)) {
        this.decode(data, off || 0, ex, gex);
      } else if (data) {
        this.set(data);
      }
    }
    decode(buf, off, ex, gex) {
      if (!off) {
        off = 0;
      }
      if (!buf || !(buf.length >= off + 512)) {
        throw new Error("need 512 bytes for header");
      }
      this.path = decString(buf, off, 100);
      this.mode = decNumber(buf, off + 100, 8);
      this.uid = decNumber(buf, off + 108, 8);
      this.gid = decNumber(buf, off + 116, 8);
      this.size = decNumber(buf, off + 124, 12);
      this.mtime = decDate(buf, off + 136, 12);
      this.cksum = decNumber(buf, off + 148, 12);
      this[SLURP](ex);
      this[SLURP](gex, true);
      this[TYPE] = decString(buf, off + 156, 1);
      if (this[TYPE] === "") {
        this[TYPE] = "0";
      }
      if (this[TYPE] === "0" && this.path.slice(-1) === "/") {
        this[TYPE] = "5";
      }
      if (this[TYPE] === "5") {
        this.size = 0;
      }
      this.linkpath = decString(buf, off + 157, 100);
      if (buf.slice(off + 257, off + 265).toString() === "ustar\x0000") {
        this.uname = decString(buf, off + 265, 32);
        this.gname = decString(buf, off + 297, 32);
        this.devmaj = decNumber(buf, off + 329, 8);
        this.devmin = decNumber(buf, off + 337, 8);
        if (buf[off + 475] !== 0) {
          const prefix = decString(buf, off + 345, 155);
          this.path = prefix + "/" + this.path;
        } else {
          const prefix = decString(buf, off + 345, 130);
          if (prefix) {
            this.path = prefix + "/" + this.path;
          }
          this.atime = decDate(buf, off + 476, 12);
          this.ctime = decDate(buf, off + 488, 12);
        }
      }
      let sum = 8 * 32;
      for (let i = off;i < off + 148; i++) {
        sum += buf[i];
      }
      for (let i = off + 156;i < off + 512; i++) {
        sum += buf[i];
      }
      this.cksumValid = sum === this.cksum;
      if (this.cksum === null && sum === 8 * 32) {
        this.nullBlock = true;
      }
    }
    [SLURP](ex, global2) {
      for (const k in ex) {
        if (ex[k] !== null && ex[k] !== undefined && !(global2 && k === "path")) {
          this[k] = ex[k];
        }
      }
    }
    encode(buf, off) {
      if (!buf) {
        buf = this.block = Buffer.alloc(512);
        off = 0;
      }
      if (!off) {
        off = 0;
      }
      if (!(buf.length >= off + 512)) {
        throw new Error("need 512 bytes for header");
      }
      const prefixSize = this.ctime || this.atime ? 130 : 155;
      const split = splitPrefix(this.path || "", prefixSize);
      const path = split[0];
      const prefix = split[1];
      this.needPax = split[2];
      this.needPax = encString(buf, off, 100, path) || this.needPax;
      this.needPax = encNumber(buf, off + 100, 8, this.mode) || this.needPax;
      this.needPax = encNumber(buf, off + 108, 8, this.uid) || this.needPax;
      this.needPax = encNumber(buf, off + 116, 8, this.gid) || this.needPax;
      this.needPax = encNumber(buf, off + 124, 12, this.size) || this.needPax;
      this.needPax = encDate(buf, off + 136, 12, this.mtime) || this.needPax;
      buf[off + 156] = this[TYPE].charCodeAt(0);
      this.needPax = encString(buf, off + 157, 100, this.linkpath) || this.needPax;
      buf.write("ustar\x0000", off + 257, 8);
      this.needPax = encString(buf, off + 265, 32, this.uname) || this.needPax;
      this.needPax = encString(buf, off + 297, 32, this.gname) || this.needPax;
      this.needPax = encNumber(buf, off + 329, 8, this.devmaj) || this.needPax;
      this.needPax = encNumber(buf, off + 337, 8, this.devmin) || this.needPax;
      this.needPax = encString(buf, off + 345, prefixSize, prefix) || this.needPax;
      if (buf[off + 475] !== 0) {
        this.needPax = encString(buf, off + 345, 155, prefix) || this.needPax;
      } else {
        this.needPax = encString(buf, off + 345, 130, prefix) || this.needPax;
        this.needPax = encDate(buf, off + 476, 12, this.atime) || this.needPax;
        this.needPax = encDate(buf, off + 488, 12, this.ctime) || this.needPax;
      }
      let sum = 8 * 32;
      for (let i = off;i < off + 148; i++) {
        sum += buf[i];
      }
      for (let i = off + 156;i < off + 512; i++) {
        sum += buf[i];
      }
      this.cksum = sum;
      encNumber(buf, off + 148, 8, this.cksum);
      this.cksumValid = true;
      return this.needPax;
    }
    set(data) {
      for (const i in data) {
        if (data[i] !== null && data[i] !== undefined) {
          this[i] = data[i];
        }
      }
    }
    get type() {
      return types2.name.get(this[TYPE]) || this[TYPE];
    }
    get typeKey() {
      return this[TYPE];
    }
    set type(type) {
      if (types2.code.has(type)) {
        this[TYPE] = types2.code.get(type);
      } else {
        this[TYPE] = type;
      }
    }
  }
  var splitPrefix = (p, prefixSize) => {
    const pathSize = 100;
    let pp = p;
    let prefix = "";
    let ret;
    const root = pathModule.parse(p).root || ".";
    if (Buffer.byteLength(pp) < pathSize) {
      ret = [pp, prefix, false];
    } else {
      prefix = pathModule.dirname(pp);
      pp = pathModule.basename(pp);
      do {
        if (Buffer.byteLength(pp) <= pathSize && Buffer.byteLength(prefix) <= prefixSize) {
          ret = [pp, prefix, false];
        } else if (Buffer.byteLength(pp) > pathSize && Buffer.byteLength(prefix) <= prefixSize) {
          ret = [pp.slice(0, pathSize - 1), prefix, true];
        } else {
          pp = pathModule.join(pathModule.basename(prefix), pp);
          prefix = pathModule.dirname(prefix);
        }
      } while (prefix !== root && !ret);
      if (!ret) {
        ret = [p.slice(0, pathSize - 1), "", true];
      }
    }
    return ret;
  };
  var decString = (buf, off, size) => buf.slice(off, off + size).toString("utf8").replace(/\0.*/, "");
  var decDate = (buf, off, size) => numToDate(decNumber(buf, off, size));
  var numToDate = (num) => num === null ? null : new Date(num * 1000);
  var decNumber = (buf, off, size) => buf[off] & 128 ? large.parse(buf.slice(off, off + size)) : decSmallNumber(buf, off, size);
  var nanNull = (value) => isNaN(value) ? null : value;
  var decSmallNumber = (buf, off, size) => nanNull(parseInt(buf.slice(off, off + size).toString("utf8").replace(/\0.*$/, "").trim(), 8));
  var MAXNUM = {
    12: 8589934591,
    8: 2097151
  };
  var encNumber = (buf, off, size, number) => number === null ? false : number > MAXNUM[size] || number < 0 ? (large.encode(number, buf.slice(off, off + size)), true) : (encSmallNumber(buf, off, size, number), false);
  var encSmallNumber = (buf, off, size, number) => buf.write(octalString(number, size), off, size, "ascii");
  var octalString = (number, size) => padOctal(Math.floor(number).toString(8), size);
  var padOctal = (string, size) => (string.length === size - 1 ? string : new Array(size - string.length - 1).join("0") + string + " ") + "\0";
  var encDate = (buf, off, size, date) => date === null ? false : encNumber(buf, off, size, date.getTime() / 1000);
  var NULLS = new Array(156).join("\0");
  var encString = (buf, off, size, string) => string === null ? false : (buf.write(string + NULLS, off, size, "utf8"), string.length !== Buffer.byteLength(string) || string.length > size);
  module.exports = Header;
});

// src/bun/node_modules/tar/lib/pax.js
var require_pax = __commonJS((exports, module) => {
  var Header = require_header();
  var path = import.meta.require("path");

  class Pax {
    constructor(obj, global2) {
      this.atime = obj.atime || null;
      this.charset = obj.charset || null;
      this.comment = obj.comment || null;
      this.ctime = obj.ctime || null;
      this.gid = obj.gid || null;
      this.gname = obj.gname || null;
      this.linkpath = obj.linkpath || null;
      this.mtime = obj.mtime || null;
      this.path = obj.path || null;
      this.size = obj.size || null;
      this.uid = obj.uid || null;
      this.uname = obj.uname || null;
      this.dev = obj.dev || null;
      this.ino = obj.ino || null;
      this.nlink = obj.nlink || null;
      this.global = global2 || false;
    }
    encode() {
      const body = this.encodeBody();
      if (body === "") {
        return null;
      }
      const bodyLen = Buffer.byteLength(body);
      const bufLen = 512 * Math.ceil(1 + bodyLen / 512);
      const buf = Buffer.allocUnsafe(bufLen);
      for (let i = 0;i < 512; i++) {
        buf[i] = 0;
      }
      new Header({
        path: ("PaxHeader/" + path.basename(this.path)).slice(0, 99),
        mode: this.mode || 420,
        uid: this.uid || null,
        gid: this.gid || null,
        size: bodyLen,
        mtime: this.mtime || null,
        type: this.global ? "GlobalExtendedHeader" : "ExtendedHeader",
        linkpath: "",
        uname: this.uname || "",
        gname: this.gname || "",
        devmaj: 0,
        devmin: 0,
        atime: this.atime || null,
        ctime: this.ctime || null
      }).encode(buf);
      buf.write(body, 512, bodyLen, "utf8");
      for (let i = bodyLen + 512;i < buf.length; i++) {
        buf[i] = 0;
      }
      return buf;
    }
    encodeBody() {
      return this.encodeField("path") + this.encodeField("ctime") + this.encodeField("atime") + this.encodeField("dev") + this.encodeField("ino") + this.encodeField("nlink") + this.encodeField("charset") + this.encodeField("comment") + this.encodeField("gid") + this.encodeField("gname") + this.encodeField("linkpath") + this.encodeField("mtime") + this.encodeField("size") + this.encodeField("uid") + this.encodeField("uname");
    }
    encodeField(field) {
      if (this[field] === null || this[field] === undefined) {
        return "";
      }
      const v = this[field] instanceof Date ? this[field].getTime() / 1000 : this[field];
      const s = " " + (field === "dev" || field === "ino" || field === "nlink" ? "SCHILY." : "") + field + "=" + v + "\n";
      const byteLen = Buffer.byteLength(s);
      let digits = Math.floor(Math.log(byteLen) / Math.log(10)) + 1;
      if (byteLen + digits >= Math.pow(10, digits)) {
        digits += 1;
      }
      const len = digits + byteLen;
      return len + s;
    }
  }
  Pax.parse = (string, ex, g) => new Pax(merge(parseKV(string), ex), g);
  var merge = (a, b) => b ? Object.keys(a).reduce((s, k) => (s[k] = a[k], s), b) : a;
  var parseKV = (string) => string.replace(/\n$/, "").split("\n").reduce(parseKVLine, Object.create(null));
  var parseKVLine = (set, line) => {
    const n = parseInt(line, 10);
    if (n !== Buffer.byteLength(line) + 1) {
      return set;
    }
    line = line.slice((n + " ").length);
    const kv = line.split("=");
    const k = kv.shift().replace(/^SCHILY\.(dev|ino|nlink)/, "$1");
    if (!k) {
      return set;
    }
    const v = kv.join("=");
    set[k] = /^([A-Z]+\.)?([mac]|birth|creation)time$/.test(k) ? new Date(v * 1000) : /^[0-9]+$/.test(v) ? +v : v;
    return set;
  };
  module.exports = Pax;
});

// src/bun/node_modules/tar/lib/strip-trailing-slashes.js
var require_strip_trailing_slashes = __commonJS((exports, module) => {
  module.exports = (str) => {
    let i = str.length - 1;
    let slashesStart = -1;
    while (i > -1 && str.charAt(i) === "/") {
      slashesStart = i;
      i--;
    }
    return slashesStart === -1 ? str : str.slice(0, slashesStart);
  };
});

// src/bun/node_modules/tar/lib/warn-mixin.js
var require_warn_mixin = __commonJS((exports, module) => {
  module.exports = (Base) => class extends Base {
    warn(code, message, data = {}) {
      if (this.file) {
        data.file = this.file;
      }
      if (this.cwd) {
        data.cwd = this.cwd;
      }
      data.code = message instanceof Error && message.code || code;
      data.tarCode = code;
      if (!this.strict && data.recoverable !== false) {
        if (message instanceof Error) {
          data = Object.assign(message, data);
          message = message.message;
        }
        this.emit("warn", data.tarCode, message, data);
      } else if (message instanceof Error) {
        this.emit("error", Object.assign(message, data));
      } else {
        this.emit("error", Object.assign(new Error(`${code}: ${message}`), data));
      }
    }
  };
});

// src/bun/node_modules/tar/lib/winchars.js
var require_winchars = __commonJS((exports, module) => {
  var raw = [
    "|",
    "<",
    ">",
    "?",
    ":"
  ];
  var win = raw.map((char) => String.fromCharCode(61440 + char.charCodeAt(0)));
  var toWin = new Map(raw.map((char, i) => [char, win[i]]));
  var toRaw = new Map(win.map((char, i) => [char, raw[i]]));
  module.exports = {
    encode: (s) => raw.reduce((s2, c) => s2.split(c).join(toWin.get(c)), s),
    decode: (s) => win.reduce((s2, c) => s2.split(c).join(toRaw.get(c)), s)
  };
});

// src/bun/node_modules/tar/lib/strip-absolute-path.js
var require_strip_absolute_path = __commonJS((exports, module) => {
  var { isAbsolute, parse } = import.meta.require("path").win32;
  module.exports = (path) => {
    let r = "";
    let parsed = parse(path);
    while (isAbsolute(path) || parsed.root) {
      const root = path.charAt(0) === "/" && path.slice(0, 4) !== "//?/" ? "/" : parsed.root;
      path = path.slice(root.length);
      r += root;
      parsed = parse(path);
    }
    return [r, path];
  };
});

// src/bun/node_modules/tar/lib/mode-fix.js
var require_mode_fix = __commonJS((exports, module) => {
  module.exports = (mode, isDir, portable) => {
    mode &= 4095;
    if (portable) {
      mode = (mode | 384) & ~18;
    }
    if (isDir) {
      if (mode & 256) {
        mode |= 64;
      }
      if (mode & 32) {
        mode |= 8;
      }
      if (mode & 4) {
        mode |= 1;
      }
    }
    return mode;
  };
});

// src/bun/node_modules/tar/lib/write-entry.js
var require_write_entry = __commonJS((exports, module) => {
  var { Minipass } = require_minipass();
  var Pax = require_pax();
  var Header = require_header();
  var fs = import.meta.require("fs");
  var path = import.meta.require("path");
  var normPath = require_normalize_windows_path();
  var stripSlash = require_strip_trailing_slashes();
  var prefixPath = (path2, prefix) => {
    if (!prefix) {
      return normPath(path2);
    }
    path2 = normPath(path2).replace(/^\.(\/|$)/, "");
    return stripSlash(prefix) + "/" + path2;
  };
  var maxReadSize = 16 * 1024 * 1024;
  var PROCESS = Symbol("process");
  var FILE = Symbol("file");
  var DIRECTORY = Symbol("directory");
  var SYMLINK = Symbol("symlink");
  var HARDLINK = Symbol("hardlink");
  var HEADER = Symbol("header");
  var READ = Symbol("read");
  var LSTAT = Symbol("lstat");
  var ONLSTAT = Symbol("onlstat");
  var ONREAD = Symbol("onread");
  var ONREADLINK = Symbol("onreadlink");
  var OPENFILE = Symbol("openfile");
  var ONOPENFILE = Symbol("onopenfile");
  var CLOSE = Symbol("close");
  var MODE = Symbol("mode");
  var AWAITDRAIN = Symbol("awaitDrain");
  var ONDRAIN = Symbol("ondrain");
  var PREFIX = Symbol("prefix");
  var HAD_ERROR = Symbol("hadError");
  var warner = require_warn_mixin();
  var winchars = require_winchars();
  var stripAbsolutePath = require_strip_absolute_path();
  var modeFix = require_mode_fix();
  var WriteEntry = warner(class WriteEntry2 extends Minipass {
    constructor(p, opt) {
      opt = opt || {};
      super(opt);
      if (typeof p !== "string") {
        throw new TypeError("path is required");
      }
      this.path = normPath(p);
      this.portable = !!opt.portable;
      this.myuid = process.getuid && process.getuid() || 0;
      this.myuser = "yoav";
      this.maxReadSize = opt.maxReadSize || maxReadSize;
      this.linkCache = opt.linkCache || new Map;
      this.statCache = opt.statCache || new Map;
      this.preservePaths = !!opt.preservePaths;
      this.cwd = normPath(opt.cwd || process.cwd());
      this.strict = !!opt.strict;
      this.noPax = !!opt.noPax;
      this.noMtime = !!opt.noMtime;
      this.mtime = opt.mtime || null;
      this.prefix = opt.prefix ? normPath(opt.prefix) : null;
      this.fd = null;
      this.blockLen = null;
      this.blockRemain = null;
      this.buf = null;
      this.offset = null;
      this.length = null;
      this.pos = null;
      this.remain = null;
      if (typeof opt.onwarn === "function") {
        this.on("warn", opt.onwarn);
      }
      let pathWarn = false;
      if (!this.preservePaths) {
        const [root, stripped] = stripAbsolutePath(this.path);
        if (root) {
          this.path = stripped;
          pathWarn = root;
        }
      }
      this.win32 = !!opt.win32 || process.platform === "win32";
      if (this.win32) {
        this.path = winchars.decode(this.path.replace(/\\/g, "/"));
        p = p.replace(/\\/g, "/");
      }
      this.absolute = normPath(opt.absolute || path.resolve(this.cwd, p));
      if (this.path === "") {
        this.path = "./";
      }
      if (pathWarn) {
        this.warn("TAR_ENTRY_INFO", `stripping ${pathWarn} from absolute path`, {
          entry: this,
          path: pathWarn + this.path
        });
      }
      if (this.statCache.has(this.absolute)) {
        this[ONLSTAT](this.statCache.get(this.absolute));
      } else {
        this[LSTAT]();
      }
    }
    emit(ev, ...data) {
      if (ev === "error") {
        this[HAD_ERROR] = true;
      }
      return super.emit(ev, ...data);
    }
    [LSTAT]() {
      fs.lstat(this.absolute, (er, stat) => {
        if (er) {
          return this.emit("error", er);
        }
        this[ONLSTAT](stat);
      });
    }
    [ONLSTAT](stat) {
      this.statCache.set(this.absolute, stat);
      this.stat = stat;
      if (!stat.isFile()) {
        stat.size = 0;
      }
      this.type = getType(stat);
      this.emit("stat", stat);
      this[PROCESS]();
    }
    [PROCESS]() {
      switch (this.type) {
        case "File":
          return this[FILE]();
        case "Directory":
          return this[DIRECTORY]();
        case "SymbolicLink":
          return this[SYMLINK]();
        default:
          return this.end();
      }
    }
    [MODE](mode) {
      return modeFix(mode, this.type === "Directory", this.portable);
    }
    [PREFIX](path2) {
      return prefixPath(path2, this.prefix);
    }
    [HEADER]() {
      if (this.type === "Directory" && this.portable) {
        this.noMtime = true;
      }
      this.header = new Header({
        path: this[PREFIX](this.path),
        linkpath: this.type === "Link" ? this[PREFIX](this.linkpath) : this.linkpath,
        mode: this[MODE](this.stat.mode),
        uid: this.portable ? null : this.stat.uid,
        gid: this.portable ? null : this.stat.gid,
        size: this.stat.size,
        mtime: this.noMtime ? null : this.mtime || this.stat.mtime,
        type: this.type,
        uname: this.portable ? null : this.stat.uid === this.myuid ? this.myuser : "",
        atime: this.portable ? null : this.stat.atime,
        ctime: this.portable ? null : this.stat.ctime
      });
      if (this.header.encode() && !this.noPax) {
        super.write(new Pax({
          atime: this.portable ? null : this.header.atime,
          ctime: this.portable ? null : this.header.ctime,
          gid: this.portable ? null : this.header.gid,
          mtime: this.noMtime ? null : this.mtime || this.header.mtime,
          path: this[PREFIX](this.path),
          linkpath: this.type === "Link" ? this[PREFIX](this.linkpath) : this.linkpath,
          size: this.header.size,
          uid: this.portable ? null : this.header.uid,
          uname: this.portable ? null : this.header.uname,
          dev: this.portable ? null : this.stat.dev,
          ino: this.portable ? null : this.stat.ino,
          nlink: this.portable ? null : this.stat.nlink
        }).encode());
      }
      super.write(this.header.block);
    }
    [DIRECTORY]() {
      if (this.path.slice(-1) !== "/") {
        this.path += "/";
      }
      this.stat.size = 0;
      this[HEADER]();
      this.end();
    }
    [SYMLINK]() {
      fs.readlink(this.absolute, (er, linkpath) => {
        if (er) {
          return this.emit("error", er);
        }
        this[ONREADLINK](linkpath);
      });
    }
    [ONREADLINK](linkpath) {
      this.linkpath = normPath(linkpath);
      this[HEADER]();
      this.end();
    }
    [HARDLINK](linkpath) {
      this.type = "Link";
      this.linkpath = normPath(path.relative(this.cwd, linkpath));
      this.stat.size = 0;
      this[HEADER]();
      this.end();
    }
    [FILE]() {
      if (this.stat.nlink > 1) {
        const linkKey = this.stat.dev + ":" + this.stat.ino;
        if (this.linkCache.has(linkKey)) {
          const linkpath = this.linkCache.get(linkKey);
          if (linkpath.indexOf(this.cwd) === 0) {
            return this[HARDLINK](linkpath);
          }
        }
        this.linkCache.set(linkKey, this.absolute);
      }
      this[HEADER]();
      if (this.stat.size === 0) {
        return this.end();
      }
      this[OPENFILE]();
    }
    [OPENFILE]() {
      fs.open(this.absolute, "r", (er, fd) => {
        if (er) {
          return this.emit("error", er);
        }
        this[ONOPENFILE](fd);
      });
    }
    [ONOPENFILE](fd) {
      this.fd = fd;
      if (this[HAD_ERROR]) {
        return this[CLOSE]();
      }
      this.blockLen = 512 * Math.ceil(this.stat.size / 512);
      this.blockRemain = this.blockLen;
      const bufLen = Math.min(this.blockLen, this.maxReadSize);
      this.buf = Buffer.allocUnsafe(bufLen);
      this.offset = 0;
      this.pos = 0;
      this.remain = this.stat.size;
      this.length = this.buf.length;
      this[READ]();
    }
    [READ]() {
      const { fd, buf, offset, length, pos } = this;
      fs.read(fd, buf, offset, length, pos, (er, bytesRead) => {
        if (er) {
          return this[CLOSE](() => this.emit("error", er));
        }
        this[ONREAD](bytesRead);
      });
    }
    [CLOSE](cb) {
      fs.close(this.fd, cb);
    }
    [ONREAD](bytesRead) {
      if (bytesRead <= 0 && this.remain > 0) {
        const er = new Error("encountered unexpected EOF");
        er.path = this.absolute;
        er.syscall = "read";
        er.code = "EOF";
        return this[CLOSE](() => this.emit("error", er));
      }
      if (bytesRead > this.remain) {
        const er = new Error("did not encounter expected EOF");
        er.path = this.absolute;
        er.syscall = "read";
        er.code = "EOF";
        return this[CLOSE](() => this.emit("error", er));
      }
      if (bytesRead === this.remain) {
        for (let i = bytesRead;i < this.length && bytesRead < this.blockRemain; i++) {
          this.buf[i + this.offset] = 0;
          bytesRead++;
          this.remain++;
        }
      }
      const writeBuf = this.offset === 0 && bytesRead === this.buf.length ? this.buf : this.buf.slice(this.offset, this.offset + bytesRead);
      const flushed = this.write(writeBuf);
      if (!flushed) {
        this[AWAITDRAIN](() => this[ONDRAIN]());
      } else {
        this[ONDRAIN]();
      }
    }
    [AWAITDRAIN](cb) {
      this.once("drain", cb);
    }
    write(writeBuf) {
      if (this.blockRemain < writeBuf.length) {
        const er = new Error("writing more data than expected");
        er.path = this.absolute;
        return this.emit("error", er);
      }
      this.remain -= writeBuf.length;
      this.blockRemain -= writeBuf.length;
      this.pos += writeBuf.length;
      this.offset += writeBuf.length;
      return super.write(writeBuf);
    }
    [ONDRAIN]() {
      if (!this.remain) {
        if (this.blockRemain) {
          super.write(Buffer.alloc(this.blockRemain));
        }
        return this[CLOSE]((er) => er ? this.emit("error", er) : this.end());
      }
      if (this.offset >= this.length) {
        this.buf = Buffer.allocUnsafe(Math.min(this.blockRemain, this.buf.length));
        this.offset = 0;
      }
      this.length = this.buf.length - this.offset;
      this[READ]();
    }
  });

  class WriteEntrySync extends WriteEntry {
    [LSTAT]() {
      this[ONLSTAT](fs.lstatSync(this.absolute));
    }
    [SYMLINK]() {
      this[ONREADLINK](fs.readlinkSync(this.absolute));
    }
    [OPENFILE]() {
      this[ONOPENFILE](fs.openSync(this.absolute, "r"));
    }
    [READ]() {
      let threw = true;
      try {
        const { fd, buf, offset, length, pos } = this;
        const bytesRead = fs.readSync(fd, buf, offset, length, pos);
        this[ONREAD](bytesRead);
        threw = false;
      } finally {
        if (threw) {
          try {
            this[CLOSE](() => {
            });
          } catch (er) {
          }
        }
      }
    }
    [AWAITDRAIN](cb) {
      cb();
    }
    [CLOSE](cb) {
      fs.closeSync(this.fd);
      cb();
    }
  }
  var WriteEntryTar = warner(class WriteEntryTar2 extends Minipass {
    constructor(readEntry, opt) {
      opt = opt || {};
      super(opt);
      this.preservePaths = !!opt.preservePaths;
      this.portable = !!opt.portable;
      this.strict = !!opt.strict;
      this.noPax = !!opt.noPax;
      this.noMtime = !!opt.noMtime;
      this.readEntry = readEntry;
      this.type = readEntry.type;
      if (this.type === "Directory" && this.portable) {
        this.noMtime = true;
      }
      this.prefix = opt.prefix || null;
      this.path = normPath(readEntry.path);
      this.mode = this[MODE](readEntry.mode);
      this.uid = this.portable ? null : readEntry.uid;
      this.gid = this.portable ? null : readEntry.gid;
      this.uname = this.portable ? null : readEntry.uname;
      this.gname = this.portable ? null : readEntry.gname;
      this.size = readEntry.size;
      this.mtime = this.noMtime ? null : opt.mtime || readEntry.mtime;
      this.atime = this.portable ? null : readEntry.atime;
      this.ctime = this.portable ? null : readEntry.ctime;
      this.linkpath = normPath(readEntry.linkpath);
      if (typeof opt.onwarn === "function") {
        this.on("warn", opt.onwarn);
      }
      let pathWarn = false;
      if (!this.preservePaths) {
        const [root, stripped] = stripAbsolutePath(this.path);
        if (root) {
          this.path = stripped;
          pathWarn = root;
        }
      }
      this.remain = readEntry.size;
      this.blockRemain = readEntry.startBlockSize;
      this.header = new Header({
        path: this[PREFIX](this.path),
        linkpath: this.type === "Link" ? this[PREFIX](this.linkpath) : this.linkpath,
        mode: this.mode,
        uid: this.portable ? null : this.uid,
        gid: this.portable ? null : this.gid,
        size: this.size,
        mtime: this.noMtime ? null : this.mtime,
        type: this.type,
        uname: this.portable ? null : this.uname,
        atime: this.portable ? null : this.atime,
        ctime: this.portable ? null : this.ctime
      });
      if (pathWarn) {
        this.warn("TAR_ENTRY_INFO", `stripping ${pathWarn} from absolute path`, {
          entry: this,
          path: pathWarn + this.path
        });
      }
      if (this.header.encode() && !this.noPax) {
        super.write(new Pax({
          atime: this.portable ? null : this.atime,
          ctime: this.portable ? null : this.ctime,
          gid: this.portable ? null : this.gid,
          mtime: this.noMtime ? null : this.mtime,
          path: this[PREFIX](this.path),
          linkpath: this.type === "Link" ? this[PREFIX](this.linkpath) : this.linkpath,
          size: this.size,
          uid: this.portable ? null : this.uid,
          uname: this.portable ? null : this.uname,
          dev: this.portable ? null : this.readEntry.dev,
          ino: this.portable ? null : this.readEntry.ino,
          nlink: this.portable ? null : this.readEntry.nlink
        }).encode());
      }
      super.write(this.header.block);
      readEntry.pipe(this);
    }
    [PREFIX](path2) {
      return prefixPath(path2, this.prefix);
    }
    [MODE](mode) {
      return modeFix(mode, this.type === "Directory", this.portable);
    }
    write(data) {
      const writeLen = data.length;
      if (writeLen > this.blockRemain) {
        throw new Error("writing more to entry than is appropriate");
      }
      this.blockRemain -= writeLen;
      return super.write(data);
    }
    end() {
      if (this.blockRemain) {
        super.write(Buffer.alloc(this.blockRemain));
      }
      return super.end();
    }
  });
  WriteEntry.Sync = WriteEntrySync;
  WriteEntry.Tar = WriteEntryTar;
  var getType = (stat) => stat.isFile() ? "File" : stat.isDirectory() ? "Directory" : stat.isSymbolicLink() ? "SymbolicLink" : "Unsupported";
  module.exports = WriteEntry;
});

// src/bun/node_modules/yallist/iterator.js
var require_iterator = __commonJS((exports, module) => {
  module.exports = function(Yallist) {
    Yallist.prototype[Symbol.iterator] = function* () {
      for (let walker = this.head;walker; walker = walker.next) {
        yield walker.value;
      }
    };
  };
});

// src/bun/node_modules/yallist/yallist.js
var require_yallist = __commonJS((exports, module) => {
  var Yallist = function(list) {
    var self2 = this;
    if (!(self2 instanceof Yallist)) {
      self2 = new Yallist;
    }
    self2.tail = null;
    self2.head = null;
    self2.length = 0;
    if (list && typeof list.forEach === "function") {
      list.forEach(function(item) {
        self2.push(item);
      });
    } else if (arguments.length > 0) {
      for (var i = 0, l = arguments.length;i < l; i++) {
        self2.push(arguments[i]);
      }
    }
    return self2;
  };
  var insert = function(self2, node, value) {
    var inserted = node === self2.head ? new Node(value, null, node, self2) : new Node(value, node, node.next, self2);
    if (inserted.next === null) {
      self2.tail = inserted;
    }
    if (inserted.prev === null) {
      self2.head = inserted;
    }
    self2.length++;
    return inserted;
  };
  var push = function(self2, item) {
    self2.tail = new Node(item, self2.tail, null, self2);
    if (!self2.head) {
      self2.head = self2.tail;
    }
    self2.length++;
  };
  var unshift = function(self2, item) {
    self2.head = new Node(item, null, self2.head, self2);
    if (!self2.tail) {
      self2.tail = self2.head;
    }
    self2.length++;
  };
  var Node = function(value, prev, next, list) {
    if (!(this instanceof Node)) {
      return new Node(value, prev, next, list);
    }
    this.list = list;
    this.value = value;
    if (prev) {
      prev.next = this;
      this.prev = prev;
    } else {
      this.prev = null;
    }
    if (next) {
      next.prev = this;
      this.next = next;
    } else {
      this.next = null;
    }
  };
  module.exports = Yallist;
  Yallist.Node = Node;
  Yallist.create = Yallist;
  Yallist.prototype.removeNode = function(node) {
    if (node.list !== this) {
      throw new Error("removing node which does not belong to this list");
    }
    var next = node.next;
    var prev = node.prev;
    if (next) {
      next.prev = prev;
    }
    if (prev) {
      prev.next = next;
    }
    if (node === this.head) {
      this.head = next;
    }
    if (node === this.tail) {
      this.tail = prev;
    }
    node.list.length--;
    node.next = null;
    node.prev = null;
    node.list = null;
    return next;
  };
  Yallist.prototype.unshiftNode = function(node) {
    if (node === this.head) {
      return;
    }
    if (node.list) {
      node.list.removeNode(node);
    }
    var head = this.head;
    node.list = this;
    node.next = head;
    if (head) {
      head.prev = node;
    }
    this.head = node;
    if (!this.tail) {
      this.tail = node;
    }
    this.length++;
  };
  Yallist.prototype.pushNode = function(node) {
    if (node === this.tail) {
      return;
    }
    if (node.list) {
      node.list.removeNode(node);
    }
    var tail = this.tail;
    node.list = this;
    node.prev = tail;
    if (tail) {
      tail.next = node;
    }
    this.tail = node;
    if (!this.head) {
      this.head = node;
    }
    this.length++;
  };
  Yallist.prototype.push = function() {
    for (var i = 0, l = arguments.length;i < l; i++) {
      push(this, arguments[i]);
    }
    return this.length;
  };
  Yallist.prototype.unshift = function() {
    for (var i = 0, l = arguments.length;i < l; i++) {
      unshift(this, arguments[i]);
    }
    return this.length;
  };
  Yallist.prototype.pop = function() {
    if (!this.tail) {
      return;
    }
    var res = this.tail.value;
    this.tail = this.tail.prev;
    if (this.tail) {
      this.tail.next = null;
    } else {
      this.head = null;
    }
    this.length--;
    return res;
  };
  Yallist.prototype.shift = function() {
    if (!this.head) {
      return;
    }
    var res = this.head.value;
    this.head = this.head.next;
    if (this.head) {
      this.head.prev = null;
    } else {
      this.tail = null;
    }
    this.length--;
    return res;
  };
  Yallist.prototype.forEach = function(fn, thisp) {
    thisp = thisp || this;
    for (var walker = this.head, i = 0;walker !== null; i++) {
      fn.call(thisp, walker.value, i, this);
      walker = walker.next;
    }
  };
  Yallist.prototype.forEachReverse = function(fn, thisp) {
    thisp = thisp || this;
    for (var walker = this.tail, i = this.length - 1;walker !== null; i--) {
      fn.call(thisp, walker.value, i, this);
      walker = walker.prev;
    }
  };
  Yallist.prototype.get = function(n) {
    for (var i = 0, walker = this.head;walker !== null && i < n; i++) {
      walker = walker.next;
    }
    if (i === n && walker !== null) {
      return walker.value;
    }
  };
  Yallist.prototype.getReverse = function(n) {
    for (var i = 0, walker = this.tail;walker !== null && i < n; i++) {
      walker = walker.prev;
    }
    if (i === n && walker !== null) {
      return walker.value;
    }
  };
  Yallist.prototype.map = function(fn, thisp) {
    thisp = thisp || this;
    var res = new Yallist;
    for (var walker = this.head;walker !== null; ) {
      res.push(fn.call(thisp, walker.value, this));
      walker = walker.next;
    }
    return res;
  };
  Yallist.prototype.mapReverse = function(fn, thisp) {
    thisp = thisp || this;
    var res = new Yallist;
    for (var walker = this.tail;walker !== null; ) {
      res.push(fn.call(thisp, walker.value, this));
      walker = walker.prev;
    }
    return res;
  };
  Yallist.prototype.reduce = function(fn, initial) {
    var acc;
    var walker = this.head;
    if (arguments.length > 1) {
      acc = initial;
    } else if (this.head) {
      walker = this.head.next;
      acc = this.head.value;
    } else {
      throw new TypeError("Reduce of empty list with no initial value");
    }
    for (var i = 0;walker !== null; i++) {
      acc = fn(acc, walker.value, i);
      walker = walker.next;
    }
    return acc;
  };
  Yallist.prototype.reduceReverse = function(fn, initial) {
    var acc;
    var walker = this.tail;
    if (arguments.length > 1) {
      acc = initial;
    } else if (this.tail) {
      walker = this.tail.prev;
      acc = this.tail.value;
    } else {
      throw new TypeError("Reduce of empty list with no initial value");
    }
    for (var i = this.length - 1;walker !== null; i--) {
      acc = fn(acc, walker.value, i);
      walker = walker.prev;
    }
    return acc;
  };
  Yallist.prototype.toArray = function() {
    var arr = new Array(this.length);
    for (var i = 0, walker = this.head;walker !== null; i++) {
      arr[i] = walker.value;
      walker = walker.next;
    }
    return arr;
  };
  Yallist.prototype.toArrayReverse = function() {
    var arr = new Array(this.length);
    for (var i = 0, walker = this.tail;walker !== null; i++) {
      arr[i] = walker.value;
      walker = walker.prev;
    }
    return arr;
  };
  Yallist.prototype.slice = function(from, to) {
    to = to || this.length;
    if (to < 0) {
      to += this.length;
    }
    from = from || 0;
    if (from < 0) {
      from += this.length;
    }
    var ret = new Yallist;
    if (to < from || to < 0) {
      return ret;
    }
    if (from < 0) {
      from = 0;
    }
    if (to > this.length) {
      to = this.length;
    }
    for (var i = 0, walker = this.head;walker !== null && i < from; i++) {
      walker = walker.next;
    }
    for (;walker !== null && i < to; i++, walker = walker.next) {
      ret.push(walker.value);
    }
    return ret;
  };
  Yallist.prototype.sliceReverse = function(from, to) {
    to = to || this.length;
    if (to < 0) {
      to += this.length;
    }
    from = from || 0;
    if (from < 0) {
      from += this.length;
    }
    var ret = new Yallist;
    if (to < from || to < 0) {
      return ret;
    }
    if (from < 0) {
      from = 0;
    }
    if (to > this.length) {
      to = this.length;
    }
    for (var i = this.length, walker = this.tail;walker !== null && i > to; i--) {
      walker = walker.prev;
    }
    for (;walker !== null && i > from; i--, walker = walker.prev) {
      ret.push(walker.value);
    }
    return ret;
  };
  Yallist.prototype.splice = function(start, deleteCount, ...nodes) {
    if (start > this.length) {
      start = this.length - 1;
    }
    if (start < 0) {
      start = this.length + start;
    }
    for (var i = 0, walker = this.head;walker !== null && i < start; i++) {
      walker = walker.next;
    }
    var ret = [];
    for (var i = 0;walker && i < deleteCount; i++) {
      ret.push(walker.value);
      walker = this.removeNode(walker);
    }
    if (walker === null) {
      walker = this.tail;
    }
    if (walker !== this.head && walker !== this.tail) {
      walker = walker.prev;
    }
    for (var i = 0;i < nodes.length; i++) {
      walker = insert(this, walker, nodes[i]);
    }
    return ret;
  };
  Yallist.prototype.reverse = function() {
    var head = this.head;
    var tail = this.tail;
    for (var walker = head;walker !== null; walker = walker.prev) {
      var p = walker.prev;
      walker.prev = walker.next;
      walker.next = p;
    }
    this.head = tail;
    this.tail = head;
    return this;
  };
  try {
    require_iterator()(Yallist);
  } catch (er) {
  }
});

// src/bun/node_modules/tar/lib/pack.js
var require_pack = __commonJS((exports, module) => {
  class PackJob {
    constructor(path2, absolute) {
      this.path = path2 || "./";
      this.absolute = absolute;
      this.entry = null;
      this.stat = null;
      this.readdir = null;
      this.pending = false;
      this.ignore = false;
      this.piped = false;
    }
  }
  var { Minipass } = require_minipass();
  var zlib = require_minizlib();
  var ReadEntry = require_read_entry();
  var WriteEntry = require_write_entry();
  var WriteEntrySync = WriteEntry.Sync;
  var WriteEntryTar = WriteEntry.Tar;
  var Yallist = require_yallist();
  var EOF = Buffer.alloc(1024);
  var ONSTAT = Symbol("onStat");
  var ENDED = Symbol("ended");
  var QUEUE = Symbol("queue");
  var CURRENT = Symbol("current");
  var PROCESS = Symbol("process");
  var PROCESSING = Symbol("processing");
  var PROCESSJOB = Symbol("processJob");
  var JOBS = Symbol("jobs");
  var JOBDONE = Symbol("jobDone");
  var ADDFSENTRY = Symbol("addFSEntry");
  var ADDTARENTRY = Symbol("addTarEntry");
  var STAT = Symbol("stat");
  var READDIR = Symbol("readdir");
  var ONREADDIR = Symbol("onreaddir");
  var PIPE = Symbol("pipe");
  var ENTRY = Symbol("entry");
  var ENTRYOPT = Symbol("entryOpt");
  var WRITEENTRYCLASS = Symbol("writeEntryClass");
  var WRITE = Symbol("write");
  var ONDRAIN = Symbol("ondrain");
  var fs = import.meta.require("fs");
  var path = import.meta.require("path");
  var warner = require_warn_mixin();
  var normPath = require_normalize_windows_path();
  var Pack = warner(class Pack2 extends Minipass {
    constructor(opt) {
      super(opt);
      opt = opt || Object.create(null);
      this.opt = opt;
      this.file = opt.file || "";
      this.cwd = opt.cwd || process.cwd();
      this.maxReadSize = opt.maxReadSize;
      this.preservePaths = !!opt.preservePaths;
      this.strict = !!opt.strict;
      this.noPax = !!opt.noPax;
      this.prefix = normPath(opt.prefix || "");
      this.linkCache = opt.linkCache || new Map;
      this.statCache = opt.statCache || new Map;
      this.readdirCache = opt.readdirCache || new Map;
      this[WRITEENTRYCLASS] = WriteEntry;
      if (typeof opt.onwarn === "function") {
        this.on("warn", opt.onwarn);
      }
      this.portable = !!opt.portable;
      this.zip = null;
      if (opt.gzip || opt.brotli) {
        if (opt.gzip && opt.brotli) {
          throw new TypeError("gzip and brotli are mutually exclusive");
        }
        if (opt.gzip) {
          if (typeof opt.gzip !== "object") {
            opt.gzip = {};
          }
          if (this.portable) {
            opt.gzip.portable = true;
          }
          this.zip = new zlib.Gzip(opt.gzip);
        }
        if (opt.brotli) {
          if (typeof opt.brotli !== "object") {
            opt.brotli = {};
          }
          this.zip = new zlib.BrotliCompress(opt.brotli);
        }
        this.zip.on("data", (chunk) => super.write(chunk));
        this.zip.on("end", (_) => super.end());
        this.zip.on("drain", (_) => this[ONDRAIN]());
        this.on("resume", (_) => this.zip.resume());
      } else {
        this.on("drain", this[ONDRAIN]);
      }
      this.noDirRecurse = !!opt.noDirRecurse;
      this.follow = !!opt.follow;
      this.noMtime = !!opt.noMtime;
      this.mtime = opt.mtime || null;
      this.filter = typeof opt.filter === "function" ? opt.filter : (_) => true;
      this[QUEUE] = new Yallist;
      this[JOBS] = 0;
      this.jobs = +opt.jobs || 4;
      this[PROCESSING] = false;
      this[ENDED] = false;
    }
    [WRITE](chunk) {
      return super.write(chunk);
    }
    add(path2) {
      this.write(path2);
      return this;
    }
    end(path2) {
      if (path2) {
        this.write(path2);
      }
      this[ENDED] = true;
      this[PROCESS]();
      return this;
    }
    write(path2) {
      if (this[ENDED]) {
        throw new Error("write after end");
      }
      if (path2 instanceof ReadEntry) {
        this[ADDTARENTRY](path2);
      } else {
        this[ADDFSENTRY](path2);
      }
      return this.flowing;
    }
    [ADDTARENTRY](p) {
      const absolute = normPath(path.resolve(this.cwd, p.path));
      if (!this.filter(p.path, p)) {
        p.resume();
      } else {
        const job = new PackJob(p.path, absolute, false);
        job.entry = new WriteEntryTar(p, this[ENTRYOPT](job));
        job.entry.on("end", (_) => this[JOBDONE](job));
        this[JOBS] += 1;
        this[QUEUE].push(job);
      }
      this[PROCESS]();
    }
    [ADDFSENTRY](p) {
      const absolute = normPath(path.resolve(this.cwd, p));
      this[QUEUE].push(new PackJob(p, absolute));
      this[PROCESS]();
    }
    [STAT](job) {
      job.pending = true;
      this[JOBS] += 1;
      const stat = this.follow ? "stat" : "lstat";
      fs[stat](job.absolute, (er, stat2) => {
        job.pending = false;
        this[JOBS] -= 1;
        if (er) {
          this.emit("error", er);
        } else {
          this[ONSTAT](job, stat2);
        }
      });
    }
    [ONSTAT](job, stat) {
      this.statCache.set(job.absolute, stat);
      job.stat = stat;
      if (!this.filter(job.path, stat)) {
        job.ignore = true;
      }
      this[PROCESS]();
    }
    [READDIR](job) {
      job.pending = true;
      this[JOBS] += 1;
      fs.readdir(job.absolute, (er, entries) => {
        job.pending = false;
        this[JOBS] -= 1;
        if (er) {
          return this.emit("error", er);
        }
        this[ONREADDIR](job, entries);
      });
    }
    [ONREADDIR](job, entries) {
      this.readdirCache.set(job.absolute, entries);
      job.readdir = entries;
      this[PROCESS]();
    }
    [PROCESS]() {
      if (this[PROCESSING]) {
        return;
      }
      this[PROCESSING] = true;
      for (let w = this[QUEUE].head;w !== null && this[JOBS] < this.jobs; w = w.next) {
        this[PROCESSJOB](w.value);
        if (w.value.ignore) {
          const p = w.next;
          this[QUEUE].removeNode(w);
          w.next = p;
        }
      }
      this[PROCESSING] = false;
      if (this[ENDED] && !this[QUEUE].length && this[JOBS] === 0) {
        if (this.zip) {
          this.zip.end(EOF);
        } else {
          super.write(EOF);
          super.end();
        }
      }
    }
    get [CURRENT]() {
      return this[QUEUE] && this[QUEUE].head && this[QUEUE].head.value;
    }
    [JOBDONE](job) {
      this[QUEUE].shift();
      this[JOBS] -= 1;
      this[PROCESS]();
    }
    [PROCESSJOB](job) {
      if (job.pending) {
        return;
      }
      if (job.entry) {
        if (job === this[CURRENT] && !job.piped) {
          this[PIPE](job);
        }
        return;
      }
      if (!job.stat) {
        if (this.statCache.has(job.absolute)) {
          this[ONSTAT](job, this.statCache.get(job.absolute));
        } else {
          this[STAT](job);
        }
      }
      if (!job.stat) {
        return;
      }
      if (job.ignore) {
        return;
      }
      if (!this.noDirRecurse && job.stat.isDirectory() && !job.readdir) {
        if (this.readdirCache.has(job.absolute)) {
          this[ONREADDIR](job, this.readdirCache.get(job.absolute));
        } else {
          this[READDIR](job);
        }
        if (!job.readdir) {
          return;
        }
      }
      job.entry = this[ENTRY](job);
      if (!job.entry) {
        job.ignore = true;
        return;
      }
      if (job === this[CURRENT] && !job.piped) {
        this[PIPE](job);
      }
    }
    [ENTRYOPT](job) {
      return {
        onwarn: (code, msg, data) => this.warn(code, msg, data),
        noPax: this.noPax,
        cwd: this.cwd,
        absolute: job.absolute,
        preservePaths: this.preservePaths,
        maxReadSize: this.maxReadSize,
        strict: this.strict,
        portable: this.portable,
        linkCache: this.linkCache,
        statCache: this.statCache,
        noMtime: this.noMtime,
        mtime: this.mtime,
        prefix: this.prefix
      };
    }
    [ENTRY](job) {
      this[JOBS] += 1;
      try {
        return new this[WRITEENTRYCLASS](job.path, this[ENTRYOPT](job)).on("end", () => this[JOBDONE](job)).on("error", (er) => this.emit("error", er));
      } catch (er) {
        this.emit("error", er);
      }
    }
    [ONDRAIN]() {
      if (this[CURRENT] && this[CURRENT].entry) {
        this[CURRENT].entry.resume();
      }
    }
    [PIPE](job) {
      job.piped = true;
      if (job.readdir) {
        job.readdir.forEach((entry) => {
          const p = job.path;
          const base = p === "./" ? "" : p.replace(/\/*$/, "/");
          this[ADDFSENTRY](base + entry);
        });
      }
      const source = job.entry;
      const zip = this.zip;
      if (zip) {
        source.on("data", (chunk) => {
          if (!zip.write(chunk)) {
            source.pause();
          }
        });
      } else {
        source.on("data", (chunk) => {
          if (!super.write(chunk)) {
            source.pause();
          }
        });
      }
    }
    pause() {
      if (this.zip) {
        this.zip.pause();
      }
      return super.pause();
    }
  });

  class PackSync extends Pack {
    constructor(opt) {
      super(opt);
      this[WRITEENTRYCLASS] = WriteEntrySync;
    }
    pause() {
    }
    resume() {
    }
    [STAT](job) {
      const stat = this.follow ? "statSync" : "lstatSync";
      this[ONSTAT](job, fs[stat](job.absolute));
    }
    [READDIR](job, stat) {
      this[ONREADDIR](job, fs.readdirSync(job.absolute));
    }
    [PIPE](job) {
      const source = job.entry;
      const zip = this.zip;
      if (job.readdir) {
        job.readdir.forEach((entry) => {
          const p = job.path;
          const base = p === "./" ? "" : p.replace(/\/*$/, "/");
          this[ADDFSENTRY](base + entry);
        });
      }
      if (zip) {
        source.on("data", (chunk) => {
          zip.write(chunk);
        });
      } else {
        source.on("data", (chunk) => {
          super[WRITE](chunk);
        });
      }
    }
  }
  Pack.Sync = PackSync;
  module.exports = Pack;
});

// src/bun/node_modules/fs-minipass/node_modules/minipass/index.js
var require_minipass3 = __commonJS((exports, module) => {
  var proc = typeof process === "object" && process ? process : {
    stdout: null,
    stderr: null
  };
  var EE = import.meta.require("events");
  var Stream = import.meta.require("stream");
  var SD = import.meta.require("string_decoder").StringDecoder;
  var EOF = Symbol("EOF");
  var MAYBE_EMIT_END = Symbol("maybeEmitEnd");
  var EMITTED_END = Symbol("emittedEnd");
  var EMITTING_END = Symbol("emittingEnd");
  var EMITTED_ERROR = Symbol("emittedError");
  var CLOSED = Symbol("closed");
  var READ = Symbol("read");
  var FLUSH = Symbol("flush");
  var FLUSHCHUNK = Symbol("flushChunk");
  var ENCODING = Symbol("encoding");
  var DECODER = Symbol("decoder");
  var FLOWING = Symbol("flowing");
  var PAUSED = Symbol("paused");
  var RESUME = Symbol("resume");
  var BUFFERLENGTH = Symbol("bufferLength");
  var BUFFERPUSH = Symbol("bufferPush");
  var BUFFERSHIFT = Symbol("bufferShift");
  var OBJECTMODE = Symbol("objectMode");
  var DESTROYED = Symbol("destroyed");
  var EMITDATA = Symbol("emitData");
  var EMITEND = Symbol("emitEnd");
  var EMITEND2 = Symbol("emitEnd2");
  var ASYNC = Symbol("async");
  var defer = (fn) => Promise.resolve().then(fn);
  var doIter = global._MP_NO_ITERATOR_SYMBOLS_ !== "1";
  var ASYNCITERATOR = doIter && Symbol.asyncIterator || Symbol("asyncIterator not implemented");
  var ITERATOR = doIter && Symbol.iterator || Symbol("iterator not implemented");
  var isEndish = (ev) => ev === "end" || ev === "finish" || ev === "prefinish";
  var isArrayBuffer = (b) => b instanceof ArrayBuffer || typeof b === "object" && b.constructor && b.constructor.name === "ArrayBuffer" && b.byteLength >= 0;
  var isArrayBufferView = (b) => !Buffer.isBuffer(b) && ArrayBuffer.isView(b);

  class Pipe {
    constructor(src, dest, opts) {
      this.src = src;
      this.dest = dest;
      this.opts = opts;
      this.ondrain = () => src[RESUME]();
      dest.on("drain", this.ondrain);
    }
    unpipe() {
      this.dest.removeListener("drain", this.ondrain);
    }
    proxyErrors() {
    }
    end() {
      this.unpipe();
      if (this.opts.end)
        this.dest.end();
    }
  }

  class PipeProxyErrors extends Pipe {
    unpipe() {
      this.src.removeListener("error", this.proxyErrors);
      super.unpipe();
    }
    constructor(src, dest, opts) {
      super(src, dest, opts);
      this.proxyErrors = (er) => dest.emit("error", er);
      src.on("error", this.proxyErrors);
    }
  }
  module.exports = class Minipass extends Stream {
    constructor(options) {
      super();
      this[FLOWING] = false;
      this[PAUSED] = false;
      this.pipes = [];
      this.buffer = [];
      this[OBJECTMODE] = options && options.objectMode || false;
      if (this[OBJECTMODE])
        this[ENCODING] = null;
      else
        this[ENCODING] = options && options.encoding || null;
      if (this[ENCODING] === "buffer")
        this[ENCODING] = null;
      this[ASYNC] = options && !!options.async || false;
      this[DECODER] = this[ENCODING] ? new SD(this[ENCODING]) : null;
      this[EOF] = false;
      this[EMITTED_END] = false;
      this[EMITTING_END] = false;
      this[CLOSED] = false;
      this[EMITTED_ERROR] = null;
      this.writable = true;
      this.readable = true;
      this[BUFFERLENGTH] = 0;
      this[DESTROYED] = false;
    }
    get bufferLength() {
      return this[BUFFERLENGTH];
    }
    get encoding() {
      return this[ENCODING];
    }
    set encoding(enc) {
      if (this[OBJECTMODE])
        throw new Error("cannot set encoding in objectMode");
      if (this[ENCODING] && enc !== this[ENCODING] && (this[DECODER] && this[DECODER].lastNeed || this[BUFFERLENGTH]))
        throw new Error("cannot change encoding");
      if (this[ENCODING] !== enc) {
        this[DECODER] = enc ? new SD(enc) : null;
        if (this.buffer.length)
          this.buffer = this.buffer.map((chunk) => this[DECODER].write(chunk));
      }
      this[ENCODING] = enc;
    }
    setEncoding(enc) {
      this.encoding = enc;
    }
    get objectMode() {
      return this[OBJECTMODE];
    }
    set objectMode(om) {
      this[OBJECTMODE] = this[OBJECTMODE] || !!om;
    }
    get ["async"]() {
      return this[ASYNC];
    }
    set ["async"](a) {
      this[ASYNC] = this[ASYNC] || !!a;
    }
    write(chunk, encoding, cb) {
      if (this[EOF])
        throw new Error("write after end");
      if (this[DESTROYED]) {
        this.emit("error", Object.assign(new Error("Cannot call write after a stream was destroyed"), { code: "ERR_STREAM_DESTROYED" }));
        return true;
      }
      if (typeof encoding === "function")
        cb = encoding, encoding = "utf8";
      if (!encoding)
        encoding = "utf8";
      const fn = this[ASYNC] ? defer : (f) => f();
      if (!this[OBJECTMODE] && !Buffer.isBuffer(chunk)) {
        if (isArrayBufferView(chunk))
          chunk = Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
        else if (isArrayBuffer(chunk))
          chunk = Buffer.from(chunk);
        else if (typeof chunk !== "string")
          this.objectMode = true;
      }
      if (this[OBJECTMODE]) {
        if (this.flowing && this[BUFFERLENGTH] !== 0)
          this[FLUSH](true);
        if (this.flowing)
          this.emit("data", chunk);
        else
          this[BUFFERPUSH](chunk);
        if (this[BUFFERLENGTH] !== 0)
          this.emit("readable");
        if (cb)
          fn(cb);
        return this.flowing;
      }
      if (!chunk.length) {
        if (this[BUFFERLENGTH] !== 0)
          this.emit("readable");
        if (cb)
          fn(cb);
        return this.flowing;
      }
      if (typeof chunk === "string" && !(encoding === this[ENCODING] && !this[DECODER].lastNeed)) {
        chunk = Buffer.from(chunk, encoding);
      }
      if (Buffer.isBuffer(chunk) && this[ENCODING])
        chunk = this[DECODER].write(chunk);
      if (this.flowing && this[BUFFERLENGTH] !== 0)
        this[FLUSH](true);
      if (this.flowing)
        this.emit("data", chunk);
      else
        this[BUFFERPUSH](chunk);
      if (this[BUFFERLENGTH] !== 0)
        this.emit("readable");
      if (cb)
        fn(cb);
      return this.flowing;
    }
    read(n) {
      if (this[DESTROYED])
        return null;
      if (this[BUFFERLENGTH] === 0 || n === 0 || n > this[BUFFERLENGTH]) {
        this[MAYBE_EMIT_END]();
        return null;
      }
      if (this[OBJECTMODE])
        n = null;
      if (this.buffer.length > 1 && !this[OBJECTMODE]) {
        if (this.encoding)
          this.buffer = [this.buffer.join("")];
        else
          this.buffer = [Buffer.concat(this.buffer, this[BUFFERLENGTH])];
      }
      const ret = this[READ](n || null, this.buffer[0]);
      this[MAYBE_EMIT_END]();
      return ret;
    }
    [READ](n, chunk) {
      if (n === chunk.length || n === null)
        this[BUFFERSHIFT]();
      else {
        this.buffer[0] = chunk.slice(n);
        chunk = chunk.slice(0, n);
        this[BUFFERLENGTH] -= n;
      }
      this.emit("data", chunk);
      if (!this.buffer.length && !this[EOF])
        this.emit("drain");
      return chunk;
    }
    end(chunk, encoding, cb) {
      if (typeof chunk === "function")
        cb = chunk, chunk = null;
      if (typeof encoding === "function")
        cb = encoding, encoding = "utf8";
      if (chunk)
        this.write(chunk, encoding);
      if (cb)
        this.once("end", cb);
      this[EOF] = true;
      this.writable = false;
      if (this.flowing || !this[PAUSED])
        this[MAYBE_EMIT_END]();
      return this;
    }
    [RESUME]() {
      if (this[DESTROYED])
        return;
      this[PAUSED] = false;
      this[FLOWING] = true;
      this.emit("resume");
      if (this.buffer.length)
        this[FLUSH]();
      else if (this[EOF])
        this[MAYBE_EMIT_END]();
      else
        this.emit("drain");
    }
    resume() {
      return this[RESUME]();
    }
    pause() {
      this[FLOWING] = false;
      this[PAUSED] = true;
    }
    get destroyed() {
      return this[DESTROYED];
    }
    get flowing() {
      return this[FLOWING];
    }
    get paused() {
      return this[PAUSED];
    }
    [BUFFERPUSH](chunk) {
      if (this[OBJECTMODE])
        this[BUFFERLENGTH] += 1;
      else
        this[BUFFERLENGTH] += chunk.length;
      this.buffer.push(chunk);
    }
    [BUFFERSHIFT]() {
      if (this.buffer.length) {
        if (this[OBJECTMODE])
          this[BUFFERLENGTH] -= 1;
        else
          this[BUFFERLENGTH] -= this.buffer[0].length;
      }
      return this.buffer.shift();
    }
    [FLUSH](noDrain) {
      do {
      } while (this[FLUSHCHUNK](this[BUFFERSHIFT]()));
      if (!noDrain && !this.buffer.length && !this[EOF])
        this.emit("drain");
    }
    [FLUSHCHUNK](chunk) {
      return chunk ? (this.emit("data", chunk), this.flowing) : false;
    }
    pipe(dest, opts) {
      if (this[DESTROYED])
        return;
      const ended = this[EMITTED_END];
      opts = opts || {};
      if (dest === proc.stdout || dest === proc.stderr)
        opts.end = false;
      else
        opts.end = opts.end !== false;
      opts.proxyErrors = !!opts.proxyErrors;
      if (ended) {
        if (opts.end)
          dest.end();
      } else {
        this.pipes.push(!opts.proxyErrors ? new Pipe(this, dest, opts) : new PipeProxyErrors(this, dest, opts));
        if (this[ASYNC])
          defer(() => this[RESUME]());
        else
          this[RESUME]();
      }
      return dest;
    }
    unpipe(dest) {
      const p = this.pipes.find((p2) => p2.dest === dest);
      if (p) {
        this.pipes.splice(this.pipes.indexOf(p), 1);
        p.unpipe();
      }
    }
    addListener(ev, fn) {
      return this.on(ev, fn);
    }
    on(ev, fn) {
      const ret = super.on(ev, fn);
      if (ev === "data" && !this.pipes.length && !this.flowing)
        this[RESUME]();
      else if (ev === "readable" && this[BUFFERLENGTH] !== 0)
        super.emit("readable");
      else if (isEndish(ev) && this[EMITTED_END]) {
        super.emit(ev);
        this.removeAllListeners(ev);
      } else if (ev === "error" && this[EMITTED_ERROR]) {
        if (this[ASYNC])
          defer(() => fn.call(this, this[EMITTED_ERROR]));
        else
          fn.call(this, this[EMITTED_ERROR]);
      }
      return ret;
    }
    get emittedEnd() {
      return this[EMITTED_END];
    }
    [MAYBE_EMIT_END]() {
      if (!this[EMITTING_END] && !this[EMITTED_END] && !this[DESTROYED] && this.buffer.length === 0 && this[EOF]) {
        this[EMITTING_END] = true;
        this.emit("end");
        this.emit("prefinish");
        this.emit("finish");
        if (this[CLOSED])
          this.emit("close");
        this[EMITTING_END] = false;
      }
    }
    emit(ev, data, ...extra) {
      if (ev !== "error" && ev !== "close" && ev !== DESTROYED && this[DESTROYED])
        return;
      else if (ev === "data") {
        return !data ? false : this[ASYNC] ? defer(() => this[EMITDATA](data)) : this[EMITDATA](data);
      } else if (ev === "end") {
        return this[EMITEND]();
      } else if (ev === "close") {
        this[CLOSED] = true;
        if (!this[EMITTED_END] && !this[DESTROYED])
          return;
        const ret2 = super.emit("close");
        this.removeAllListeners("close");
        return ret2;
      } else if (ev === "error") {
        this[EMITTED_ERROR] = data;
        const ret2 = super.emit("error", data);
        this[MAYBE_EMIT_END]();
        return ret2;
      } else if (ev === "resume") {
        const ret2 = super.emit("resume");
        this[MAYBE_EMIT_END]();
        return ret2;
      } else if (ev === "finish" || ev === "prefinish") {
        const ret2 = super.emit(ev);
        this.removeAllListeners(ev);
        return ret2;
      }
      const ret = super.emit(ev, data, ...extra);
      this[MAYBE_EMIT_END]();
      return ret;
    }
    [EMITDATA](data) {
      for (const p of this.pipes) {
        if (p.dest.write(data) === false)
          this.pause();
      }
      const ret = super.emit("data", data);
      this[MAYBE_EMIT_END]();
      return ret;
    }
    [EMITEND]() {
      if (this[EMITTED_END])
        return;
      this[EMITTED_END] = true;
      this.readable = false;
      if (this[ASYNC])
        defer(() => this[EMITEND2]());
      else
        this[EMITEND2]();
    }
    [EMITEND2]() {
      if (this[DECODER]) {
        const data = this[DECODER].end();
        if (data) {
          for (const p of this.pipes) {
            p.dest.write(data);
          }
          super.emit("data", data);
        }
      }
      for (const p of this.pipes) {
        p.end();
      }
      const ret = super.emit("end");
      this.removeAllListeners("end");
      return ret;
    }
    collect() {
      const buf = [];
      if (!this[OBJECTMODE])
        buf.dataLength = 0;
      const p = this.promise();
      this.on("data", (c) => {
        buf.push(c);
        if (!this[OBJECTMODE])
          buf.dataLength += c.length;
      });
      return p.then(() => buf);
    }
    concat() {
      return this[OBJECTMODE] ? Promise.reject(new Error("cannot concat in objectMode")) : this.collect().then((buf) => this[OBJECTMODE] ? Promise.reject(new Error("cannot concat in objectMode")) : this[ENCODING] ? buf.join("") : Buffer.concat(buf, buf.dataLength));
    }
    promise() {
      return new Promise((resolve, reject) => {
        this.on(DESTROYED, () => reject(new Error("stream destroyed")));
        this.on("error", (er) => reject(er));
        this.on("end", () => resolve());
      });
    }
    [ASYNCITERATOR]() {
      const next = () => {
        const res = this.read();
        if (res !== null)
          return Promise.resolve({ done: false, value: res });
        if (this[EOF])
          return Promise.resolve({ done: true });
        let resolve = null;
        let reject = null;
        const onerr = (er) => {
          this.removeListener("data", ondata);
          this.removeListener("end", onend);
          reject(er);
        };
        const ondata = (value) => {
          this.removeListener("error", onerr);
          this.removeListener("end", onend);
          this.pause();
          resolve({ value, done: !!this[EOF] });
        };
        const onend = () => {
          this.removeListener("error", onerr);
          this.removeListener("data", ondata);
          resolve({ done: true });
        };
        const ondestroy = () => onerr(new Error("stream destroyed"));
        return new Promise((res2, rej) => {
          reject = rej;
          resolve = res2;
          this.once(DESTROYED, ondestroy);
          this.once("error", onerr);
          this.once("end", onend);
          this.once("data", ondata);
        });
      };
      return { next };
    }
    [ITERATOR]() {
      const next = () => {
        const value = this.read();
        const done = value === null;
        return { value, done };
      };
      return { next };
    }
    destroy(er) {
      if (this[DESTROYED]) {
        if (er)
          this.emit("error", er);
        else
          this.emit(DESTROYED);
        return this;
      }
      this[DESTROYED] = true;
      this.buffer.length = 0;
      this[BUFFERLENGTH] = 0;
      if (typeof this.close === "function" && !this[CLOSED])
        this.close();
      if (er)
        this.emit("error", er);
      else
        this.emit(DESTROYED);
      return this;
    }
    static isStream(s) {
      return !!s && (s instanceof Minipass || s instanceof Stream || s instanceof EE && (typeof s.pipe === "function" || typeof s.write === "function" && typeof s.end === "function"));
    }
  };
});

// src/bun/node_modules/fs-minipass/index.js
var require_fs_minipass = __commonJS((exports) => {
  var MiniPass = require_minipass3();
  var EE = import.meta.require("events").EventEmitter;
  var fs = import.meta.require("fs");
  var writev = fs.writev;
  if (!writev) {
    const binding = process.binding("fs");
    const FSReqWrap = binding.FSReqWrap || binding.FSReqCallback;
    writev = (fd, iovec, pos, cb) => {
      const done = (er, bw) => cb(er, bw, iovec);
      const req = new FSReqWrap;
      req.oncomplete = done;
      binding.writeBuffers(fd, iovec, pos, req);
    };
  }
  var _autoClose = Symbol("_autoClose");
  var _close = Symbol("_close");
  var _ended = Symbol("_ended");
  var _fd = Symbol("_fd");
  var _finished = Symbol("_finished");
  var _flags = Symbol("_flags");
  var _flush = Symbol("_flush");
  var _handleChunk = Symbol("_handleChunk");
  var _makeBuf = Symbol("_makeBuf");
  var _mode = Symbol("_mode");
  var _needDrain = Symbol("_needDrain");
  var _onerror = Symbol("_onerror");
  var _onopen = Symbol("_onopen");
  var _onread = Symbol("_onread");
  var _onwrite = Symbol("_onwrite");
  var _open = Symbol("_open");
  var _path = Symbol("_path");
  var _pos = Symbol("_pos");
  var _queue = Symbol("_queue");
  var _read = Symbol("_read");
  var _readSize = Symbol("_readSize");
  var _reading = Symbol("_reading");
  var _remain = Symbol("_remain");
  var _size = Symbol("_size");
  var _write = Symbol("_write");
  var _writing = Symbol("_writing");
  var _defaultFlag = Symbol("_defaultFlag");
  var _errored = Symbol("_errored");

  class ReadStream extends MiniPass {
    constructor(path, opt) {
      opt = opt || {};
      super(opt);
      this.readable = true;
      this.writable = false;
      if (typeof path !== "string")
        throw new TypeError("path must be a string");
      this[_errored] = false;
      this[_fd] = typeof opt.fd === "number" ? opt.fd : null;
      this[_path] = path;
      this[_readSize] = opt.readSize || 16 * 1024 * 1024;
      this[_reading] = false;
      this[_size] = typeof opt.size === "number" ? opt.size : Infinity;
      this[_remain] = this[_size];
      this[_autoClose] = typeof opt.autoClose === "boolean" ? opt.autoClose : true;
      if (typeof this[_fd] === "number")
        this[_read]();
      else
        this[_open]();
    }
    get fd() {
      return this[_fd];
    }
    get path() {
      return this[_path];
    }
    write() {
      throw new TypeError("this is a readable stream");
    }
    end() {
      throw new TypeError("this is a readable stream");
    }
    [_open]() {
      fs.open(this[_path], "r", (er, fd) => this[_onopen](er, fd));
    }
    [_onopen](er, fd) {
      if (er)
        this[_onerror](er);
      else {
        this[_fd] = fd;
        this.emit("open", fd);
        this[_read]();
      }
    }
    [_makeBuf]() {
      return Buffer.allocUnsafe(Math.min(this[_readSize], this[_remain]));
    }
    [_read]() {
      if (!this[_reading]) {
        this[_reading] = true;
        const buf = this[_makeBuf]();
        if (buf.length === 0)
          return process.nextTick(() => this[_onread](null, 0, buf));
        fs.read(this[_fd], buf, 0, buf.length, null, (er, br, buf2) => this[_onread](er, br, buf2));
      }
    }
    [_onread](er, br, buf) {
      this[_reading] = false;
      if (er)
        this[_onerror](er);
      else if (this[_handleChunk](br, buf))
        this[_read]();
    }
    [_close]() {
      if (this[_autoClose] && typeof this[_fd] === "number") {
        const fd = this[_fd];
        this[_fd] = null;
        fs.close(fd, (er) => er ? this.emit("error", er) : this.emit("close"));
      }
    }
    [_onerror](er) {
      this[_reading] = true;
      this[_close]();
      this.emit("error", er);
    }
    [_handleChunk](br, buf) {
      let ret = false;
      this[_remain] -= br;
      if (br > 0)
        ret = super.write(br < buf.length ? buf.slice(0, br) : buf);
      if (br === 0 || this[_remain] <= 0) {
        ret = false;
        this[_close]();
        super.end();
      }
      return ret;
    }
    emit(ev, data) {
      switch (ev) {
        case "prefinish":
        case "finish":
          break;
        case "drain":
          if (typeof this[_fd] === "number")
            this[_read]();
          break;
        case "error":
          if (this[_errored])
            return;
          this[_errored] = true;
          return super.emit(ev, data);
        default:
          return super.emit(ev, data);
      }
    }
  }

  class ReadStreamSync extends ReadStream {
    [_open]() {
      let threw = true;
      try {
        this[_onopen](null, fs.openSync(this[_path], "r"));
        threw = false;
      } finally {
        if (threw)
          this[_close]();
      }
    }
    [_read]() {
      let threw = true;
      try {
        if (!this[_reading]) {
          this[_reading] = true;
          do {
            const buf = this[_makeBuf]();
            const br = buf.length === 0 ? 0 : fs.readSync(this[_fd], buf, 0, buf.length, null);
            if (!this[_handleChunk](br, buf))
              break;
          } while (true);
          this[_reading] = false;
        }
        threw = false;
      } finally {
        if (threw)
          this[_close]();
      }
    }
    [_close]() {
      if (this[_autoClose] && typeof this[_fd] === "number") {
        const fd = this[_fd];
        this[_fd] = null;
        fs.closeSync(fd);
        this.emit("close");
      }
    }
  }

  class WriteStream extends EE {
    constructor(path, opt) {
      opt = opt || {};
      super(opt);
      this.readable = false;
      this.writable = true;
      this[_errored] = false;
      this[_writing] = false;
      this[_ended] = false;
      this[_needDrain] = false;
      this[_queue] = [];
      this[_path] = path;
      this[_fd] = typeof opt.fd === "number" ? opt.fd : null;
      this[_mode] = opt.mode === undefined ? 438 : opt.mode;
      this[_pos] = typeof opt.start === "number" ? opt.start : null;
      this[_autoClose] = typeof opt.autoClose === "boolean" ? opt.autoClose : true;
      const defaultFlag = this[_pos] !== null ? "r+" : "w";
      this[_defaultFlag] = opt.flags === undefined;
      this[_flags] = this[_defaultFlag] ? defaultFlag : opt.flags;
      if (this[_fd] === null)
        this[_open]();
    }
    emit(ev, data) {
      if (ev === "error") {
        if (this[_errored])
          return;
        this[_errored] = true;
      }
      return super.emit(ev, data);
    }
    get fd() {
      return this[_fd];
    }
    get path() {
      return this[_path];
    }
    [_onerror](er) {
      this[_close]();
      this[_writing] = true;
      this.emit("error", er);
    }
    [_open]() {
      fs.open(this[_path], this[_flags], this[_mode], (er, fd) => this[_onopen](er, fd));
    }
    [_onopen](er, fd) {
      if (this[_defaultFlag] && this[_flags] === "r+" && er && er.code === "ENOENT") {
        this[_flags] = "w";
        this[_open]();
      } else if (er)
        this[_onerror](er);
      else {
        this[_fd] = fd;
        this.emit("open", fd);
        this[_flush]();
      }
    }
    end(buf, enc) {
      if (buf)
        this.write(buf, enc);
      this[_ended] = true;
      if (!this[_writing] && !this[_queue].length && typeof this[_fd] === "number")
        this[_onwrite](null, 0);
      return this;
    }
    write(buf, enc) {
      if (typeof buf === "string")
        buf = Buffer.from(buf, enc);
      if (this[_ended]) {
        this.emit("error", new Error("write() after end()"));
        return false;
      }
      if (this[_fd] === null || this[_writing] || this[_queue].length) {
        this[_queue].push(buf);
        this[_needDrain] = true;
        return false;
      }
      this[_writing] = true;
      this[_write](buf);
      return true;
    }
    [_write](buf) {
      fs.write(this[_fd], buf, 0, buf.length, this[_pos], (er, bw) => this[_onwrite](er, bw));
    }
    [_onwrite](er, bw) {
      if (er)
        this[_onerror](er);
      else {
        if (this[_pos] !== null)
          this[_pos] += bw;
        if (this[_queue].length)
          this[_flush]();
        else {
          this[_writing] = false;
          if (this[_ended] && !this[_finished]) {
            this[_finished] = true;
            this[_close]();
            this.emit("finish");
          } else if (this[_needDrain]) {
            this[_needDrain] = false;
            this.emit("drain");
          }
        }
      }
    }
    [_flush]() {
      if (this[_queue].length === 0) {
        if (this[_ended])
          this[_onwrite](null, 0);
      } else if (this[_queue].length === 1)
        this[_write](this[_queue].pop());
      else {
        const iovec = this[_queue];
        this[_queue] = [];
        writev(this[_fd], iovec, this[_pos], (er, bw) => this[_onwrite](er, bw));
      }
    }
    [_close]() {
      if (this[_autoClose] && typeof this[_fd] === "number") {
        const fd = this[_fd];
        this[_fd] = null;
        fs.close(fd, (er) => er ? this.emit("error", er) : this.emit("close"));
      }
    }
  }

  class WriteStreamSync extends WriteStream {
    [_open]() {
      let fd;
      if (this[_defaultFlag] && this[_flags] === "r+") {
        try {
          fd = fs.openSync(this[_path], this[_flags], this[_mode]);
        } catch (er) {
          if (er.code === "ENOENT") {
            this[_flags] = "w";
            return this[_open]();
          } else
            throw er;
        }
      } else
        fd = fs.openSync(this[_path], this[_flags], this[_mode]);
      this[_onopen](null, fd);
    }
    [_close]() {
      if (this[_autoClose] && typeof this[_fd] === "number") {
        const fd = this[_fd];
        this[_fd] = null;
        fs.closeSync(fd);
        this.emit("close");
      }
    }
    [_write](buf) {
      let threw = true;
      try {
        this[_onwrite](null, fs.writeSync(this[_fd], buf, 0, buf.length, this[_pos]));
        threw = false;
      } finally {
        if (threw)
          try {
            this[_close]();
          } catch (_) {
          }
      }
    }
  }
  exports.ReadStream = ReadStream;
  exports.ReadStreamSync = ReadStreamSync;
  exports.WriteStream = WriteStream;
  exports.WriteStreamSync = WriteStreamSync;
});

// src/bun/node_modules/tar/lib/parse.js
var require_parse = __commonJS((exports, module) => {
  var warner = require_warn_mixin();
  var Header = require_header();
  var EE = import.meta.require("events");
  var Yallist = require_yallist();
  var maxMetaEntrySize = 1024 * 1024;
  var Entry = require_read_entry();
  var Pax = require_pax();
  var zlib = require_minizlib();
  var { nextTick } = import.meta.require("process");
  var gzipHeader = Buffer.from([31, 139]);
  var STATE = Symbol("state");
  var WRITEENTRY = Symbol("writeEntry");
  var READENTRY = Symbol("readEntry");
  var NEXTENTRY = Symbol("nextEntry");
  var PROCESSENTRY = Symbol("processEntry");
  var EX = Symbol("extendedHeader");
  var GEX = Symbol("globalExtendedHeader");
  var META = Symbol("meta");
  var EMITMETA = Symbol("emitMeta");
  var BUFFER = Symbol("buffer");
  var QUEUE = Symbol("queue");
  var ENDED = Symbol("ended");
  var EMITTEDEND = Symbol("emittedEnd");
  var EMIT = Symbol("emit");
  var UNZIP = Symbol("unzip");
  var CONSUMECHUNK = Symbol("consumeChunk");
  var CONSUMECHUNKSUB = Symbol("consumeChunkSub");
  var CONSUMEBODY = Symbol("consumeBody");
  var CONSUMEMETA = Symbol("consumeMeta");
  var CONSUMEHEADER = Symbol("consumeHeader");
  var CONSUMING = Symbol("consuming");
  var BUFFERCONCAT = Symbol("bufferConcat");
  var MAYBEEND = Symbol("maybeEnd");
  var WRITING = Symbol("writing");
  var ABORTED = Symbol("aborted");
  var DONE = Symbol("onDone");
  var SAW_VALID_ENTRY = Symbol("sawValidEntry");
  var SAW_NULL_BLOCK = Symbol("sawNullBlock");
  var SAW_EOF = Symbol("sawEOF");
  var CLOSESTREAM = Symbol("closeStream");
  var noop = (_) => true;
  module.exports = warner(class Parser extends EE {
    constructor(opt) {
      opt = opt || {};
      super(opt);
      this.file = opt.file || "";
      this[SAW_VALID_ENTRY] = null;
      this.on(DONE, (_) => {
        if (this[STATE] === "begin" || this[SAW_VALID_ENTRY] === false) {
          this.warn("TAR_BAD_ARCHIVE", "Unrecognized archive format");
        }
      });
      if (opt.ondone) {
        this.on(DONE, opt.ondone);
      } else {
        this.on(DONE, (_) => {
          this.emit("prefinish");
          this.emit("finish");
          this.emit("end");
        });
      }
      this.strict = !!opt.strict;
      this.maxMetaEntrySize = opt.maxMetaEntrySize || maxMetaEntrySize;
      this.filter = typeof opt.filter === "function" ? opt.filter : noop;
      const isTBR = opt.file && (opt.file.endsWith(".tar.br") || opt.file.endsWith(".tbr"));
      this.brotli = !opt.gzip && opt.brotli !== undefined ? opt.brotli : isTBR ? undefined : false;
      this.writable = true;
      this.readable = false;
      this[QUEUE] = new Yallist;
      this[BUFFER] = null;
      this[READENTRY] = null;
      this[WRITEENTRY] = null;
      this[STATE] = "begin";
      this[META] = "";
      this[EX] = null;
      this[GEX] = null;
      this[ENDED] = false;
      this[UNZIP] = null;
      this[ABORTED] = false;
      this[SAW_NULL_BLOCK] = false;
      this[SAW_EOF] = false;
      this.on("end", () => this[CLOSESTREAM]());
      if (typeof opt.onwarn === "function") {
        this.on("warn", opt.onwarn);
      }
      if (typeof opt.onentry === "function") {
        this.on("entry", opt.onentry);
      }
    }
    [CONSUMEHEADER](chunk, position) {
      if (this[SAW_VALID_ENTRY] === null) {
        this[SAW_VALID_ENTRY] = false;
      }
      let header;
      try {
        header = new Header(chunk, position, this[EX], this[GEX]);
      } catch (er) {
        return this.warn("TAR_ENTRY_INVALID", er);
      }
      if (header.nullBlock) {
        if (this[SAW_NULL_BLOCK]) {
          this[SAW_EOF] = true;
          if (this[STATE] === "begin") {
            this[STATE] = "header";
          }
          this[EMIT]("eof");
        } else {
          this[SAW_NULL_BLOCK] = true;
          this[EMIT]("nullBlock");
        }
      } else {
        this[SAW_NULL_BLOCK] = false;
        if (!header.cksumValid) {
          this.warn("TAR_ENTRY_INVALID", "checksum failure", { header });
        } else if (!header.path) {
          this.warn("TAR_ENTRY_INVALID", "path is required", { header });
        } else {
          const type = header.type;
          if (/^(Symbolic)?Link$/.test(type) && !header.linkpath) {
            this.warn("TAR_ENTRY_INVALID", "linkpath required", { header });
          } else if (!/^(Symbolic)?Link$/.test(type) && header.linkpath) {
            this.warn("TAR_ENTRY_INVALID", "linkpath forbidden", { header });
          } else {
            const entry = this[WRITEENTRY] = new Entry(header, this[EX], this[GEX]);
            if (!this[SAW_VALID_ENTRY]) {
              if (entry.remain) {
                const onend = () => {
                  if (!entry.invalid) {
                    this[SAW_VALID_ENTRY] = true;
                  }
                };
                entry.on("end", onend);
              } else {
                this[SAW_VALID_ENTRY] = true;
              }
            }
            if (entry.meta) {
              if (entry.size > this.maxMetaEntrySize) {
                entry.ignore = true;
                this[EMIT]("ignoredEntry", entry);
                this[STATE] = "ignore";
                entry.resume();
              } else if (entry.size > 0) {
                this[META] = "";
                entry.on("data", (c) => this[META] += c);
                this[STATE] = "meta";
              }
            } else {
              this[EX] = null;
              entry.ignore = entry.ignore || !this.filter(entry.path, entry);
              if (entry.ignore) {
                this[EMIT]("ignoredEntry", entry);
                this[STATE] = entry.remain ? "ignore" : "header";
                entry.resume();
              } else {
                if (entry.remain) {
                  this[STATE] = "body";
                } else {
                  this[STATE] = "header";
                  entry.end();
                }
                if (!this[READENTRY]) {
                  this[QUEUE].push(entry);
                  this[NEXTENTRY]();
                } else {
                  this[QUEUE].push(entry);
                }
              }
            }
          }
        }
      }
    }
    [CLOSESTREAM]() {
      nextTick(() => this.emit("close"));
    }
    [PROCESSENTRY](entry) {
      let go = true;
      if (!entry) {
        this[READENTRY] = null;
        go = false;
      } else if (Array.isArray(entry)) {
        this.emit.apply(this, entry);
      } else {
        this[READENTRY] = entry;
        this.emit("entry", entry);
        if (!entry.emittedEnd) {
          entry.on("end", (_) => this[NEXTENTRY]());
          go = false;
        }
      }
      return go;
    }
    [NEXTENTRY]() {
      do {
      } while (this[PROCESSENTRY](this[QUEUE].shift()));
      if (!this[QUEUE].length) {
        const re = this[READENTRY];
        const drainNow = !re || re.flowing || re.size === re.remain;
        if (drainNow) {
          if (!this[WRITING]) {
            this.emit("drain");
          }
        } else {
          re.once("drain", (_) => this.emit("drain"));
        }
      }
    }
    [CONSUMEBODY](chunk, position) {
      const entry = this[WRITEENTRY];
      const br = entry.blockRemain;
      const c = br >= chunk.length && position === 0 ? chunk : chunk.slice(position, position + br);
      entry.write(c);
      if (!entry.blockRemain) {
        this[STATE] = "header";
        this[WRITEENTRY] = null;
        entry.end();
      }
      return c.length;
    }
    [CONSUMEMETA](chunk, position) {
      const entry = this[WRITEENTRY];
      const ret = this[CONSUMEBODY](chunk, position);
      if (!this[WRITEENTRY]) {
        this[EMITMETA](entry);
      }
      return ret;
    }
    [EMIT](ev, data, extra) {
      if (!this[QUEUE].length && !this[READENTRY]) {
        this.emit(ev, data, extra);
      } else {
        this[QUEUE].push([ev, data, extra]);
      }
    }
    [EMITMETA](entry) {
      this[EMIT]("meta", this[META]);
      switch (entry.type) {
        case "ExtendedHeader":
        case "OldExtendedHeader":
          this[EX] = Pax.parse(this[META], this[EX], false);
          break;
        case "GlobalExtendedHeader":
          this[GEX] = Pax.parse(this[META], this[GEX], true);
          break;
        case "NextFileHasLongPath":
        case "OldGnuLongPath":
          this[EX] = this[EX] || Object.create(null);
          this[EX].path = this[META].replace(/\0.*/, "");
          break;
        case "NextFileHasLongLinkpath":
          this[EX] = this[EX] || Object.create(null);
          this[EX].linkpath = this[META].replace(/\0.*/, "");
          break;
        default:
          throw new Error("unknown meta: " + entry.type);
      }
    }
    abort(error) {
      this[ABORTED] = true;
      this.emit("abort", error);
      this.warn("TAR_ABORT", error, { recoverable: false });
    }
    write(chunk) {
      if (this[ABORTED]) {
        return;
      }
      const needSniff = this[UNZIP] === null || this.brotli === undefined && this[UNZIP] === false;
      if (needSniff && chunk) {
        if (this[BUFFER]) {
          chunk = Buffer.concat([this[BUFFER], chunk]);
          this[BUFFER] = null;
        }
        if (chunk.length < gzipHeader.length) {
          this[BUFFER] = chunk;
          return true;
        }
        for (let i = 0;this[UNZIP] === null && i < gzipHeader.length; i++) {
          if (chunk[i] !== gzipHeader[i]) {
            this[UNZIP] = false;
          }
        }
        const maybeBrotli = this.brotli === undefined;
        if (this[UNZIP] === false && maybeBrotli) {
          if (chunk.length < 512) {
            if (this[ENDED]) {
              this.brotli = true;
            } else {
              this[BUFFER] = chunk;
              return true;
            }
          } else {
            try {
              new Header(chunk.slice(0, 512));
              this.brotli = false;
            } catch (_) {
              this.brotli = true;
            }
          }
        }
        if (this[UNZIP] === null || this[UNZIP] === false && this.brotli) {
          const ended = this[ENDED];
          this[ENDED] = false;
          this[UNZIP] = this[UNZIP] === null ? new zlib.Unzip : new zlib.BrotliDecompress;
          this[UNZIP].on("data", (chunk2) => this[CONSUMECHUNK](chunk2));
          this[UNZIP].on("error", (er) => this.abort(er));
          this[UNZIP].on("end", (_) => {
            this[ENDED] = true;
            this[CONSUMECHUNK]();
          });
          this[WRITING] = true;
          const ret2 = this[UNZIP][ended ? "end" : "write"](chunk);
          this[WRITING] = false;
          return ret2;
        }
      }
      this[WRITING] = true;
      if (this[UNZIP]) {
        this[UNZIP].write(chunk);
      } else {
        this[CONSUMECHUNK](chunk);
      }
      this[WRITING] = false;
      const ret = this[QUEUE].length ? false : this[READENTRY] ? this[READENTRY].flowing : true;
      if (!ret && !this[QUEUE].length) {
        this[READENTRY].once("drain", (_) => this.emit("drain"));
      }
      return ret;
    }
    [BUFFERCONCAT](c) {
      if (c && !this[ABORTED]) {
        this[BUFFER] = this[BUFFER] ? Buffer.concat([this[BUFFER], c]) : c;
      }
    }
    [MAYBEEND]() {
      if (this[ENDED] && !this[EMITTEDEND] && !this[ABORTED] && !this[CONSUMING]) {
        this[EMITTEDEND] = true;
        const entry = this[WRITEENTRY];
        if (entry && entry.blockRemain) {
          const have = this[BUFFER] ? this[BUFFER].length : 0;
          this.warn("TAR_BAD_ARCHIVE", `Truncated input (needed ${entry.blockRemain} more bytes, only ${have} available)`, { entry });
          if (this[BUFFER]) {
            entry.write(this[BUFFER]);
          }
          entry.end();
        }
        this[EMIT](DONE);
      }
    }
    [CONSUMECHUNK](chunk) {
      if (this[CONSUMING]) {
        this[BUFFERCONCAT](chunk);
      } else if (!chunk && !this[BUFFER]) {
        this[MAYBEEND]();
      } else {
        this[CONSUMING] = true;
        if (this[BUFFER]) {
          this[BUFFERCONCAT](chunk);
          const c = this[BUFFER];
          this[BUFFER] = null;
          this[CONSUMECHUNKSUB](c);
        } else {
          this[CONSUMECHUNKSUB](chunk);
        }
        while (this[BUFFER] && this[BUFFER].length >= 512 && !this[ABORTED] && !this[SAW_EOF]) {
          const c = this[BUFFER];
          this[BUFFER] = null;
          this[CONSUMECHUNKSUB](c);
        }
        this[CONSUMING] = false;
      }
      if (!this[BUFFER] || this[ENDED]) {
        this[MAYBEEND]();
      }
    }
    [CONSUMECHUNKSUB](chunk) {
      let position = 0;
      const length = chunk.length;
      while (position + 512 <= length && !this[ABORTED] && !this[SAW_EOF]) {
        switch (this[STATE]) {
          case "begin":
          case "header":
            this[CONSUMEHEADER](chunk, position);
            position += 512;
            break;
          case "ignore":
          case "body":
            position += this[CONSUMEBODY](chunk, position);
            break;
          case "meta":
            position += this[CONSUMEMETA](chunk, position);
            break;
          default:
            throw new Error("invalid state: " + this[STATE]);
        }
      }
      if (position < length) {
        if (this[BUFFER]) {
          this[BUFFER] = Buffer.concat([chunk.slice(position), this[BUFFER]]);
        } else {
          this[BUFFER] = chunk.slice(position);
        }
      }
    }
    end(chunk) {
      if (!this[ABORTED]) {
        if (this[UNZIP]) {
          this[UNZIP].end(chunk);
        } else {
          this[ENDED] = true;
          if (this.brotli === undefined)
            chunk = chunk || Buffer.alloc(0);
          this.write(chunk);
        }
      }
    }
  });
});

// src/bun/node_modules/tar/lib/list.js
var require_list = __commonJS((exports, module) => {
  var hlo = require_high_level_opt();
  var Parser = require_parse();
  var fs = import.meta.require("fs");
  var fsm = require_fs_minipass();
  var path = import.meta.require("path");
  var stripSlash = require_strip_trailing_slashes();
  module.exports = (opt_, files, cb) => {
    if (typeof opt_ === "function") {
      cb = opt_, files = null, opt_ = {};
    } else if (Array.isArray(opt_)) {
      files = opt_, opt_ = {};
    }
    if (typeof files === "function") {
      cb = files, files = null;
    }
    if (!files) {
      files = [];
    } else {
      files = Array.from(files);
    }
    const opt = hlo(opt_);
    if (opt.sync && typeof cb === "function") {
      throw new TypeError("callback not supported for sync tar functions");
    }
    if (!opt.file && typeof cb === "function") {
      throw new TypeError("callback only supported with file option");
    }
    if (files.length) {
      filesFilter(opt, files);
    }
    if (!opt.noResume) {
      onentryFunction(opt);
    }
    return opt.file && opt.sync ? listFileSync(opt) : opt.file ? listFile(opt, cb) : list(opt);
  };
  var onentryFunction = (opt) => {
    const onentry = opt.onentry;
    opt.onentry = onentry ? (e) => {
      onentry(e);
      e.resume();
    } : (e) => e.resume();
  };
  var filesFilter = (opt, files) => {
    const map = new Map(files.map((f) => [stripSlash(f), true]));
    const filter = opt.filter;
    const mapHas = (file, r) => {
      const root = r || path.parse(file).root || ".";
      const ret = file === root ? false : map.has(file) ? map.get(file) : mapHas(path.dirname(file), root);
      map.set(file, ret);
      return ret;
    };
    opt.filter = filter ? (file, entry) => filter(file, entry) && mapHas(stripSlash(file)) : (file) => mapHas(stripSlash(file));
  };
  var listFileSync = (opt) => {
    const p = list(opt);
    const file = opt.file;
    let threw = true;
    let fd;
    try {
      const stat = fs.statSync(file);
      const readSize = opt.maxReadSize || 16 * 1024 * 1024;
      if (stat.size < readSize) {
        p.end(fs.readFileSync(file));
      } else {
        let pos = 0;
        const buf = Buffer.allocUnsafe(readSize);
        fd = fs.openSync(file, "r");
        while (pos < stat.size) {
          const bytesRead = fs.readSync(fd, buf, 0, readSize, pos);
          pos += bytesRead;
          p.write(buf.slice(0, bytesRead));
        }
        p.end();
      }
      threw = false;
    } finally {
      if (threw && fd) {
        try {
          fs.closeSync(fd);
        } catch (er) {
        }
      }
    }
  };
  var listFile = (opt, cb) => {
    const parse = new Parser(opt);
    const readSize = opt.maxReadSize || 16 * 1024 * 1024;
    const file = opt.file;
    const p = new Promise((resolve, reject) => {
      parse.on("error", reject);
      parse.on("end", resolve);
      fs.stat(file, (er, stat) => {
        if (er) {
          reject(er);
        } else {
          const stream = new fsm.ReadStream(file, {
            readSize,
            size: stat.size
          });
          stream.on("error", reject);
          stream.pipe(parse);
        }
      });
    });
    return cb ? p.then(cb, cb) : p;
  };
  var list = (opt) => new Parser(opt);
});

// src/bun/node_modules/tar/lib/create.js
var require_create = __commonJS((exports, module) => {
  var hlo = require_high_level_opt();
  var Pack = require_pack();
  var fsm = require_fs_minipass();
  var t = require_list();
  var path = import.meta.require("path");
  module.exports = (opt_, files, cb) => {
    if (typeof files === "function") {
      cb = files;
    }
    if (Array.isArray(opt_)) {
      files = opt_, opt_ = {};
    }
    if (!files || !Array.isArray(files) || !files.length) {
      throw new TypeError("no files or directories specified");
    }
    files = Array.from(files);
    const opt = hlo(opt_);
    if (opt.sync && typeof cb === "function") {
      throw new TypeError("callback not supported for sync tar functions");
    }
    if (!opt.file && typeof cb === "function") {
      throw new TypeError("callback only supported with file option");
    }
    return opt.file && opt.sync ? createFileSync(opt, files) : opt.file ? createFile(opt, files, cb) : opt.sync ? createSync(opt, files) : create(opt, files);
  };
  var createFileSync = (opt, files) => {
    const p = new Pack.Sync(opt);
    const stream = new fsm.WriteStreamSync(opt.file, {
      mode: opt.mode || 438
    });
    p.pipe(stream);
    addFilesSync(p, files);
  };
  var createFile = (opt, files, cb) => {
    const p = new Pack(opt);
    const stream = new fsm.WriteStream(opt.file, {
      mode: opt.mode || 438
    });
    p.pipe(stream);
    const promise = new Promise((res, rej) => {
      stream.on("error", rej);
      stream.on("close", res);
      p.on("error", rej);
    });
    addFilesAsync(p, files);
    return cb ? promise.then(cb, cb) : promise;
  };
  var addFilesSync = (p, files) => {
    files.forEach((file) => {
      if (file.charAt(0) === "@") {
        t({
          file: path.resolve(p.cwd, file.slice(1)),
          sync: true,
          noResume: true,
          onentry: (entry) => p.add(entry)
        });
      } else {
        p.add(file);
      }
    });
    p.end();
  };
  var addFilesAsync = (p, files) => {
    while (files.length) {
      const file = files.shift();
      if (file.charAt(0) === "@") {
        return t({
          file: path.resolve(p.cwd, file.slice(1)),
          noResume: true,
          onentry: (entry) => p.add(entry)
        }).then((_) => addFilesAsync(p, files));
      } else {
        p.add(file);
      }
    }
    p.end();
  };
  var createSync = (opt, files) => {
    const p = new Pack.Sync(opt);
    addFilesSync(p, files);
    return p;
  };
  var create = (opt, files) => {
    const p = new Pack(opt);
    addFilesAsync(p, files);
    return p;
  };
});

// src/bun/node_modules/tar/lib/replace.js
var require_replace = __commonJS((exports, module) => {
  var hlo = require_high_level_opt();
  var Pack = require_pack();
  var fs = import.meta.require("fs");
  var fsm = require_fs_minipass();
  var t = require_list();
  var path = import.meta.require("path");
  var Header = require_header();
  module.exports = (opt_, files, cb) => {
    const opt = hlo(opt_);
    if (!opt.file) {
      throw new TypeError("file is required");
    }
    if (opt.gzip || opt.brotli || opt.file.endsWith(".br") || opt.file.endsWith(".tbr")) {
      throw new TypeError("cannot append to compressed archives");
    }
    if (!files || !Array.isArray(files) || !files.length) {
      throw new TypeError("no files or directories specified");
    }
    files = Array.from(files);
    return opt.sync ? replaceSync(opt, files) : replace(opt, files, cb);
  };
  var replaceSync = (opt, files) => {
    const p = new Pack.Sync(opt);
    let threw = true;
    let fd;
    let position;
    try {
      try {
        fd = fs.openSync(opt.file, "r+");
      } catch (er) {
        if (er.code === "ENOENT") {
          fd = fs.openSync(opt.file, "w+");
        } else {
          throw er;
        }
      }
      const st = fs.fstatSync(fd);
      const headBuf = Buffer.alloc(512);
      POSITION:
        for (position = 0;position < st.size; position += 512) {
          for (let bufPos = 0, bytes = 0;bufPos < 512; bufPos += bytes) {
            bytes = fs.readSync(fd, headBuf, bufPos, headBuf.length - bufPos, position + bufPos);
            if (position === 0 && headBuf[0] === 31 && headBuf[1] === 139) {
              throw new Error("cannot append to compressed archives");
            }
            if (!bytes) {
              break POSITION;
            }
          }
          const h = new Header(headBuf);
          if (!h.cksumValid) {
            break;
          }
          const entryBlockSize = 512 * Math.ceil(h.size / 512);
          if (position + entryBlockSize + 512 > st.size) {
            break;
          }
          position += entryBlockSize;
          if (opt.mtimeCache) {
            opt.mtimeCache.set(h.path, h.mtime);
          }
        }
      threw = false;
      streamSync(opt, p, position, fd, files);
    } finally {
      if (threw) {
        try {
          fs.closeSync(fd);
        } catch (er) {
        }
      }
    }
  };
  var streamSync = (opt, p, position, fd, files) => {
    const stream = new fsm.WriteStreamSync(opt.file, {
      fd,
      start: position
    });
    p.pipe(stream);
    addFilesSync(p, files);
  };
  var replace = (opt, files, cb) => {
    files = Array.from(files);
    const p = new Pack(opt);
    const getPos = (fd, size, cb_) => {
      const cb2 = (er, pos) => {
        if (er) {
          fs.close(fd, (_) => cb_(er));
        } else {
          cb_(null, pos);
        }
      };
      let position = 0;
      if (size === 0) {
        return cb2(null, 0);
      }
      let bufPos = 0;
      const headBuf = Buffer.alloc(512);
      const onread = (er, bytes) => {
        if (er) {
          return cb2(er);
        }
        bufPos += bytes;
        if (bufPos < 512 && bytes) {
          return fs.read(fd, headBuf, bufPos, headBuf.length - bufPos, position + bufPos, onread);
        }
        if (position === 0 && headBuf[0] === 31 && headBuf[1] === 139) {
          return cb2(new Error("cannot append to compressed archives"));
        }
        if (bufPos < 512) {
          return cb2(null, position);
        }
        const h = new Header(headBuf);
        if (!h.cksumValid) {
          return cb2(null, position);
        }
        const entryBlockSize = 512 * Math.ceil(h.size / 512);
        if (position + entryBlockSize + 512 > size) {
          return cb2(null, position);
        }
        position += entryBlockSize + 512;
        if (position >= size) {
          return cb2(null, position);
        }
        if (opt.mtimeCache) {
          opt.mtimeCache.set(h.path, h.mtime);
        }
        bufPos = 0;
        fs.read(fd, headBuf, 0, 512, position, onread);
      };
      fs.read(fd, headBuf, 0, 512, position, onread);
    };
    const promise = new Promise((resolve, reject) => {
      p.on("error", reject);
      let flag = "r+";
      const onopen = (er, fd) => {
        if (er && er.code === "ENOENT" && flag === "r+") {
          flag = "w+";
          return fs.open(opt.file, flag, onopen);
        }
        if (er) {
          return reject(er);
        }
        fs.fstat(fd, (er2, st) => {
          if (er2) {
            return fs.close(fd, () => reject(er2));
          }
          getPos(fd, st.size, (er3, position) => {
            if (er3) {
              return reject(er3);
            }
            const stream = new fsm.WriteStream(opt.file, {
              fd,
              start: position
            });
            p.pipe(stream);
            stream.on("error", reject);
            stream.on("close", resolve);
            addFilesAsync(p, files);
          });
        });
      };
      fs.open(opt.file, flag, onopen);
    });
    return cb ? promise.then(cb, cb) : promise;
  };
  var addFilesSync = (p, files) => {
    files.forEach((file) => {
      if (file.charAt(0) === "@") {
        t({
          file: path.resolve(p.cwd, file.slice(1)),
          sync: true,
          noResume: true,
          onentry: (entry) => p.add(entry)
        });
      } else {
        p.add(file);
      }
    });
    p.end();
  };
  var addFilesAsync = (p, files) => {
    while (files.length) {
      const file = files.shift();
      if (file.charAt(0) === "@") {
        return t({
          file: path.resolve(p.cwd, file.slice(1)),
          noResume: true,
          onentry: (entry) => p.add(entry)
        }).then((_) => addFilesAsync(p, files));
      } else {
        p.add(file);
      }
    }
    p.end();
  };
});

// src/bun/node_modules/tar/lib/update.js
var require_update = __commonJS((exports, module) => {
  var hlo = require_high_level_opt();
  var r = require_replace();
  module.exports = (opt_, files, cb) => {
    const opt = hlo(opt_);
    if (!opt.file) {
      throw new TypeError("file is required");
    }
    if (opt.gzip || opt.brotli || opt.file.endsWith(".br") || opt.file.endsWith(".tbr")) {
      throw new TypeError("cannot append to compressed archives");
    }
    if (!files || !Array.isArray(files) || !files.length) {
      throw new TypeError("no files or directories specified");
    }
    files = Array.from(files);
    mtimeFilter(opt);
    return r(opt, files, cb);
  };
  var mtimeFilter = (opt) => {
    const filter = opt.filter;
    if (!opt.mtimeCache) {
      opt.mtimeCache = new Map;
    }
    opt.filter = filter ? (path, stat) => filter(path, stat) && !(opt.mtimeCache.get(path) > stat.mtime) : (path, stat) => !(opt.mtimeCache.get(path) > stat.mtime);
  };
});

// src/bun/node_modules/mkdirp/lib/opts-arg.js
var require_opts_arg = __commonJS((exports, module) => {
  var { promisify } = import.meta.require("util");
  var fs = import.meta.require("fs");
  var optsArg = (opts) => {
    if (!opts)
      opts = { mode: 511, fs };
    else if (typeof opts === "object")
      opts = { mode: 511, fs, ...opts };
    else if (typeof opts === "number")
      opts = { mode: opts, fs };
    else if (typeof opts === "string")
      opts = { mode: parseInt(opts, 8), fs };
    else
      throw new TypeError("invalid options argument");
    opts.mkdir = opts.mkdir || opts.fs.mkdir || fs.mkdir;
    opts.mkdirAsync = promisify(opts.mkdir);
    opts.stat = opts.stat || opts.fs.stat || fs.stat;
    opts.statAsync = promisify(opts.stat);
    opts.statSync = opts.statSync || opts.fs.statSync || fs.statSync;
    opts.mkdirSync = opts.mkdirSync || opts.fs.mkdirSync || fs.mkdirSync;
    return opts;
  };
  module.exports = optsArg;
});

// src/bun/node_modules/mkdirp/lib/path-arg.js
var require_path_arg = __commonJS((exports, module) => {
  var platform = process.env.__TESTING_MKDIRP_PLATFORM__ || process.platform;
  var { resolve, parse } = import.meta.require("path");
  var pathArg = (path) => {
    if (/\0/.test(path)) {
      throw Object.assign(new TypeError("path must be a string without null bytes"), {
        path,
        code: "ERR_INVALID_ARG_VALUE"
      });
    }
    path = resolve(path);
    if (platform === "win32") {
      const badWinChars = /[*|"<>?:]/;
      const { root } = parse(path);
      if (badWinChars.test(path.substr(root.length))) {
        throw Object.assign(new Error("Illegal characters in path."), {
          path,
          code: "EINVAL"
        });
      }
    }
    return path;
  };
  module.exports = pathArg;
});

// src/bun/node_modules/mkdirp/lib/find-made.js
var require_find_made = __commonJS((exports, module) => {
  var { dirname } = import.meta.require("path");
  var findMade = (opts, parent, path = undefined) => {
    if (path === parent)
      return Promise.resolve();
    return opts.statAsync(parent).then((st) => st.isDirectory() ? path : undefined, (er) => er.code === "ENOENT" ? findMade(opts, dirname(parent), parent) : undefined);
  };
  var findMadeSync = (opts, parent, path = undefined) => {
    if (path === parent)
      return;
    try {
      return opts.statSync(parent).isDirectory() ? path : undefined;
    } catch (er) {
      return er.code === "ENOENT" ? findMadeSync(opts, dirname(parent), parent) : undefined;
    }
  };
  module.exports = { findMade, findMadeSync };
});

// src/bun/node_modules/mkdirp/lib/mkdirp-manual.js
var require_mkdirp_manual = __commonJS((exports, module) => {
  var { dirname } = import.meta.require("path");
  var mkdirpManual = (path, opts, made) => {
    opts.recursive = false;
    const parent = dirname(path);
    if (parent === path) {
      return opts.mkdirAsync(path, opts).catch((er) => {
        if (er.code !== "EISDIR")
          throw er;
      });
    }
    return opts.mkdirAsync(path, opts).then(() => made || path, (er) => {
      if (er.code === "ENOENT")
        return mkdirpManual(parent, opts).then((made2) => mkdirpManual(path, opts, made2));
      if (er.code !== "EEXIST" && er.code !== "EROFS")
        throw er;
      return opts.statAsync(path).then((st) => {
        if (st.isDirectory())
          return made;
        else
          throw er;
      }, () => {
        throw er;
      });
    });
  };
  var mkdirpManualSync = (path, opts, made) => {
    const parent = dirname(path);
    opts.recursive = false;
    if (parent === path) {
      try {
        return opts.mkdirSync(path, opts);
      } catch (er) {
        if (er.code !== "EISDIR")
          throw er;
        else
          return;
      }
    }
    try {
      opts.mkdirSync(path, opts);
      return made || path;
    } catch (er) {
      if (er.code === "ENOENT")
        return mkdirpManualSync(path, opts, mkdirpManualSync(parent, opts, made));
      if (er.code !== "EEXIST" && er.code !== "EROFS")
        throw er;
      try {
        if (!opts.statSync(path).isDirectory())
          throw er;
      } catch (_) {
        throw er;
      }
    }
  };
  module.exports = { mkdirpManual, mkdirpManualSync };
});

// src/bun/node_modules/mkdirp/lib/mkdirp-native.js
var require_mkdirp_native = __commonJS((exports, module) => {
  var { dirname } = import.meta.require("path");
  var { findMade, findMadeSync } = require_find_made();
  var { mkdirpManual, mkdirpManualSync } = require_mkdirp_manual();
  var mkdirpNative = (path, opts) => {
    opts.recursive = true;
    const parent = dirname(path);
    if (parent === path)
      return opts.mkdirAsync(path, opts);
    return findMade(opts, path).then((made) => opts.mkdirAsync(path, opts).then(() => made).catch((er) => {
      if (er.code === "ENOENT")
        return mkdirpManual(path, opts);
      else
        throw er;
    }));
  };
  var mkdirpNativeSync = (path, opts) => {
    opts.recursive = true;
    const parent = dirname(path);
    if (parent === path)
      return opts.mkdirSync(path, opts);
    const made = findMadeSync(opts, path);
    try {
      opts.mkdirSync(path, opts);
      return made;
    } catch (er) {
      if (er.code === "ENOENT")
        return mkdirpManualSync(path, opts);
      else
        throw er;
    }
  };
  module.exports = { mkdirpNative, mkdirpNativeSync };
});

// src/bun/node_modules/mkdirp/lib/use-native.js
var require_use_native = __commonJS((exports, module) => {
  var fs = import.meta.require("fs");
  var version = process.env.__TESTING_MKDIRP_NODE_VERSION__ || process.version;
  var versArr = version.replace(/^v/, "").split(".");
  var hasNative = +versArr[0] > 10 || +versArr[0] === 10 && +versArr[1] >= 12;
  var useNative = !hasNative ? () => false : (opts) => opts.mkdir === fs.mkdir;
  var useNativeSync = !hasNative ? () => false : (opts) => opts.mkdirSync === fs.mkdirSync;
  module.exports = { useNative, useNativeSync };
});

// src/bun/node_modules/mkdirp/index.js
var require_mkdirp = __commonJS((exports, module) => {
  var optsArg = require_opts_arg();
  var pathArg = require_path_arg();
  var { mkdirpNative, mkdirpNativeSync } = require_mkdirp_native();
  var { mkdirpManual, mkdirpManualSync } = require_mkdirp_manual();
  var { useNative, useNativeSync } = require_use_native();
  var mkdirp = (path, opts) => {
    path = pathArg(path);
    opts = optsArg(opts);
    return useNative(opts) ? mkdirpNative(path, opts) : mkdirpManual(path, opts);
  };
  var mkdirpSync = (path, opts) => {
    path = pathArg(path);
    opts = optsArg(opts);
    return useNativeSync(opts) ? mkdirpNativeSync(path, opts) : mkdirpManualSync(path, opts);
  };
  mkdirp.sync = mkdirpSync;
  mkdirp.native = (path, opts) => mkdirpNative(pathArg(path), optsArg(opts));
  mkdirp.manual = (path, opts) => mkdirpManual(pathArg(path), optsArg(opts));
  mkdirp.nativeSync = (path, opts) => mkdirpNativeSync(pathArg(path), optsArg(opts));
  mkdirp.manualSync = (path, opts) => mkdirpManualSync(pathArg(path), optsArg(opts));
  module.exports = mkdirp;
});

// src/bun/node_modules/chownr/chownr.js
var require_chownr = __commonJS((exports, module) => {
  var fs = import.meta.require("fs");
  var path = import.meta.require("path");
  var LCHOWN = fs.lchown ? "lchown" : "chown";
  var LCHOWNSYNC = fs.lchownSync ? "lchownSync" : "chownSync";
  var needEISDIRHandled = fs.lchown && !process.version.match(/v1[1-9]+\./) && !process.version.match(/v10\.[6-9]/);
  var lchownSync = (path2, uid, gid) => {
    try {
      return fs[LCHOWNSYNC](path2, uid, gid);
    } catch (er) {
      if (er.code !== "ENOENT")
        throw er;
    }
  };
  var chownSync = (path2, uid, gid) => {
    try {
      return fs.chownSync(path2, uid, gid);
    } catch (er) {
      if (er.code !== "ENOENT")
        throw er;
    }
  };
  var handleEISDIR = needEISDIRHandled ? (path2, uid, gid, cb) => (er) => {
    if (!er || er.code !== "EISDIR")
      cb(er);
    else
      fs.chown(path2, uid, gid, cb);
  } : (_, __, ___, cb) => cb;
  var handleEISDirSync = needEISDIRHandled ? (path2, uid, gid) => {
    try {
      return lchownSync(path2, uid, gid);
    } catch (er) {
      if (er.code !== "EISDIR")
        throw er;
      chownSync(path2, uid, gid);
    }
  } : (path2, uid, gid) => lchownSync(path2, uid, gid);
  var nodeVersion = process.version;
  var readdir = (path2, options, cb) => fs.readdir(path2, options, cb);
  var readdirSync = (path2, options) => fs.readdirSync(path2, options);
  if (/^v4\./.test(nodeVersion))
    readdir = (path2, options, cb) => fs.readdir(path2, cb);
  var chown = (cpath, uid, gid, cb) => {
    fs[LCHOWN](cpath, uid, gid, handleEISDIR(cpath, uid, gid, (er) => {
      cb(er && er.code !== "ENOENT" ? er : null);
    }));
  };
  var chownrKid = (p, child, uid, gid, cb) => {
    if (typeof child === "string")
      return fs.lstat(path.resolve(p, child), (er, stats) => {
        if (er)
          return cb(er.code !== "ENOENT" ? er : null);
        stats.name = child;
        chownrKid(p, stats, uid, gid, cb);
      });
    if (child.isDirectory()) {
      chownr(path.resolve(p, child.name), uid, gid, (er) => {
        if (er)
          return cb(er);
        const cpath = path.resolve(p, child.name);
        chown(cpath, uid, gid, cb);
      });
    } else {
      const cpath = path.resolve(p, child.name);
      chown(cpath, uid, gid, cb);
    }
  };
  var chownr = (p, uid, gid, cb) => {
    readdir(p, { withFileTypes: true }, (er, children) => {
      if (er) {
        if (er.code === "ENOENT")
          return cb();
        else if (er.code !== "ENOTDIR" && er.code !== "ENOTSUP")
          return cb(er);
      }
      if (er || !children.length)
        return chown(p, uid, gid, cb);
      let len = children.length;
      let errState = null;
      const then = (er2) => {
        if (errState)
          return;
        if (er2)
          return cb(errState = er2);
        if (--len === 0)
          return chown(p, uid, gid, cb);
      };
      children.forEach((child) => chownrKid(p, child, uid, gid, then));
    });
  };
  var chownrKidSync = (p, child, uid, gid) => {
    if (typeof child === "string") {
      try {
        const stats = fs.lstatSync(path.resolve(p, child));
        stats.name = child;
        child = stats;
      } catch (er) {
        if (er.code === "ENOENT")
          return;
        else
          throw er;
      }
    }
    if (child.isDirectory())
      chownrSync(path.resolve(p, child.name), uid, gid);
    handleEISDirSync(path.resolve(p, child.name), uid, gid);
  };
  var chownrSync = (p, uid, gid) => {
    let children;
    try {
      children = readdirSync(p, { withFileTypes: true });
    } catch (er) {
      if (er.code === "ENOENT")
        return;
      else if (er.code === "ENOTDIR" || er.code === "ENOTSUP")
        return handleEISDirSync(p, uid, gid);
      else
        throw er;
    }
    if (children && children.length)
      children.forEach((child) => chownrKidSync(p, child, uid, gid));
    return handleEISDirSync(p, uid, gid);
  };
  module.exports = chownr;
  chownr.sync = chownrSync;
});

// src/bun/node_modules/tar/lib/mkdir.js
var require_mkdir = __commonJS((exports, module) => {
  var mkdirp = require_mkdirp();
  var fs = import.meta.require("fs");
  var path = import.meta.require("path");
  var chownr = require_chownr();
  var normPath = require_normalize_windows_path();

  class SymlinkError extends Error {
    constructor(symlink, path2) {
      super("Cannot extract through symbolic link");
      this.path = path2;
      this.symlink = symlink;
    }
    get name() {
      return "SylinkError";
    }
  }

  class CwdError extends Error {
    constructor(path2, code) {
      super(code + ": Cannot cd into \'" + path2 + "\'");
      this.path = path2;
      this.code = code;
    }
    get name() {
      return "CwdError";
    }
  }
  var cGet = (cache, key) => cache.get(normPath(key));
  var cSet = (cache, key, val) => cache.set(normPath(key), val);
  var checkCwd = (dir, cb) => {
    fs.stat(dir, (er, st) => {
      if (er || !st.isDirectory()) {
        er = new CwdError(dir, er && er.code || "ENOTDIR");
      }
      cb(er);
    });
  };
  module.exports = (dir, opt, cb) => {
    dir = normPath(dir);
    const umask = opt.umask;
    const mode = opt.mode | 448;
    const needChmod = (mode & umask) !== 0;
    const uid = opt.uid;
    const gid = opt.gid;
    const doChown = typeof uid === "number" && typeof gid === "number" && (uid !== opt.processUid || gid !== opt.processGid);
    const preserve = opt.preserve;
    const unlink = opt.unlink;
    const cache = opt.cache;
    const cwd = normPath(opt.cwd);
    const done = (er, created) => {
      if (er) {
        cb(er);
      } else {
        cSet(cache, dir, true);
        if (created && doChown) {
          chownr(created, uid, gid, (er2) => done(er2));
        } else if (needChmod) {
          fs.chmod(dir, mode, cb);
        } else {
          cb();
        }
      }
    };
    if (cache && cGet(cache, dir) === true) {
      return done();
    }
    if (dir === cwd) {
      return checkCwd(dir, done);
    }
    if (preserve) {
      return mkdirp(dir, { mode }).then((made) => done(null, made), done);
    }
    const sub = normPath(path.relative(cwd, dir));
    const parts = sub.split("/");
    mkdir_(cwd, parts, mode, cache, unlink, cwd, null, done);
  };
  var mkdir_ = (base, parts, mode, cache, unlink, cwd, created, cb) => {
    if (!parts.length) {
      return cb(null, created);
    }
    const p = parts.shift();
    const part = normPath(path.resolve(base + "/" + p));
    if (cGet(cache, part)) {
      return mkdir_(part, parts, mode, cache, unlink, cwd, created, cb);
    }
    fs.mkdir(part, mode, onmkdir(part, parts, mode, cache, unlink, cwd, created, cb));
  };
  var onmkdir = (part, parts, mode, cache, unlink, cwd, created, cb) => (er) => {
    if (er) {
      fs.lstat(part, (statEr, st) => {
        if (statEr) {
          statEr.path = statEr.path && normPath(statEr.path);
          cb(statEr);
        } else if (st.isDirectory()) {
          mkdir_(part, parts, mode, cache, unlink, cwd, created, cb);
        } else if (unlink) {
          fs.unlink(part, (er2) => {
            if (er2) {
              return cb(er2);
            }
            fs.mkdir(part, mode, onmkdir(part, parts, mode, cache, unlink, cwd, created, cb));
          });
        } else if (st.isSymbolicLink()) {
          return cb(new SymlinkError(part, part + "/" + parts.join("/")));
        } else {
          cb(er);
        }
      });
    } else {
      created = created || part;
      mkdir_(part, parts, mode, cache, unlink, cwd, created, cb);
    }
  };
  var checkCwdSync = (dir) => {
    let ok = false;
    let code = "ENOTDIR";
    try {
      ok = fs.statSync(dir).isDirectory();
    } catch (er) {
      code = er.code;
    } finally {
      if (!ok) {
        throw new CwdError(dir, code);
      }
    }
  };
  module.exports.sync = (dir, opt) => {
    dir = normPath(dir);
    const umask = opt.umask;
    const mode = opt.mode | 448;
    const needChmod = (mode & umask) !== 0;
    const uid = opt.uid;
    const gid = opt.gid;
    const doChown = typeof uid === "number" && typeof gid === "number" && (uid !== opt.processUid || gid !== opt.processGid);
    const preserve = opt.preserve;
    const unlink = opt.unlink;
    const cache = opt.cache;
    const cwd = normPath(opt.cwd);
    const done = (created2) => {
      cSet(cache, dir, true);
      if (created2 && doChown) {
        chownr.sync(created2, uid, gid);
      }
      if (needChmod) {
        fs.chmodSync(dir, mode);
      }
    };
    if (cache && cGet(cache, dir) === true) {
      return done();
    }
    if (dir === cwd) {
      checkCwdSync(cwd);
      return done();
    }
    if (preserve) {
      return done(mkdirp.sync(dir, mode));
    }
    const sub = normPath(path.relative(cwd, dir));
    const parts = sub.split("/");
    let created = null;
    for (let p = parts.shift(), part = cwd;p && (part += "/" + p); p = parts.shift()) {
      part = normPath(path.resolve(part));
      if (cGet(cache, part)) {
        continue;
      }
      try {
        fs.mkdirSync(part, mode);
        created = created || part;
        cSet(cache, part, true);
      } catch (er) {
        const st = fs.lstatSync(part);
        if (st.isDirectory()) {
          cSet(cache, part, true);
          continue;
        } else if (unlink) {
          fs.unlinkSync(part);
          fs.mkdirSync(part, mode);
          created = created || part;
          cSet(cache, part, true);
          continue;
        } else if (st.isSymbolicLink()) {
          return new SymlinkError(part, part + "/" + parts.join("/"));
        }
      }
    }
    return done(created);
  };
});

// src/bun/node_modules/tar/lib/normalize-unicode.js
var require_normalize_unicode = __commonJS((exports, module) => {
  var normalizeCache = Object.create(null);
  var { hasOwnProperty } = Object.prototype;
  module.exports = (s) => {
    if (!hasOwnProperty.call(normalizeCache, s)) {
      normalizeCache[s] = s.normalize("NFD");
    }
    return normalizeCache[s];
  };
});

// src/bun/node_modules/tar/lib/path-reservations.js
var require_path_reservations = __commonJS((exports, module) => {
  var assert = import.meta.require("assert");
  var normalize = require_normalize_unicode();
  var stripSlashes = require_strip_trailing_slashes();
  var { join } = import.meta.require("path");
  var platform = process.env.TESTING_TAR_FAKE_PLATFORM || process.platform;
  var isWindows = platform === "win32";
  module.exports = () => {
    const queues = new Map;
    const reservations = new Map;
    const getDirs = (path) => {
      const dirs = path.split("/").slice(0, -1).reduce((set, path2) => {
        if (set.length) {
          path2 = join(set[set.length - 1], path2);
        }
        set.push(path2 || "/");
        return set;
      }, []);
      return dirs;
    };
    const running = new Set;
    const getQueues = (fn) => {
      const res = reservations.get(fn);
      if (!res) {
        throw new Error("function does not have any path reservations");
      }
      return {
        paths: res.paths.map((path) => queues.get(path)),
        dirs: [...res.dirs].map((path) => queues.get(path))
      };
    };
    const check = (fn) => {
      const { paths, dirs } = getQueues(fn);
      return paths.every((q) => q[0] === fn) && dirs.every((q) => q[0] instanceof Set && q[0].has(fn));
    };
    const run = (fn) => {
      if (running.has(fn) || !check(fn)) {
        return false;
      }
      running.add(fn);
      fn(() => clear(fn));
      return true;
    };
    const clear = (fn) => {
      if (!running.has(fn)) {
        return false;
      }
      const { paths, dirs } = reservations.get(fn);
      const next = new Set;
      paths.forEach((path) => {
        const q = queues.get(path);
        assert.equal(q[0], fn);
        if (q.length === 1) {
          queues.delete(path);
        } else {
          q.shift();
          if (typeof q[0] === "function") {
            next.add(q[0]);
          } else {
            q[0].forEach((fn2) => next.add(fn2));
          }
        }
      });
      dirs.forEach((dir) => {
        const q = queues.get(dir);
        assert(q[0] instanceof Set);
        if (q[0].size === 1 && q.length === 1) {
          queues.delete(dir);
        } else if (q[0].size === 1) {
          q.shift();
          next.add(q[0]);
        } else {
          q[0].delete(fn);
        }
      });
      running.delete(fn);
      next.forEach((fn2) => run(fn2));
      return true;
    };
    const reserve = (paths, fn) => {
      paths = isWindows ? ["win32 parallelization disabled"] : paths.map((p) => {
        return stripSlashes(join(normalize(p))).toLowerCase();
      });
      const dirs = new Set(paths.map((path) => getDirs(path)).reduce((a, b) => a.concat(b)));
      reservations.set(fn, { dirs, paths });
      paths.forEach((path) => {
        const q = queues.get(path);
        if (!q) {
          queues.set(path, [fn]);
        } else {
          q.push(fn);
        }
      });
      dirs.forEach((dir) => {
        const q = queues.get(dir);
        if (!q) {
          queues.set(dir, [new Set([fn])]);
        } else if (q[q.length - 1] instanceof Set) {
          q[q.length - 1].add(fn);
        } else {
          q.push(new Set([fn]));
        }
      });
      return run(fn);
    };
    return { check, reserve };
  };
});

// src/bun/node_modules/tar/lib/get-write-flag.js
var require_get_write_flag = __commonJS((exports, module) => {
  var platform = process.env.__FAKE_PLATFORM__ || process.platform;
  var isWindows = platform === "win32";
  var fs = global.__FAKE_TESTING_FS__ || import.meta.require("fs");
  var { O_CREAT, O_TRUNC, O_WRONLY, UV_FS_O_FILEMAP = 0 } = fs.constants;
  var fMapEnabled = isWindows && !!UV_FS_O_FILEMAP;
  var fMapLimit = 512 * 1024;
  var fMapFlag = UV_FS_O_FILEMAP | O_TRUNC | O_CREAT | O_WRONLY;
  module.exports = !fMapEnabled ? () => "w" : (size) => size < fMapLimit ? fMapFlag : "w";
});

// src/bun/node_modules/tar/lib/unpack.js
var require_unpack = __commonJS((exports, module) => {
  var assert = import.meta.require("assert");
  var Parser = require_parse();
  var fs = import.meta.require("fs");
  var fsm = require_fs_minipass();
  var path = import.meta.require("path");
  var mkdir = require_mkdir();
  var wc = require_winchars();
  var pathReservations = require_path_reservations();
  var stripAbsolutePath = require_strip_absolute_path();
  var normPath = require_normalize_windows_path();
  var stripSlash = require_strip_trailing_slashes();
  var normalize = require_normalize_unicode();
  var ONENTRY = Symbol("onEntry");
  var CHECKFS = Symbol("checkFs");
  var CHECKFS2 = Symbol("checkFs2");
  var PRUNECACHE = Symbol("pruneCache");
  var ISREUSABLE = Symbol("isReusable");
  var MAKEFS = Symbol("makeFs");
  var FILE = Symbol("file");
  var DIRECTORY = Symbol("directory");
  var LINK = Symbol("link");
  var SYMLINK = Symbol("symlink");
  var HARDLINK = Symbol("hardlink");
  var UNSUPPORTED = Symbol("unsupported");
  var CHECKPATH = Symbol("checkPath");
  var MKDIR = Symbol("mkdir");
  var ONERROR = Symbol("onError");
  var PENDING = Symbol("pending");
  var PEND = Symbol("pend");
  var UNPEND = Symbol("unpend");
  var ENDED = Symbol("ended");
  var MAYBECLOSE = Symbol("maybeClose");
  var SKIP = Symbol("skip");
  var DOCHOWN = Symbol("doChown");
  var UID = Symbol("uid");
  var GID = Symbol("gid");
  var CHECKED_CWD = Symbol("checkedCwd");
  var crypto = import.meta.require("crypto");
  var getFlag = require_get_write_flag();
  var platform = process.env.TESTING_TAR_FAKE_PLATFORM || process.platform;
  var isWindows = platform === "win32";
  var DEFAULT_MAX_DEPTH = 1024;
  var unlinkFile = (path2, cb) => {
    if (!isWindows) {
      return fs.unlink(path2, cb);
    }
    const name = path2 + ".DELETE." + crypto.randomBytes(16).toString("hex");
    fs.rename(path2, name, (er) => {
      if (er) {
        return cb(er);
      }
      fs.unlink(name, cb);
    });
  };
  var unlinkFileSync = (path2) => {
    if (!isWindows) {
      return fs.unlinkSync(path2);
    }
    const name = path2 + ".DELETE." + crypto.randomBytes(16).toString("hex");
    fs.renameSync(path2, name);
    fs.unlinkSync(name);
  };
  var uint32 = (a, b, c) => a === a >>> 0 ? a : b === b >>> 0 ? b : c;
  var cacheKeyNormalize = (path2) => stripSlash(normPath(normalize(path2))).toLowerCase();
  var pruneCache = (cache, abs) => {
    abs = cacheKeyNormalize(abs);
    for (const path2 of cache.keys()) {
      const pnorm = cacheKeyNormalize(path2);
      if (pnorm === abs || pnorm.indexOf(abs + "/") === 0) {
        cache.delete(path2);
      }
    }
  };
  var dropCache = (cache) => {
    for (const key of cache.keys()) {
      cache.delete(key);
    }
  };

  class Unpack extends Parser {
    constructor(opt) {
      if (!opt) {
        opt = {};
      }
      opt.ondone = (_) => {
        this[ENDED] = true;
        this[MAYBECLOSE]();
      };
      super(opt);
      this[CHECKED_CWD] = false;
      this.reservations = pathReservations();
      this.transform = typeof opt.transform === "function" ? opt.transform : null;
      this.writable = true;
      this.readable = false;
      this[PENDING] = 0;
      this[ENDED] = false;
      this.dirCache = opt.dirCache || new Map;
      if (typeof opt.uid === "number" || typeof opt.gid === "number") {
        if (typeof opt.uid !== "number" || typeof opt.gid !== "number") {
          throw new TypeError("cannot set owner without number uid and gid");
        }
        if (opt.preserveOwner) {
          throw new TypeError("cannot preserve owner in archive and also set owner explicitly");
        }
        this.uid = opt.uid;
        this.gid = opt.gid;
        this.setOwner = true;
      } else {
        this.uid = null;
        this.gid = null;
        this.setOwner = false;
      }
      if (opt.preserveOwner === undefined && typeof opt.uid !== "number") {
        this.preserveOwner = process.getuid && process.getuid() === 0;
      } else {
        this.preserveOwner = !!opt.preserveOwner;
      }
      this.processUid = (this.preserveOwner || this.setOwner) && process.getuid ? process.getuid() : null;
      this.processGid = (this.preserveOwner || this.setOwner) && process.getgid ? process.getgid() : null;
      this.maxDepth = typeof opt.maxDepth === "number" ? opt.maxDepth : DEFAULT_MAX_DEPTH;
      this.forceChown = opt.forceChown === true;
      this.win32 = !!opt.win32 || isWindows;
      this.newer = !!opt.newer;
      this.keep = !!opt.keep;
      this.noMtime = !!opt.noMtime;
      this.preservePaths = !!opt.preservePaths;
      this.unlink = !!opt.unlink;
      this.cwd = normPath(path.resolve(opt.cwd || process.cwd()));
      this.strip = +opt.strip || 0;
      this.processUmask = opt.noChmod ? 0 : process.umask();
      this.umask = typeof opt.umask === "number" ? opt.umask : this.processUmask;
      this.dmode = opt.dmode || 511 & ~this.umask;
      this.fmode = opt.fmode || 438 & ~this.umask;
      this.on("entry", (entry) => this[ONENTRY](entry));
    }
    warn(code, msg, data = {}) {
      if (code === "TAR_BAD_ARCHIVE" || code === "TAR_ABORT") {
        data.recoverable = false;
      }
      return super.warn(code, msg, data);
    }
    [MAYBECLOSE]() {
      if (this[ENDED] && this[PENDING] === 0) {
        this.emit("prefinish");
        this.emit("finish");
        this.emit("end");
      }
    }
    [CHECKPATH](entry) {
      const p = normPath(entry.path);
      const parts = p.split("/");
      if (this.strip) {
        if (parts.length < this.strip) {
          return false;
        }
        if (entry.type === "Link") {
          const linkparts = normPath(entry.linkpath).split("/");
          if (linkparts.length >= this.strip) {
            entry.linkpath = linkparts.slice(this.strip).join("/");
          } else {
            return false;
          }
        }
        parts.splice(0, this.strip);
        entry.path = parts.join("/");
      }
      if (isFinite(this.maxDepth) && parts.length > this.maxDepth) {
        this.warn("TAR_ENTRY_ERROR", "path excessively deep", {
          entry,
          path: p,
          depth: parts.length,
          maxDepth: this.maxDepth
        });
        return false;
      }
      if (!this.preservePaths) {
        if (parts.includes("..") || isWindows && /^[a-z]:\.\.$/i.test(parts[0])) {
          this.warn("TAR_ENTRY_ERROR", `path contains '..'`, {
            entry,
            path: p
          });
          return false;
        }
        const [root, stripped] = stripAbsolutePath(p);
        if (root) {
          entry.path = stripped;
          this.warn("TAR_ENTRY_INFO", `stripping ${root} from absolute path`, {
            entry,
            path: p
          });
        }
      }
      if (path.isAbsolute(entry.path)) {
        entry.absolute = normPath(path.resolve(entry.path));
      } else {
        entry.absolute = normPath(path.resolve(this.cwd, entry.path));
      }
      if (!this.preservePaths && entry.absolute.indexOf(this.cwd + "/") !== 0 && entry.absolute !== this.cwd) {
        this.warn("TAR_ENTRY_ERROR", "path escaped extraction target", {
          entry,
          path: normPath(entry.path),
          resolvedPath: entry.absolute,
          cwd: this.cwd
        });
        return false;
      }
      if (entry.absolute === this.cwd && entry.type !== "Directory" && entry.type !== "GNUDumpDir") {
        return false;
      }
      if (this.win32) {
        const { root: aRoot } = path.win32.parse(entry.absolute);
        entry.absolute = aRoot + wc.encode(entry.absolute.slice(aRoot.length));
        const { root: pRoot } = path.win32.parse(entry.path);
        entry.path = pRoot + wc.encode(entry.path.slice(pRoot.length));
      }
      return true;
    }
    [ONENTRY](entry) {
      if (!this[CHECKPATH](entry)) {
        return entry.resume();
      }
      assert.equal(typeof entry.absolute, "string");
      switch (entry.type) {
        case "Directory":
        case "GNUDumpDir":
          if (entry.mode) {
            entry.mode = entry.mode | 448;
          }
        case "File":
        case "OldFile":
        case "ContiguousFile":
        case "Link":
        case "SymbolicLink":
          return this[CHECKFS](entry);
        case "CharacterDevice":
        case "BlockDevice":
        case "FIFO":
        default:
          return this[UNSUPPORTED](entry);
      }
    }
    [ONERROR](er, entry) {
      if (er.name === "CwdError") {
        this.emit("error", er);
      } else {
        this.warn("TAR_ENTRY_ERROR", er, { entry });
        this[UNPEND]();
        entry.resume();
      }
    }
    [MKDIR](dir, mode, cb) {
      mkdir(normPath(dir), {
        uid: this.uid,
        gid: this.gid,
        processUid: this.processUid,
        processGid: this.processGid,
        umask: this.processUmask,
        preserve: this.preservePaths,
        unlink: this.unlink,
        cache: this.dirCache,
        cwd: this.cwd,
        mode,
        noChmod: this.noChmod
      }, cb);
    }
    [DOCHOWN](entry) {
      return this.forceChown || this.preserveOwner && (typeof entry.uid === "number" && entry.uid !== this.processUid || typeof entry.gid === "number" && entry.gid !== this.processGid) || (typeof this.uid === "number" && this.uid !== this.processUid || typeof this.gid === "number" && this.gid !== this.processGid);
    }
    [UID](entry) {
      return uint32(this.uid, entry.uid, this.processUid);
    }
    [GID](entry) {
      return uint32(this.gid, entry.gid, this.processGid);
    }
    [FILE](entry, fullyDone) {
      const mode = entry.mode & 4095 || this.fmode;
      const stream = new fsm.WriteStream(entry.absolute, {
        flags: getFlag(entry.size),
        mode,
        autoClose: false
      });
      stream.on("error", (er) => {
        if (stream.fd) {
          fs.close(stream.fd, () => {
          });
        }
        stream.write = () => true;
        this[ONERROR](er, entry);
        fullyDone();
      });
      let actions = 1;
      const done = (er) => {
        if (er) {
          if (stream.fd) {
            fs.close(stream.fd, () => {
            });
          }
          this[ONERROR](er, entry);
          fullyDone();
          return;
        }
        if (--actions === 0) {
          fs.close(stream.fd, (er2) => {
            if (er2) {
              this[ONERROR](er2, entry);
            } else {
              this[UNPEND]();
            }
            fullyDone();
          });
        }
      };
      stream.on("finish", (_) => {
        const abs = entry.absolute;
        const fd = stream.fd;
        if (entry.mtime && !this.noMtime) {
          actions++;
          const atime = entry.atime || new Date;
          const mtime = entry.mtime;
          fs.futimes(fd, atime, mtime, (er) => er ? fs.utimes(abs, atime, mtime, (er2) => done(er2 && er)) : done());
        }
        if (this[DOCHOWN](entry)) {
          actions++;
          const uid = this[UID](entry);
          const gid = this[GID](entry);
          fs.fchown(fd, uid, gid, (er) => er ? fs.chown(abs, uid, gid, (er2) => done(er2 && er)) : done());
        }
        done();
      });
      const tx = this.transform ? this.transform(entry) || entry : entry;
      if (tx !== entry) {
        tx.on("error", (er) => {
          this[ONERROR](er, entry);
          fullyDone();
        });
        entry.pipe(tx);
      }
      tx.pipe(stream);
    }
    [DIRECTORY](entry, fullyDone) {
      const mode = entry.mode & 4095 || this.dmode;
      this[MKDIR](entry.absolute, mode, (er) => {
        if (er) {
          this[ONERROR](er, entry);
          fullyDone();
          return;
        }
        let actions = 1;
        const done = (_) => {
          if (--actions === 0) {
            fullyDone();
            this[UNPEND]();
            entry.resume();
          }
        };
        if (entry.mtime && !this.noMtime) {
          actions++;
          fs.utimes(entry.absolute, entry.atime || new Date, entry.mtime, done);
        }
        if (this[DOCHOWN](entry)) {
          actions++;
          fs.chown(entry.absolute, this[UID](entry), this[GID](entry), done);
        }
        done();
      });
    }
    [UNSUPPORTED](entry) {
      entry.unsupported = true;
      this.warn("TAR_ENTRY_UNSUPPORTED", `unsupported entry type: ${entry.type}`, { entry });
      entry.resume();
    }
    [SYMLINK](entry, done) {
      this[LINK](entry, entry.linkpath, "symlink", done);
    }
    [HARDLINK](entry, done) {
      const linkpath = normPath(path.resolve(this.cwd, entry.linkpath));
      this[LINK](entry, linkpath, "link", done);
    }
    [PEND]() {
      this[PENDING]++;
    }
    [UNPEND]() {
      this[PENDING]--;
      this[MAYBECLOSE]();
    }
    [SKIP](entry) {
      this[UNPEND]();
      entry.resume();
    }
    [ISREUSABLE](entry, st) {
      return entry.type === "File" && !this.unlink && st.isFile() && st.nlink <= 1 && !isWindows;
    }
    [CHECKFS](entry) {
      this[PEND]();
      const paths = [entry.path];
      if (entry.linkpath) {
        paths.push(entry.linkpath);
      }
      this.reservations.reserve(paths, (done) => this[CHECKFS2](entry, done));
    }
    [PRUNECACHE](entry) {
      if (entry.type === "SymbolicLink") {
        dropCache(this.dirCache);
      } else if (entry.type !== "Directory") {
        pruneCache(this.dirCache, entry.absolute);
      }
    }
    [CHECKFS2](entry, fullyDone) {
      this[PRUNECACHE](entry);
      const done = (er) => {
        this[PRUNECACHE](entry);
        fullyDone(er);
      };
      const checkCwd = () => {
        this[MKDIR](this.cwd, this.dmode, (er) => {
          if (er) {
            this[ONERROR](er, entry);
            done();
            return;
          }
          this[CHECKED_CWD] = true;
          start();
        });
      };
      const start = () => {
        if (entry.absolute !== this.cwd) {
          const parent = normPath(path.dirname(entry.absolute));
          if (parent !== this.cwd) {
            return this[MKDIR](parent, this.dmode, (er) => {
              if (er) {
                this[ONERROR](er, entry);
                done();
                return;
              }
              afterMakeParent();
            });
          }
        }
        afterMakeParent();
      };
      const afterMakeParent = () => {
        fs.lstat(entry.absolute, (lstatEr, st) => {
          if (st && (this.keep || this.newer && st.mtime > entry.mtime)) {
            this[SKIP](entry);
            done();
            return;
          }
          if (lstatEr || this[ISREUSABLE](entry, st)) {
            return this[MAKEFS](null, entry, done);
          }
          if (st.isDirectory()) {
            if (entry.type === "Directory") {
              const needChmod = !this.noChmod && entry.mode && (st.mode & 4095) !== entry.mode;
              const afterChmod = (er) => this[MAKEFS](er, entry, done);
              if (!needChmod) {
                return afterChmod();
              }
              return fs.chmod(entry.absolute, entry.mode, afterChmod);
            }
            if (entry.absolute !== this.cwd) {
              return fs.rmdir(entry.absolute, (er) => this[MAKEFS](er, entry, done));
            }
          }
          if (entry.absolute === this.cwd) {
            return this[MAKEFS](null, entry, done);
          }
          unlinkFile(entry.absolute, (er) => this[MAKEFS](er, entry, done));
        });
      };
      if (this[CHECKED_CWD]) {
        start();
      } else {
        checkCwd();
      }
    }
    [MAKEFS](er, entry, done) {
      if (er) {
        this[ONERROR](er, entry);
        done();
        return;
      }
      switch (entry.type) {
        case "File":
        case "OldFile":
        case "ContiguousFile":
          return this[FILE](entry, done);
        case "Link":
          return this[HARDLINK](entry, done);
        case "SymbolicLink":
          return this[SYMLINK](entry, done);
        case "Directory":
        case "GNUDumpDir":
          return this[DIRECTORY](entry, done);
      }
    }
    [LINK](entry, linkpath, link, done) {
      fs[link](linkpath, entry.absolute, (er) => {
        if (er) {
          this[ONERROR](er, entry);
        } else {
          this[UNPEND]();
          entry.resume();
        }
        done();
      });
    }
  }
  var callSync = (fn) => {
    try {
      return [null, fn()];
    } catch (er) {
      return [er, null];
    }
  };

  class UnpackSync extends Unpack {
    [MAKEFS](er, entry) {
      return super[MAKEFS](er, entry, () => {
      });
    }
    [CHECKFS](entry) {
      this[PRUNECACHE](entry);
      if (!this[CHECKED_CWD]) {
        const er2 = this[MKDIR](this.cwd, this.dmode);
        if (er2) {
          return this[ONERROR](er2, entry);
        }
        this[CHECKED_CWD] = true;
      }
      if (entry.absolute !== this.cwd) {
        const parent = normPath(path.dirname(entry.absolute));
        if (parent !== this.cwd) {
          const mkParent = this[MKDIR](parent, this.dmode);
          if (mkParent) {
            return this[ONERROR](mkParent, entry);
          }
        }
      }
      const [lstatEr, st] = callSync(() => fs.lstatSync(entry.absolute));
      if (st && (this.keep || this.newer && st.mtime > entry.mtime)) {
        return this[SKIP](entry);
      }
      if (lstatEr || this[ISREUSABLE](entry, st)) {
        return this[MAKEFS](null, entry);
      }
      if (st.isDirectory()) {
        if (entry.type === "Directory") {
          const needChmod = !this.noChmod && entry.mode && (st.mode & 4095) !== entry.mode;
          const [er3] = needChmod ? callSync(() => {
            fs.chmodSync(entry.absolute, entry.mode);
          }) : [];
          return this[MAKEFS](er3, entry);
        }
        const [er2] = callSync(() => fs.rmdirSync(entry.absolute));
        this[MAKEFS](er2, entry);
      }
      const [er] = entry.absolute === this.cwd ? [] : callSync(() => unlinkFileSync(entry.absolute));
      this[MAKEFS](er, entry);
    }
    [FILE](entry, done) {
      const mode = entry.mode & 4095 || this.fmode;
      const oner = (er) => {
        let closeError;
        try {
          fs.closeSync(fd);
        } catch (e) {
          closeError = e;
        }
        if (er || closeError) {
          this[ONERROR](er || closeError, entry);
        }
        done();
      };
      let fd;
      try {
        fd = fs.openSync(entry.absolute, getFlag(entry.size), mode);
      } catch (er) {
        return oner(er);
      }
      const tx = this.transform ? this.transform(entry) || entry : entry;
      if (tx !== entry) {
        tx.on("error", (er) => this[ONERROR](er, entry));
        entry.pipe(tx);
      }
      tx.on("data", (chunk) => {
        try {
          fs.writeSync(fd, chunk, 0, chunk.length);
        } catch (er) {
          oner(er);
        }
      });
      tx.on("end", (_) => {
        let er = null;
        if (entry.mtime && !this.noMtime) {
          const atime = entry.atime || new Date;
          const mtime = entry.mtime;
          try {
            fs.futimesSync(fd, atime, mtime);
          } catch (futimeser) {
            try {
              fs.utimesSync(entry.absolute, atime, mtime);
            } catch (utimeser) {
              er = futimeser;
            }
          }
        }
        if (this[DOCHOWN](entry)) {
          const uid = this[UID](entry);
          const gid = this[GID](entry);
          try {
            fs.fchownSync(fd, uid, gid);
          } catch (fchowner) {
            try {
              fs.chownSync(entry.absolute, uid, gid);
            } catch (chowner) {
              er = er || fchowner;
            }
          }
        }
        oner(er);
      });
    }
    [DIRECTORY](entry, done) {
      const mode = entry.mode & 4095 || this.dmode;
      const er = this[MKDIR](entry.absolute, mode);
      if (er) {
        this[ONERROR](er, entry);
        done();
        return;
      }
      if (entry.mtime && !this.noMtime) {
        try {
          fs.utimesSync(entry.absolute, entry.atime || new Date, entry.mtime);
        } catch (er2) {
        }
      }
      if (this[DOCHOWN](entry)) {
        try {
          fs.chownSync(entry.absolute, this[UID](entry), this[GID](entry));
        } catch (er2) {
        }
      }
      done();
      entry.resume();
    }
    [MKDIR](dir, mode) {
      try {
        return mkdir.sync(normPath(dir), {
          uid: this.uid,
          gid: this.gid,
          processUid: this.processUid,
          processGid: this.processGid,
          umask: this.processUmask,
          preserve: this.preservePaths,
          unlink: this.unlink,
          cache: this.dirCache,
          cwd: this.cwd,
          mode
        });
      } catch (er) {
        return er;
      }
    }
    [LINK](entry, linkpath, link, done) {
      try {
        fs[link + "Sync"](linkpath, entry.absolute);
        done();
        entry.resume();
      } catch (er) {
        return this[ONERROR](er, entry);
      }
    }
  }
  Unpack.Sync = UnpackSync;
  module.exports = Unpack;
});

// src/bun/node_modules/tar/lib/extract.js
var require_extract = __commonJS((exports, module) => {
  var hlo = require_high_level_opt();
  var Unpack = require_unpack();
  var fs = import.meta.require("fs");
  var fsm = require_fs_minipass();
  var path = import.meta.require("path");
  var stripSlash = require_strip_trailing_slashes();
  module.exports = (opt_, files, cb) => {
    if (typeof opt_ === "function") {
      cb = opt_, files = null, opt_ = {};
    } else if (Array.isArray(opt_)) {
      files = opt_, opt_ = {};
    }
    if (typeof files === "function") {
      cb = files, files = null;
    }
    if (!files) {
      files = [];
    } else {
      files = Array.from(files);
    }
    const opt = hlo(opt_);
    if (opt.sync && typeof cb === "function") {
      throw new TypeError("callback not supported for sync tar functions");
    }
    if (!opt.file && typeof cb === "function") {
      throw new TypeError("callback only supported with file option");
    }
    if (files.length) {
      filesFilter(opt, files);
    }
    return opt.file && opt.sync ? extractFileSync(opt) : opt.file ? extractFile(opt, cb) : opt.sync ? extractSync(opt) : extract(opt);
  };
  var filesFilter = (opt, files) => {
    const map = new Map(files.map((f) => [stripSlash(f), true]));
    const filter = opt.filter;
    const mapHas = (file, r) => {
      const root = r || path.parse(file).root || ".";
      const ret = file === root ? false : map.has(file) ? map.get(file) : mapHas(path.dirname(file), root);
      map.set(file, ret);
      return ret;
    };
    opt.filter = filter ? (file, entry) => filter(file, entry) && mapHas(stripSlash(file)) : (file) => mapHas(stripSlash(file));
  };
  var extractFileSync = (opt) => {
    const u = new Unpack.Sync(opt);
    const file = opt.file;
    const stat = fs.statSync(file);
    const readSize = opt.maxReadSize || 16 * 1024 * 1024;
    const stream = new fsm.ReadStreamSync(file, {
      readSize,
      size: stat.size
    });
    stream.pipe(u);
  };
  var extractFile = (opt, cb) => {
    const u = new Unpack(opt);
    const readSize = opt.maxReadSize || 16 * 1024 * 1024;
    const file = opt.file;
    const p = new Promise((resolve, reject) => {
      u.on("error", reject);
      u.on("close", resolve);
      fs.stat(file, (er, stat) => {
        if (er) {
          reject(er);
        } else {
          const stream = new fsm.ReadStream(file, {
            readSize,
            size: stat.size
          });
          stream.on("error", reject);
          stream.pipe(u);
        }
      });
    });
    return cb ? p.then(cb, cb) : p;
  };
  var extractSync = (opt) => new Unpack.Sync(opt);
  var extract = (opt) => new Unpack(opt);
});

// src/bun/node_modules/tar/index.js
var require_tar = __commonJS((exports) => {
  exports.c = exports.create = require_create();
  exports.r = exports.replace = require_replace();
  exports.t = exports.list = require_list();
  exports.u = exports.update = require_update();
  exports.x = exports.extract = require_extract();
  exports.Pack = require_pack();
  exports.Unpack = require_unpack();
  exports.Parse = require_parse();
  exports.ReadEntry = require_read_entry();
  exports.WriteEntry = require_write_entry();
  exports.Header = require_header();
  exports.Pax = require_pax();
  exports.types = require_types();
});

// src/bun/events/eventEmitter.ts
import EventEmitter from "events";

// src/bun/events/event.ts
class ElectrobunEvent {
  name;
  data;
  _response;
  responseWasSet = false;
  constructor(name, data) {
    this.name = name;
    this.data = data;
  }
  get response() {
    return this._response;
  }
  set response(value) {
    this._response = value;
    this.responseWasSet = true;
  }
  clearResponse() {
    this._response = undefined;
    this.responseWasSet = false;
  }
}

// src/bun/events/windowEvents.ts
var windowEvents_default = {
  close: (data) => new ElectrobunEvent("close", data),
  resize: (data) => new ElectrobunEvent("resize", data),
  move: (data) => new ElectrobunEvent("move", data)
};

// src/bun/events/webviewEvents.ts
var webviewEvents_default = {
  willNavigate: (data) => new ElectrobunEvent("will-navigate", data),
  didNavigate: (data) => new ElectrobunEvent("did-navigate", data),
  didNavigateInPage: (data) => new ElectrobunEvent("did-navigate-in-page", data),
  didCommitNavigation: (data) => new ElectrobunEvent("did-commit-navigation", data),
  domReady: (data) => new ElectrobunEvent("dom-ready", data),
  newWindowOpen: (data) => new ElectrobunEvent("new-window-open", data)
};

// src/bun/events/trayEvents.ts
var trayEvents_default = {
  trayClicked: (data) => new ElectrobunEvent("tray-clicked", data)
};

// src/bun/events/applicationEvents.ts
var applicationEvents_default = {
  applicationMenuClicked: (data) => new ElectrobunEvent("application-menu-clicked", data),
  contextMenuClicked: (data) => new ElectrobunEvent("context-menu-clicked", data)
};

// src/bun/events/eventEmitter.ts
class ElectrobunEventEmitter extends EventEmitter {
  constructor() {
    super();
  }
  emitEvent(ElectrobunEvent2, specifier) {
    if (specifier) {
      this.emit(`${ElectrobunEvent2.name}-${specifier}`, ElectrobunEvent2);
    } else {
      this.emit(ElectrobunEvent2.name, ElectrobunEvent2);
    }
  }
  events = {
    window: {
      ...windowEvents_default
    },
    webview: {
      ...webviewEvents_default
    },
    tray: {
      ...trayEvents_default
    },
    app: {
      ...applicationEvents_default
    }
  };
}
var electrobunEventEmitter = new ElectrobunEventEmitter;
var eventEmitter_default = electrobunEventEmitter;

// src/bun/proc/zig.ts
import {join as join3, resolve as resolve3} from "path";
// src/bun/node_modules/rpc-anywhere/dist/esm/rpc.js
var missingTransportMethodError = function(methods, action) {
  const methodsString = methods.map((method) => `"${method}"`).join(", ");
  return new Error(`This RPC instance cannot ${action} because the transport did not provide one or more of these methods: ${methodsString}`);
};
function _createRPC(options = {}) {
  let debugHooks = {};
  function _setDebugHooks(newDebugHooks) {
    debugHooks = newDebugHooks;
  }
  let transport = {};
  function setTransport(newTransport) {
    if (transport.unregisterHandler)
      transport.unregisterHandler();
    transport = newTransport;
    transport.registerHandler?.(handler);
  }
  let requestHandler = undefined;
  function setRequestHandler(handler2) {
    if (typeof handler2 === "function") {
      requestHandler = handler2;
      return;
    }
    requestHandler = (method, params) => {
      const handlerFn = handler2[method];
      if (handlerFn)
        return handlerFn(params);
      const fallbackHandler = handler2._;
      if (!fallbackHandler)
        throw new Error(`The requested method has no handler: ${method}`);
      return fallbackHandler(method, params);
    };
  }
  const { maxRequestTime = DEFAULT_MAX_REQUEST_TIME } = options;
  if (options.transport)
    setTransport(options.transport);
  if (options.requestHandler)
    setRequestHandler(options.requestHandler);
  if (options._debugHooks)
    _setDebugHooks(options._debugHooks);
  let lastRequestId = 0;
  function getRequestId() {
    if (lastRequestId <= MAX_ID)
      return ++lastRequestId;
    return lastRequestId = 0;
  }
  const requestListeners = new Map;
  const requestTimeouts = new Map;
  function requestFn(method, ...args) {
    const params = args[0];
    return new Promise((resolve, reject) => {
      if (!transport.send)
        throw missingTransportMethodError(["send"], "make requests");
      const requestId = getRequestId();
      const request2 = {
        type: "request",
        id: requestId,
        method,
        params
      };
      requestListeners.set(requestId, { resolve, reject });
      if (maxRequestTime !== Infinity)
        requestTimeouts.set(requestId, setTimeout(() => {
          requestTimeouts.delete(requestId);
          reject(new Error("RPC request timed out."));
        }, maxRequestTime));
      debugHooks.onSend?.(request2);
      transport.send(request2);
    });
  }
  const request = new Proxy(requestFn, {
    get: (target, prop, receiver) => {
      if (prop in target)
        return Reflect.get(target, prop, receiver);
      return (params) => requestFn(prop, params);
    }
  });
  const requestProxy = request;
  function sendFn(message, ...args) {
    const payload = args[0];
    if (!transport.send)
      throw missingTransportMethodError(["send"], "send messages");
    const rpcMessage = {
      type: "message",
      id: message,
      payload
    };
    debugHooks.onSend?.(rpcMessage);
    transport.send(rpcMessage);
  }
  const send = new Proxy(sendFn, {
    get: (target, prop, receiver) => {
      if (prop in target)
        return Reflect.get(target, prop, receiver);
      return (payload) => sendFn(prop, payload);
    }
  });
  const sendProxy = send;
  const messageListeners = new Map;
  const wildcardMessageListeners = new Set;
  function addMessageListener(message, listener) {
    if (!transport.registerHandler)
      throw missingTransportMethodError(["registerHandler"], "register message listeners");
    if (message === "*") {
      wildcardMessageListeners.add(listener);
      return;
    }
    if (!messageListeners.has(message))
      messageListeners.set(message, new Set);
    messageListeners.get(message)?.add(listener);
  }
  function removeMessageListener(message, listener) {
    if (message === "*") {
      wildcardMessageListeners.delete(listener);
      return;
    }
    messageListeners.get(message)?.delete(listener);
    if (messageListeners.get(message)?.size === 0)
      messageListeners.delete(message);
  }
  async function handler(message) {
    debugHooks.onReceive?.(message);
    if (!("type" in message))
      throw new Error("Message does not contain a type.");
    if (message.type === "request") {
      if (!transport.send || !requestHandler)
        throw missingTransportMethodError(["send", "requestHandler"], "handle requests");
      const { id, method, params } = message;
      let response;
      try {
        response = {
          type: "response",
          id,
          success: true,
          payload: await requestHandler(method, params)
        };
      } catch (error) {
        if (!(error instanceof Error))
          throw error;
        response = {
          type: "response",
          id,
          success: false,
          error: error.message
        };
      }
      debugHooks.onSend?.(response);
      transport.send(response);
      return;
    }
    if (message.type === "response") {
      const timeout = requestTimeouts.get(message.id);
      if (timeout != null)
        clearTimeout(timeout);
      const { resolve, reject } = requestListeners.get(message.id) ?? {};
      if (!message.success)
        reject?.(new Error(message.error));
      else
        resolve?.(message.payload);
      return;
    }
    if (message.type === "message") {
      for (const listener of wildcardMessageListeners)
        listener(message.id, message.payload);
      const listeners = messageListeners.get(message.id);
      if (!listeners)
        return;
      for (const listener of listeners)
        listener(message.payload);
      return;
    }
    throw new Error(`Unexpected RPC message type: ${message.type}`);
  }
  const proxy = { send: sendProxy, request: requestProxy };
  return {
    setTransport,
    setRequestHandler,
    request,
    requestProxy,
    send,
    sendProxy,
    addMessageListener,
    removeMessageListener,
    proxy,
    _setDebugHooks
  };
}
var MAX_ID = 10000000000;
var DEFAULT_MAX_REQUEST_TIME = 1000;

// src/bun/node_modules/rpc-anywhere/dist/esm/create-rpc.js
function createRPC(options) {
  return _createRPC(options);
}
// src/bun/proc/zig.ts
import {execSync as execSync2} from "child_process";
import * as fs2 from "fs";

// src/bun/core/BrowserView.ts
import * as fs from "fs";
import {execSync} from "child_process";

// src/bun/core/Updater.ts
var import_tar = __toESM(require_tar(), 1);
import {join, dirname, resolve} from "path";
import {homedir} from "os";
import {renameSync, unlinkSync, mkdirSync, rmdirSync, statSync} from "fs";

// src/bun/node_modules/@oneidentity/zstd-js/wasm/index.js
var I = function(I2, g) {
  if (typeof g != "function" && g !== null)
    throw new TypeError("Class extends value " + String(g) + " is not a constructor or null");
  function B() {
    this.constructor = I2;
  }
  A(I2, g), I2.prototype = g === null ? Object.create(g) : (B.prototype = g.prototype, new B);
};
var g = function(A, I2, g2, B) {
  return new (g2 || (g2 = Promise))(function(C, Q) {
    function E(A2) {
      try {
        o(B.next(A2));
      } catch (A3) {
        Q(A3);
      }
    }
    function i(A2) {
      try {
        o(B.throw(A2));
      } catch (A3) {
        Q(A3);
      }
    }
    function o(A2) {
      var I3;
      A2.done ? C(A2.value) : (I3 = A2.value, I3 instanceof g2 ? I3 : new g2(function(A3) {
        A3(I3);
      })).then(E, i);
    }
    o((B = B.apply(A, I2 || [])).next());
  });
};
var B = function(A, I2) {
  var g2, B2, C, Q, E = { label: 0, sent: function() {
    if (1 & C[0])
      throw C[1];
    return C[1];
  }, trys: [], ops: [] };
  return Q = { next: i(0), throw: i(1), return: i(2) }, typeof Symbol == "function" && (Q[Symbol.iterator] = function() {
    return this;
  }), Q;
  function i(Q2) {
    return function(i2) {
      return function(Q3) {
        if (g2)
          throw new TypeError("Generator is already executing.");
        for (;E; )
          try {
            if (g2 = 1, B2 && (C = 2 & Q3[0] ? B2.return : Q3[0] ? B2.throw || ((C = B2.return) && C.call(B2), 0) : B2.next) && !(C = C.call(B2, Q3[1])).done)
              return C;
            switch (B2 = 0, C && (Q3 = [2 & Q3[0], C.value]), Q3[0]) {
              case 0:
              case 1:
                C = Q3;
                break;
              case 4:
                return E.label++, { value: Q3[1], done: false };
              case 5:
                E.label++, B2 = Q3[1], Q3 = [0];
                continue;
              case 7:
                Q3 = E.ops.pop(), E.trys.pop();
                continue;
              default:
                if (!(C = E.trys, (C = C.length > 0 && C[C.length - 1]) || Q3[0] !== 6 && Q3[0] !== 2)) {
                  E = 0;
                  continue;
                }
                if (Q3[0] === 3 && (!C || Q3[1] > C[0] && Q3[1] < C[3])) {
                  E.label = Q3[1];
                  break;
                }
                if (Q3[0] === 6 && E.label < C[1]) {
                  E.label = C[1], C = Q3;
                  break;
                }
                if (C && E.label < C[2]) {
                  E.label = C[2], E.ops.push(Q3);
                  break;
                }
                C[2] && E.ops.pop(), E.trys.pop();
                continue;
            }
            Q3 = I2.call(A, E);
          } catch (A2) {
            Q3 = [6, A2], B2 = 0;
          } finally {
            g2 = C = 0;
          }
        if (5 & Q3[0])
          throw Q3[1];
        return { value: Q3[0] ? Q3[1] : undefined, done: true };
      }([Q2, i2]);
    };
  }
};
var s = function() {
  return g(this, undefined, undefined, function() {
    return B(this, function(A) {
      return [2, (I2 = E, g2 = { ZstdSimple: y, ZstdStream: F }, new Promise(function(A2, B2) {
        D && A2({ ZstdSimple: g2.ZstdSimple, ZstdStream: g2.ZstdStream }), (typeof I2 == "function" ? I2 : I2.default)().then(function(I3) {
          a = new o(D = I3), A2({ ZstdSimple: g2.ZstdSimple, ZstdStream: g2.ZstdStream });
        }).catch(function(A3) {
          B2(A3);
        });
      }))];
      var I2, g2;
    });
  });
};
var __dirname = "/Users/yoav/code/electrobun/src/bun/node_modules/@oneidentity/zstd-js/wasm", __filename = "/Users/yoav/code/electrobun/src/bun/node_modules/@oneidentity/zstd-js/wasm/index.js";
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
var A = function(I2, g2) {
  return (A = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(A2, I3) {
    A2.__proto__ = I3;
  } || function(A2, I3) {
    for (var g3 in I3)
      Object.prototype.hasOwnProperty.call(I3, g3) && (A2[g3] = I3[g3]);
  })(I2, g2);
};
var C;
var Q = (function(A2, I2) {
  var g2, B2 = (g2 = typeof document != "undefined" && document.currentScript ? document.currentScript.src : undefined, typeof __filename != "undefined" && (g2 = g2 || __filename), function(A3) {
    var I3, B3, C2;
    A3 = A3 || {}, I3 || (I3 = A3 !== undefined ? A3 : {}), I3.ready = new Promise(function(A4, I4) {
      B3 = A4, C2 = I4;
    }), Object.getOwnPropertyDescriptor(I3.ready, "_ZSTD_getErrorName") || (Object.defineProperty(I3.ready, "_ZSTD_getErrorName", { configurable: true, get: function() {
      z("You are getting _ZSTD_getErrorName on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "_ZSTD_getErrorName", { configurable: true, set: function() {
      z("You are setting _ZSTD_getErrorName on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } })), Object.getOwnPropertyDescriptor(I3.ready, "_ZSTD_isError") || (Object.defineProperty(I3.ready, "_ZSTD_isError", { configurable: true, get: function() {
      z("You are getting _ZSTD_isError on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "_ZSTD_isError", { configurable: true, set: function() {
      z("You are setting _ZSTD_isError on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } })), Object.getOwnPropertyDescriptor(I3.ready, "_ZSTD_createCStream") || (Object.defineProperty(I3.ready, "_ZSTD_createCStream", { configurable: true, get: function() {
      z("You are getting _ZSTD_createCStream on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "_ZSTD_createCStream", { configurable: true, set: function() {
      z("You are setting _ZSTD_createCStream on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } })), Object.getOwnPropertyDescriptor(I3.ready, "_ZSTD_freeCStream") || (Object.defineProperty(I3.ready, "_ZSTD_freeCStream", { configurable: true, get: function() {
      z("You are getting _ZSTD_freeCStream on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "_ZSTD_freeCStream", { configurable: true, set: function() {
      z("You are setting _ZSTD_freeCStream on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } })), Object.getOwnPropertyDescriptor(I3.ready, "_ZSTD_CStreamInSize") || (Object.defineProperty(I3.ready, "_ZSTD_CStreamInSize", { configurable: true, get: function() {
      z("You are getting _ZSTD_CStreamInSize on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "_ZSTD_CStreamInSize", { configurable: true, set: function() {
      z("You are setting _ZSTD_CStreamInSize on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } })), Object.getOwnPropertyDescriptor(I3.ready, "_ZSTD_CStreamOutSize") || (Object.defineProperty(I3.ready, "_ZSTD_CStreamOutSize", { configurable: true, get: function() {
      z("You are getting _ZSTD_CStreamOutSize on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "_ZSTD_CStreamOutSize", { configurable: true, set: function() {
      z("You are setting _ZSTD_CStreamOutSize on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } })), Object.getOwnPropertyDescriptor(I3.ready, "_ZSTD_CCtx_setParameter") || (Object.defineProperty(I3.ready, "_ZSTD_CCtx_setParameter", { configurable: true, get: function() {
      z("You are getting _ZSTD_CCtx_setParameter on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "_ZSTD_CCtx_setParameter", { configurable: true, set: function() {
      z("You are setting _ZSTD_CCtx_setParameter on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } })), Object.getOwnPropertyDescriptor(I3.ready, "_ZSTD_compressStream2_simpleArgs") || (Object.defineProperty(I3.ready, "_ZSTD_compressStream2_simpleArgs", { configurable: true, get: function() {
      z("You are getting _ZSTD_compressStream2_simpleArgs on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "_ZSTD_compressStream2_simpleArgs", { configurable: true, set: function() {
      z("You are setting _ZSTD_compressStream2_simpleArgs on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } })), Object.getOwnPropertyDescriptor(I3.ready, "_ZSTD_initCStream") || (Object.defineProperty(I3.ready, "_ZSTD_initCStream", { configurable: true, get: function() {
      z("You are getting _ZSTD_initCStream on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "_ZSTD_initCStream", { configurable: true, set: function() {
      z("You are setting _ZSTD_initCStream on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } })), Object.getOwnPropertyDescriptor(I3.ready, "_ZSTD_DStreamInSize") || (Object.defineProperty(I3.ready, "_ZSTD_DStreamInSize", { configurable: true, get: function() {
      z("You are getting _ZSTD_DStreamInSize on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "_ZSTD_DStreamInSize", { configurable: true, set: function() {
      z("You are setting _ZSTD_DStreamInSize on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } })), Object.getOwnPropertyDescriptor(I3.ready, "_ZSTD_DStreamOutSize") || (Object.defineProperty(I3.ready, "_ZSTD_DStreamOutSize", { configurable: true, get: function() {
      z("You are getting _ZSTD_DStreamOutSize on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "_ZSTD_DStreamOutSize", { configurable: true, set: function() {
      z("You are setting _ZSTD_DStreamOutSize on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } })), Object.getOwnPropertyDescriptor(I3.ready, "_ZSTD_createDStream") || (Object.defineProperty(I3.ready, "_ZSTD_createDStream", { configurable: true, get: function() {
      z("You are getting _ZSTD_createDStream on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "_ZSTD_createDStream", { configurable: true, set: function() {
      z("You are setting _ZSTD_createDStream on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } })), Object.getOwnPropertyDescriptor(I3.ready, "_ZSTD_initDStream") || (Object.defineProperty(I3.ready, "_ZSTD_initDStream", { configurable: true, get: function() {
      z("You are getting _ZSTD_initDStream on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "_ZSTD_initDStream", { configurable: true, set: function() {
      z("You are setting _ZSTD_initDStream on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } })), Object.getOwnPropertyDescriptor(I3.ready, "_ZSTD_decompressStream_simpleArgs") || (Object.defineProperty(I3.ready, "_ZSTD_decompressStream_simpleArgs", { configurable: true, get: function() {
      z("You are getting _ZSTD_decompressStream_simpleArgs on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "_ZSTD_decompressStream_simpleArgs", { configurable: true, set: function() {
      z("You are setting _ZSTD_decompressStream_simpleArgs on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } })), Object.getOwnPropertyDescriptor(I3.ready, "_ZSTD_freeDStream") || (Object.defineProperty(I3.ready, "_ZSTD_freeDStream", { configurable: true, get: function() {
      z("You are getting _ZSTD_freeDStream on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "_ZSTD_freeDStream", { configurable: true, set: function() {
      z("You are setting _ZSTD_freeDStream on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } })), Object.getOwnPropertyDescriptor(I3.ready, "_ZSTD_compress") || (Object.defineProperty(I3.ready, "_ZSTD_compress", { configurable: true, get: function() {
      z("You are getting _ZSTD_compress on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "_ZSTD_compress", { configurable: true, set: function() {
      z("You are setting _ZSTD_compress on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } })), Object.getOwnPropertyDescriptor(I3.ready, "_ZSTD_compressBound") || (Object.defineProperty(I3.ready, "_ZSTD_compressBound", { configurable: true, get: function() {
      z("You are getting _ZSTD_compressBound on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "_ZSTD_compressBound", { configurable: true, set: function() {
      z("You are setting _ZSTD_compressBound on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } })), Object.getOwnPropertyDescriptor(I3.ready, "_ZSTD_decompress") || (Object.defineProperty(I3.ready, "_ZSTD_decompress", { configurable: true, get: function() {
      z("You are getting _ZSTD_decompress on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "_ZSTD_decompress", { configurable: true, set: function() {
      z("You are setting _ZSTD_decompress on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } })), Object.getOwnPropertyDescriptor(I3.ready, "_ZSTD_getFrameContentSize") || (Object.defineProperty(I3.ready, "_ZSTD_getFrameContentSize", { configurable: true, get: function() {
      z("You are getting _ZSTD_getFrameContentSize on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "_ZSTD_getFrameContentSize", { configurable: true, set: function() {
      z("You are setting _ZSTD_getFrameContentSize on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } })), Object.getOwnPropertyDescriptor(I3.ready, "_emscripten_stack_get_end") || (Object.defineProperty(I3.ready, "_emscripten_stack_get_end", { configurable: true, get: function() {
      z("You are getting _emscripten_stack_get_end on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "_emscripten_stack_get_end", { configurable: true, set: function() {
      z("You are setting _emscripten_stack_get_end on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } })), Object.getOwnPropertyDescriptor(I3.ready, "_emscripten_stack_get_free") || (Object.defineProperty(I3.ready, "_emscripten_stack_get_free", { configurable: true, get: function() {
      z("You are getting _emscripten_stack_get_free on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "_emscripten_stack_get_free", { configurable: true, set: function() {
      z("You are setting _emscripten_stack_get_free on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } })), Object.getOwnPropertyDescriptor(I3.ready, "_emscripten_stack_init") || (Object.defineProperty(I3.ready, "_emscripten_stack_init", { configurable: true, get: function() {
      z("You are getting _emscripten_stack_init on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "_emscripten_stack_init", { configurable: true, set: function() {
      z("You are setting _emscripten_stack_init on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } })), Object.getOwnPropertyDescriptor(I3.ready, "___cxa_demangle") || (Object.defineProperty(I3.ready, "___cxa_demangle", { configurable: true, get: function() {
      z("You are getting ___cxa_demangle on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "___cxa_demangle", { configurable: true, set: function() {
      z("You are setting ___cxa_demangle on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } })), Object.getOwnPropertyDescriptor(I3.ready, "_stackSave") || (Object.defineProperty(I3.ready, "_stackSave", { configurable: true, get: function() {
      z("You are getting _stackSave on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "_stackSave", { configurable: true, set: function() {
      z("You are setting _stackSave on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } })), Object.getOwnPropertyDescriptor(I3.ready, "_stackRestore") || (Object.defineProperty(I3.ready, "_stackRestore", { configurable: true, get: function() {
      z("You are getting _stackRestore on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "_stackRestore", { configurable: true, set: function() {
      z("You are setting _stackRestore on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } })), Object.getOwnPropertyDescriptor(I3.ready, "_stackAlloc") || (Object.defineProperty(I3.ready, "_stackAlloc", { configurable: true, get: function() {
      z("You are getting _stackAlloc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "_stackAlloc", { configurable: true, set: function() {
      z("You are setting _stackAlloc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } })), Object.getOwnPropertyDescriptor(I3.ready, "___wasm_call_ctors") || (Object.defineProperty(I3.ready, "___wasm_call_ctors", { configurable: true, get: function() {
      z("You are getting ___wasm_call_ctors on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "___wasm_call_ctors", { configurable: true, set: function() {
      z("You are setting ___wasm_call_ctors on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } })), Object.getOwnPropertyDescriptor(I3.ready, "_fflush") || (Object.defineProperty(I3.ready, "_fflush", { configurable: true, get: function() {
      z("You are getting _fflush on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "_fflush", { configurable: true, set: function() {
      z("You are setting _fflush on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } })), Object.getOwnPropertyDescriptor(I3.ready, "___errno_location") || (Object.defineProperty(I3.ready, "___errno_location", { configurable: true, get: function() {
      z("You are getting ___errno_location on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "___errno_location", { configurable: true, set: function() {
      z("You are setting ___errno_location on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } })), Object.getOwnPropertyDescriptor(I3.ready, "_malloc") || (Object.defineProperty(I3.ready, "_malloc", { configurable: true, get: function() {
      z("You are getting _malloc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "_malloc", { configurable: true, set: function() {
      z("You are setting _malloc on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } })), Object.getOwnPropertyDescriptor(I3.ready, "_free") || (Object.defineProperty(I3.ready, "_free", { configurable: true, get: function() {
      z("You are getting _free on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "_free", { configurable: true, set: function() {
      z("You are setting _free on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } })), Object.getOwnPropertyDescriptor(I3.ready, "onRuntimeInitialized") || (Object.defineProperty(I3.ready, "onRuntimeInitialized", { configurable: true, get: function() {
      z("You are getting onRuntimeInitialized on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }), Object.defineProperty(I3.ready, "onRuntimeInitialized", { configurable: true, set: function() {
      z("You are setting onRuntimeInitialized on the Promise object, instead of the instance. Use .then() to get called back with the instance, see the MODULARIZE docs in src/settings.js");
    } }));
    var Q2, E, i, o, D, a = {};
    for (Q2 in I3)
      I3.hasOwnProperty(Q2) && (a[Q2] = I3[Q2]);
    if (E = typeof window == "object", i = typeof importScripts == "function", o = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string", D = !E && !o && !i, I3.ENVIRONMENT)
      throw new Error("Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -s ENVIRONMENT=web or -s ENVIRONMENT=node)");
    var G, F, y, s2, w, R = "";
    if (o)
      R = i ? import.meta.require("path").dirname(R) + "/" : __dirname + "/", G = function(A4, I4) {
        var g3 = yA(A4);
        return g3 ? I4 ? g3 : g3.toString() : (s2 || (s2 = import.meta.require("fs")), w || (w = import.meta.require("path")), A4 = w.normalize(A4), s2.readFileSync(A4, I4 ? null : "utf8"));
      }, y = function(A4) {
        var I4 = G(A4, true);
        return I4.buffer || (I4 = new Uint8Array(I4)), k(I4.buffer), I4;
      }, process.argv.length > 1 && process.argv[1].replace(/\\/g, "/"), process.argv.slice(2), process.on("uncaughtException", function(A4) {
        if (!(A4 instanceof tA))
          throw A4;
      }), process.on("unhandledRejection", z), I3.inspect = function() {
        return "[Emscripten Module object]";
      };
    else if (D)
      typeof read != "undefined" && (G = function(A4) {
        var I4 = yA(A4);
        return I4 ? GA(I4) : read(A4);
      }), y = function(A4) {
        var I4;
        return (I4 = yA(A4)) ? I4 : typeof readbuffer == "function" ? new Uint8Array(readbuffer(A4)) : (k(typeof (I4 = read(A4, "binary")) == "object"), I4);
      }, typeof scriptArgs != "undefined" && scriptArgs, typeof print != "undefined" && (typeof console == "undefined" && (console = {}), console.log = print, console.warn = console.error = typeof printErr != "undefined" ? printErr : print);
    else {
      if (!E && !i)
        throw new Error("environment detection error");
      i ? R = self.location.href : typeof document != "undefined" && document.currentScript && (R = document.currentScript.src), g2 && (R = g2), R = R.indexOf("blob:") !== 0 ? R.substr(0, R.lastIndexOf("/") + 1) : "", G = function(A4) {
        try {
          var I4 = new XMLHttpRequest;
          return I4.open("GET", A4, false), I4.send(null), I4.responseText;
        } catch (I5) {
          var g3 = yA(A4);
          if (g3)
            return GA(g3);
          throw I5;
        }
      }, i && (y = function(A4) {
        try {
          var I4 = new XMLHttpRequest;
          return I4.open("GET", A4, false), I4.responseType = "arraybuffer", I4.send(null), new Uint8Array(I4.response);
        } catch (I5) {
          var g3 = yA(A4);
          if (g3)
            return g3;
          throw I5;
        }
      }), F = function(A4, I4, g3) {
        var B4 = new XMLHttpRequest;
        B4.open("GET", A4, true), B4.responseType = "arraybuffer", B4.onload = function() {
          if (B4.status == 200 || B4.status == 0 && B4.response)
            I4(B4.response);
          else {
            var C3 = yA(A4);
            C3 ? I4(C3.buffer) : g3();
          }
        }, B4.onerror = g3, B4.send(null);
      };
    }
    I3.print || console.log.bind(console);
    var S, N, h = I3.printErr || console.warn.bind(console);
    for (Q2 in a)
      a.hasOwnProperty(Q2) && (I3[Q2] = a[Q2]);
    function U(A4) {
      U.shown || (U.shown = {}), U.shown[A4] || (U.shown[A4] = 1, h(A4));
    }
    a = null, I3.arguments && I3.arguments, Object.getOwnPropertyDescriptor(I3, "arguments") || Object.defineProperty(I3, "arguments", { configurable: true, get: function() {
      z("Module.arguments has been replaced with plain arguments_ (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)");
    } }), I3.thisProgram && I3.thisProgram, Object.getOwnPropertyDescriptor(I3, "thisProgram") || Object.defineProperty(I3, "thisProgram", { configurable: true, get: function() {
      z("Module.thisProgram has been replaced with plain thisProgram (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)");
    } }), I3.quit && I3.quit, Object.getOwnPropertyDescriptor(I3, "quit") || Object.defineProperty(I3, "quit", { configurable: true, get: function() {
      z("Module.quit has been replaced with plain quit_ (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)");
    } }), k(I3.memoryInitializerPrefixURL === undefined, "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead"), k(I3.pthreadMainPrefixURL === undefined, "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead"), k(I3.cdInitializerPrefixURL === undefined, "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead"), k(I3.filePackagePrefixURL === undefined, "Module.filePackagePrefixURL option was removed, use Module.locateFile instead"), k(I3.read === undefined, "Module.read option was removed (modify read_ in JS)"), k(I3.readAsync === undefined, "Module.readAsync option was removed (modify readAsync in JS)"), k(I3.readBinary === undefined, "Module.readBinary option was removed (modify readBinary in JS)"), k(I3.setWindowTitle === undefined, "Module.setWindowTitle option was removed (modify setWindowTitle in JS)"), k(I3.TOTAL_MEMORY === undefined, "Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY"), Object.getOwnPropertyDescriptor(I3, "read") || Object.defineProperty(I3, "read", { configurable: true, get: function() {
      z("Module.read has been replaced with plain read_ (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)");
    } }), Object.getOwnPropertyDescriptor(I3, "readAsync") || Object.defineProperty(I3, "readAsync", { configurable: true, get: function() {
      z("Module.readAsync has been replaced with plain readAsync (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)");
    } }), Object.getOwnPropertyDescriptor(I3, "readBinary") || Object.defineProperty(I3, "readBinary", { configurable: true, get: function() {
      z("Module.readBinary has been replaced with plain readBinary (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)");
    } }), Object.getOwnPropertyDescriptor(I3, "setWindowTitle") || Object.defineProperty(I3, "setWindowTitle", { configurable: true, get: function() {
      z("Module.setWindowTitle has been replaced with plain setWindowTitle (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)");
    } }), I3.wasmBinary && (S = I3.wasmBinary), Object.getOwnPropertyDescriptor(I3, "wasmBinary") || Object.defineProperty(I3, "wasmBinary", { configurable: true, get: function() {
      z("Module.wasmBinary has been replaced with plain wasmBinary (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)");
    } }), I3.noExitRuntime, Object.getOwnPropertyDescriptor(I3, "noExitRuntime") || Object.defineProperty(I3, "noExitRuntime", { configurable: true, get: function() {
      z("Module.noExitRuntime has been replaced with plain noExitRuntime (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)");
    } }), typeof WebAssembly != "object" && z("no native wasm support detected");
    var L = false;
    function k(A4, I4) {
      A4 || z("Assertion failed: " + I4);
    }
    function t(A4, g3, B4, C3, Q3) {
      var E2 = { string: function(A5) {
        var I4 = 0;
        if (A5 != null && A5 !== 0) {
          var g4 = 1 + (A5.length << 2);
          n(A5, I4 = hA(g4), g4);
        }
        return I4;
      }, array: function(A5) {
        var I4 = hA(A5.length);
        return function(A6, I5) {
          k(A6.length >= 0, "writeArrayToMemory array must have a length (should be an array or typed array)"), c.set(A6, I5);
        }(A5, I4), I4;
      } }, i2 = function(A5) {
        var g4 = I3["_" + A5];
        return k(g4, "Cannot call unknown function " + A5 + ", make sure it is exported"), g4;
      }(A4), o2 = [], D2 = 0;
      if (k(g3 !== "array", 'Return type should not be "array".'), C3)
        for (var a2 = 0;a2 < C3.length; a2++) {
          var G2 = E2[B4[a2]];
          G2 ? (D2 === 0 && (D2 = SA()), o2[a2] = G2(C3[a2])) : o2[a2] = C3[a2];
        }
      var F2 = i2.apply(null, o2);
      return F2 = function(A5) {
        return g3 === "string" ? d(A5) : g3 === "boolean" ? Boolean(A5) : A5;
      }(F2), D2 !== 0 && NA(D2), F2;
    }
    var J, c, Y, M, K, H, q, r, e = typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : undefined;
    function d(A4, I4) {
      return A4 ? function(A5, I5, g3) {
        for (var B4 = I5 + g3, C3 = I5;A5[C3] && !(C3 >= B4); )
          ++C3;
        if (C3 - I5 > 16 && A5.subarray && e)
          return e.decode(A5.subarray(I5, C3));
        for (var Q3 = "";I5 < C3; ) {
          var E2 = A5[I5++];
          if (128 & E2) {
            var i2 = 63 & A5[I5++];
            if ((224 & E2) != 192) {
              var o2 = 63 & A5[I5++];
              if ((240 & E2) == 224 ? E2 = (15 & E2) << 12 | i2 << 6 | o2 : ((248 & E2) != 240 && U("Invalid UTF-8 leading byte 0x" + E2.toString(16) + " encountered when deserializing a UTF-8 string on the asm.js/wasm heap to a JS string!"), E2 = (7 & E2) << 18 | i2 << 12 | o2 << 6 | 63 & A5[I5++]), E2 < 65536)
                Q3 += String.fromCharCode(E2);
              else {
                var D2 = E2 - 65536;
                Q3 += String.fromCharCode(55296 | D2 >> 10, 56320 | 1023 & D2);
              }
            } else
              Q3 += String.fromCharCode((31 & E2) << 6 | i2);
          } else
            Q3 += String.fromCharCode(E2);
        }
        return Q3;
      }(Y, A4, I4) : "";
    }
    function n(A4, I4, g3) {
      return k(typeof g3 == "number", "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!"), function(A5, I5, g4, B4) {
        if (!(B4 > 0))
          return 0;
        for (var C3 = g4, Q3 = g4 + B4 - 1, E2 = 0;E2 < A5.length; ++E2) {
          var i2 = A5.charCodeAt(E2);
          if (i2 >= 55296 && i2 <= 57343 && (i2 = 65536 + ((1023 & i2) << 10) | 1023 & A5.charCodeAt(++E2)), i2 <= 127) {
            if (g4 >= Q3)
              break;
            I5[g4++] = i2;
          } else if (i2 <= 2047) {
            if (g4 + 1 >= Q3)
              break;
            I5[g4++] = 192 | i2 >> 6, I5[g4++] = 128 | 63 & i2;
          } else if (i2 <= 65535) {
            if (g4 + 2 >= Q3)
              break;
            I5[g4++] = 224 | i2 >> 12, I5[g4++] = 128 | i2 >> 6 & 63, I5[g4++] = 128 | 63 & i2;
          } else {
            if (g4 + 3 >= Q3)
              break;
            i2 >= 2097152 && U("Invalid Unicode code point 0x" + i2.toString(16) + " encountered when serializing a JS string to an UTF-8 string on the asm.js/wasm heap! (Valid unicode code points should be in range 0-0x1FFFFF)."), I5[g4++] = 240 | i2 >> 18, I5[g4++] = 128 | i2 >> 12 & 63, I5[g4++] = 128 | i2 >> 6 & 63, I5[g4++] = 128 | 63 & i2;
          }
        }
        return I5[g4] = 0, g4 - C3;
      }(A4, Y, I4, g3);
    }
    function T(A4) {
      J = A4, I3.HEAP8 = c = new Int8Array(A4), I3.HEAP16 = M = new Int16Array(A4), I3.HEAP32 = K = new Int32Array(A4), I3.HEAPU8 = Y = new Uint8Array(A4), I3.HEAPU16 = new Uint16Array(A4), I3.HEAPU32 = H = new Uint32Array(A4), I3.HEAPF32 = q = new Float32Array(A4), I3.HEAPF64 = r = new Float64Array(A4);
    }
    typeof TextDecoder != "undefined" && new TextDecoder("utf-16le");
    var W = 5242880;
    I3.TOTAL_STACK && k(W === I3.TOTAL_STACK, "the stack size can no longer be determined at runtime");
    var p, m = I3.INITIAL_MEMORY || 16777216;
    function f() {
      var A4 = kA();
      k((3 & A4) == 0), H[1 + (A4 >> 2)] = 34821223, H[2 + (A4 >> 2)] = 2310721022, K[0] = 1668509029;
    }
    function Z() {
      if (!L) {
        var A4 = kA(), I4 = H[1 + (A4 >> 2)], g3 = H[2 + (A4 >> 2)];
        I4 == 34821223 && g3 == 2310721022 || z("Stack overflow! Stack cookie has been overwritten, expected hex dwords 0x89BACDFE and 0x2135467, but received 0x" + g3.toString(16) + " " + I4.toString(16)), K[0] !== 1668509029 && z("Runtime error: The application has corrupted its heap memory area (address zero)!");
      }
    }
    Object.getOwnPropertyDescriptor(I3, "INITIAL_MEMORY") || Object.defineProperty(I3, "INITIAL_MEMORY", { configurable: true, get: function() {
      z("Module.INITIAL_MEMORY has been replaced with plain INITIAL_MEMORY (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)");
    } }), k(m >= W, "INITIAL_MEMORY should be larger than TOTAL_STACK, was " + m + "! (TOTAL_STACK=5242880)"), k(typeof Int32Array != "undefined" && typeof Float64Array != "undefined" && Int32Array.prototype.subarray !== undefined && Int32Array.prototype.set !== undefined, "JS engine does not provide full typed array support"), k(!I3.wasmMemory, "Use of `wasmMemory` detected.  Use -s IMPORTED_MEMORY to define wasmMemory externally"), k(m == 16777216, "Detected runtime INITIAL_MEMORY setting.  Use -s IMPORTED_MEMORY to define wasmMemory dynamically"), function() {
      var A4 = new Int16Array(1), I4 = new Int8Array(A4.buffer);
      if (A4[0] = 25459, I4[0] !== 115 || I4[1] !== 99)
        throw "Runtime error: expected the system to be little-endian!";
    }();
    var P = [], b = [], l = [], O = [], x = false;
    b.push({ func: function() {
      wA();
    } }), k(Math.imul, "This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill"), k(Math.fround, "This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill"), k(Math.clz32, "This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill"), k(Math.trunc, "This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
    var V = 0, j = null, X = null, u = {};
    function z(A4) {
      var g3, B4;
      I3.onAbort && I3.onAbort(A4), h(A4 += ""), L = true, A4 = "abort(" + A4 + ") at " + (B4 = function() {
        var A5 = new Error;
        if (!A5.stack) {
          try {
            throw new Error;
          } catch (I4) {
            A5 = I4;
          }
          if (!A5.stack)
            return "(no stack trace available)";
        }
        return A5.stack.toString();
      }(), I3.extraStackTrace && (B4 += "\n" + I3.extraStackTrace()), g3 = /\b_Z[\w\d_]+/g, B4.replace(g3, function(A5) {
        var I4 = DA(A5);
        return A5 === I4 ? A5 : I4 + " [" + A5 + "]";
      }));
      var Q3 = new WebAssembly.RuntimeError(A4);
      throw C2(Q3), Q3;
    }
    I3.preloadedImages = {}, I3.preloadedAudios = {};
    var v = { error: function() {
      z("Filesystem support (FS) was not included. The problem is that you are using files from JS, but files were not used from C/C++, so filesystem support was not auto-included. You can force-include filesystem support with  -s FORCE_FILESYSTEM=1");
    }, init: function() {
      v.error();
    }, createDataFile: function() {
      v.error();
    }, createPreloadedFile: function() {
      v.error();
    }, createLazyFile: function() {
      v.error();
    }, open: function() {
      v.error();
    }, mkdev: function() {
      v.error();
    }, registerDevice: function() {
      v.error();
    }, analyzePath: function() {
      v.error();
    }, loadFilesFromDB: function() {
      v.error();
    }, ErrnoError: function() {
      v.error();
    } };
    function _(A4, I4) {
      return String.prototype.startsWith ? A4.startsWith(I4) : A4.indexOf(I4) === 0;
    }
    I3.FS_createDataFile = v.createDataFile, I3.FS_createPreloadedFile = v.createPreloadedFile;
    var $ = "data:application/octet-stream;base64,";
    function AA(A4) {
      return _(A4, $);
    }
    function IA(A4) {
      return _(A4, "file://");
    }
    function gA(A4, g3) {
      return function() {
        var B4 = A4, C3 = g3;
        return g3 || (C3 = I3.asm), k(x, "native function `" + B4 + "` called before runtime initialization"), k(true, "native function `" + B4 + "` called after runtime exit (use NO_EXIT_RUNTIME to keep it alive after main() exits)"), C3[A4] || k(C3[A4], "exported native function `" + B4 + "` not found"), C3[A4].apply(null, arguments);
      };
    }
    function iA(A4) {
      try {
        if (A4 == EA && S)
          return new Uint8Array(S);
        var I4 = yA(A4);
        if (I4)
          return I4;
        if (y)
          return y(A4);
        throw "both async and sync fetching of the wasm failed";
      } catch (A5) {
        z(A5);
      }
    }
    function oA(A4) {
      for (;A4.length > 0; ) {
        var g3 = A4.shift();
        if (typeof g3 != "function") {
          var B4 = g3.func;
          typeof B4 == "number" ? g3.arg === undefined ? p.get(B4)() : p.get(B4)(g3.arg) : B4(g3.arg === undefined ? null : g3.arg);
        } else
          g3(I3);
      }
    }
    function DA(A4) {
      if (DA.recursionGuard = 1 + (0 | DA.recursionGuard), DA.recursionGuard > 1)
        return A4;
      var g3 = I3.___cxa_demangle || I3.__cxa_demangle;
      k(g3);
      var B4 = SA();
      try {
        var C3 = A4;
        C3.startsWith("__Z") && (C3 = C3.substr(1));
        var Q3 = function(A5) {
          for (var I4 = 0, g4 = 0;g4 < A5.length; ++g4) {
            var B5 = A5.charCodeAt(g4);
            B5 >= 55296 && B5 <= 57343 && (B5 = 65536 + ((1023 & B5) << 10) | 1023 & A5.charCodeAt(++g4)), B5 <= 127 ? ++I4 : I4 += B5 <= 2047 ? 2 : B5 <= 65535 ? 3 : 4;
          }
          return I4;
        }(C3) + 1, E2 = hA(Q3);
        n(C3, E2, Q3);
        var i2 = hA(4), o2 = g3(E2, 0, 0, i2);
        if (K[i2 >> 2] === 0 && o2)
          return d(o2);
      } catch (A5) {
      } finally {
        RA(o2), NA(B4), DA.recursionGuard < 2 && --DA.recursionGuard;
      }
      return A4;
    }
    function aA(A4) {
      try {
        return N.grow(A4 - J.byteLength + 65535 >>> 16), T(N.buffer), 1;
      } catch (I4) {
        console.error("emscripten_realloc_buffer: Attempted to grow heap from " + J.byteLength + " bytes to " + A4 + " bytes, but got error: " + I4);
      }
    }
    function GA(A4) {
      for (var I4 = [], g3 = 0;g3 < A4.length; g3++) {
        var B4 = A4[g3];
        B4 > 255 && (k(false, "Character code " + B4 + " (" + String.fromCharCode(B4) + ")  at offset " + g3 + " not in 0x00-0xFF."), B4 &= 255), I4.push(String.fromCharCode(B4));
      }
      return I4.join("");
    }
    AA(EA) || (BA = EA, EA = I3.locateFile ? I3.locateFile(BA, R) : R + BA);
    var FA = typeof atob == "function" ? atob : function(A4) {
      var I4, g3, B4, C3, Q3, E2, i2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", o2 = "", D2 = 0;
      A4 = A4.replace(/[^A-Za-z0-9\+\/\=]/g, "");
      do {
        I4 = i2.indexOf(A4.charAt(D2++)) << 2 | (C3 = i2.indexOf(A4.charAt(D2++))) >> 4, g3 = (15 & C3) << 4 | (Q3 = i2.indexOf(A4.charAt(D2++))) >> 2, B4 = (3 & Q3) << 6 | (E2 = i2.indexOf(A4.charAt(D2++))), o2 += String.fromCharCode(I4), Q3 !== 64 && (o2 += String.fromCharCode(g3)), E2 !== 64 && (o2 += String.fromCharCode(B4));
      } while (D2 < A4.length);
      return o2;
    };
    function yA(A4) {
      if (AA(A4))
        return function(A5) {
          if (typeof o == "boolean" && o) {
            var I4;
            try {
              I4 = Buffer.from(A5, "base64");
            } catch (g4) {
              I4 = new Buffer(A5, "base64");
            }
            return new Uint8Array(I4.buffer, I4.byteOffset, I4.byteLength);
          }
          try {
            for (var g3 = FA(A5), B4 = new Uint8Array(g3.length), C3 = 0;C3 < g3.length; ++C3)
              B4[C3] = g3.charCodeAt(C3);
            return B4;
          } catch (A6) {
            throw new Error("Converting base64 string to bytes failed.");
          }
        }(A4.slice($.length));
    }
    var sA = { emscripten_memcpy_big: function(A4, I4, g3) {
      Y.copyWithin(A4, I4, I4 + g3);
    }, emscripten_resize_heap: function(A4) {
      var I4 = Y.length;
      k(A4 > I4);
      var g3, B4, C3 = 2147483648;
      if (A4 > C3)
        return h("Cannot enlarge memory, asked to go up to " + A4 + " bytes, but the limit is 2147483648 bytes!"), false;
      for (var Q3 = 1;Q3 <= 4; Q3 *= 2) {
        var E2 = I4 * (1 + 0.2 / Q3);
        E2 = Math.min(E2, A4 + 100663296);
        var i2 = Math.min(C3, ((g3 = Math.max(A4, E2)) % (B4 = 65536) > 0 && (g3 += B4 - g3 % B4), g3));
        if (aA(i2))
          return true;
      }
      return h("Failed to grow the heap from " + I4 + " bytes to " + i2 + " bytes, not enough memory!"), false;
    }, setTempRet0: function(A4) {
    } };
    (function() {
      var A4, g3 = { env: sA, wasi_snapshot_preview1: sA };
      function B4(A5, g4) {
        var B5 = A5.exports;
        I3.asm = B5, k(N = I3.asm.memory, "memory not found in wasm exports"), T(N.buffer), k(p = I3.asm.__indirect_function_table, "table not found in wasm exports"), function(A6) {
          if (V--, I3.monitorRunDependencies && I3.monitorRunDependencies(V), A6 ? (k(u[A6]), delete u[A6]) : h("warning: run dependency removed without ID"), V == 0 && (j !== null && (clearInterval(j), j = null), X)) {
            var g5 = X;
            X = null, g5();
          }
        }("wasm-instantiate");
      }
      A4 = "wasm-instantiate", V++, I3.monitorRunDependencies && I3.monitorRunDependencies(V), A4 ? (k(!u[A4]), u[A4] = 1, j === null && typeof setInterval != "undefined" && (j = setInterval(function() {
        if (L)
          return clearInterval(j), void (j = null);
        var A5 = false;
        for (var I4 in u)
          A5 || (A5 = true, h("still waiting on run dependencies:")), h("dependency: " + I4);
        A5 && h("(end of list)");
      }, 1e4))) : h("warning: run dependency added without ID");
      var Q3 = I3;
      function o2(A5) {
        k(I3 === Q3, "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?"), Q3 = null, B4(A5.instance);
      }
      function D2(A5) {
        return function() {
          if (!S && (E || i)) {
            if (typeof fetch == "function" && !IA(EA))
              return fetch(EA, { credentials: "same-origin" }).then(function(A6) {
                if (!A6.ok)
                  throw "failed to load wasm binary file at '" + EA + "'";
                return A6.arrayBuffer();
              }).catch(function() {
                return iA(EA);
              });
            if (F)
              return new Promise(function(A6, I4) {
                F(EA, function(I5) {
                  A6(new Uint8Array(I5));
                }, I4);
              });
          }
          return Promise.resolve().then(function() {
            return iA(EA);
          });
        }().then(function(A6) {
          return WebAssembly.instantiate(A6, g3);
        }).then(A5, function(A6) {
          h("failed to asynchronously prepare wasm: " + A6), IA(EA) && h("warning: Loading from a file URI (" + EA + ") is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing"), z(A6);
        });
      }
      if (I3.instantiateWasm)
        try {
          return I3.instantiateWasm(g3, B4);
        } catch (A5) {
          return h("Module.instantiateWasm callback failed with error: " + A5), false;
        }
      (S || typeof WebAssembly.instantiateStreaming != "function" || AA(EA) || IA(EA) || typeof fetch != "function" ? D2(o2) : fetch(EA, { credentials: "same-origin" }).then(function(A5) {
        return WebAssembly.instantiateStreaming(A5, g3).then(o2, function(A6) {
          return h("wasm streaming compile failed: " + A6), h("falling back to ArrayBuffer instantiation"), D2(o2);
        });
      })).catch(C2);
    })();
    var wA = I3.___wasm_call_ctors = gA("__wasm_call_ctors");
    I3._malloc = gA("malloc");
    var RA = I3._free = gA("free");
    I3._ZSTD_isError = gA("ZSTD_isError"), I3._ZSTD_getErrorName = gA("ZSTD_getErrorName"), I3._ZSTD_compressBound = gA("ZSTD_compressBound"), I3._ZSTD_CCtx_setParameter = gA("ZSTD_CCtx_setParameter"), I3._ZSTD_compress = gA("ZSTD_compress"), I3._ZSTD_createCStream = gA("ZSTD_createCStream"), I3._ZSTD_freeCStream = gA("ZSTD_freeCStream"), I3._ZSTD_CStreamInSize = gA("ZSTD_CStreamInSize"), I3._ZSTD_CStreamOutSize = gA("ZSTD_CStreamOutSize"), I3._ZSTD_initCStream = gA("ZSTD_initCStream"), I3._ZSTD_compressStream2_simpleArgs = gA("ZSTD_compressStream2_simpleArgs"), I3._ZSTD_getFrameContentSize = gA("ZSTD_getFrameContentSize"), I3._ZSTD_decompress = gA("ZSTD_decompress"), I3._ZSTD_createDStream = gA("ZSTD_createDStream"), I3._ZSTD_freeDStream = gA("ZSTD_freeDStream"), I3._ZSTD_DStreamInSize = gA("ZSTD_DStreamInSize"), I3._ZSTD_DStreamOutSize = gA("ZSTD_DStreamOutSize"), I3._ZSTD_initDStream = gA("ZSTD_initDStream"), I3._ZSTD_decompressStream_simpleArgs = gA("ZSTD_decompressStream_simpleArgs"), I3._fflush = gA("fflush"), I3.___errno_location = gA("__errno_location");
    var SA = I3.stackSave = gA("stackSave"), NA = I3.stackRestore = gA("stackRestore"), hA = I3.stackAlloc = gA("stackAlloc"), UA = I3._emscripten_stack_init = function() {
      return (UA = I3._emscripten_stack_init = I3.asm.emscripten_stack_init).apply(null, arguments);
    };
    I3._emscripten_stack_get_free = function() {
      return (I3._emscripten_stack_get_free = I3.asm.emscripten_stack_get_free).apply(null, arguments);
    };
    var LA, kA = I3._emscripten_stack_get_end = function() {
      return (kA = I3._emscripten_stack_get_end = I3.asm.emscripten_stack_get_end).apply(null, arguments);
    };
    function tA(A4) {
      this.name = "ExitStatus", this.message = "Program terminated with exit(" + A4 + ")", this.status = A4;
    }
    function JA(A4) {
      function g3() {
        LA || (LA = true, I3.calledRun = true, L || (Z(), k(!x), x = true, oA(b), Z(), oA(l), B3(I3), I3.onRuntimeInitialized && I3.onRuntimeInitialized(), k(!I3._main, 'compiled without a main, but one is present. if you added it from JS, use Module["onRuntimeInitialized"]'), function() {
          if (Z(), I3.postRun)
            for (typeof I3.postRun == "function" && (I3.postRun = [I3.postRun]);I3.postRun.length; )
              A5 = I3.postRun.shift(), O.unshift(A5);
          var A5;
          oA(O);
        }()));
      }
      V > 0 || (UA(), f(), function() {
        if (I3.preRun)
          for (typeof I3.preRun == "function" && (I3.preRun = [I3.preRun]);I3.preRun.length; )
            A5 = I3.preRun.shift(), P.unshift(A5);
        var A5;
        oA(P);
      }(), V > 0 || (I3.setStatus ? (I3.setStatus("Running..."), setTimeout(function() {
        setTimeout(function() {
          I3.setStatus("");
        }, 1), g3();
      }, 1)) : g3(), Z()));
    }
    if (I3.___cxa_demangle = gA("__cxa_demangle"), Object.getOwnPropertyDescriptor(I3, "intArrayFromString") || (I3.intArrayFromString = function() {
      z("'intArrayFromString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "intArrayToString") || (I3.intArrayToString = function() {
      z("'intArrayToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "ccall") || (I3.ccall = function() {
      z("'ccall' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), I3.cwrap = function(A4, I4, g3, B4) {
      return function() {
        return t(A4, I4, g3, arguments);
      };
    }, I3.setValue = function(A4, I4, g3, B4) {
      switch ((g3 = g3 || "i8").charAt(g3.length - 1) === "*" && (g3 = "i32"), g3) {
        case "i1":
        case "i8":
          c[A4 >> 0] = I4;
          break;
        case "i16":
          M[A4 >> 1] = I4;
          break;
        case "i32":
          K[A4 >> 2] = I4;
          break;
        case "i64":
          QA = [I4 >>> 0, (CA = I4, +Math.abs(CA) >= 1 ? CA > 0 ? (0 | Math.min(+Math.floor(CA / 4294967296), 4294967295)) >>> 0 : ~~+Math.ceil((CA - +(~~CA >>> 0)) / 4294967296) >>> 0 : 0)], K[A4 >> 2] = QA[0], K[A4 + 4 >> 2] = QA[1];
          break;
        case "float":
          q[A4 >> 2] = I4;
          break;
        case "double":
          r[A4 >> 3] = I4;
          break;
        default:
          z("invalid type for setValue: " + g3);
      }
    }, I3.getValue = function(A4, I4, g3) {
      switch ((I4 = I4 || "i8").charAt(I4.length - 1) === "*" && (I4 = "i32"), I4) {
        case "i1":
        case "i8":
          return c[A4 >> 0];
        case "i16":
          return M[A4 >> 1];
        case "i32":
        case "i64":
          return K[A4 >> 2];
        case "float":
          return q[A4 >> 2];
        case "double":
          return r[A4 >> 3];
        default:
          z("invalid type for getValue: " + I4);
      }
      return null;
    }, Object.getOwnPropertyDescriptor(I3, "allocate") || (I3.allocate = function() {
      z("'allocate' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "UTF8ArrayToString") || (I3.UTF8ArrayToString = function() {
      z("'UTF8ArrayToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "UTF8ToString") || (I3.UTF8ToString = function() {
      z("'UTF8ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "stringToUTF8Array") || (I3.stringToUTF8Array = function() {
      z("'stringToUTF8Array' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "stringToUTF8") || (I3.stringToUTF8 = function() {
      z("'stringToUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "lengthBytesUTF8") || (I3.lengthBytesUTF8 = function() {
      z("'lengthBytesUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "stackTrace") || (I3.stackTrace = function() {
      z("'stackTrace' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "addOnPreRun") || (I3.addOnPreRun = function() {
      z("'addOnPreRun' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), I3.addOnInit = function(A4) {
      b.unshift(A4);
    }, Object.getOwnPropertyDescriptor(I3, "addOnPreMain") || (I3.addOnPreMain = function() {
      z("'addOnPreMain' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "addOnExit") || (I3.addOnExit = function() {
      z("'addOnExit' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "addOnPostRun") || (I3.addOnPostRun = function() {
      z("'addOnPostRun' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "writeStringToMemory") || (I3.writeStringToMemory = function() {
      z("'writeStringToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "writeArrayToMemory") || (I3.writeArrayToMemory = function() {
      z("'writeArrayToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "writeAsciiToMemory") || (I3.writeAsciiToMemory = function() {
      z("'writeAsciiToMemory' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "addRunDependency") || (I3.addRunDependency = function() {
      z("'addRunDependency' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
    }), Object.getOwnPropertyDescriptor(I3, "removeRunDependency") || (I3.removeRunDependency = function() {
      z("'removeRunDependency' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
    }), Object.getOwnPropertyDescriptor(I3, "FS_createFolder") || (I3.FS_createFolder = function() {
      z("'FS_createFolder' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "FS_createPath") || (I3.FS_createPath = function() {
      z("'FS_createPath' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
    }), Object.getOwnPropertyDescriptor(I3, "FS_createDataFile") || (I3.FS_createDataFile = function() {
      z("'FS_createDataFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
    }), Object.getOwnPropertyDescriptor(I3, "FS_createPreloadedFile") || (I3.FS_createPreloadedFile = function() {
      z("'FS_createPreloadedFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
    }), Object.getOwnPropertyDescriptor(I3, "FS_createLazyFile") || (I3.FS_createLazyFile = function() {
      z("'FS_createLazyFile' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
    }), Object.getOwnPropertyDescriptor(I3, "FS_createLink") || (I3.FS_createLink = function() {
      z("'FS_createLink' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "FS_createDevice") || (I3.FS_createDevice = function() {
      z("'FS_createDevice' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
    }), Object.getOwnPropertyDescriptor(I3, "FS_unlink") || (I3.FS_unlink = function() {
      z("'FS_unlink' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ). Alternatively, forcing filesystem support (-s FORCE_FILESYSTEM=1) can export this for you");
    }), Object.getOwnPropertyDescriptor(I3, "getLEB") || (I3.getLEB = function() {
      z("'getLEB' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "getFunctionTables") || (I3.getFunctionTables = function() {
      z("'getFunctionTables' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "alignFunctionTables") || (I3.alignFunctionTables = function() {
      z("'alignFunctionTables' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "registerFunctions") || (I3.registerFunctions = function() {
      z("'registerFunctions' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "addFunction") || (I3.addFunction = function() {
      z("'addFunction' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "removeFunction") || (I3.removeFunction = function() {
      z("'removeFunction' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "getFuncWrapper") || (I3.getFuncWrapper = function() {
      z("'getFuncWrapper' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "prettyPrint") || (I3.prettyPrint = function() {
      z("'prettyPrint' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "makeBigInt") || (I3.makeBigInt = function() {
      z("'makeBigInt' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "dynCall") || (I3.dynCall = function() {
      z("'dynCall' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "getCompilerSetting") || (I3.getCompilerSetting = function() {
      z("'getCompilerSetting' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "print") || (I3.print = function() {
      z("'print' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "printErr") || (I3.printErr = function() {
      z("'printErr' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "getTempRet0") || (I3.getTempRet0 = function() {
      z("'getTempRet0' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "setTempRet0") || (I3.setTempRet0 = function() {
      z("'setTempRet0' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "callMain") || (I3.callMain = function() {
      z("'callMain' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "abort") || (I3.abort = function() {
      z("'abort' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "stringToNewUTF8") || (I3.stringToNewUTF8 = function() {
      z("'stringToNewUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "setFileTime") || (I3.setFileTime = function() {
      z("'setFileTime' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "emscripten_realloc_buffer") || (I3.emscripten_realloc_buffer = function() {
      z("'emscripten_realloc_buffer' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "ENV") || (I3.ENV = function() {
      z("'ENV' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "ERRNO_CODES") || (I3.ERRNO_CODES = function() {
      z("'ERRNO_CODES' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "ERRNO_MESSAGES") || (I3.ERRNO_MESSAGES = function() {
      z("'ERRNO_MESSAGES' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "setErrNo") || (I3.setErrNo = function() {
      z("'setErrNo' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "readSockaddr") || (I3.readSockaddr = function() {
      z("'readSockaddr' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "writeSockaddr") || (I3.writeSockaddr = function() {
      z("'writeSockaddr' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "DNS") || (I3.DNS = function() {
      z("'DNS' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "getHostByName") || (I3.getHostByName = function() {
      z("'getHostByName' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "GAI_ERRNO_MESSAGES") || (I3.GAI_ERRNO_MESSAGES = function() {
      z("'GAI_ERRNO_MESSAGES' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "Protocols") || (I3.Protocols = function() {
      z("'Protocols' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "Sockets") || (I3.Sockets = function() {
      z("'Sockets' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "getRandomDevice") || (I3.getRandomDevice = function() {
      z("'getRandomDevice' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "traverseStack") || (I3.traverseStack = function() {
      z("'traverseStack' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "UNWIND_CACHE") || (I3.UNWIND_CACHE = function() {
      z("'UNWIND_CACHE' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "withBuiltinMalloc") || (I3.withBuiltinMalloc = function() {
      z("'withBuiltinMalloc' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "readAsmConstArgsArray") || (I3.readAsmConstArgsArray = function() {
      z("'readAsmConstArgsArray' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "readAsmConstArgs") || (I3.readAsmConstArgs = function() {
      z("'readAsmConstArgs' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "mainThreadEM_ASM") || (I3.mainThreadEM_ASM = function() {
      z("'mainThreadEM_ASM' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "jstoi_q") || (I3.jstoi_q = function() {
      z("'jstoi_q' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "jstoi_s") || (I3.jstoi_s = function() {
      z("'jstoi_s' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "getExecutableName") || (I3.getExecutableName = function() {
      z("'getExecutableName' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "listenOnce") || (I3.listenOnce = function() {
      z("'listenOnce' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "autoResumeAudioContext") || (I3.autoResumeAudioContext = function() {
      z("'autoResumeAudioContext' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "dynCallLegacy") || (I3.dynCallLegacy = function() {
      z("'dynCallLegacy' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "getDynCaller") || (I3.getDynCaller = function() {
      z("'getDynCaller' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "dynCall") || (I3.dynCall = function() {
      z("'dynCall' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "callRuntimeCallbacks") || (I3.callRuntimeCallbacks = function() {
      z("'callRuntimeCallbacks' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "abortStackOverflow") || (I3.abortStackOverflow = function() {
      z("'abortStackOverflow' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "reallyNegative") || (I3.reallyNegative = function() {
      z("'reallyNegative' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "unSign") || (I3.unSign = function() {
      z("'unSign' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "reSign") || (I3.reSign = function() {
      z("'reSign' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "formatString") || (I3.formatString = function() {
      z("'formatString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "PATH") || (I3.PATH = function() {
      z("'PATH' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "PATH_FS") || (I3.PATH_FS = function() {
      z("'PATH_FS' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "SYSCALLS") || (I3.SYSCALLS = function() {
      z("'SYSCALLS' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "syscallMmap2") || (I3.syscallMmap2 = function() {
      z("'syscallMmap2' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "syscallMunmap") || (I3.syscallMunmap = function() {
      z("'syscallMunmap' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "getSocketFromFD") || (I3.getSocketFromFD = function() {
      z("'getSocketFromFD' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "getSocketAddress") || (I3.getSocketAddress = function() {
      z("'getSocketAddress' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "JSEvents") || (I3.JSEvents = function() {
      z("'JSEvents' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "registerKeyEventCallback") || (I3.registerKeyEventCallback = function() {
      z("'registerKeyEventCallback' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "specialHTMLTargets") || (I3.specialHTMLTargets = function() {
      z("'specialHTMLTargets' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "maybeCStringToJsString") || (I3.maybeCStringToJsString = function() {
      z("'maybeCStringToJsString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "findEventTarget") || (I3.findEventTarget = function() {
      z("'findEventTarget' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "findCanvasEventTarget") || (I3.findCanvasEventTarget = function() {
      z("'findCanvasEventTarget' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "getBoundingClientRect") || (I3.getBoundingClientRect = function() {
      z("'getBoundingClientRect' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "fillMouseEventData") || (I3.fillMouseEventData = function() {
      z("'fillMouseEventData' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "registerMouseEventCallback") || (I3.registerMouseEventCallback = function() {
      z("'registerMouseEventCallback' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "registerWheelEventCallback") || (I3.registerWheelEventCallback = function() {
      z("'registerWheelEventCallback' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "registerUiEventCallback") || (I3.registerUiEventCallback = function() {
      z("'registerUiEventCallback' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "registerFocusEventCallback") || (I3.registerFocusEventCallback = function() {
      z("'registerFocusEventCallback' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "fillDeviceOrientationEventData") || (I3.fillDeviceOrientationEventData = function() {
      z("'fillDeviceOrientationEventData' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "registerDeviceOrientationEventCallback") || (I3.registerDeviceOrientationEventCallback = function() {
      z("'registerDeviceOrientationEventCallback' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "fillDeviceMotionEventData") || (I3.fillDeviceMotionEventData = function() {
      z("'fillDeviceMotionEventData' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "registerDeviceMotionEventCallback") || (I3.registerDeviceMotionEventCallback = function() {
      z("'registerDeviceMotionEventCallback' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "screenOrientation") || (I3.screenOrientation = function() {
      z("'screenOrientation' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "fillOrientationChangeEventData") || (I3.fillOrientationChangeEventData = function() {
      z("'fillOrientationChangeEventData' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "registerOrientationChangeEventCallback") || (I3.registerOrientationChangeEventCallback = function() {
      z("'registerOrientationChangeEventCallback' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "fillFullscreenChangeEventData") || (I3.fillFullscreenChangeEventData = function() {
      z("'fillFullscreenChangeEventData' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "registerFullscreenChangeEventCallback") || (I3.registerFullscreenChangeEventCallback = function() {
      z("'registerFullscreenChangeEventCallback' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "registerRestoreOldStyle") || (I3.registerRestoreOldStyle = function() {
      z("'registerRestoreOldStyle' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "hideEverythingExceptGivenElement") || (I3.hideEverythingExceptGivenElement = function() {
      z("'hideEverythingExceptGivenElement' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "restoreHiddenElements") || (I3.restoreHiddenElements = function() {
      z("'restoreHiddenElements' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "setLetterbox") || (I3.setLetterbox = function() {
      z("'setLetterbox' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "currentFullscreenStrategy") || (I3.currentFullscreenStrategy = function() {
      z("'currentFullscreenStrategy' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "restoreOldWindowedStyle") || (I3.restoreOldWindowedStyle = function() {
      z("'restoreOldWindowedStyle' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "softFullscreenResizeWebGLRenderTarget") || (I3.softFullscreenResizeWebGLRenderTarget = function() {
      z("'softFullscreenResizeWebGLRenderTarget' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "doRequestFullscreen") || (I3.doRequestFullscreen = function() {
      z("'doRequestFullscreen' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "fillPointerlockChangeEventData") || (I3.fillPointerlockChangeEventData = function() {
      z("'fillPointerlockChangeEventData' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "registerPointerlockChangeEventCallback") || (I3.registerPointerlockChangeEventCallback = function() {
      z("'registerPointerlockChangeEventCallback' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "registerPointerlockErrorEventCallback") || (I3.registerPointerlockErrorEventCallback = function() {
      z("'registerPointerlockErrorEventCallback' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "requestPointerLock") || (I3.requestPointerLock = function() {
      z("'requestPointerLock' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "fillVisibilityChangeEventData") || (I3.fillVisibilityChangeEventData = function() {
      z("'fillVisibilityChangeEventData' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "registerVisibilityChangeEventCallback") || (I3.registerVisibilityChangeEventCallback = function() {
      z("'registerVisibilityChangeEventCallback' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "registerTouchEventCallback") || (I3.registerTouchEventCallback = function() {
      z("'registerTouchEventCallback' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "fillGamepadEventData") || (I3.fillGamepadEventData = function() {
      z("'fillGamepadEventData' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "registerGamepadEventCallback") || (I3.registerGamepadEventCallback = function() {
      z("'registerGamepadEventCallback' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "registerBeforeUnloadEventCallback") || (I3.registerBeforeUnloadEventCallback = function() {
      z("'registerBeforeUnloadEventCallback' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "fillBatteryEventData") || (I3.fillBatteryEventData = function() {
      z("'fillBatteryEventData' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "battery") || (I3.battery = function() {
      z("'battery' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "registerBatteryEventCallback") || (I3.registerBatteryEventCallback = function() {
      z("'registerBatteryEventCallback' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "setCanvasElementSize") || (I3.setCanvasElementSize = function() {
      z("'setCanvasElementSize' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "getCanvasElementSize") || (I3.getCanvasElementSize = function() {
      z("'getCanvasElementSize' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "polyfillSetImmediate") || (I3.polyfillSetImmediate = function() {
      z("'polyfillSetImmediate' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "demangle") || (I3.demangle = function() {
      z("'demangle' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "demangleAll") || (I3.demangleAll = function() {
      z("'demangleAll' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "jsStackTrace") || (I3.jsStackTrace = function() {
      z("'jsStackTrace' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "stackTrace") || (I3.stackTrace = function() {
      z("'stackTrace' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "getEnvStrings") || (I3.getEnvStrings = function() {
      z("'getEnvStrings' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "checkWasiClock") || (I3.checkWasiClock = function() {
      z("'checkWasiClock' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "flush_NO_FILESYSTEM") || (I3.flush_NO_FILESYSTEM = function() {
      z("'flush_NO_FILESYSTEM' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "writeI53ToI64") || (I3.writeI53ToI64 = function() {
      z("'writeI53ToI64' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "writeI53ToI64Clamped") || (I3.writeI53ToI64Clamped = function() {
      z("'writeI53ToI64Clamped' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "writeI53ToI64Signaling") || (I3.writeI53ToI64Signaling = function() {
      z("'writeI53ToI64Signaling' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "writeI53ToU64Clamped") || (I3.writeI53ToU64Clamped = function() {
      z("'writeI53ToU64Clamped' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "writeI53ToU64Signaling") || (I3.writeI53ToU64Signaling = function() {
      z("'writeI53ToU64Signaling' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "readI53FromI64") || (I3.readI53FromI64 = function() {
      z("'readI53FromI64' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "readI53FromU64") || (I3.readI53FromU64 = function() {
      z("'readI53FromU64' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "convertI32PairToI53") || (I3.convertI32PairToI53 = function() {
      z("'convertI32PairToI53' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "convertU32PairToI53") || (I3.convertU32PairToI53 = function() {
      z("'convertU32PairToI53' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "uncaughtExceptionCount") || (I3.uncaughtExceptionCount = function() {
      z("'uncaughtExceptionCount' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "exceptionLast") || (I3.exceptionLast = function() {
      z("'exceptionLast' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "exceptionCaught") || (I3.exceptionCaught = function() {
      z("'exceptionCaught' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "ExceptionInfoAttrs") || (I3.ExceptionInfoAttrs = function() {
      z("'ExceptionInfoAttrs' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "ExceptionInfo") || (I3.ExceptionInfo = function() {
      z("'ExceptionInfo' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "CatchInfo") || (I3.CatchInfo = function() {
      z("'CatchInfo' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "exception_addRef") || (I3.exception_addRef = function() {
      z("'exception_addRef' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "exception_decRef") || (I3.exception_decRef = function() {
      z("'exception_decRef' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "Browser") || (I3.Browser = function() {
      z("'Browser' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "funcWrappers") || (I3.funcWrappers = function() {
      z("'funcWrappers' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "getFuncWrapper") || (I3.getFuncWrapper = function() {
      z("'getFuncWrapper' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "setMainLoop") || (I3.setMainLoop = function() {
      z("'setMainLoop' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "FS") || (I3.FS = function() {
      z("'FS' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "mmapAlloc") || (I3.mmapAlloc = function() {
      z("'mmapAlloc' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "MEMFS") || (I3.MEMFS = function() {
      z("'MEMFS' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "TTY") || (I3.TTY = function() {
      z("'TTY' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "PIPEFS") || (I3.PIPEFS = function() {
      z("'PIPEFS' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "SOCKFS") || (I3.SOCKFS = function() {
      z("'SOCKFS' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "_setNetworkCallback") || (I3._setNetworkCallback = function() {
      z("'_setNetworkCallback' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "tempFixedLengthArray") || (I3.tempFixedLengthArray = function() {
      z("'tempFixedLengthArray' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "miniTempWebGLFloatBuffers") || (I3.miniTempWebGLFloatBuffers = function() {
      z("'miniTempWebGLFloatBuffers' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "heapObjectForWebGLType") || (I3.heapObjectForWebGLType = function() {
      z("'heapObjectForWebGLType' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "heapAccessShiftForWebGLHeap") || (I3.heapAccessShiftForWebGLHeap = function() {
      z("'heapAccessShiftForWebGLHeap' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "GL") || (I3.GL = function() {
      z("'GL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "emscriptenWebGLGet") || (I3.emscriptenWebGLGet = function() {
      z("'emscriptenWebGLGet' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "computeUnpackAlignedImageSize") || (I3.computeUnpackAlignedImageSize = function() {
      z("'computeUnpackAlignedImageSize' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "emscriptenWebGLGetTexPixelData") || (I3.emscriptenWebGLGetTexPixelData = function() {
      z("'emscriptenWebGLGetTexPixelData' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "emscriptenWebGLGetUniform") || (I3.emscriptenWebGLGetUniform = function() {
      z("'emscriptenWebGLGetUniform' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "emscriptenWebGLGetVertexAttrib") || (I3.emscriptenWebGLGetVertexAttrib = function() {
      z("'emscriptenWebGLGetVertexAttrib' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "writeGLArray") || (I3.writeGLArray = function() {
      z("'writeGLArray' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "AL") || (I3.AL = function() {
      z("'AL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "SDL_unicode") || (I3.SDL_unicode = function() {
      z("'SDL_unicode' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "SDL_ttfContext") || (I3.SDL_ttfContext = function() {
      z("'SDL_ttfContext' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "SDL_audio") || (I3.SDL_audio = function() {
      z("'SDL_audio' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "SDL") || (I3.SDL = function() {
      z("'SDL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "SDL_gfx") || (I3.SDL_gfx = function() {
      z("'SDL_gfx' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "GLUT") || (I3.GLUT = function() {
      z("'GLUT' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "EGL") || (I3.EGL = function() {
      z("'EGL' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "GLFW_Window") || (I3.GLFW_Window = function() {
      z("'GLFW_Window' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "GLFW") || (I3.GLFW = function() {
      z("'GLFW' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "GLEW") || (I3.GLEW = function() {
      z("'GLEW' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "IDBStore") || (I3.IDBStore = function() {
      z("'IDBStore' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "runAndAbortIfError") || (I3.runAndAbortIfError = function() {
      z("'runAndAbortIfError' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "warnOnce") || (I3.warnOnce = function() {
      z("'warnOnce' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "stackSave") || (I3.stackSave = function() {
      z("'stackSave' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "stackRestore") || (I3.stackRestore = function() {
      z("'stackRestore' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "stackAlloc") || (I3.stackAlloc = function() {
      z("'stackAlloc' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "AsciiToString") || (I3.AsciiToString = function() {
      z("'AsciiToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "stringToAscii") || (I3.stringToAscii = function() {
      z("'stringToAscii' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "UTF16ToString") || (I3.UTF16ToString = function() {
      z("'UTF16ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "stringToUTF16") || (I3.stringToUTF16 = function() {
      z("'stringToUTF16' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "lengthBytesUTF16") || (I3.lengthBytesUTF16 = function() {
      z("'lengthBytesUTF16' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "UTF32ToString") || (I3.UTF32ToString = function() {
      z("'UTF32ToString' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "stringToUTF32") || (I3.stringToUTF32 = function() {
      z("'stringToUTF32' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "lengthBytesUTF32") || (I3.lengthBytesUTF32 = function() {
      z("'lengthBytesUTF32' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "allocateUTF8") || (I3.allocateUTF8 = function() {
      z("'allocateUTF8' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "allocateUTF8OnStack") || (I3.allocateUTF8OnStack = function() {
      z("'allocateUTF8OnStack' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), I3.writeStackCookie = f, I3.checkStackCookie = Z, Object.getOwnPropertyDescriptor(I3, "intArrayFromBase64") || (I3.intArrayFromBase64 = function() {
      z("'intArrayFromBase64' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), Object.getOwnPropertyDescriptor(I3, "tryParseAsDataURI") || (I3.tryParseAsDataURI = function() {
      z("'tryParseAsDataURI' was not exported. add it to EXTRA_EXPORTED_RUNTIME_METHODS (see the FAQ)");
    }), I3.ALLOC_NORMAL = 0, I3.ALLOC_STACK = 1, X = function A() {
      LA || JA(), LA || (X = A);
    }, I3.run = JA, I3.preInit)
      for (typeof I3.preInit == "function" && (I3.preInit = [I3.preInit]);I3.preInit.length > 0; )
        I3.preInit.pop()();
    return JA(), A3.ready;
  });
  A2.exports = B2;
}(C = { exports: {} }, C.exports), C.exports);
var E = Object.freeze(Object.assign(Object.create(null), Q, { default: Q }));
var i = function(A2, I2, g2) {
  this.positionPtr = A2, this.size = I2, this.dataPtr = g2;
};
var o = function() {
  function A2(A3) {
    this.zstdGetErrorName = A3.cwrap("ZSTD_getErrorName", "string", ["number"]), this.zstdIsError = A3.cwrap("ZSTD_isError", "number", ["number"]);
  }
  return A2.prototype.checkError = function(A3) {
    if (A3 < 0)
      throw new Error("ZSTD_ERROR: " + this.zstdGetErrorName(A3) + ",  error code: " + A3);
  }, A2;
}();
var D = null;
var a = null;
var G = function() {
  return !!D && !!a;
};
var F = function(A2) {
  function g2() {
    return A2 !== null && A2.apply(this, arguments) || this;
  }
  return I(g2, A2), g2.compress = function(A3, I2, B2) {
    if (I2 === undefined && (I2 = 3), B2 === undefined && (B2 = false), !G())
      throw new Error("Error: Zstd library not initialized. Please call the ZstdInit before usages");
    g2.isCompressInit || (g2.initCompressFunctions(), g2.isCompressInit = true);
    var C2, Q2 = D._malloc(g2.inputSizeCo), E2 = D._malloc(g2.outputSizeCo);
    try {
      C2 = g2.initCompressStream();
    } catch (A4) {
      throw D._free(Q2), D._free(E2), new Error(A4);
    }
    g2.setCompressionLevel(C2, I2, B2);
    var o2 = D._malloc(g2.positionSize), F2 = D._malloc(g2.positionSize), y = new Uint8Array([]), s2 = g2.inputSizeCo, w = 0;
    try {
      for (;w < A3.length; ) {
        var R = g2.calculateReadBytes(w, s2, A3);
        D.HEAPU8.set(A3.subarray(w, w + R), Q2), w += R;
        var S = R < s2, N = S ? g2.zstdEEnd : g2.zstdEContinue, h = new i(o2, R, Q2), U = undefined;
        do {
          var L = new i(F2, g2.outputSizeCo, E2);
          D.setValue(L.positionPtr, 0, "i32"), D.setValue(h.positionPtr, 0, "i32");
          var k = g2.zstdCompressStream2SimpleArgs(C2, L.dataPtr, L.size, L.positionPtr, h.dataPtr, h.size, h.positionPtr, N);
          a.checkError(k), y = g2.getDataFromTransformation(L, y), U = S ? k === 0 : D.getValue(h.positionPtr, "i32") === h.size;
        } while (!U);
        if (D.setValue(h.positionPtr, 0, "i32"), S)
          break;
      }
    } finally {
      g2.zstdFreeCStream(C2), D._free(Q2), D._free(E2), D._free(o2), D._free(F2);
    }
    return y;
  }, g2.setCompressionLevel = function(A3, I2, B2) {
    a.checkError(g2.zstdCCtxSetParameter(A3, g2.zstdCCompressionLevel, I2)), a.checkError(g2.zstdCCtxSetParameter(A3, g2.zstdCChecksumFlag, B2)), g2.zstdCCtxSetParameter(A3, g2.zstdCNbWorkers, 4);
  }, g2.initCompressStream = function() {
    var A3 = g2.zstdCreateCStream();
    if (g2.zstdInitCStream(A3), !A3)
      throw new Error("ZSTD Stream compress initialization failed.");
    return A3;
  }, g2.initCompressFunctions = function() {
    g2.zstdCStreamInSize = D.cwrap("ZSTD_CStreamInSize", "number", []), g2.zstdCStreamOutSize = D.cwrap("ZSTD_CStreamOutSize", "number", []), g2.zstdCreateCStream = D.cwrap("ZSTD_createCStream", "number", []), g2.zstdInitCStream = D.cwrap("ZSTD_initCStream", "number", ["number"]), g2.zstdCCtxSetParameter = D.cwrap("ZSTD_CCtx_setParameter", "number", ["number", "number", "number"]), g2.zstdCompressStream2SimpleArgs = D.cwrap("ZSTD_compressStream2_simpleArgs", "number", ["number", "number", "number", "number", "number", "number", "number"]), g2.zstdFreeCStream = D.cwrap("ZSTD_freeCStream", "number", ["number"]), g2.inputSizeCo = g2.zstdCStreamInSize(), g2.outputSizeCo = g2.zstdCStreamOutSize();
  }, g2.zstdEContinue = 1, g2.zstdEEnd = 2, g2.zstdCCompressionLevel = 100, g2.zstdCChecksumFlag = 201, g2.zstdCNbWorkers = 400, g2.isCompressInit = false, g2;
}(function() {
  function A2() {
  }
  return A2.decompress = function(I2) {
    if (!G())
      throw new Error("Error: Zstd library not initialized. Please call the ZstdInit before usages");
    A2.isDecompressInit || (A2.initDecompressFunctions(), A2.isDecompressInit = true);
    var g2, B2 = D._malloc(A2.inputSize * I2.BYTES_PER_ELEMENT), C2 = D._malloc(A2.outputSize * I2.BYTES_PER_ELEMENT), Q2 = A2.zstdCreateDStream();
    if (!Q2)
      throw D._free(B2), D._free(C2), new Error("ZSTD Stream decompress initialization failed.");
    g2 = A2.zstdInitDStream(Q2);
    var E2 = 0, o2 = D._malloc(A2.positionSize), F2 = D._malloc(A2.positionSize), y = new Uint8Array([]);
    try {
      for (;E2 < I2.length; ) {
        var s2 = A2.calculateReadBytes(E2, g2, I2);
        D.HEAPU8.set(I2.subarray(E2, E2 + s2), B2), E2 += s2;
        for (var w = s2 < g2, R = new i(o2, s2, B2);D.getValue(R.positionPtr, "i32") < R.size; ) {
          var S = new i(F2, A2.outputSize, C2);
          D.setValue(S.positionPtr, 0, "i32"), D.setValue(R.positionPtr, 0, "i32"), g2 = A2.zstdDecompressStreamSimpleArgs(Q2, S.dataPtr, S.size, S.positionPtr, R.dataPtr, R.size, R.positionPtr), a.checkError(g2), y = A2.getDataFromTransformation(S, y);
        }
        if (D.setValue(R.positionPtr, 0, "i32"), w)
          break;
      }
    } finally {
      A2.zstdFreeDStream(Q2), D._free(B2), D._free(C2), D._free(o2), D._free(F2);
    }
    return y;
  }, A2.getDataFromTransformation = function(A3, I2) {
    var g2 = D.HEAPU8.subarray(A3.dataPtr, A3.dataPtr + D.getValue(A3.positionPtr, "i32")), B2 = new Uint8Array(I2.length + g2.length);
    return B2.set(I2), B2.set(g2, I2.length), B2;
  }, A2.initDecompressFunctions = function() {
    A2.zstdDStreamInSize = D.cwrap("ZSTD_DStreamInSize", "number", []), A2.zstdDStreamOutSize = D.cwrap("ZSTD_DStreamOutSize", "number", []), A2.zstdCreateDStream = D.cwrap("ZSTD_createDStream", "number", []), A2.zstdInitDStream = D.cwrap("ZSTD_initDStream", "number", ["number"]), A2.zstdDecompressStreamSimpleArgs = D.cwrap("ZSTD_decompressStream_simpleArgs", "number", ["number", "number", "number", "number", "number", "number"]), A2.zstdFreeDStream = D.cwrap("ZSTD_freeDStream", "number", ["number"]), A2.inputSize = A2.zstdDStreamInSize(), A2.outputSize = A2.zstdDStreamOutSize();
  }, A2.positionSize = 4, A2.isDecompressInit = false, A2.calculateReadBytes = function(A3, I2, g2) {
    return Math.min(A3 + I2, g2.length) - A3;
  }, A2;
}());
var y = function(A2) {
  function g2() {
    return A2 !== null && A2.apply(this, arguments) || this;
  }
  return I(g2, A2), g2.compress = function(A3, I2) {
    if (I2 === undefined && (I2 = 3), !G())
      throw new Error("Error: Zstd library not initialized. Please call the ZstdInit before usages");
    if (g2.isCompressInit || (g2.initCompressFunctions(), g2.isCompressInit = true), A3.length <= 100)
      throw new Error("Length of the payload is too small. (Min length: >100)");
    var B2 = A3.byteLength + g2.zstdFrameHeaderSizeMax, C2 = g2.createArrayPointer(A3, B2), Q2 = D._malloc(g2.zstdCompressBound(A3.length));
    try {
      var E2 = g2.zstdCompress(Q2, g2.zstdCompressBound(A3.length), C2, B2, I2);
      return a.checkError(E2), new Uint8Array(D.HEAPU8.subarray(Q2, Q2 + E2));
    } finally {
      D._free(C2), D._free(Q2);
    }
  }, g2.initCompressFunctions = function() {
    g2.zstdCompress = D.cwrap("ZSTD_compress", "number", ["number", "number", "number", "number", "number"]), g2.zstdCompressBound = D.cwrap("ZSTD_compressBound", "number", ["number"]);
  }, g2.isCompressInit = false, g2;
}(function() {
  function A2() {
  }
  return A2.decompress = function(I2) {
    if (!G())
      throw new Error("Error: Zstd library not initialized. Please call the ZstdInit before usages");
    A2.isDecompressInit || (A2.initDecompressFunctions(), A2.isDecompressInit = true);
    var g2 = I2.length, B2 = A2.createArrayPointer(I2, g2), C2 = A2.zstdGetFrameContentSize(B2, g2), Q2 = D._malloc(C2);
    a.checkError(C2);
    try {
      var E2 = A2.zstdDecompress(Q2, C2, B2, g2);
      return a.checkError(E2), new Uint8Array(D.HEAPU8.subarray(Q2, Q2 + E2 - A2.zstdFrameHeaderSizeMax));
    } finally {
      D._free(B2), D._free(Q2);
    }
  }, A2.initDecompressFunctions = function() {
    A2.zstdDecompress = D.cwrap("ZSTD_decompress", "number", ["number", "number", "number", "number"]), A2.zstdGetFrameContentSize = D.cwrap("ZSTD_getFrameContentSize", "number", ["number", "number"]);
  }, A2.createArrayPointer = function(A3, I2) {
    var g2 = D._malloc(I2);
    return D.HEAPU8.set(A3, g2), g2;
  }, A2.zstdFrameHeaderSizeMax = 18, A2.isDecompressInit = false, A2;
}());

// src/bun/core/Updater.ts
var appSupportDir = join(homedir(), "Library", "Application Support");
var localInfo;
var updateInfo;
var Updater = {
  updateInfo: () => {
    return updateInfo;
  },
  checkForUpdate: async () => {
    const localInfo2 = await Updater.getLocallocalInfo();
    if (localInfo2.channel === "dev") {
      return {
        version: localInfo2.version,
        hash: localInfo2.hash,
        updateAvailable: false,
        updateReady: false,
        error: ""
      };
    }
    const channelBucketUrl = await Updater.channelBucketUrl();
    const cacheBuster = Math.random().toString(36).substring(7);
    const updateInfoResponse = await fetch(join(channelBucketUrl, `update.json?${cacheBuster}`));
    if (updateInfoResponse.ok) {
      updateInfo = await updateInfoResponse.json();
      if (updateInfo.hash !== localInfo2.hash) {
        updateInfo.updateAvailable = true;
      }
    } else {
      console.error("Failed to fetch update info", updateInfoResponse);
    }
    return updateInfo;
  },
  downloadUpdate: async () => {
    const appDataFolder = await Updater.appDataFolder();
    const channelBucketUrl = await Updater.channelBucketUrl();
    const appFileName = localInfo.name;
    let currentHash = (await Updater.getLocallocalInfo()).hash;
    let latestHash = (await Updater.checkForUpdate()).hash;
    let currentTarPath = join(appDataFolder, "self-extraction", `${currentHash}.tar`);
    const latestTarPath = join(appDataFolder, "self-extraction", `${latestHash}.tar`);
    const seenHashes = [];
    if (!await Bun.file(latestTarPath).exists()) {
      while (currentHash !== latestHash) {
        seenHashes.push(currentHash);
        const currentTar = Bun.file(currentTarPath);
        if (!await currentTar.exists()) {
          break;
        }
        const patchResponse = await fetch(join(channelBucketUrl, `${currentHash}.patch`));
        if (!patchResponse.ok) {
          break;
        }
        const patchFilePath = join(appDataFolder, "self-extraction", `${currentHash}.patch`);
        await Bun.write(patchFilePath, await patchResponse.arrayBuffer());
        const tmpPatchedTarFilePath = join(appDataFolder, "self-extraction", `from-${currentHash}.tar`);
        try {
          Bun.spawnSync([
            "bspatch",
            currentTarPath,
            tmpPatchedTarFilePath,
            patchFilePath
          ]);
        } catch (error) {
          break;
        }
        let versionSubpath = "";
        const untarDir = join(appDataFolder, "self-extraction", "tmpuntar");
        mkdirSync(untarDir, { recursive: true });
        await import_tar.default.x({
          file: tmpPatchedTarFilePath,
          cwd: untarDir,
          filter: (path, stat) => {
            if (path.endsWith("Resources/version.json")) {
              versionSubpath = path;
              return true;
            } else {
              return false;
            }
          }
        });
        const currentVersionJson = await Bun.file(join(untarDir, versionSubpath)).json();
        const nextHash = currentVersionJson.hash;
        if (seenHashes.includes(nextHash)) {
          console.log("Warning: cyclical update detected");
          break;
        }
        seenHashes.push(nextHash);
        if (!nextHash) {
          break;
        }
        const updatedTarPath = join(appDataFolder, "self-extraction", `${nextHash}.tar`);
        renameSync(tmpPatchedTarFilePath, updatedTarPath);
        unlinkSync(currentTarPath);
        unlinkSync(patchFilePath);
        rmdirSync(untarDir, { recursive: true });
        currentHash = nextHash;
        currentTarPath = join(appDataFolder, "self-extraction", `${currentHash}.tar`);
      }
      if (currentHash !== latestHash) {
        const cacheBuster = Math.random().toString(36).substring(7);
        const urlToLatestTarball = join(channelBucketUrl, `${appFileName}.app.tar.zst`);
        const prevVersionCompressedTarballPath = join(appDataFolder, "self-extraction", "latest.tar.zst");
        const response = await fetch(urlToLatestTarball + `?${cacheBuster}`);
        if (response.ok && response.body) {
          const reader = response.body.getReader();
          const writer = Bun.file(prevVersionCompressedTarballPath).writer();
          while (true) {
            const { done, value } = await reader.read();
            if (done)
              break;
            await writer.write(value);
          }
          await writer.flush();
          writer.end();
        } else {
          console.log("latest version not found at: ", urlToLatestTarball);
        }
        await s().then(async ({ ZstdSimple }) => {
          const data = new Uint8Array(await Bun.file(prevVersionCompressedTarballPath).arrayBuffer());
          const uncompressedData = ZstdSimple.decompress(data);
          await Bun.write(latestTarPath, uncompressedData);
        });
        unlinkSync(prevVersionCompressedTarballPath);
        try {
          unlinkSync(currentTarPath);
        } catch (error) {
        }
      }
    }
    if (await Bun.file(latestTarPath).exists()) {
      updateInfo.updateReady = true;
    } else {
      updateInfo.error = "Failed to download latest version";
    }
  },
  applyUpdate: async () => {
    if (updateInfo?.updateReady) {
      const appDataFolder = await Updater.appDataFolder();
      const extractionFolder = join(appDataFolder, "self-extraction");
      let latestHash = (await Updater.checkForUpdate()).hash;
      const latestTarPath = join(extractionFolder, `${latestHash}.tar`);
      let appBundleSubpath = "";
      if (await Bun.file(latestTarPath).exists()) {
        await import_tar.default.x({
          file: latestTarPath,
          cwd: extractionFolder,
          onentry: (entry) => {
            if (!appBundleSubpath && entry.path.endsWith(".app/")) {
              appBundleSubpath = entry.path;
            }
          }
        });
        if (!appBundleSubpath) {
          console.error("Failed to find app bundle in tarball");
          return;
        }
        const newAppBundlePath = resolve(join(extractionFolder, appBundleSubpath));
        const runningAppBundlePath = resolve(dirname(process.execPath), "..", "..");
        const backupAppBundlePath = join(extractionFolder, "backup.app");
        try {
          if (statSync(backupAppBundlePath, { throwIfNoEntry: false })) {
            rmdirSync(backupAppBundlePath, { recursive: true });
          } else {
            console.log("backupAppBundlePath does not exist");
          }
          renameSync(runningAppBundlePath, backupAppBundlePath);
          renameSync(newAppBundlePath, runningAppBundlePath);
        } catch (error) {
          console.error("Failed to replace app with new version", error);
          return;
        }
        await Bun.spawn(["open", runningAppBundlePath]);
        process.exit(0);
      }
    }
  },
  channelBucketUrl: async () => {
    await Updater.getLocallocalInfo();
    return join(localInfo.bucketUrl, localInfo.channel);
  },
  appDataFolder: async () => {
    await Updater.getLocallocalInfo();
    const appDataFolder = join(appSupportDir, localInfo.identifier, localInfo.name);
    return appDataFolder;
  },
  localInfo: {
    version: async () => {
      return (await Updater.getLocallocalInfo()).version;
    },
    hash: async () => {
      return (await Updater.getLocallocalInfo()).hash;
    },
    channel: async () => {
      return (await Updater.getLocallocalInfo()).channel;
    },
    bucketUrl: async () => {
      return (await Updater.getLocallocalInfo()).bucketUrl;
    }
  },
  getLocallocalInfo: async () => {
    if (localInfo) {
      return localInfo;
    }
    try {
      localInfo = await Bun.file("../Resources/version.json").json();
      return localInfo;
    } catch (error) {
      console.error("Failed to read version.json", error);
      throw error;
    }
  }
};

// src/bun/core/BrowserView.ts
var BrowserViewMap = {};
var nextWebviewId = 1;
var CHUNK_SIZE = 4096;
var defaultOptions = {
  url: "https://electrobun.dev",
  html: null,
  preload: null,
  frame: {
    x: 0,
    y: 0,
    width: 800,
    height: 600
  }
};
var internalSyncRpcHandlers = {
  webviewTagInit: ({
    hostWebviewId,
    windowId,
    url,
    html,
    preload,
    partition,
    frame
  }) => {
    const webviewForTag = new BrowserView({
      url,
      html,
      preload,
      partition,
      frame,
      hostWebviewId,
      autoResize: false
    });
    setTimeout(() => {
      zigRPC.request.addWebviewToWindow({
        windowId,
        webviewId: webviewForTag.id
      });
      if (url) {
        webviewForTag.loadURL(url);
      } else if (html) {
        webviewForTag.loadHTML(html);
      }
    }, 100);
    return webviewForTag.id;
  }
};
var hash = await Updater.localInfo.hash();
var randomId = Math.random().toString(36).substring(7);

class BrowserView {
  id = nextWebviewId++;
  hostWebviewId;
  url = null;
  html = null;
  preload = null;
  partition = null;
  autoResize = true;
  frame = {
    x: 0,
    y: 0,
    width: 800,
    height: 600
  };
  pipePrefix;
  inStream;
  outStream;
  rpc;
  syncRpc;
  constructor(options = defaultOptions) {
    this.url = options.url || defaultOptions.url;
    this.html = options.html || defaultOptions.html;
    this.preload = options.preload || defaultOptions.preload;
    this.frame = options.frame ? { ...defaultOptions.frame, ...options.frame } : { ...defaultOptions.frame };
    this.rpc = options.rpc;
    this.syncRpc = { ...options.syncRpc || {}, ...internalSyncRpcHandlers };
    this.partition = options.partition || null;
    this.pipePrefix = `/private/tmp/electrobun_ipc_pipe_${hash}_${randomId}_${this.id}`;
    this.hostWebviewId = options.hostWebviewId;
    this.autoResize = options.autoResize === false ? false : true;
    this.init();
  }
  init() {
    zigRPC.request.createWebview({
      id: this.id,
      hostWebviewId: this.hostWebviewId || null,
      pipePrefix: this.pipePrefix,
      partition: this.partition,
      url: this.url,
      html: this.html,
      preload: this.preload,
      frame: {
        width: this.frame.width,
        height: this.frame.height,
        x: this.frame.x,
        y: this.frame.y
      },
      autoResize: this.autoResize
    });
    this.createStreams();
    BrowserViewMap[this.id] = this;
  }
  createStreams() {
    const webviewPipeIn = this.pipePrefix + "_in";
    const webviewPipeOut = this.pipePrefix + "_out";
    try {
      execSync("mkfifo " + webviewPipeOut);
    } catch (e) {
      console.log("pipe out already exists");
    }
    try {
      execSync("mkfifo " + webviewPipeIn);
    } catch (e) {
      console.log("pipe in already exists");
    }
    const inStream = fs.createWriteStream(webviewPipeIn, {
      flags: "r+"
    });
    inStream.write("\n");
    this.inStream = inStream;
    const outStream = fs.createReadStream(webviewPipeOut, {
      flags: "r+"
    });
    this.outStream = outStream;
    if (this.rpc) {
      this.rpc.setTransport(this.createTransport());
    }
  }
  sendMessageToWebview(jsonMessage) {
    const stringifiedMessage = typeof jsonMessage === "string" ? jsonMessage : JSON.stringify(jsonMessage);
    const wrappedMessage = `window.__electrobun.receiveMessageFromBun(${stringifiedMessage})`;
    this.executeJavascript(wrappedMessage);
  }
  executeJavascript(js) {
    let offset = 0;
    while (offset < js.length) {
      const chunk = js.slice(offset, offset + CHUNK_SIZE);
      this.inStream.write(chunk);
      offset += CHUNK_SIZE;
    }
    this.inStream.write("\n");
  }
  loadURL(url) {
    this.url = url;
    zigRPC.request.loadURL({ webviewId: this.id, url: this.url });
  }
  loadHTML(html) {
    this.html = html;
    zigRPC.request.loadHTML({ webviewId: this.id, html: this.html });
  }
  on(name, handler) {
    const specificName = `${name}-${this.id}`;
    eventEmitter_default.on(specificName, handler);
  }
  createTransport = () => {
    const that = this;
    return {
      send(message) {
        try {
          const messageString = JSON.stringify(message);
          that.sendMessageToWebview(messageString);
        } catch (error) {
          console.error("bun: failed to serialize message to webview", error);
        }
      },
      registerHandler(handler) {
        let buffer = "";
        setTimeout(() => {
          that.outStream.on("data", (chunk) => {
            buffer += chunk.toString();
            let eolIndex;
            while ((eolIndex = buffer.indexOf("\n")) >= 0) {
              const line = buffer.slice(0, eolIndex).trim();
              buffer = buffer.slice(eolIndex + 1);
              if (line) {
                try {
                  const event5 = JSON.parse(line);
                  handler(event5);
                } catch (error) {
                  console.error("webview: ", line);
                }
              }
            }
          });
        }, 500);
      }
    };
  };
  static getById(id) {
    return BrowserViewMap[id];
  }
  static getAll() {
    return Object.values(BrowserViewMap);
  }
  static defineRPC(config) {
    const rpcOptions = {
      maxRequestTime: config.maxRequestTime,
      requestHandler: config.handlers.requests,
      transport: {
        registerHandler: () => {
        }
      }
    };
    const rpc2 = createRPC(rpcOptions);
    const messageHandlers = config.handlers.messages;
    if (messageHandlers) {
      rpc2.addMessageListener("*", (messageName, payload) => {
        const globalHandler = messageHandlers["*"];
        if (globalHandler) {
          globalHandler(messageName, payload);
        }
        const messageHandler = messageHandlers[messageName];
        if (messageHandler) {
          messageHandler(payload);
        }
      });
    }
    return rpc2;
  }
}

// src/bun/core/Paths.ts
var exports_Paths = {};
__export(exports_Paths, {
  VIEWS_FOLDER: () => {
    {
      return VIEWS_FOLDER;
    }
  }
});
import {resolve as resolve2} from "path";
var RESOURCES_FOLDER = resolve2("../Resources/");
var VIEWS_FOLDER = resolve2(RESOURCES_FOLDER, "app/views");

// src/bun/core/Tray.ts
import {join as join2} from "path";
var nextTrayId = 1;
var TrayMap = {};

class Tray {
  id = nextTrayId++;
  constructor({
    title = "",
    image = "",
    template = true,
    width = 16,
    height = 16
  } = {}) {
    console.log("img", image);
    console.log("img", this.resolveImagePath(image));
    zigRPC.request.createTray({
      id: this.id,
      title,
      image: this.resolveImagePath(image),
      template,
      width,
      height
    });
    TrayMap[this.id] = this;
  }
  resolveImagePath(imgPath) {
    if (imgPath.startsWith("views://")) {
      return join2(VIEWS_FOLDER, imgPath.replace("views://", ""));
    } else {
      return imgPath;
    }
  }
  setTitle(title) {
    zigRPC.request.setTrayTitle({ id: this.id, title });
  }
  setImage(imgPath) {
    zigRPC.request.setTrayImage({
      id: this.id,
      image: this.resolveImagePath(imgPath)
    });
  }
  setMenu(menu) {
    const menuWithDefaults = menuConfigWithDefaults(menu);
    zigRPC.request.setTrayMenu({
      id: this.id,
      menuConfig: JSON.stringify(menuWithDefaults)
    });
  }
  on(name, handler) {
    const specificName = `${name}-${this.id}`;
    eventEmitter_default.on(specificName, handler);
  }
  static getById(id) {
    return TrayMap[id];
  }
  static getAll() {
    return Object.values(TrayMap);
  }
}
var menuConfigWithDefaults = (menu) => {
  return menu.map((item) => {
    if (item.type === "divider" || item.type === "separator") {
      return { type: "divider" };
    } else {
      return {
        label: item.label || "",
        type: item.type || "normal",
        action: item.action || "",
        enabled: item.enabled === false ? false : true,
        checked: Boolean(item.checked),
        hidden: Boolean(item.hidden),
        tooltip: item.tooltip || undefined,
        ...item.submenu ? { submenu: menuConfigWithDefaults(item.submenu) } : {}
      };
    }
  });
};

// src/bun/proc/zig.ts
var createStdioTransport = function(proc) {
  return {
    send(message) {
      try {
        const messageString = JSON.stringify(message) + "\n";
        let offset = 0;
        while (offset < messageString.length) {
          const chunk = messageString.slice(offset, offset + CHUNK_SIZE2);
          inStream.write(chunk);
          offset += CHUNK_SIZE2;
        }
        inStream.write("\n");
      } catch (error) {
        console.error("bun: failed to serialize message to zig", error);
      }
    },
    registerHandler(handler) {
      async function readStream(stream) {
        const reader = stream.getReader();
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done)
              break;
            buffer += new TextDecoder().decode(value);
            let eolIndex;
            while ((eolIndex = buffer.indexOf("\n")) >= 0) {
              const line = buffer.slice(0, eolIndex).trim();
              buffer = buffer.slice(eolIndex + 1);
              if (line) {
                try {
                  const event5 = JSON.parse(line);
                  handler(event5);
                } catch (error) {
                  console.error("zig: ", line);
                }
              }
            }
          }
        } catch (error) {
          console.error("Error reading from stream:", error);
        } finally {
          reader.releaseLock();
        }
      }
      readStream(proc.stdout);
    }
  };
};
var CHUNK_SIZE2 = 4096;
var webviewBinaryPath = join3("native", "webview");
var hash2 = await Updater.localInfo.hash();
var randomId2 = Math.random().toString(36).substring(7);
var mainPipe = `/private/tmp/electrobun_ipc_pipe_${hash2}_${randomId2}_main_in`;
try {
  execSync2("mkfifo " + mainPipe);
} catch (e) {
  console.log("pipe out already exists");
}
var zigProc = Bun.spawn([webviewBinaryPath], {
  stdin: "pipe",
  stdout: "pipe",
  env: {
    ...process.env,
    ELECTROBUN_VIEWS_FOLDER: resolve3("../Resources/app/views"),
    MAIN_PIPE_IN: mainPipe
  },
  onExit: (_zigProc) => {
    process.exit(0);
  }
});
process.on("SIGINT", (code) => {
  zigProc.kill();
  process.exit();
});
process.on("exit", (code) => {
  zigProc.kill();
});
var inStream = fs2.createWriteStream(mainPipe, {
  flags: "r+"
});
var zigRPC = createRPC({
  transport: createStdioTransport(zigProc),
  requestHandler: {
    decideNavigation: ({ webviewId, url }) => {
      const willNavigate = eventEmitter_default.events.webview.willNavigate({
        url,
        webviewId
      });
      let result;
      result = eventEmitter_default.emitEvent(willNavigate);
      result = eventEmitter_default.emitEvent(willNavigate, webviewId);
      if (willNavigate.responseWasSet) {
        return willNavigate.response || { allow: true };
      } else {
        return { allow: true };
      }
    },
    syncRequest: ({ webviewId, request: requestStr }) => {
      const webview = BrowserView.getById(webviewId);
      const { method, params } = JSON.parse(requestStr);
      if (!webview) {
        const err = `error: could not find webview with id ${webviewId}`;
        console.log(err);
        return { payload: err };
      }
      if (!method) {
        const err = `error: request missing a method`;
        console.log(err);
        return { payload: err };
      }
      if (!webview.syncRpc || !webview.syncRpc[method]) {
        const err = `error: webview does not have a handler for method ${method}`;
        console.log(err);
        return { payload: err };
      }
      const handler = webview.syncRpc[method];
      var response;
      try {
        response = handler(params);
        if (response === undefined) {
          response = "";
        }
      } catch (err) {
        console.log(err);
        console.log("syncRPC failed with", { method, params });
        return { payload: String(err) };
      }
      const payload = JSON.stringify(response);
      return { payload };
    },
    log: ({ msg }) => {
      console.log("zig: ", msg);
      return { success: true };
    },
    trayEvent: ({ id, action }) => {
      const tray = Tray.getById(id);
      if (!tray) {
        return { success: true };
      }
      const event5 = eventEmitter_default.events.tray.trayClicked({
        id,
        action
      });
      let result;
      result = eventEmitter_default.emitEvent(event5);
      result = eventEmitter_default.emitEvent(event5, id);
      return { success: true };
    },
    applicationMenuEvent: ({ id, action }) => {
      const event5 = eventEmitter_default.events.app.applicationMenuClicked({
        id,
        action
      });
      let result;
      result = eventEmitter_default.emitEvent(event5);
      return { success: true };
    },
    contextMenuEvent: ({ action }) => {
      const event5 = eventEmitter_default.events.app.contextMenuClicked({
        action
      });
      let result;
      result = eventEmitter_default.emitEvent(event5);
      return { success: true };
    },
    webviewEvent: ({ id, eventName, detail }) => {
      const eventMap = {
        "did-navigate": "didNavigate",
        "did-navigate-in-page": "didNavigateInPage",
        "did-commit-navigation": "didCommitNavigation",
        "dom-ready": "domReady",
        "new-window-open": "newWindowOpen"
      };
      const handler = eventEmitter_default.events.webview[eventMap[eventName]];
      if (!handler) {
        console.log(`!!!no handler for webview event ${eventName}`);
        return { success: false };
      }
      const event5 = handler({
        id,
        detail
      });
      let result;
      result = eventEmitter_default.emitEvent(event5);
      result = eventEmitter_default.emitEvent(event5, id);
      return { success: true };
    },
    windowClose: ({ id }) => {
      const handler = eventEmitter_default.events.window.close;
      const event5 = handler({
        id
      });
      let result;
      result = eventEmitter_default.emitEvent(event5);
      result = eventEmitter_default.emitEvent(event5, id);
      return { success: false };
    },
    windowMove: ({ id, x, y: y2 }) => {
      const handler = eventEmitter_default.events.window.move;
      const event5 = handler({
        id,
        x,
        y: y2
      });
      let result;
      result = eventEmitter_default.emitEvent(event5);
      result = eventEmitter_default.emitEvent(event5, id);
      return { success: false };
    },
    windowResize: ({ id, x, y: y2, width, height }) => {
      const handler = eventEmitter_default.events.window.resize;
      const event5 = handler({
        id,
        x,
        y: y2,
        width,
        height
      });
      let result;
      result = eventEmitter_default.emitEvent(event5);
      result = eventEmitter_default.emitEvent(event5, id);
      return { success: false };
    }
  },
  maxRequestTime: 25000
});

// src/bun/core/BrowserWindow.ts
var nextWindowId = 1;
var defaultOptions2 = {
  title: "Electrobun",
  frame: {
    x: 0,
    y: 0,
    width: 800,
    height: 600
  },
  url: "https://electrobun.dev",
  html: null,
  preload: null,
  titleBarStyle: "default"
};
var BrowserWindowMap = {};

class BrowserWindow {
  id = nextWindowId++;
  title = "Electrobun";
  state = "creating";
  url = null;
  html = null;
  preload = null;
  frame = {
    x: 0,
    y: 0,
    width: 800,
    height: 600
  };
  webviewId;
  constructor(options = defaultOptions2) {
    this.title = options.title || "New Window";
    this.frame = options.frame ? { ...defaultOptions2.frame, ...options.frame } : { ...defaultOptions2.frame };
    this.url = options.url || null;
    this.html = options.html || null;
    this.preload = options.preload || null;
    this.init(options);
  }
  init({
    rpc: rpc2,
    syncRpc,
    styleMask,
    titleBarStyle
  }) {
    zigRPC.request.createWindow({
      id: this.id,
      title: this.title,
      url: this.url,
      html: this.html,
      frame: {
        width: this.frame.width,
        height: this.frame.height,
        x: this.frame.x,
        y: this.frame.y
      },
      styleMask: {
        Borderless: false,
        Titled: true,
        Closable: true,
        Miniaturizable: true,
        Resizable: true,
        UnifiedTitleAndToolbar: false,
        FullScreen: false,
        FullSizeContentView: false,
        UtilityWindow: false,
        DocModalWindow: false,
        NonactivatingPanel: false,
        HUDWindow: false,
        ...styleMask || {},
        ...titleBarStyle === "hiddenInset" ? {
          Titled: true,
          FullSizeContentView: true
        } : {}
      },
      titleBarStyle: titleBarStyle || "default"
    });
    const webview = new BrowserView({
      url: this.url,
      html: this.html,
      preload: this.preload,
      frame: {
        x: 0,
        y: 0,
        width: this.frame.width,
        height: this.frame.height
      },
      rpc: rpc2,
      syncRpc
    });
    this.webviewId = webview.id;
    zigRPC.request.addWebviewToWindow({
      windowId: this.id,
      webviewId: webview.id
    });
    if (this.url) {
      webview.loadURL(this.url);
    } else if (this.html) {
      webview.loadHTML(this.html);
    }
    BrowserWindowMap[this.id] = this;
  }
  get webview() {
    return BrowserView.getById(this.webviewId);
  }
  setTitle(title) {
    this.title = title;
    return zigRPC.request.setTitle({ winId: this.id, title });
  }
  close() {
    return zigRPC.request.closeWindow({ winId: this.id });
  }
  on(name, handler) {
    const specificName = `${name}-${this.id}`;
    eventEmitter_default.on(specificName, handler);
  }
}

// src/bun/core/ApplicationMenu.ts
var exports_ApplicationMenu = {};
__export(exports_ApplicationMenu, {
  setApplicationMenu: () => {
    {
      return setApplicationMenu;
    }
  },
  on: () => {
    {
      return on;
    }
  }
});
var setApplicationMenu = (menu) => {
  const menuWithDefaults = menuConfigWithDefaults2(menu);
  zigRPC.request.setApplicationMenu({
    menuConfig: JSON.stringify(menuWithDefaults)
  });
};
var on = (name, handler) => {
  const specificName = `${name}`;
  eventEmitter_default.on(specificName, handler);
};
var roleLabelMap = {
  quit: "Quit",
  hide: "Hide",
  hideOthers: "Hide Others",
  showAll: "Show All",
  undo: "Undo",
  redo: "Redo",
  cut: "Cut",
  copy: "Copy",
  paste: "Paste",
  pasteAndMatchStyle: "Paste And Match Style",
  delete: "Delete",
  selectAll: "Select All",
  startSpeaking: "Start Speaking",
  stopSpeaking: "Stop Speaking",
  enterFullScreen: "Enter FullScreen",
  exitFullScreen: "Exit FullScreen",
  toggleFullScreen: "Toggle Full Screen",
  minimize: "Minimize",
  zoom: "Zoom",
  bringAllToFront: "Bring All To Front",
  close: "Close",
  cycleThroughWindows: "Cycle Through Windows",
  showHelp: "Show Help"
};
var menuConfigWithDefaults2 = (menu) => {
  return menu.map((item) => {
    if (item.type === "divider" || item.type === "separator") {
      return { type: "divider" };
    } else {
      return {
        label: item.label || roleLabelMap[item.role] || "",
        type: item.type || "normal",
        ...item.role ? { role: item.role } : { action: item.action || "" },
        enabled: item.enabled === false ? false : true,
        checked: Boolean(item.checked),
        hidden: Boolean(item.hidden),
        tooltip: item.tooltip || undefined,
        ...item.submenu ? { submenu: menuConfigWithDefaults2(item.submenu) } : {}
      };
    }
  });
};

// src/bun/core/ContextMenu.ts
var exports_ContextMenu = {};
__export(exports_ContextMenu, {
  showContextMenu: () => {
    {
      return showContextMenu;
    }
  },
  on: () => {
    {
      return on2;
    }
  }
});
var showContextMenu = (menu) => {
  const menuWithDefaults = menuConfigWithDefaults3(menu);
  zigRPC.request.showContextMenu({
    menuConfig: JSON.stringify(menuWithDefaults)
  });
};
var on2 = (name, handler) => {
  const specificName = `${name}`;
  eventEmitter_default.on(specificName, handler);
};
var roleLabelMap2 = {
  quit: "Quit",
  hide: "Hide",
  hideOthers: "Hide Others",
  showAll: "Show All",
  undo: "Undo",
  redo: "Redo",
  cut: "Cut",
  copy: "Copy",
  paste: "Paste",
  pasteAndMatchStyle: "Paste And Match Style",
  delete: "Delete",
  selectAll: "Select All",
  startSpeaking: "Start Speaking",
  stopSpeaking: "Stop Speaking",
  enterFullScreen: "Enter FullScreen",
  exitFullScreen: "Exit FullScreen",
  toggleFullScreen: "Toggle Full Screen",
  minimize: "Minimize",
  zoom: "Zoom",
  bringAllToFront: "Bring All To Front",
  close: "Close",
  cycleThroughWindows: "Cycle Through Windows",
  showHelp: "Show Help"
};
var menuConfigWithDefaults3 = (menu) => {
  return menu.map((item) => {
    if (item.type === "divider" || item.type === "separator") {
      return { type: "divider" };
    } else {
      return {
        label: item.label || roleLabelMap2[item.role] || "",
        type: item.type || "normal",
        ...item.role ? { role: item.role } : { action: item.action || "" },
        enabled: item.enabled === false ? false : true,
        checked: Boolean(item.checked),
        hidden: Boolean(item.hidden),
        tooltip: item.tooltip || undefined,
        ...item.submenu ? { submenu: menuConfigWithDefaults3(item.submenu) } : {}
      };
    }
  });
};

// src/bun/core/Utils.ts
var exports_Utils = {};
__export(exports_Utils, {
  showItemInFolder: () => {
    {
      return showItemInFolder;
    }
  },
  openFileDialog: () => {
    {
      return openFileDialog;
    }
  },
  moveToTrash: () => {
    {
      return moveToTrash;
    }
  }
});
var moveToTrash = (path) => {
  return zigRPC.request.moveToTrash({ path });
};
var showItemInFolder = (path) => {
  return zigRPC.request.showItemInFolder({ path });
};
var openFileDialog = async (opts = {}) => {
  const optsWithDefault = {
    ...{
      startingFolder: "~/",
      allowedFileTypes: "*",
      canChooseFiles: true,
      canChooseDirectory: true,
      allowsMultipleSelection: true
    },
    ...opts
  };
  const result = await zigRPC.request.openFileDialog({
    startingFolder: optsWithDefault.startingFolder,
    allowedFileTypes: optsWithDefault.allowedFileTypes,
    canChooseFiles: optsWithDefault.canChooseFiles,
    canChooseDirectory: optsWithDefault.canChooseDirectory,
    allowsMultipleSelection: optsWithDefault.allowsMultipleSelection
  });
  const filePaths = result.openFileDialogResponse.split(",");
  return filePaths;
};

// src/bun/index.ts
var Electrobun = {
  BrowserWindow,
  BrowserView,
  Tray,
  Updater,
  Utils: exports_Utils,
  ApplicationMenu: exports_ApplicationMenu,
  ContextMenu: exports_ContextMenu,
  events: eventEmitter_default,
  PATHS: exports_Paths
};
var bun_default = Electrobun;
export {
  bun_default as default,
  createRPC,
  exports_Utils as Utils,
  Updater,
  Tray,
  exports_Paths as PATHS,
  exports_ContextMenu as ContextMenu,
  BrowserWindow,
  BrowserView,
  exports_ApplicationMenu as ApplicationMenu
};

//# debugId=6C7DA4A50F37B3BE64756e2164756e21