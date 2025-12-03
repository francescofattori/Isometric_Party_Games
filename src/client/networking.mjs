import { io } from "../../include/socket.io.mjs";
export class Socket {
    connect(library, options) {
        this.library = library;
        this.options = options;
        switch (library) {
            case "socket.io":
                this.io = io(options.url + ":" + options.port);
                if (!options.on) options.on = {};
                Socket.mergeProperties(options.on, Socket.standardOn(library, options));
                for (const event in options.on) {
                    this.io.on(event, options.on[event]);
                }
        }
    }
    get connected() {
        return this.socket.connected;
    }
    static mergeProperties(a, b) {
        for (const key in b) {
            if (a[key]) continue;
            a[key] = b[key];
        }
    }
    static standardOn(library, options) {
        return {
            "connect": () => {
                console.log("Connected to server:" + options.url + ":" + options.port + " using " + library);
            },
            "disconnect": () => {
                console.log("Disconnected from server");
            },
        };
    }
}