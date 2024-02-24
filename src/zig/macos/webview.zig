const std = @import("std");
const rpc = @import("../rpc/schema/request.zig");
const rpcSchema = @import("../rpc/schema/schema.zig");
const objc = @import("./objc.zig");
const pipesin = @import("../rpc/pipesin.zig");

const alloc = std.heap.page_allocator;

const ELECTROBUN_BROWSER_API_SCRIPT = @embedFile("../build/index.js");

const WebviewMap = std.AutoHashMap(u32, WebviewType);
pub var webviewMap: WebviewMap = WebviewMap.init(alloc);
const AssetScheme = "assets://";

fn assetFileLoader(url: [*:0]const u8) objc.FileResponse {
    std.log.info("assetFileLoader {s}", .{url});
    const relPath = url[AssetScheme.len..std.mem.len(url)];

    const fileContents = readFileContentsFromDisk(relPath) catch "failed to load contents";
    const mimeType = getMimeType(relPath); // or dynamically determine MIME type

    return objc.FileResponse{
        .mimeType = toCString(mimeType),
        .fileContents = toCString(fileContents),
    };
}

const WebviewType = struct {
    id: u32,
    handle: *anyopaque,

    // url: ?[]const u8,
    // html: ?[]const u8,
    frame: struct {
        width: f64,
        height: f64,
        x: f64,
        y: f64,
    },
    // todo: de-init these using objc.releaseObjCObject() when the webview closes
    delegate: *anyopaque,
    bunBridgeHandler: *anyopaque,
    bun_out_pipe: ?anyerror!std.fs.File,
    bun_in_pipe: ?std.fs.File,
    // Function to send a message to Bun
    pub fn sendToBun(self: *WebviewType, message: []const u8) !void {
        if (self.bun_out_pipe) |result| {
            if (result) |file| {
                std.log.info("Opened file successfully", .{});
                // convert null terminated string to slice
                // const message_slice: []const u8 = message[0..std.mem.len(message)];
                // Write the message to the named pipe
                file.writeAll(message) catch |err| {
                    std.debug.print("Failed to write to file: {}\n", .{err});
                };

                file.writeAll("\n") catch |err| {
                    std.debug.print("Failed to write to file: {}\n", .{err});
                };
            } else |err| {
                std.debug.print("Failed to open file: {}\n", .{err});
            }
            // If bun_out_pipe is not an error and not null, write the message
            // try file.writeAll(message);
        } else {
            // If bun_out_pipe is null, print an error or the message to stdio
            std.debug.print("Error: No valid pipe to write to. Message was: {s}\n", .{message});
        }
    }

    pub fn sendToWebview(self: *WebviewType, message: []const u8) void {
        std.log.info("}}}}}}}}Sending message to webview: {s} {}", .{ message, self.handle });

        objc.evaluateJavaScriptWithNoCompletion(self.handle, toCString(message));
    }
};

const CreateWebviewOpts = struct { id: u32, url: ?[]const u8, html: ?[]const u8, frame: struct { width: f64, height: f64, x: f64, y: f64 } };
pub fn createWebview(opts: CreateWebviewOpts) void {
    const bunPipeIn = blk: {
        const bunPipeInPath = concatOrFallback("/private/tmp/electrobun_ipc_pipe_{}_1_in", .{opts.id});
        const bunPipeInFileResult = std.fs.cwd().openFile(bunPipeInPath, .{ .mode = .read_only });

        if (bunPipeInFileResult) |file| {
            std.log.info("Opened file successfully", .{});
            break :blk file; //std.fs.File{ .handle = fd };
        } else |err| {
            std.debug.print("Failed to open file: {}\n", .{err});
            break :blk null;
        }
    };

    std.log.info("Finished opening file descriptor", .{});

    if (bunPipeIn) |pipeInFile| {
        // _ = pipeInFile;
        pipesin.addPipe(pipeInFile.handle, opts.id);
    }

    const bunPipeOutPath = concatOrFallback("/private/tmp/electrobun_ipc_pipe_{}_1_out", .{opts.id});

    std.log.info("concat result {s}", .{bunPipeOutPath});

    const bunPipeOutFileResult = std.fs.cwd().openFile(bunPipeOutPath, .{ .mode = .read_write });

    std.log.info("after read", .{});

    // const windowBounds = objc.getWindowBounds(objcWin);
    const objcWebview = objc.createAndReturnWKWebView(.{
        // .frame = .{ //
        .origin = .{ .x = opts.frame.x, .y = opts.frame.y },
        .size = .{ .width = opts.frame.width, .height = opts.frame.height },
        // },
    }, assetFileLoader);

    objc.addPreloadScriptToWebView(objcWebview, ELECTROBUN_BROWSER_API_SCRIPT, false);

    // Can only define functions inline in zig within a struct
    const delegate = objc.setNavigationDelegateWithCallback(objcWebview, opts.id, struct {
        fn decideNavigation(webviewId: u32, url: [*:0]const u8) bool {
            std.log.info("???????????????????????????????????????????????Deciding navigation for URL: {s}", .{url});
            std.log.info("web voo id: {}", .{webviewId});
            // todo: right now this reaches a generic rpc request, but it should be attached
            // to this specific webview's pipe so navigation handlers can be attached to specific webviews
            const _response = rpc.request.decideNavigation(.{
                .webviewId = webviewId,
                .url = fromCString(url),
            });
            std.log.info("response from rpc: {}", .{_response});

            return _response.allow;
        }
    }.decideNavigation);

    const bunBridgeHandler = objc.addScriptMessageHandlerWithCallback(objcWebview, opts.id, "bunBridge", struct {
        fn HandlePostMessageCallback(webviewId: u32, message: [*:0]const u8) void {
            // bun bridge just forwards messages to the bun

            var webview = webviewMap.get(webviewId) orelse {
                std.debug.print("Failed to get webview from hashmap for id {}\n", .{webviewId});
                return;
            };

            webview.sendToBun(fromCString(message)) catch |err| {
                std.debug.print("Failed to send message to bun: {}\n", .{err});
            };

            // webview.sendToBun("\n") catch |err| {
            //     std.debug.print("Failed to send message to bun: {}\n", .{err});
            // };
        }
    }.HandlePostMessageCallback);

    const _webview = WebviewType{ //
        .id = opts.id,
        // .url = opts.url,
        // .html = opts.html,
        .frame = .{
            .width = opts.frame.width,
            .height = opts.frame.height,
            .x = opts.frame.x,
            .y = opts.frame.y,
        },
        .handle = objcWebview,
        .bun_out_pipe = bunPipeOutFileResult,
        .bun_in_pipe = bunPipeIn,
        .delegate = delegate,
        .bunBridgeHandler = bunBridgeHandler,
    };

    webviewMap.put(opts.id, _webview) catch {
        std.log.info("Error putting webview into hashmap: ", .{});
        return;
    };

    // todo: I think you can only load webview once it's added to a window
    // so will need to call this RPC from bun
    // if (opts.url) |url| {
    //     objc.loadURLInWebView(objcWebview, toCString(url));
    // } else if (opts.html) |html| {
    //     objc.loadHTMLInWebView(objcWebview, toCString(html));
    // }
}

pub fn loadURL(opts: rpcSchema.BunSchema.requests.loadURL.args) void {
    var webview = webviewMap.get(opts.webviewId) orelse {
        std.debug.print("Failed to get webview from hashmap for id {}\n", .{opts.webviewId});
        return;
    };

    // webview.url = opts.url;
    objc.loadURLInWebView(webview.handle, toCString(opts.url));
}

pub fn loadHTML(opts: rpcSchema.BunSchema.requests.loadHTML.args) void {
    var webview = webviewMap.get(opts.webviewId) orelse {
        std.debug.print("Failed to get webview from hashmap for id {}\n", .{opts.webviewId});
        return;
    };

    // webview.html = opts.html;
    objc.loadHTMLInWebView(webview.handle, toCString(opts.html));
}

pub fn sendLineToWebview(webviewId: u32, line: []const u8) void {
    var webview = webviewMap.get(webviewId) orelse {
        std.debug.print("Failed to get webview from hashmap for id {}\n", .{webviewId});
        return;
    };

    webview.sendToWebview(line);
}

// todo: move to a util and dedup with window.zig
// todo: make buffer an arg
// todo: use a for loop with mem.copy for simpler concat
// template string concat with arbitrary number of args
fn concatOrFallback(comptime fmt: []const u8, args: anytype) []const u8 {
    var buffer: [250]u8 = undefined;
    const result = std.fmt.bufPrint(&buffer, fmt, args) catch |err| {
        std.log.info("Error concatenating string {}", .{err});
        return fmt;
    };

    return result;
}

// join two strings
pub fn concatStrings(a: []const u8, b: []const u8) []u8 {
    var totalLength: usize = a.len + b.len;
    var result = alloc.alloc(u8, totalLength) catch unreachable;

    std.mem.copy(u8, result[0..a.len], a);
    std.mem.copy(u8, result[a.len..totalLength], b);

    return result;
}

fn toCString(input: []const u8) [*:0]const u8 {
    // Attempt to allocate memory, handle error without bubbling it up
    const allocResult = alloc.alloc(u8, input.len + 1) catch {
        return "console.error('failed to allocate string');";
    };

    std.mem.copy(u8, allocResult, input); // Copy input to the allocated buffer
    allocResult[input.len] = 0; // Null-terminate
    return allocResult[0..input.len :0]; // Correctly typed slice with null terminator
}

fn fromCString(input: [*:0]const u8) []const u8 {
    return input[0..std.mem.len(input)];
}

pub fn readFileContentsFromDisk(filePath: []const u8) ![]const u8 {
    // todo: get the base path from env var passed in from bun
    const basePath = "/Users/yoav/code/electrobun/example/build/";

    const combinedPath = concatStrings(basePath, filePath);

    const file = try std.fs.cwd().openFile(combinedPath, .{});
    defer file.close();

    const fileSize = try file.getEndPos();
    var fileContents = try alloc.alloc(u8, fileSize);

    // Read the file contents into the allocated buffer
    _ = try file.readAll(fileContents);

    return fileContents;
}

// todo: move to string utils
pub fn getMimeType(filePath: []const u8) []const u8 {
    if (getFileExtension(filePath)) |extension| {
        if (strEql(extension, "html")) {
            return "text/html";
        } else if (strEql(extension, "htm")) {
            return "text/html";
        } else if (strEql(extension, "js")) {
            return "application/javascript";
        } else if (strEql(extension, "json")) {
            return "application/json";
        } else if (strEql(extension, "css")) {
            return "text/css";
        } else if (strEql(extension, "png")) {
            return "image/png";
        } else if (strEql(extension, "jpg")) {
            return "image/jpeg";
        } else if (strEql(extension, "jpeg")) {
            return "image/jpeg";
        } else if (strEql(extension, "gif")) {
            return "image/gif";
        } else if (strEql(extension, "svg")) {
            return "image/svg+xml";
        } else if (strEql(extension, "txt")) {
            return "text/plain";
        }
    }

    return "application/octet-stream";
}

pub fn getFileExtension(filePath: []const u8) ?[]const u8 {
    if (findLastIndexOfChar(filePath, '.')) |dotPos| {
        return filePath[dotPos + 1 ..];
    }

    return null;
}

fn findLastIndexOfChar(slice: []const u8, char: u8) ?usize {
    var i: usize = slice.len;
    while (i > 0) : (i -= 1) {
        if (slice[i - 1] == char) {
            return i - 1;
        }
    }
    return null;
}

// todo: move to string util (duplicated in handlers.zig)
pub fn strEql(a: []const u8, b: []const u8) bool {
    return std.mem.eql(u8, a, b);
}
