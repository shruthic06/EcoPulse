"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_js_1 = require("./server.js");
const PORT = process.env.PORT ?? 3000;
server_js_1.app.listen(PORT, () => {
    console.log(`EcoPulse API server running at http://localhost:${PORT}`);
});
//# sourceMappingURL=start.js.map